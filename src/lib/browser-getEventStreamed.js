
/**
 * @private
 * Replacement for getEventStreamed for Browser
 * To be used as long as superagent does not propose it.
 * 
 */
async function getEventStreamed(conn, queryParam, parser) {

  /**
   * Holds Parser's settings
   */
  const parserSettings = {
    ondata: null,
    onend: null,
    encoding: 'utf8'
  }

  /**
   * Mock Response
   */
  const fakeRes = {
    setEncoding : function(encoding) {
      parserSettings.encoding = encoding;
    }, // will receive 'data' and 'end' callbacks
    on: function(key, f) { 
      parserSettings['on' + key] = f;
    }
  }

  /**
   * Holds results from the parser
   */
  let errResult;
  let bodyObjectResult;
  /**
   * 
   */
  parser(fakeRes, function (err, bodyObject) { 
    errResult = err;
    bodyObjectResult = bodyObject;
  });


  // ------------   fetch ------------------- //
  let url = new URL(conn.endpoint + 'events');
  url.search = new URLSearchParams(queryParam);
  let fetchParams = {method: 'GET', headers: {Accept: 'application/jon'}};
  if (conn.token) fetchParams.headers.Authorization = conn.token;

  let response = await fetch(url,fetchParams);
  const reader = response.body.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    parserSettings.ondata(new TextDecoder(parserSettings.encoding).decode(value));
    if (done) { parserSettings.onend(); break; }
  }

  if (errResult) {
    throw new Error(errResult);
  }

  // We're done!
  const result = {
    text: fakeRes.text, // from the parser
    body: bodyObjectResult, // from the parser
    statusCode: response.status,
    headers: {}
  }
  // add headers to result
  for (var pair of response.headers.entries()) {
    result.headers[pair[0]] = pair[1];
  }

  return result;
}


module.exports = getEventStreamed;