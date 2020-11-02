const utils = require('../utils');
const Service = require('../Service');
const AuthStates = require('./AuthStates');
const Messages = require('./LoginMessages');

/**
 * @private
 */
class AuthController {

  constructor (settings, service) {
    this.settings = settings;
    validateSettings.call(this, settings);

    this.stateChangeListeners = [];
    if (this.settings.onStateChange) {
      this.stateChangeListeners.push(this.settings.onStateChange);
    }
    this.service = service;

    // probably remove
    this.languageCode = this.settings.authRequest.languageCode || 'en';    
    this.messages = Messages(this.languageCode);     

    function validateSettings (settings) {
      if (!settings) { throw new Error('settings cannot be null'); }
      // -- settings 
      if (!settings.authRequest) { throw new Error('Missing settings.authRequest'); }
  
      // -- Extract returnURL 
      settings.authRequest.returnURL =
        this.getReturnURL(settings.authRequest.returnURL);
  
      if (!settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      if (!settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }
    }
  }

  /**
   * @returns {PryvService}
   */
  async init (loginButton) {
    this.serviceInfo = this.service.infoSync();
    this.state = { status: AuthStates.LOADING };
    this.assets = await loadAssets(this);
    
    // initialize human interaction interface
    if (loginButton != null) {
      this.loginButton = loginButton;
      this.stateChangeListeners.push(this.loginButton.onStateChange.bind(this.loginButton));
      // autologin needs cookies/storage implemented in human interaction interface
      await checkAutoLogin(this);
    }

    if (this.state.status != AuthStates.AUTHORIZED) {
      this.state = { status: AuthStates.INITIALIZED, serviceInfo: this.serviceInfo};
    }

    await finishAuthProcessAfterRedirection(this);
    return this.service;
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
   * Stops poll for auth request
   */
  stopAuthRequest (msg) {
    this.state = { status: 'ERROR', message: msg };
  }

  isAuthorized () {
    return this.state.status == AuthStates.AUTHORIZED;
  }

  isInitialized () {
    return this.state.status === AuthStates.INITIALIZED;
  }

  async handleClick () {
    if (this.isAuthorized()) {
      this.state = { status: AuthStates.LOGOUT };
    } else if (this.isInitialized()) {
      this.startAuthRequest();
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
   * Keeps running authRequest until it gets the status
   * not equal to NEED_SIGNIN and then updates authController state
   * to something else but AuthStates.NEED_SIGNIN
   * @param {AuthController} auth
   * @private
   */
  async startAuthRequest () {
    this.state = await postAccess.call(this);
    
    await doPolling.call(this);
    
    async function postAccess () {
      try {
        const res = await utils.superagent
          .post(this.serviceInfo.access)
          .send(this.settings.authRequest);
        return res.body;
      } catch (e) {
        this.state = {
          status: AuthStates.ERROR,
          message: 'Requesting access',
          error: e
        };
        throw e; // forward error
      }
    }

    async function doPolling() {
      if (this.state.status !== AuthStates.NEED_SIGNIN) {
        return;
      }
      this.state = await pollAccess.call(this);

      if (this.state.status === AuthStates.NEED_SIGNIN) {
        setTimeout(await doPolling.bind(this), this.state.poll_rate_ms);
      }
    }

    async function pollAccess() {
      try {
        const res = await utils.superagent
          .get(this.state.poll)
        return res.body;
      } catch (e) {
        return { status: 'ERROR', message: 'Error while polling for auth request', error: e };
      }
    }
  }

  // -------------- Auth state listeners ---------------------
  set state (newState) {

    const oldState = this._state;

    // do nothing if state does not change
    if (oldState != null && oldState.status === newState.status) return;

    this._state = newState;

    this.stateChangeListeners.map((listener) => {
      try {
        listener(this.state)
      } catch (e) {
        console.log('Error during set state ()', e);
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

async function checkAutoLogin (authController) {
  const loginButton = authController.loginButton;
  if (loginButton == null) {
    return;
  }

  const storedCredentials = await loginButton.getAuthorizationData();
  if (storedCredentials != null) {
    authController.state = Object.assign({}, {status: AuthStates.AUTHORIZED}, storedCredentials);
  }
}

async function finishAuthProcessAfterRedirection (authController) {
  // this step should be applied only for the browser
  if (!utils.isBrowser()) return;

  // 3. Check if there is a prYvkey as result of "out of page login"
  const url = window.location.href;
  let pollUrl = retrievePollUrl(url);
  if (pollUrl !== null) {
    try {

      const res = await utils.superagent.get(pollUrl);
      authController.state = res.body;
    } catch (e) {
      authController.state = {
        status: AuthStates.ERROR,
        message: 'Cannot fetch result',
        error: e
      };
    }
  }

  function retrievePollUrl (url) {
    const params = utils.getQueryParamsFromURL(url);
    let pollUrl = null;
    if (params.prYvkey) { // deprecated method - To be removed
      pollUrl = authController.serviceInfo.access + params.prYvkey;
    }
    if (params.prYvpoll) {
      pollUrl = params.prYvpoll;
    }
    return pollUrl;
  }
}

// ------------------ ACTIONS  ----------- //

async function loadAssets(authController) {
  let loadedAssets = {};
  try {
    loadedAssets = await authController.service.assets();
    if (typeof location !== 'undefined') {
      await loadedAssets.loginButtonLoadCSS();
      const thisMessages = await loadedAssets.loginButtonGetMessages();
      if (thisMessages.LOADING) {
        authController.messages = Messages(authController.languageCode, thisMessages);
      } else {
        console.log("WARNING Messages cannot be loaded using defaults: ", thisMessages)
      }
    }
  } catch (e) {
    authController.state = {
      status: AuthStates.ERROR,
      message: 'Cannot fetch button visuals',
      error: e
    };
    throw e; // forward error
  }
  return loadedAssets;
}


AuthController.options = {
  SERVICE_INFO_QUERY_PARAM_KEY: 'pryvServiceInfoUrl',
  ACCESS_STATUS_NEED_SIGNIN: 'NEED_SIGNIN',
  RETURN_URL_AUTO: 'auto',
}
module.exports = AuthController;
