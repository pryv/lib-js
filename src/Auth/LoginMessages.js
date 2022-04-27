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
  }
};

function get (languageCode, definitions) {
  const myMessages = definitions || Messages;
  const res = {};
  Object.keys(myMessages).forEach((key) => {
    res[key] = myMessages[key][languageCode] || myMessages[key].en;
  });
  return res;
}
