class HumanInteractionInterface {
  constructor(auth) {
     this.auth = auth; 
  }
  
  /**
   * Called at the end of AuthController.init()
   * At this stage this.auth.pryvService & this.auth.pryvServiceInfo are loaded
   * - Load potential assets 
   * implementation is optional
   */ 
  async init() { }
  
  /**
   * Eventually return pollUrl when returning from login in another page
   */
  async pollUrlReturningFromLogin() { }
  
  /**
   * Called each time the Auth state change
   */
  onStateChange (state) {
    throw new Error('onStateChange() must be implemented')
  }
 
  
}