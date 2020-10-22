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
    throw new Error('onStateChange() must be implemented')
  }

  /**
   * Not mandatory, but needed to launch auth request and
   * start authentication popup
   */
  onClick () {}
}

module.exports = HumanInteractionInterface;
