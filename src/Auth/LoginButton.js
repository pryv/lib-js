
const Messages = require('./LoginButtonMessages')('en');
const States = require('./States');

class LogingButton {

  constructor(auth) {
    // 2. build button
    this.loginButtonSpan = document.getElementById(auth.settings.spanButtonID);

    if (!this.loginButtonSpan) {
      throw new Error('No Cannot find SpanId: ' + auth.settings.spanButtonID + ' in DOM');
    }

    this.loginButtonSpan.addEventListener('click', this.onClick.bind(this));
    this.auth = auth;
    this.text = Messages.LOADING;
  }

  setText(text) {
    this.loginButtonSpan.innerHTML = '<button type = "button">' + text + '</button>';
  }

  onClick() {
    if (this.auth.state.action) {
      this.auth.state.action.apply(this.auth);
    }
  }

  onStateChange(state) {
    switch (state.id) {
      case States.ERROR:
        this.text = Messages.ERROR + ': ' + state.message
      break;
      case States.LOADING:
        this.text = Messages.LOADING;
        break;
      case States.INITIALIZED:
        this.text = Messages.LOGIN + ': ' + this.auth.pryvServiceInfo.name;
      break;
      case States.AUTHORIZED:
        this.text =  'Y : ' + state.displayName;
        break;
      default:
        console.log('Unhandled state for Login: ' + state.id);
    }
    this.setText(this.text);
  }
}


module.exports = LogingButton;