const Messages = {
  LOADING: {
    'en': '...'
  },
  ERROR: {
    'en': 'Error',
    'fr': 'Erreur',
  },
  LOGIN: {
    'en': 'Signin',
    'fr': 'Login'
  },
  LOGOUT_CONFIRM: {
    'en': 'Logout ?',
    'fr': 'Se deconnecter ?'
  }
}


function get(languageCode, definitions) {
  const myMessages = definitions || Messages;
  const res = {};
  Object.keys(myMessages).map((key) => {
    res[key] = myMessages[key][languageCode] || myMessages[key]['en'];
  });
  return res;
}


module.exports = get;