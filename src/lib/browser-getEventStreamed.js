
/**
 * Replacement for getEventStreamed for Browser
 * To be used as long as superagent does not propose it.
 * 
 */
async function getEventStreamed(conn, queryParam, parser) {

  const parserSettings = {
    onData: null,
    onEnd: null,
    encoding: 'utf8'
  }

  const fakeRes = {
    setEncoding : function(encoding) {
      parserSettings.encoding = encoding;
    }, // dummy
    on: function(key, f) { 
      if (key === 'data') {
        parserSettings.onData = f;
      }
      if (key === 'end') {
        parserSettings.onEnd = f;
      }
    }
  }

  let errResult;
  let bodyObjectResult;
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

  
  //let chunks = []; // array of received binary chunks (comprises the body)
  while (true) {
    const { done, value } = await reader.read();
    parserSettings.onData(new TextDecoder(parserSettings.encoding).decode(value));
    if (done) { parserSettings.onEnd(); break; }
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

  for (var pair of response.headers.entries()) {
    result.headers[pair[0]] = pair[1];
  }

  return result;
}


module.exports = getEventStreamed;