const Messages = {
  LOADING: {
    'en': '...'
  },
  ERROR: {
    'en': 'Error'
  },
  LOGIN: {
    'en': 'Login'
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