const utils = require('../utils');
const Service = require('../Service');
const AuthStates = require('./AuthStates');
const { getStore } = require('./AuthStore');
const Messages = require('../Browser/LoginButtonMessages');

/**
 * @private
 */
class AuthController {

  constructor (settings, serviceInfoUrl, serviceCustomizations) {
    this.store = getStore();
    this.settings = settings;

    // 1. get Language
    if (settings.authRequest.languageCode != null) {
      this.store.languageCode = settings.authRequest.languageCode;
    }
    this.serviceInfoUrl = serviceInfoUrl;
    this.serviceCustomizations = serviceCustomizations;
    if (!settings) { throw new Error('settings cannot be null'); }

    try {
      // -- Check Error CallBack
      if (this.settings.onStateChange) {
        this.store.stateChangeListners.push(this.settings.onStateChange);
      }

      // -- settings 
      if (!this.settings.authRequest) { throw new Error('Missing settings.authRequest'); }

      // -- Extract returnURL 
      this.settings.authRequest.returnURL =
        this.getReturnURL(this.settings.authRequest.returnURL);

      if (!this.settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      if (!this.settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }

    } catch (e) {
      this.store.setState({
        id: AuthStates.ERROR, message: 'During initialization', error: e
      });
      throw (e);
    }
  }

  /**
   * @returns {PryvService}
   */
  async init () {
    this.store.setState({ id: AuthStates.LOADING });

    await this.fetchServiceInfo();
    this.checkAutoLogin();

    if (this.store.state.id !== AuthStates.AUTHORIZED) {
      // 5. Propose Login
      await this.prepareForLogin();
    }

    await this.finishAuthProcessAfterRedirection();

    this.store.assets = await this.loadAssets();

    return this.pryvService;
  }

  async fetchServiceInfo () {
    if (this.pryvService) {
      throw new Error('Browser service already initialized');
    }

    // 1. fetch service-info
    this.pryvService = new Service(
      this.serviceInfoUrl,
      this.serviceCustomizations,
      this.settings.authRequest.requestingAppId
    );

    try {
      this.pryvServiceInfo = await this.pryvService.info();
    } catch (e) {
      this.store.setState({
        id: AuthStates.ERROR,
        message: 'Cannot fetch service/info',
        error: e
      });
      throw e; // forward error
    }
  }

  checkAutoLogin () {
    let loginCookie = null;
    try {
      loginCookie = this.pryvService.getCurrentCookieInfo();
    } catch (e) {
      console.log(e);
    }

    if (loginCookie) {
      this.store.setState({
        id: AuthStates.AUTHORIZED,
        apiEndpoint: loginCookie.apiEndpoint,
        displayName: loginCookie.displayName
      });
    }
  }

  async finishAuthProcessAfterRedirection () {
    // this step should be applied only for the browser
    if (!utils.isBrowser()) return;

    // 3. Check if there is a prYvkey as result of "out of page login"
    const url = window.location.href;
    let pollUrl = await this.pollUrlReturningFromLogin(url);
    if (pollUrl !== null) {
      try {
        const res = await utils.superagent.get(pollUrl);
        this.pryvService.processAccess(res.body);
      } catch (e) {
        this.store.setState({
          id: AuthStates.ERROR,
          message: 'Cannot fetch result',
          error: e
        });
      }
    }
  }
  /**
   * Called at the end init() and when logging out()
   */
  async prepareForLogin () {
    this.pryvService.deleteCurrentAuthInfo();

    // 1. Make sure Browser is initialized
    if (!this.pryvServiceInfo) {
      throw new Error('Browser service must be initialized first');
    }

    await this.postAccessIfNeeded();

    // change state to initialized if signin is needed
    if (this.store.accessData &&
      this.store.accessData.status == AuthController.options.ACCESS_STATUS_NEED_SIGNIN) {
      if (!this.store.accessData.url) {
        throw new Error('Pryv Sign-In Error: NO SETUP. Please call Browser.setupAuth() first.');
      }

      this.store.setState({
        id: AuthStates.INITIALIZED,
        serviceInfo: this.serviceInfo
      });
    }
  }

  async postAccessIfNeeded () {
    if (!this.store.accessData) {
      this.pryvService.processAccess(await this.postAccess());
    }
  }

  // ----------------------- ACCESS --------------- //
  /**
   * @private
   */
  async postAccess () {
    try {
      const res = await utils.superagent
        .post(this.pryvServiceInfo.access)
        .set('accept', 'json')
        .send(this.settings.authRequest);
      return res.body;
    } catch (e) {
      this.store.setState({
        id: AuthStates.ERROR,
        message: 'Requesting access',
        error: e
      });
      throw e; // forward error
    }
  }

  // ------------------ ACTIONS  ----------- //
  /**
   * Revoke Connection and clean local cookies
   * 
   */
  logOut () {
    const message = this.store.messages.LOGOUT_CONFIRM ? this.store.messages.LOGOUT_CONFIRM : 'Logout ?';
    if (confirm(message)) {
      this.prepareForLogin();
    }
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

  getState () {
    return this.store.state;
  }

  async loadAssets () {
    let loadedAssets = {};
    try {
      loadedAssets = await this.pryvService.assets();
      if (typeof location !== 'undefined') {
        await loadedAssets.loginButtonLoadCSS();
        const thisMessages = await loadedAssets.loginButtonGetMessages();
        if (thisMessages.LOADING) {
          this.store.messages = Messages(this.store.languageCode, thisMessages);
        } else {
          console.log("WARNING Messages cannot be loaded using defaults: ", thisMessages)
        }
      }
    } catch (e) {
      this.store.setState({
        id: AuthStates.ERROR,
        message: 'Cannot fetch button visuals',
        error: e
      });
      throw e; // forward error
    }
    return loadedAssets;
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
