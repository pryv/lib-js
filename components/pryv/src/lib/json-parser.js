/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
// there two steps 1 find events, then eventDeletions
const EVENTMARKERS = ['"events":[', '"eventDeletions":['];

/**
 * Customize superagent parser
 * Work on 'node.js' and use by browser-getEventStreamed
 */
module.exports = function (foreachEvent, includeDeletions) {
  let eventOrEventDeletions = 0; // start with event
  let buffer = ''; // temp data
  let body = null; // to be returned

  // IN EVENTS VARS
  let depth = 0; // level of depth in brackets
  let inString = false; // cursor is in a String
  let skipNextOne = false; // when a backslash is found
  let cursorPos = 0; // position of Character Cursor

  // counters
  let eventsCount = 0;
  let eventDeletionsCount = 0;

  const states = {
    A_BEFORE_EVENTS: 0,
    B_IN_EVENTS: 1,
    D_AFTER_EVENTS: 2
  };

  let state = states.A_BEFORE_EVENTS;

  function processBuffer () {
    switch (state) {
      case states.A_BEFORE_EVENTS:
        searchStartEvents();
        break;
      case states.B_IN_EVENTS:
        processEvents();
        break;
      default:
        afterEvents();
        break;
    }
  }

  function searchStartEvents () {
    // search for "events": and happend any info before to the body
    const n = buffer.indexOf(EVENTMARKERS[eventOrEventDeletions]);
    if (n > 0) {
      if (eventOrEventDeletions === 0) { // do only once
        body = buffer.substring(0, n);
      }
      buffer = buffer.substr(n + EVENTMARKERS[eventOrEventDeletions].length);
      state = states.B_IN_EVENTS;
      processEvents();
    }
  }

  function processEvents () {
    /// ---- in Event
    while (cursorPos < buffer.length && (state === states.B_IN_EVENTS)) {
      if (skipNextOne) { // ignore next character
        skipNextOne = false;
        cursorPos++;
        continue;
      }
      switch (buffer.charCodeAt(cursorPos)) {
        case 93: // ]
          if (depth === 0) { // end of events
            if (cursorPos !== 0) {
              throw new Error('Found trailling ] in mid-course');
            }
            if (eventOrEventDeletions === 0 && includeDeletions) {
              state = states.A_BEFORE_EVENTS;
              eventOrEventDeletions = 1; // now look for eventDeletions
              return;
            } else { // done
              state = states.D_AFTER_EVENTS;
              let eventsOrDeletionMsg = '';
              if (eventOrEventDeletions === 1) {
                eventsOrDeletionMsg = '"eventDeletionsCount":' + eventDeletionsCount + ',';
              }
              buffer = eventsOrDeletionMsg + '"eventsCount":' + eventsCount + '' + buffer.substr(1);
            }
          }
          break;
        case 92: // \
          skipNextOne = true;
          break;
        case 123: // {
          if (!inString) depth++;
          break;
        case 34: // "
          inString = !inString;
          break;
        case 125: // }
          if (!inString) depth--;
          if (depth === 0) {
            // ignore possible coma ',' if first char
            const ignoreComa = (buffer.charCodeAt(0) === 44) ? 1 : 0;
            const eventStr = buffer.substring(ignoreComa, cursorPos + 1);

            if (eventOrEventDeletions === 0) {
              eventsCount++;
            } else {
              eventDeletionsCount++;
            }
            buffer = buffer.substr(cursorPos + 1);
            addEvent(eventStr);
            cursorPos = -1;
          }
          break;
      }
      cursorPos++;
    }
  }

  function afterEvents () {
    // just happend the end of message;
    body += buffer;
    buffer = '';
  }

  return function (res, fn) {
    res.setEncoding('utf8'); // Already UTF8 in browsers
    res.on('data', chunk => {
      buffer += chunk;
      processBuffer();
    });
    res.on('end', () => {
      let err;
      let bodyObject;
      try {
        res.text = body + buffer;
        bodyObject = res.text && JSON.parse(res.text);
      } catch (err_) {
        err = err_;
        // issue #675: return the raw response if the response parsing fails
        err.rawResponse = res.text || null;
        // issue #876: return the http status code if the response parsing fails
        err.statusCode = res.statusCode;
      } finally {
        fn(err, bodyObject);
      }
    });
  };

  /// --- Direct Push
  function addEvent (strEvent) {
    foreachEvent(JSON.parse(strEvent));
  }
};
