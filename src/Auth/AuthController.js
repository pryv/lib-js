const utils = require('../utils'); 
const Service = require('../Service');
const Messages = require('../Browser/LoginButtonMessages');
const AuthStates = require('./AuthStates');
const COOKIE_STRING = 'pryv-libjs-';
const Cookies = require('../Browser/CookieUtils');
/**
 * @private
 */
class AuthController {

  constructor (settings, serviceInfoUrl, serviceCustomizations) {
    this.stateChangeListners = [];
    this.settings = settings;
    this.serviceInfoUrl = serviceInfoUrl;
    this.serviceCustomizations = serviceCustomizations;
    if (!settings) { throw new Error('settings cannot be null'); }

    // 1. get Language
    this.languageCode = this.settings.authRequest.languageCode || 'en';
    this.messages = Messages(this.languageCode);

    try {
      // -- Check Error CallBack
      if (this.settings.onStateChange) {
        this.stateChangeListners.push(this.settings.onStateChange);
      }

      // -- settings 
      if (!this.settings.authRequest) { throw new Error('Missing settings.authRequest'); }

      // -- Extract returnURL 
      this.settings.authRequest.returnURL = 
        this.getReturnURL(this.settings.authRequest.returnURL);

      if (!this.settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      this.cookieKey = COOKIE_STRING + this.settings.authRequest.requestingAppId;

      if (!this.settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }

    } catch (e) {
      this.state = {
        id: AuthStates.ERROR, message: 'During initialization', error: e
      }
      throw (e);
    }
  }

  /**
   * @returns {PryvService}
   */
  async init () {
    this.state = { id: AuthStates.LOADING };
    await this.fetchServiceInfo();
    this.checkAutoLogin();

    if (this.state !== AuthStates.AUTHORIZED) {
      // 5. Propose Login
      await this.prepareForLogin();
    }

    await this.finishAuthProcessAfterRedirection();

    return this.pryvService;
  }

  async fetchServiceInfo () {
    if (this.pryvService) {
      throw new Error('Browser service already initialized');
    }

    // 1. fetch service-info
    this.pryvService = new Service(this.serviceInfoUrl, this.serviceCustomizations);

    try {
      this.pryvServiceInfo = await this.pryvService.info();
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Cannot fetch service/info',
        error: e
      }
      throw e; // forward error
    }
  }

  checkAutoLogin () {
    let loginCookie = null;
    try {
      loginCookie = Cookies.get(this.cookieKey);
    } catch (e) {
      console.log(e);
    }

    if (loginCookie) {
      this.state = {
        id: AuthStates.AUTHORIZED,
        apiEndpoint: loginCookie.apiEndpoint,
        displayName: loginCookie.displayName
      };
    }
  }

  async finishAuthProcessAfterRedirection () {
    // this step should be applied only for the browser
    if (typeof window == 'undefined') {
      return;
    }
    // 3. Check if there is a prYvkey as result of "out of page login"
    const url = window.location.href;
    let pollUrl = await this.pollUrlReturningFromLogin(url);
    if (pollUrl !== null) {
      try {
        const res = await utils.superagent.get(pollUrl);
        this.processAccess(res.body);
      } catch (e) {
        this.state = {
          id: AuthStates.ERROR,
          message: 'Cannot fetch result',
          error: e
        }
      }
    }
  }
  /**
   * Called at the end init() and when logging out()
   */
  async prepareForLogin () {
    this.deleteCurrentAuthInfo();

    // 1. Make sure Browser is initialized
    if (!this.pryvServiceInfo) {
      throw new Error('Browser service must be initialized first');
    }

    await this.postAccessIfNeeded();

    // change state to initialized if signin is needed
    if (this.needSignIn()) {
      if (!this.accessData.url) {
        throw new Error('Pryv Sign-In Error: NO SETUP. Please call Browser.setupAuth() first.');
      }

      this.state = {
        id: AuthStates.INITIALIZED,
        serviceInfo: this.serviceInfo
      }
    }
  }

  async deleteCurrentAuthInfo () {
    Cookies.del(this.cookieKey)
    this.accessData = null;
  }

  async postAccessIfNeeded () {
    // 2. Post access if needed
    if (!this.accessData) {
      this.processAccess(await this.postAccess());
    }
  }

