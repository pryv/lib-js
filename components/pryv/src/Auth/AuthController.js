/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const utils = require('../utils');
const AuthStates = require('./AuthStates');
const Messages = require('./LoginMessages');

/**
 * @private
 */
class AuthController {
  /**
   *
   * @param {*} settings
   * @param {*} service
   */
  constructor (settings, service, loginButton) {
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

    this.loginButton = loginButton;

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
   * async function to call right after instanciating object
   *
   * @returns {Service}
   */
  async init () {
    this.serviceInfo = this.service.infoSync();
    this.state = { status: AuthStates.LOADING };
    this.assets = await loadAssets(this);

    const loginButton = this.loginButton;
    // initialize human interaction interface
    if (loginButton != null) {
      this.stateChangeListeners.push(loginButton.onStateChange.bind(loginButton));
      // autologin needs cookies/storage implemented in human interaction interface
      await checkAutoLogin(this);
    }

    // if auto login is not prompted
    if (this.state.status !== AuthStates.AUTHORIZED) {
      this.state = { status: AuthStates.INITIALIZED, serviceInfo: this.serviceInfo };
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
    this.state = { status: AuthStates.ERROR, message: msg };
  }

  /**
   * Triggered when button is pressed
   */
  async handleClick () {
    if (isAuthorized.call(this)) {
      this.state = { status: AuthStates.SIGNOUT };
    } else if (isInitialized.call(this)) {
      this.startAuthRequest();
    } else if (isNeedSignIn.call(this)) {
      // reopen popup (HACK for now: set to private property to avoid self-assignment)
      this.state = this._state;
    } else {
      console.log('Unhandled action in "handleClick()" for status:', this.state.status);
    }

    function isAuthorized () {
      return this.state.status === AuthStates.AUTHORIZED;
    }
    function isInitialized () {
      return this.state.status === AuthStates.INITIALIZED;
    }
    function isNeedSignIn () {
      return this.state.status === AuthStates.NEED_SIGNIN;
    }
  }

  /**
   * Used only to retrieve returnUrl in browser environments
   *
   * @param {*} returnURL
   * @param {*} windowLocationForTest
   * @param {*} navigatorForTests
   */
  getReturnURL (
    returnURL,
    windowLocationForTest,
    navigatorForTests
  ) {
    const RETURN_URL_AUTO = 'auto';

    returnURL = returnURL || RETURN_URL_AUTO + '#';

    // check the trailer
    const trailer = returnURL.slice(-1);
    if ('#&?'.indexOf(trailer) < 0) {
      throw new Error('Pryv access: Last character of --returnURL setting-- is not ' +
        '"?", "&" or "#": ' + returnURL);
    }
    // auto mode for desktop
    if (returnUrlIsAuto(returnURL) &&
        !utils.browserIsMobileOrTablet(navigatorForTests)) {
      return false;
    // auto mode for mobile or self
    } else if ((returnUrlIsAuto(returnURL) &&
                utils.browserIsMobileOrTablet(navigatorForTests)) ||
               returnURL.indexOf('self') === 0) {
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

    async function doPolling () {
      if (this.state.status !== AuthStates.NEED_SIGNIN) {
        return;
      }
      const pollResponse = await pollAccess(this.state.poll);

      if (pollResponse.status === AuthStates.NEED_SIGNIN) {
        setTimeout(await doPolling.bind(this), this.state.poll_rate_ms);
      } else {
        this.state = pollResponse;
      }

      async function pollAccess (pollUrl) {
        try {
          const res = await utils.superagent.get(pollUrl);
          return res.body;
        } catch (e) {
          if (e.response &&
              e.response.status === 403 &&
              e.response.body &&
              e.response.body.status === 'REFUSED') {
            return { status: AuthStates.INITIALIZED };
          } else {
            return { status: AuthStates.ERROR, message: 'Error while polling for auth request', error: e };
          }
        }
      }
    }
  }

  // -------------- state listeners ---------------------
  set state (newState) {
    // retro-compatibility for lib-js < 2.0.9
    newState.id = newState.status;

    this._state = newState;

    this.stateChangeListeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (e) {
        console.log('Error during set state ()', e);
      }
    });
  }

  get state () {
    return this._state;
  }
}

// ----------- private methods -------------

async function checkAutoLogin (authController) {
  const loginButton = authController.loginButton;
  if (loginButton == null) {
    return;
  }

  const storedCredentials = await loginButton.getAuthorizationData();
  if (storedCredentials != null) {
    authController.state = Object.assign({}, { status: AuthStates.AUTHORIZED }, storedCredentials);
  }
}

// ------------------ ACTIONS  ----------- //

async function loadAssets (authController) {
  let loadedAssets = {};
  try {
    loadedAssets = await authController.service.assets();
    if (typeof location !== 'undefined') {
      await loadedAssets.loginButtonLoadCSS();
      const thisMessages = await loadedAssets.loginButtonGetMessages();
      if (thisMessages.LOADING) {
        authController.messages = Messages(authController.languageCode, thisMessages);
      } else {
        console.log('WARNING Messages cannot be loaded using defaults: ', thisMessages);
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
