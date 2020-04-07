
const Messages = require('./LoginButtonMessages');
const AuthStates = require('./AuthStates');

/**
 * @memberof Pryv.Browser
 */
class LoginButton {

  /**
   * @param {Browser} auth 
   */
  constructor(auth) {
    // 1. get Language
    
    this.languageCode = auth.settings.authRequest.languageCode || 'en';
    this.myMessages = Messages(this.languageCode);
    // 2. build button
    this.loginButtonSpan = document.getElementById(auth.settings.spanButtonID);

    if (!this.loginButtonSpan) {
      throw new Error('No Cannot find SpanId: ' + auth.settings.spanButtonID + ' in DOM');
    }

    // up to the time the button is loaded use the Span to dsiplay eventual error messages
    this.loginButtonText = this.loginButtonSpan;

    this.loginButtonSpan.addEventListener('click', this.onClick.bind(this));
    this.auth = auth;


    this.onStateChange({ id: AuthStates.LOADING });
  }

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

  
}


module.exports = LoginButton;