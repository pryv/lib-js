
const utils = require('./utils.js');
const Connection = require('./Connection.js');
const Assets = require('./ServiceAssets.js');

/**
 * @class Service
 * Holds Pryv Service informations
 *
 *
 * @property {TokenAndEndpoint} tokenAndApi
 * @memberof Pryv
 * 
 * @constructor
 * @this {Service} 
 * @param {string|PryvServiceInfo} serviceInfoUrlOrDefinition Url point to /service/info of a Pryv platform: https://api.pryv.com/reference/#service-info
 */
class Service {

  constructor(serviceInfoUrlOrDefinition) {
    this._pryvServiceInfo = null;
    this._assets = null;

    if (typeof serviceInfoUrlOrDefinition === 'string') {
      this._pryvServiceInfoUrl = serviceInfoUrlOrDefinition;
    } else {
      this.setSerivceInfo(serviceInfoUrlOrDefinition);
    }
  }

  /**
   * Return service info parameters info known of fetch it if needed.
   * @param {boolean?} forceFetch If true, will force fetching service info.
   * @returns {Promise<PryvServiceInfo>} Promise to Service info Object
   */
  async info(forceFetch) {
    if (!forceFetch && this._pryvServiceInfo) {
      return this._pryvServiceInfo;
    } else {
      if (!this._pryvServiceInfoUrl) {
        throw new Error('Service was not initialized with a serviceInfoURL');
      }
      const res = await utils.superagent.get(this._pryvServiceInfoUrl).set('accept', 'json');
      this.setSerivceInfo(res.body);
      return this._pryvServiceInfo;
    }
  }

  /**
   * @private
   * @param {PryvServiceInfo} serviceInfo
   */
  setSerivceInfo(serviceInfo) {
    if (!serviceInfo.name) {
      throw new Error('Invalid data from service/info');
    }
    this._pryvServiceInfo = serviceInfo;
  }

  /**
   * Return assets property content
   * @param {boolean?} forceFetch If true, will force fetching service info.
   * @returns {Promise<ServiceAssets>} Promise to ServiceAssets 
   */
  async assets(forceFetch) {
    if (!forceFetch && this._assets) {
      return this._assets;
    } else {
      const serviceInfo = await this.info();
      if (!serviceInfo.assets || !serviceInfo.assets.definitions) {
        console.log('Warning: no assets for this service');
        return null;
      }
      this._assets = await Assets.setup(serviceInfo.assets.definitions);
      return this._assets;
    }
  }

  /**
   * Return service info parameters info known or null if not yet loaded
   * @returns {PryvServiceInfo} Service Info definition
   */
  infoSync() {
    return this._pryvServiceInfo;
  }


  /**
   * Return an API Endpoint from a username and token
   * @param {string} username
   * @param {string} [token]
   * @return {PryvApiEndpoint}
   */
  async apiEndpointFor(username, token) {
    const serviceInfo = await this.info();
    return Service.buildAPIEndpoint(serviceInfo, username, token);
  }

  /**
   * Return an API Endpoint from a username and token and a PryvServiceInfo
   * @param {PryvServiceInfo} serviceInfo
   * @param {string} username
   * @param {string} [token]
   * @return {PryvApiEndpoint}
   */
  static buildAPIEndpoint(serviceInfo, username, token) {
    const endpoint = serviceInfo.api.replace('{username}', username);
    return utils.buildPryvApiEndPoint({ endpoint: endpoint, token: token });
  }

  /**
   * Issue a "login call on the Service" return a Connection on success
   * ! Warning the token of the connection will be a "Personal" token that expires
   * @see https://api.pryv.com/reference-full/#login-user
   * @param {string} username 
   * @param {string} password 
   * @param {string} appId 
   * @param {string} [forceOriginHeader=service-info.register] Only for Node.js. If not set will use the register value of service info. Exemple "sw.pryv.me"
   * @throws {Error} on invalid login
   */
  async login(username, password, appId, forceOriginHeader) {
    let originHeader = forceOriginHeader || (await this.info()).register;
    const apiEndPoint = await this.apiEndpointFor(username);

    try {
      const res = await utils.superagent.post(apiEndPoint + 'auth/login')
        .set('Origin', originHeader)
        .set('accept', 'json')
        .send({ username: username, password: password, appId: appId });

      if (!res.body.token) {
        throw new Error('Invalid login response: ' 
        + res.body);
      }
      return new Connection(
        Service.buildAPIEndpoint(await this.info(), username, res.body.token));
    } catch (e) {
      if (e.response && e.response.body 
        && e.response.body.error
        && e.response.body.error.message) {
        throw new Error(e.response.body.error.message)
        }
    }
  }

}

module.exports = Service;

/**
 * Object to handle Pryv Service Informations https://api.pryv.com/reference/#service-info
 * @typedef {Object} PryvServiceInfo
 * @property {string} register The URL of the register service.
 * @property {string} access The URL of the access page.
 * @property {string} api The API endpoint format.
 * @property {string} name The platform name.
 * @property {string} home The URL of the platform's home page.
 * @property {string} support The email or URL of the support page.
 * @property {string} terms The terms and conditions, in plain text or the URL displaying them.
 * @property {string} eventTypes The URL of the list of validated event types.
 * @property {Object} [assets] Holder for service specific Assets (icons, css, ...)
 * @property {String} [assets.definitions] URL to json object with assets definitions
 */
