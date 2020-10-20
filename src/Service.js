
const utils = require('./utils.js');
// Connection is required at the end of this file to allow circular requires.
const Assets = require('./ServiceAssets.js');
const Cookies = require('./Browser/CookieUtils');
const AuthStates = require('./Auth/AuthStates');
const Messages = require('./Browser/LoginButtonMessages');
const { getStore } = require('./Auth/AuthStore');

/**
 * @class Pryv.Service
 * A Pryv.io deployment is a unique "Service", as an example **Pryv Lab** is a service, deployed with the domain name **pryv.me**.
 * 
 * `Pryv.Service` exposes tools to interact with Pryv.io at a "Platform" level. 
 *
 *  ##### Initizalization with a service info URL
```javascript
const service = new Pryv.Service('https://reg.pryv.me/service/info');
```

- With the content of a serviceInfo configuration

Service information properties can be overriden with specific values. This might be usefull to test new designs on production platforms.

```javascript
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const serviceCustomizations = {
  name: 'Pryv Lab 2',
  assets: {
    definitions: 'https://pryv.github.io/assets-pryv.me/index.json'
  }
}
const service = new Pryv.Service(serviceInfoUrl, serviceCustomizations);
``` 

 * @memberof Pryv
 * 
 * @constructor
 * @param {string} serviceInfoUrl Url point to /service/info of a Pryv platform see: {@link https://api.pryv.com/reference/#service-info}
 */
class Service {

  constructor (serviceInfoUrl, serviceCustomizations, appId) {
    this._pryvServiceInfo = null;
    this._assets = null;
    this._polling = false;
    this._pryvServiceInfoUrl = serviceInfoUrl;
    this._pryvServiceCustomizations = serviceCustomizations;

    this.store = getStore();
    // if appId is set, build the cookieKey
    if (appId != null) {
      const COOKIE_STRING = 'pryv-libjs-';
      this._cookieKey = COOKIE_STRING + appId;
    }
    this.store.messages = Messages(this.store.languageCode);
  }

  /**
   * Return service info parameters info known of fetch it if needed.
   * Example   
   *  - name of a platform   
   *    `const serviceName = await service.info().name` 
   * @see PryvServiceInfo For details on available properties.
   * @param {boolean?} forceFetch If true, will force fetching service info.
   * @returns {Promise<PryvServiceInfo>} Promise to Service info Object
   */
  async info (forceFetch) {
    if (forceFetch || !this._pryvServiceInfo) {
      let baseServiceInfo = {};
      if (this._pryvServiceInfoUrl) {
        const res = await utils.superagent.get(this._pryvServiceInfoUrl).set('Access-Control-Allow-Origin', '*').set('accept', 'json');
        baseServiceInfo = res.body;
      }
      Object.assign(baseServiceInfo, this._pryvServiceCustomizations);
      this.setServiceInfo(baseServiceInfo);
    }
    return this._pryvServiceInfo;
  }

  /**
   * @private
   * @param {PryvServiceInfo} serviceInfo
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
    this._pryvServiceInfo = serviceInfo;
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
   * @returns {PryvServiceInfo} Service Info definition
   */
  infoSync () {
    return this._pryvServiceInfo;
  }

  /**
   * Return an API Endpoint from a username and token
   * @param {string} username
   * @param {string} [token]
   * @return {PryvApiEndpoint}
   */
  async apiEndpointFor (username, token) {
    const serviceInfo = await this.info();
    return Service.buildAPIEndpoint(serviceInfo, username, token);
  }

  /**
   * Return an API Endpoint from a username and token and a PryvServiceInfo. 
   * This is method is rarely used. See **apiEndpointFor** as an alternative.
   * @param {PryvServiceInfo} serviceInfo
   * @param {string} username
   * @param {string} [token]
   * @return {PryvApiEndpoint}
   */
  static buildAPIEndpoint (serviceInfo, username, token) {
    const endpoint = serviceInfo.api.replace('{username}', username);
    return utils.buildPryvApiEndpoint({ endpoint: endpoint, token: token });
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
      if (e.response && e.response.body
        && e.response.body.error
        && e.response.body.error.message) {
        throw new Error(e.response.body.error.message)
      }
    }
  }

  /**
   * Start pulling the access url until user signs in
   */
  async startAuthRequest () {
    if (this._polling) {
      return;
    }
    await this._poll();
  }

  /**
   * Keeps running authRequest until it gets the status
   * not equal to NEED_SIGNIN and then updates authController state
   * 
   * @param {AuthController} auth 
   * @private
   */
  async _poll () {
    if (this.store.accessData.status != 'NEED_SIGNIN') {
      this._polling = false;
      return;
    }
    this._polling = true;
    this.processAccess(await this.getAccess());
    setTimeout(await this._poll.bind(this), this.store.accessData.poll_rate_ms);
  }

  stopAuthRequest () {
    this.store.accessData = { status: 'ERROR' };
  }

  /**
  * @private
  */
  async getAccess () {
    let res;
    try {
      res = await utils.superagent
        .get(this.store.accessData.poll)
        .set('accept', 'json');
    } catch (e) {
      return { status: 'ERROR' }
    }
    return res.body;
  }

  processAccess (accessData) {
    if (!accessData || !accessData.status) {
      this.store.setState({
        id: AuthStates.ERROR,
        message: 'Invalid Access data response',
        error: new Error('Invalid Access data response')
      });
      throw this.store.state.error;
    }
    this.store.accessData = accessData;
    switch (this.store.accessData.status) {
      case 'ERROR':
        this.store.setState({
          id: AuthStates.ERROR,
          message: 'Error on the backend, please refresh'
        });
        break;
      case 'ACCEPTED':
        const apiEndpoint =
          Service.buildAPIEndpoint(
            this._pryvServiceInfo,
            this.store.accessData.username,
            this.store.accessData.token
          );

        Cookies.set(this._cookieKey,
          {
            apiEndpoint: apiEndpoint,
            displayName: this.store.accessData.username
          });

        this.store.setState({
          id: AuthStates.AUTHORIZED,
          apiEndpoint: apiEndpoint,
          displayName: this.store.accessData.username
        });
        break;
    }
  }

  getAccessData () {
    return this.store.accessData;
  }

  /**
   * Only for simulation of the successful response
   * @param {*} accessData 
   */
  setAccessData (accessData) {
    this.store.accessData = accessData;
  }

  getCurrentCookieInfo () {
    return Cookies.get(this._cookieKey);
  }

  async deleteCurrentAuthInfo () {
    Cookies.del(this._cookieKey);
    this.store.accessData = null;
  }

  getErrorMessage () {
    return this.store.messages.ERROR + ': ' + this.store.state.message;
  }

  getLoadingMessage () {
    return this.store.messages.LOADING;
  }

  getInitializedMessage () {
    return this.store.messages.LOGIN + ': ' + this._pryvServiceInfo.name;
  }

  getAuthorizedMessage () {
    return this.store.state.displayName;
  }

  defaultOnStateChange () {
    let text = '';
    switch (this.store.state.id) {
      case AuthStates.ERROR:
        text = this.getErrorMessage();
        break;
      case AuthStates.LOADING:
        text = this.getLoadingMessage();
        break;
      case AuthStates.INITIALIZED:
        text = this.getInitializedMessage();
        break;
      case AuthStates.AUTHORIZED:
        text = this.getAuthorizedMessage();
        break;
      default:
        console.log('WARNING Unhandled state for Login: ' + this.store.state.id);
    }
    return text;
  }

  getAssets () {
    return this.store.assets;
  }
}

module.exports = Service;

// Require is done after exports to allow circular references
const Connection = require('./Connection');

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
