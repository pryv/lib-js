/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, after, expect, JSDOM */

const { buildButton } = require('../src/Browser/buttonHtml');
const LoginButton = require('../src/Browser/LoginButton');
const AuthController = require('../src/Auth/AuthController');
const AuthStates = require('../src/Auth/AuthStates');
const Browser = require('../src/Browser');
const utils = require('../src/utils');

const STOCK = `<div id="pryv-access-btn" class="pryv-access-btn-signin">
  <span class="pryv-access-btn pryv-access-btn-pryv-access-color"><span class="logoSignin">Y</span></span>
  <span class="pryv-access-btn pryv-access-btn-pryv-access-color"><span id="pryv-access-btn-text"></span></span>
</div>
`;
const MARKUP = '<img src="x" onerror="window.__pwned=1">';

describe('[BHTX] sign-in button, content from the service', function () {
  let doc, warn;
  const warnings = [];

  before(() => {
    doc = typeof document !== 'undefined' ? document : new JSDOM('<!DOCTYPE html><body></body>', { url: 'http://localhost/' }).window.document;
    warn = console.warn;
    console.warn = (m) => warnings.push(m);
  });
  after(() => { console.warn = warn; });

  function built (html) {
    const div = doc.createElement('div');
    const { fragment, textHolder } = buildButton(html, doc);
    div.appendChild(fragment);
    return { div, textHolder };
  }

  describe('[BHAX] HTML of the button', () => {
    it('[BHAA] the stock button comes out identical, without a warning', () => {
      warnings.length = 0;
      const { div, textHolder } = built(STOCK);
      expect(div.innerHTML).to.equal(STOCK);
      expect(textHolder.id).to.equal('pryv-access-btn-text');
      expect(warnings).to.deep.equal([]);
    });

    it('[BHAB] active content is removed, structure is kept, and it is said', () => {
      warnings.length = 0;
      const { div } = built(`<script>1</script>${MARKUP}<iframe src="https://x"></iframe><svg onload="1"><a href="https://x">s</a></svg>
        <a href="javascript:1" class="k">link</a><style>p{}</style><form action="/x"><input name="i"></form>
        <img src="javascript:1"><img src="data:image/png;base64,AA=="><img src="https://x.y/logo.png" alt="logo" srcset="https://x.y/2.png 2x">
        <div id="console" data-x="1" onclick="1" aria-label="l" style="color: red">t</div><math><mi>m</mi></math>
        <button formaction="javascript:1">b</button><p id="pryv-access-btn-text" title="t"></p><!-- c -->`);
      for (const tag of ['script', 'iframe', 'svg', 'style', 'form', 'input', 'math']) expect(div.querySelector(tag), tag).to.equal(null);
      const attributes = new Set(Array.from(div.querySelectorAll('*')).flatMap((e) => Array.from(e.attributes).map((a) => a.name)));
      expect(Array.from(attributes).sort()).to.deep.equal(['alt', 'aria-label', 'class', 'id', 'src', 'style', 'title', 'type']);
      expect(Array.from(div.querySelectorAll('[src]')).map((e) => e.getAttribute('src'))).to.deep.equal(['x', 'https://x.y/logo.png']);
      expect(Array.from(div.querySelectorAll('[id]')).map((e) => e.id)).to.deep.equal(['pryv-access-btn-text']);
      expect(div.querySelector('button').getAttribute('type')).to.equal('button');
      expect(div.innerHTML).to.not.include('<!--');
      expect(warnings.join()).to.match(/<script>.*onerror/);
    });

    it('[BHAC] without a usable text element the built-in button is shown', () => {
      for (const html of ['', '<b>no holder</b>', '<form><span id="pryv-access-btn-text"></span></form>']) {
        const { div, textHolder } = built(html);
        expect(textHolder.id, html).to.equal('pryv-access-btn-text');
        expect(div.querySelector('#pryv-access-btn').contains(textHolder), html).to.equal(true);
      }
    });
  });

  describe('[BHBX] text and URLs', () => {
    let cleanup = false;
    const saved = {};

    before(() => {
      if (typeof document !== 'undefined') return;
      cleanup = true;
      const dom = new JSDOM('<!DOCTYPE html><body><span id="bhSpan"></span></body>', { url: 'http://localhost/' });
      Object.assign(global, { document: dom.window.document, window: dom.window, location: dom.window.location });
    });
    after(() => {
      if (!cleanup) return;
      for (const k of ['document', 'window', 'location']) delete global[k];
    });

    function button (assetsHtml) {
      let span = document.getElementById('bhSpan');
      if (span == null) {
        span = document.createElement('span');
        span.id = 'bhSpan';
        document.body.appendChild(span);
      }
      const service = {
        infoSync: () => ({ name: MARKUP, access: 'https://x.y/access' }),
        info: async () => ({ name: MARKUP, access: 'https://x.y/access' }),
        assets: async () => ({ loginButtonGetHTML: async () => assetsHtml, loginButtonLoadCSS: async () => {}, loginButtonGetMessages: async () => ({}) })
      };
      return new LoginButton({ spanButtonID: 'bhSpan', authRequest: { requestingAppId: 'bh-test', requestedPermissions: [] } }, service);
    }

    it('[BHBA] the service HTML is filtered, then names, usernames and messages are text', async () => {
      const b = button(MARKUP + '<span id="pryv-access-btn-text"></span>');
      await b.init();
      const span = document.getElementById('bhSpan');
      expect(span.querySelector('img').hasAttribute('onerror')).to.equal(false);
      const states = [
        { status: AuthStates.INITIALIZED },
        { status: AuthStates.ERROR, message: MARKUP },
        { status: AuthStates.AUTHORIZED, profile: { username: MARKUP } },
        { status: AuthStates.AUTHORIZED, profile: { username: 'a', actingAs: { delegate: MARKUP } } }
      ];
      for (const state of states) {
        await b.onStateChange(state);
        expect(b.loginButtonText.children.length, state.status).to.equal(0);
        expect(b.loginButtonText.textContent, state.status).to.include(MARKUP);
      }
    });

    it('[BHBB] an auth URL that is not http(s) is an error: nothing is opened', async () => {
      saved.fetchPost = utils.fetchPost;
      const opened = [];
      const open = window.open;
      window.open = (u) => { opened.push(u); return null; };
      try {
        for (const answer of [{ authUrl: 'javascript:alert(1)' }, { url: 'data:text/html,x' }]) {
          for (const returnURL of [undefined, 'self#']) {
            utils.fetchPost = async () => ({ response: { ok: true }, body: { status: AuthStates.NEED_SIGNIN, key: 'k', poll: 'https://x.y/poll', ...answer } });
            const b = button(STOCK);
            await b.init();
            b.authSettings.authRequest.returnURL = returnURL;
            const states = [];
            b.auth.stateChangeListeners.push((s) => states.push(s));
            await b.auth.startAuthRequest().then(() => expect.fail('must reject'), (e) => expect(e.id).to.equal('invalid-auth-url'));
            expect(states.map((s) => s.status)).to.deep.equal([AuthStates.ERROR]);
            expect(states[0].error.id).to.equal('invalid-auth-url');
          }
        }
        expect(opened).to.deep.equal([]);
      } finally {
        utils.fetchPost = saved.fetchPost;
        window.open = open;
      }
    });

    it('[BHBC] an account URL that is not http(s) is unknown', () => {
      const url = (account) => AuthController.prototype.accountUrl.call({ settings: {}, serviceInfo: { account } });
      expect(url('javascript:alert(1)//')).to.equal(null);
      expect(url('')).to.equal(null);
      expect(url('/own')).to.equal('/own/account/profile'); // of the page itself
      expect(url('https://account.x.y/')).to.equal('https://account.x.y/account/profile');
    });

    it('[BHBD] serviceInfoFromUrl() answers http(s) URLs only, and only the allowed ones when given', () => {
      const from = (value, options) => Browser.serviceInfoFromUrl('https://app.x.y/?pryvServiceInfoUrl=' + encodeURIComponent(value), options);
      for (const bad of ['javascript:alert(1)', 'not a url', '/relative', '']) expect(from(bad), bad).to.equal(undefined);
      expect(from('https://reg.x.y/service/info')).to.equal('https://reg.x.y/service/info');
      const options = { allowedServiceInfoUrls: ['https://reg.x.y/service/info'] };
      expect(from('https://REG.x.y:443/service/info', options)).to.equal('https://REG.x.y:443/service/info');
      expect(from('https://reg.x.y/service/info/../evil', options)).to.equal(undefined);
      expect(from('https://evil.x.y/service/info', options)).to.equal(undefined);
      expect(from('https://reg.x.y/service/info', { allowedServiceInfoUrls: [] })).to.equal(undefined);
    });
  });
});
