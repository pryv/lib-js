
const AuthStates = require('./AuthStates');

function getStore(): AuthStore {
  if (store == null) {
    store = new AuthStore();
  }
  return store;
}
module.exports = { getStore };

class AuthStore {

  state = {
    id: AuthStates.LOADING;
  };
  accessData = {
    poll: '',
    authUrl: '',
    status: '',
  }

  constructor(state, accessData) {
    this.state = state;
    this.accessData = accessData;
  }
}
