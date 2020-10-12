
const Messages = require('./LoginButtonMessages');
const AuthStates = require('../Auth/AuthStates');
const HumanInteractionInterface = require('../Auth/HumanInteractionInterface');

const Cookies = require('./CookieUtils');

const COOKIE_STRING = 'pryv-libjs-';

const QUERY_REGEXP = /[?#&]+([^=&]+)=([^&]*)/g;
const PRYV_REGEXP = /[?#&]+prYv([^=&]+)=([^&]*)/g;


/**
 * @memberof Pryv.Browser
 */
class LoginButton extends HumanInteractionInterface {

  /**
   * @param {Browser} auth 
   */
  constructor(auth) {
    super(auth);
    // 1. get Language
    
    this.languageCode = auth.settings.authRequest.languageCode || 'en';
    this.myMessages = Messages(this.languageCode);
    // 2. build button
    this.loginButtonSpan = document.getElementById(auth.settings.spanButtonID);

    if (!this.loginButtonSpan) {
      console.log('WARNING: Pryv.Browser initialized with no spanButtonID');	
    }

    // up to the time the button is loaded use the Span to display eventual error messages
    this.loginButtonText = this.loginButtonSpan;

    this.loginButtonSpan.addEventListener('click', this.onClick.bind(this));

    this.onStateChange({ id: AuthStates.LOADING });
  }
  
  /**
   * Completes AuthController.init())
   */
  async init() {
    
    // 2. setup button with assets
     try {
        await this.loadAssets(this.auth.pryvService);
      } catch (e) {
        this.auth.state = {
          id: AuthStates.ERROR,
          message: 'Cannot fetch button visuals',
          error: e
        }
        throw e; // forward error
      }
       
  }
  
  /**
   * Eventually return pollUrl when returning from login in another page
   */
  async pollUrlReturningFromLogin() {
    const params = LoginButton.getQueryParamsFromURL();
    let pollUrl = null;
    if (params.prYvkey) { // deprecated method - To be removed
      pollUrl = this.pryvServiceInfo.access + params.prYvkey;
    }
    if (params.prYvpoll) {
      pollUrl = params.prYvpoll;
    }
    return pollUrl;
  }
  
  /**
   * Auto-Login (Cookies for browser)
   */

  /**
   * @param {Service} pryvService 
   */
  async loadAssets(pryvService) {
    const assets = await pryvService.assets();
    assets.loginButtonLoadCSS(); // can be async 
    this.loginButtonSpan.innerHTML = await assets.loginButtonGetHTML();
    this.loginButtonText = document.getElementById('pryv-access-btn-text');
    const thisMessages = await assets.loginButtonGetMessages();
    if (thisMessages.LOADING) {
      this.myMessages = Messages(this.languageCode, thisMessages);
    } else {
      console.log("WARNING Messages cannot be loaded using defaults: ", thisMessages)
    }
    this.onStateChange(); // refresh messages
    this.refreshText();
  }


  refreshText() {
    if (this.loginButtonText)
     this.loginButtonText.innerHTML = this.text;
  }

  onClick() {
    if (this.auth.state.action) {
      this.auth.state.action.apply(this.auth);
    }
  }

  onStateChange(state) {
    if (state) {
      this.lastState = state;
    }
    switch (this.lastState.id) {
      case AuthStates.ERROR:
        this.text = this.myMessages.ERROR + ': ' + this.lastState.message
      break;
      case AuthStates.LOADING:
        this.text = this.myMessages.LOADING;
        break;
      case AuthStates.INITIALIZED:
        this.text = this.myMessages.LOGIN + ': ' + this.auth.pryvServiceInfo.name;
      break;
      case AuthStates.AUTHORIZED:
        this.text = this.lastState.displayName;
        break;
      default:
        console.log('WARNING Unhandled state for Login: ' + this.lastState.id);
    }
    this.refreshText();
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
    if (returnURL.indexOf('auto') === 0 && ! LoginButton.browserIsMobileOrTablet(navigatorForTests)) {
      return false;
    }

    // set self as return url?
    if ((returnURL.indexOf('auto') === 0 && LoginButton.browserIsMobileOrTablet(navigatorForTests)) ||
      (returnURL.indexOf('self') === 0)) { // 

      // eventually clean-up current url from previous pryv returnURL
      returnURL = locationHref + returnURL.substring(4);;
    }
    
    return LoginButton.cleanURLFromPrYvParams(returnURL);
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
    const vars = LoginButton.getQueryParamsFromURL(url);
    //TODO check validity of status
    return vars[LoginButton.options.SERVICE_INFO_QUERY_PARAM_KEY];
  };


  //util to grab parameters from url query string
  static getStatusFromURL(url) {
    const vars = LoginButton.getQueryParamsFromURL(url);
    //TODO check validity of status
    return vars.prYvstatus;
  };

  //util to grab parameters from url query string
  static cleanURLFromPrYvParams(url) {
    return url.replace(PRYV_REGEXP, '');
  };
}


LoginButton.options = {
  SERVICE_INFO_QUERY_PARAM_KEY: 'pryvServiceInfoUrl'
}

module.exports = LoginButton;