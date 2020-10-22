class HumanInteractionInterface { 
  /**
   * Called at the end of AuthController.init()
   * - Load potential assets 
   * - Register state change with
   */ 
  async init () { }

  /**
   * Called each time the Auth state change
   */
  onStateChange () {
    throw new Error('onStateChange() must be implemented');
  }

  /**
   *  this.auth.handleClick();
   * The same button can redirect, open auth popup or logout
   */
  onClick () { 
    throw new Error('onClick() must be implemented');
  }

  /**
   * Open popup or the login screen with authUrl
   * @param {string} authUrl 
   */
  startLoginScreen (authUrl) {
    throw new Error('startLoginScreen(authUrl) must be implemented');
  }

  /**
   * save authData to the cookie or storage
   *  {
      apiEndpoint: apiEndpoint,
      displayName: username
    }
   * @param {*} authData
   */
  saveAuthorizationData (authData) {
    throw new Error('saveAuthorizationData (authData) must be implemented');
  }

  /**
   * You should return saved data from the storage
   */
  getSavedLogIn () { 
    throw new Error('getSavedLogIn () must be implemented');
  }

  /**
   * You should delete saved data from the storage
   */
  async logOut () { 
    throw new Error('logOut () must be implemented');
  }

}

module.exports = HumanInteractionInterface;