  needSignIn () {
    return this.accessData.status == AuthController.options.ACCESS_STATUS_NEED_SIGNIN;
  }
  // ----------------------- ACCESS --------------- //
  /**
   * @private
   */
  async postAccess() {
    try {
      const res = await utils.superagent
        .post(this.pryvServiceInfo.access)
        .set('accept', 'json')
        .send(this.settings.authRequest);
      return res.body;
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Requesting access',
        error: e
      }
      throw e; // forward error
    }
  }

  /**
  * @private
  */
  async getAccess () {
    let res;
    try {
      res = await utils.superagent
        .get(this.accessData.poll)
        .set('accept', 'json');
    } catch (e) {
      return { status: 'ERROR' }
    }
    return res.body;
  }

  /**
   */
  async poll () {
    if (this.auth.polling) {
      return;
    }
    if (! this.needSignIn()) {
      this.polling = false;
      return;
    }
    if (this.settings.authRequest.returnURL) { // no popup
      return;
    }
    this.polling = true;
    this.processAccess(await this.getAccess());
    setTimeout(this.poll.bind(this), this.accessData.poll_rate_ms);
  }

  /**
   * @private 
   */
  processAccess (accessData) {
    if (!accessData || !accessData.status) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Invalid Access data response',
        error: new Error('Invalid Access data response')
      };
      throw this.state.error;
    }
    
    this.accessData = accessData;
    switch (this.accessData.status) {
      case 'ERROR':
        this.state = {
          id: AuthStates.ERROR,
          message: 'Error on the backend, please refresh'
        };
        break;
      case 'ACCEPTED':
        const apiEndpoint =
          Service.buildAPIEndpoint(this.pryvServiceInfo, this.accessData.username, this.accessData.token);

        Cookies.set(this.cookieKey, 
          { apiEndpoint: apiEndpoint, displayName: this.accessData.username });

        this.state = {
          id: AuthStates.AUTHORIZED,
          apiEndpoint: apiEndpoint,
          displayName: this.accessData.username
        };
        break;
    }
  }

  // ---------------------- STATES ----------------- //
  set state (newState) {
    // console.log('State Changed:' + JSON.stringify(newState));
    this._state = newState;

    this.stateChangeListners.map((listner) => {
      try {
        listner(this.state)
      } catch (e) {
        console.log(e);
      }
    });
  }

  get state() {
    return this._state;
  }

  // ------------------ ACTIONS  ----------- //
  /**
   * Revoke Connection and clean local cookies
   * 
   */
  logOut() {
    const message = this.messages.LOGOUT_CONFIRM ? this.messages.LOGOUT_CONFIRM : 'Logout ?';
    if (confirm(message)) {
      this.prepareForLogin();
    }
  }

  getErrorMessage () {
    return this.messages.ERROR + ': ' + this.state.message;
  }

  getLoadingMessage () {
    return this.messages.LOADING;
  }

  getInitializedMessage () {
    return this.messages.LOGIN + ': ' + this.pryvServiceInfo.name;
  }

  getAuthorizedMessage () {
    return this.state.displayName;
  }

  defaultOnStateChange () {
    let text = '';
    switch (this.state.id) {
      case AuthStates.ERROR:
        text = this.getErrorMessage();
        break;
      case AuthStates.LOADING:
        text = this.getLoadingMessage();
        break;
      case AuthStates.INITIALIZED:
        text = this.getInitializedMessage();
        break;
      case AuthStates.AUTHORIZED:
        text = this.getAuthorizedMessage();
        break;
      default:
        console.log('WARNING Unhandled state for Login: ' + this.state.id);
    }
    return text;
  }

  /**
   * @param {Service} pryvService 
   */
  async loadAssets () {
    let assets = {};
    try {
      assets = await this.pryvService.assets();
      assets.loginButtonLoadCSS(); // can be async 
      const thisMessages = await assets.loginButtonGetMessages();
      if (thisMessages.LOADING) {
        this.messages = Messages(this.languageCode, thisMessages);
      } else {
        console.log("WARNING Messages cannot be loaded using defaults: ", thisMessages)
      }
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Cannot fetch button visuals',
        error: e
      };
      throw e; // forward error
    } 
    return assets;
  }

  getReturnURL (
    returnURL,
    windowLocationForTest,
    navigatorForTests
  ) {
    returnURL = returnURL || AuthController.options.RETURN_URL_AUTO + '#';

    // check the trailer
    let trailer = returnURL.slice(-1);
    if ('#&?'.indexOf(trailer) < 0) {
      throw new Error('Pryv access: Last character of --returnURL setting-- is not ' +
        '"?", "&" or "#": ' + returnURL);
    }
    // auto mode for desktop
    if (
      returnUrlIsAuto(returnURL) &&
      !utils.browserIsMobileOrTablet(navigatorForTests)
    ) {
      return false;
    } else if (
      // auto mode for mobile or self
      (returnUrlIsAuto(returnURL) &&
        utils.browserIsMobileOrTablet(navigatorForTests)
      )
      || returnURL.indexOf('self') === 0
    ) {
      // set self as return url?
      // eventually clean-up current url from previous pryv returnURL
      const locationHref = windowLocationForTest || window.location.href;
      returnURL = locationHref + returnURL.substring(4);
    }
    return utils.cleanURLFromPrYvParams(returnURL);
  }

  /**
   * Util to grab parameters from url query string
   * @param {*} url 
   */
  static getServiceInfoFromURL (url) {
    const queryParams = utils.getQueryParamsFromURL(url || window.location.href);
    //TODO check validity of status
    return queryParams[AuthController.options.SERVICE_INFO_QUERY_PARAM_KEY];
  }

 /**
  * Eventually return pollUrl when returning from login in another page
  */
  async pollUrlReturningFromLogin (url) {
    const params = utils.getQueryParamsFromURL(url);
    let pollUrl = null;
    if (params.prYvkey) { // deprecated method - To be removed
      pollUrl = this.pryvServiceInfo.access + params.prYvkey;
    }
    if (params.prYvpoll) {
      pollUrl = params.prYvpoll;
    }
    return pollUrl;
  }
}

function returnUrlIsAuto (returnURL) {
  return returnURL.indexOf(AuthController.options.RETURN_URL_AUTO) === 0;
}
AuthController.options = {
  SERVICE_INFO_QUERY_PARAM_KEY: 'pryvServiceInfoUrl',
  ACCESS_STATUS_NEED_SIGNIN: 'NEED_SIGNIN',
  RETURN_URL_AUTO: 'auto',
}
module.exports = AuthController;