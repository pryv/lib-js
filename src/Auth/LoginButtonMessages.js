const Messages = {
  LOADING: {
    'en': '...'
  },
  ERROR: {
    'en': 'Error'
  },
  LOGIN: {
    'en': 'Login'
  },
  LOGOUT_CONFIRM: {
    'en': 'Logout ?'
  }
}



function get(languageCode) { 
  const res = {};
  Object.keys(Messages).map((key) => {
    res[key] = Messages[key][languageCode] || Messages[key]['en'];
  });
  return res;
}

module.exports = get;