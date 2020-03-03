
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
 * @param {string} pryvServiceInfoUrl Url point to /service/info of a Pryv platform: https://api.pryv.com/reference/#service-info
 */
class Service {

  constructor(pryvServiceInfoUrl) {
    this._pryvServiceInfoUrl = pryvServiceInfoUrl;
    this._pryvServiceInfo = null;
    this._assets = null;
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
      const res = await utils.superagent.get(this._pryvServiceInfoUrl).set('accept', 'json');
      this._pryvServiceInfo = res.body;
      if (!this._pryvServiceInfo.name) {
        throw new Error('Invalid data from service/info');
      }
      return this._pryvServiceInfo;
    }
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
   */
  async login(username, password, appId, forceOriginHeader) {
    let originHeader = forceOriginHeader || (await this.info()).register;
    const apiEndPoint = await this.apiEndpointFor(username);

    const res = await utils.superagent.post(apiEndPoint + 'auth/login')
      .set('Origin', originHeader)
      .set('accept', 'json')
      .send({ username: username, password: password, appId: appId });

    if (!res.body.token) {
      throw new Error('Failed login: ' + res.body);
    }
    return new Connection(
      Service.buildAPIEndpoint(await this.info(), username, res.body.token));
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
 */
