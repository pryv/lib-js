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

    // if auto login is not prompted
    if (this.state.status != AuthStates.AUTHORIZED) {
      this.state = { status: AuthStates.INITIALIZED, serviceInfo: this.serviceInfo};
    }

    if (loginButton != null && loginButton.finishAuthProcessAfterRedirection != null) {
      await loginButton.finishAuthProcessAfterRedirection(this);
    }
    
    return this.service;
  }

  /**
   * Stops poll for auth request
   */
  stopAuthRequest (msg) {
    this.state = { status: 'ERROR', message: msg };
  }

  /**
   * Triggered when button is pressed
   */
  async handleClick () {
    if (isAuthorized.call(this)) {
      this.state = { status: AuthStates.LOGOUT };
    } else if (isInitialized.call(this)) {
      this.startAuthRequest();
    } else if (isNeedSignIn.call(this)) {
      // reopen popup
      this.state = this.state;
    } else {
      console.log('doin nothin because state is', this.state.status);
    }

    function isAuthorized () {
      return this.state.status == AuthStates.AUTHORIZED;
    }
    function isInitialized () {
      return this.state.status === AuthStates.INITIALIZED;
    }
    function isNeedSignIn () {
      return this.state.status === AuthStates.NEED_SIGNIN;
    }
  }

  getReturnURL (
    returnURL,
    windowLocationForTest,
    navigatorForTests
  ) {
    const RETURN_URL_AUTO = 'auto';

    returnURL = returnURL || RETURN_URL_AUTO + '#';

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

    function returnUrlIsAuto (returnURL) {
      return returnURL.indexOf(RETURN_URL_AUTO) === 0;
    }
  }

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
      const pollResponse = await pollAccess.call(this);

      if (this.state.status === AuthStates.NEED_SIGNIN) {
        setTimeout(await doPolling.bind(this), this.state.poll_rate_ms);
      } else {
        this.state = pollResponse;
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

module.exports = AuthController;
