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
    this.validateSettings();

    this.stateChangeListeners = [];
    if (this.settings.onStateChange) {
      this.stateChangeListeners.push(this.settings.onStateChange);
    }
    this.service = service;
    this.languageCode = this.settings.authRequest.languageCode || 'en';    
    this.messages = Messages(this.languageCode);     
  }

  validateSettings () {
    if (!this.settings) { throw new Error('settings cannot be null'); }
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
  }

  /**
   * @returns {PryvService}
   */
  async init (loginButton) {
    this.serviceInfo = await this.service.info();
    this.state = { id: AuthStates.LOADING };
    this.assets = await loadAssets(this);

    // initialize human interaction interface
    if (loginButton != null) {

      this.loginButton = loginButton;
      console.log('registerin', this.loginButton.onStateChange)
      this.stateChangeListeners.push(this.loginButton.onStateChange.bind(this.loginButton));
      // autologin needs cookies/storage implemented in human interaction interface
      await checkAutoLogin(this);
    }

    if (!this.isAuthorized()) {
      await prepareForLogin(this);
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
    return this._state;
  }

  /**
   * Stops poll for auth request
   */
  stopAuthRequest () {
    this.accessData = { status: 'ERROR' };
  }

  isAuthorized () {
    return this.state.id == AuthStates.AUTHORIZED;
  }

  isInitialized () {
    return this.state.id === AuthStates.INITIALIZED;
  }

  getAccessData () {
    return this.accessData;
  }

  async handleClick () {
    if (this.isAuthorized()) {
      this.state = { id: AuthStates.LOGOUT };
    } else if (this.isInitialized()) {
      this.state = { id: AuthStates.START_SIGNING };
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
   * to something else but AuthStates.START_SIGNING
   * @param {AuthController} auth
   * @private
   */
  async startAuthRequest () {
    if (this.state.id !== AuthStates.START_SIGNING) {
      return;
    }
    changeAuthStateDependingOnAccess(this, await pollAccess(this));
    setTimeout(await this.startAuthRequest.bind(this), this.accessData.poll_rate_ms);
  }


  // -------------- Auth state listeners ---------------------
  set state (newState) {
    console.log('State set:' + JSON.stringify(newState));
    this._state = newState;
    //this.onStateChange();
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

async function deleteSessionData(authController) {
  authController.accessData = null;
  if (authController.loginButton != null) {
    authController.loginButton.deleteAuthorizationData();
  }
}

/**
 * Called at the end init() and when logging out()
 */
async function prepareForLogin(authController) {
  deleteSessionData(authController);

  // 1. Make sure Browser is initialized
  if (!authController.service) {
    throw new Error('Browser service must be initialized first');
  }

  await postAccessIfNeeded(authController);

  // change state to initialized if signin is needed
  if (
    authController.getAccessData() &&
    authController.getAccessData().status == AuthController.options.ACCESS_STATUS_NEED_SIGNIN
  ) {
    if (!authController.getAccessData().url) {
      throw new Error('Pryv Sign-In Error: NO SETUP. Please call Browser.setupAuth() first.');
    }

    authController.state = {
      id: AuthStates.INITIALIZED,
      serviceInfo: authController.serviceInfo
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
          authController.serviceInfo,
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


async function checkAutoLogin (authController) {
  const loginButton = authController.loginButton;
  if (loginButton == null) {
    return;
  }

  const storedCredentials = await loginButton.getAuthorizationData();
  if (storedCredentials != null) {
    console.log('got auth', storedCredentials)
    authController.state = Object.assign({}, {id: AuthStates.AUTHORIZED}, storedCredentials);
  }
}


/**
* @private
*/
async function pollAccess(authController) {
  let res;
  try {
    res = await utils.superagent
      .get(authController.accessData.poll)
      .set('accept', 'json');
  } catch (e) {
    return { status: 'ERROR' }
  }
  return res.body;
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
async function postAccess (authController) {
  try {
    const res = await utils.superagent
      .post(authController.serviceInfo.access)
      .set('accept', 'json')
      .send(authController.settings.authRequest);
    return res.body;
  } catch (e) {
    authController.state = {
      id: AuthStates.ERROR,
      message: 'Requesting access',
      error: e
    };
    throw e; // forward error
  }
}

// ------------------ ACTIONS  ----------- //
function logOut (authController) {
  const message = authController.messages.LOGOUT_CONFIRM ? authController.messages.LOGOUT_CONFIRM : 'Logout ?';
  if (typeof confirm === 'undefined' || confirm(message)) {
    prepareForLogin(authController);
  }
}


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
      id: AuthStates.ERROR,
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
