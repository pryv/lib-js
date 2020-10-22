
const AuthStates = require('./AuthStates');

let store = null;
function getStore () {
  if (store == null) {
    store = new AuthStore();
  }
  return store;
}
module.exports = { getStore };

class AuthStore {
  constructor () {
    this.setInitialValues();
  }
  setState (newState) {
    // console.log('State Changed:' + JSON.stringify(newState), this.stateChangeListners);
    this.state = newState;
    this.stateChangeListners.map((listner) => {
      try {
        listner(newState)
      } catch (e) {
        console.log(e);
      }
    });
  }

  resetValues () {
    this.setInitialValues();
  }

  setInitialValues () {
    this.state = {
      id: ''
    };
    this.accessData = {
      poll: '',
      authUrl: '',
      status: '',
    };
    this.stateChangeListners = [];
    this.messages = {};
    this.languageCode = 'en';
  }
}
