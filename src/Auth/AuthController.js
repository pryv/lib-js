const utils = require('../utils');
const Service = require('../Service');
const AuthStates = require('./AuthStates');
const Messages = require('./LoginMessages');

/**
 * @private
 */
class AuthController {

  constructor (settings, serviceInfoUrl, serviceCustomizations) {
    this.stateChangeListners = [];
    this.settings = settings;
    try {
      
      this.validateSettings();
      this.languageCode = this.settings.authRequest.languageCode || 'en';    
      this.serviceInfoUrl = serviceInfoUrl;
      this.serviceCustomizations = serviceCustomizations;
      this.messages = Messages(this.languageCode);
            
      // -- Check Error CallBack
      if (this.settings.onStateChange) {
        this.stateChangeListners.push(this.settings.onStateChange);
      }
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR, message: 'During initialization', error: e
      };
      throw (e);
    }
  }

  validateSettings () {
    if (!this.settings) { throw new Error('settings cannot be null'); }
    // -- settings 
    if (!this.settings.authRequest) { throw new Error('Missing settings.authRequest'); }

    // -- Extract returnURL 
    this.settings.authRequest.returnURL =
      getReturnURL(this.settings.authRequest.returnURL);

    if (!this.settings.authRequest.requestingAppId) {
      throw new Error('Missing settings.authRequest.requestingAppId');
    }
    if (!this.settings.authRequest.requestedPermissions) {
      throw new Error('Missing settings.authRequest.requestedPermissions');
    }
  }

  /**
   * @returns {PryvService}
   */
  async init (loginButton) {
    this.state = { id: AuthStates.LOADING };
    await this.fetchServiceInfo();
    this.assets = await this.loadAssets();

    // initialize human interaction interface
    loginButton.auth = this;
    await (loginButton.init());
    this.loginButton = loginButton;
    await checkAutoLogin(this);

    if (!this.isAuthorized()) {
      await prepareForLogin(this);
    }

    await finishAuthProcessAfterRedirection(this);
    this.stateChangeListners.push(this.loginButton.onStateChange.bind(this.loginButton));

    // update button text
    this.loginButton.onStateChange(); 
    return this.pryvService;
  }

  async fetchServiceInfo () {
    if (this.pryvService) {
      throw new Error('Browser service already initialized');
    }
    try {
      // 1. fetch service-info
      this.pryvService = new Service(
        this.serviceInfoUrl,
        this.serviceCustomizations,
      );
      this.pryvServiceInfo = await this.pryvService.info();
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Cannot fetch service/info',
        error: e
      };
      throw e; // forward error
    }
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
      pollUrl = this.access + params.prYvkey;
    }
    if (params.prYvpoll) {
      pollUrl = params.prYvpoll;
    }
    return pollUrl;
  }

  getState () {
    return this.state;
  }

  async loadAssets () {
    let loadedAssets = {};
    try {
      loadedAssets = await this.pryvService.assets();
      if (typeof location !== 'undefined') {
        await loadedAssets.loginButtonLoadCSS();
        const thisMessages = await loadedAssets.loginButtonGetMessages();
        if (thisMessages.LOADING) {
          this.messages = Messages(this.languageCode, thisMessages);
        } else {
          console.log("WARNING Messages cannot be loaded using defaults: ", thisMessages)
        }
      }
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'Cannot fetch button visuals',
        error: e
      };
      throw e; // forward error
    }
    return loadedAssets;
  }


  /**
   * Start pulling the access url until user signs in
   */
  async startAuthRequest () {
    if (this._polling) {
      return;
    }
    await this._poll();
  }

  /**
   * Keeps running authRequest until it gets the status
   * not equal to NEED_SIGNIN and then updates authController state
   *
   * @param {AuthController} auth
   * @private
   */
  async _poll () {
    if (this.accessData && this.accessData.status != 'NEED_SIGNIN') {
      this._polling = false;
      return;
    }
    this._polling = true;
    changeAuthStateDependingOnAccess(this, await this._pollAccess());
    setTimeout(await this._poll.bind(this), this.accessData.poll_rate_ms);
  }

  stopAuthRequest () {
    this.accessData = { status: 'ERROR' };
  }

  /**
  * @private
  */
  async _pollAccess () {
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

  getAccessData () {
    return this.accessData;
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

  getButtonText () {
    return this.text;  
  }

  getAssets () {
    return this.assets;
  }

  isAuthorized () {
    return this.getState().id == AuthStates.AUTHORIZED;
  }

  isInitialized () {
    return this.state.id === AuthStates.INITIALIZED;
  }

  async handleClick () {
    console.log('handleClick', this.isAuthorized());
    if (this.isAuthorized()) {
      logOut(this);
    } else if (this.isInitialized()) {
      if (this.settings.authRequest.returnURL) { // open on same page (no Popup) 
        location.href = this.getAccessData().url;
        return;
      } else {
        await this.startAuthRequest();
        const loginUrl = this.getAccessData().authUrl || this.getAccessData().url
        this.loginButton.startLoginScreen(loginUrl);
      }
    }
  }

  onStateChange () {
    this.text = '';
    switch (this.state.id) {
      case AuthStates.ERROR:
        this.text = this.getErrorMessage();
        break;
      case AuthStates.LOADING:
        this.text = this.getLoadingMessage();
        break;
      case AuthStates.INITIALIZED:
        this.text = this.getInitializedMessage();
        break;
      case AuthStates.AUTHORIZED:
        // if accessData is null it means it is already loaded from the cookie/storage
        this.text = this.getAuthorizedMessage();
        if (this.getAccessData() != null) {
          const apiEndpoint =
            Service.buildAPIEndpoint(
              this.pryvServiceInfo,
              this.getAccessData().username,
              this.getAccessData().token
            );
          this.loginButton.saveAuthorizationData(
            this.getAccessData().username,
            apiEndpoint
          );
        }
        break;
      default:
        console.log('WARNING Unhandled state for Login: ' + this.state.id);
        this.loginButton.onChange();
    }
  }

  // -------------- Auth state listeners ---------------------
  set state (newState) {
    //console.log('State Changed:' + JSON.stringify(newState));
    this._state = newState;
    this.onStateChange();
    this.stateChangeListners.map((listner) => {
      try {
        listner(this.state)
      } catch (e) {
        console.log(e);
      }
    });
  }

  get state () {
    return this._state;
  }
}

function returnUrlIsAuto (returnURL) {
  return returnURL.indexOf(AuthController.options.RETURN_URL_AUTO) === 0;
}

async function deleteSessionData(authController) {
  authController.accessData = null;
  authController.loginButton.logOut();
}

/**
 * Called at the end init() and when logging out()
 */
async function prepareForLogin(authControler) {
  deleteSessionData(authControler);

  // 1. Make sure Browser is initialized
  if (!authControler.pryvServiceInfo) {
    throw new Error('Browser service must be initialized first');
  }

  await postAccessIfNeeded(authControler);

  // change state to initialized if signin is needed
  if (authControler.getAccessData() &&
    authControler.getAccessData().status == AuthController.options.ACCESS_STATUS_NEED_SIGNIN) {
    if (!authControler.getAccessData().url) {
      throw new Error('Pryv Sign-In Error: NO SETUP. Please call Browser.setupAuth() first.');
    }

    authControler.state = {
      id: AuthStates.INITIALIZED,
      serviceInfo: authControler.serviceInfo
    };
  }
}

function changeAuthStateDependingOnAccess (authController, accessData) {
  if (!accessData || !accessData.status) {
    authController.state = {
      id: AuthStates.ERROR,
      message: 'Invalid Access data response',
      error: new Error('Invalid Access data response')
    };
    throw authController.state.error;
  }
  authController.accessData = accessData;
  switch (authController.accessData.status) {
    case 'ERROR':
      authController.state = {
        id: AuthStates.ERROR,
        message: 'Error on the backend, please refresh'
      };
      break;
    case 'ACCEPTED':
      const apiEndpoint =
        Service.buildAPIEndpoint(
          authController.pryvServiceInfo,
          authController.accessData.username,
          authController.accessData.token
        );

      authController.state = {
        id: AuthStates.AUTHORIZED,
        apiEndpoint: apiEndpoint,
        displayName: authController.accessData.username
      };
      break;
  }
}


async function checkAutoLogin(authController) {
  let loginCookie = null;
  try {
    loginCookie = await authController.loginButton.getSavedLogIn();
  } catch (e) {
    console.log(e);
  }

  if (loginCookie) {
    authController.state = {
      id: AuthStates.AUTHORIZED,
      apiEndpoint: loginCookie.apiEndpoint,
      displayName: loginCookie.displayName
    };
  }
}

async function finishAuthProcessAfterRedirection (authController) {
  // this step should be applied only for the browser
  if (!utils.isBrowser()) return;

  // 3. Check if there is a prYvkey as result of "out of page login"
  const url = window.location.href;
  let pollUrl = await authController.pollUrlReturningFromLogin(url);
  if (pollUrl !== null) {
    try {
      const res = await utils.superagent.get(pollUrl);
      changeAuthStateDependingOnAccess(authController, res.body);
    } catch (e) {
      authController.state = {
        id: AuthStates.ERROR,
        message: 'Cannot fetch result',
        error: e
      };
    }
  }
}

async function postAccessIfNeeded (authController) {
  if (!authController.accessData) {
    changeAuthStateDependingOnAccess(authController, await postAccess(authController));
  }
}

// ----------------------- ACCESS --------------- //
/**
 * @private
 */
async function postAccess (authControler) {
  try {
    const res = await utils.superagent
      .post(authControler.pryvServiceInfo.access)
      .set('accept', 'json')
      .send(authControler.settings.authRequest);
    return res.body;
  } catch (e) {
    authControler.state = {
      id: AuthStates.ERROR,
      message: 'Requesting access',
      error: e
    };
    throw e; // forward error
  }
}

// ------------------ ACTIONS  ----------- //
function logOut (authControler) {
  const message = authControler.messages.LOGOUT_CONFIRM ? authControler.messages.LOGOUT_CONFIRM : 'Logout ?';
  if (confirm(message)) {
    prepareForLogin(authControler);
  }
}

function getReturnURL (
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

AuthController.options = {
  SERVICE_INFO_QUERY_PARAM_KEY: 'pryvServiceInfoUrl',
  ACCESS_STATUS_NEED_SIGNIN: 'NEED_SIGNIN',
  RETURN_URL_AUTO: 'auto',
}
module.exports = AuthController;
