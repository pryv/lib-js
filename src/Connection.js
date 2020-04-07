
const utils = require('./utils.js');

const jsonParser = require('./lib/json-parser');

const browserGetEventStreamed = require('./lib/browser-getEventStreamed');

/**
 * @class Connection
 * A connection is an authenticated link to a Pryv.io account.
 * 
 * @type {TokenAndEndpoint}
 *
 * @example
 * create a connection for the user 'tom' on 'pryv.me' backend with the token 'TTZycvBTiq'
 * const conn = new Pryv.Connection('https://TTZycvBTiq@tom.pryv.me');
 *
 * @property {string} [token]
 * @property {string} endpoint
 * @memberof Pryv
 * 
 * @constructor
 * @this {Connection} 
 * @param {PryvApiEndpoint} pryvApiEndpoint
 */
class Connection {

  constructor(pryvApiEndpoint) {
    const { token, endpoint } = utils.extractTokenAndApiEndpoint(pryvApiEndpoint);
    this.token = token;
    this.endpoint = endpoint;
    this.options = {};
    this.options.chunkSize = 1000;
    this._deltaTime = { value: 0, weight: 0 };
  }

  /**
   * Issue a Batch call https://api.pryv.com/reference/#call-batch .
   * arrayOfAPICalls will be splited in multiple calls if the size is > `conn.options.chunkSize` .
   * Default chunksize is 1000.
   * @param {Array.<MethodCall>} arrayOfAPICalls Array of Method Calls
   * @param {Function} [progress] Return percentage of progress (0 - 100);
   * @returns {Promise<Array>} Promise to Array of results matching each method call in order
   */
  async api(arrayOfAPICalls, progress) {
    if (! Array.isArray(arrayOfAPICalls)) {
      throw new Error('Pryv.api() takes an array as input');
    }

    const res = [];
    let percent = 0;
    for (let cursor = 0; arrayOfAPICalls.length >= cursor; cursor += this.options.chunkSize) {
      const thisBatch = [];
      const cursorMax = Math.min(cursor + this.options.chunkSize, arrayOfAPICalls.length);
      // copy only method and params into a back call to be exuted
      for (let i = cursor; i < cursorMax ; i++) {      
        thisBatch.push({ method: arrayOfAPICalls[i].method, params: arrayOfAPICalls[i].params});
      }
      const resRequest = await this.post('', thisBatch);
      // result checks
      if (! resRequest || ! Array.isArray(resRequest.results)) {
        throw new Error('API call result is not an Array: ' + JSON.stringify(resRequest));
      }
      if (resRequest.results.length != thisBatch.length) {
        throw new Error('API call result Array does not match request: ' + JSON.stringify(resRequest));
      }


      // eventually call handleResult 
      for (let i = 0; i < resRequest.results.length; i++) {
        if (arrayOfAPICalls[i + cursor].handleResult) {
          await arrayOfAPICalls[i + cursor].handleResult.call(null, resRequest.results[i]);
        }
      }
      Array.prototype.push.apply(res, resRequest.results)
      percent =  Math.round(100 * res.length / arrayOfAPICalls.length);
      if (progress) { progress(percent, res); }
    }
    return res;
  }

  /**
   * Post to API return results  
   * @param {(Array | Object)} data 
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {Promise<Array|Object>}  Promise to result.body
   */
  async post(path, data, queryParams) {
    const now = Date.now() / 1000;
    const res = await this.postRaw(path, data, queryParams);
    this._handleMeta(res.body, now);
    return res.body;
  }

  /**
   * Raw Post to API return superagent object  
   * @param {Array | Object} data 
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {request.superagent}  Promise from superagent's post request
   */
  async postRaw(path, data, queryParams) {
    return this._post(path)
      .query(queryParams)
      .send(data);
  }

   _post(path) {
    return utils.superagent.post(this.endpoint + path)
      .set('Authorization', this.token)
      .set('accept', 'json');
  }

  /**
   * Post to API return results  
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {Promise<Array|Object>}  Promise to result.body
   */
  async get(path, queryParams) {
    const now = Date.now() / 1000;
    const res = await this.getRaw(path, queryParams);
    this._handleMeta(res.body, now);
    return res.body
  }

  /**
   * Raw Get to API return superagent object
   * @param {Object} queryParams 
   * @param {string} path 
   * @returns {request.superagent}  Promise from superagent's get request
   */
  getRaw(path, queryParams) {
    path = path || '';
    return utils.superagent.get(this.endpoint + path)
      .set('Authorization', this.token)
      .set('accept', 'json')
      .query(queryParams);
  }

  /**
   * ADD Data Points to HFEvent (flatJSON format)
   * https://api.pryv.com/reference/#add-hf-series-data-points
   */
  async addPointsToHFEvent(eventId, fields, points) {
    const res = await this.post('events/' + eventId + '/series',
      {
        format: 'flatJSON',
        fields: fields,
        points: points
      });
    if (!res.status === 'ok') {
      throw new Error('Failed loading serie: ' + JSON.stringify(res.status));
    }
    return res;
  }

  /**
   * Streamed get Event. 
   * Fallbacks to not streamed, for browsers that does not support `fetch()` API 
   * @see https://api.pryv.com/reference/#get-events
   * @param {Object} queryParams See `events.get` parameters
   * @param {Function} forEachEvent Function taking one event as parameter. Will be called for each event 
   * @returns {Promise<Object>} Promise to result.body transformed with `eventsCount: {count}` replacing `events: [...]`
   */
  async getEventsStreamed(queryParams, forEachEvent) {
    const myParser = jsonParser(forEachEvent);
    let res = null;
    if (typeof window === 'undefined') { // node
      res = await this.getRaw('events', queryParams)
        .buffer(false)
        .parse(myParser);

    } else if (typeof fetch !== 'undefined') { // browser supports fetch 
      res = await browserGetEventStreamed(this, queryParams, myParser);

    } else { // browser no fetch supports
      console.log('WARNING: Browser does not support fetch() required by Pryv.Connection.getEventsStreamed()');
      res = await this.getRaw('events', queryParams);
      res.body.eventsCount = 0;
      if (res.body.events) {
        res.body.events.forEach(forEachEvent);
        res.body.eventsCount = res.body.events.length;
        delete res.body.events;
      }
    }

    const now = Date.now() / 1000;
    this._handleMeta(res.body, now);
    return res.body
  }

  /**
   * Create an event with attached file
   * NODE.jS ONLY
   * @param {Event} event
   * @param {string} filePath
   */
  async createEventWithFile(event, filePath) {
    const res = await this._post('events')
      .field('event', JSON.stringify(event))
      .attach('file', filePath);

    const now = Date.now() / 1000;
    this._handleMeta(res.body, now);
    return res.body
  }

  /**
 * Create an event with attached formData
 * !! BROWSER ONLY
 * @param {Event} event
 * @param {FormData} formData https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
 */
  async createEventWithFormData(event, formData) {
    formData.append('event', JSON.stringify(event));
    const res = await this._post('events').send(formData);
    return res.body
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

  /**
   * Pryv API Endpoint of this connection
   * @readonly
   * @property {PryvApiEndpoint} deltaTime
   */
  get apiEndpoint() {
    return utils.buildPryvApiEndPoint(this);
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

/**
 * API Method call, for batch call https://api.pryv.com/reference/#call-batch
 * @typedef {Object} MethodCall
 * @property {string} method - The method id
 * @property {(Object|Array)}  params - The call parameters as required by the method.
 * @property {(Function|Promise)} [handleResult] - Will be called with the result corresponding to this specific call.
 */