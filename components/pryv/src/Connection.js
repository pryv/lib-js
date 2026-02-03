/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const utils = require('./utils.js');
const jsonParser = require('./lib/json-parser');
const libGetEventStreamed = require('./lib/getEventStreamed');
const PryvError = require('./lib/PryvError');

/**
 * @class Connection
 * A connection is an authenticated link to a Pryv.io account.
 *
 * @type {TokenAndEndpoint}
 *
 * @example
 * create a connection for the user 'tom' on 'pryv.me' backend with the token 'TTZycvBTiq'
 * const conn = new pryv.Connection('https://TTZycvBTiq@tom.pryv.me');
 *
 * @property {string} [token]
 * @property {string} endpoint
 * @memberof pryv
 *
 * @constructor
 * @this {Connection}
 * @param {APIEndpoint} apiEndpoint
 * @param {pryv.Service} [service] - eventually initialize Connection with a Service
 */
class Connection {
  constructor (apiEndpoint, service) {
    const { token, endpoint } = utils.extractTokenAndAPIEndpoint(apiEndpoint);
    this.token = token;
    this.endpoint = endpoint;
    this.options = {};
    this.options.chunkSize = 1000;
    this._deltaTime = { value: 0, weight: 0 };
    if (service && !(service instanceof Service)) {
      throw new Error('Invalid service param');
    }
    this._service = service;
  }

  /**
   * get pryv.Service object relative to this connection
   * @readonly
   * @property {pryv.Service} service
   */
  get service () {
    if (this._service) return this._service;
    this._service = new Service(this.endpoint + 'service/info');
    return this._service;
  }

  /**
   * Get username for this connection.
   * It's async as it's constructed from access info.
   * @returns {Promise<string>} Promise resolving to the username
   */
  async username () {
    const accessInfo = await this.accessInfo();
    if (accessInfo.error) {
      throw new PryvError(
        'Failed fetching accessinfo: ' + accessInfo.error.message,
        accessInfo.error
      );
    }
    // @ts-ignore - username is always a string
    return accessInfo.user.username;
  }

  /**
   * Get access info for this connection.
   * It's async as it is fetched from the API.
   * @returns {Promise<AccessInfo>} Promise resolving to the access info
   */
  async accessInfo () {
    return this.get('access-info', null);
  }

  /**
   * Issue a Batch call https://api.pryv.com/reference/#call-batch .
   * arrayOfAPICalls will be splited in multiple calls if the size is > `conn.options.chunkSize` .
   * Default chunksize is 1000.
   * @param {Array.<MethodCall>} arrayOfAPICalls Array of Method Calls
   * @param {Function} [progress] Return percentage of progress (0 - 100);
   * @returns {Promise<Array>} Promise to Array of results matching each method call in order
   */
  async api (arrayOfAPICalls, progress) {
    function httpHandler (batchCall) {
      return this.post('', batchCall);
    }
    return await this._chunkedBatchCall(
      arrayOfAPICalls,
      progress,
      httpHandler.bind(this)
    );
  }

  /**
   * Make one API call
   * @param {string} method - Method ID (e.g., 'events.get', 'streams.create')
   * @param {Object|Array} [params={}] - The params associated with this method
   * @param {string} [expectedKey] - If given, returns the value of this key or throws an error if not present
   * @returns {Promise<Object>} Promise resolving to the API result or the value of expectedKey
   * @throws {Error} If .error is present in the response or expectedKey is missing
   */
  async apiOne (method, params = {}, expectedKey) {
    const result = await this.api([{ method, params }]);
    if (
      result[0] == null ||
      result[0].error ||
      (expectedKey != null && result[0][expectedKey] == null)
    ) {
      const innerObject = result[0]?.error || result;
      throw new PryvError(
        `Error for api method: "${method}" with params: ${JSON.stringify(
          params
        )} >> Result: ${JSON.stringify(innerObject)}"`,
        innerObject
      );
    }
    if (expectedKey != null) return result[0][expectedKey];
    return result[0];
  }

  /**
   * Revoke : Delete the accessId
   * - Do not throw error if access is already revoked, just return null;
   * @param {boolean} [throwOnFail=true] - if set to false do not throw Error on failure
   * @param {Connection} [usingConnection] - specify which connection issues the revoke, might be necessary when selfRevoke
   * @returns {Promise<Object|null>} Promise resolving to deletion result or null if already revoked/failed
   */
  async revoke (throwOnFail = true, usingConnection) {
    usingConnection = usingConnection || this;
    let accessInfo = null;
    // get accessId
    try {
      accessInfo = await this.accessInfo();
    } catch (e) {
      if (e.response?.body?.error?.id === 'invalid-access-token') {
        return null; // Already revoked OK..
      }
      if (throwOnFail) throw e;
      return null;
    }
    // delete access
    try {
      const result = usingConnection.apiOne('accesses.delete', {
        id: accessInfo.id
      });
      return result;
    } catch (e) {
      if (throwOnFail) throw e;
      return null;
    }
  }

