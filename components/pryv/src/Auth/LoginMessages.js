/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
module.exports = get;

const Messages = {
  LOADING: {
    en: '...'
  },
  ERROR: {
    en: 'Error',
    fr: 'Erreur'
  },
  LOGIN: {
    en: 'Signin',
    fr: 'Login'
  },
  SIGNOUT_CONFIRM: {
    en: 'Logout?',
    fr: 'Se déconnecter ?'
  },
  MENU_TITLE: {
    en: 'Account',
    fr: 'Compte'
  },
  LOGOUT: {
    en: 'Log out',
    fr: 'Se déconnecter'
  },
  MANAGE_ACCOUNT: {
    en: 'Manage my account',
    fr: 'Gérer mon compte'
  },
  APP: {
    en: 'app',
    fr: 'app'
  },
  CLOSE: {
    en: 'Close',
    fr: 'Fermer'
  }
};

/**
 * Messages for a language. `definitions` (a service's own messages) override
 * the defaults key by key, so a key the service does not define still has
 * its default text.
 */
function get (languageCode, definitions) {
  const myMessages = Object.assign({}, Messages, definitions || {});
  const res = {};
  Object.keys(myMessages).forEach((key) => {
    res[key] = myMessages[key][languageCode] || myMessages[key].en;
  });
  return res;
}
