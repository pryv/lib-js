
const utils = require('./utils.js');

/**
 * Handle to connect to a Pryv API endpoint
 * @property {TokenAndEndpoint} tokenAndApi
 */
class Connection  {

  /**
   * 
   * @param {PryvApiEndpoint} pryvApiEndpoint
   */
  constructor(pryvApiEndpoint) {
    this.superagent = require('superagent');
    /**
     * @type {TokenAndEndpoint}
     */
    this.tokenAndApi = utils.extractTokenAndApiEndpoint(pryvApiEndpoint);
  }

  /**
   * Issue a Batch call http://api.pryv.com/reference/#call-batch
   * @param Array arrayOfAPICalls
   * @returns {request.superagent}  Promise from superagent's post request 
   */
  api(arrayOfAPICalls) { 
    return this.superagent.post(this.tokenAndApi.endpoint)
    .send(arrayOfAPICalls)
    .set('Authorization',this.tokenAndApi.token)
    .set('accept', 'json');
  }



}

module.exports = Connection;