  /**
   * @private
   */
  async _chunkedBatchCall (arrayOfAPICalls, progress, callHandler) {
    if (!Array.isArray(arrayOfAPICalls)) {
      throw new Error('Connection.api() takes an array as input');
    }

    const res = [];
    let percent = 0;
    for (
      let cursor = 0;
      arrayOfAPICalls.length >= cursor;
      cursor += this.options.chunkSize
    ) {
      const thisBatch = [];
      const cursorMax = Math.min(
        cursor + this.options.chunkSize,
        arrayOfAPICalls.length
      );
      // copy only method and params into a back call to be exuted
      for (let i = cursor; i < cursorMax; i++) {
        thisBatch.push({
          method: arrayOfAPICalls[i].method,
          params: arrayOfAPICalls[i].params
        });
      }
      const resRequest = await callHandler(thisBatch);
      // result checks
      if (!resRequest || !Array.isArray(resRequest.results)) {
        throw new Error(
          'API call result is not an Array: ' + JSON.stringify(resRequest)
        );
      }
      if (resRequest.results.length !== thisBatch.length) {
        throw new Error(
          'API call result Array does not match request: ' +
            JSON.stringify(resRequest)
        );
      }

      // eventually call handleResult
      for (let i = 0; i < resRequest.results.length; i++) {
        if (arrayOfAPICalls[i + cursor].handleResult) {
          await arrayOfAPICalls[i + cursor].handleResult.call(
            null,
            resRequest.results[i],
            thisBatch[i] // request
          );
        }
      }
      Array.prototype.push.apply(res, resRequest.results);
      percent = Math.round((100 * res.length) / arrayOfAPICalls.length);
      if (progress) {
        progress(percent, res);
      }
    }
    return res;
  }

  /**
   * Post to API and return results
   * @param {string} path - API path
   * @param {(Array | Object)} data - Data to post
   * @returns {Promise<Object|Object[]>} Promise to result.body
   */
  async post (path, data) {
    const now = getTimestamp();
    const res = await this._postFetch(path, data);
    this._handleMeta(res.body, now);
    return res.body;
  }

  /**
   * @private
   * Post object as JSON to API
   * @param {string} path - API path
   * @param {Array | Object} data - Data to post as JSON
   * @returns {Promise<{response: Response, body: Object|Object[]}>} Promise to response and body
   */
  async _postFetch (path, data) {
    return this._postFetchRaw(path, JSON.stringify(data), 'application/json');
  }

  /**
   * @private
   * Raw Post to API
   * @param {string} path - API path
   * @param {any} data - Raw data to post
   * @param {string} [contentType] - Content-Type header (optional, allows fetch to set it for FormData)
   * @returns {Promise<{response: Response, body: Object|Object[]}>} Promise to response and body
   */
  async _postFetchRaw (path, data, contentType) {
    const headers = {
      Authorization: this.token,
      Accept: 'application/json'
    };
    // optional for form-data llowing fetch to
    // automatically set multipart/form-data with the correct boundary
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    const response = await fetch(this.endpoint + path, {
      method: 'POST',
      headers,
      body: data
    });
    const body = await response.json();
    return { response, body };
  }

  /**
   * GET from API and return results
   * @param {string} path - API path
   * @param {Object} [queryParams] - Query parameters
   * @returns {Promise<Object|Object[]>} Promise to result.body
   */
  async get (path, queryParams) {
    const now = getTimestamp();
    const res = await this._getFetchRaw(path, queryParams);
    this._handleMeta(res.body, now);
    return res.body;
  }

  /**
   * @private
   * Raw GET from API
   * @param {string} path - API path
   * @param {Object} [queryParams={}] - Query parameters
   * @returns {Promise<{response: Response, body: Object|Object[]}>} Promise to response and body
   */
  async _getFetchRaw (path, queryParams = {}) {
    path = path || '';
    let queryStr = '';
    if (queryParams && Object.keys(queryParams).length > 0) {
      queryStr = '?' + new URLSearchParams(queryParams).toString();
    }
    const response = await fetch(this.endpoint + path + queryStr, {
      headers: {
        Authorization: this.token,
        Accept: 'application/json'
      }
    });
    const body = await response.json();
    return { response, body };
  }

