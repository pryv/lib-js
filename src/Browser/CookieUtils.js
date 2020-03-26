


function isBrowser() {
  return typeof window !== 'undefined';
}



function set(cookieKey, value, expireInDays) {
  if (! isBrowser()) return;
  expireInDays = expireInDays || 365;
  var myDate = new Date();
  var hostName = window.location.hostname;
  var path = window.location.pathname;
  myDate.setDate(myDate.getDate() + expireInDays);
  var cookieStr = encodeURIComponent(cookieKey) + '=' + encodeURIComponent(JSON.stringify(value))
    + ';expires=' + myDate.toGMTString()
    + ';domain=.' + hostName + ';path=' + path;
    // do not add SameSite when removing a cookie
  if (expireInDays >= 0) cookieStr += ';SameSite=Strict';
  document.cookie = cookieStr;
}
exports.set = set;

exports.get = function get(cookieKey) {
  const name = encodeURIComponent(cookieKey);
  if (!isBrowser()) return;
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return JSON.parse(decodeURIComponent(parts.pop().split(";").shift()));
}

exports.del = function del(cookieKey) {
  set(cookieKey, {deleted: true}, -1);
}