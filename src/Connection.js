
const utils = require('./utils.js');

/**
 * @class Connection
 * Create an instance of Connection to Pryv API.
 * The connection will be opened on
 *
 * @example
 * create a connection for the user 'tom' on 'pryv.me' backend with the token 'TTZycvBTiq'
 * var conn = new pryv.Connection('https://TTZycvBTiq@tom.pryv.me');
 *
 * @property {TokenAndEndpoint} tokenAndApi
 * @memberof Pryv
 * 
 * @constructor
 * @this {Connection} 
 * @param {PryvApiEndpoint} pryvApiEndpoint
 */
class Connection {

  constructor(pryvApiEndpoint) {
    this.tokenAndApi = utils.extractTokenAndApiEndpoint(pryvApiEndpoint);
    this.options = {};
    this.options.chunkSize = 1000;
    this._deltaTime = { value: 0, weight: 0 };
  }

  /**
   * Issue a Batch call http://api.pryv.com/reference/#call-batch .
   * arrayOfAPICalls will be splited in multiple calls if the size is > `conn.options.chunkSize` .
   * Default chunksize is 1000.
   * @param {Array.<MethodCall>} arrayOfAPICalls Array of Method Calls
   * @returns {Promise<Array>} Promise to Array of results matching each method call in order
   */
  api(arrayOfAPICalls) {
    return new Promise(async (resolve, reject) => {
      const res = [];
      for (let cursor = 0; arrayOfAPICalls.length >= cursor; cursor += this.options.chunkSize) {
        const thisBatch = arrayOfAPICalls.slice(cursor, cursor + this.options.chunkSize);
        const resRequest = await this.post('', thisBatch);
        Array.prototype.push.apply(res, resRequest.results)
      }
      resolve(res);
    });
  }

  /**
   * Post to API return results  
   * @param {Array | Object} data 
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {Promise<Array|Object>}  Promise to result.body
   */
  post(path, data, queryParams) {
    return new Promise(async (resolve, reject) => {
      const now = Date.now() / 1000;
      const res = await this.postRaw(path, data, queryParams);
      this._handleMeta(res.body, now);
      resolve(res.body);
    });
  }

  /**
   * Raw Post to API return superagent object  
   * @param {Array | Object} data 
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {request.superagent}  Promise from superagent's post request
   */
  postRaw(path, data, queryParams) {
    return utils.superagent.post(this.tokenAndApi.endpoint + path)
      .set('Authorization', this.tokenAndApi.token)
      .set('accept', 'json')
      .query(queryParams)
      .send(data);
  }

  /**
   * Post to API return results  
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {Promise<Array|Object>}  Promise to result.body
   */
  get(path, queryParams) {
    return new Promise(async (resolve, reject) => {
      const now = Date.now() / 1000;
      const res = await this.getRaw(path, queryParams);
      this._handleMeta(res.body, now);
      resolve(res.body);
    });
  }

  /**
   * Raw Get to API return superagent object
   * @param {Object} queryParams 
   * @param {string} path 
   * @returns {request.superagent}  Promise from superagent's get request
   */
  getRaw(path, queryParams) {
    path = path || '';
    return utils.superagent.get(this.tokenAndApi.endpoint + path)
      .set('Authorization', this.tokenAndApi.token)
      .set('accept', 'json')
      .query(queryParams);
  }

  /**
   * Difference in second between the API and locatime
   * deltaTime is refined at each (non Raw) API call
   * @readonly
   * @property {number} deltaTime
   */
  get deltaTime() {
    return this._deltaTime.value;
  }

  // private method that handle meta data parsing
  _handleMeta(res, requestLocalTimestamp) {
    if (!res.meta) throw new Error('Cannot find .meta in response.');
    if (!res.meta.serverTime) throw new Error('Cannot find .meta.serverTime in response.');

    // update deltaTime and weight it 
    this._deltaTime.value = (this._deltaTime.value * this._deltaTime.weight + res.meta.serverTime - requestLocalTimestamp) / ++this._deltaTime.weight;
  }

}

module.exports = Connection;