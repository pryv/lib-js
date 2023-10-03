/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
const utils = require('./utils.js');
// Connection is required at the end of this file to allow circular requires.
const Assets = require('./ServiceAssets.js');

/**
 * @class pryv.Service
 * A Pryv.io deployment is a unique "Service", as an example **Pryv Lab** is a service, deployed with the domain name **pryv.me**.
 *
 * `pryv.Service` exposes tools to interact with Pryv.io at a "Platform" level.
 *
 *  ##### Initizalization with a service info URL
```js
const service = new pryv.Service('https://reg.pryv.me/service/info');
```

- With the content of a serviceInfo configuration

Service information properties can be overriden with specific values. This might be usefull to test new designs on production platforms.

```js
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const serviceCustomizations = {
  name: 'Pryv Lab 2',
  assets: {
    definitions: 'https://pryv.github.io/assets-pryv.me/index.json'
  }
}
const service = new pryv.Service(serviceInfoUrl, serviceCustomizations);
```

 * @memberof pryv
 *
 * @constructor
 * @param {string} serviceInfoUrl Url point to /service/info of a Pryv platform see: {@link https://api.pryv.com/reference/#service-info}
 */
class Service {
  constructor (serviceInfoUrl, serviceCustomizations) {
    this._serviceInfo = null;
    this._assets = null;
    this._polling = false;
    this._serviceInfoUrl = serviceInfoUrl;
    this._pryvServiceCustomizations = serviceCustomizations;
  }

  /**
   * Return service info parameters info known of fetch it if needed.
   * Example
   *  - name of a platform
   *    `const serviceName = await service.info().name`
   * @see ServiceInfo For details on available properties.
   * @param {boolean?} forceFetch If true, will force fetching service info.
   * @returns {Promise<ServiceInfo>} Promise to Service info Object
   */
  async info (forceFetch) {
    if (forceFetch || !this._serviceInfo) {
      let baseServiceInfo = {};
      if (this._serviceInfoUrl) {
        const res = await utils.superagent.get(this._serviceInfoUrl).set('Access-Control-Allow-Origin', '*').set('accept', 'json');
        baseServiceInfo = res.body;
      }
      Object.assign(baseServiceInfo, this._pryvServiceCustomizations);
      this.setServiceInfo(baseServiceInfo);
    }
    return this._serviceInfo;
  }

  /**
   * Check if a service supports High Frequency Data Sets
   * @return true if yes
   */
  async supportsHF () {
    const infos = await this.info();
    return (infos.features == null || infos.features.noHF !== true);
  }

  /**
   * Check if a service has username in the hostname or in the path of the api
   * @return true if the service does not rely on DNS to find a host related to a username
   */
  async isDnsLess () {
    const infos = await this.info();
    const hostname = infos.api.split('/')[2];
    console.log('XXXXX', hostname);
    return !hostname.includes('{username}');
  }

  /**
   * @private
   * @param {ServiceInfo} serviceInfo
   */
  setServiceInfo (serviceInfo) {
    if (!serviceInfo.name) {
      throw new Error('Invalid data from service/info');
    }
    // cleanup serviceInfo for eventual url not finishing by "/"
    // code will be obsolete with next version of register
    ['access', 'api', 'register'].forEach((key) => {
      if (serviceInfo[key].slice(-1) !== '/') {
        serviceInfo[key] += '/';
      }
    });
    this._serviceInfo = serviceInfo;
  }

  /**
   * Return assets property content
   * @param {boolean?} forceFetch If true, will force fetching service info.
   * @returns {Promise<ServiceAssets>} Promise to ServiceAssets
   */
  async assets (forceFetch) {
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
   * @returns {ServiceInfo} Service Info definition
   */
  infoSync () {
    return this._serviceInfo;
  }

  /**
   * Return an API endpoint from a username and token
   * @param {string} username
   * @param {string} [token]
   * @return {APIEndpoint}
   */
  async apiEndpointFor (username, token) {
    const serviceInfo = await this.info();
    return Service.buildAPIEndpoint(serviceInfo, username, token);
  }

  /**
   * Return an API endpoint from a username and token and a ServiceInfo.
   * This is method is rarely used. See **apiEndpointFor** as an alternative.
   * @param {ServiceInfo} serviceInfo
   * @param {string} username
   * @param {string} [token]
   * @return {APIEndpoint}
   */
  static buildAPIEndpoint (serviceInfo, username, token) {
    const endpoint = serviceInfo.api.replace('{username}', username);
    return utils.buildAPIEndpoint({ endpoint: endpoint, token: token });
  }

  /**
   * Issue a "login call on the Service" return a Connection on success
   * **! Warning**: the token of the connection will be a "Personal" token that expires
   * @see https://api.pryv.com/reference-full/#login-user
   * @param {string} username
   * @param {string} password
   * @param {string} appId
   * @param {string} [originHeader=service-info.register] Only for Node.js. If not set will use the register value of service info. In browsers this will overridden by current page location.
   * @throws {Error} on invalid login
   */
  async login (username, password, appId, originHeader) {
    const apiEndpoint = await this.apiEndpointFor(username);

    try {
      const headers = { accept: 'json' };
      originHeader = originHeader || (await this.info()).register;
      if (!utils.isBrowser()) {
        headers.Origin = originHeader;
      }
      const res = await utils.superagent.post(apiEndpoint + 'auth/login')
        .set(headers)
        .send({ username: username, password: password, appId: appId });

      if (!res.body.token) {
        throw new Error('Invalid login response: ' + res.body);
      }
      return new Connection(
        Service.buildAPIEndpoint(await this.info(), username, res.body.token),
        this // Pre load Connection with service
      );
    } catch (e) {
      if (e.response &&
          e.response.body &&
          e.response.body.error &&
          e.response.body.error.message) {
        throw new Error(e.response.body.error.message);
      }
      throw (e);
    }
  }
}

module.exports = Service;

// Require is done after exports to allow circular references
const Connection = require('./Connection');

/**
 * Object to handle Pryv Service Informations https://api.pryv.com/reference/#service-info
 * @typedef {Object} ServiceInfo
 * @property {string} register The URL of the register service.
 * @property {string} access The URL of the access page.
 * @property {string} api The API endpoint format.
 * @property {string} name The platform name.
 * @property {string} home The URL of the platform's home page.
 * @property {string} support The email or URL of the support page.
 * @property {string} terms The terms and conditions, in plain text or the URL displaying them.
 * @property {string} eventTypes The URL of the list of validated event types.
 * @property {Object} [assets] Holder for service specific Assets (icons, css, ...)
 * @property {String} [assets.definitions] URL to json object with assets definitions
 */
