

function set(cookieKey, value, expireInDays) {
  expireInDays = expireInDays || 365;
  var myDate = new Date();
  var hostName = window.location.hostname;
  var path = window.location.pathname;
  myDate.setDate(myDate.getDate() + expireInDays);
  var cookieStr = cookieKey + "=" + encodeURIComponent(JSON.stringify(value))
    + ";expires=" + myDate.toGMTString()
    + ';domain=.' + hostName + ';path=' + path;
  console.log('Set Cookie:' + cookieStr);
  document.cookie = cookieStr;
}
exports.set = set;

exports.get = function get(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return JSON.parse(decodeURIComponent(parts.pop().split(";").shift()));
}

exports.del = function del(name) {
  set(name, '', -1);
}