  /**
   * Add data points to an HF (High Frequency) series event (flatJSON format)
   * @param {string} eventId - The HF event ID
   * @param {string[]} fields - Array of field names for the series
   * @param {Array<Array<number|string>>} points - Array of data points, each point is an array of values
   * @returns {Promise<HFSeriesAddResult>} Promise resolving to status response
   * @see https://api.pryv.com/reference/#add-hf-series-data-points
   */
  async addPointsToHFEvent (eventId, fields, points) {
    const res = await this.post('events/' + eventId + '/series', {
      format: 'flatJSON',
      fields,
      points
    });
    if (res.status !== 'ok') {
      throw new Error('Failed loading serie: ' + JSON.stringify(res.status));
    }
    return res;
  }

  /**
   * Streamed get Event.
   * @see https://api.pryv.com/reference/#get-events
   * @param {Object} queryParams See `events.get` parameters
   * @param {Function} forEachEvent Function taking one event as parameter. Will be called for each event
   * @returns {Promise<Object>} Promise to result.body transformed with `eventsCount: {count}` replacing `events: [...]`
   */
  async getEventsStreamed (queryParams, forEachEvent) {
    const myParser = jsonParser(forEachEvent, queryParams.includeDeletions);
    const res = await libGetEventStreamed(this, queryParams, myParser);
    const now = getTimestamp();
    this._handleMeta(res.body, now);
    return res.body;
  }

  /**
   * Create an event with attached file
   * NODE.jS ONLY
   * @param {Event} event
   * @param {string} filePath
   */
  async createEventWithFile (event, filePath) {
    const fs = require('fs');
    const path = require('path');

    if (!fs || !path) {
      throw new Error('createEventWithFile is only available in Node.js. Use createEventWithFormData in browser.');
    }

    const fileName = path.basename(filePath);
    const mimeType = getMimeType(path.extname(filePath));
    const fileBlob = await fs.openAsBlob(filePath, { type: mimeType });

    const formData = new FormData();
    formData.append('event', JSON.stringify(event));
    formData.append('file', fileBlob, fileName);

    const now = getTimestamp();
    const { body } = await this._postFetchRaw('events', formData);
    this._handleMeta(body, now);
    return body;
  }

  /**
   * Create an event from a Buffer
   * @param {Object} event
   * @param {Buffer|Blob} bufferData - Buffer for node, Blob for browser
   * @param {string} filename
   */
  async createEventWithFileFromBuffer (event, bufferData, filename) {
    const mimeType = getMimeType(getExtname(filename));
    const fileBlob = bufferData instanceof Blob
      ? bufferData
      // @ts-ignore - Buffer is valid for Blob in Node.js
      : new Blob([bufferData], { type: mimeType });

    const formData = new FormData();
    formData.append('file', fileBlob, filename);
    const body = await this.createEventWithFormData(event, formData);
    return body;
  }

  /**
   * Create an event with attached formData
   * !! BROWSER ONLY
   * @param {Event} event
   * @param {FormData} formData https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
   */
  async createEventWithFormData (event, formData) {
    formData.append('event', JSON.stringify(event));
    const { body } = await this._postFetchRaw('events', formData);
    return body;
  }

  /**
   * Difference in seconds between the Pryv.io API and local time
   * deltaTime is refined at each (non-raw) API call
   * @readonly
   * @property {number} deltaTime
   */
  get deltaTime () {
    return this._deltaTime.value;
  }

  /**
   * API endpoint of this connection (includes token if present)
   * @readonly
   * @property {APIEndpoint} apiEndpoint
   */
  get apiEndpoint () {
    return utils.buildAPIEndpoint(this);
  }

  // private method that handle meta data parsing
  _handleMeta (res, requestLocalTimestamp) {
    if (!res.meta) throw new Error('Cannot find .meta in response.');
    if (!res.meta.serverTime) { throw new Error('Cannot find .meta.serverTime in response.'); }

    // update deltaTime and weight it
    this._deltaTime.value =
      (this._deltaTime.value * this._deltaTime.weight +
        res.meta.serverTime -
        requestLocalTimestamp) /
      ++this._deltaTime.weight;
  }
}

module.exports = Connection;

function getTimestamp () {
  return Date.now() / 1000;
}

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  '.tar': 'application/x-tar',
  '.txt': 'text/plain',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime'
};

function getMimeType (ext) {
  return MIME_TYPES[ext.toLowerCase()] || 'application/octet-stream';
}

function getExtname (filename) {
  const lastDot = filename.lastIndexOf('.');
  return lastDot >= 0 ? filename.slice(lastDot) : '';
}

// service is require "after" to allow circular require
const Service = require('./Service');

/**
 * API Method call, for batch call https://api.pryv.com/reference/#call-batch
 * @typedef {Object} MethodCall
 * @property {string} method - The method id
 * @property {(Object|Array)}  params - The call parameters as required by the method.
 * @property {(Function|Promise)} [handleResult] - Will be called with the result corresponding to this specific call.
 */
