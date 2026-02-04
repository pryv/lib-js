/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, expect */

const Messages = require('../src/Auth/LoginMessages');

describe('[MSGX] LoginMessages', function () {
  it('[MSGA] returns English messages by default', function () {
    const msgs = Messages('en');
    expect(msgs.LOADING).to.equal('...');
    expect(msgs.ERROR).to.equal('Error');
    expect(msgs.LOGIN).to.equal('Signin');
    expect(msgs.SIGNOUT_CONFIRM).to.equal('Logout?');
  });

  it('[MSGB] returns French messages when available', function () {
    const msgs = Messages('fr');
    expect(msgs.ERROR).to.equal('Erreur');
    expect(msgs.LOGIN).to.equal('Login');
    expect(msgs.SIGNOUT_CONFIRM).to.equal('Se déconnecter ?');
  });

  it('[MSGC] falls back to English for unavailable language', function () {
    const msgs = Messages('de');
    expect(msgs.LOADING).to.equal('...');
    expect(msgs.ERROR).to.equal('Error');
  });

  it('[MSGD] uses custom definitions when provided', function () {
    const customDefs = {
      LOADING: { en: 'Loading...', fr: 'Chargement...' },
      CUSTOM: { en: 'Custom Message', fr: 'Message personnalisé' }
    };
    const msgs = Messages('en', customDefs);
    expect(msgs.LOADING).to.equal('Loading...');
    expect(msgs.CUSTOM).to.equal('Custom Message');
  });

  it('[MSGE] custom definitions fall back to English', function () {
    const customDefs = {
      TEST: { en: 'English only' }
    };
    const msgs = Messages('fr', customDefs);
    expect(msgs.TEST).to.equal('English only');
  });
});
