const utils = require('../utils');
const Service = require('../Service');
const LoginButton = require('./LoginButton');
const AuthStates = require('./AuthStates');
const Cookies = require('./CookieUtils');

const COOKIE_STRING = 'pryv-libjs-';

const QUERY_REGEXP = /[?#&]+([^=&]+)=([^&]*)/g;
const PRYV_REGEXP = /[?#&]+prYv([^=&]+)=([^&]*)/g;

/**
 * @private
 */
class AuthController {


  constructor(settings, serviceInfoUrl, serviceCustomizations) {
    this.stateChangeListners = [];
    this.settings = settings;
    this.serviceInfoUrl = serviceInfoUrl;
    this.serviceCustomizations = serviceCustomizations;
    

    if (!settings) { throw new Error('settings cannot be null'); }

    // -- First of all get the button 
    if (this.settings.spanButtonID) {
      this.loginButton = new LoginButton(this);
      this.stateChangeListners.push(this.loginButton.onStateChange.bind(this.loginButton));
    } else {
      if (document) {
        console.log('WARNING: Pryv.Browser initialized with no spanButtonID');
      }
    }

    try { // Wrap all in a large try catch 
      

      // -- Check Error CallBack
      if (!this.settings.onStateChange) { throw new Error('Missing settings.onStateChange'); }
      this.stateChangeListners.push(this.settings.onStateChange);

      // -- settings 
      if (!this.settings.authRequest) { throw new Error('Missing settings.authRequest'); }

      // -- Extract returnURL 
      this.settings.authRequest.returnURL = 
        AuthController.getReturnURL(this.settings.authRequest.returnURL);

      if (!this.settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      this.cookieKey = COOKIE_STRING + this.settings.authRequest.requestingAppId;

      if (!this.settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }

      // -- Extract service info from URL query params if nor specified -- //
      if (!this.serviceInfoUrl) {
        // TODO
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
  async init() {
    this.state = { id: AuthStates.LOADING };
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

    // 2. setup button with assets
    if (this.loginButton) {
      try {
        await this.loginButton.loadAssets(this.pryvService);
      } catch (e) {
        this.state = {
          id: AuthStates.ERROR,
          message: 'Cannot fetch button visuals',
          error: e
        }
        throw e; // forward error
      }
    }

    // 3. Check if there is a prYvkey as result of "out of page login"
    const params = AuthController.getQueryParamsFromURL();
    if (params.prYvkey) {
      try {
        const res = await utils.superagent.get(
          this.pryvServiceInfo.access + params.prYvkey);
        this.processAccess(res.body);
      } catch (e) {
        this.state = {
          id: AuthStates.ERROR,
          message: 'Cannot fetch result',
          error: e
        }
      }
      return this.pryvService;
    }

    // 4. check autologin 
    let loginCookie = null;
    try {
      loginCookie = Cookies.get(this.cookieKey);
    } catch (e) { console.log(e); }

    if (loginCookie) {
      this.state = {
        id: AuthStates.AUTHORIZED,
        apiEndpoint: loginCookie.apiEndpoint,
        displayName: loginCookie.displayName,
        action: this.logOut
      };
    } else {
      // 5. Propose Login
      this.readyAndClean();
    }

    return this.pryvService;
  }

  /**
   * Called at the end init() and when logging out()
   */
  readyAndClean() {
    Cookies.del(this.cookieKey)
    this.accessData = null;
    this.state = {
      id: AuthStates.INITIALIZED,
      serviceInfo: this.serviceInfo,
      action: this.openLoginPage
    }
  }

  // ----------------------- ACCESS --------------- ///


  /**
   * @private
   */
  async postAccess() {
    try {
      const res = await utils.superagent.post(this.pryvServiceInfo.access)
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
  async getAccess() {
    const res = await utils.superagent.get(this.accessData.poll).set('accept', 'json');
    return res.body;
  }

  /**
   * @private 
   */
  async poll() {
    if (this.accessData.status !== 'NEED_SIGNIN') {
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
  processAccess(accessData) {
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
          message: 'Error on the backend'
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
          displayName: this.accessData.username,
          action: this.logOut
        };

        break;
    }
  }


  // ---------------------- STATES ----------------- //

  set state(newState) {
    //console.log('State Changed:' + JSON.stringify(newState));
    this._state = newState;

    this.stateChangeListners.map((listner) => {
      try { listner(this.state) } catch (e) { console.log(e); }
    });
  }

  get state() {
    return this._state;
  }


  // ------------------ ACTIONS  ----------- //

  /**
   * Follow Browser Process and 
   * Open Login Page.
   */
  async openLoginPage() {
    console.log('OpenLogin', this);
    // 1. Make sure Browser is initialized
    if (!this.pryvServiceInfo) {
      throw new Error('Browser service must be initialized first');
    }

    // 2. Post access if needed
    if (!this.accessData) {
      this.processAccess(await this.postAccess());
    }

    // 3.a Open Popup (even if already opened)
    if (this.accessData.status === 'NEED_SIGNIN')
      this.popupLogin();

    // 3.a.1 Poll Access if not yet in course
    if (!this.polling) this.poll();
  }

  /**
   * Revoke Connection and clean local cookies
   * 
   */
  logOut() {
    const message = this.loginButton ? this.loginButton.myMessages.LOGOUT_CONFIRM : 'Logout ?';
    if (confirm(message)) {
      this.readyAndClean();
    }
  }

  popupLogin() {
    if (!this.accessData || !this.accessData.url) {
      throw new Error('Pryv Sign-In Error: NO SETUP. Please call Browser.setupAuth() first.');
    }

    if (this.settings.authRequest.returnURL) { // open on same page (no Popup) 
      location.href = this.accessData.url;
      return;
    }

    var screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft,
      screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop,
      outerWidth = typeof window.outerWidth !== 'undefined' ?
        window.outerWidth : document.body.clientWidth,
      outerHeight = typeof window.outerHeight !== 'undefined' ?
        window.outerHeight : (document.body.clientHeight - 22),
      width = 270,
      height = 420,
      left = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top +
        ',scrollbars=yes'
      );


    this.popup = window.open(this.accessData.url, 'prYv Sign-in', features);

    if (!this.popup) {
      // TODO try to fall back on access
      console.log('FAILED_TO_OPEN_WINDOW');
    } else if (window.focus) {
      this.popup.focus();
    }

    return;
  }

  // ------------------ Internal utils ------------------- //

  /**
   * From the settings and the environement  
   * @param {string} [setting] Url 
   * @param {Object} [windowLocationForTest] fake window.location.href
   * @param {Object} [navigatorForTests] fake navigaotor for testsuseragent
   */
  static getReturnURL(setting, 
    windowLocationForTest, navigatorForTests) {
    let returnURL = setting || 'auto#';
  
    const locationHref = windowLocationForTest || window.location.href;

    // check the trailer
    var trailer = returnURL.slice(-1);
    if ('#&?'.indexOf(trailer) < 0) {
      throw new Error('Pryv access: Last character of --returnURL setting-- is not ' +
        '"?", "&" or "#": ' + returnURL);
    }

    // is Popup ? (not mobile && auto#)
    if (returnURL.indexOf('auto') === 0 && !AuthController.browserIsMobileOrTablet(navigatorForTests)) {
      return false;
    }

    // set self as return url?
    if ((returnURL.indexOf('auto') === 0 && AuthController.browserIsMobileOrTablet(navigatorForTests)) ||
      (returnURL.indexOf('self') === 0)) { // 

      // eventually clean-up current url from previous pryv returnURL
      returnURL = locationHref + returnURL.substring(4);;
    }
    
    return AuthController.cleanURLFromPrYvParams(returnURL);
  }

  /**
   * 
   * @param {Object} [navigatorForTests] mock navigator var only for testing purposes 
   */
  static browserIsMobileOrTablet(navigatorForTests) {
    const myNavigator = navigatorForTests || navigator;
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(myNavigator.userAgent || myNavigator.vendor || myNavigator.opera);
    return check;
  };


  static getQueryParamsFromURL(url) { 
    url = url || window.location.href;
    var vars = {};
    url.replace(QUERY_REGEXP,
      function (m, key, value) {
        vars[key] = decodeURIComponent(value);
      });
    return vars;
  }

  //util to grab parameters from url query string
  static getServiceInfoFromURL(url) {
    const vars = AuthController.getQueryParamsFromURL(url);
    //TODO check validity of status
    return vars[AuthController.options.SERVICE_INFO_QUERY_PARAM_KEY];
  };


  //util to grab parameters from url query string
  static getStatusFromURL(url) {
    const vars = AuthController.getQueryParamsFromURL(url);
    //TODO check validity of status
    return vars.prYvstatus;
  };

  //util to grab parameters from url query string
  static cleanURLFromPrYvParams(url) {
    return url.replace(PRYV_REGEXP, '');
  };
}

AuthController.options = {
  SERVICE_INFO_QUERY_PARAM_KEY: 'pryvServiceInfoUrl'
}

module.exports = AuthController;