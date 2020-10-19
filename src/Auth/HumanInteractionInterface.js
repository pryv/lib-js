class HumanInteractionInterface {

  constructor(auth) {
    this.auth = auth; 
  }
  
  /**
   * Called at the end of AuthController.init()
   * - Load potential assets 
   * - Register state change with
   * this.auth.stateChangeListners.push(this.onStateChange.bind(this));
   * implementation is optional
   */ 
  async init () { }

  /**
   * Called each time the Auth state change
   */
  onStateChange () {
    throw new Error('onStateChange() must be implemented')
  }

  /**
   * Not mandatory, but needed to launch auth request and
   * start authentication popup
   */
  onClick () {}
}

module.exports = HumanInteractionInterface;
