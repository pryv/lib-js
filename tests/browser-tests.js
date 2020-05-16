var browserTest =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./test/browser-index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/base64-js/index.js":
/*!*****************************************!*\
  !*** ./node_modules/base64-js/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),

/***/ "./node_modules/buffer/index.js":
/*!**************************************!*\
  !*** ./node_modules/buffer/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(/*! base64-js */ "./node_modules/base64-js/index.js")
var ieee754 = __webpack_require__(/*! ieee754 */ "./node_modules/ieee754/index.js")
var isArray = __webpack_require__(/*! isarray */ "./node_modules/isarray/index.js")

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/chai-as-promised/lib/chai-as-promised.js":
/*!***************************************************************!*\
  !*** ./node_modules/chai-as-promised/lib/chai-as-promised.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* eslint-disable no-invalid-this */
let checkError = __webpack_require__(/*! check-error */ "./node_modules/check-error/index.js");

module.exports = (chai, utils) => {
    const Assertion = chai.Assertion;
    const assert = chai.assert;
    const proxify = utils.proxify;

    // If we are using a version of Chai that has checkError on it,
    // we want to use that version to be consistent. Otherwise, we use
    // what was passed to the factory.
    if (utils.checkError) {
        checkError = utils.checkError;
    }

    function isLegacyJQueryPromise(thenable) {
        // jQuery promises are Promises/A+-compatible since 3.0.0. jQuery 3.0.0 is also the first version
        // to define the catch method.
        return typeof thenable.catch !== "function" &&
               typeof thenable.always === "function" &&
               typeof thenable.done === "function" &&
               typeof thenable.fail === "function" &&
               typeof thenable.pipe === "function" &&
               typeof thenable.progress === "function" &&
               typeof thenable.state === "function";
    }

    function assertIsAboutPromise(assertion) {
        if (typeof assertion._obj.then !== "function") {
            throw new TypeError(utils.inspect(assertion._obj) + " is not a thenable.");
        }
        if (isLegacyJQueryPromise(assertion._obj)) {
            throw new TypeError("Chai as Promised is incompatible with thenables of jQuery<3.0.0, sorry! Please " +
                                "upgrade jQuery or use another Promises/A+ compatible library (see " +
                                "http://promisesaplus.com/).");
        }
    }

    function proxifyIfSupported(assertion) {
        return proxify === undefined ? assertion : proxify(assertion);
    }

    function method(name, asserter) {
        utils.addMethod(Assertion.prototype, name, function () {
            assertIsAboutPromise(this);
            return asserter.apply(this, arguments);
        });
    }

    function property(name, asserter) {
        utils.addProperty(Assertion.prototype, name, function () {
            assertIsAboutPromise(this);
            return proxifyIfSupported(asserter.apply(this, arguments));
        });
    }

    function doNotify(promise, done) {
        promise.then(() => done(), done);
    }

    // These are for clarity and to bypass Chai refusing to allow `undefined` as actual when used with `assert`.
    function assertIfNegated(assertion, message, extra) {
        assertion.assert(true, null, message, extra.expected, extra.actual);
    }

    function assertIfNotNegated(assertion, message, extra) {
        assertion.assert(false, message, null, extra.expected, extra.actual);
    }

    function getBasePromise(assertion) {
        // We need to chain subsequent asserters on top of ones in the chain already (consider
        // `eventually.have.property("foo").that.equals("bar")`), only running them after the existing ones pass.
        // So the first base-promise is `assertion._obj`, but after that we use the assertions themselves, i.e.
        // previously derived promises, to chain off of.
        return typeof assertion.then === "function" ? assertion : assertion._obj;
    }

    function getReasonName(reason) {
        return reason instanceof Error ? reason.toString() : checkError.getConstructorName(reason);
    }

    // Grab these first, before we modify `Assertion.prototype`.

    const propertyNames = Object.getOwnPropertyNames(Assertion.prototype);

    const propertyDescs = {};
    for (const name of propertyNames) {
        propertyDescs[name] = Object.getOwnPropertyDescriptor(Assertion.prototype, name);
    }

    property("fulfilled", function () {
        const derivedPromise = getBasePromise(this).then(
            value => {
                assertIfNegated(this,
                                "expected promise not to be fulfilled but it was fulfilled with #{act}",
                                { actual: value });
                return value;
            },
            reason => {
                assertIfNotNegated(this,
                                   "expected promise to be fulfilled but it was rejected with #{act}",
                                   { actual: getReasonName(reason) });
                return reason;
            }
        );

        module.exports.transferPromiseness(this, derivedPromise);
        return this;
    });

    property("rejected", function () {
        const derivedPromise = getBasePromise(this).then(
            value => {
                assertIfNotNegated(this,
                                   "expected promise to be rejected but it was fulfilled with #{act}",
                                   { actual: value });
                return value;
            },
            reason => {
                assertIfNegated(this,
                                "expected promise not to be rejected but it was rejected with #{act}",
                                { actual: getReasonName(reason) });

                // Return the reason, transforming this into a fulfillment, to allow further assertions, e.g.
                // `promise.should.be.rejected.and.eventually.equal("reason")`.
                return reason;
            }
        );

        module.exports.transferPromiseness(this, derivedPromise);
        return this;
    });

    method("rejectedWith", function (errorLike, errMsgMatcher, message) {
        let errorLikeName = null;
        const negate = utils.flag(this, "negate") || false;

        // rejectedWith with that is called without arguments is
        // the same as a plain ".rejected" use.
        if (errorLike === undefined && errMsgMatcher === undefined &&
            message === undefined) {
            /* eslint-disable no-unused-expressions */
            return this.rejected;
            /* eslint-enable no-unused-expressions */
        }

        if (message !== undefined) {
            utils.flag(this, "message", message);
        }

        if (errorLike instanceof RegExp || typeof errorLike === "string") {
            errMsgMatcher = errorLike;
            errorLike = null;
        } else if (errorLike && errorLike instanceof Error) {
            errorLikeName = errorLike.toString();
        } else if (typeof errorLike === "function") {
            errorLikeName = checkError.getConstructorName(errorLike);
        } else {
            errorLike = null;
        }
        const everyArgIsDefined = Boolean(errorLike && errMsgMatcher);

        let matcherRelation = "including";
        if (errMsgMatcher instanceof RegExp) {
            matcherRelation = "matching";
        }

        const derivedPromise = getBasePromise(this).then(
            value => {
                let assertionMessage = null;
                let expected = null;

                if (errorLike) {
                    assertionMessage = "expected promise to be rejected with #{exp} but it was fulfilled with #{act}";
                    expected = errorLikeName;
                } else if (errMsgMatcher) {
                    assertionMessage = `expected promise to be rejected with an error ${matcherRelation} #{exp} but ` +
                                       `it was fulfilled with #{act}`;
                    expected = errMsgMatcher;
                }

                assertIfNotNegated(this, assertionMessage, { expected, actual: value });
                return value;
            },
            reason => {
                const errorLikeCompatible = errorLike && (errorLike instanceof Error ?
                                                        checkError.compatibleInstance(reason, errorLike) :
                                                        checkError.compatibleConstructor(reason, errorLike));

                const errMsgMatcherCompatible = errMsgMatcher && checkError.compatibleMessage(reason, errMsgMatcher);

                const reasonName = getReasonName(reason);

                if (negate && everyArgIsDefined) {
                    if (errorLikeCompatible && errMsgMatcherCompatible) {
                        this.assert(true,
                                    null,
                                    "expected promise not to be rejected with #{exp} but it was rejected " +
                                    "with #{act}",
                                    errorLikeName,
                                    reasonName);
                    }
                } else {
                    if (errorLike) {
                        this.assert(errorLikeCompatible,
                                    "expected promise to be rejected with #{exp} but it was rejected with #{act}",
                                    "expected promise not to be rejected with #{exp} but it was rejected " +
                                    "with #{act}",
                                    errorLikeName,
                                    reasonName);
                    }

                    if (errMsgMatcher) {
                        this.assert(errMsgMatcherCompatible,
                                    `expected promise to be rejected with an error ${matcherRelation} #{exp} but got ` +
                                    `#{act}`,
                                    `expected promise not to be rejected with an error ${matcherRelation} #{exp}`,
                                    errMsgMatcher,
                                    checkError.getMessage(reason));
                    }
                }

                return reason;
            }
        );

        module.exports.transferPromiseness(this, derivedPromise);
        return this;
    });

    property("eventually", function () {
        utils.flag(this, "eventually", true);
        return this;
    });

    method("notify", function (done) {
        doNotify(getBasePromise(this), done);
        return this;
    });

    method("become", function (value, message) {
        return this.eventually.deep.equal(value, message);
    });

    // ### `eventually`

    // We need to be careful not to trigger any getters, thus `Object.getOwnPropertyDescriptor` usage.
    const methodNames = propertyNames.filter(name => {
        return name !== "assert" && typeof propertyDescs[name].value === "function";
    });

    methodNames.forEach(methodName => {
        Assertion.overwriteMethod(methodName, originalMethod => function () {
            return doAsserterAsyncAndAddThen(originalMethod, this, arguments);
        });
    });

    const getterNames = propertyNames.filter(name => {
        return name !== "_obj" && typeof propertyDescs[name].get === "function";
    });

    getterNames.forEach(getterName => {
        // Chainable methods are things like `an`, which can work both for `.should.be.an.instanceOf` and as
        // `should.be.an("object")`. We need to handle those specially.
        const isChainableMethod = Assertion.prototype.__methods.hasOwnProperty(getterName);

        if (isChainableMethod) {
            Assertion.overwriteChainableMethod(
                getterName,
                originalMethod => function () {
                    return doAsserterAsyncAndAddThen(originalMethod, this, arguments);
                },
                originalGetter => function () {
                    return doAsserterAsyncAndAddThen(originalGetter, this);
                }
            );
        } else {
            Assertion.overwriteProperty(getterName, originalGetter => function () {
                return proxifyIfSupported(doAsserterAsyncAndAddThen(originalGetter, this));
            });
        }
    });

    function doAsserterAsyncAndAddThen(asserter, assertion, args) {
        // Since we're intercepting all methods/properties, we need to just pass through if they don't want
        // `eventually`, or if we've already fulfilled the promise (see below).
        if (!utils.flag(assertion, "eventually")) {
            asserter.apply(assertion, args);
            return assertion;
        }

        const derivedPromise = getBasePromise(assertion).then(value => {
            // Set up the environment for the asserter to actually run: `_obj` should be the fulfillment value, and
            // now that we have the value, we're no longer in "eventually" mode, so we won't run any of this code,
            // just the base Chai code that we get to via the short-circuit above.
            assertion._obj = value;
            utils.flag(assertion, "eventually", false);

            return args ? module.exports.transformAsserterArgs(args) : args;
        }).then(newArgs => {
            asserter.apply(assertion, newArgs);

            // Because asserters, for example `property`, can change the value of `_obj` (i.e. change the "object"
            // flag), we need to communicate this value change to subsequent chained asserters. Since we build a
            // promise chain paralleling the asserter chain, we can use it to communicate such changes.
            return assertion._obj;
        });

        module.exports.transferPromiseness(assertion, derivedPromise);
        return assertion;
    }

    // ### Now use the `Assertion` framework to build an `assert` interface.
    const originalAssertMethods = Object.getOwnPropertyNames(assert).filter(propName => {
        return typeof assert[propName] === "function";
    });

    assert.isFulfilled = (promise, message) => (new Assertion(promise, message)).to.be.fulfilled;

    assert.isRejected = (promise, errorLike, errMsgMatcher, message) => {
        const assertion = new Assertion(promise, message);
        return assertion.to.be.rejectedWith(errorLike, errMsgMatcher, message);
    };

    assert.becomes = (promise, value, message) => assert.eventually.deepEqual(promise, value, message);

    assert.doesNotBecome = (promise, value, message) => assert.eventually.notDeepEqual(promise, value, message);

    assert.eventually = {};
    originalAssertMethods.forEach(assertMethodName => {
        assert.eventually[assertMethodName] = function (promise) {
            const otherArgs = Array.prototype.slice.call(arguments, 1);

            let customRejectionHandler;
            const message = arguments[assert[assertMethodName].length - 1];
            if (typeof message === "string") {
                customRejectionHandler = reason => {
                    throw new chai.AssertionError(`${message}\n\nOriginal reason: ${utils.inspect(reason)}`);
                };
            }

            const returnedPromise = promise.then(
                fulfillmentValue => assert[assertMethodName].apply(assert, [fulfillmentValue].concat(otherArgs)),
                customRejectionHandler
            );

            returnedPromise.notify = done => {
                doNotify(returnedPromise, done);
            };

            return returnedPromise;
        };
    });
};

module.exports.transferPromiseness = (assertion, promise) => {
    assertion.then = promise.then.bind(promise);
};

module.exports.transformAsserterArgs = values => values;


/***/ }),

/***/ "./node_modules/check-error/index.js":
/*!*******************************************!*\
  !*** ./node_modules/check-error/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* !
 * Chai - checkError utility
 * Copyright(c) 2012-2016 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .checkError
 *
 * Checks that an error conforms to a given set of criteria and/or retrieves information about it.
 *
 * @api public
 */

/**
 * ### .compatibleInstance(thrown, errorLike)
 *
 * Checks if two instances are compatible (strict equal).
 * Returns false if errorLike is not an instance of Error, because instances
 * can only be compatible if they're both error instances.
 *
 * @name compatibleInstance
 * @param {Error} thrown error
 * @param {Error|ErrorConstructor} errorLike object to compare against
 * @namespace Utils
 * @api public
 */

function compatibleInstance(thrown, errorLike) {
  return errorLike instanceof Error && thrown === errorLike;
}

/**
 * ### .compatibleConstructor(thrown, errorLike)
 *
 * Checks if two constructors are compatible.
 * This function can receive either an error constructor or
 * an error instance as the `errorLike` argument.
 * Constructors are compatible if they're the same or if one is
 * an instance of another.
 *
 * @name compatibleConstructor
 * @param {Error} thrown error
 * @param {Error|ErrorConstructor} errorLike object to compare against
 * @namespace Utils
 * @api public
 */

function compatibleConstructor(thrown, errorLike) {
  if (errorLike instanceof Error) {
    // If `errorLike` is an instance of any error we compare their constructors
    return thrown.constructor === errorLike.constructor || thrown instanceof errorLike.constructor;
  } else if (errorLike.prototype instanceof Error || errorLike === Error) {
    // If `errorLike` is a constructor that inherits from Error, we compare `thrown` to `errorLike` directly
    return thrown.constructor === errorLike || thrown instanceof errorLike;
  }

  return false;
}

/**
 * ### .compatibleMessage(thrown, errMatcher)
 *
 * Checks if an error's message is compatible with a matcher (String or RegExp).
 * If the message contains the String or passes the RegExp test,
 * it is considered compatible.
 *
 * @name compatibleMessage
 * @param {Error} thrown error
 * @param {String|RegExp} errMatcher to look for into the message
 * @namespace Utils
 * @api public
 */

function compatibleMessage(thrown, errMatcher) {
  var comparisonString = typeof thrown === 'string' ? thrown : thrown.message;
  if (errMatcher instanceof RegExp) {
    return errMatcher.test(comparisonString);
  } else if (typeof errMatcher === 'string') {
    return comparisonString.indexOf(errMatcher) !== -1; // eslint-disable-line no-magic-numbers
  }

  return false;
}

/**
 * ### .getFunctionName(constructorFn)
 *
 * Returns the name of a function.
 * This also includes a polyfill function if `constructorFn.name` is not defined.
 *
 * @name getFunctionName
 * @param {Function} constructorFn
 * @namespace Utils
 * @api private
 */

var functionNameMatch = /\s*function(?:\s|\s*\/\*[^(?:*\/)]+\*\/\s*)*([^\(\/]+)/;
function getFunctionName(constructorFn) {
  var name = '';
  if (typeof constructorFn.name === 'undefined') {
    // Here we run a polyfill if constructorFn.name is not defined
    var match = String(constructorFn).match(functionNameMatch);
    if (match) {
      name = match[1];
    }
  } else {
    name = constructorFn.name;
  }

  return name;
}

/**
 * ### .getConstructorName(errorLike)
 *
 * Gets the constructor name for an Error instance or constructor itself.
 *
 * @name getConstructorName
 * @param {Error|ErrorConstructor} errorLike
 * @namespace Utils
 * @api public
 */

function getConstructorName(errorLike) {
  var constructorName = errorLike;
  if (errorLike instanceof Error) {
    constructorName = getFunctionName(errorLike.constructor);
  } else if (typeof errorLike === 'function') {
    // If `err` is not an instance of Error it is an error constructor itself or another function.
    // If we've got a common function we get its name, otherwise we may need to create a new instance
    // of the error just in case it's a poorly-constructed error. Please see chaijs/chai/issues/45 to know more.
    constructorName = getFunctionName(errorLike).trim() ||
        getFunctionName(new errorLike()); // eslint-disable-line new-cap
  }

  return constructorName;
}

/**
 * ### .getMessage(errorLike)
 *
 * Gets the error message from an error.
 * If `err` is a String itself, we return it.
 * If the error has no message, we return an empty string.
 *
 * @name getMessage
 * @param {Error|String} errorLike
 * @namespace Utils
 * @api public
 */

function getMessage(errorLike) {
  var msg = '';
  if (errorLike && errorLike.message) {
    msg = errorLike.message;
  } else if (typeof errorLike === 'string') {
    msg = errorLike;
  }

  return msg;
}

module.exports = {
  compatibleInstance: compatibleInstance,
  compatibleConstructor: compatibleConstructor,
  compatibleMessage: compatibleMessage,
  getMessage: getMessage,
  getConstructorName: getConstructorName,
};


/***/ }),

/***/ "./node_modules/component-emitter/index.js":
/*!*************************************************!*\
  !*** ./node_modules/component-emitter/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


/**
 * Expose `Emitter`.
 */

if (true) {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }

  // Remove event specific arrays for event types that no
  // one is subscribed for to avoid memory leak.
  if (callbacks.length === 0) {
    delete this._callbacks['$' + event];
  }

  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};

  var args = new Array(arguments.length - 1)
    , callbacks = this._callbacks['$' + event];

  for (var i = 1; i < arguments.length; i++) {
    args[i - 1] = arguments[i];
  }

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};


/***/ }),

/***/ "./node_modules/fast-safe-stringify/index.js":
/*!***************************************************!*\
  !*** ./node_modules/fast-safe-stringify/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = stringify
stringify.default = stringify
stringify.stable = deterministicStringify
stringify.stableStringify = deterministicStringify

var arr = []
var replacerStack = []

// Regular stringify
function stringify (obj, replacer, spacer) {
  decirc(obj, '', [], undefined)
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(obj, replacer, spacer)
  } else {
    res = JSON.stringify(obj, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}
function decirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, stack, val)
      }
    } else {
      var keys = Object.keys(val)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        decirc(val[key], key, stack, val)
      }
    }
    stack.pop()
  }
}

// Stable-stringify
function compareFunction (a, b) {
  if (a < b) {
    return -1
  }
  if (a > b) {
    return 1
  }
  return 0
}

function deterministicStringify (obj, replacer, spacer) {
  var tmp = deterministicDecirc(obj, '', [], undefined) || obj
  var res
  if (replacerStack.length === 0) {
    res = JSON.stringify(tmp, replacer, spacer)
  } else {
    res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer)
  }
  while (arr.length !== 0) {
    var part = arr.pop()
    if (part.length === 4) {
      Object.defineProperty(part[0], part[1], part[3])
    } else {
      part[0][part[1]] = part[2]
    }
  }
  return res
}

function deterministicDecirc (val, k, stack, parent) {
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
        if (propertyDescriptor.get !== undefined) {
          if (propertyDescriptor.configurable) {
            Object.defineProperty(parent, k, { value: '[Circular]' })
            arr.push([parent, k, val, propertyDescriptor])
          } else {
            replacerStack.push([val, k])
          }
        } else {
          parent[k] = '[Circular]'
          arr.push([parent, k, val])
        }
        return
      }
    }
    if (typeof val.toJSON === 'function') {
      return
    }
    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        deterministicDecirc(val[i], i, stack, val)
      }
    } else {
      // Create a temporary object in the required way
      var tmp = {}
      var keys = Object.keys(val).sort(compareFunction)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        deterministicDecirc(val[key], key, stack, val)
        tmp[key] = val[key]
      }
      if (parent !== undefined) {
        arr.push([parent, k, val])
        parent[k] = tmp
      } else {
        return tmp
      }
    }
    stack.pop()
  }
}

// wraps replacer function to handle values we couldn't replace
// and mark them as [Circular]
function replaceGetterValues (replacer) {
  replacer = replacer !== undefined ? replacer : function (k, v) { return v }
  return function (key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i]
        if (part[1] === key && part[0] === val) {
          val = '[Circular]'
          replacerStack.splice(i, 1)
          break
        }
      }
    }
    return replacer.call(this, key, val)
  }
}


/***/ }),

/***/ "./node_modules/ieee754/index.js":
/*!***************************************!*\
  !*** ./node_modules/ieee754/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ "./node_modules/isarray/index.js":
/*!***************************************!*\
  !*** ./node_modules/isarray/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),

/***/ "./node_modules/lodash.sortby/index.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash.sortby/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to compose bitmasks for comparison styles. */
var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * The base implementation of `_.sortBy` which uses `comparer` to define the
 * sort order of `array` and replaces criteria objects with their corresponding
 * values.
 *
 * @private
 * @param {Array} array The array to sort.
 * @param {Function} comparer The function to define sort order.
 * @returns {Array} Returns `array`.
 */
function baseSortBy(array, comparer) {
  var length = array.length;

  array.sort(comparer);
  while (length--) {
    array[length] = array[length].value;
  }
  return array;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  this.__data__ = new ListCache(entries);
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  return this.__data__['delete'](key);
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var cache = this.__data__;
  if (cache instanceof ListCache) {
    var pairs = cache.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      return this;
    }
    cache = this.__data__ = new MapCache(pairs);
  }
  cache.set(key, value);
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  return objectToString.call(value);
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }
  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }
  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack);
    return (objIsArr || isTypedArray(object))
      ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
      : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }
  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new Stack);
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new Stack);
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity;
  }
  if (typeof value == 'object') {
    return isArray(value)
      ? baseMatchesProperty(value[0], value[1])
      : baseMatches(value);
  }
  return property(value);
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function(object) {
    var objValue = get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? hasIn(object, path)
      : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}

/**
 * The base implementation of `_.orderBy` without param guards.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
 * @param {string[]} orders The sort orders of `iteratees`.
 * @returns {Array} Returns the new sorted array.
 */
function baseOrderBy(collection, iteratees, orders) {
  var index = -1;
  iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

  var result = baseMap(collection, function(value, key, collection) {
    var criteria = arrayMap(iteratees, function(iteratee) {
      return iteratee(value);
    });
    return { 'criteria': criteria, 'index': ++index, 'value': value };
  });

  return baseSortBy(result, function(object, other) {
    return compareMultiple(object, other, orders);
  });
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return baseGet(object, path);
  };
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Compares values to sort them in ascending order.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {number} Returns the sort order indicator for `value`.
 */
function compareAscending(value, other) {
  if (value !== other) {
    var valIsDefined = value !== undefined,
        valIsNull = value === null,
        valIsReflexive = value === value,
        valIsSymbol = isSymbol(value);

    var othIsDefined = other !== undefined,
        othIsNull = other === null,
        othIsReflexive = other === other,
        othIsSymbol = isSymbol(other);

    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
        (valIsNull && othIsDefined && othIsReflexive) ||
        (!valIsDefined && othIsReflexive) ||
        !valIsReflexive) {
      return 1;
    }
    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
        (othIsNull && valIsDefined && valIsReflexive) ||
        (!othIsDefined && valIsReflexive) ||
        !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}

/**
 * Used by `_.orderBy` to compare multiple properties of a value to another
 * and stable sort them.
 *
 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
 * specify an order of "desc" for descending or "asc" for ascending sort order
 * of corresponding values.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {boolean[]|string[]} orders The order to sort by for each property.
 * @returns {number} Returns the sort order indicator for `object`.
 */
function compareMultiple(object, other, orders) {
  var index = -1,
      objCriteria = object.criteria,
      othCriteria = other.criteria,
      length = objCriteria.length,
      ordersLength = orders.length;

  while (++index < length) {
    var result = compareAscending(objCriteria[index], othCriteria[index]);
    if (result) {
      if (index >= ordersLength) {
        return result;
      }
      var order = orders[index];
      return result * (order == 'desc' ? -1 : 1);
    }
  }
  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
  // that causes it, under certain circumstances, to provide the same value for
  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
  // for more details.
  //
  // This also ensures a stable sort in V8 and other engines.
  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
  return object.index - other.index;
}

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!isArrayLike(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = (bitmask & UNORDERED_COMPARE_FLAG) ? new SetCache : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!arraySome(other, function(othValue, othIndex) {
            if (!seen.has(othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
              return seen.add(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, customizer, bitmask, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= UNORDERED_COMPARE_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(object);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, isStrictComparable(value)];
  }
  return result;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);

  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result) {
    return result;
  }
  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) &&
    (isArray(object) || isArguments(object));
}

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return isArray(value) || isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates an array of elements, sorted in ascending order by the results of
 * running each element in a collection thru each iteratee. This method
 * performs a stable sort, that is, it preserves the original sort order of
 * equal elements. The iteratees are invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {...(Function|Function[])} [iteratees=[_.identity]]
 *  The iteratees to sort by.
 * @returns {Array} Returns the new sorted array.
 * @example
 *
 * var users = [
 *   { 'user': 'fred',   'age': 48 },
 *   { 'user': 'barney', 'age': 36 },
 *   { 'user': 'fred',   'age': 40 },
 *   { 'user': 'barney', 'age': 34 }
 * ];
 *
 * _.sortBy(users, function(o) { return o.user; });
 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
 *
 * _.sortBy(users, ['user', 'age']);
 * // => objects for [['barney', 34], ['barney', 36], ['fred', 40], ['fred', 48]]
 *
 * _.sortBy(users, 'user', function(o) {
 *   return Math.floor(o.age / 10);
 * });
 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 40]]
 */
var sortBy = baseRest(function(collection, iteratees) {
  if (collection == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
});

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = sortBy;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/node-libs-browser/node_modules/punycode/punycode.js":
/*!**************************************************************************!*\
  !*** ./node_modules/node-libs-browser/node_modules/punycode/punycode.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports =  true && exports &&
		!exports.nodeType && exports;
	var freeModule =  true && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return punycode;
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}

}(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module), __webpack_require__(/*! ./../../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/superagent/lib/agent-base.js":
/*!***************************************************!*\
  !*** ./node_modules/superagent/lib/agent-base.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function Agent() {
  this._defaults = [];
}

['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts'].forEach(function (fn) {
  // Default setting for all requests from this agent
  Agent.prototype[fn] = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this._defaults.push({
      fn: fn,
      args: args
    });

    return this;
  };
});

Agent.prototype._setDefaults = function (req) {
  this._defaults.forEach(function (def) {
    req[def.fn].apply(req, _toConsumableArray(def.args));
  });
};

module.exports = Agent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hZ2VudC1iYXNlLmpzIl0sIm5hbWVzIjpbIkFnZW50IiwiX2RlZmF1bHRzIiwiZm9yRWFjaCIsImZuIiwicHJvdG90eXBlIiwiYXJncyIsInB1c2giLCJfc2V0RGVmYXVsdHMiLCJyZXEiLCJkZWYiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsU0FBU0EsS0FBVCxHQUFpQjtBQUNmLE9BQUtDLFNBQUwsR0FBaUIsRUFBakI7QUFDRDs7QUFFRCxDQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsTUFIRixFQUlFLEtBSkYsRUFLRSxPQUxGLEVBTUUsTUFORixFQU9FLFFBUEYsRUFRRSxNQVJGLEVBU0UsaUJBVEYsRUFVRSxXQVZGLEVBV0UsT0FYRixFQVlFLElBWkYsRUFhRSxXQWJGLEVBY0UsU0FkRixFQWVFLFFBZkYsRUFnQkUsV0FoQkYsRUFpQkUsT0FqQkYsRUFrQkUsSUFsQkYsRUFtQkUsS0FuQkYsRUFvQkUsS0FwQkYsRUFxQkUsTUFyQkYsRUFzQkUsaUJBdEJGLEVBdUJFQyxPQXZCRixDQXVCVSxVQUFBQyxFQUFFLEVBQUk7QUFDZDtBQUNBSCxFQUFBQSxLQUFLLENBQUNJLFNBQU4sQ0FBZ0JELEVBQWhCLElBQXNCLFlBQWtCO0FBQUEsc0NBQU5FLElBQU07QUFBTkEsTUFBQUEsSUFBTTtBQUFBOztBQUN0QyxTQUFLSixTQUFMLENBQWVLLElBQWYsQ0FBb0I7QUFBRUgsTUFBQUEsRUFBRSxFQUFGQSxFQUFGO0FBQU1FLE1BQUFBLElBQUksRUFBSkE7QUFBTixLQUFwQjs7QUFDQSxXQUFPLElBQVA7QUFDRCxHQUhEO0FBSUQsQ0E3QkQ7O0FBK0JBTCxLQUFLLENBQUNJLFNBQU4sQ0FBZ0JHLFlBQWhCLEdBQStCLFVBQVNDLEdBQVQsRUFBYztBQUMzQyxPQUFLUCxTQUFMLENBQWVDLE9BQWYsQ0FBdUIsVUFBQU8sR0FBRyxFQUFJO0FBQzVCRCxJQUFBQSxHQUFHLENBQUNDLEdBQUcsQ0FBQ04sRUFBTCxDQUFILE9BQUFLLEdBQUcscUJBQVlDLEdBQUcsQ0FBQ0osSUFBaEIsRUFBSDtBQUNELEdBRkQ7QUFHRCxDQUpEOztBQU1BSyxNQUFNLENBQUNDLE9BQVAsR0FBaUJYLEtBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gQWdlbnQoKSB7XG4gIHRoaXMuX2RlZmF1bHRzID0gW107XG59XG5cbltcbiAgJ3VzZScsXG4gICdvbicsXG4gICdvbmNlJyxcbiAgJ3NldCcsXG4gICdxdWVyeScsXG4gICd0eXBlJyxcbiAgJ2FjY2VwdCcsXG4gICdhdXRoJyxcbiAgJ3dpdGhDcmVkZW50aWFscycsXG4gICdzb3J0UXVlcnknLFxuICAncmV0cnknLFxuICAnb2snLFxuICAncmVkaXJlY3RzJyxcbiAgJ3RpbWVvdXQnLFxuICAnYnVmZmVyJyxcbiAgJ3NlcmlhbGl6ZScsXG4gICdwYXJzZScsXG4gICdjYScsXG4gICdrZXknLFxuICAncGZ4JyxcbiAgJ2NlcnQnLFxuICAnZGlzYWJsZVRMU0NlcnRzJ1xuXS5mb3JFYWNoKGZuID0+IHtcbiAgLy8gRGVmYXVsdCBzZXR0aW5nIGZvciBhbGwgcmVxdWVzdHMgZnJvbSB0aGlzIGFnZW50XG4gIEFnZW50LnByb3RvdHlwZVtmbl0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgdGhpcy5fZGVmYXVsdHMucHVzaCh7IGZuLCBhcmdzIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufSk7XG5cbkFnZW50LnByb3RvdHlwZS5fc2V0RGVmYXVsdHMgPSBmdW5jdGlvbihyZXEpIHtcbiAgdGhpcy5fZGVmYXVsdHMuZm9yRWFjaChkZWYgPT4ge1xuICAgIHJlcVtkZWYuZm5dKC4uLmRlZi5hcmdzKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnZW50O1xuIl19

/***/ }),

/***/ "./node_modules/superagent/lib/client.js":
/*!***********************************************!*\
  !*** ./node_modules/superagent/lib/client.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Root reference for iframes.
 */
var root;

if (typeof window !== 'undefined') {
  // Browser window
  root = window;
} else if (typeof self === 'undefined') {
  // Other environments
  console.warn('Using browser-only version of superagent in non-browser environment');
  root = void 0;
} else {
  // Web Worker
  root = self;
}

var Emitter = __webpack_require__(/*! component-emitter */ "./node_modules/component-emitter/index.js");

var safeStringify = __webpack_require__(/*! fast-safe-stringify */ "./node_modules/fast-safe-stringify/index.js");

var RequestBase = __webpack_require__(/*! ./request-base */ "./node_modules/superagent/lib/request-base.js");

var isObject = __webpack_require__(/*! ./is-object */ "./node_modules/superagent/lib/is-object.js");

var ResponseBase = __webpack_require__(/*! ./response-base */ "./node_modules/superagent/lib/response-base.js");

var Agent = __webpack_require__(/*! ./agent-base */ "./node_modules/superagent/lib/agent-base.js");
/**
 * Noop.
 */


function noop() {}
/**
 * Expose `request`.
 */


module.exports = function (method, url) {
  // callback
  if (typeof url === 'function') {
    return new exports.Request('GET', method).end(url);
  } // url first


  if (arguments.length === 1) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
};

exports = module.exports;
var request = exports;
exports.Request = Request;
/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest && (!root.location || root.location.protocol !== 'file:' || !root.ActiveXObject)) {
    return new XMLHttpRequest();
  }

  try {
    return new ActiveXObject('Microsoft.XMLHTTP');
  } catch (_unused) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.6.0');
  } catch (_unused2) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP.3.0');
  } catch (_unused3) {}

  try {
    return new ActiveXObject('Msxml2.XMLHTTP');
  } catch (_unused4) {}

  throw new Error('Browser-only version of superagent could not find XHR');
};
/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */


var trim = ''.trim ? function (s) {
  return s.trim();
} : function (s) {
  return s.replace(/(^\s*|\s*$)/g, '');
};
/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) pushEncodedKeyValuePair(pairs, key, obj[key]);
  }

  return pairs.join('&');
}
/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */


function pushEncodedKeyValuePair(pairs, key, val) {
  if (val === undefined) return;

  if (val === null) {
    pairs.push(encodeURIComponent(key));
    return;
  }

  if (Array.isArray(val)) {
    val.forEach(function (v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  } else if (isObject(val)) {
    for (var subkey in val) {
      if (Object.prototype.hasOwnProperty.call(val, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), val[subkey]);
    }
  } else {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
  }
}
/**
 * Expose serialization method.
 */


request.serializeObject = serialize;
/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}
/**
 * Expose parser.
 */


request.parseString = parseString;
/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'text/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  form: 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};
/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

request.serialize = {
  'application/x-www-form-urlencoded': serialize,
  'application/json': safeStringify
};
/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};
/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}
/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */


function isJSON(mime) {
  // should match /json or +json
  // but not /json-seq
  return /[/+]json($|[^-\w])/.test(mime);
}
/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */


function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr; // responseText is accessible only if responseType is '' or 'text' and on older browsers

  this.text = this.req.method !== 'HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text') || typeof this.xhr.responseType === 'undefined' ? this.xhr.responseText : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status; // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request

  if (status === 1223) {
    status = 204;
  }

  this._setStatusProperties(status);

  this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  this.header = this.headers; // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.

  this.header['content-type'] = this.xhr.getResponseHeader('content-type');

  this._setHeaderProperties(this.header);

  if (this.text === null && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method === 'HEAD' ? null : this._parseBody(this.text ? this.text : this.xhr.response);
  }
} // eslint-disable-next-line new-cap


ResponseBase(Response.prototype);
/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function (str) {
  var parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, str);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && str && (str.length > 0 || str instanceof Object) ? parse(str) : null;
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var url = req.url;
  var msg = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;
  return err;
};
/**
 * Expose `Response`.
 */


request.Response = Response;
/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case

  this._header = {}; // coerces header names to lowercase

  this.on('end', function () {
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (err_) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = err_; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);
    var new_err;

    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err_) {
      new_err = err_; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_err) {
      new_err.original = err;
      new_err.response = res;
      new_err.status = res.status;
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}
/**
 * Mixin `Emitter` and `RequestBase`.
 */
// eslint-disable-next-line new-cap


Emitter(Request.prototype); // eslint-disable-next-line new-cap

RequestBase(Request.prototype);
/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function (type) {
  this.set('Content-Type', request.types[type] || type);
  return this;
};
/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.accept = function (type) {
  this.set('Accept', request.types[type] || type);
  return this;
};
/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.auth = function (user, pass, options) {
  if (arguments.length === 1) pass = '';

  if (_typeof(pass) === 'object' && pass !== null) {
    // pass is optional and can be replaced with options
    options = pass;
    pass = '';
  }

  if (!options) {
    options = {
      type: typeof btoa === 'function' ? 'basic' : 'auto'
    };
  }

  var encoder = function encoder(string) {
    if (typeof btoa === 'function') {
      return btoa(string);
    }

    throw new Error('Cannot use basic auth, btoa is not a function');
  };

  return this._auth(user, pass, options, encoder);
};
/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.query = function (val) {
  if (typeof val !== 'string') val = serialize(val);
  if (val) this._query.push(val);
  return this;
};
/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.attach = function (field, file, options) {
  if (file) {
    if (this._data) {
      throw new Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }

  return this;
};

Request.prototype._getFormData = function () {
  if (!this._formData) {
    this._formData = new root.FormData();
  }

  return this._formData;
};
/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */


Request.prototype.callback = function (err, res) {
  if (this._shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */


Request.prototype.crossDomainError = function () {
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;
  err.status = this.status;
  err.method = this.method;
  err.url = this.url;
  this.callback(err);
}; // This only warns, because the request is still likely to work


Request.prototype.agent = function () {
  console.warn('This is not supported in browser version of superagent');
  return this;
};

Request.prototype.ca = Request.prototype.agent;
Request.prototype.buffer = Request.prototype.ca; // This throws, because it can't send/receive data as expected

Request.prototype.write = function () {
  throw new Error('Streaming is not supported in browser version of superagent');
};

Request.prototype.pipe = Request.prototype.write;
/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj host object
 * @return {Boolean} is a host object
 * @api private
 */

Request.prototype._isHost = function (obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && _typeof(obj) === 'object' && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
};
/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */


Request.prototype.end = function (fn) {
  if (this._endCalled) {
    console.warn('Warning: .end() was called twice. This is not supported in superagent');
  }

  this._endCalled = true; // store callback

  this._callback = fn || noop; // querystring

  this._finalizeQueryString();

  this._end();
};

Request.prototype._setUploadTimeout = function () {
  var self = this; // upload timeout it's wokrs only if deadline timeout is off

  if (this._uploadTimeout && !this._uploadTimeoutTimer) {
    this._uploadTimeoutTimer = setTimeout(function () {
      self._timeoutError('Upload timeout of ', self._uploadTimeout, 'ETIMEDOUT');
    }, this._uploadTimeout);
  }
}; // eslint-disable-next-line complexity


Request.prototype._end = function () {
  if (this._aborted) return this.callback(new Error('The request has been aborted even before .end() was called'));
  var self = this;
  this.xhr = request.getXHR();
  var xhr = this.xhr;
  var data = this._formData || this._data;

  this._setTimeouts(); // state change


  xhr.onreadystatechange = function () {
    var readyState = xhr.readyState;

    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }

    if (readyState !== 4) {
      return;
    } // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"


    var status;

    try {
      status = xhr.status;
    } catch (_unused5) {
      status = 0;
    }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }

    self.emit('end');
  }; // progress


  var handleProgress = function handleProgress(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;

      if (e.percent === 100) {
        clearTimeout(self._uploadTimeoutTimer);
      }
    }

    e.direction = direction;
    self.emit('progress', e);
  };

  if (this.hasListeners('progress')) {
    try {
      xhr.addEventListener('progress', handleProgress.bind(null, 'download'));

      if (xhr.upload) {
        xhr.upload.addEventListener('progress', handleProgress.bind(null, 'upload'));
      }
    } catch (_unused6) {// Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  if (xhr.upload) {
    this._setUploadTimeout();
  } // initiate request


  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  } // CORS


  if (this._withCredentials) xhr.withCredentials = true; // body

  if (!this._formData && this.method !== 'GET' && this.method !== 'HEAD' && typeof data !== 'string' && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];

    var _serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];

    if (!_serialize && isJSON(contentType)) {
      _serialize = request.serialize['application/json'];
    }

    if (_serialize) data = _serialize(data);
  } // set header fields


  for (var field in this.header) {
    if (this.header[field] === null) continue;
    if (Object.prototype.hasOwnProperty.call(this.header, field)) xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  } // send stuff


  this.emit('request', this); // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined

  xhr.send(typeof data === 'undefined' ? null : data);
};

request.agent = function () {
  return new Agent();
};

['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'].forEach(function (method) {
  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    var req = new request.Request(method, url);

    this._setDefaults(req);

    if (fn) {
      req.end(fn);
    }

    return req;
  };
});
Agent.prototype.del = Agent.prototype.delete;
/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function (url, data, fn) {
  var req = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.head = function (url, data, fn) {
  var req = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.options = function (url, data, fn) {
  var req = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


function del(url, data, fn) {
  var req = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
}

request.del = del;
request.delete = del;
/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function (url, data, fn) {
  var req = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.post = function (url, data, fn) {
  var req = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */


request.put = function (url, data, fn) {
  var req = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsicm9vdCIsIndpbmRvdyIsInNlbGYiLCJjb25zb2xlIiwid2FybiIsIkVtaXR0ZXIiLCJyZXF1aXJlIiwic2FmZVN0cmluZ2lmeSIsIlJlcXVlc3RCYXNlIiwiaXNPYmplY3QiLCJSZXNwb25zZUJhc2UiLCJBZ2VudCIsIm5vb3AiLCJtb2R1bGUiLCJleHBvcnRzIiwibWV0aG9kIiwidXJsIiwiUmVxdWVzdCIsImVuZCIsImFyZ3VtZW50cyIsImxlbmd0aCIsInJlcXVlc3QiLCJnZXRYSFIiLCJYTUxIdHRwUmVxdWVzdCIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJBY3RpdmVYT2JqZWN0IiwiRXJyb3IiLCJ0cmltIiwicyIsInJlcGxhY2UiLCJzZXJpYWxpemUiLCJvYmoiLCJwYWlycyIsImtleSIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwiY2FsbCIsInB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyIiwiam9pbiIsInZhbCIsInVuZGVmaW5lZCIsInB1c2giLCJlbmNvZGVVUklDb21wb25lbnQiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwidiIsInN1YmtleSIsInNlcmlhbGl6ZU9iamVjdCIsInBhcnNlU3RyaW5nIiwic3RyIiwic3BsaXQiLCJwYWlyIiwicG9zIiwiaSIsImxlbiIsImluZGV4T2YiLCJkZWNvZGVVUklDb21wb25lbnQiLCJzbGljZSIsInR5cGVzIiwiaHRtbCIsImpzb24iLCJ4bWwiLCJ1cmxlbmNvZGVkIiwiZm9ybSIsInBhcnNlIiwiSlNPTiIsInBhcnNlSGVhZGVyIiwibGluZXMiLCJmaWVsZHMiLCJpbmRleCIsImxpbmUiLCJmaWVsZCIsInRvTG93ZXJDYXNlIiwiaXNKU09OIiwibWltZSIsInRlc3QiLCJSZXNwb25zZSIsInJlcSIsInhociIsInRleHQiLCJyZXNwb25zZVR5cGUiLCJyZXNwb25zZVRleHQiLCJzdGF0dXNUZXh0Iiwic3RhdHVzIiwiX3NldFN0YXR1c1Byb3BlcnRpZXMiLCJoZWFkZXJzIiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwiaGVhZGVyIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsIl9yZXNwb25zZVR5cGUiLCJib2R5IiwicmVzcG9uc2UiLCJfcGFyc2VCb2R5IiwidHlwZSIsIl9wYXJzZXIiLCJ0b0Vycm9yIiwibXNnIiwiZXJyIiwiX3F1ZXJ5IiwiX2hlYWRlciIsIm9uIiwicmVzIiwiZXJyXyIsIm9yaWdpbmFsIiwicmF3UmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwiY2FsbGJhY2siLCJlbWl0IiwibmV3X2VyciIsIl9pc1Jlc3BvbnNlT0siLCJzZXQiLCJhY2NlcHQiLCJhdXRoIiwidXNlciIsInBhc3MiLCJvcHRpb25zIiwiYnRvYSIsImVuY29kZXIiLCJzdHJpbmciLCJfYXV0aCIsInF1ZXJ5IiwiYXR0YWNoIiwiZmlsZSIsIl9kYXRhIiwiX2dldEZvcm1EYXRhIiwiYXBwZW5kIiwibmFtZSIsIl9mb3JtRGF0YSIsIkZvcm1EYXRhIiwiX3Nob3VsZFJldHJ5IiwiX3JldHJ5IiwiZm4iLCJfY2FsbGJhY2siLCJjbGVhclRpbWVvdXQiLCJfbWF4UmV0cmllcyIsInJldHJpZXMiLCJfcmV0cmllcyIsImNyb3NzRG9tYWluRXJyb3IiLCJjcm9zc0RvbWFpbiIsImFnZW50IiwiY2EiLCJidWZmZXIiLCJ3cml0ZSIsInBpcGUiLCJfaXNIb3N0IiwidG9TdHJpbmciLCJfZW5kQ2FsbGVkIiwiX2ZpbmFsaXplUXVlcnlTdHJpbmciLCJfZW5kIiwiX3NldFVwbG9hZFRpbWVvdXQiLCJfdXBsb2FkVGltZW91dCIsIl91cGxvYWRUaW1lb3V0VGltZXIiLCJzZXRUaW1lb3V0IiwiX3RpbWVvdXRFcnJvciIsIl9hYm9ydGVkIiwiZGF0YSIsIl9zZXRUaW1lb3V0cyIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJ0aW1lZG91dCIsImhhbmRsZVByb2dyZXNzIiwiZGlyZWN0aW9uIiwiZSIsInRvdGFsIiwicGVyY2VudCIsImxvYWRlZCIsImhhc0xpc3RlbmVycyIsImFkZEV2ZW50TGlzdGVuZXIiLCJiaW5kIiwidXBsb2FkIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsIm9wZW4iLCJfd2l0aENyZWRlbnRpYWxzIiwid2l0aENyZWRlbnRpYWxzIiwiY29udGVudFR5cGUiLCJfc2VyaWFsaXplciIsInNldFJlcXVlc3RIZWFkZXIiLCJzZW5kIiwiX3NldERlZmF1bHRzIiwiZGVsIiwiZGVsZXRlIiwiZ2V0IiwiaGVhZCIsInBhdGNoIiwicG9zdCIsInB1dCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7QUFJQSxJQUFJQSxJQUFKOztBQUNBLElBQUksT0FBT0MsTUFBUCxLQUFrQixXQUF0QixFQUFtQztBQUNqQztBQUNBRCxFQUFBQSxJQUFJLEdBQUdDLE1BQVA7QUFDRCxDQUhELE1BR08sSUFBSSxPQUFPQyxJQUFQLEtBQWdCLFdBQXBCLEVBQWlDO0FBQ3RDO0FBQ0FDLEVBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUNFLHFFQURGO0FBR0FKLEVBQUFBLElBQUksU0FBSjtBQUNELENBTk0sTUFNQTtBQUNMO0FBQ0FBLEVBQUFBLElBQUksR0FBR0UsSUFBUDtBQUNEOztBQUVELElBQU1HLE9BQU8sR0FBR0MsT0FBTyxDQUFDLG1CQUFELENBQXZCOztBQUNBLElBQU1DLGFBQWEsR0FBR0QsT0FBTyxDQUFDLHFCQUFELENBQTdCOztBQUNBLElBQU1FLFdBQVcsR0FBR0YsT0FBTyxDQUFDLGdCQUFELENBQTNCOztBQUNBLElBQU1HLFFBQVEsR0FBR0gsT0FBTyxDQUFDLGFBQUQsQ0FBeEI7O0FBQ0EsSUFBTUksWUFBWSxHQUFHSixPQUFPLENBQUMsaUJBQUQsQ0FBNUI7O0FBQ0EsSUFBTUssS0FBSyxHQUFHTCxPQUFPLENBQUMsY0FBRCxDQUFyQjtBQUVBOzs7OztBQUlBLFNBQVNNLElBQVQsR0FBZ0IsQ0FBRTtBQUVsQjs7Ozs7QUFJQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCLFVBQVNDLE1BQVQsRUFBaUJDLEdBQWpCLEVBQXNCO0FBQ3JDO0FBQ0EsTUFBSSxPQUFPQSxHQUFQLEtBQWUsVUFBbkIsRUFBK0I7QUFDN0IsV0FBTyxJQUFJRixPQUFPLENBQUNHLE9BQVosQ0FBb0IsS0FBcEIsRUFBMkJGLE1BQTNCLEVBQW1DRyxHQUFuQyxDQUF1Q0YsR0FBdkMsQ0FBUDtBQUNELEdBSm9DLENBTXJDOzs7QUFDQSxNQUFJRyxTQUFTLENBQUNDLE1BQVYsS0FBcUIsQ0FBekIsRUFBNEI7QUFDMUIsV0FBTyxJQUFJTixPQUFPLENBQUNHLE9BQVosQ0FBb0IsS0FBcEIsRUFBMkJGLE1BQTNCLENBQVA7QUFDRDs7QUFFRCxTQUFPLElBQUlELE9BQU8sQ0FBQ0csT0FBWixDQUFvQkYsTUFBcEIsRUFBNEJDLEdBQTVCLENBQVA7QUFDRCxDQVpEOztBQWNBRixPQUFPLEdBQUdELE1BQU0sQ0FBQ0MsT0FBakI7QUFFQSxJQUFNTyxPQUFPLEdBQUdQLE9BQWhCO0FBRUFBLE9BQU8sQ0FBQ0csT0FBUixHQUFrQkEsT0FBbEI7QUFFQTs7OztBQUlBSSxPQUFPLENBQUNDLE1BQVIsR0FBaUIsWUFBTTtBQUNyQixNQUNFdEIsSUFBSSxDQUFDdUIsY0FBTCxLQUNDLENBQUN2QixJQUFJLENBQUN3QixRQUFOLElBQ0N4QixJQUFJLENBQUN3QixRQUFMLENBQWNDLFFBQWQsS0FBMkIsT0FENUIsSUFFQyxDQUFDekIsSUFBSSxDQUFDMEIsYUFIUixDQURGLEVBS0U7QUFDQSxXQUFPLElBQUlILGNBQUosRUFBUDtBQUNEOztBQUVELE1BQUk7QUFDRixXQUFPLElBQUlHLGFBQUosQ0FBa0IsbUJBQWxCLENBQVA7QUFDRCxHQUZELENBRUUsZ0JBQU0sQ0FBRTs7QUFFVixNQUFJO0FBQ0YsV0FBTyxJQUFJQSxhQUFKLENBQWtCLG9CQUFsQixDQUFQO0FBQ0QsR0FGRCxDQUVFLGlCQUFNLENBQUU7O0FBRVYsTUFBSTtBQUNGLFdBQU8sSUFBSUEsYUFBSixDQUFrQixvQkFBbEIsQ0FBUDtBQUNELEdBRkQsQ0FFRSxpQkFBTSxDQUFFOztBQUVWLE1BQUk7QUFDRixXQUFPLElBQUlBLGFBQUosQ0FBa0IsZ0JBQWxCLENBQVA7QUFDRCxHQUZELENBRUUsaUJBQU0sQ0FBRTs7QUFFVixRQUFNLElBQUlDLEtBQUosQ0FBVSx1REFBVixDQUFOO0FBQ0QsQ0EzQkQ7QUE2QkE7Ozs7Ozs7OztBQVFBLElBQU1DLElBQUksR0FBRyxHQUFHQSxJQUFILEdBQVUsVUFBQUMsQ0FBQztBQUFBLFNBQUlBLENBQUMsQ0FBQ0QsSUFBRixFQUFKO0FBQUEsQ0FBWCxHQUEwQixVQUFBQyxDQUFDO0FBQUEsU0FBSUEsQ0FBQyxDQUFDQyxPQUFGLENBQVUsY0FBVixFQUEwQixFQUExQixDQUFKO0FBQUEsQ0FBeEM7QUFFQTs7Ozs7Ozs7QUFRQSxTQUFTQyxTQUFULENBQW1CQyxHQUFuQixFQUF3QjtBQUN0QixNQUFJLENBQUN2QixRQUFRLENBQUN1QixHQUFELENBQWIsRUFBb0IsT0FBT0EsR0FBUDtBQUNwQixNQUFNQyxLQUFLLEdBQUcsRUFBZDs7QUFDQSxPQUFLLElBQU1DLEdBQVgsSUFBa0JGLEdBQWxCLEVBQXVCO0FBQ3JCLFFBQUlHLE1BQU0sQ0FBQ0MsU0FBUCxDQUFpQkMsY0FBakIsQ0FBZ0NDLElBQWhDLENBQXFDTixHQUFyQyxFQUEwQ0UsR0FBMUMsQ0FBSixFQUNFSyx1QkFBdUIsQ0FBQ04sS0FBRCxFQUFRQyxHQUFSLEVBQWFGLEdBQUcsQ0FBQ0UsR0FBRCxDQUFoQixDQUF2QjtBQUNIOztBQUVELFNBQU9ELEtBQUssQ0FBQ08sSUFBTixDQUFXLEdBQVgsQ0FBUDtBQUNEO0FBRUQ7Ozs7Ozs7Ozs7QUFTQSxTQUFTRCx1QkFBVCxDQUFpQ04sS0FBakMsRUFBd0NDLEdBQXhDLEVBQTZDTyxHQUE3QyxFQUFrRDtBQUNoRCxNQUFJQSxHQUFHLEtBQUtDLFNBQVosRUFBdUI7O0FBQ3ZCLE1BQUlELEdBQUcsS0FBSyxJQUFaLEVBQWtCO0FBQ2hCUixJQUFBQSxLQUFLLENBQUNVLElBQU4sQ0FBV0Msa0JBQWtCLENBQUNWLEdBQUQsQ0FBN0I7QUFDQTtBQUNEOztBQUVELE1BQUlXLEtBQUssQ0FBQ0MsT0FBTixDQUFjTCxHQUFkLENBQUosRUFBd0I7QUFDdEJBLElBQUFBLEdBQUcsQ0FBQ00sT0FBSixDQUFZLFVBQUFDLENBQUMsRUFBSTtBQUNmVCxNQUFBQSx1QkFBdUIsQ0FBQ04sS0FBRCxFQUFRQyxHQUFSLEVBQWFjLENBQWIsQ0FBdkI7QUFDRCxLQUZEO0FBR0QsR0FKRCxNQUlPLElBQUl2QyxRQUFRLENBQUNnQyxHQUFELENBQVosRUFBbUI7QUFDeEIsU0FBSyxJQUFNUSxNQUFYLElBQXFCUixHQUFyQixFQUEwQjtBQUN4QixVQUFJTixNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLGNBQWpCLENBQWdDQyxJQUFoQyxDQUFxQ0csR0FBckMsRUFBMENRLE1BQTFDLENBQUosRUFDRVYsdUJBQXVCLENBQUNOLEtBQUQsWUFBV0MsR0FBWCxjQUFrQmUsTUFBbEIsUUFBNkJSLEdBQUcsQ0FBQ1EsTUFBRCxDQUFoQyxDQUF2QjtBQUNIO0FBQ0YsR0FMTSxNQUtBO0FBQ0xoQixJQUFBQSxLQUFLLENBQUNVLElBQU4sQ0FBV0Msa0JBQWtCLENBQUNWLEdBQUQsQ0FBbEIsR0FBMEIsR0FBMUIsR0FBZ0NVLGtCQUFrQixDQUFDSCxHQUFELENBQTdEO0FBQ0Q7QUFDRjtBQUVEOzs7OztBQUlBcEIsT0FBTyxDQUFDNkIsZUFBUixHQUEwQm5CLFNBQTFCO0FBRUE7Ozs7Ozs7O0FBUUEsU0FBU29CLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCO0FBQ3hCLE1BQU1wQixHQUFHLEdBQUcsRUFBWjtBQUNBLE1BQU1DLEtBQUssR0FBR21CLEdBQUcsQ0FBQ0MsS0FBSixDQUFVLEdBQVYsQ0FBZDtBQUNBLE1BQUlDLElBQUo7QUFDQSxNQUFJQyxHQUFKOztBQUVBLE9BQUssSUFBSUMsQ0FBQyxHQUFHLENBQVIsRUFBV0MsR0FBRyxHQUFHeEIsS0FBSyxDQUFDYixNQUE1QixFQUFvQ29DLENBQUMsR0FBR0MsR0FBeEMsRUFBNkMsRUFBRUQsQ0FBL0MsRUFBa0Q7QUFDaERGLElBQUFBLElBQUksR0FBR3JCLEtBQUssQ0FBQ3VCLENBQUQsQ0FBWjtBQUNBRCxJQUFBQSxHQUFHLEdBQUdELElBQUksQ0FBQ0ksT0FBTCxDQUFhLEdBQWIsQ0FBTjs7QUFDQSxRQUFJSCxHQUFHLEtBQUssQ0FBQyxDQUFiLEVBQWdCO0FBQ2R2QixNQUFBQSxHQUFHLENBQUMyQixrQkFBa0IsQ0FBQ0wsSUFBRCxDQUFuQixDQUFILEdBQWdDLEVBQWhDO0FBQ0QsS0FGRCxNQUVPO0FBQ0x0QixNQUFBQSxHQUFHLENBQUMyQixrQkFBa0IsQ0FBQ0wsSUFBSSxDQUFDTSxLQUFMLENBQVcsQ0FBWCxFQUFjTCxHQUFkLENBQUQsQ0FBbkIsQ0FBSCxHQUE4Q0ksa0JBQWtCLENBQzlETCxJQUFJLENBQUNNLEtBQUwsQ0FBV0wsR0FBRyxHQUFHLENBQWpCLENBRDhELENBQWhFO0FBR0Q7QUFDRjs7QUFFRCxTQUFPdkIsR0FBUDtBQUNEO0FBRUQ7Ozs7O0FBSUFYLE9BQU8sQ0FBQzhCLFdBQVIsR0FBc0JBLFdBQXRCO0FBRUE7Ozs7Ozs7QUFPQTlCLE9BQU8sQ0FBQ3dDLEtBQVIsR0FBZ0I7QUFDZEMsRUFBQUEsSUFBSSxFQUFFLFdBRFE7QUFFZEMsRUFBQUEsSUFBSSxFQUFFLGtCQUZRO0FBR2RDLEVBQUFBLEdBQUcsRUFBRSxVQUhTO0FBSWRDLEVBQUFBLFVBQVUsRUFBRSxtQ0FKRTtBQUtkQyxFQUFBQSxJQUFJLEVBQUUsbUNBTFE7QUFNZCxlQUFhO0FBTkMsQ0FBaEI7QUFTQTs7Ozs7Ozs7O0FBU0E3QyxPQUFPLENBQUNVLFNBQVIsR0FBb0I7QUFDbEIsdUNBQXFDQSxTQURuQjtBQUVsQixzQkFBb0J4QjtBQUZGLENBQXBCO0FBS0E7Ozs7Ozs7OztBQVNBYyxPQUFPLENBQUM4QyxLQUFSLEdBQWdCO0FBQ2QsdUNBQXFDaEIsV0FEdkI7QUFFZCxzQkFBb0JpQixJQUFJLENBQUNEO0FBRlgsQ0FBaEI7QUFLQTs7Ozs7Ozs7O0FBU0EsU0FBU0UsV0FBVCxDQUFxQmpCLEdBQXJCLEVBQTBCO0FBQ3hCLE1BQU1rQixLQUFLLEdBQUdsQixHQUFHLENBQUNDLEtBQUosQ0FBVSxPQUFWLENBQWQ7QUFDQSxNQUFNa0IsTUFBTSxHQUFHLEVBQWY7QUFDQSxNQUFJQyxLQUFKO0FBQ0EsTUFBSUMsSUFBSjtBQUNBLE1BQUlDLEtBQUo7QUFDQSxNQUFJakMsR0FBSjs7QUFFQSxPQUFLLElBQUllLENBQUMsR0FBRyxDQUFSLEVBQVdDLEdBQUcsR0FBR2EsS0FBSyxDQUFDbEQsTUFBNUIsRUFBb0NvQyxDQUFDLEdBQUdDLEdBQXhDLEVBQTZDLEVBQUVELENBQS9DLEVBQWtEO0FBQ2hEaUIsSUFBQUEsSUFBSSxHQUFHSCxLQUFLLENBQUNkLENBQUQsQ0FBWjtBQUNBZ0IsSUFBQUEsS0FBSyxHQUFHQyxJQUFJLENBQUNmLE9BQUwsQ0FBYSxHQUFiLENBQVI7O0FBQ0EsUUFBSWMsS0FBSyxLQUFLLENBQUMsQ0FBZixFQUFrQjtBQUNoQjtBQUNBO0FBQ0Q7O0FBRURFLElBQUFBLEtBQUssR0FBR0QsSUFBSSxDQUFDYixLQUFMLENBQVcsQ0FBWCxFQUFjWSxLQUFkLEVBQXFCRyxXQUFyQixFQUFSO0FBQ0FsQyxJQUFBQSxHQUFHLEdBQUdiLElBQUksQ0FBQzZDLElBQUksQ0FBQ2IsS0FBTCxDQUFXWSxLQUFLLEdBQUcsQ0FBbkIsQ0FBRCxDQUFWO0FBQ0FELElBQUFBLE1BQU0sQ0FBQ0csS0FBRCxDQUFOLEdBQWdCakMsR0FBaEI7QUFDRDs7QUFFRCxTQUFPOEIsTUFBUDtBQUNEO0FBRUQ7Ozs7Ozs7OztBQVFBLFNBQVNLLE1BQVQsQ0FBZ0JDLElBQWhCLEVBQXNCO0FBQ3BCO0FBQ0E7QUFDQSxTQUFPLHFCQUFxQkMsSUFBckIsQ0FBMEJELElBQTFCLENBQVA7QUFDRDtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThDQSxTQUFTRSxRQUFULENBQWtCQyxHQUFsQixFQUF1QjtBQUNyQixPQUFLQSxHQUFMLEdBQVdBLEdBQVg7QUFDQSxPQUFLQyxHQUFMLEdBQVcsS0FBS0QsR0FBTCxDQUFTQyxHQUFwQixDQUZxQixDQUdyQjs7QUFDQSxPQUFLQyxJQUFMLEdBQ0csS0FBS0YsR0FBTCxDQUFTakUsTUFBVCxLQUFvQixNQUFwQixLQUNFLEtBQUtrRSxHQUFMLENBQVNFLFlBQVQsS0FBMEIsRUFBMUIsSUFBZ0MsS0FBS0YsR0FBTCxDQUFTRSxZQUFULEtBQTBCLE1BRDVELENBQUQsSUFFQSxPQUFPLEtBQUtGLEdBQUwsQ0FBU0UsWUFBaEIsS0FBaUMsV0FGakMsR0FHSSxLQUFLRixHQUFMLENBQVNHLFlBSGIsR0FJSSxJQUxOO0FBTUEsT0FBS0MsVUFBTCxHQUFrQixLQUFLTCxHQUFMLENBQVNDLEdBQVQsQ0FBYUksVUFBL0I7QUFWcUIsTUFXZkMsTUFYZSxHQVdKLEtBQUtMLEdBWEQsQ0FXZkssTUFYZSxFQVlyQjs7QUFDQSxNQUFJQSxNQUFNLEtBQUssSUFBZixFQUFxQjtBQUNuQkEsSUFBQUEsTUFBTSxHQUFHLEdBQVQ7QUFDRDs7QUFFRCxPQUFLQyxvQkFBTCxDQUEwQkQsTUFBMUI7O0FBQ0EsT0FBS0UsT0FBTCxHQUFlbkIsV0FBVyxDQUFDLEtBQUtZLEdBQUwsQ0FBU1EscUJBQVQsRUFBRCxDQUExQjtBQUNBLE9BQUtDLE1BQUwsR0FBYyxLQUFLRixPQUFuQixDQW5CcUIsQ0FvQnJCO0FBQ0E7QUFDQTs7QUFDQSxPQUFLRSxNQUFMLENBQVksY0FBWixJQUE4QixLQUFLVCxHQUFMLENBQVNVLGlCQUFULENBQTJCLGNBQTNCLENBQTlCOztBQUNBLE9BQUtDLG9CQUFMLENBQTBCLEtBQUtGLE1BQS9COztBQUVBLE1BQUksS0FBS1IsSUFBTCxLQUFjLElBQWQsSUFBc0JGLEdBQUcsQ0FBQ2EsYUFBOUIsRUFBNkM7QUFDM0MsU0FBS0MsSUFBTCxHQUFZLEtBQUtiLEdBQUwsQ0FBU2MsUUFBckI7QUFDRCxHQUZELE1BRU87QUFDTCxTQUFLRCxJQUFMLEdBQ0UsS0FBS2QsR0FBTCxDQUFTakUsTUFBVCxLQUFvQixNQUFwQixHQUNJLElBREosR0FFSSxLQUFLaUYsVUFBTCxDQUFnQixLQUFLZCxJQUFMLEdBQVksS0FBS0EsSUFBakIsR0FBd0IsS0FBS0QsR0FBTCxDQUFTYyxRQUFqRCxDQUhOO0FBSUQ7QUFDRixDLENBRUQ7OztBQUNBckYsWUFBWSxDQUFDcUUsUUFBUSxDQUFDM0MsU0FBVixDQUFaO0FBRUE7Ozs7Ozs7Ozs7O0FBV0EyQyxRQUFRLENBQUMzQyxTQUFULENBQW1CNEQsVUFBbkIsR0FBZ0MsVUFBUzVDLEdBQVQsRUFBYztBQUM1QyxNQUFJZSxLQUFLLEdBQUc5QyxPQUFPLENBQUM4QyxLQUFSLENBQWMsS0FBSzhCLElBQW5CLENBQVo7O0FBQ0EsTUFBSSxLQUFLakIsR0FBTCxDQUFTa0IsT0FBYixFQUFzQjtBQUNwQixXQUFPLEtBQUtsQixHQUFMLENBQVNrQixPQUFULENBQWlCLElBQWpCLEVBQXVCOUMsR0FBdkIsQ0FBUDtBQUNEOztBQUVELE1BQUksQ0FBQ2UsS0FBRCxJQUFVUyxNQUFNLENBQUMsS0FBS3FCLElBQU4sQ0FBcEIsRUFBaUM7QUFDL0I5QixJQUFBQSxLQUFLLEdBQUc5QyxPQUFPLENBQUM4QyxLQUFSLENBQWMsa0JBQWQsQ0FBUjtBQUNEOztBQUVELFNBQU9BLEtBQUssSUFBSWYsR0FBVCxLQUFpQkEsR0FBRyxDQUFDaEMsTUFBSixHQUFhLENBQWIsSUFBa0JnQyxHQUFHLFlBQVlqQixNQUFsRCxJQUNIZ0MsS0FBSyxDQUFDZixHQUFELENBREYsR0FFSCxJQUZKO0FBR0QsQ0FiRDtBQWVBOzs7Ozs7OztBQU9BMkIsUUFBUSxDQUFDM0MsU0FBVCxDQUFtQitELE9BQW5CLEdBQTZCLFlBQVc7QUFBQSxNQUM5Qm5CLEdBRDhCLEdBQ3RCLElBRHNCLENBQzlCQSxHQUQ4QjtBQUFBLE1BRTlCakUsTUFGOEIsR0FFbkJpRSxHQUZtQixDQUU5QmpFLE1BRjhCO0FBQUEsTUFHOUJDLEdBSDhCLEdBR3RCZ0UsR0FIc0IsQ0FHOUJoRSxHQUg4QjtBQUt0QyxNQUFNb0YsR0FBRyxvQkFBYXJGLE1BQWIsY0FBdUJDLEdBQXZCLGVBQStCLEtBQUtzRSxNQUFwQyxNQUFUO0FBQ0EsTUFBTWUsR0FBRyxHQUFHLElBQUkxRSxLQUFKLENBQVV5RSxHQUFWLENBQVo7QUFDQUMsRUFBQUEsR0FBRyxDQUFDZixNQUFKLEdBQWEsS0FBS0EsTUFBbEI7QUFDQWUsRUFBQUEsR0FBRyxDQUFDdEYsTUFBSixHQUFhQSxNQUFiO0FBQ0FzRixFQUFBQSxHQUFHLENBQUNyRixHQUFKLEdBQVVBLEdBQVY7QUFFQSxTQUFPcUYsR0FBUDtBQUNELENBWkQ7QUFjQTs7Ozs7QUFJQWhGLE9BQU8sQ0FBQzBELFFBQVIsR0FBbUJBLFFBQW5CO0FBRUE7Ozs7Ozs7O0FBUUEsU0FBUzlELE9BQVQsQ0FBaUJGLE1BQWpCLEVBQXlCQyxHQUF6QixFQUE4QjtBQUM1QixNQUFNZCxJQUFJLEdBQUcsSUFBYjtBQUNBLE9BQUtvRyxNQUFMLEdBQWMsS0FBS0EsTUFBTCxJQUFlLEVBQTdCO0FBQ0EsT0FBS3ZGLE1BQUwsR0FBY0EsTUFBZDtBQUNBLE9BQUtDLEdBQUwsR0FBV0EsR0FBWDtBQUNBLE9BQUswRSxNQUFMLEdBQWMsRUFBZCxDQUw0QixDQUtWOztBQUNsQixPQUFLYSxPQUFMLEdBQWUsRUFBZixDQU40QixDQU1UOztBQUNuQixPQUFLQyxFQUFMLENBQVEsS0FBUixFQUFlLFlBQU07QUFDbkIsUUFBSUgsR0FBRyxHQUFHLElBQVY7QUFDQSxRQUFJSSxHQUFHLEdBQUcsSUFBVjs7QUFFQSxRQUFJO0FBQ0ZBLE1BQUFBLEdBQUcsR0FBRyxJQUFJMUIsUUFBSixDQUFhN0UsSUFBYixDQUFOO0FBQ0QsS0FGRCxDQUVFLE9BQU93RyxJQUFQLEVBQWE7QUFDYkwsTUFBQUEsR0FBRyxHQUFHLElBQUkxRSxLQUFKLENBQVUsd0NBQVYsQ0FBTjtBQUNBMEUsTUFBQUEsR0FBRyxDQUFDbEMsS0FBSixHQUFZLElBQVo7QUFDQWtDLE1BQUFBLEdBQUcsQ0FBQ00sUUFBSixHQUFlRCxJQUFmLENBSGEsQ0FJYjs7QUFDQSxVQUFJeEcsSUFBSSxDQUFDK0UsR0FBVCxFQUFjO0FBQ1o7QUFDQW9CLFFBQUFBLEdBQUcsQ0FBQ08sV0FBSixHQUNFLE9BQU8xRyxJQUFJLENBQUMrRSxHQUFMLENBQVNFLFlBQWhCLEtBQWlDLFdBQWpDLEdBQ0lqRixJQUFJLENBQUMrRSxHQUFMLENBQVNHLFlBRGIsR0FFSWxGLElBQUksQ0FBQytFLEdBQUwsQ0FBU2MsUUFIZixDQUZZLENBTVo7O0FBQ0FNLFFBQUFBLEdBQUcsQ0FBQ2YsTUFBSixHQUFhcEYsSUFBSSxDQUFDK0UsR0FBTCxDQUFTSyxNQUFULEdBQWtCcEYsSUFBSSxDQUFDK0UsR0FBTCxDQUFTSyxNQUEzQixHQUFvQyxJQUFqRDtBQUNBZSxRQUFBQSxHQUFHLENBQUNRLFVBQUosR0FBaUJSLEdBQUcsQ0FBQ2YsTUFBckIsQ0FSWSxDQVFpQjtBQUM5QixPQVRELE1BU087QUFDTGUsUUFBQUEsR0FBRyxDQUFDTyxXQUFKLEdBQWtCLElBQWxCO0FBQ0FQLFFBQUFBLEdBQUcsQ0FBQ2YsTUFBSixHQUFhLElBQWI7QUFDRDs7QUFFRCxhQUFPcEYsSUFBSSxDQUFDNEcsUUFBTCxDQUFjVCxHQUFkLENBQVA7QUFDRDs7QUFFRG5HLElBQUFBLElBQUksQ0FBQzZHLElBQUwsQ0FBVSxVQUFWLEVBQXNCTixHQUF0QjtBQUVBLFFBQUlPLE9BQUo7O0FBQ0EsUUFBSTtBQUNGLFVBQUksQ0FBQzlHLElBQUksQ0FBQytHLGFBQUwsQ0FBbUJSLEdBQW5CLENBQUwsRUFBOEI7QUFDNUJPLFFBQUFBLE9BQU8sR0FBRyxJQUFJckYsS0FBSixDQUNSOEUsR0FBRyxDQUFDcEIsVUFBSixJQUFrQm9CLEdBQUcsQ0FBQ3ZCLElBQXRCLElBQThCLDRCQUR0QixDQUFWO0FBR0Q7QUFDRixLQU5ELENBTUUsT0FBT3dCLElBQVAsRUFBYTtBQUNiTSxNQUFBQSxPQUFPLEdBQUdOLElBQVYsQ0FEYSxDQUNHO0FBQ2pCLEtBdkNrQixDQXlDbkI7OztBQUNBLFFBQUlNLE9BQUosRUFBYTtBQUNYQSxNQUFBQSxPQUFPLENBQUNMLFFBQVIsR0FBbUJOLEdBQW5CO0FBQ0FXLE1BQUFBLE9BQU8sQ0FBQ2pCLFFBQVIsR0FBbUJVLEdBQW5CO0FBQ0FPLE1BQUFBLE9BQU8sQ0FBQzFCLE1BQVIsR0FBaUJtQixHQUFHLENBQUNuQixNQUFyQjtBQUNBcEYsTUFBQUEsSUFBSSxDQUFDNEcsUUFBTCxDQUFjRSxPQUFkLEVBQXVCUCxHQUF2QjtBQUNELEtBTEQsTUFLTztBQUNMdkcsTUFBQUEsSUFBSSxDQUFDNEcsUUFBTCxDQUFjLElBQWQsRUFBb0JMLEdBQXBCO0FBQ0Q7QUFDRixHQWxERDtBQW1ERDtBQUVEOzs7QUFJQTs7O0FBQ0FwRyxPQUFPLENBQUNZLE9BQU8sQ0FBQ21CLFNBQVQsQ0FBUCxDLENBQ0E7O0FBQ0E1QixXQUFXLENBQUNTLE9BQU8sQ0FBQ21CLFNBQVQsQ0FBWDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBbkIsT0FBTyxDQUFDbUIsU0FBUixDQUFrQjZELElBQWxCLEdBQXlCLFVBQVNBLElBQVQsRUFBZTtBQUN0QyxPQUFLaUIsR0FBTCxDQUFTLGNBQVQsRUFBeUI3RixPQUFPLENBQUN3QyxLQUFSLENBQWNvQyxJQUFkLEtBQXVCQSxJQUFoRDtBQUNBLFNBQU8sSUFBUDtBQUNELENBSEQ7QUFLQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBaEYsT0FBTyxDQUFDbUIsU0FBUixDQUFrQitFLE1BQWxCLEdBQTJCLFVBQVNsQixJQUFULEVBQWU7QUFDeEMsT0FBS2lCLEdBQUwsQ0FBUyxRQUFULEVBQW1CN0YsT0FBTyxDQUFDd0MsS0FBUixDQUFjb0MsSUFBZCxLQUF1QkEsSUFBMUM7QUFDQSxTQUFPLElBQVA7QUFDRCxDQUhEO0FBS0E7Ozs7Ozs7Ozs7O0FBVUFoRixPQUFPLENBQUNtQixTQUFSLENBQWtCZ0YsSUFBbEIsR0FBeUIsVUFBU0MsSUFBVCxFQUFlQyxJQUFmLEVBQXFCQyxPQUFyQixFQUE4QjtBQUNyRCxNQUFJcEcsU0FBUyxDQUFDQyxNQUFWLEtBQXFCLENBQXpCLEVBQTRCa0csSUFBSSxHQUFHLEVBQVA7O0FBQzVCLE1BQUksUUFBT0EsSUFBUCxNQUFnQixRQUFoQixJQUE0QkEsSUFBSSxLQUFLLElBQXpDLEVBQStDO0FBQzdDO0FBQ0FDLElBQUFBLE9BQU8sR0FBR0QsSUFBVjtBQUNBQSxJQUFBQSxJQUFJLEdBQUcsRUFBUDtBQUNEOztBQUVELE1BQUksQ0FBQ0MsT0FBTCxFQUFjO0FBQ1pBLElBQUFBLE9BQU8sR0FBRztBQUNSdEIsTUFBQUEsSUFBSSxFQUFFLE9BQU91QixJQUFQLEtBQWdCLFVBQWhCLEdBQTZCLE9BQTdCLEdBQXVDO0FBRHJDLEtBQVY7QUFHRDs7QUFFRCxNQUFNQyxPQUFPLEdBQUcsU0FBVkEsT0FBVSxDQUFBQyxNQUFNLEVBQUk7QUFDeEIsUUFBSSxPQUFPRixJQUFQLEtBQWdCLFVBQXBCLEVBQWdDO0FBQzlCLGFBQU9BLElBQUksQ0FBQ0UsTUFBRCxDQUFYO0FBQ0Q7O0FBRUQsVUFBTSxJQUFJL0YsS0FBSixDQUFVLCtDQUFWLENBQU47QUFDRCxHQU5EOztBQVFBLFNBQU8sS0FBS2dHLEtBQUwsQ0FBV04sSUFBWCxFQUFpQkMsSUFBakIsRUFBdUJDLE9BQXZCLEVBQWdDRSxPQUFoQyxDQUFQO0FBQ0QsQ0F2QkQ7QUF5QkE7Ozs7Ozs7Ozs7Ozs7OztBQWNBeEcsT0FBTyxDQUFDbUIsU0FBUixDQUFrQndGLEtBQWxCLEdBQTBCLFVBQVNuRixHQUFULEVBQWM7QUFDdEMsTUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBbkIsRUFBNkJBLEdBQUcsR0FBR1YsU0FBUyxDQUFDVSxHQUFELENBQWY7QUFDN0IsTUFBSUEsR0FBSixFQUFTLEtBQUs2RCxNQUFMLENBQVkzRCxJQUFaLENBQWlCRixHQUFqQjtBQUNULFNBQU8sSUFBUDtBQUNELENBSkQ7QUFNQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBeEIsT0FBTyxDQUFDbUIsU0FBUixDQUFrQnlGLE1BQWxCLEdBQTJCLFVBQVNuRCxLQUFULEVBQWdCb0QsSUFBaEIsRUFBc0JQLE9BQXRCLEVBQStCO0FBQ3hELE1BQUlPLElBQUosRUFBVTtBQUNSLFFBQUksS0FBS0MsS0FBVCxFQUFnQjtBQUNkLFlBQU0sSUFBSXBHLEtBQUosQ0FBVSw0Q0FBVixDQUFOO0FBQ0Q7O0FBRUQsU0FBS3FHLFlBQUwsR0FBb0JDLE1BQXBCLENBQTJCdkQsS0FBM0IsRUFBa0NvRCxJQUFsQyxFQUF3Q1AsT0FBTyxJQUFJTyxJQUFJLENBQUNJLElBQXhEO0FBQ0Q7O0FBRUQsU0FBTyxJQUFQO0FBQ0QsQ0FWRDs7QUFZQWpILE9BQU8sQ0FBQ21CLFNBQVIsQ0FBa0I0RixZQUFsQixHQUFpQyxZQUFXO0FBQzFDLE1BQUksQ0FBQyxLQUFLRyxTQUFWLEVBQXFCO0FBQ25CLFNBQUtBLFNBQUwsR0FBaUIsSUFBSW5JLElBQUksQ0FBQ29JLFFBQVQsRUFBakI7QUFDRDs7QUFFRCxTQUFPLEtBQUtELFNBQVo7QUFDRCxDQU5EO0FBUUE7Ozs7Ozs7Ozs7QUFTQWxILE9BQU8sQ0FBQ21CLFNBQVIsQ0FBa0IwRSxRQUFsQixHQUE2QixVQUFTVCxHQUFULEVBQWNJLEdBQWQsRUFBbUI7QUFDOUMsTUFBSSxLQUFLNEIsWUFBTCxDQUFrQmhDLEdBQWxCLEVBQXVCSSxHQUF2QixDQUFKLEVBQWlDO0FBQy9CLFdBQU8sS0FBSzZCLE1BQUwsRUFBUDtBQUNEOztBQUVELE1BQU1DLEVBQUUsR0FBRyxLQUFLQyxTQUFoQjtBQUNBLE9BQUtDLFlBQUw7O0FBRUEsTUFBSXBDLEdBQUosRUFBUztBQUNQLFFBQUksS0FBS3FDLFdBQVQsRUFBc0JyQyxHQUFHLENBQUNzQyxPQUFKLEdBQWMsS0FBS0MsUUFBTCxHQUFnQixDQUE5QjtBQUN0QixTQUFLN0IsSUFBTCxDQUFVLE9BQVYsRUFBbUJWLEdBQW5CO0FBQ0Q7O0FBRURrQyxFQUFBQSxFQUFFLENBQUNsQyxHQUFELEVBQU1JLEdBQU4sQ0FBRjtBQUNELENBZEQ7QUFnQkE7Ozs7Ozs7QUFNQXhGLE9BQU8sQ0FBQ21CLFNBQVIsQ0FBa0J5RyxnQkFBbEIsR0FBcUMsWUFBVztBQUM5QyxNQUFNeEMsR0FBRyxHQUFHLElBQUkxRSxLQUFKLENBQ1YsOEpBRFUsQ0FBWjtBQUdBMEUsRUFBQUEsR0FBRyxDQUFDeUMsV0FBSixHQUFrQixJQUFsQjtBQUVBekMsRUFBQUEsR0FBRyxDQUFDZixNQUFKLEdBQWEsS0FBS0EsTUFBbEI7QUFDQWUsRUFBQUEsR0FBRyxDQUFDdEYsTUFBSixHQUFhLEtBQUtBLE1BQWxCO0FBQ0FzRixFQUFBQSxHQUFHLENBQUNyRixHQUFKLEdBQVUsS0FBS0EsR0FBZjtBQUVBLE9BQUs4RixRQUFMLENBQWNULEdBQWQ7QUFDRCxDQVhELEMsQ0FhQTs7O0FBQ0FwRixPQUFPLENBQUNtQixTQUFSLENBQWtCMkcsS0FBbEIsR0FBMEIsWUFBVztBQUNuQzVJLEVBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLHdEQUFiO0FBQ0EsU0FBTyxJQUFQO0FBQ0QsQ0FIRDs7QUFLQWEsT0FBTyxDQUFDbUIsU0FBUixDQUFrQjRHLEVBQWxCLEdBQXVCL0gsT0FBTyxDQUFDbUIsU0FBUixDQUFrQjJHLEtBQXpDO0FBQ0E5SCxPQUFPLENBQUNtQixTQUFSLENBQWtCNkcsTUFBbEIsR0FBMkJoSSxPQUFPLENBQUNtQixTQUFSLENBQWtCNEcsRUFBN0MsQyxDQUVBOztBQUNBL0gsT0FBTyxDQUFDbUIsU0FBUixDQUFrQjhHLEtBQWxCLEdBQTBCLFlBQU07QUFDOUIsUUFBTSxJQUFJdkgsS0FBSixDQUNKLDZEQURJLENBQU47QUFHRCxDQUpEOztBQU1BVixPQUFPLENBQUNtQixTQUFSLENBQWtCK0csSUFBbEIsR0FBeUJsSSxPQUFPLENBQUNtQixTQUFSLENBQWtCOEcsS0FBM0M7QUFFQTs7Ozs7Ozs7O0FBUUFqSSxPQUFPLENBQUNtQixTQUFSLENBQWtCZ0gsT0FBbEIsR0FBNEIsVUFBU3BILEdBQVQsRUFBYztBQUN4QztBQUNBLFNBQ0VBLEdBQUcsSUFDSCxRQUFPQSxHQUFQLE1BQWUsUUFEZixJQUVBLENBQUNhLEtBQUssQ0FBQ0MsT0FBTixDQUFjZCxHQUFkLENBRkQsSUFHQUcsTUFBTSxDQUFDQyxTQUFQLENBQWlCaUgsUUFBakIsQ0FBMEIvRyxJQUExQixDQUErQk4sR0FBL0IsTUFBd0MsaUJBSjFDO0FBTUQsQ0FSRDtBQVVBOzs7Ozs7Ozs7O0FBU0FmLE9BQU8sQ0FBQ21CLFNBQVIsQ0FBa0JsQixHQUFsQixHQUF3QixVQUFTcUgsRUFBVCxFQUFhO0FBQ25DLE1BQUksS0FBS2UsVUFBVCxFQUFxQjtBQUNuQm5KLElBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUNFLHVFQURGO0FBR0Q7O0FBRUQsT0FBS2tKLFVBQUwsR0FBa0IsSUFBbEIsQ0FQbUMsQ0FTbkM7O0FBQ0EsT0FBS2QsU0FBTCxHQUFpQkQsRUFBRSxJQUFJM0gsSUFBdkIsQ0FWbUMsQ0FZbkM7O0FBQ0EsT0FBSzJJLG9CQUFMOztBQUVBLE9BQUtDLElBQUw7QUFDRCxDQWhCRDs7QUFrQkF2SSxPQUFPLENBQUNtQixTQUFSLENBQWtCcUgsaUJBQWxCLEdBQXNDLFlBQVc7QUFDL0MsTUFBTXZKLElBQUksR0FBRyxJQUFiLENBRCtDLENBRy9DOztBQUNBLE1BQUksS0FBS3dKLGNBQUwsSUFBdUIsQ0FBQyxLQUFLQyxtQkFBakMsRUFBc0Q7QUFDcEQsU0FBS0EsbUJBQUwsR0FBMkJDLFVBQVUsQ0FBQyxZQUFNO0FBQzFDMUosTUFBQUEsSUFBSSxDQUFDMkosYUFBTCxDQUNFLG9CQURGLEVBRUUzSixJQUFJLENBQUN3SixjQUZQLEVBR0UsV0FIRjtBQUtELEtBTm9DLEVBTWxDLEtBQUtBLGNBTjZCLENBQXJDO0FBT0Q7QUFDRixDQWJELEMsQ0FlQTs7O0FBQ0F6SSxPQUFPLENBQUNtQixTQUFSLENBQWtCb0gsSUFBbEIsR0FBeUIsWUFBVztBQUNsQyxNQUFJLEtBQUtNLFFBQVQsRUFDRSxPQUFPLEtBQUtoRCxRQUFMLENBQ0wsSUFBSW5GLEtBQUosQ0FBVSw0REFBVixDQURLLENBQVA7QUFJRixNQUFNekIsSUFBSSxHQUFHLElBQWI7QUFDQSxPQUFLK0UsR0FBTCxHQUFXNUQsT0FBTyxDQUFDQyxNQUFSLEVBQVg7QUFQa0MsTUFRMUIyRCxHQVIwQixHQVFsQixJQVJrQixDQVExQkEsR0FSMEI7QUFTbEMsTUFBSThFLElBQUksR0FBRyxLQUFLNUIsU0FBTCxJQUFrQixLQUFLSixLQUFsQzs7QUFFQSxPQUFLaUMsWUFBTCxHQVhrQyxDQWFsQzs7O0FBQ0EvRSxFQUFBQSxHQUFHLENBQUNnRixrQkFBSixHQUF5QixZQUFNO0FBQUEsUUFDckJDLFVBRHFCLEdBQ05qRixHQURNLENBQ3JCaUYsVUFEcUI7O0FBRTdCLFFBQUlBLFVBQVUsSUFBSSxDQUFkLElBQW1CaEssSUFBSSxDQUFDaUsscUJBQTVCLEVBQW1EO0FBQ2pEMUIsTUFBQUEsWUFBWSxDQUFDdkksSUFBSSxDQUFDaUsscUJBQU4sQ0FBWjtBQUNEOztBQUVELFFBQUlELFVBQVUsS0FBSyxDQUFuQixFQUFzQjtBQUNwQjtBQUNELEtBUjRCLENBVTdCO0FBQ0E7OztBQUNBLFFBQUk1RSxNQUFKOztBQUNBLFFBQUk7QUFDRkEsTUFBQUEsTUFBTSxHQUFHTCxHQUFHLENBQUNLLE1BQWI7QUFDRCxLQUZELENBRUUsaUJBQU07QUFDTkEsTUFBQUEsTUFBTSxHQUFHLENBQVQ7QUFDRDs7QUFFRCxRQUFJLENBQUNBLE1BQUwsRUFBYTtBQUNYLFVBQUlwRixJQUFJLENBQUNrSyxRQUFMLElBQWlCbEssSUFBSSxDQUFDNEosUUFBMUIsRUFBb0M7QUFDcEMsYUFBTzVKLElBQUksQ0FBQzJJLGdCQUFMLEVBQVA7QUFDRDs7QUFFRDNJLElBQUFBLElBQUksQ0FBQzZHLElBQUwsQ0FBVSxLQUFWO0FBQ0QsR0F6QkQsQ0Fka0MsQ0F5Q2xDOzs7QUFDQSxNQUFNc0QsY0FBYyxHQUFHLFNBQWpCQSxjQUFpQixDQUFDQyxTQUFELEVBQVlDLENBQVosRUFBa0I7QUFDdkMsUUFBSUEsQ0FBQyxDQUFDQyxLQUFGLEdBQVUsQ0FBZCxFQUFpQjtBQUNmRCxNQUFBQSxDQUFDLENBQUNFLE9BQUYsR0FBYUYsQ0FBQyxDQUFDRyxNQUFGLEdBQVdILENBQUMsQ0FBQ0MsS0FBZCxHQUF1QixHQUFuQzs7QUFFQSxVQUFJRCxDQUFDLENBQUNFLE9BQUYsS0FBYyxHQUFsQixFQUF1QjtBQUNyQmhDLFFBQUFBLFlBQVksQ0FBQ3ZJLElBQUksQ0FBQ3lKLG1CQUFOLENBQVo7QUFDRDtBQUNGOztBQUVEWSxJQUFBQSxDQUFDLENBQUNELFNBQUYsR0FBY0EsU0FBZDtBQUNBcEssSUFBQUEsSUFBSSxDQUFDNkcsSUFBTCxDQUFVLFVBQVYsRUFBc0J3RCxDQUF0QjtBQUNELEdBWEQ7O0FBYUEsTUFBSSxLQUFLSSxZQUFMLENBQWtCLFVBQWxCLENBQUosRUFBbUM7QUFDakMsUUFBSTtBQUNGMUYsTUFBQUEsR0FBRyxDQUFDMkYsZ0JBQUosQ0FBcUIsVUFBckIsRUFBaUNQLGNBQWMsQ0FBQ1EsSUFBZixDQUFvQixJQUFwQixFQUEwQixVQUExQixDQUFqQzs7QUFDQSxVQUFJNUYsR0FBRyxDQUFDNkYsTUFBUixFQUFnQjtBQUNkN0YsUUFBQUEsR0FBRyxDQUFDNkYsTUFBSixDQUFXRixnQkFBWCxDQUNFLFVBREYsRUFFRVAsY0FBYyxDQUFDUSxJQUFmLENBQW9CLElBQXBCLEVBQTBCLFFBQTFCLENBRkY7QUFJRDtBQUNGLEtBUkQsQ0FRRSxpQkFBTSxDQUNOO0FBQ0E7QUFDQTtBQUNEO0FBQ0Y7O0FBRUQsTUFBSTVGLEdBQUcsQ0FBQzZGLE1BQVIsRUFBZ0I7QUFDZCxTQUFLckIsaUJBQUw7QUFDRCxHQXpFaUMsQ0EyRWxDOzs7QUFDQSxNQUFJO0FBQ0YsUUFBSSxLQUFLc0IsUUFBTCxJQUFpQixLQUFLQyxRQUExQixFQUFvQztBQUNsQy9GLE1BQUFBLEdBQUcsQ0FBQ2dHLElBQUosQ0FBUyxLQUFLbEssTUFBZCxFQUFzQixLQUFLQyxHQUEzQixFQUFnQyxJQUFoQyxFQUFzQyxLQUFLK0osUUFBM0MsRUFBcUQsS0FBS0MsUUFBMUQ7QUFDRCxLQUZELE1BRU87QUFDTC9GLE1BQUFBLEdBQUcsQ0FBQ2dHLElBQUosQ0FBUyxLQUFLbEssTUFBZCxFQUFzQixLQUFLQyxHQUEzQixFQUFnQyxJQUFoQztBQUNEO0FBQ0YsR0FORCxDQU1FLE9BQU9xRixHQUFQLEVBQVk7QUFDWjtBQUNBLFdBQU8sS0FBS1MsUUFBTCxDQUFjVCxHQUFkLENBQVA7QUFDRCxHQXJGaUMsQ0F1RmxDOzs7QUFDQSxNQUFJLEtBQUs2RSxnQkFBVCxFQUEyQmpHLEdBQUcsQ0FBQ2tHLGVBQUosR0FBc0IsSUFBdEIsQ0F4Rk8sQ0EwRmxDOztBQUNBLE1BQ0UsQ0FBQyxLQUFLaEQsU0FBTixJQUNBLEtBQUtwSCxNQUFMLEtBQWdCLEtBRGhCLElBRUEsS0FBS0EsTUFBTCxLQUFnQixNQUZoQixJQUdBLE9BQU9nSixJQUFQLEtBQWdCLFFBSGhCLElBSUEsQ0FBQyxLQUFLWCxPQUFMLENBQWFXLElBQWIsQ0FMSCxFQU1FO0FBQ0E7QUFDQSxRQUFNcUIsV0FBVyxHQUFHLEtBQUs3RSxPQUFMLENBQWEsY0FBYixDQUFwQjs7QUFDQSxRQUFJeEUsVUFBUyxHQUNYLEtBQUtzSixXQUFMLElBQ0FoSyxPQUFPLENBQUNVLFNBQVIsQ0FBa0JxSixXQUFXLEdBQUdBLFdBQVcsQ0FBQy9ILEtBQVosQ0FBa0IsR0FBbEIsRUFBdUIsQ0FBdkIsQ0FBSCxHQUErQixFQUE1RCxDQUZGOztBQUdBLFFBQUksQ0FBQ3RCLFVBQUQsSUFBYzZDLE1BQU0sQ0FBQ3dHLFdBQUQsQ0FBeEIsRUFBdUM7QUFDckNySixNQUFBQSxVQUFTLEdBQUdWLE9BQU8sQ0FBQ1UsU0FBUixDQUFrQixrQkFBbEIsQ0FBWjtBQUNEOztBQUVELFFBQUlBLFVBQUosRUFBZWdJLElBQUksR0FBR2hJLFVBQVMsQ0FBQ2dJLElBQUQsQ0FBaEI7QUFDaEIsR0E1R2lDLENBOEdsQzs7O0FBQ0EsT0FBSyxJQUFNckYsS0FBWCxJQUFvQixLQUFLZ0IsTUFBekIsRUFBaUM7QUFDL0IsUUFBSSxLQUFLQSxNQUFMLENBQVloQixLQUFaLE1BQXVCLElBQTNCLEVBQWlDO0FBRWpDLFFBQUl2QyxNQUFNLENBQUNDLFNBQVAsQ0FBaUJDLGNBQWpCLENBQWdDQyxJQUFoQyxDQUFxQyxLQUFLb0QsTUFBMUMsRUFBa0RoQixLQUFsRCxDQUFKLEVBQ0VPLEdBQUcsQ0FBQ3FHLGdCQUFKLENBQXFCNUcsS0FBckIsRUFBNEIsS0FBS2dCLE1BQUwsQ0FBWWhCLEtBQVosQ0FBNUI7QUFDSDs7QUFFRCxNQUFJLEtBQUttQixhQUFULEVBQXdCO0FBQ3RCWixJQUFBQSxHQUFHLENBQUNFLFlBQUosR0FBbUIsS0FBS1UsYUFBeEI7QUFDRCxHQXhIaUMsQ0EwSGxDOzs7QUFDQSxPQUFLa0IsSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBckIsRUEzSGtDLENBNkhsQztBQUNBOztBQUNBOUIsRUFBQUEsR0FBRyxDQUFDc0csSUFBSixDQUFTLE9BQU94QixJQUFQLEtBQWdCLFdBQWhCLEdBQThCLElBQTlCLEdBQXFDQSxJQUE5QztBQUNELENBaElEOztBQWtJQTFJLE9BQU8sQ0FBQzBILEtBQVIsR0FBZ0I7QUFBQSxTQUFNLElBQUlwSSxLQUFKLEVBQU47QUFBQSxDQUFoQjs7QUFFQSxDQUFDLEtBQUQsRUFBUSxNQUFSLEVBQWdCLFNBQWhCLEVBQTJCLE9BQTNCLEVBQW9DLEtBQXBDLEVBQTJDLFFBQTNDLEVBQXFEb0MsT0FBckQsQ0FBNkQsVUFBQWhDLE1BQU0sRUFBSTtBQUNyRUosRUFBQUEsS0FBSyxDQUFDeUIsU0FBTixDQUFnQnJCLE1BQU0sQ0FBQzRELFdBQVAsRUFBaEIsSUFBd0MsVUFBUzNELEdBQVQsRUFBY3VILEVBQWQsRUFBa0I7QUFDeEQsUUFBTXZELEdBQUcsR0FBRyxJQUFJM0QsT0FBTyxDQUFDSixPQUFaLENBQW9CRixNQUFwQixFQUE0QkMsR0FBNUIsQ0FBWjs7QUFDQSxTQUFLd0ssWUFBTCxDQUFrQnhHLEdBQWxCOztBQUNBLFFBQUl1RCxFQUFKLEVBQVE7QUFDTnZELE1BQUFBLEdBQUcsQ0FBQzlELEdBQUosQ0FBUXFILEVBQVI7QUFDRDs7QUFFRCxXQUFPdkQsR0FBUDtBQUNELEdBUkQ7QUFTRCxDQVZEO0FBWUFyRSxLQUFLLENBQUN5QixTQUFOLENBQWdCcUosR0FBaEIsR0FBc0I5SyxLQUFLLENBQUN5QixTQUFOLENBQWdCc0osTUFBdEM7QUFFQTs7Ozs7Ozs7OztBQVVBckssT0FBTyxDQUFDc0ssR0FBUixHQUFjLFVBQUMzSyxHQUFELEVBQU0rSSxJQUFOLEVBQVl4QixFQUFaLEVBQW1CO0FBQy9CLE1BQU12RCxHQUFHLEdBQUczRCxPQUFPLENBQUMsS0FBRCxFQUFRTCxHQUFSLENBQW5COztBQUNBLE1BQUksT0FBTytJLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDOUJ4QixJQUFBQSxFQUFFLEdBQUd3QixJQUFMO0FBQ0FBLElBQUFBLElBQUksR0FBRyxJQUFQO0FBQ0Q7O0FBRUQsTUFBSUEsSUFBSixFQUFVL0UsR0FBRyxDQUFDNEMsS0FBSixDQUFVbUMsSUFBVjtBQUNWLE1BQUl4QixFQUFKLEVBQVF2RCxHQUFHLENBQUM5RCxHQUFKLENBQVFxSCxFQUFSO0FBQ1IsU0FBT3ZELEdBQVA7QUFDRCxDQVZEO0FBWUE7Ozs7Ozs7Ozs7O0FBVUEzRCxPQUFPLENBQUN1SyxJQUFSLEdBQWUsVUFBQzVLLEdBQUQsRUFBTStJLElBQU4sRUFBWXhCLEVBQVosRUFBbUI7QUFDaEMsTUFBTXZELEdBQUcsR0FBRzNELE9BQU8sQ0FBQyxNQUFELEVBQVNMLEdBQVQsQ0FBbkI7O0FBQ0EsTUFBSSxPQUFPK0ksSUFBUCxLQUFnQixVQUFwQixFQUFnQztBQUM5QnhCLElBQUFBLEVBQUUsR0FBR3dCLElBQUw7QUFDQUEsSUFBQUEsSUFBSSxHQUFHLElBQVA7QUFDRDs7QUFFRCxNQUFJQSxJQUFKLEVBQVUvRSxHQUFHLENBQUM0QyxLQUFKLENBQVVtQyxJQUFWO0FBQ1YsTUFBSXhCLEVBQUosRUFBUXZELEdBQUcsQ0FBQzlELEdBQUosQ0FBUXFILEVBQVI7QUFDUixTQUFPdkQsR0FBUDtBQUNELENBVkQ7QUFZQTs7Ozs7Ozs7Ozs7QUFVQTNELE9BQU8sQ0FBQ2tHLE9BQVIsR0FBa0IsVUFBQ3ZHLEdBQUQsRUFBTStJLElBQU4sRUFBWXhCLEVBQVosRUFBbUI7QUFDbkMsTUFBTXZELEdBQUcsR0FBRzNELE9BQU8sQ0FBQyxTQUFELEVBQVlMLEdBQVosQ0FBbkI7O0FBQ0EsTUFBSSxPQUFPK0ksSUFBUCxLQUFnQixVQUFwQixFQUFnQztBQUM5QnhCLElBQUFBLEVBQUUsR0FBR3dCLElBQUw7QUFDQUEsSUFBQUEsSUFBSSxHQUFHLElBQVA7QUFDRDs7QUFFRCxNQUFJQSxJQUFKLEVBQVUvRSxHQUFHLENBQUN1RyxJQUFKLENBQVN4QixJQUFUO0FBQ1YsTUFBSXhCLEVBQUosRUFBUXZELEdBQUcsQ0FBQzlELEdBQUosQ0FBUXFILEVBQVI7QUFDUixTQUFPdkQsR0FBUDtBQUNELENBVkQ7QUFZQTs7Ozs7Ozs7Ozs7QUFVQSxTQUFTeUcsR0FBVCxDQUFhekssR0FBYixFQUFrQitJLElBQWxCLEVBQXdCeEIsRUFBeEIsRUFBNEI7QUFDMUIsTUFBTXZELEdBQUcsR0FBRzNELE9BQU8sQ0FBQyxRQUFELEVBQVdMLEdBQVgsQ0FBbkI7O0FBQ0EsTUFBSSxPQUFPK0ksSUFBUCxLQUFnQixVQUFwQixFQUFnQztBQUM5QnhCLElBQUFBLEVBQUUsR0FBR3dCLElBQUw7QUFDQUEsSUFBQUEsSUFBSSxHQUFHLElBQVA7QUFDRDs7QUFFRCxNQUFJQSxJQUFKLEVBQVUvRSxHQUFHLENBQUN1RyxJQUFKLENBQVN4QixJQUFUO0FBQ1YsTUFBSXhCLEVBQUosRUFBUXZELEdBQUcsQ0FBQzlELEdBQUosQ0FBUXFILEVBQVI7QUFDUixTQUFPdkQsR0FBUDtBQUNEOztBQUVEM0QsT0FBTyxDQUFDb0ssR0FBUixHQUFjQSxHQUFkO0FBQ0FwSyxPQUFPLENBQUNxSyxNQUFSLEdBQWlCRCxHQUFqQjtBQUVBOzs7Ozs7Ozs7O0FBVUFwSyxPQUFPLENBQUN3SyxLQUFSLEdBQWdCLFVBQUM3SyxHQUFELEVBQU0rSSxJQUFOLEVBQVl4QixFQUFaLEVBQW1CO0FBQ2pDLE1BQU12RCxHQUFHLEdBQUczRCxPQUFPLENBQUMsT0FBRCxFQUFVTCxHQUFWLENBQW5COztBQUNBLE1BQUksT0FBTytJLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDOUJ4QixJQUFBQSxFQUFFLEdBQUd3QixJQUFMO0FBQ0FBLElBQUFBLElBQUksR0FBRyxJQUFQO0FBQ0Q7O0FBRUQsTUFBSUEsSUFBSixFQUFVL0UsR0FBRyxDQUFDdUcsSUFBSixDQUFTeEIsSUFBVDtBQUNWLE1BQUl4QixFQUFKLEVBQVF2RCxHQUFHLENBQUM5RCxHQUFKLENBQVFxSCxFQUFSO0FBQ1IsU0FBT3ZELEdBQVA7QUFDRCxDQVZEO0FBWUE7Ozs7Ozs7Ozs7O0FBVUEzRCxPQUFPLENBQUN5SyxJQUFSLEdBQWUsVUFBQzlLLEdBQUQsRUFBTStJLElBQU4sRUFBWXhCLEVBQVosRUFBbUI7QUFDaEMsTUFBTXZELEdBQUcsR0FBRzNELE9BQU8sQ0FBQyxNQUFELEVBQVNMLEdBQVQsQ0FBbkI7O0FBQ0EsTUFBSSxPQUFPK0ksSUFBUCxLQUFnQixVQUFwQixFQUFnQztBQUM5QnhCLElBQUFBLEVBQUUsR0FBR3dCLElBQUw7QUFDQUEsSUFBQUEsSUFBSSxHQUFHLElBQVA7QUFDRDs7QUFFRCxNQUFJQSxJQUFKLEVBQVUvRSxHQUFHLENBQUN1RyxJQUFKLENBQVN4QixJQUFUO0FBQ1YsTUFBSXhCLEVBQUosRUFBUXZELEdBQUcsQ0FBQzlELEdBQUosQ0FBUXFILEVBQVI7QUFDUixTQUFPdkQsR0FBUDtBQUNELENBVkQ7QUFZQTs7Ozs7Ozs7Ozs7QUFVQTNELE9BQU8sQ0FBQzBLLEdBQVIsR0FBYyxVQUFDL0ssR0FBRCxFQUFNK0ksSUFBTixFQUFZeEIsRUFBWixFQUFtQjtBQUMvQixNQUFNdkQsR0FBRyxHQUFHM0QsT0FBTyxDQUFDLEtBQUQsRUFBUUwsR0FBUixDQUFuQjs7QUFDQSxNQUFJLE9BQU8rSSxJQUFQLEtBQWdCLFVBQXBCLEVBQWdDO0FBQzlCeEIsSUFBQUEsRUFBRSxHQUFHd0IsSUFBTDtBQUNBQSxJQUFBQSxJQUFJLEdBQUcsSUFBUDtBQUNEOztBQUVELE1BQUlBLElBQUosRUFBVS9FLEdBQUcsQ0FBQ3VHLElBQUosQ0FBU3hCLElBQVQ7QUFDVixNQUFJeEIsRUFBSixFQUFRdkQsR0FBRyxDQUFDOUQsR0FBSixDQUFRcUgsRUFBUjtBQUNSLFNBQU92RCxHQUFQO0FBQ0QsQ0FWRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogUm9vdCByZWZlcmVuY2UgZm9yIGlmcmFtZXMuXG4gKi9cblxubGV0IHJvb3Q7XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgLy8gQnJvd3NlciB3aW5kb3dcbiAgcm9vdCA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgPT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIE90aGVyIGVudmlyb25tZW50c1xuICBjb25zb2xlLndhcm4oXG4gICAgJ1VzaW5nIGJyb3dzZXItb25seSB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQgaW4gbm9uLWJyb3dzZXIgZW52aXJvbm1lbnQnXG4gICk7XG4gIHJvb3QgPSB0aGlzO1xufSBlbHNlIHtcbiAgLy8gV2ViIFdvcmtlclxuICByb290ID0gc2VsZjtcbn1cblxuY29uc3QgRW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG5jb25zdCBzYWZlU3RyaW5naWZ5ID0gcmVxdWlyZSgnZmFzdC1zYWZlLXN0cmluZ2lmeScpO1xuY29uc3QgUmVxdWVzdEJhc2UgPSByZXF1aXJlKCcuL3JlcXVlc3QtYmFzZScpO1xuY29uc3QgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzLW9iamVjdCcpO1xuY29uc3QgUmVzcG9uc2VCYXNlID0gcmVxdWlyZSgnLi9yZXNwb25zZS1iYXNlJyk7XG5jb25zdCBBZ2VudCA9IHJlcXVpcmUoJy4vYWdlbnQtYmFzZScpO1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbi8qKlxuICogRXhwb3NlIGByZXF1ZXN0YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1ldGhvZCwgdXJsKSB7XG4gIC8vIGNhbGxiYWNrXG4gIGlmICh0eXBlb2YgdXJsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QoJ0dFVCcsIG1ldGhvZCkuZW5kKHVybCk7XG4gIH1cblxuICAvLyB1cmwgZmlyc3RcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbn07XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cztcblxuY29uc3QgcmVxdWVzdCA9IGV4cG9ydHM7XG5cbmV4cG9ydHMuUmVxdWVzdCA9IFJlcXVlc3Q7XG5cbi8qKlxuICogRGV0ZXJtaW5lIFhIUi5cbiAqL1xuXG5yZXF1ZXN0LmdldFhIUiA9ICgpID0+IHtcbiAgaWYgKFxuICAgIHJvb3QuWE1MSHR0cFJlcXVlc3QgJiZcbiAgICAoIXJvb3QubG9jYXRpb24gfHxcbiAgICAgIHJvb3QubG9jYXRpb24ucHJvdG9jb2wgIT09ICdmaWxlOicgfHxcbiAgICAgICFyb290LkFjdGl2ZVhPYmplY3QpXG4gICkge1xuICAgIHJldHVybiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpO1xuICB9IGNhdGNoIHt9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjYuMCcpO1xuICB9IGNhdGNoIHt9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpO1xuICB9IGNhdGNoIHt9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7XG4gIH0gY2F0Y2gge31cblxuICB0aHJvdyBuZXcgRXJyb3IoJ0Jyb3dzZXItb25seSB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQgY291bGQgbm90IGZpbmQgWEhSJyk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuY29uc3QgdHJpbSA9ICcnLnRyaW0gPyBzID0+IHMudHJpbSgpIDogcyA9PiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpO1xuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIGNvbnN0IHBhaXJzID0gW107XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKVxuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgb2JqW2tleV0pO1xuICB9XG5cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBIZWxwcyAnc2VyaWFsaXplJyB3aXRoIHNlcmlhbGl6aW5nIGFycmF5cy5cbiAqIE11dGF0ZXMgdGhlIHBhaXJzIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2YWwpIHtcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgdmFsLmZvckVhY2godiA9PiB7XG4gICAgICBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2KTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChpc09iamVjdCh2YWwpKSB7XG4gICAgZm9yIChjb25zdCBzdWJrZXkgaW4gdmFsKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbCwgc3Via2V5KSlcbiAgICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGAke2tleX1bJHtzdWJrZXl9XWAsIHZhbFtzdWJrZXldKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcGFpcnMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpKTtcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9zZSBzZXJpYWxpemF0aW9uIG1ldGhvZC5cbiAqL1xuXG5yZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4geC13d3ctZm9ybS11cmxlbmNvZGVkIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICBjb25zdCBvYmogPSB7fTtcbiAgY29uc3QgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgbGV0IHBhaXI7XG4gIGxldCBwb3M7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldO1xuICAgIHBvcyA9IHBhaXIuaW5kZXhPZignPScpO1xuICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIpXSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhaXIuc2xpY2UoMCwgcG9zKSldID0gZGVjb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICBwYWlyLnNsaWNlKHBvcyArIDEpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICd0ZXh0L3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICBmb3JtOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxucmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBzZXJpYWxpemUsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogc2FmZVN0cmluZ2lmeVxufTtcblxuLyoqXG4gKiBEZWZhdWx0IHBhcnNlcnMuXG4gKlxuICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAqICAgICB9O1xuICpcbiAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICBjb25zdCBsaW5lcyA9IHN0ci5zcGxpdCgvXFxyP1xcbi8pO1xuICBjb25zdCBmaWVsZHMgPSB7fTtcbiAgbGV0IGluZGV4O1xuICBsZXQgbGluZTtcbiAgbGV0IGZpZWxkO1xuICBsZXQgdmFsO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICBpbmRleCA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgIC8vIGNvdWxkIGJlIGVtcHR5IGxpbmUsIGp1c3Qgc2tpcCBpdFxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgLy8gc2hvdWxkIG1hdGNoIC9qc29uIG9yICtqc29uXG4gIC8vIGJ1dCBub3QgL2pzb24tc2VxXG4gIHJldHVybiAvWy8rXWpzb24oJHxbXi1cXHddKS8udGVzdChtaW1lKTtcbn1cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZWAgd2l0aCB0aGUgZ2l2ZW4gYHhocmAuXG4gKlxuICogIC0gc2V0IGZsYWdzICgub2ssIC5lcnJvciwgZXRjKVxuICogIC0gcGFyc2UgaGVhZGVyXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogIEFsaWFzaW5nIGBzdXBlcmFnZW50YCBhcyBgcmVxdWVzdGAgaXMgbmljZTpcbiAqXG4gKiAgICAgIHJlcXVlc3QgPSBzdXBlcmFnZW50O1xuICpcbiAqICBXZSBjYW4gdXNlIHRoZSBwcm9taXNlLWxpa2UgQVBJLCBvciBwYXNzIGNhbGxiYWNrczpcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJykuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvJywgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgU2VuZGluZyBkYXRhIGNhbiBiZSBjaGFpbmVkOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5zZW5kKClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnBvc3QoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIE9yIGZ1cnRoZXIgcmVkdWNlZCB0byBhIHNpbmdsZSBjYWxsIGZvciBzaW1wbGUgY2FzZXM6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJywgeyBuYW1lOiAndGonIH0sIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogQHBhcmFtIHtYTUxIVFRQUmVxdWVzdH0geGhyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2UocmVxKSB7XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPVxuICAgICh0aGlzLnJlcS5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgICAgKHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJycgfHwgdGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAndGV4dCcpKSB8fFxuICAgIHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnXG4gICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICAgOiBudWxsO1xuICB0aGlzLnN0YXR1c1RleHQgPSB0aGlzLnJlcS54aHIuc3RhdHVzVGV4dDtcbiAgbGV0IHsgc3RhdHVzIH0gPSB0aGlzLnhocjtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyhzdGF0dXMpO1xuICB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIHRoaXMuaGVhZGVyID0gdGhpcy5oZWFkZXJzO1xuICAvLyBnZXRBbGxSZXNwb25zZUhlYWRlcnMgc29tZXRpbWVzIGZhbHNlbHkgcmV0dXJucyBcIlwiIGZvciBDT1JTIHJlcXVlc3RzLCBidXRcbiAgLy8gZ2V0UmVzcG9uc2VIZWFkZXIgc3RpbGwgd29ya3MuIHNvIHdlIGdldCBjb250ZW50LXR5cGUgZXZlbiBpZiBnZXR0aW5nXG4gIC8vIG90aGVyIGhlYWRlcnMgZmFpbHMuXG4gIHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSA9IHRoaXMueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdjb250ZW50LXR5cGUnKTtcbiAgdGhpcy5fc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG5cbiAgaWYgKHRoaXMudGV4dCA9PT0gbnVsbCAmJiByZXEuX3Jlc3BvbnNlVHlwZSkge1xuICAgIHRoaXMuYm9keSA9IHRoaXMueGhyLnJlc3BvbnNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYm9keSA9XG4gICAgICB0aGlzLnJlcS5tZXRob2QgPT09ICdIRUFEJ1xuICAgICAgICA/IG51bGxcbiAgICAgICAgOiB0aGlzLl9wYXJzZUJvZHkodGhpcy50ZXh0ID8gdGhpcy50ZXh0IDogdGhpcy54aHIucmVzcG9uc2UpO1xuICB9XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG5SZXNwb25zZUJhc2UoUmVzcG9uc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYm9keSBgc3RyYC5cbiAqXG4gKiBVc2VkIGZvciBhdXRvLXBhcnNpbmcgb2YgYm9kaWVzLiBQYXJzZXJzXG4gKiBhcmUgZGVmaW5lZCBvbiB0aGUgYHN1cGVyYWdlbnQucGFyc2VgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5fcGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKSB7XG4gIGxldCBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgaWYgKHRoaXMucmVxLl9wYXJzZXIpIHtcbiAgICByZXR1cm4gdGhpcy5yZXEuX3BhcnNlcih0aGlzLCBzdHIpO1xuICB9XG5cbiAgaWYgKCFwYXJzZSAmJiBpc0pTT04odGhpcy50eXBlKSkge1xuICAgIHBhcnNlID0gcmVxdWVzdC5wYXJzZVsnYXBwbGljYXRpb24vanNvbiddO1xuICB9XG5cbiAgcmV0dXJuIHBhcnNlICYmIHN0ciAmJiAoc3RyLmxlbmd0aCA+IDAgfHwgc3RyIGluc3RhbmNlb2YgT2JqZWN0KVxuICAgID8gcGFyc2Uoc3RyKVxuICAgIDogbnVsbDtcbn07XG5cbi8qKlxuICogUmV0dXJuIGFuIGBFcnJvcmAgcmVwcmVzZW50YXRpdmUgb2YgdGhpcyByZXNwb25zZS5cbiAqXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnRvRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgeyByZXEgfSA9IHRoaXM7XG4gIGNvbnN0IHsgbWV0aG9kIH0gPSByZXE7XG4gIGNvbnN0IHsgdXJsIH0gPSByZXE7XG5cbiAgY29uc3QgbXNnID0gYGNhbm5vdCAke21ldGhvZH0gJHt1cmx9ICgke3RoaXMuc3RhdHVzfSlgO1xuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IobXNnKTtcbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gbWV0aG9kO1xuICBlcnIudXJsID0gdXJsO1xuXG4gIHJldHVybiBlcnI7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307IC8vIHByZXNlcnZlcyBoZWFkZXIgbmFtZSBjYXNlXG4gIHRoaXMuX2hlYWRlciA9IHt9OyAvLyBjb2VyY2VzIGhlYWRlciBuYW1lcyB0byBsb3dlcmNhc2VcbiAgdGhpcy5vbignZW5kJywgKCkgPT4ge1xuICAgIGxldCBlcnIgPSBudWxsO1xuICAgIGxldCByZXMgPSBudWxsO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlcyA9IG5ldyBSZXNwb25zZShzZWxmKTtcbiAgICB9IGNhdGNoIChlcnJfKSB7XG4gICAgICBlcnIgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnIucGFyc2UgPSB0cnVlO1xuICAgICAgZXJyLm9yaWdpbmFsID0gZXJyXztcbiAgICAgIC8vIGlzc3VlICM2NzU6IHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBpZiAoc2VsZi54aHIpIHtcbiAgICAgICAgLy8gaWU5IGRvZXNuJ3QgaGF2ZSAncmVzcG9uc2UnIHByb3BlcnR5XG4gICAgICAgIGVyci5yYXdSZXNwb25zZSA9XG4gICAgICAgICAgdHlwZW9mIHNlbGYueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgID8gc2VsZi54aHIucmVzcG9uc2VUZXh0XG4gICAgICAgICAgICA6IHNlbGYueGhyLnJlc3BvbnNlO1xuICAgICAgICAvLyBpc3N1ZSAjODc2OiByZXR1cm4gdGhlIGh0dHAgc3RhdHVzIGNvZGUgaWYgdGhlIHJlc3BvbnNlIHBhcnNpbmcgZmFpbHNcbiAgICAgICAgZXJyLnN0YXR1cyA9IHNlbGYueGhyLnN0YXR1cyA/IHNlbGYueGhyLnN0YXR1cyA6IG51bGw7XG4gICAgICAgIGVyci5zdGF0dXNDb2RlID0gZXJyLnN0YXR1czsgLy8gYmFja3dhcmRzLWNvbXBhdCBvbmx5XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnIucmF3UmVzcG9uc2UgPSBudWxsO1xuICAgICAgICBlcnIuc3RhdHVzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ3Jlc3BvbnNlJywgcmVzKTtcblxuICAgIGxldCBuZXdfZXJyO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIXNlbGYuX2lzUmVzcG9uc2VPSyhyZXMpKSB7XG4gICAgICAgIG5ld19lcnIgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgcmVzLnN0YXR1c1RleHQgfHwgcmVzLnRleHQgfHwgJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycl8pIHtcbiAgICAgIG5ld19lcnIgPSBlcnJfOyAvLyBvaygpIGNhbGxiYWNrIGNhbiB0aHJvd1xuICAgIH1cblxuICAgIC8vICMxMDAwIGRvbid0IGNhdGNoIGVycm9ycyBmcm9tIHRoZSBjYWxsYmFjayB0byBhdm9pZCBkb3VibGUgY2FsbGluZyBpdFxuICAgIGlmIChuZXdfZXJyKSB7XG4gICAgICBuZXdfZXJyLm9yaWdpbmFsID0gZXJyO1xuICAgICAgbmV3X2Vyci5yZXNwb25zZSA9IHJlcztcbiAgICAgIG5ld19lcnIuc3RhdHVzID0gcmVzLnN0YXR1cztcbiAgICAgIHNlbGYuY2FsbGJhY2sobmV3X2VyciwgcmVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5jYWxsYmFjayhudWxsLCByZXMpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgIGFuZCBgUmVxdWVzdEJhc2VgLlxuICovXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG5SZXF1ZXN0QmFzZShSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSkge1xuICB0aGlzLnNldCgnQ29udGVudC1UeXBlJywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBY2NlcHQgdG8gYHR5cGVgLCBtYXBwaW5nIHZhbHVlcyBmcm9tIGByZXF1ZXN0LnR5cGVzYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHN1cGVyYWdlbnQudHlwZXMuanNvbiA9ICdhcHBsaWNhdGlvbi9qc29uJztcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFjY2VwdFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gW3Bhc3NdIG9wdGlvbmFsIGluIGNhc2Ugb2YgdXNpbmcgJ2JlYXJlcicgYXMgdHlwZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgd2l0aCAndHlwZScgcHJvcGVydHkgJ2F1dG8nLCAnYmFzaWMnIG9yICdiZWFyZXInIChkZWZhdWx0ICdiYXNpYycpXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3MsIG9wdGlvbnMpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHBhc3MgPSAnJztcbiAgaWYgKHR5cGVvZiBwYXNzID09PSAnb2JqZWN0JyAmJiBwYXNzICE9PSBudWxsKSB7XG4gICAgLy8gcGFzcyBpcyBvcHRpb25hbCBhbmQgY2FuIGJlIHJlcGxhY2VkIHdpdGggb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBwYXNzO1xuICAgIHBhc3MgPSAnJztcbiAgfVxuXG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0eXBlOiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJyA/ICdiYXNpYycgOiAnYXV0bydcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgZW5jb2RlciA9IHN0cmluZyA9PiB7XG4gICAgaWYgKHR5cGVvZiBidG9hID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gYnRvYShzdHJpbmcpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHVzZSBiYXNpYyBhdXRoLCBidG9hIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2F1dGgodXNlciwgcGFzcywgb3B0aW9ucywgZW5jb2Rlcik7XG59O1xuXG4vKipcbiAqIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICByZXF1ZXN0LmdldCgnL3Nob2VzJylcbiAqICAgICAucXVlcnkoJ3NpemU9MTAnKVxuICogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKSB7XG4gIGlmICh0eXBlb2YgdmFsICE9PSAnc3RyaW5nJykgdmFsID0gc2VyaWFsaXplKHZhbCk7XG4gIGlmICh2YWwpIHRoaXMuX3F1ZXJ5LnB1c2godmFsKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBvcHRpb25zYCAob3IgZmlsZW5hbWUpLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaCgnY29udGVudCcsIG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uKGZpZWxkLCBmaWxlLCBvcHRpb25zKSB7XG4gIGlmIChmaWxlKSB7XG4gICAgaWYgKHRoaXMuX2RhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInN1cGVyYWdlbnQgY2FuJ3QgbWl4IC5zZW5kKCkgYW5kIC5hdHRhY2goKVwiKTtcbiAgICB9XG5cbiAgICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChmaWVsZCwgZmlsZSwgb3B0aW9ucyB8fCBmaWxlLm5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5fZ2V0Rm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkge1xuICAgIHRoaXMuX2Zvcm1EYXRhID0gbmV3IHJvb3QuRm9ybURhdGEoKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLl9mb3JtRGF0YTtcbn07XG5cbi8qKlxuICogSW52b2tlIHRoZSBjYWxsYmFjayB3aXRoIGBlcnJgIGFuZCBgcmVzYFxuICogYW5kIGhhbmRsZSBhcml0eSBjaGVjay5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnJcbiAqIEBwYXJhbSB7UmVzcG9uc2V9IHJlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2FsbGJhY2sgPSBmdW5jdGlvbihlcnIsIHJlcykge1xuICBpZiAodGhpcy5fc2hvdWxkUmV0cnkoZXJyLCByZXMpKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JldHJ5KCk7XG4gIH1cblxuICBjb25zdCBmbiA9IHRoaXMuX2NhbGxiYWNrO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuXG4gIGlmIChlcnIpIHtcbiAgICBpZiAodGhpcy5fbWF4UmV0cmllcykgZXJyLnJldHJpZXMgPSB0aGlzLl9yZXRyaWVzIC0gMTtcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgfVxuXG4gIGZuKGVyciwgcmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCkge1xuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoXG4gICAgJ1JlcXVlc3QgaGFzIGJlZW4gdGVybWluYXRlZFxcblBvc3NpYmxlIGNhdXNlczogdGhlIG5ldHdvcmsgaXMgb2ZmbGluZSwgT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiwgdGhlIHBhZ2UgaXMgYmVpbmcgdW5sb2FkZWQsIGV0Yy4nXG4gICk7XG4gIGVyci5jcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgZXJyLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnIubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIGVyci51cmwgPSB0aGlzLnVybDtcblxuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vLyBUaGlzIG9ubHkgd2FybnMsIGJlY2F1c2UgdGhlIHJlcXVlc3QgaXMgc3RpbGwgbGlrZWx5IHRvIHdvcmtcblJlcXVlc3QucHJvdG90eXBlLmFnZW50ID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUud2FybignVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIGJyb3dzZXIgdmVyc2lvbiBvZiBzdXBlcmFnZW50Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuY2EgPSBSZXF1ZXN0LnByb3RvdHlwZS5hZ2VudDtcblJlcXVlc3QucHJvdG90eXBlLmJ1ZmZlciA9IFJlcXVlc3QucHJvdG90eXBlLmNhO1xuXG4vLyBUaGlzIHRocm93cywgYmVjYXVzZSBpdCBjYW4ndCBzZW5kL3JlY2VpdmUgZGF0YSBhcyBleHBlY3RlZFxuUmVxdWVzdC5wcm90b3R5cGUud3JpdGUgPSAoKSA9PiB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnU3RyZWFtaW5nIGlzIG5vdCBzdXBwb3J0ZWQgaW4gYnJvd3NlciB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQnXG4gICk7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5waXBlID0gUmVxdWVzdC5wcm90b3R5cGUud3JpdGU7XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBob3N0IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn0gaXMgYSBob3N0IG9iamVjdFxuICogQGFwaSBwcml2YXRlXG4gKi9cblJlcXVlc3QucHJvdG90eXBlLl9pc0hvc3QgPSBmdW5jdGlvbihvYmopIHtcbiAgLy8gTmF0aXZlIG9iamVjdHMgc3RyaW5naWZ5IHRvIFtvYmplY3QgRmlsZV0sIFtvYmplY3QgQmxvYl0sIFtvYmplY3QgRm9ybURhdGFdLCBldGMuXG4gIHJldHVybiAoXG4gICAgb2JqICYmXG4gICAgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiZcbiAgICAhQXJyYXkuaXNBcnJheShvYmopICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nXG4gICk7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbikge1xuICBpZiAodGhpcy5fZW5kQ2FsbGVkKSB7XG4gICAgY29uc29sZS53YXJuKFxuICAgICAgJ1dhcm5pbmc6IC5lbmQoKSB3YXMgY2FsbGVkIHR3aWNlLiBUaGlzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gc3VwZXJhZ2VudCdcbiAgICApO1xuICB9XG5cbiAgdGhpcy5fZW5kQ2FsbGVkID0gdHJ1ZTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgdGhpcy5fZmluYWxpemVRdWVyeVN0cmluZygpO1xuXG4gIHRoaXMuX2VuZCgpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuX3NldFVwbG9hZFRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgLy8gdXBsb2FkIHRpbWVvdXQgaXQncyB3b2tycyBvbmx5IGlmIGRlYWRsaW5lIHRpbWVvdXQgaXMgb2ZmXG4gIGlmICh0aGlzLl91cGxvYWRUaW1lb3V0ICYmICF0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIpIHtcbiAgICB0aGlzLl91cGxvYWRUaW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcihcbiAgICAgICAgJ1VwbG9hZCB0aW1lb3V0IG9mICcsXG4gICAgICAgIHNlbGYuX3VwbG9hZFRpbWVvdXQsXG4gICAgICAgICdFVElNRURPVVQnXG4gICAgICApO1xuICAgIH0sIHRoaXMuX3VwbG9hZFRpbWVvdXQpO1xuICB9XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuUmVxdWVzdC5wcm90b3R5cGUuX2VuZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fYWJvcnRlZClcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhcbiAgICAgIG5ldyBFcnJvcignVGhlIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZCBldmVuIGJlZm9yZSAuZW5kKCkgd2FzIGNhbGxlZCcpXG4gICAgKTtcblxuICBjb25zdCBzZWxmID0gdGhpcztcbiAgdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICBjb25zdCB7IHhociB9ID0gdGhpcztcbiAgbGV0IGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIHRoaXMuX3NldFRpbWVvdXRzKCk7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgY29uc3QgeyByZWFkeVN0YXRlIH0gPSB4aHI7XG4gICAgaWYgKHJlYWR5U3RhdGUgPj0gMiAmJiBzZWxmLl9yZXNwb25zZVRpbWVvdXRUaW1lcikge1xuICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3Jlc3BvbnNlVGltZW91dFRpbWVyKTtcbiAgICB9XG5cbiAgICBpZiAocmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEluIElFOSwgcmVhZHMgdG8gYW55IHByb3BlcnR5IChlLmcuIHN0YXR1cykgb2ZmIG9mIGFuIGFib3J0ZWQgWEhSIHdpbGxcbiAgICAvLyByZXN1bHQgaW4gdGhlIGVycm9yIFwiQ291bGQgbm90IGNvbXBsZXRlIHRoZSBvcGVyYXRpb24gZHVlIHRvIGVycm9yIGMwMGMwMjNmXCJcbiAgICBsZXQgc3RhdHVzO1xuICAgIHRyeSB7XG4gICAgICBzdGF0dXMgPSB4aHIuc3RhdHVzO1xuICAgIH0gY2F0Y2gge1xuICAgICAgc3RhdHVzID0gMDtcbiAgICB9XG5cbiAgICBpZiAoIXN0YXR1cykge1xuICAgICAgaWYgKHNlbGYudGltZWRvdXQgfHwgc2VsZi5fYWJvcnRlZCkgcmV0dXJuO1xuICAgICAgcmV0dXJuIHNlbGYuY3Jvc3NEb21haW5FcnJvcigpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgY29uc3QgaGFuZGxlUHJvZ3Jlc3MgPSAoZGlyZWN0aW9uLCBlKSA9PiB7XG4gICAgaWYgKGUudG90YWwgPiAwKSB7XG4gICAgICBlLnBlcmNlbnQgPSAoZS5sb2FkZWQgLyBlLnRvdGFsKSAqIDEwMDtcblxuICAgICAgaWYgKGUucGVyY2VudCA9PT0gMTAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLl91cGxvYWRUaW1lb3V0VGltZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGUuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgfTtcblxuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB0cnkge1xuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgaGFuZGxlUHJvZ3Jlc3MuYmluZChudWxsLCAnZG93bmxvYWQnKSk7XG4gICAgICBpZiAoeGhyLnVwbG9hZCkge1xuICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgJ3Byb2dyZXNzJyxcbiAgICAgICAgICBoYW5kbGVQcm9ncmVzcy5iaW5kKG51bGwsICd1cGxvYWQnKVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgICAgLy8gUmVwb3J0ZWQgaGVyZTpcbiAgICAgIC8vIGh0dHBzOi8vY29ubmVjdC5taWNyb3NvZnQuY29tL0lFL2ZlZWRiYWNrL2RldGFpbHMvODM3MjQ1L3htbGh0dHByZXF1ZXN0LXVwbG9hZC10aHJvd3MtaW52YWxpZC1hcmd1bWVudC13aGVuLXVzZWQtZnJvbS13ZWItd29ya2VyLWNvbnRleHRcbiAgICB9XG4gIH1cblxuICBpZiAoeGhyLnVwbG9hZCkge1xuICAgIHRoaXMuX3NldFVwbG9hZFRpbWVvdXQoKTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgdHJ5IHtcbiAgICBpZiAodGhpcy51c2VybmFtZSAmJiB0aGlzLnBhc3N3b3JkKSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUsIHRoaXMudXNlcm5hbWUsIHRoaXMucGFzc3dvcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB4aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gc2VlICMxMTQ5XG4gICAgcmV0dXJuIHRoaXMuY2FsbGJhY2soZXJyKTtcbiAgfVxuXG4gIC8vIENPUlNcbiAgaWYgKHRoaXMuX3dpdGhDcmVkZW50aWFscykgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgLy8gYm9keVxuICBpZiAoXG4gICAgIXRoaXMuX2Zvcm1EYXRhICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdHRVQnICYmXG4gICAgdGhpcy5tZXRob2QgIT09ICdIRUFEJyAmJlxuICAgIHR5cGVvZiBkYXRhICE9PSAnc3RyaW5nJyAmJlxuICAgICF0aGlzLl9pc0hvc3QoZGF0YSlcbiAgKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgY29uc3QgY29udGVudFR5cGUgPSB0aGlzLl9oZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICAgIGxldCBzZXJpYWxpemUgPVxuICAgICAgdGhpcy5fc2VyaWFsaXplciB8fFxuICAgICAgcmVxdWVzdC5zZXJpYWxpemVbY29udGVudFR5cGUgPyBjb250ZW50VHlwZS5zcGxpdCgnOycpWzBdIDogJyddO1xuICAgIGlmICghc2VyaWFsaXplICYmIGlzSlNPTihjb250ZW50VHlwZSkpIHtcbiAgICAgIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplWydhcHBsaWNhdGlvbi9qc29uJ107XG4gICAgfVxuXG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAoY29uc3QgZmllbGQgaW4gdGhpcy5oZWFkZXIpIHtcbiAgICBpZiAodGhpcy5oZWFkZXJbZmllbGRdID09PSBudWxsKSBjb250aW51ZTtcblxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5oZWFkZXIsIGZpZWxkKSlcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGZpZWxkLCB0aGlzLmhlYWRlcltmaWVsZF0pO1xuICB9XG5cbiAgaWYgKHRoaXMuX3Jlc3BvbnNlVHlwZSkge1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSB0aGlzLl9yZXNwb25zZVR5cGU7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHRoaXMuZW1pdCgncmVxdWVzdCcsIHRoaXMpO1xuXG4gIC8vIElFMTEgeGhyLnNlbmQodW5kZWZpbmVkKSBzZW5kcyAndW5kZWZpbmVkJyBzdHJpbmcgYXMgUE9TVCBwYXlsb2FkIChpbnN0ZWFkIG9mIG5vdGhpbmcpXG4gIC8vIFdlIG5lZWQgbnVsbCBoZXJlIGlmIGRhdGEgaXMgdW5kZWZpbmVkXG4gIHhoci5zZW5kKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBkYXRhKTtcbn07XG5cbnJlcXVlc3QuYWdlbnQgPSAoKSA9PiBuZXcgQWdlbnQoKTtcblxuWydHRVQnLCAnUE9TVCcsICdPUFRJT05TJywgJ1BBVENIJywgJ1BVVCcsICdERUxFVEUnXS5mb3JFYWNoKG1ldGhvZCA9PiB7XG4gIEFnZW50LnByb3RvdHlwZVttZXRob2QudG9Mb3dlckNhc2UoKV0gPSBmdW5jdGlvbih1cmwsIGZuKSB7XG4gICAgY29uc3QgcmVxID0gbmV3IHJlcXVlc3QuUmVxdWVzdChtZXRob2QsIHVybCk7XG4gICAgdGhpcy5fc2V0RGVmYXVsdHMocmVxKTtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJlcS5lbmQoZm4pO1xuICAgIH1cblxuICAgIHJldHVybiByZXE7XG4gIH07XG59KTtcblxuQWdlbnQucHJvdG90eXBlLmRlbCA9IEFnZW50LnByb3RvdHlwZS5kZWxldGU7XG5cbi8qKlxuICogR0VUIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXEgPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxID0gcmVxdWVzdCgnSEVBRCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXEucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIE9QVElPTlMgcXVlcnkgdG8gYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0Lm9wdGlvbnMgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXEgPSByZXF1ZXN0KCdPUFRJT05TJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlbCh1cmwsIGRhdGEsIGZuKSB7XG4gIGNvbnN0IHJlcSA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn1cblxucmVxdWVzdC5kZWwgPSBkZWw7XG5yZXF1ZXN0LmRlbGV0ZSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcSA9IHJlcXVlc3QoJ1BBVENIJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQT1NUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBvc3QgPSAodXJsLCBkYXRhLCBmbikgPT4ge1xuICBjb25zdCByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQVVQgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcbiJdfQ==

/***/ }),

/***/ "./node_modules/superagent/lib/is-object.js":
/*!**************************************************!*\
  !*** ./node_modules/superagent/lib/is-object.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
function isObject(obj) {
  return obj !== null && _typeof(obj) === 'object';
}

module.exports = isObject;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pcy1vYmplY3QuanMiXSwibmFtZXMiOlsiaXNPYmplY3QiLCJvYmoiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7QUFRQSxTQUFTQSxRQUFULENBQWtCQyxHQUFsQixFQUF1QjtBQUNyQixTQUFPQSxHQUFHLEtBQUssSUFBUixJQUFnQixRQUFPQSxHQUFQLE1BQWUsUUFBdEM7QUFDRDs7QUFFREMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCSCxRQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiJdfQ==

/***/ }),

/***/ "./node_modules/superagent/lib/request-base.js":
/*!*****************************************************!*\
  !*** ./node_modules/superagent/lib/request-base.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = __webpack_require__(/*! ./is-object */ "./node_modules/superagent/lib/is-object.js");
/**
 * Expose `RequestBase`.
 */


module.exports = RequestBase;
/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(obj) {
  for (var key in RequestBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(RequestBase.prototype, key)) obj[key] = RequestBase.prototype[key];
  }

  return obj;
}
/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.clearTimeout = function () {
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  clearTimeout(this._uploadTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  delete this._uploadTimeoutTimer;
  return this;
};
/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.parse = function (fn) {
  this._parser = fn;
  return this;
};
/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.responseType = function (val) {
  this._responseType = val;
  return this;
};
/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */


RequestBase.prototype.serialize = function (fn) {
  this._serializer = fn;
  return this;
};
/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 * - upload is the time  since last bit of data was sent or received. This timeout works only if deadline timeout is off
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, deadline}
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.timeout = function (options) {
  if (!options || _typeof(options) !== 'object') {
    this._timeout = options;
    this._responseTimeout = 0;
    this._uploadTimeout = 0;
    return this;
  }

  for (var option in options) {
    if (Object.prototype.hasOwnProperty.call(options, option)) {
      switch (option) {
        case 'deadline':
          this._timeout = options.deadline;
          break;

        case 'response':
          this._responseTimeout = options.response;
          break;

        case 'upload':
          this._uploadTimeout = options.upload;
          break;

        default:
          console.warn('Unknown timeout option', option);
      }
    }
  }

  return this;
};
/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @param {Function} [fn]
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.retry = function (count, fn) {
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  this._retryCallback = fn;
  return this;
};

var ERROR_CODES = ['ECONNRESET', 'ETIMEDOUT', 'EADDRINFO', 'ESOCKETTIMEDOUT'];
/**
 * Determine if a request should be retried.
 * (Borrowed from segmentio/superagent-retry)
 *
 * @param {Error} err an error
 * @param {Response} [res] response
 * @returns {Boolean} if segment should be retried
 */

RequestBase.prototype._shouldRetry = function (err, res) {
  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
    return false;
  }

  if (this._retryCallback) {
    try {
      var override = this._retryCallback(err, res);

      if (override === true) return true;
      if (override === false) return false; // undefined falls back to defaults
    } catch (err_) {
      console.error(err_);
    }
  }

  if (res && res.status && res.status >= 500 && res.status !== 501) return true;

  if (err) {
    if (err.code && ERROR_CODES.includes(err.code)) return true; // Superagent timeout

    if (err.timeout && err.code === 'ECONNABORTED') return true;
    if (err.crossDomain) return true;
  }

  return false;
};
/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */


RequestBase.prototype._retry = function () {
  this.clearTimeout(); // node

  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;
  this.timedoutError = null;
  return this._end();
};
/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */


RequestBase.prototype.then = function (resolve, reject) {
  var _this = this;

  if (!this._fullfilledPromise) {
    var self = this;

    if (this._endCalled) {
      console.warn('Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises');
    }

    this._fullfilledPromise = new Promise(function (resolve, reject) {
      self.on('abort', function () {
        if (_this.timedout && _this.timedoutError) {
          reject(_this.timedoutError);
          return;
        }

        var err = new Error('Aborted');
        err.code = 'ABORTED';
        err.status = _this.status;
        err.method = _this.method;
        err.url = _this.url;
        reject(err);
      });
      self.end(function (err, res) {
        if (err) reject(err);else resolve(res);
      });
    });
  }

  return this._fullfilledPromise.then(resolve, reject);
};

RequestBase.prototype.catch = function (cb) {
  return this.then(undefined, cb);
};
/**
 * Allow for extension
 */


RequestBase.prototype.use = function (fn) {
  fn(this);
  return this;
};

RequestBase.prototype.ok = function (cb) {
  if (typeof cb !== 'function') throw new Error('Callback required');
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function (res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};
/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */


RequestBase.prototype.get = function (field) {
  return this._header[field.toLowerCase()];
};
/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */


RequestBase.prototype.getHeader = RequestBase.prototype.get;
/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function (field, val) {
  if (isObject(field)) {
    for (var key in field) {
      if (Object.prototype.hasOwnProperty.call(field, key)) this.set(key, field[key]);
    }

    return this;
  }

  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};
/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field field name
 */


RequestBase.prototype.unset = function (field) {
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};
/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name name of field
 * @param {String|Blob|File|Buffer|fs.ReadStream} val value of field
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.field = function (name, val) {
  // name should be either a string or an object.
  if (name === null || undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      if (Object.prototype.hasOwnProperty.call(name, key)) this.field(key, name[key]);
    }

    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      if (Object.prototype.hasOwnProperty.call(val, i)) this.field(name, val[i]);
    }

    return this;
  } // val should be defined now


  if (val === null || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }

  if (typeof val === 'boolean') {
    val = String(val);
  }

  this._getFormData().append(name, val);

  return this;
};
/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request} request
 * @api public
 */


RequestBase.prototype.abort = function () {
  if (this._aborted) {
    return this;
  }

  this._aborted = true;
  if (this.xhr) this.xhr.abort(); // browser

  if (this.req) this.req.abort(); // node

  this.clearTimeout();
  this.emit('abort');
  return this;
};

RequestBase.prototype._auth = function (user, pass, options, base64Encoder) {
  switch (options.type) {
    case 'basic':
      this.set('Authorization', "Basic ".concat(base64Encoder("".concat(user, ":").concat(pass))));
      break;

    case 'auto':
      this.username = user;
      this.password = pass;
      break;

    case 'bearer':
      // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', "Bearer ".concat(user));
      break;

    default:
      break;
  }

  return this;
};
/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */


RequestBase.prototype.withCredentials = function (on) {
  // This is browser-only functionality. Node side is no-op.
  if (on === undefined) on = true;
  this._withCredentials = on;
  return this;
};
/**
 * Set the max redirects to `n`. Does nothing in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.redirects = function (n) {
  this._maxRedirects = n;
  return this;
};
/**
 * Maximum size of buffered response body, in bytes. Counts uncompressed size.
 * Default 200MB.
 *
 * @param {Number} n number of bytes
 * @return {Request} for chaining
 */


RequestBase.prototype.maxResponseSize = function (n) {
  if (typeof n !== 'number') {
    throw new TypeError('Invalid argument');
  }

  this._maxResponseSize = n;
  return this;
};
/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */


RequestBase.prototype.toJSON = function () {
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};
/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */
// eslint-disable-next-line complexity


RequestBase.prototype.send = function (data) {
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw new Error("Can't merge these send calls");
  } // merge


  if (isObj && isObject(this._data)) {
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) this._data[key] = data[key];
    }
  } else if (typeof data === 'string') {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];

    if (type === 'application/x-www-form-urlencoded') {
      this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  } // default to json


  if (!type) this.type('json');
  return this;
};
/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */


RequestBase.prototype.sortQuery = function (sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};
/**
 * Compose querystring to append to req.url
 *
 * @api private
 */


RequestBase.prototype._finalizeQueryString = function () {
  var query = this._query.join('&');

  if (query) {
    this.url += (this.url.includes('?') ? '&' : '?') + query;
  }

  this._query.length = 0; // Makes the call idempotent

  if (this._sort) {
    var index = this.url.indexOf('?');

    if (index >= 0) {
      var queryArr = this.url.slice(index + 1).split('&');

      if (typeof this._sort === 'function') {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }

      this.url = this.url.slice(0, index) + '?' + queryArr.join('&');
    }
  }
}; // For backwards compat only


RequestBase.prototype._appendQueryString = function () {
  console.warn('Unsupported');
};
/**
 * Invoke callback with timeout error.
 *
 * @api private
 */


RequestBase.prototype._timeoutError = function (reason, timeout, errno) {
  if (this._aborted) {
    return;
  }

  var err = new Error("".concat(reason + timeout, "ms exceeded"));
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.timedoutError = err;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function () {
  var self = this; // deadline

  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function () {
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  } // response timeout


  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function () {
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1ZXN0LWJhc2UuanMiXSwibmFtZXMiOlsiaXNPYmplY3QiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsIlJlcXVlc3RCYXNlIiwib2JqIiwibWl4aW4iLCJrZXkiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJjbGVhclRpbWVvdXQiLCJfdGltZXIiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJfdXBsb2FkVGltZW91dFRpbWVyIiwicGFyc2UiLCJmbiIsIl9wYXJzZXIiLCJyZXNwb25zZVR5cGUiLCJ2YWwiLCJfcmVzcG9uc2VUeXBlIiwic2VyaWFsaXplIiwiX3NlcmlhbGl6ZXIiLCJ0aW1lb3V0Iiwib3B0aW9ucyIsIl90aW1lb3V0IiwiX3Jlc3BvbnNlVGltZW91dCIsIl91cGxvYWRUaW1lb3V0Iiwib3B0aW9uIiwiZGVhZGxpbmUiLCJyZXNwb25zZSIsInVwbG9hZCIsImNvbnNvbGUiLCJ3YXJuIiwicmV0cnkiLCJjb3VudCIsImFyZ3VtZW50cyIsImxlbmd0aCIsIl9tYXhSZXRyaWVzIiwiX3JldHJpZXMiLCJfcmV0cnlDYWxsYmFjayIsIkVSUk9SX0NPREVTIiwiX3Nob3VsZFJldHJ5IiwiZXJyIiwicmVzIiwib3ZlcnJpZGUiLCJlcnJfIiwiZXJyb3IiLCJzdGF0dXMiLCJjb2RlIiwiaW5jbHVkZXMiLCJjcm9zc0RvbWFpbiIsIl9yZXRyeSIsInJlcSIsInJlcXVlc3QiLCJfYWJvcnRlZCIsInRpbWVkb3V0IiwidGltZWRvdXRFcnJvciIsIl9lbmQiLCJ0aGVuIiwicmVzb2x2ZSIsInJlamVjdCIsIl9mdWxsZmlsbGVkUHJvbWlzZSIsInNlbGYiLCJfZW5kQ2FsbGVkIiwiUHJvbWlzZSIsIm9uIiwiRXJyb3IiLCJtZXRob2QiLCJ1cmwiLCJlbmQiLCJjYXRjaCIsImNiIiwidW5kZWZpbmVkIiwidXNlIiwib2siLCJfb2tDYWxsYmFjayIsIl9pc1Jlc3BvbnNlT0siLCJnZXQiLCJmaWVsZCIsIl9oZWFkZXIiLCJ0b0xvd2VyQ2FzZSIsImdldEhlYWRlciIsInNldCIsImhlYWRlciIsInVuc2V0IiwibmFtZSIsIl9kYXRhIiwiQXJyYXkiLCJpc0FycmF5IiwiaSIsIlN0cmluZyIsIl9nZXRGb3JtRGF0YSIsImFwcGVuZCIsImFib3J0IiwieGhyIiwiZW1pdCIsIl9hdXRoIiwidXNlciIsInBhc3MiLCJiYXNlNjRFbmNvZGVyIiwidHlwZSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJ3aXRoQ3JlZGVudGlhbHMiLCJfd2l0aENyZWRlbnRpYWxzIiwicmVkaXJlY3RzIiwibiIsIl9tYXhSZWRpcmVjdHMiLCJtYXhSZXNwb25zZVNpemUiLCJUeXBlRXJyb3IiLCJfbWF4UmVzcG9uc2VTaXplIiwidG9KU09OIiwiZGF0YSIsImhlYWRlcnMiLCJzZW5kIiwiaXNPYmoiLCJfZm9ybURhdGEiLCJfaXNIb3N0Iiwic29ydFF1ZXJ5Iiwic29ydCIsIl9zb3J0IiwiX2ZpbmFsaXplUXVlcnlTdHJpbmciLCJxdWVyeSIsIl9xdWVyeSIsImpvaW4iLCJpbmRleCIsImluZGV4T2YiLCJxdWVyeUFyciIsInNsaWNlIiwic3BsaXQiLCJfYXBwZW5kUXVlcnlTdHJpbmciLCJfdGltZW91dEVycm9yIiwicmVhc29uIiwiZXJybm8iLCJjYWxsYmFjayIsIl9zZXRUaW1lb3V0cyIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7O0FBR0EsSUFBTUEsUUFBUSxHQUFHQyxPQUFPLENBQUMsYUFBRCxDQUF4QjtBQUVBOzs7OztBQUlBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJDLFdBQWpCO0FBRUE7Ozs7OztBQU1BLFNBQVNBLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCO0FBQ3hCLE1BQUlBLEdBQUosRUFBUyxPQUFPQyxLQUFLLENBQUNELEdBQUQsQ0FBWjtBQUNWO0FBRUQ7Ozs7Ozs7OztBQVFBLFNBQVNDLEtBQVQsQ0FBZUQsR0FBZixFQUFvQjtBQUNsQixPQUFLLElBQU1FLEdBQVgsSUFBa0JI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MEQ7QUFDeEQsU0FBS0EscUJBQUwsR0FBNkI0SCxVQUFVLENBQUMsWUFBTTtBQUM1QzFFLE1BQUFBLElBQUksQ0FBQ3FFLGFBQUwsQ0FDRSxzQkFERixFQUVFckUsSUFBSSxDQUFDckMsZ0JBRlAsRUFHRSxXQUhGO0FBS0QsS0FOc0MsRUFNcEMsS0FBS0EsZ0JBTitCLENBQXZDO0FBT0Q7QUFDRixDQXBCRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTW9kdWxlIG9mIG1peGVkLWluIGZ1bmN0aW9ucyBzaGFyZWQgYmV0d2VlbiBub2RlIGFuZCBjbGllbnQgY29kZVxuICovXG5jb25zdCBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXMtb2JqZWN0Jyk7XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0QmFzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBSZXF1ZXN0QmFzZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0QmFzZWAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0QmFzZShvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59XG5cbi8qKlxuICogTWl4aW4gdGhlIHByb3RvdHlwZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKGNvbnN0IGtleSBpbiBSZXF1ZXN0QmFzZS5wcm90b3R5cGUpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFJlcXVlc3RCYXNlLnByb3RvdHlwZSwga2V5KSlcbiAgICAgIG9ialtrZXldID0gUmVxdWVzdEJhc2UucHJvdG90eXBlW2tleV07XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIENsZWFyIHByZXZpb3VzIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyKTtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3VwbG9hZFRpbWVvdXRUaW1lcik7XG4gIGRlbGV0ZSB0aGlzLl90aW1lcjtcbiAgZGVsZXRlIHRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyO1xuICBkZWxldGUgdGhpcy5fdXBsb2FkVGltZW91dFRpbWVyO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgZGVmYXVsdCByZXNwb25zZSBib2R5IHBhcnNlclxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgdG8gY29udmVydCBpbmNvbWluZyBkYXRhIGludG8gcmVxdWVzdC5ib2R5XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oZm4pIHtcbiAgdGhpcy5fcGFyc2VyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgZm9ybWF0IG9mIGJpbmFyeSByZXNwb25zZSBib2R5LlxuICogSW4gYnJvd3NlciB2YWxpZCBmb3JtYXRzIGFyZSAnYmxvYicgYW5kICdhcnJheWJ1ZmZlcicsXG4gKiB3aGljaCByZXR1cm4gQmxvYiBhbmQgQXJyYXlCdWZmZXIsIHJlc3BlY3RpdmVseS5cbiAqXG4gKiBJbiBOb2RlIGFsbCB2YWx1ZXMgcmVzdWx0IGluIEJ1ZmZlci5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5yZXNwb25zZVR5cGUoJ2Jsb2InKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUucmVzcG9uc2VUeXBlID0gZnVuY3Rpb24odmFsKSB7XG4gIHRoaXMuX3Jlc3BvbnNlVHlwZSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE92ZXJyaWRlIGRlZmF1bHQgcmVxdWVzdCBib2R5IHNlcmlhbGl6ZXJcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHRvIGNvbnZlcnQgZGF0YSBzZXQgdmlhIC5zZW5kIG9yIC5hdHRhY2ggaW50byBwYXlsb2FkIHRvIHNlbmRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc2VyaWFsaXplID0gZnVuY3Rpb24oZm4pIHtcbiAgdGhpcy5fc2VyaWFsaXplciA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRpbWVvdXRzLlxuICpcbiAqIC0gcmVzcG9uc2UgdGltZW91dCBpcyB0aW1lIGJldHdlZW4gc2VuZGluZyByZXF1ZXN0IGFuZCByZWNlaXZpbmcgdGhlIGZpcnN0IGJ5dGUgb2YgdGhlIHJlc3BvbnNlLiBJbmNsdWRlcyBETlMgYW5kIGNvbm5lY3Rpb24gdGltZS5cbiAqIC0gZGVhZGxpbmUgaXMgdGhlIHRpbWUgZnJvbSBzdGFydCBvZiB0aGUgcmVxdWVzdCB0byByZWNlaXZpbmcgcmVzcG9uc2UgYm9keSBpbiBmdWxsLiBJZiB0aGUgZGVhZGxpbmUgaXMgdG9vIHNob3J0IGxhcmdlIGZpbGVzIG1heSBub3QgbG9hZCBhdCBhbGwgb24gc2xvdyBjb25uZWN0aW9ucy5cbiAqIC0gdXBsb2FkIGlzIHRoZSB0aW1lICBzaW5jZSBsYXN0IGJpdCBvZiBkYXRhIHdhcyBzZW50IG9yIHJlY2VpdmVkLiBUaGlzIHRpbWVvdXQgd29ya3Mgb25seSBpZiBkZWFkbGluZSB0aW1lb3V0IGlzIG9mZlxuICpcbiAqIFZhbHVlIG9mIDAgb3IgZmFsc2UgbWVhbnMgbm8gdGltZW91dC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IG1zIG9yIHtyZXNwb25zZSwgZGVhZGxpbmV9XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucztcbiAgICB0aGlzLl9yZXNwb25zZVRpbWVvdXQgPSAwO1xuICAgIHRoaXMuX3VwbG9hZFRpbWVvdXQgPSAwO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZm9yIChjb25zdCBvcHRpb24gaW4gb3B0aW9ucykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob3B0aW9ucywgb3B0aW9uKSkge1xuICAgICAgc3dpdGNoIChvcHRpb24pIHtcbiAgICAgICAgY2FzZSAnZGVhZGxpbmUnOlxuICAgICAgICAgIHRoaXMuX3RpbWVvdXQgPSBvcHRpb25zLmRlYWRsaW5lO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyZXNwb25zZSc6XG4gICAgICAgICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gb3B0aW9ucy5yZXNwb25zZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndXBsb2FkJzpcbiAgICAgICAgICB0aGlzLl91cGxvYWRUaW1lb3V0ID0gb3B0aW9ucy51cGxvYWQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIHRpbWVvdXQgb3B0aW9uJywgb3B0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IG51bWJlciBvZiByZXRyeSBhdHRlbXB0cyBvbiBlcnJvci5cbiAqXG4gKiBGYWlsZWQgcmVxdWVzdHMgd2lsbCBiZSByZXRyaWVkICdjb3VudCcgdGltZXMgaWYgdGltZW91dCBvciBlcnIuY29kZSA+PSA1MDAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnJldHJ5ID0gZnVuY3Rpb24oY291bnQsIGZuKSB7XG4gIC8vIERlZmF1bHQgdG8gMSBpZiBubyBjb3VudCBwYXNzZWQgb3IgdHJ1ZVxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCB8fCBjb3VudCA9PT0gdHJ1ZSkgY291bnQgPSAxO1xuICBpZiAoY291bnQgPD0gMCkgY291bnQgPSAwO1xuICB0aGlzLl9tYXhSZXRyaWVzID0gY291bnQ7XG4gIHRoaXMuX3JldHJpZXMgPSAwO1xuICB0aGlzLl9yZXRyeUNhbGxiYWNrID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuY29uc3QgRVJST1JfQ09ERVMgPSBbJ0VDT05OUkVTRVQnLCAnRVRJTUVET1VUJywgJ0VBRERSSU5GTycsICdFU09DS0VUVElNRURPVVQnXTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSByZXF1ZXN0IHNob3VsZCBiZSByZXRyaWVkLlxuICogKEJvcnJvd2VkIGZyb20gc2VnbWVudGlvL3N1cGVyYWdlbnQtcmV0cnkpXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyIGFuIGVycm9yXG4gKiBAcGFyYW0ge1Jlc3BvbnNlfSBbcmVzXSByZXNwb25zZVxuICogQHJldHVybnMge0Jvb2xlYW59IGlmIHNlZ21lbnQgc2hvdWxkIGJlIHJldHJpZWRcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9zaG91bGRSZXRyeSA9IGZ1bmN0aW9uKGVyciwgcmVzKSB7XG4gIGlmICghdGhpcy5fbWF4UmV0cmllcyB8fCB0aGlzLl9yZXRyaWVzKysgPj0gdGhpcy5fbWF4UmV0cmllcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLl9yZXRyeUNhbGxiYWNrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG92ZXJyaWRlID0gdGhpcy5fcmV0cnlDYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgICBpZiAob3ZlcnJpZGUgPT09IHRydWUpIHJldHVybiB0cnVlO1xuICAgICAgaWYgKG92ZXJyaWRlID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gdW5kZWZpbmVkIGZhbGxzIGJhY2sgdG8gZGVmYXVsdHNcbiAgICB9IGNhdGNoIChlcnJfKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycl8pO1xuICAgIH1cbiAgfVxuXG4gIGlmIChyZXMgJiYgcmVzLnN0YXR1cyAmJiByZXMuc3RhdHVzID49IDUwMCAmJiByZXMuc3RhdHVzICE9PSA1MDEpIHJldHVybiB0cnVlO1xuICBpZiAoZXJyKSB7XG4gICAgaWYgKGVyci5jb2RlICYmIEVSUk9SX0NPREVTLmluY2x1ZGVzKGVyci5jb2RlKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gU3VwZXJhZ2VudCB0aW1lb3V0XG4gICAgaWYgKGVyci50aW1lb3V0ICYmIGVyci5jb2RlID09PSAnRUNPTk5BQk9SVEVEJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKGVyci5jcm9zc0RvbWFpbikgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFJldHJ5IHJlcXVlc3RcbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fcmV0cnkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcblxuICAvLyBub2RlXG4gIGlmICh0aGlzLnJlcSkge1xuICAgIHRoaXMucmVxID0gbnVsbDtcbiAgICB0aGlzLnJlcSA9IHRoaXMucmVxdWVzdCgpO1xuICB9XG5cbiAgdGhpcy5fYWJvcnRlZCA9IGZhbHNlO1xuICB0aGlzLnRpbWVkb3V0ID0gZmFsc2U7XG4gIHRoaXMudGltZWRvdXRFcnJvciA9IG51bGw7XG5cbiAgcmV0dXJuIHRoaXMuX2VuZCgpO1xufTtcblxuLyoqXG4gKiBQcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmVqZWN0XVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICBpZiAoIXRoaXMuX2Z1bGxmaWxsZWRQcm9taXNlKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHRoaXMuX2VuZENhbGxlZCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnV2FybmluZzogc3VwZXJhZ2VudCByZXF1ZXN0IHdhcyBzZW50IHR3aWNlLCBiZWNhdXNlIGJvdGggLmVuZCgpIGFuZCAudGhlbigpIHdlcmUgY2FsbGVkLiBOZXZlciBjYWxsIC5lbmQoKSBpZiB5b3UgdXNlIHByb21pc2VzJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNlbGYub24oJ2Fib3J0JywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy50aW1lZG91dCAmJiB0aGlzLnRpbWVkb3V0RXJyb3IpIHtcbiAgICAgICAgICByZWplY3QodGhpcy50aW1lZG91dEVycm9yKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoJ0Fib3J0ZWQnKTtcbiAgICAgICAgZXJyLmNvZGUgPSAnQUJPUlRFRCc7XG4gICAgICAgIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgICAgICAgZXJyLm1ldGhvZCA9IHRoaXMubWV0aG9kO1xuICAgICAgICBlcnIudXJsID0gdGhpcy51cmw7XG4gICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgICBzZWxmLmVuZCgoZXJyLCByZXMpID0+IHtcbiAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycik7XG4gICAgICAgIGVsc2UgcmVzb2x2ZShyZXMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fZnVsbGZpbGxlZFByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24oY2IpIHtcbiAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIGNiKTtcbn07XG5cbi8qKlxuICogQWxsb3cgZm9yIGV4dGVuc2lvblxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS51c2UgPSBmdW5jdGlvbihmbikge1xuICBmbih0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUub2sgPSBmdW5jdGlvbihjYikge1xuICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIHRoaXMuX29rQ2FsbGJhY2sgPSBjYjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX2lzUmVzcG9uc2VPSyA9IGZ1bmN0aW9uKHJlcykge1xuICBpZiAoIXJlcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLl9va0NhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuX29rQ2FsbGJhY2socmVzKTtcbiAgfVxuXG4gIHJldHVybiByZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwO1xufTtcblxuLyoqXG4gKiBHZXQgcmVxdWVzdCBoZWFkZXIgYGZpZWxkYC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihmaWVsZCkge1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqIFRoaXMgaXMgYSBkZXByZWNhdGVkIGludGVybmFsIEFQSS4gVXNlIGAuZ2V0KGZpZWxkKWAgaW5zdGVhZC5cbiAqXG4gKiAoZ2V0SGVhZGVyIGlzIG5vIGxvbmdlciB1c2VkIGludGVybmFsbHkgYnkgdGhlIHN1cGVyYWdlbnQgY29kZSBiYXNlKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKiBAZGVwcmVjYXRlZFxuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXRIZWFkZXIgPSBSZXF1ZXN0QmFzZS5wcm90b3R5cGUuZ2V0O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oZmllbGQsIHZhbCkge1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZmllbGQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZmllbGQsIGtleSkpXG4gICAgICAgIHRoaXMuc2V0KGtleSwgZmllbGRba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkIGZpZWxkIG5hbWVcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24oZmllbGQpIHtcbiAgZGVsZXRlIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbiAgZGVsZXRlIHRoaXMuaGVhZGVyW2ZpZWxkXTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdyaXRlIHRoZSBmaWVsZCBgbmFtZWAgYW5kIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0XG4gKiBmb3IgXCJtdWx0aXBhcnQvZm9ybS1kYXRhXCIgcmVxdWVzdCBib2RpZXMuXG4gKlxuICogYGBgIGpzXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoJ2ZvbycsICdiYXInKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiByZXF1ZXN0LnBvc3QoJy91cGxvYWQnKVxuICogICAuZmllbGQoeyBmb286ICdiYXInLCBiYXo6ICdxdXgnIH0pXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBuYW1lIG5hbWUgb2YgZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZXxCdWZmZXJ8ZnMuUmVhZFN0cmVhbX0gdmFsIHZhbHVlIG9mIGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbCkge1xuICAvLyBuYW1lIHNob3VsZCBiZSBlaXRoZXIgYSBzdHJpbmcgb3IgYW4gb2JqZWN0LlxuICBpZiAobmFtZSA9PT0gbnVsbCB8fCB1bmRlZmluZWQgPT09IG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJy5maWVsZChuYW1lLCB2YWwpIG5hbWUgY2FuIG5vdCBiZSBlbXB0eScpO1xuICB9XG5cbiAgaWYgKHRoaXMuX2RhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIi5maWVsZCgpIGNhbid0IGJlIHVzZWQgaWYgLnNlbmQoKSBpcyB1c2VkLiBQbGVhc2UgdXNlIG9ubHkgLnNlbmQoKSBvciBvbmx5IC5maWVsZCgpICYgLmF0dGFjaCgpXCJcbiAgICApO1xuICB9XG5cbiAgaWYgKGlzT2JqZWN0KG5hbWUpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gbmFtZSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChuYW1lLCBrZXkpKVxuICAgICAgICB0aGlzLmZpZWxkKGtleSwgbmFtZVtrZXldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICBmb3IgKGNvbnN0IGkgaW4gdmFsKSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbCwgaSkpXG4gICAgICAgIHRoaXMuZmllbGQobmFtZSwgdmFsW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHZhbCBzaG91bGQgYmUgZGVmaW5lZCBub3dcbiAgaWYgKHZhbCA9PT0gbnVsbCB8fCB1bmRlZmluZWQgPT09IHZhbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignLmZpZWxkKG5hbWUsIHZhbCkgdmFsIGNhbiBub3QgYmUgZW1wdHknKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWwgPSBTdHJpbmcodmFsKTtcbiAgfVxuXG4gIHRoaXMuX2dldEZvcm1EYXRhKCkuYXBwZW5kKG5hbWUsIHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IHJlcXVlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhpcy5fYWJvcnRlZCA9IHRydWU7XG4gIGlmICh0aGlzLnhocikgdGhpcy54aHIuYWJvcnQoKTsgLy8gYnJvd3NlclxuICBpZiAodGhpcy5yZXEpIHRoaXMucmVxLmFib3J0KCk7IC8vIG5vZGVcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fYXV0aCA9IGZ1bmN0aW9uKHVzZXIsIHBhc3MsIG9wdGlvbnMsIGJhc2U2NEVuY29kZXIpIHtcbiAgc3dpdGNoIChvcHRpb25zLnR5cGUpIHtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCYXNpYyAke2Jhc2U2NEVuY29kZXIoYCR7dXNlcn06JHtwYXNzfWApfWApO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhdXRvJzpcbiAgICAgIHRoaXMudXNlcm5hbWUgPSB1c2VyO1xuICAgICAgdGhpcy5wYXNzd29yZCA9IHBhc3M7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JlYXJlcic6IC8vIHVzYWdlIHdvdWxkIGJlIC5hdXRoKGFjY2Vzc1Rva2VuLCB7IHR5cGU6ICdiZWFyZXInIH0pXG4gICAgICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyfWApO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVuYWJsZSB0cmFuc21pc3Npb24gb2YgY29va2llcyB3aXRoIHgtZG9tYWluIHJlcXVlc3RzLlxuICpcbiAqIE5vdGUgdGhhdCBmb3IgdGhpcyB0byB3b3JrIHRoZSBvcmlnaW4gbXVzdCBub3QgYmVcbiAqIHVzaW5nIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIgd2l0aCBhIHdpbGRjYXJkLFxuICogYW5kIGFsc28gbXVzdCBzZXQgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiXG4gKiB0byBcInRydWVcIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbihvbikge1xuICAvLyBUaGlzIGlzIGJyb3dzZXItb25seSBmdW5jdGlvbmFsaXR5LiBOb2RlIHNpZGUgaXMgbm8tb3AuXG4gIGlmIChvbiA9PT0gdW5kZWZpbmVkKSBvbiA9IHRydWU7XG4gIHRoaXMuX3dpdGhDcmVkZW50aWFscyA9IG9uO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSBtYXggcmVkaXJlY3RzIHRvIGBuYC4gRG9lcyBub3RoaW5nIGluIGJyb3dzZXIgWEhSIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnJlZGlyZWN0cyA9IGZ1bmN0aW9uKG4pIHtcbiAgdGhpcy5fbWF4UmVkaXJlY3RzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1heGltdW0gc2l6ZSBvZiBidWZmZXJlZCByZXNwb25zZSBib2R5LCBpbiBieXRlcy4gQ291bnRzIHVuY29tcHJlc3NlZCBzaXplLlxuICogRGVmYXVsdCAyMDBNQi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbiBudW1iZXIgb2YgYnl0ZXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUubWF4UmVzcG9uc2VTaXplID0gZnVuY3Rpb24obikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhcmd1bWVudCcpO1xuICB9XG5cbiAgdGhpcy5fbWF4UmVzcG9uc2VTaXplID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbnZlcnQgdG8gYSBwbGFpbiBqYXZhc2NyaXB0IG9iamVjdCAobm90IEpTT04gc3RyaW5nKSBvZiBzY2FsYXIgcHJvcGVydGllcy5cbiAqIE5vdGUgYXMgdGhpcyBtZXRob2QgaXMgZGVzaWduZWQgdG8gcmV0dXJuIGEgdXNlZnVsIG5vbi10aGlzIHZhbHVlLFxuICogaXQgY2Fubm90IGJlIGNoYWluZWQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBkZXNjcmliaW5nIG1ldGhvZCwgdXJsLCBhbmQgZGF0YSBvZiB0aGlzIHJlcXVlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIG1ldGhvZDogdGhpcy5tZXRob2QsXG4gICAgdXJsOiB0aGlzLnVybCxcbiAgICBkYXRhOiB0aGlzLl9kYXRhLFxuICAgIGhlYWRlcnM6IHRoaXMuX2hlYWRlclxuICB9O1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCBhcyB0aGUgcmVxdWVzdCBib2R5LCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIG1hbnVhbCBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2pzb24nKVxuICogICAgICAgICAuc2VuZCgne1wibmFtZVwiOlwidGpcIn0nKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGRhdGFcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29tcGxleGl0eVxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIGNvbnN0IGlzT2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIGxldCB0eXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcblxuICBpZiAodGhpcy5fZm9ybURhdGEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIi5zZW5kKCkgY2FuJ3QgYmUgdXNlZCBpZiAuYXR0YWNoKCkgb3IgLmZpZWxkKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpc09iaiAmJiAhdGhpcy5fZGF0YSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICB0aGlzLl9kYXRhID0gW107XG4gICAgfSBlbHNlIGlmICghdGhpcy5faXNIb3N0KGRhdGEpKSB7XG4gICAgICB0aGlzLl9kYXRhID0ge307XG4gICAgfVxuICB9IGVsc2UgaWYgKGRhdGEgJiYgdGhpcy5fZGF0YSAmJiB0aGlzLl9pc0hvc3QodGhpcy5fZGF0YSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBtZXJnZSB0aGVzZSBzZW5kIGNhbGxzXCIpO1xuICB9XG5cbiAgLy8gbWVyZ2VcbiAgaWYgKGlzT2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpKVxuICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgIC8vIGRlZmF1bHQgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcbiAgICBpZiAodHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhID8gYCR7dGhpcy5fZGF0YX0mJHtkYXRhfWAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIWlzT2JqIHx8IHRoaXMuX2lzSG9zdChkYXRhKSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZGVmYXVsdCB0byBqc29uXG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTb3J0IGBxdWVyeXN0cmluZ2AgYnkgdGhlIHNvcnQgZnVuY3Rpb25cbiAqXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gZGVmYXVsdCBvcmRlclxuICogICAgICAgcmVxdWVzdC5nZXQoJy91c2VyJylcbiAqICAgICAgICAgLnF1ZXJ5KCduYW1lPU5pY2snKVxuICogICAgICAgICAucXVlcnkoJ3NlYXJjaD1NYW5ueScpXG4gKiAgICAgICAgIC5zb3J0UXVlcnkoKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGN1c3RvbWl6ZWQgc29ydCBmdW5jdGlvblxuICogICAgICAgcmVxdWVzdC5nZXQoJy91c2VyJylcbiAqICAgICAgICAgLnF1ZXJ5KCduYW1lPU5pY2snKVxuICogICAgICAgICAucXVlcnkoJ3NlYXJjaD1NYW5ueScpXG4gKiAgICAgICAgIC5zb3J0UXVlcnkoZnVuY3Rpb24oYSwgYil7XG4gKiAgICAgICAgICAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG4gKiAgICAgICAgIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHNvcnRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc29ydFF1ZXJ5ID0gZnVuY3Rpb24oc29ydCkge1xuICAvLyBfc29ydCBkZWZhdWx0IHRvIHRydWUgYnV0IG90aGVyd2lzZSBjYW4gYmUgYSBmdW5jdGlvbiBvciBib29sZWFuXG4gIHRoaXMuX3NvcnQgPSB0eXBlb2Ygc29ydCA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogc29ydDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbXBvc2UgcXVlcnlzdHJpbmcgdG8gYXBwZW5kIHRvIHJlcS51cmxcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICBpZiAocXVlcnkpIHtcbiAgICB0aGlzLnVybCArPSAodGhpcy51cmwuaW5jbHVkZXMoJz8nKSA/ICcmJyA6ICc/JykgKyBxdWVyeTtcbiAgfVxuXG4gIHRoaXMuX3F1ZXJ5Lmxlbmd0aCA9IDA7IC8vIE1ha2VzIHRoZSBjYWxsIGlkZW1wb3RlbnRcblxuICBpZiAodGhpcy5fc29ydCkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy51cmwuaW5kZXhPZignPycpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBjb25zdCBxdWVyeUFyciA9IHRoaXMudXJsLnNsaWNlKGluZGV4ICsgMSkuc3BsaXQoJyYnKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fc29ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBxdWVyeUFyci5zb3J0KHRoaXMuX3NvcnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcXVlcnlBcnIuc29ydCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVybCA9IHRoaXMudXJsLnNsaWNlKDAsIGluZGV4KSArICc/JyArIHF1ZXJ5QXJyLmpvaW4oJyYnKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEZvciBiYWNrd2FyZHMgY29tcGF0IG9ubHlcblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fYXBwZW5kUXVlcnlTdHJpbmcgPSAoKSA9PiB7XG4gIGNvbnNvbGUud2FybignVW5zdXBwb3J0ZWQnKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX3RpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKHJlYXNvbiwgdGltZW91dCwgZXJybm8pIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoYCR7cmVhc29uICsgdGltZW91dH1tcyBleGNlZWRlZGApO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIGVyci5jb2RlID0gJ0VDT05OQUJPUlRFRCc7XG4gIGVyci5lcnJubyA9IGVycm5vO1xuICB0aGlzLnRpbWVkb3V0ID0gdHJ1ZTtcbiAgdGhpcy50aW1lZG91dEVycm9yID0gZXJyO1xuICB0aGlzLmFib3J0KCk7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fc2V0VGltZW91dHMgPSBmdW5jdGlvbigpIHtcbiAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgLy8gZGVhZGxpbmVcbiAgaWYgKHRoaXMuX3RpbWVvdXQgJiYgIXRoaXMuX3RpbWVyKSB7XG4gICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNlbGYuX3RpbWVvdXRFcnJvcignVGltZW91dCBvZiAnLCBzZWxmLl90aW1lb3V0LCAnRVRJTUUnKTtcbiAgICB9LCB0aGlzLl90aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHJlc3BvbnNlIHRpbWVvdXRcbiAgaWYgKHRoaXMuX3Jlc3BvbnNlVGltZW91dCAmJiAhdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIpIHtcbiAgICB0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2VsZi5fdGltZW91dEVycm9yKFxuICAgICAgICAnUmVzcG9uc2UgdGltZW91dCBvZiAnLFxuICAgICAgICBzZWxmLl9yZXNwb25zZVRpbWVvdXQsXG4gICAgICAgICdFVElNRURPVVQnXG4gICAgICApO1xuICAgIH0sIHRoaXMuX3Jlc3BvbnNlVGltZW91dCk7XG4gIH1cbn07XG4iXX0=

/***/ }),

/***/ "./node_modules/superagent/lib/response-base.js":
/*!******************************************************!*\
  !*** ./node_modules/superagent/lib/response-base.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Module dependencies.
 */
var utils = __webpack_require__(/*! ./utils */ "./node_modules/superagent/lib/utils.js");
/**
 * Expose `ResponseBase`.
 */


module.exports = ResponseBase;
/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(ResponseBase.prototype, key)) obj[key] = ResponseBase.prototype[key];
  }

  return obj;
}
/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */


ResponseBase.prototype.get = function (field) {
  return this.header[field.toLowerCase()];
};
/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */


ResponseBase.prototype._setHeaderProperties = function (header) {
  // TODO: moar!
  // TODO: make this a util
  // content-type
  var ct = header['content-type'] || '';
  this.type = utils.type(ct); // params

  var params = utils.params(ct);

  for (var key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) this[key] = params[key];
  }

  this.links = {}; // links

  try {
    if (header.link) {
      this.links = utils.parseLinks(header.link);
    }
  } catch (_unused) {// ignore
  }
};
/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */


ResponseBase.prototype._setStatusProperties = function (status) {
  var type = status / 100 | 0; // status / class

  this.statusCode = status;
  this.status = this.statusCode;
  this.statusType = type; // basics

  this.info = type === 1;
  this.ok = type === 2;
  this.redirect = type === 3;
  this.clientError = type === 4;
  this.serverError = type === 5;
  this.error = type === 4 || type === 5 ? this.toError() : false; // sugar

  this.created = status === 201;
  this.accepted = status === 202;
  this.noContent = status === 204;
  this.badRequest = status === 400;
  this.unauthorized = status === 401;
  this.notAcceptable = status === 406;
  this.forbidden = status === 403;
  this.notFound = status === 404;
  this.unprocessableEntity = status === 422;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNwb25zZS1iYXNlLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJSZXNwb25zZUJhc2UiLCJvYmoiLCJtaXhpbiIsImtleSIsInByb3RvdHlwZSIsIk9iamVjdCIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImdldCIsImZpZWxkIiwiaGVhZGVyIiwidG9Mb3dlckNhc2UiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsImN0IiwidHlwZSIsInBhcmFtcyIsImxpbmtzIiwibGluayIsInBhcnNlTGlua3MiLCJfc2V0U3RhdHVzUHJvcGVydGllcyIsInN0YXR1cyIsInN0YXR1c0NvZGUiLCJzdGF0dXNUeXBlIiwiaW5mbyIsIm9rIiwicmVkaXJlY3QiLCJjbGllbnRFcnJvciIsInNlcnZlckVycm9yIiwiZXJyb3IiLCJ0b0Vycm9yIiwiY3JlYXRlZCIsImFjY2VwdGVkIiwibm9Db250ZW50IiwiYmFkUmVxdWVzdCIsInVuYXV0aG9yaXplZCIsIm5vdEFjY2VwdGFibGUiLCJmb3JiaWRkZW4iLCJub3RGb3VuZCIsInVucHJvY2Vzc2FibGVFbnRpdHkiXSwibWFwcGluZ3MiOiI7O0FBQUE7OztBQUlBLElBQU1BLEtBQUssR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBckI7QUFFQTs7Ozs7QUFJQUMsTUFBTSxDQUFDQyxPQUFQLEdBQWlCQyxZQUFqQjtBQUVBOzs7Ozs7QUFNQSxTQUFTQSxZQUFULENBQXNCQyxHQUF0QixFQUEyQjtBQUN6QixNQUFJQSxHQUFKLEVBQVMsT0FBT0MsS0FBSyxDQUFDRCxHQUFELENBQVo7QUFDVjtBQUVEOzs7Ozs7Ozs7QUFRQSxTQUFTQyxLQUFULENBQWVELEdBQWYsRUFBb0I7QUFDbEIsT0FBSyxJQUFNRSxHQUFYLElBQWtCSCxZQUFZLENBQUNJLFNBQS9CLEVBQTBDO0FBQ3hDLFFBQUlDLE1BQU0sQ0FBQ0QsU0FBUCxDQUFpQkUsY0FBakIsQ0FBZ0NDLElBQWhDLENBQXFD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LEdBQTJCbEIsTUFBTSxLQUFLLEdBQXRDO0FBQ0QsQ0ExQkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuY29uc3QgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZUJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVzcG9uc2VCYXNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlQmFzZWAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZUJhc2Uob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufVxuXG4vKipcbiAqIE1peGluIHRoZSBwcm90b3R5cGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gUmVzcG9uc2VCYXNlLnByb3RvdHlwZSkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoUmVzcG9uc2VCYXNlLnByb3RvdHlwZSwga2V5KSlcbiAgICAgIG9ialtrZXldID0gUmVzcG9uc2VCYXNlLnByb3RvdHlwZVtrZXldO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZUJhc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKSB7XG4gIHJldHVybiB0aGlzLmhlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IGhlYWRlciByZWxhdGVkIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAudHlwZWAgdGhlIGNvbnRlbnQgdHlwZSB3aXRob3V0IHBhcmFtc1xuICpcbiAqIEEgcmVzcG9uc2Ugb2YgXCJDb250ZW50LVR5cGU6IHRleHQvcGxhaW47IGNoYXJzZXQ9dXRmLThcIlxuICogd2lsbCBwcm92aWRlIHlvdSB3aXRoIGEgYC50eXBlYCBvZiBcInRleHQvcGxhaW5cIi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZUJhc2UucHJvdG90eXBlLl9zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKSB7XG4gIC8vIFRPRE86IG1vYXIhXG4gIC8vIFRPRE86IG1ha2UgdGhpcyBhIHV0aWxcblxuICAvLyBjb250ZW50LXR5cGVcbiAgY29uc3QgY3QgPSBoZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB1dGlscy50eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgY29uc3QgcGFyYW1zID0gdXRpbHMucGFyYW1zKGN0KTtcbiAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1zKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwYXJhbXMsIGtleSkpXG4gICAgICB0aGlzW2tleV0gPSBwYXJhbXNba2V5XTtcbiAgfVxuXG4gIHRoaXMubGlua3MgPSB7fTtcblxuICAvLyBsaW5rc1xuICB0cnkge1xuICAgIGlmIChoZWFkZXIubGluaykge1xuICAgICAgdGhpcy5saW5rcyA9IHV0aWxzLnBhcnNlTGlua3MoaGVhZGVyLmxpbmspO1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gaWdub3JlXG4gIH1cbn07XG5cbi8qKlxuICogU2V0IGZsYWdzIHN1Y2ggYXMgYC5va2AgYmFzZWQgb24gYHN0YXR1c2AuXG4gKlxuICogRm9yIGV4YW1wbGUgYSAyeHggcmVzcG9uc2Ugd2lsbCBnaXZlIHlvdSBhIGAub2tgIG9mIF9fdHJ1ZV9fXG4gKiB3aGVyZWFzIDV4eCB3aWxsIGJlIF9fZmFsc2VfXyBhbmQgYC5lcnJvcmAgd2lsbCBiZSBfX3RydWVfXy4gVGhlXG4gKiBgLmNsaWVudEVycm9yYCBhbmQgYC5zZXJ2ZXJFcnJvcmAgYXJlIGFsc28gYXZhaWxhYmxlIHRvIGJlIG1vcmVcbiAqIHNwZWNpZmljLCBhbmQgYC5zdGF0dXNUeXBlYCBpcyB0aGUgY2xhc3Mgb2YgZXJyb3IgcmFuZ2luZyBmcm9tIDEuLjVcbiAqIHNvbWV0aW1lcyB1c2VmdWwgZm9yIG1hcHBpbmcgcmVzcG9uZCBjb2xvcnMgZXRjLlxuICpcbiAqIFwic3VnYXJcIiBwcm9wZXJ0aWVzIGFyZSBhbHNvIGRlZmluZWQgZm9yIGNvbW1vbiBjYXNlcy4gQ3VycmVudGx5IHByb3ZpZGluZzpcbiAqXG4gKiAgIC0gLm5vQ29udGVudFxuICogICAtIC5iYWRSZXF1ZXN0XG4gKiAgIC0gLnVuYXV0aG9yaXplZFxuICogICAtIC5ub3RBY2NlcHRhYmxlXG4gKiAgIC0gLm5vdEZvdW5kXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXR1c1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVzcG9uc2VCYXNlLnByb3RvdHlwZS5fc2V0U3RhdHVzUHJvcGVydGllcyA9IGZ1bmN0aW9uKHN0YXR1cykge1xuICBjb25zdCB0eXBlID0gKHN0YXR1cyAvIDEwMCkgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzQ29kZSA9IHN0YXR1cztcbiAgdGhpcy5zdGF0dXMgPSB0aGlzLnN0YXR1c0NvZGU7XG4gIHRoaXMuc3RhdHVzVHlwZSA9IHR5cGU7XG5cbiAgLy8gYmFzaWNzXG4gIHRoaXMuaW5mbyA9IHR5cGUgPT09IDE7XG4gIHRoaXMub2sgPSB0eXBlID09PSAyO1xuICB0aGlzLnJlZGlyZWN0ID0gdHlwZSA9PT0gMztcbiAgdGhpcy5jbGllbnRFcnJvciA9IHR5cGUgPT09IDQ7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSB0eXBlID09PSA1O1xuICB0aGlzLmVycm9yID0gdHlwZSA9PT0gNCB8fCB0eXBlID09PSA1ID8gdGhpcy50b0Vycm9yKCkgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmNyZWF0ZWQgPSBzdGF0dXMgPT09IDIwMTtcbiAgdGhpcy5hY2NlcHRlZCA9IHN0YXR1cyA9PT0gMjAyO1xuICB0aGlzLm5vQ29udGVudCA9IHN0YXR1cyA9PT0gMjA0O1xuICB0aGlzLmJhZFJlcXVlc3QgPSBzdGF0dXMgPT09IDQwMDtcbiAgdGhpcy51bmF1dGhvcml6ZWQgPSBzdGF0dXMgPT09IDQwMTtcbiAgdGhpcy5ub3RBY2NlcHRhYmxlID0gc3RhdHVzID09PSA0MDY7XG4gIHRoaXMuZm9yYmlkZGVuID0gc3RhdHVzID09PSA0MDM7XG4gIHRoaXMubm90Rm91bmQgPSBzdGF0dXMgPT09IDQwNDtcbiAgdGhpcy51bnByb2Nlc3NhYmxlRW50aXR5ID0gc3RhdHVzID09PSA0MjI7XG59O1xuIl19

/***/ }),

/***/ "./node_modules/superagent/lib/utils.js":
/*!**********************************************!*\
  !*** ./node_modules/superagent/lib/utils.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.type = function (str) {
  return str.split(/ *; */).shift();
};
/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.params = function (str) {
  return str.split(/ *; */).reduce(function (obj, str) {
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();
    if (key && val) obj[key] = val;
    return obj;
  }, {});
};
/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.parseLinks = function (str) {
  return str.split(/ *, */).reduce(function (obj, str) {
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};
/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */


exports.cleanHeader = function (header, changesOrigin) {
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header.host; // secuirty

  if (changesOrigin) {
    delete header.authorization;
    delete header.cookie;
  }

  return header;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJleHBvcnRzIiwidHlwZSIsInN0ciIsInNwbGl0Iiwic2hpZnQiLCJwYXJhbXMiLCJyZWR1Y2UiLCJvYmoiLCJwYXJ0cyIsImtleSIsInZhbCIsInBhcnNlTGlua3MiLCJ1cmwiLCJzbGljZSIsInJlbCIsImNsZWFuSGVhZGVyIiwiaGVhZGVyIiwiY2hhbmdlc09yaWdpbiIsImhvc3QiLCJhdXRob3JpemF0aW9uIiwiY29va2llIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBUUFBLE9BQU8sQ0FBQ0MsSUFBUixHQUFlLFVBQUFDLEdBQUc7QUFBQSxTQUFJQSxHQUFHLENBQUNDLEtBQUosQ0FBVSxPQUFWLEVBQW1CQyxLQUFuQixFQUFKO0FBQUEsQ0FBbEI7QUFFQTs7Ozs7Ozs7O0FBUUFKLE9BQU8sQ0FBQ0ssTUFBUixHQUFpQixVQUFBSCxHQUFHO0FBQUEsU0FDbEJBLEdBQUcsQ0FBQ0MsS0FBSixDQUFVLE9BQVYsRUFBbUJHLE1BQW5CLENBQTBCLFVBQUNDLEdBQUQsRUFBTUwsR0FBTixFQUFjO0FBQ3RDLFFBQU1NLEtBQUssR0FBR04sR0FBRyxDQUFDQyxLQUFKLENBQVUsT0FBVixDQUFkO0FBQ0EsUUFBTU0sR0FBRyxHQUFHRCxLQUFLLENBQUNKLEtBQU4sRUFBWjtBQUNBLFFBQU1NLEdBQUcsR0FBR0YsS0FBSyxDQUFDSixLQUFOLEVBQVo7QUFFQSxRQUFJSyxHQUFHLElBQUlDLEdBQVgsRUFBZ0JILEdBQUcsQ0FBQ0UsR0FBRCxDQUFILEdBQVdDLEdBQVg7QUFDaEIsV0FBT0gsR0FBUDtBQUNELEdBUEQsRUFPRyxFQVBILENBRGtCO0FBQUEsQ0FBcEI7QUFVQTs7Ozs7Ozs7O0FBUUFQLE9BQU8sQ0FBQ1csVUFBUixHQUFxQixVQUFBVCxHQUFHO0FBQUEsU0FDdEJBLEdBQUcsQ0FBQ0MsS0FBSixDQUFVLE9BQVYsRUFBbUJHLE1BQW5CLENBQTBCLFVBQUNDLEdBQUQsRUFBTUwsR0FBTixFQUFjO0FBQ3RDLFFBQU1NLEtBQUssR0FBR04sR0FBRyxDQUFDQyxLQUFKLENBQVUsT0FBVixDQUFkO0FBQ0EsUUFBTVMsR0FBRyxHQUFHSixLQUFLLENBQUMsQ0FBRCxDQUFMLENBQVNLLEtBQVQsQ0FBZSxDQUFmLEVBQWtCLENBQUMsQ0FBbkIsQ0FBWjtBQUNBLFFBQU1DLEdBQUcsR0FBR04sS0FBSyxDQUFDLENBQUQsQ0FBTCxDQUFTTCxLQUFULENBQWUsT0FBZixFQUF3QixDQUF4QixFQUEyQlUsS0FBM0IsQ0FBaUMsQ0FBakMsRUFBb0MsQ0FBQyxDQUFyQyxDQUFaO0FBQ0FOLElBQUFBLEdBQUcsQ0FBQ08sR0FBRCxDQUFILEdBQVdGLEdBQVg7QUFDQSxXQUFPTCxHQUFQO0FBQ0QsR0FORCxFQU1HLEVBTkgsQ0FEc0I7QUFBQSxDQUF4QjtBQVNBOzs7Ozs7Ozs7QUFRQVAsT0FBTyxDQUFDZSxXQUFSLEdBQXNCLFVBQUNDLE1BQUQsRUFBU0MsYUFBVCxFQUEyQjtBQUMvQyxTQUFPRCxNQUFNLENBQUMsY0FBRCxDQUFiO0FBQ0EsU0FBT0EsTUFBTSxDQUFDLGdCQUFELENBQWI7QUFDQSxTQUFPQSxNQUFNLENBQUMsbUJBQUQsQ0FBYjtBQUNBLFNBQU9BLE1BQU0sQ0FBQ0UsSUFBZCxDQUorQyxDQUsvQzs7QUFDQSxNQUFJRCxhQUFKLEVBQW1CO0FBQ2pCLFdBQU9ELE1BQU0sQ0FBQ0csYUFBZDtBQUNBLFdBQU9ILE1BQU0sQ0FBQ0ksTUFBZDtBQUNEOztBQUVELFNBQU9KLE1BQVA7QUFDRCxDQVpEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMudHlwZSA9IHN0ciA9PiBzdHIuc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5wYXJhbXMgPSBzdHIgPT5cbiAgc3RyLnNwbGl0KC8gKjsgKi8pLnJlZHVjZSgob2JqLCBzdHIpID0+IHtcbiAgICBjb25zdCBwYXJ0cyA9IHN0ci5zcGxpdCgvICo9ICovKTtcbiAgICBjb25zdCBrZXkgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIGNvbnN0IHZhbCA9IHBhcnRzLnNoaWZ0KCk7XG5cbiAgICBpZiAoa2V5ICYmIHZhbCkgb2JqW2tleV0gPSB2YWw7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xuXG4vKipcbiAqIFBhcnNlIExpbmsgaGVhZGVyIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLnBhcnNlTGlua3MgPSBzdHIgPT5cbiAgc3RyLnNwbGl0KC8gKiwgKi8pLnJlZHVjZSgob2JqLCBzdHIpID0+IHtcbiAgICBjb25zdCBwYXJ0cyA9IHN0ci5zcGxpdCgvICo7ICovKTtcbiAgICBjb25zdCB1cmwgPSBwYXJ0c1swXS5zbGljZSgxLCAtMSk7XG4gICAgY29uc3QgcmVsID0gcGFydHNbMV0uc3BsaXQoLyAqPSAqLylbMV0uc2xpY2UoMSwgLTEpO1xuICAgIG9ialtyZWxdID0gdXJsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcblxuLyoqXG4gKiBTdHJpcCBjb250ZW50IHJlbGF0ZWQgZmllbGRzIGZyb20gYGhlYWRlcmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGhlYWRlclxuICogQHJldHVybiB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuY2xlYW5IZWFkZXIgPSAoaGVhZGVyLCBjaGFuZ2VzT3JpZ2luKSA9PiB7XG4gIGRlbGV0ZSBoZWFkZXJbJ2NvbnRlbnQtdHlwZSddO1xuICBkZWxldGUgaGVhZGVyWydjb250ZW50LWxlbmd0aCddO1xuICBkZWxldGUgaGVhZGVyWyd0cmFuc2Zlci1lbmNvZGluZyddO1xuICBkZWxldGUgaGVhZGVyLmhvc3Q7XG4gIC8vIHNlY3VpcnR5XG4gIGlmIChjaGFuZ2VzT3JpZ2luKSB7XG4gICAgZGVsZXRlIGhlYWRlci5hdXRob3JpemF0aW9uO1xuICAgIGRlbGV0ZSBoZWFkZXIuY29va2llO1xuICB9XG5cbiAgcmV0dXJuIGhlYWRlcjtcbn07XG4iXX0=

/***/ }),

/***/ "./node_modules/tr46/index.js":
/*!************************************!*\
  !*** ./node_modules/tr46/index.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const punycode = __webpack_require__(/*! punycode */ "./node_modules/node-libs-browser/node_modules/punycode/punycode.js");
const regexes = __webpack_require__(/*! ./lib/regexes.js */ "./node_modules/tr46/lib/regexes.js");
const mappingTable = __webpack_require__(/*! ./lib/mappingTable.json */ "./node_modules/tr46/lib/mappingTable.json");

function containsNonASCII(str) {
  return /[^\x00-\x7F]/.test(str);
}

function findStatus(val, { useSTD3ASCIIRules }) {
  let start = 0;
  let end = mappingTable.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);

    const target = mappingTable[mid];
    if (target[0][0] <= val && target[0][1] >= val) {
      if (target[1].startsWith("disallowed_STD3_")) {
        const newStatus = useSTD3ASCIIRules ? "disallowed" : target[1].slice(16);
        return [newStatus, ...target.slice(2)];
      }
      return target.slice(1);
    } else if (target[0][0] > val) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }

  return null;
}

function mapChars(domainName, { useSTD3ASCIIRules, processingOption }) {
  let hasError = false;
  let processed = "";

  for (const ch of domainName) {
    const [status, mapping] = findStatus(ch.codePointAt(0), { useSTD3ASCIIRules });

    switch (status) {
      case "disallowed":
        hasError = true;
        processed += ch;
        break;
      case "ignored":
        break;
      case "mapped":
        processed += mapping;
        break;
      case "deviation":
        if (processingOption === "transitional") {
          processed += mapping;
        } else {
          processed += ch;
        }
        break;
      case "valid":
        processed += ch;
        break;
    }
  }

  return {
    string: processed,
    error: hasError
  };
}

function validateLabel(label, { checkHyphens, checkBidi, checkJoiners, processingOption, useSTD3ASCIIRules }) {
  if (label.normalize("NFC") !== label) {
    return false;
  }

  const codePoints = Array.from(label);

  if (checkHyphens) {
    if ((codePoints[2] === "-" && codePoints[3] === "-") ||
        (label.startsWith("-") || label.endsWith("-"))) {
      return false;
    }
  }

  if (label.includes(".") ||
      (codePoints.length > 0 && regexes.combiningMarks.test(codePoints[0]))) {
    return false;
  }

  for (const ch of codePoints) {
    const [status] = findStatus(ch.codePointAt(0), { useSTD3ASCIIRules });
    if ((processingOption === "transitional" && status !== "valid") ||
        (processingOption === "nontransitional" &&
         status !== "valid" && status !== "deviation")) {
      return false;
    }
  }

  // https://tools.ietf.org/html/rfc5892#appendix-A
  if (checkJoiners) {
    let last = 0;
    for (const [i, ch] of codePoints.entries()) {
      if (ch === "\u200C" || ch === "\u200D") {
        if (i > 0) {
          if (regexes.combiningClassVirama.test(codePoints[i - 1])) {
            continue;
          }
          if (ch === "\u200C") {
            // TODO: make this more efficient
            const next = codePoints.indexOf("\u200C", i + 1);
            const test = next < 0 ? codePoints.slice(last) : codePoints.slice(last, next);
            if (regexes.validZWNJ.test(test.join(""))) {
              last = i + 1;
              continue;
            }
          }
        }
        return false;
      }
    }
  }

  // https://tools.ietf.org/html/rfc5893#section-2
  if (checkBidi) {
    let rtl;

    // 1
    if (regexes.bidiS1LTR.test(codePoints[0])) {
      rtl = false;
    } else if (regexes.bidiS1RTL.test(codePoints[0])) {
      rtl = true;
    } else {
      return false;
    }

    if (rtl) {
      // 2-4
      if (!regexes.bidiS2.test(label) ||
          !regexes.bidiS3.test(label) ||
          (regexes.bidiS4EN.test(label) && regexes.bidiS4AN.test(label))) {
        return false;
      }
    } else if (!regexes.bidiS5.test(label) ||
               !regexes.bidiS6.test(label)) { // 5-6
      return false;
    }
  }

  return true;
}

function isBidiDomain(labels) {
  const domain = labels.map(label => {
    if (label.startsWith("xn--")) {
      try {
        return punycode.decode(label.substring(4));
      } catch (err) {
        return "";
      }
    }
    return label;
  }).join(".");
  return regexes.bidiDomain.test(domain);
}

function processing(domainName, options) {
  const { processingOption } = options;

  // 1. Map.
  let { string, error } = mapChars(domainName, options);

  // 2. Normalize.
  string = string.normalize("NFC");

  // 3. Break.
  const labels = string.split(".");
  const isBidi = isBidiDomain(labels);

  // 4. Convert/Validate.
  for (const [i, origLabel] of labels.entries()) {
    let label = origLabel;
    let curProcessing = processingOption;
    if (label.startsWith("xn--")) {
      try {
        label = punycode.decode(label.substring(4));
        labels[i] = label;
      } catch (err) {
        error = true;
        continue;
      }
      curProcessing = "nontransitional";
    }

    // No need to validate if we already know there is an error.
    if (error) {
      continue;
    }
    const validation = validateLabel(label, Object.assign({}, options, {
      processingOption: curProcessing,
      checkBidi: options.checkBidi && isBidi
    }));
    if (!validation) {
      error = true;
    }
  }

  return {
    string: labels.join("."),
    error
  };
}

function toASCII(domainName, {
  checkHyphens = false,
  checkBidi = false,
  checkJoiners = false,
  useSTD3ASCIIRules = false,
  processingOption = "nontransitional",
  verifyDNSLength = false
} = {}) {
  if (processingOption !== "transitional" && processingOption !== "nontransitional") {
    throw new RangeError("processingOption must be either transitional or nontransitional");
  }

  const result = processing(domainName, {
    processingOption,
    checkHyphens,
    checkBidi,
    checkJoiners,
    useSTD3ASCIIRules
  });
  let labels = result.string.split(".");
  labels = labels.map(l => {
    if (containsNonASCII(l)) {
      try {
        return "xn--" + punycode.encode(l);
      } catch (e) {
        result.error = true;
      }
    }
    return l;
  });

  if (verifyDNSLength) {
    const total = labels.join(".").length;
    if (total > 253 || total === 0) {
      result.error = true;
    }

    for (let i = 0; i < labels.length; ++i) {
      if (labels[i].length > 63 || labels[i].length === 0) {
        result.error = true;
        break;
      }
    }
  }

  if (result.error) {
    return null;
  }
  return labels.join(".");
}

function toUnicode(domainName, {
  checkHyphens = false,
  checkBidi = false,
  checkJoiners = false,
  useSTD3ASCIIRules = false
} = {}) {
  const result = processing(domainName, {
    processingOption: "nontransitional",
    checkHyphens,
    checkBidi,
    checkJoiners,
    useSTD3ASCIIRules
  });

  return {
    domain: result.string,
    error: result.error
  };
}

module.exports = {
  toASCII,
  toUnicode
};


/***/ }),

/***/ "./node_modules/tr46/lib/mappingTable.json":
/*!*************************************************!*\
  !*** ./node_modules/tr46/lib/mappingTable.json ***!
  \*************************************************/
/*! exports provided: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570, 571, 572, 573, 574, 575, 576, 577, 578, 579, 580, 581, 582, 583, 584, 585, 586, 587, 588, 589, 590, 591, 592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 605, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615, 616, 617, 618, 619, 620, 621, 622, 623, 624, 625, 626, 627, 628, 629, 630, 631, 632, 633, 634, 635, 636, 637, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689, 690, 691, 692, 693, 694, 695, 696, 697, 698, 699, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715, 716, 717, 718, 719, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 731, 732, 733, 734, 735, 736, 737, 738, 739, 740, 741, 742, 743, 744, 745, 746, 747, 748, 749, 750, 751, 752, 753, 754, 755, 756, 757, 758, 759, 760, 761, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 782, 783, 784, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 835, 836, 837, 838, 839, 840, 841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885, 886, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904, 905, 906, 907, 908, 909, 910, 911, 912, 913, 914, 915, 916, 917, 918, 919, 920, 921, 922, 923, 924, 925, 926, 927, 928, 929, 930, 931, 932, 933, 934, 935, 936, 937, 938, 939, 940, 941, 942, 943, 944, 945, 946, 947, 948, 949, 950, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962, 963, 964, 965, 966, 967, 968, 969, 970, 971, 972, 973, 974, 975, 976, 977, 978, 979, 980, 981, 982, 983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045, 1046, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1059, 1060, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069, 1070, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100, 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120, 1121, 1122, 1123, 1124, 1125, 1126, 1127, 1128, 1129, 1130, 1131, 1132, 1133, 1134, 1135, 1136, 1137, 1138, 1139, 1140, 1141, 1142, 1143, 1144, 1145, 1146, 1147, 1148, 1149, 1150, 1151, 1152, 1153, 1154, 1155, 1156, 1157, 1158, 1159, 1160, 1161, 1162, 1163, 1164, 1165, 1166, 1167, 1168, 1169, 1170, 1171, 1172, 1173, 1174, 1175, 1176, 1177, 1178, 1179, 1180, 1181, 1182, 1183, 1184, 1185, 1186, 1187, 1188, 1189, 1190, 1191, 1192, 1193, 1194, 1195, 1196, 1197, 1198, 1199, 1200, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215, 1216, 1217, 1218, 1219, 1220, 1221, 1222, 1223, 1224, 1225, 1226, 1227, 1228, 1229, 1230, 1231, 1232, 1233, 1234, 1235, 1236, 1237, 1238, 1239, 1240, 1241, 1242, 1243, 1244, 1245, 1246, 1247, 1248, 1249, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1259, 1260, 1261, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1269, 1270, 1271, 1272, 1273, 1274, 1275, 1276, 1277, 1278, 1279, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, 1289, 1290, 1291, 1292, 1293, 1294, 1295, 1296, 1297, 1298, 1299, 1300, 1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320, 1321, 1322, 1323, 1324, 1325, 1326, 1327, 1328, 1329, 1330, 1331, 1332, 1333, 1334, 1335, 1336, 1337, 1338, 1339, 1340, 1341, 1342, 1343, 1344, 1345, 1346, 1347, 1348, 1349, 1350, 1351, 1352, 1353, 1354, 1355, 1356, 1357, 1358, 1359, 1360, 1361, 1362, 1363, 1364, 1365, 1366, 1367, 1368, 1369, 1370, 1371, 1372, 1373, 1374, 1375, 1376, 1377, 1378, 1379, 1380, 1381, 1382, 1383, 1384, 1385, 1386, 1387, 1388, 1389, 1390, 1391, 1392, 1393, 1394, 1395, 1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403, 1404, 1405, 1406, 1407, 1408, 1409, 1410, 1411, 1412, 1413, 1414, 1415, 1416, 1417, 1418, 1419, 1420, 1421, 1422, 1423, 1424, 1425, 1426, 1427, 1428, 1429, 1430, 1431, 1432, 1433, 1434, 1435, 1436, 1437, 1438, 1439, 1440, 1441, 1442, 1443, 1444, 1445, 1446, 1447, 1448, 1449, 1450, 1451, 1452, 1453, 1454, 1455, 1456, 1457, 1458, 1459, 1460, 1461, 1462, 1463, 1464, 1465, 1466, 1467, 1468, 1469, 1470, 1471, 1472, 1473, 1474, 1475, 1476, 1477, 1478, 1479, 1480, 1481, 1482, 1483, 1484, 1485, 1486, 1487, 1488, 1489, 1490, 1491, 1492, 1493, 1494, 1495, 1496, 1497, 1498, 1499, 1500, 1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514, 1515, 1516, 1517, 1518, 1519, 1520, 1521, 1522, 1523, 1524, 1525, 1526, 1527, 1528, 1529, 1530, 1531, 1532, 1533, 1534, 1535, 1536, 1537, 1538, 1539, 1540, 1541, 1542, 1543, 1544, 1545, 1546, 1547, 1548, 1549, 1550, 1551, 1552, 1553, 1554, 1555, 1556, 1557, 1558, 1559, 1560, 1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573, 1574, 1575, 1576, 1577, 1578, 1579, 1580, 1581, 1582, 1583, 1584, 1585, 1586, 1587, 1588, 1589, 1590, 1591, 1592, 1593, 1594, 1595, 1596, 1597, 1598, 1599, 1600, 1601, 1602, 1603, 1604, 1605, 1606, 1607, 1608, 1609, 1610, 1611, 1612, 1613, 1614, 1615, 1616, 1617, 1618, 1619, 1620, 1621, 1622, 1623, 1624, 1625, 1626, 1627, 1628, 1629, 1630, 1631, 1632, 1633, 1634, 1635, 1636, 1637, 1638, 1639, 1640, 1641, 1642, 1643, 1644, 1645, 1646, 1647, 1648, 1649, 1650, 1651, 1652, 1653, 1654, 1655, 1656, 1657, 1658, 1659, 1660, 1661, 1662, 1663, 1664, 1665, 1666, 1667, 1668, 1669, 1670, 1671, 1672, 1673, 1674, 1675, 1676, 1677, 1678, 1679, 1680, 1681, 1682, 1683, 1684, 1685, 1686, 1687, 1688, 1689, 1690, 1691, 1692, 1693, 1694, 1695, 1696, 1697, 1698, 1699, 1700, 1701, 1702, 1703, 1704, 1705, 1706, 1707, 1708, 1709, 1710, 1711, 1712, 1713, 1714, 1715, 1716, 1717, 1718, 1719, 1720, 1721, 1722, 1723, 1724, 1725, 1726, 1727, 1728, 1729, 1730, 1731, 1732, 1733, 1734, 1735, 1736, 1737, 1738, 1739, 1740, 1741, 1742, 1743, 1744, 1745, 1746, 1747, 1748, 1749, 1750, 1751, 1752, 1753, 1754, 1755, 1756, 1757, 1758, 1759, 1760, 1761, 1762, 1763, 1764, 1765, 1766, 1767, 1768, 1769, 1770, 1771, 1772, 1773, 1774, 1775, 1776, 1777, 1778, 1779, 1780, 1781, 1782, 1783, 1784, 1785, 1786, 1787, 1788, 1789, 1790, 1791, 1792, 1793, 1794, 1795, 1796, 1797, 1798, 1799, 1800, 1801, 1802, 1803, 1804, 1805, 1806, 1807, 1808, 1809, 1810, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819, 1820, 1821, 1822, 1823, 1824, 1825, 1826, 1827, 1828, 1829, 1830, 1831, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1839, 1840, 1841, 1842, 1843, 1844, 1845, 1846, 1847, 1848, 1849, 1850, 1851, 1852, 1853, 1854, 1855, 1856, 1857, 1858, 1859, 1860, 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868, 1869, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055, 2056, 2057, 2058, 2059, 2060, 2061, 2062, 2063, 2064, 2065, 2066, 2067, 2068, 2069, 2070, 2071, 2072, 2073, 2074, 2075, 2076, 2077, 2078, 2079, 2080, 2081, 2082, 2083, 2084, 2085, 2086, 2087, 2088, 2089, 2090, 2091, 2092, 2093, 2094, 2095, 2096, 2097, 2098, 2099, 2100, 2101, 2102, 2103, 2104, 2105, 2106, 2107, 2108, 2109, 2110, 2111, 2112, 2113, 2114, 2115, 2116, 2117, 2118, 2119, 2120, 2121, 2122, 2123, 2124, 2125, 2126, 2127, 2128, 2129, 2130, 2131, 2132, 2133, 2134, 2135, 2136, 2137, 2138, 2139, 2140, 2141, 2142, 2143, 2144, 2145, 2146, 2147, 2148, 2149, 2150, 2151, 2152, 2153, 2154, 2155, 2156, 2157, 2158, 2159, 2160, 2161, 2162, 2163, 2164, 2165, 2166, 2167, 2168, 2169, 2170, 2171, 2172, 2173, 2174, 2175, 2176, 2177, 2178, 2179, 2180, 2181, 2182, 2183, 2184, 2185, 2186, 2187, 2188, 2189, 2190, 2191, 2192, 2193, 2194, 2195, 2196, 2197, 2198, 2199, 2200, 2201, 2202, 2203, 2204, 2205, 2206, 2207, 2208, 2209, 2210, 2211, 2212, 2213, 2214, 2215, 2216, 2217, 2218, 2219, 2220, 2221, 2222, 2223, 2224, 2225, 2226, 2227, 2228, 2229, 2230, 2231, 2232, 2233, 2234, 2235, 2236, 2237, 2238, 2239, 2240, 2241, 2242, 2243, 2244, 2245, 2246, 2247, 2248, 2249, 2250, 2251, 2252, 2253, 2254, 2255, 2256, 2257, 2258, 2259, 2260, 2261, 2262, 2263, 2264, 2265, 2266, 2267, 2268, 2269, 2270, 2271, 2272, 2273, 2274, 2275, 2276, 2277, 2278, 2279, 2280, 2281, 2282, 2283, 2284, 2285, 2286, 2287, 2288, 2289, 2290, 2291, 2292, 2293, 2294, 2295, 2296, 2297, 2298, 2299, 2300, 2301, 2302, 2303, 2304, 2305, 2306, 2307, 2308, 2309, 2310, 2311, 2312, 2313, 2314, 2315, 2316, 2317, 2318, 2319, 2320, 2321, 2322, 2323, 2324, 2325, 2326, 2327, 2328, 2329, 2330, 2331, 2332, 2333, 2334, 2335, 2336, 2337, 2338, 2339, 2340, 2341, 2342, 2343, 2344, 2345, 2346, 2347, 2348, 2349, 2350, 2351, 2352, 2353, 2354, 2355, 2356, 2357, 2358, 2359, 2360, 2361, 2362, 2363, 2364, 2365, 2366, 2367, 2368, 2369, 2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2379, 2380, 2381, 2382, 2383, 2384, 2385, 2386, 2387, 2388, 2389, 2390, 2391, 2392, 2393, 2394, 2395, 2396, 2397, 2398, 2399, 2400, 2401, 2402, 2403, 2404, 2405, 2406, 2407, 2408, 2409, 2410, 2411, 2412, 2413, 2414, 2415, 2416, 2417, 2418, 2419, 2420, 2421, 2422, 2423, 2424, 2425, 2426, 2427, 2428, 2429, 2430, 2431, 2432, 2433, 2434, 2435, 2436, 2437, 2438, 2439, 2440, 2441, 2442, 2443, 2444, 2445, 2446, 2447, 2448, 2449, 2450, 2451, 2452, 2453, 2454, 2455, 2456, 2457, 2458, 2459, 2460, 2461, 2462, 2463, 2464, 2465, 2466, 2467, 2468, 2469, 2470, 2471, 2472, 2473, 2474, 2475, 2476, 2477, 2478, 2479, 2480, 2481, 2482, 2483, 2484, 2485, 2486, 2487, 2488, 2489, 2490, 2491, 2492, 2493, 2494, 2495, 2496, 2497, 2498, 2499, 2500, 2501, 2502, 2503, 2504, 2505, 2506, 2507, 2508, 2509, 2510, 2511, 2512, 2513, 2514, 2515, 2516, 2517, 2518, 2519, 2520, 2521, 2522, 2523, 2524, 2525, 2526, 2527, 2528, 2529, 2530, 2531, 2532, 2533, 2534, 2535, 2536, 2537, 2538, 2539, 2540, 2541, 2542, 2543, 2544, 2545, 2546, 2547, 2548, 2549, 2550, 2551, 2552, 2553, 2554, 2555, 2556, 2557, 2558, 2559, 2560, 2561, 2562, 2563, 2564, 2565, 2566, 2567, 2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575, 2576, 2577, 2578, 2579, 2580, 2581, 2582, 2583, 2584, 2585, 2586, 2587, 2588, 2589, 2590, 2591, 2592, 2593, 2594, 2595, 2596, 2597, 2598, 2599, 2600, 2601, 2602, 2603, 2604, 2605, 2606, 2607, 2608, 2609, 2610, 2611, 2612, 2613, 2614, 2615, 2616, 2617, 2618, 2619, 2620, 2621, 2622, 2623, 2624, 2625, 2626, 2627, 2628, 2629, 2630, 2631, 2632, 2633, 2634, 2635, 2636, 2637, 2638, 2639, 2640, 2641, 2642, 2643, 2644, 2645, 2646, 2647, 2648, 2649, 2650, 2651, 2652, 2653, 2654, 2655, 2656, 2657, 2658, 2659, 2660, 2661, 2662, 2663, 2664, 2665, 2666, 2667, 2668, 2669, 2670, 2671, 2672, 2673, 2674, 2675, 2676, 2677, 2678, 2679, 2680, 2681, 2682, 2683, 2684, 2685, 2686, 2687, 2688, 2689, 2690, 2691, 2692, 2693, 2694, 2695, 2696, 2697, 2698, 2699, 2700, 2701, 2702, 2703, 2704, 2705, 2706, 2707, 2708, 2709, 2710, 2711, 2712, 2713, 2714, 2715, 2716, 2717, 2718, 2719, 2720, 2721, 2722, 2723, 2724, 2725, 2726, 2727, 2728, 2729, 2730, 2731, 2732, 2733, 2734, 2735, 2736, 2737, 2738, 2739, 2740, 2741, 2742, 2743, 2744, 2745, 2746, 2747, 2748, 2749, 2750, 2751, 2752, 2753, 2754, 2755, 2756, 2757, 2758, 2759, 2760, 2761, 2762, 2763, 2764, 2765, 2766, 2767, 2768, 2769, 2770, 2771, 2772, 2773, 2774, 2775, 2776, 2777, 2778, 2779, 2780, 2781, 2782, 2783, 2784, 2785, 2786, 2787, 2788, 2789, 2790, 2791, 2792, 2793, 2794, 2795, 2796, 2797, 2798, 2799, 2800, 2801, 2802, 2803, 2804, 2805, 2806, 2807, 2808, 2809, 2810, 2811, 2812, 2813, 2814, 2815, 2816, 2817, 2818, 2819, 2820, 2821, 2822, 2823, 2824, 2825, 2826, 2827, 2828, 2829, 2830, 2831, 2832, 2833, 2834, 2835, 2836, 2837, 2838, 2839, 2840, 2841, 2842, 2843, 2844, 2845, 2846, 2847, 2848, 2849, 2850, 2851, 2852, 2853, 2854, 2855, 2856, 2857, 2858, 2859, 2860, 2861, 2862, 2863, 2864, 2865, 2866, 2867, 2868, 2869, 2870, 2871, 2872, 2873, 2874, 2875, 2876, 2877, 2878, 2879, 2880, 2881, 2882, 2883, 2884, 2885, 2886, 2887, 2888, 2889, 2890, 2891, 2892, 2893, 2894, 2895, 2896, 2897, 2898, 2899, 2900, 2901, 2902, 2903, 2904, 2905, 2906, 2907, 2908, 2909, 2910, 2911, 2912, 2913, 2914, 2915, 2916, 2917, 2918, 2919, 2920, 2921, 2922, 2923, 2924, 2925, 2926, 2927, 2928, 2929, 2930, 2931, 2932, 2933, 2934, 2935, 2936, 2937, 2938, 2939, 2940, 2941, 2942, 2943, 2944, 2945, 2946, 2947, 2948, 2949, 2950, 2951, 2952, 2953, 2954, 2955, 2956, 2957, 2958, 2959, 2960, 2961, 2962, 2963, 2964, 2965, 2966, 2967, 2968, 2969, 2970, 2971, 2972, 2973, 2974, 2975, 2976, 2977, 2978, 2979, 2980, 2981, 2982, 2983, 2984, 2985, 2986, 2987, 2988, 2989, 2990, 2991, 2992, 2993, 2994, 2995, 2996, 2997, 2998, 2999, 3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 3024, 3025, 3026, 3027, 3028, 3029, 3030, 3031, 3032, 3033, 3034, 3035, 3036, 3037, 3038, 3039, 3040, 3041, 3042, 3043, 3044, 3045, 3046, 3047, 3048, 3049, 3050, 3051, 3052, 3053, 3054, 3055, 3056, 3057, 3058, 3059, 3060, 3061, 3062, 3063, 3064, 3065, 3066, 3067, 3068, 3069, 3070, 3071, 3072, 3073, 3074, 3075, 3076, 3077, 3078, 3079, 3080, 3081, 3082, 3083, 3084, 3085, 3086, 3087, 3088, 3089, 3090, 3091, 3092, 3093, 3094, 3095, 3096, 3097, 3098, 3099, 3100, 3101, 3102, 3103, 3104, 3105, 3106, 3107, 3108, 3109, 3110, 3111, 3112, 3113, 3114, 3115, 3116, 3117, 3118, 3119, 3120, 3121, 3122, 3123, 3124, 3125, 3126, 3127, 3128, 3129, 3130, 3131, 3132, 3133, 3134, 3135, 3136, 3137, 3138, 3139, 3140, 3141, 3142, 3143, 3144, 3145, 3146, 3147, 3148, 3149, 3150, 3151, 3152, 3153, 3154, 3155, 3156, 3157, 3158, 3159, 3160, 3161, 3162, 3163, 3164, 3165, 3166, 3167, 3168, 3169, 3170, 3171, 3172, 3173, 3174, 3175, 3176, 3177, 3178, 3179, 3180, 3181, 3182, 3183, 3184, 3185, 3186, 3187, 3188, 3189, 3190, 3191, 3192, 3193, 3194, 3195, 3196, 3197, 3198, 3199, 3200, 3201, 3202, 3203, 3204, 3205, 3206, 3207, 3208, 3209, 3210, 3211, 3212, 3213, 3214, 3215, 3216, 3217, 3218, 3219, 3220, 3221, 3222, 3223, 3224, 3225, 3226, 3227, 3228, 3229, 3230, 3231, 3232, 3233, 3234, 3235, 3236, 3237, 3238, 3239, 3240, 3241, 3242, 3243, 3244, 3245, 3246, 3247, 3248, 3249, 3250, 3251, 3252, 3253, 3254, 3255, 3256, 3257, 3258, 3259, 3260, 3261, 3262, 3263, 3264, 3265, 3266, 3267, 3268, 3269, 3270, 3271, 3272, 3273, 3274, 3275, 3276, 3277, 3278, 3279, 3280, 3281, 3282, 3283, 3284, 3285, 3286, 3287, 3288, 3289, 3290, 3291, 3292, 3293, 3294, 3295, 3296, 3297, 3298, 3299, 3300, 3301, 3302, 3303, 3304, 3305, 3306, 3307, 3308, 3309, 3310, 3311, 3312, 3313, 3314, 3315, 3316, 3317, 3318, 3319, 3320, 3321, 3322, 3323, 3324, 3325, 3326, 3327, 3328, 3329, 3330, 3331, 3332, 3333, 3334, 3335, 3336, 3337, 3338, 3339, 3340, 3341, 3342, 3343, 3344, 3345, 3346, 3347, 3348, 3349, 3350, 3351, 3352, 3353, 3354, 3355, 3356, 3357, 3358, 3359, 3360, 3361, 3362, 3363, 3364, 3365, 3366, 3367, 3368, 3369, 3370, 3371, 3372, 3373, 3374, 3375, 3376, 3377, 3378, 3379, 3380, 3381, 3382, 3383, 3384, 3385, 3386, 3387, 3388, 3389, 3390, 3391, 3392, 3393, 3394, 3395, 3396, 3397, 3398, 3399, 3400, 3401, 3402, 3403, 3404, 3405, 3406, 3407, 3408, 3409, 3410, 3411, 3412, 3413, 3414, 3415, 3416, 3417, 3418, 3419, 3420, 3421, 3422, 3423, 3424, 3425, 3426, 3427, 3428, 3429, 3430, 3431, 3432, 3433, 3434, 3435, 3436, 3437, 3438, 3439, 3440, 3441, 3442, 3443, 3444, 3445, 3446, 3447, 3448, 3449, 3450, 3451, 3452, 3453, 3454, 3455, 3456, 3457, 3458, 3459, 3460, 3461, 3462, 3463, 3464, 3465, 3466, 3467, 3468, 3469, 3470, 3471, 3472, 3473, 3474, 3475, 3476, 3477, 3478, 3479, 3480, 3481, 3482, 3483, 3484, 3485, 3486, 3487, 3488, 3489, 3490, 3491, 3492, 3493, 3494, 3495, 3496, 3497, 3498, 3499, 3500, 3501, 3502, 3503, 3504, 3505, 3506, 3507, 3508, 3509, 3510, 3511, 3512, 3513, 3514, 3515, 3516, 3517, 3518, 3519, 3520, 3521, 3522, 3523, 3524, 3525, 3526, 3527, 3528, 3529, 3530, 3531, 3532, 3533, 3534, 3535, 3536, 3537, 3538, 3539, 3540, 3541, 3542, 3543, 3544, 3545, 3546, 3547, 3548, 3549, 3550, 3551, 3552, 3553, 3554, 3555, 3556, 3557, 3558, 3559, 3560, 3561, 3562, 3563, 3564, 3565, 3566, 3567, 3568, 3569, 3570, 3571, 3572, 3573, 3574, 3575, 3576, 3577, 3578, 3579, 3580, 3581, 3582, 3583, 3584, 3585, 3586, 3587, 3588, 3589, 3590, 3591, 3592, 3593, 3594, 3595, 3596, 3597, 3598, 3599, 3600, 3601, 3602, 3603, 3604, 3605, 3606, 3607, 3608, 3609, 3610, 3611, 3612, 3613, 3614, 3615, 3616, 3617, 3618, 3619, 3620, 3621, 3622, 3623, 3624, 3625, 3626, 3627, 3628, 3629, 3630, 3631, 3632, 3633, 3634, 3635, 3636, 3637, 3638, 3639, 3640, 3641, 3642, 3643, 3644, 3645, 3646, 3647, 3648, 3649, 3650, 3651, 3652, 3653, 3654, 3655, 3656, 3657, 3658, 3659, 3660, 3661, 3662, 3663, 3664, 3665, 3666, 3667, 3668, 3669, 3670, 3671, 3672, 3673, 3674, 3675, 3676, 3677, 3678, 3679, 3680, 3681, 3682, 3683, 3684, 3685, 3686, 3687, 3688, 3689, 3690, 3691, 3692, 3693, 3694, 3695, 3696, 3697, 3698, 3699, 3700, 3701, 3702, 3703, 3704, 3705, 3706, 3707, 3708, 3709, 3710, 3711, 3712, 3713, 3714, 3715, 3716, 3717, 3718, 3719, 3720, 3721, 3722, 3723, 3724, 3725, 3726, 3727, 3728, 3729, 3730, 3731, 3732, 3733, 3734, 3735, 3736, 3737, 3738, 3739, 3740, 3741, 3742, 3743, 3744, 3745, 3746, 3747, 3748, 3749, 3750, 3751, 3752, 3753, 3754, 3755, 3756, 3757, 3758, 3759, 3760, 3761, 3762, 3763, 3764, 3765, 3766, 3767, 3768, 3769, 3770, 3771, 3772, 3773, 3774, 3775, 3776, 3777, 3778, 3779, 3780, 3781, 3782, 3783, 3784, 3785, 3786, 3787, 3788, 3789, 3790, 3791, 3792, 3793, 3794, 3795, 3796, 3797, 3798, 3799, 3800, 3801, 3802, 3803, 3804, 3805, 3806, 3807, 3808, 3809, 3810, 3811, 3812, 3813, 3814, 3815, 3816, 3817, 3818, 3819, 3820, 3821, 3822, 3823, 3824, 3825, 3826, 3827, 3828, 3829, 3830, 3831, 3832, 3833, 3834, 3835, 3836, 3837, 3838, 3839, 3840, 3841, 3842, 3843, 3844, 3845, 3846, 3847, 3848, 3849, 3850, 3851, 3852, 3853, 3854, 3855, 3856, 3857, 3858, 3859, 3860, 3861, 3862, 3863, 3864, 3865, 3866, 3867, 3868, 3869, 3870, 3871, 3872, 3873, 3874, 3875, 3876, 3877, 3878, 3879, 3880, 3881, 3882, 3883, 3884, 3885, 3886, 3887, 3888, 3889, 3890, 3891, 3892, 3893, 3894, 3895, 3896, 3897, 3898, 3899, 3900, 3901, 3902, 3903, 3904, 3905, 3906, 3907, 3908, 3909, 3910, 3911, 3912, 3913, 3914, 3915, 3916, 3917, 3918, 3919, 3920, 3921, 3922, 3923, 3924, 3925, 3926, 3927, 3928, 3929, 3930, 3931, 3932, 3933, 3934, 3935, 3936, 3937, 3938, 3939, 3940, 3941, 3942, 3943, 3944, 3945, 3946, 3947, 3948, 3949, 3950, 3951, 3952, 3953, 3954, 3955, 3956, 3957, 3958, 3959, 3960, 3961, 3962, 3963, 3964, 3965, 3966, 3967, 3968, 3969, 3970, 3971, 3972, 3973, 3974, 3975, 3976, 3977, 3978, 3979, 3980, 3981, 3982, 3983, 3984, 3985, 3986, 3987, 3988, 3989, 3990, 3991, 3992, 3993, 3994, 3995, 3996, 3997, 3998, 3999, 4000, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010, 4011, 4012, 4013, 4014, 4015, 4016, 4017, 4018, 4019, 4020, 4021, 4022, 4023, 4024, 4025, 4026, 4027, 4028, 4029, 4030, 4031, 4032, 4033, 4034, 4035, 4036, 4037, 4038, 4039, 4040, 4041, 4042, 4043, 4044, 4045, 4046, 4047, 4048, 4049, 4050, 4051, 4052, 4053, 4054, 4055, 4056, 4057, 4058, 4059, 4060, 4061, 4062, 4063, 4064, 4065, 4066, 4067, 4068, 4069, 4070, 4071, 4072, 4073, 4074, 4075, 4076, 4077, 4078, 4079, 4080, 4081, 4082, 4083, 4084, 4085, 4086, 4087, 4088, 4089, 4090, 4091, 4092, 4093, 4094, 4095, 4096, 4097, 4098, 4099, 4100, 4101, 4102, 4103, 4104, 4105, 4106, 4107, 4108, 4109, 4110, 4111, 4112, 4113, 4114, 4115, 4116, 4117, 4118, 4119, 4120, 4121, 4122, 4123, 4124, 4125, 4126, 4127, 4128, 4129, 4130, 4131, 4132, 4133, 4134, 4135, 4136, 4137, 4138, 4139, 4140, 4141, 4142, 4143, 4144, 4145, 4146, 4147, 4148, 4149, 4150, 4151, 4152, 4153, 4154, 4155, 4156, 4157, 4158, 4159, 4160, 4161, 4162, 4163, 4164, 4165, 4166, 4167, 4168, 4169, 4170, 4171, 4172, 4173, 4174, 4175, 4176, 4177, 4178, 4179, 4180, 4181, 4182, 4183, 4184, 4185, 4186, 4187, 4188, 4189, 4190, 4191, 4192, 4193, 4194, 4195, 4196, 4197, 4198, 4199, 4200, 4201, 4202, 4203, 4204, 4205, 4206, 4207, 4208, 4209, 4210, 4211, 4212, 4213, 4214, 4215, 4216, 4217, 4218, 4219, 4220, 4221, 4222, 4223, 4224, 4225, 4226, 4227, 4228, 4229, 4230, 4231, 4232, 4233, 4234, 4235, 4236, 4237, 4238, 4239, 4240, 4241, 4242, 4243, 4244, 4245, 4246, 4247, 4248, 4249, 4250, 4251, 4252, 4253, 4254, 4255, 4256, 4257, 4258, 4259, 4260, 4261, 4262, 4263, 4264, 4265, 4266, 4267, 4268, 4269, 4270, 4271, 4272, 4273, 4274, 4275, 4276, 4277, 4278, 4279, 4280, 4281, 4282, 4283, 4284, 4285, 4286, 4287, 4288, 4289, 4290, 4291, 4292, 4293, 4294, 4295, 4296, 4297, 4298, 4299, 4300, 4301, 4302, 4303, 4304, 4305, 4306, 4307, 4308, 4309, 4310, 4311, 4312, 4313, 4314, 4315, 4316, 4317, 4318, 4319, 4320, 4321, 4322, 4323, 4324, 4325, 4326, 4327, 4328, 4329, 4330, 4331, 4332, 4333, 4334, 4335, 4336, 4337, 4338, 4339, 4340, 4341, 4342, 4343, 4344, 4345, 4346, 4347, 4348, 4349, 4350, 4351, 4352, 4353, 4354, 4355, 4356, 4357, 4358, 4359, 4360, 4361, 4362, 4363, 4364, 4365, 4366, 4367, 4368, 4369, 4370, 4371, 4372, 4373, 4374, 4375, 4376, 4377, 4378, 4379, 4380, 4381, 4382, 4383, 4384, 4385, 4386, 4387, 4388, 4389, 4390, 4391, 4392, 4393, 4394, 4395, 4396, 4397, 4398, 4399, 4400, 4401, 4402, 4403, 4404, 4405, 4406, 4407, 4408, 4409, 4410, 4411, 4412, 4413, 4414, 4415, 4416, 4417, 4418, 4419, 4420, 4421, 4422, 4423, 4424, 4425, 4426, 4427, 4428, 4429, 4430, 4431, 4432, 4433, 4434, 4435, 4436, 4437, 4438, 4439, 4440, 4441, 4442, 4443, 4444, 4445, 4446, 4447, 4448, 4449, 4450, 4451, 4452, 4453, 4454, 4455, 4456, 4457, 4458, 4459, 4460, 4461, 4462, 4463, 4464, 4465, 4466, 4467, 4468, 4469, 4470, 4471, 4472, 4473, 4474, 4475, 4476, 4477, 4478, 4479, 4480, 4481, 4482, 4483, 4484, 4485, 4486, 4487, 4488, 4489, 4490, 4491, 4492, 4493, 4494, 4495, 4496, 4497, 4498, 4499, 4500, 4501, 4502, 4503, 4504, 4505, 4506, 4507, 4508, 4509, 4510, 4511, 4512, 4513, 4514, 4515, 4516, 4517, 4518, 4519, 4520, 4521, 4522, 4523, 4524, 4525, 4526, 4527, 4528, 4529, 4530, 4531, 4532, 4533, 4534, 4535, 4536, 4537, 4538, 4539, 4540, 4541, 4542, 4543, 4544, 4545, 4546, 4547, 4548, 4549, 4550, 4551, 4552, 4553, 4554, 4555, 4556, 4557, 4558, 4559, 4560, 4561, 4562, 4563, 4564, 4565, 4566, 4567, 4568, 4569, 4570, 4571, 4572, 4573, 4574, 4575, 4576, 4577, 4578, 4579, 4580, 4581, 4582, 4583, 4584, 4585, 4586, 4587, 4588, 4589, 4590, 4591, 4592, 4593, 4594, 4595, 4596, 4597, 4598, 4599, 4600, 4601, 4602, 4603, 4604, 4605, 4606, 4607, 4608, 4609, 4610, 4611, 4612, 4613, 4614, 4615, 4616, 4617, 4618, 4619, 4620, 4621, 4622, 4623, 4624, 4625, 4626, 4627, 4628, 4629, 4630, 4631, 4632, 4633, 4634, 4635, 4636, 4637, 4638, 4639, 4640, 4641, 4642, 4643, 4644, 4645, 4646, 4647, 4648, 4649, 4650, 4651, 4652, 4653, 4654, 4655, 4656, 4657, 4658, 4659, 4660, 4661, 4662, 4663, 4664, 4665, 4666, 4667, 4668, 4669, 4670, 4671, 4672, 4673, 4674, 4675, 4676, 4677, 4678, 4679, 4680, 4681, 4682, 4683, 4684, 4685, 4686, 4687, 4688, 4689, 4690, 4691, 4692, 4693, 4694, 4695, 4696, 4697, 4698, 4699, 4700, 4701, 4702, 4703, 4704, 4705, 4706, 4707, 4708, 4709, 4710, 4711, 4712, 4713, 4714, 4715, 4716, 4717, 4718, 4719, 4720, 4721, 4722, 4723, 4724, 4725, 4726, 4727, 4728, 4729, 4730, 4731, 4732, 4733, 4734, 4735, 4736, 4737, 4738, 4739, 4740, 4741, 4742, 4743, 4744, 4745, 4746, 4747, 4748, 4749, 4750, 4751, 4752, 4753, 4754, 4755, 4756, 4757, 4758, 4759, 4760, 4761, 4762, 4763, 4764, 4765, 4766, 4767, 4768, 4769, 4770, 4771, 4772, 4773, 4774, 4775, 4776, 4777, 4778, 4779, 4780, 4781, 4782, 4783, 4784, 4785, 4786, 4787, 4788, 4789, 4790, 4791, 4792, 4793, 4794, 4795, 4796, 4797, 4798, 4799, 4800, 4801, 4802, 4803, 4804, 4805, 4806, 4807, 4808, 4809, 4810, 4811, 4812, 4813, 4814, 4815, 4816, 4817, 4818, 4819, 4820, 4821, 4822, 4823, 4824, 4825, 4826, 4827, 4828, 4829, 4830, 4831, 4832, 4833, 4834, 4835, 4836, 4837, 4838, 4839, 4840, 4841, 4842, 4843, 4844, 4845, 4846, 4847, 4848, 4849, 4850, 4851, 4852, 4853, 4854, 4855, 4856, 4857, 4858, 4859, 4860, 4861, 4862, 4863, 4864, 4865, 4866, 4867, 4868, 4869, 4870, 4871, 4872, 4873, 4874, 4875, 4876, 4877, 4878, 4879, 4880, 4881, 4882, 4883, 4884, 4885, 4886, 4887, 4888, 4889, 4890, 4891, 4892, 4893, 4894, 4895, 4896, 4897, 4898, 4899, 4900, 4901, 4902, 4903, 4904, 4905, 4906, 4907, 4908, 4909, 4910, 4911, 4912, 4913, 4914, 4915, 4916, 4917, 4918, 4919, 4920, 4921, 4922, 4923, 4924, 4925, 4926, 4927, 4928, 4929, 4930, 4931, 4932, 4933, 4934, 4935, 4936, 4937, 4938, 4939, 4940, 4941, 4942, 4943, 4944, 4945, 4946, 4947, 4948, 4949, 4950, 4951, 4952, 4953, 4954, 4955, 4956, 4957, 4958, 4959, 4960, 4961, 4962, 4963, 4964, 4965, 4966, 4967, 4968, 4969, 4970, 4971, 4972, 4973, 4974, 4975, 4976, 4977, 4978, 4979, 4980, 4981, 4982, 4983, 4984, 4985, 4986, 4987, 4988, 4989, 4990, 4991, 4992, 4993, 4994, 4995, 4996, 4997, 4998, 4999, 5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009, 5010, 5011, 5012, 5013, 5014, 5015, 5016, 5017, 5018, 5019, 5020, 5021, 5022, 5023, 5024, 5025, 5026, 5027, 5028, 5029, 5030, 5031, 5032, 5033, 5034, 5035, 5036, 5037, 5038, 5039, 5040, 5041, 5042, 5043, 5044, 5045, 5046, 5047, 5048, 5049, 5050, 5051, 5052, 5053, 5054, 5055, 5056, 5057, 5058, 5059, 5060, 5061, 5062, 5063, 5064, 5065, 5066, 5067, 5068, 5069, 5070, 5071, 5072, 5073, 5074, 5075, 5076, 5077, 5078, 5079, 5080, 5081, 5082, 5083, 5084, 5085, 5086, 5087, 5088, 5089, 5090, 5091, 5092, 5093, 5094, 5095, 5096, 5097, 5098, 5099, 5100, 5101, 5102, 5103, 5104, 5105, 5106, 5107, 5108, 5109, 5110, 5111, 5112, 5113, 5114, 5115, 5116, 5117, 5118, 5119, 5120, 5121, 5122, 5123, 5124, 5125, 5126, 5127, 5128, 5129, 5130, 5131, 5132, 5133, 5134, 5135, 5136, 5137, 5138, 5139, 5140, 5141, 5142, 5143, 5144, 5145, 5146, 5147, 5148, 5149, 5150, 5151, 5152, 5153, 5154, 5155, 5156, 5157, 5158, 5159, 5160, 5161, 5162, 5163, 5164, 5165, 5166, 5167, 5168, 5169, 5170, 5171, 5172, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5184, 5185, 5186, 5187, 5188, 5189, 5190, 5191, 5192, 5193, 5194, 5195, 5196, 5197, 5198, 5199, 5200, 5201, 5202, 5203, 5204, 5205, 5206, 5207, 5208, 5209, 5210, 5211, 5212, 5213, 5214, 5215, 5216, 5217, 5218, 5219, 5220, 5221, 5222, 5223, 5224, 5225, 5226, 5227, 5228, 5229, 5230, 5231, 5232, 5233, 5234, 5235, 5236, 5237, 5238, 5239, 5240, 5241, 5242, 5243, 5244, 5245, 5246, 5247, 5248, 5249, 5250, 5251, 5252, 5253, 5254, 5255, 5256, 5257, 5258, 5259, 5260, 5261, 5262, 5263, 5264, 5265, 5266, 5267, 5268, 5269, 5270, 5271, 5272, 5273, 5274, 5275, 5276, 5277, 5278, 5279, 5280, 5281, 5282, 5283, 5284, 5285, 5286, 5287, 5288, 5289, 5290, 5291, 5292, 5293, 5294, 5295, 5296, 5297, 5298, 5299, 5300, 5301, 5302, 5303, 5304, 5305, 5306, 5307, 5308, 5309, 5310, 5311, 5312, 5313, 5314, 5315, 5316, 5317, 5318, 5319, 5320, 5321, 5322, 5323, 5324, 5325, 5326, 5327, 5328, 5329, 5330, 5331, 5332, 5333, 5334, 5335, 5336, 5337, 5338, 5339, 5340, 5341, 5342, 5343, 5344, 5345, 5346, 5347, 5348, 5349, 5350, 5351, 5352, 5353, 5354, 5355, 5356, 5357, 5358, 5359, 5360, 5361, 5362, 5363, 5364, 5365, 5366, 5367, 5368, 5369, 5370, 5371, 5372, 5373, 5374, 5375, 5376, 5377, 5378, 5379, 5380, 5381, 5382, 5383, 5384, 5385, 5386, 5387, 5388, 5389, 5390, 5391, 5392, 5393, 5394, 5395, 5396, 5397, 5398, 5399, 5400, 5401, 5402, 5403, 5404, 5405, 5406, 5407, 5408, 5409, 5410, 5411, 5412, 5413, 5414, 5415, 5416, 5417, 5418, 5419, 5420, 5421, 5422, 5423, 5424, 5425, 5426, 5427, 5428, 5429, 5430, 5431, 5432, 5433, 5434, 5435, 5436, 5437, 5438, 5439, 5440, 5441, 5442, 5443, 5444, 5445, 5446, 5447, 5448, 5449, 5450, 5451, 5452, 5453, 5454, 5455, 5456, 5457, 5458, 5459, 5460, 5461, 5462, 5463, 5464, 5465, 5466, 5467, 5468, 5469, 5470, 5471, 5472, 5473, 5474, 5475, 5476, 5477, 5478, 5479, 5480, 5481, 5482, 5483, 5484, 5485, 5486, 5487, 5488, 5489, 5490, 5491, 5492, 5493, 5494, 5495, 5496, 5497, 5498, 5499, 5500, 5501, 5502, 5503, 5504, 5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516, 5517, 5518, 5519, 5520, 5521, 5522, 5523, 5524, 5525, 5526, 5527, 5528, 5529, 5530, 5531, 5532, 5533, 5534, 5535, 5536, 5537, 5538, 5539, 5540, 5541, 5542, 5543, 5544, 5545, 5546, 5547, 5548, 5549, 5550, 5551, 5552, 5553, 5554, 5555, 5556, 5557, 5558, 5559, 5560, 5561, 5562, 5563, 5564, 5565, 5566, 5567, 5568, 5569, 5570, 5571, 5572, 5573, 5574, 5575, 5576, 5577, 5578, 5579, 5580, 5581, 5582, 5583, 5584, 5585, 5586, 5587, 5588, 5589, 5590, 5591, 5592, 5593, 5594, 5595, 5596, 5597, 5598, 5599, 5600, 5601, 5602, 5603, 5604, 5605, 5606, 5607, 5608, 5609, 5610, 5611, 5612, 5613, 5614, 5615, 5616, 5617, 5618, 5619, 5620, 5621, 5622, 5623, 5624, 5625, 5626, 5627, 5628, 5629, 5630, 5631, 5632, 5633, 5634, 5635, 5636, 5637, 5638, 5639, 5640, 5641, 5642, 5643, 5644, 5645, 5646, 5647, 5648, 5649, 5650, 5651, 5652, 5653, 5654, 5655, 5656, 5657, 5658, 5659, 5660, 5661, 5662, 5663, 5664, 5665, 5666, 5667, 5668, 5669, 5670, 5671, 5672, 5673, 5674, 5675, 5676, 5677, 5678, 5679, 5680, 5681, 5682, 5683, 5684, 5685, 5686, 5687, 5688, 5689, 5690, 5691, 5692, 5693, 5694, 5695, 5696, 5697, 5698, 5699, 5700, 5701, 5702, 5703, 5704, 5705, 5706, 5707, 5708, 5709, 5710, 5711, 5712, 5713, 5714, 5715, 5716, 5717, 5718, 5719, 5720, 5721, 5722, 5723, 5724, 5725, 5726, 5727, 5728, 5729, 5730, 5731, 5732, 5733, 5734, 5735, 5736, 5737, 5738, 5739, 5740, 5741, 5742, 5743, 5744, 5745, 5746, 5747, 5748, 5749, 5750, 5751, 5752, 5753, 5754, 5755, 5756, 5757, 5758, 5759, 5760, 5761, 5762, 5763, 5764, 5765, 5766, 5767, 5768, 5769, 5770, 5771, 5772, 5773, 5774, 5775, 5776, 5777, 5778, 5779, 5780, 5781, 5782, 5783, 5784, 5785, 5786, 5787, 5788, 5789, 5790, 5791, 5792, 5793, 5794, 5795, 5796, 5797, 5798, 5799, 5800, 5801, 5802, 5803, 5804, 5805, 5806, 5807, 5808, 5809, 5810, 5811, 5812, 5813, 5814, 5815, 5816, 5817, 5818, 5819, 5820, 5821, 5822, 5823, 5824, 5825, 5826, 5827, 5828, 5829, 5830, 5831, 5832, 5833, 5834, 5835, 5836, 5837, 5838, 5839, 5840, 5841, 5842, 5843, 5844, 5845, 5846, 5847, 5848, 5849, 5850, 5851, 5852, 5853, 5854, 5855, 5856, 5857, 5858, 5859, 5860, 5861, 5862, 5863, 5864, 5865, 5866, 5867, 5868, 5869, 5870, 5871, 5872, 5873, 5874, 5875, 5876, 5877, 5878, 5879, 5880, 5881, 5882, 5883, 5884, 5885, 5886, 5887, 5888, 5889, 5890, 5891, 5892, 5893, 5894, 5895, 5896, 5897, 5898, 5899, 5900, 5901, 5902, 5903, 5904, 5905, 5906, 5907, 5908, 5909, 5910, 5911, 5912, 5913, 5914, 5915, 5916, 5917, 5918, 5919, 5920, 5921, 5922, 5923, 5924, 5925, 5926, 5927, 5928, 5929, 5930, 5931, 5932, 5933, 5934, 5935, 5936, 5937, 5938, 5939, 5940, 5941, 5942, 5943, 5944, 5945, 5946, 5947, 5948, 5949, 5950, 5951, 5952, 5953, 5954, 5955, 5956, 5957, 5958, 5959, 5960, 5961, 5962, 5963, 5964, 5965, 5966, 5967, 5968, 5969, 5970, 5971, 5972, 5973, 5974, 5975, 5976, 5977, 5978, 5979, 5980, 5981, 5982, 5983, 5984, 5985, 5986, 5987, 5988, 5989, 5990, 5991, 5992, 5993, 5994, 5995, 5996, 5997, 5998, 5999, 6000, 6001, 6002, 6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010, 6011, 6012, 6013, 6014, 6015, 6016, 6017, 6018, 6019, 6020, 6021, 6022, 6023, 6024, 6025, 6026, 6027, 6028, 6029, 6030, 6031, 6032, 6033, 6034, 6035, 6036, 6037, 6038, 6039, 6040, 6041, 6042, 6043, 6044, 6045, 6046, 6047, 6048, 6049, 6050, 6051, 6052, 6053, 6054, 6055, 6056, 6057, 6058, 6059, 6060, 6061, 6062, 6063, 6064, 6065, 6066, 6067, 6068, 6069, 6070, 6071, 6072, 6073, 6074, 6075, 6076, 6077, 6078, 6079, 6080, 6081, 6082, 6083, 6084, 6085, 6086, 6087, 6088, 6089, 6090, 6091, 6092, 6093, 6094, 6095, 6096, 6097, 6098, 6099, 6100, 6101, 6102, 6103, 6104, 6105, 6106, 6107, 6108, 6109, 6110, 6111, 6112, 6113, 6114, 6115, 6116, 6117, 6118, 6119, 6120, 6121, 6122, 6123, 6124, 6125, 6126, 6127, 6128, 6129, 6130, 6131, 6132, 6133, 6134, 6135, 6136, 6137, 6138, 6139, 6140, 6141, 6142, 6143, 6144, 6145, 6146, 6147, 6148, 6149, 6150, 6151, 6152, 6153, 6154, 6155, 6156, 6157, 6158, 6159, 6160, 6161, 6162, 6163, 6164, 6165, 6166, 6167, 6168, 6169, 6170, 6171, 6172, 6173, 6174, 6175, 6176, 6177, 6178, 6179, 6180, 6181, 6182, 6183, 6184, 6185, 6186, 6187, 6188, 6189, 6190, 6191, 6192, 6193, 6194, 6195, 6196, 6197, 6198, 6199, 6200, 6201, 6202, 6203, 6204, 6205, 6206, 6207, 6208, 6209, 6210, 6211, 6212, 6213, 6214, 6215, 6216, 6217, 6218, 6219, 6220, 6221, 6222, 6223, 6224, 6225, 6226, 6227, 6228, 6229, 6230, 6231, 6232, 6233, 6234, 6235, 6236, 6237, 6238, 6239, 6240, 6241, 6242, 6243, 6244, 6245, 6246, 6247, 6248, 6249, 6250, 6251, 6252, 6253, 6254, 6255, 6256, 6257, 6258, 6259, 6260, 6261, 6262, 6263, 6264, 6265, 6266, 6267, 6268, 6269, 6270, 6271, 6272, 6273, 6274, 6275, 6276, 6277, 6278, 6279, 6280, 6281, 6282, 6283, 6284, 6285, 6286, 6287, 6288, 6289, 6290, 6291, 6292, 6293, 6294, 6295, 6296, 6297, 6298, 6299, 6300, 6301, 6302, 6303, 6304, 6305, 6306, 6307, 6308, 6309, 6310, 6311, 6312, 6313, 6314, 6315, 6316, 6317, 6318, 6319, 6320, 6321, 6322, 6323, 6324, 6325, 6326, 6327, 6328, 6329, 6330, 6331, 6332, 6333, 6334, 6335, 6336, 6337, 6338, 6339, 6340, 6341, 6342, 6343, 6344, 6345, 6346, 6347, 6348, 6349, 6350, 6351, 6352, 6353, 6354, 6355, 6356, 6357, 6358, 6359, 6360, 6361, 6362, 6363, 6364, 6365, 6366, 6367, 6368, 6369, 6370, 6371, 6372, 6373, 6374, 6375, 6376, 6377, 6378, 6379, 6380, 6381, 6382, 6383, 6384, 6385, 6386, 6387, 6388, 6389, 6390, 6391, 6392, 6393, 6394, 6395, 6396, 6397, 6398, 6399, 6400, 6401, 6402, 6403, 6404, 6405, 6406, 6407, 6408, 6409, 6410, 6411, 6412, 6413, 6414, 6415, 6416, 6417, 6418, 6419, 6420, 6421, 6422, 6423, 6424, 6425, 6426, 6427, 6428, 6429, 6430, 6431, 6432, 6433, 6434, 6435, 6436, 6437, 6438, 6439, 6440, 6441, 6442, 6443, 6444, 6445, 6446, 6447, 6448, 6449, 6450, 6451, 6452, 6453, 6454, 6455, 6456, 6457, 6458, 6459, 6460, 6461, 6462, 6463, 6464, 6465, 6466, 6467, 6468, 6469, 6470, 6471, 6472, 6473, 6474, 6475, 6476, 6477, 6478, 6479, 6480, 6481, 6482, 6483, 6484, 6485, 6486, 6487, 6488, 6489, 6490, 6491, 6492, 6493, 6494, 6495, 6496, 6497, 6498, 6499, 6500, 6501, 6502, 6503, 6504, 6505, 6506, 6507, 6508, 6509, 6510, 6511, 6512, 6513, 6514, 6515, 6516, 6517, 6518, 6519, 6520, 6521, 6522, 6523, 6524, 6525, 6526, 6527, 6528, 6529, 6530, 6531, 6532, 6533, 6534, 6535, 6536, 6537, 6538, 6539, 6540, 6541, 6542, 6543, 6544, 6545, 6546, 6547, 6548, 6549, 6550, 6551, 6552, 6553, 6554, 6555, 6556, 6557, 6558, 6559, 6560, 6561, 6562, 6563, 6564, 6565, 6566, 6567, 6568, 6569, 6570, 6571, 6572, 6573, 6574, 6575, 6576, 6577, 6578, 6579, 6580, 6581, 6582, 6583, 6584, 6585, 6586, 6587, 6588, 6589, 6590, 6591, 6592, 6593, 6594, 6595, 6596, 6597, 6598, 6599, 6600, 6601, 6602, 6603, 6604, 6605, 6606, 6607, 6608, 6609, 6610, 6611, 6612, 6613, 6614, 6615, 6616, 6617, 6618, 6619, 6620, 6621, 6622, 6623, 6624, 6625, 6626, 6627, 6628, 6629, 6630, 6631, 6632, 6633, 6634, 6635, 6636, 6637, 6638, 6639, 6640, 6641, 6642, 6643, 6644, 6645, 6646, 6647, 6648, 6649, 6650, 6651, 6652, 6653, 6654, 6655, 6656, 6657, 6658, 6659, 6660, 6661, 6662, 6663, 6664, 6665, 6666, 6667, 6668, 6669, 6670, 6671, 6672, 6673, 6674, 6675, 6676, 6677, 6678, 6679, 6680, 6681, 6682, 6683, 6684, 6685, 6686, 6687, 6688, 6689, 6690, 6691, 6692, 6693, 6694, 6695, 6696, 6697, 6698, 6699, 6700, 6701, 6702, 6703, 6704, 6705, 6706, 6707, 6708, 6709, 6710, 6711, 6712, 6713, 6714, 6715, 6716, 6717, 6718, 6719, 6720, 6721, 6722, 6723, 6724, 6725, 6726, 6727, 6728, 6729, 6730, 6731, 6732, 6733, 6734, 6735, 6736, 6737, 6738, 6739, 6740, 6741, 6742, 6743, 6744, 6745, 6746, 6747, 6748, 6749, 6750, 6751, 6752, 6753, 6754, 6755, 6756, 6757, 6758, 6759, 6760, 6761, 6762, 6763, 6764, 6765, 6766, 6767, 6768, 6769, 6770, 6771, 6772, 6773, 6774, 6775, 6776, 6777, 6778, 6779, 6780, 6781, 6782, 6783, 6784, 6785, 6786, 6787, 6788, 6789, 6790, 6791, 6792, 6793, 6794, 6795, 6796, 6797, 6798, 6799, 6800, 6801, 6802, 6803, 6804, 6805, 6806, 6807, 6808, 6809, 6810, 6811, 6812, 6813, 6814, 6815, 6816, 6817, 6818, 6819, 6820, 6821, 6822, 6823, 6824, 6825, 6826, 6827, 6828, 6829, 6830, 6831, 6832, 6833, 6834, 6835, 6836, 6837, 6838, 6839, 6840, 6841, 6842, 6843, 6844, 6845, 6846, 6847, 6848, 6849, 6850, 6851, 6852, 6853, 6854, 6855, 6856, 6857, 6858, 6859, 6860, 6861, 6862, 6863, 6864, 6865, 6866, 6867, 6868, 6869, 6870, 6871, 6872, 6873, 6874, 6875, 6876, 6877, 6878, 6879, 6880, 6881, 6882, 6883, 6884, 6885, 6886, 6887, 6888, 6889, 6890, 6891, 6892, 6893, 6894, 6895, 6896, 6897, 6898, 6899, 6900, 6901, 6902, 6903, 6904, 6905, 6906, 6907, 6908, 6909, 6910, 6911, 6912, 6913, 6914, 6915, 6916, 6917, 6918, 6919, 6920, 6921, 6922, 6923, 6924, 6925, 6926, 6927, 6928, 6929, 6930, 6931, 6932, 6933, 6934, 6935, 6936, 6937, 6938, 6939, 6940, 6941, 6942, 6943, 6944, 6945, 6946, 6947, 6948, 6949, 6950, 6951, 6952, 6953, 6954, 6955, 6956, 6957, 6958, 6959, 6960, 6961, 6962, 6963, 6964, 6965, 6966, 6967, 6968, 6969, 6970, 6971, 6972, 6973, 6974, 6975, 6976, 6977, 6978, 6979, 6980, 6981, 6982, 6983, 6984, 6985, 6986, 6987, 6988, 6989, 6990, 6991, 6992, 6993, 6994, 6995, 6996, 6997, 6998, 6999, 7000, 7001, 7002, 7003, 7004, 7005, 7006, 7007, 7008, 7009, 7010, 7011, 7012, 7013, 7014, 7015, 7016, 7017, 7018, 7019, 7020, 7021, 7022, 7023, 7024, 7025, 7026, 7027, 7028, 7029, 7030, 7031, 7032, 7033, 7034, 7035, 7036, 7037, 7038, 7039, 7040, 7041, 7042, 7043, 7044, 7045, 7046, 7047, 7048, 7049, 7050, 7051, 7052, 7053, 7054, 7055, 7056, 7057, 7058, 7059, 7060, 7061, 7062, 7063, 7064, 7065, 7066, 7067, 7068, 7069, 7070, 7071, 7072, 7073, 7074, 7075, 7076, 7077, 7078, 7079, 7080, 7081, 7082, 7083, 7084, 7085, 7086, 7087, 7088, 7089, 7090, 7091, 7092, 7093, 7094, 7095, 7096, 7097, 7098, 7099, 7100, 7101, 7102, 7103, 7104, 7105, 7106, 7107, 7108, 7109, 7110, 7111, 7112, 7113, 7114, 7115, 7116, 7117, 7118, 7119, 7120, 7121, 7122, 7123, 7124, 7125, 7126, 7127, 7128, 7129, 7130, 7131, 7132, 7133, 7134, 7135, 7136, 7137, 7138, 7139, 7140, 7141, 7142, 7143, 7144, 7145, 7146, 7147, 7148, 7149, 7150, 7151, 7152, 7153, 7154, 7155, 7156, 7157, 7158, 7159, 7160, 7161, 7162, 7163, 7164, 7165, 7166, 7167, 7168, 7169, 7170, 7171, 7172, 7173, 7174, 7175, 7176, 7177, 7178, 7179, 7180, 7181, 7182, 7183, 7184, 7185, 7186, 7187, 7188, 7189, 7190, 7191, 7192, 7193, 7194, 7195, 7196, 7197, 7198, 7199, 7200, 7201, 7202, 7203, 7204, 7205, 7206, 7207, 7208, 7209, 7210, 7211, 7212, 7213, 7214, 7215, 7216, 7217, 7218, 7219, 7220, 7221, 7222, 7223, 7224, 7225, 7226, 7227, 7228, 7229, 7230, 7231, 7232, 7233, 7234, 7235, 7236, 7237, 7238, 7239, 7240, 7241, 7242, 7243, 7244, 7245, 7246, 7247, 7248, 7249, 7250, 7251, 7252, 7253, 7254, 7255, 7256, 7257, 7258, 7259, 7260, 7261, 7262, 7263, 7264, 7265, 7266, 7267, 7268, 7269, 7270, 7271, 7272, 7273, 7274, 7275, 7276, 7277, 7278, 7279, 7280, 7281, 7282, 7283, 7284, 7285, 7286, 7287, 7288, 7289, 7290, 7291, 7292, 7293, 7294, 7295, 7296, 7297, 7298, 7299, 7300, 7301, 7302, 7303, 7304, 7305, 7306, 7307, 7308, 7309, 7310, 7311, 7312, 7313, 7314, 7315, 7316, 7317, 7318, 7319, 7320, 7321, 7322, 7323, 7324, 7325, 7326, 7327, 7328, 7329, 7330, 7331, 7332, 7333, 7334, 7335, 7336, 7337, 7338, 7339, 7340, 7341, 7342, 7343, 7344, 7345, 7346, 7347, 7348, 7349, 7350, 7351, 7352, 7353, 7354, 7355, 7356, 7357, 7358, 7359, 7360, 7361, 7362, 7363, 7364, 7365, 7366, 7367, 7368, 7369, 7370, 7371, 7372, 7373, 7374, 7375, 7376, 7377, 7378, 7379, 7380, 7381, 7382, 7383, 7384, 7385, 7386, 7387, 7388, 7389, 7390, 7391, 7392, 7393, 7394, 7395, 7396, 7397, 7398, 7399, 7400, 7401, 7402, 7403, 7404, 7405, 7406, 7407, 7408, 7409, 7410, 7411, 7412, 7413, 7414, 7415, 7416, 7417, 7418, 7419, 7420, 7421, 7422, 7423, 7424, 7425, 7426, 7427, 7428, 7429, 7430, 7431, 7432, 7433, 7434, 7435, 7436, 7437, 7438, 7439, 7440, 7441, 7442, 7443, 7444, 7445, 7446, 7447, 7448, 7449, 7450, 7451, 7452, 7453, 7454, 7455, 7456, 7457, 7458, 7459, 7460, 7461, 7462, 7463, 7464, 7465, 7466, 7467, 7468, 7469, 7470, 7471, 7472, 7473, 7474, 7475, 7476, 7477, 7478, 7479, 7480, 7481, 7482, 7483, 7484, 7485, 7486, 7487, 7488, 7489, 7490, 7491, 7492, 7493, 7494, 7495, 7496, 7497, 7498, 7499, 7500, 7501, 7502, 7503, 7504, 7505, 7506, 7507, 7508, 7509, 7510, 7511, 7512, 7513, 7514, 7515, 7516, 7517, 7518, 7519, 7520, 7521, 7522, 7523, 7524, 7525, 7526, 7527, 7528, 7529, 7530, 7531, 7532, 7533, 7534, 7535, 7536, 7537, 7538, 7539, 7540, 7541, 7542, 7543, 7544, 7545, 7546, 7547, 7548, 7549, 7550, 7551, 7552, 7553, 7554, 7555, 7556, 7557, 7558, 7559, 7560, 7561, 7562, 7563, 7564, 7565, 7566, 7567, 7568, 7569, 7570, 7571, 7572, 7573, 7574, 7575, 7576, 7577, 7578, 7579, 7580, 7581, 7582, 7583, 7584, 7585, 7586, 7587, 7588, 7589, 7590, 7591, 7592, 7593, 7594, 7595, 7596, 7597, 7598, 7599, 7600, 7601, 7602, 7603, 7604, 7605, 7606, 7607, 7608, 7609, 7610, 7611, 7612, 7613, 7614, 7615, 7616, 7617, 7618, 7619, 7620, 7621, 7622, 7623, 7624, 7625, 7626, 7627, 7628, 7629, 7630, 7631, 7632, 7633, 7634, 7635, 7636, 7637, 7638, 7639, 7640, 7641, 7642, 7643, 7644, 7645, 7646, 7647, 7648, 7649, 7650, 7651, 7652, 7653, 7654, 7655, 7656, 7657, 7658, 7659, 7660, 7661, 7662, 7663, 7664, 7665, 7666, 7667, 7668, 7669, 7670, 7671, 7672, 7673, 7674, 7675, 7676, 7677, 7678, 7679, 7680, 7681, 7682, 7683, 7684, 7685, 7686, 7687, 7688, 7689, 7690, 7691, 7692, 7693, 7694, 7695, 7696, 7697, 7698, 7699, 7700, 7701, 7702, 7703, 7704, 7705, 7706, 7707, 7708, 7709, 7710, 7711, 7712, 7713, 7714, 7715, 7716, 7717, 7718, 7719, 7720, 7721, 7722, 7723, 7724, 7725, 7726, 7727, 7728, 7729, 7730, 7731, 7732, 7733, 7734, 7735, 7736, 7737, 7738, 7739, 7740, 7741, 7742, 7743, 7744, 7745, 7746, 7747, 7748, 7749, 7750, 7751, 7752, 7753, 7754, 7755, 7756, 7757, 7758, 7759, 7760, 7761, 7762, 7763, 7764, 7765, 7766, 7767, 7768, 7769, 7770, 7771, 7772, 7773, 7774, 7775, 7776, 7777, 7778, 7779, 7780, 7781, 7782, 7783, 7784, 7785, 7786, 7787, 7788, 7789, 7790, 7791, 7792, 7793, 7794, 7795, 7796, 7797, 7798, 7799, 7800, 7801, 7802, 7803, 7804, 7805, 7806, 7807, 7808, 7809, 7810, 7811, 7812, 7813, 7814, 7815, 7816, 7817, 7818, 7819, 7820, 7821, 7822, 7823, 7824, 7825, 7826, 7827, 7828, 7829, 7830, 7831, 7832, 7833, 7834, 7835, 7836, 7837, 7838, 7839, 7840, 7841, 7842, 7843, 7844, 7845, 7846, 7847, 7848, 7849, 7850, 7851, 7852, 7853, 7854, 7855, 7856, 7857, 7858, 7859, 7860, 7861, 7862, 7863, 7864, 7865, 7866, 7867, 7868, 7869, 7870, 7871, 7872, 7873, 7874, 7875, 7876, 7877, 7878, 7879, 7880, 7881, 7882, 7883, 7884, 7885, 7886, 7887, 7888, 7889, 7890, 7891, 7892, 7893, 7894, 7895, 7896, 7897, 7898, 7899, 7900, 7901, 7902, 7903, 7904, 7905, 7906, 7907, 7908, 7909, 7910, 7911, 7912, 7913, 7914, 7915, 7916, 7917, 7918, 7919, 7920, 7921, 7922, 7923, 7924, 7925, 7926, 7927, 7928, 7929, 7930, 7931, 7932, 7933, 7934, 7935, 7936, 7937, 7938, 7939, 7940, 7941, 7942, 7943, 7944, 7945, 7946, 7947, 7948, 7949, 7950, 7951, 7952, 7953, 7954, 7955, 7956, 7957, 7958, 7959, 7960, 7961, 7962, 7963, 7964, 7965, 7966, 7967, 7968, 7969, 7970, 7971, 7972, 7973, 7974, 7975, 7976, 7977, 7978, 7979, 7980, 7981, 7982, 7983, 7984, 7985, 7986, 7987, 7988, 7989, 7990, 7991, 7992, 7993, 7994, 7995, 7996, 7997, 7998, 7999, 8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010, 8011, 8012, 8013, 8014, 8015, 8016, 8017, 8018, 8019, 8020, 8021, 8022, 8023, 8024, 8025, 8026, 8027, 8028, 8029, 8030, 8031, 8032, 8033, 8034, 8035, 8036, 8037, 8038, 8039, 8040, 8041, 8042, 8043, 8044, 8045, 8046, 8047, 8048, 8049, 8050, 8051, 8052, 8053, 8054, 8055, 8056, 8057, 8058, 8059, 8060, 8061, 8062, 8063, 8064, 8065, 8066, 8067, 8068, 8069, 8070, 8071, 8072, 8073, 8074, 8075, 8076, 8077, 8078, 8079, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8101, 8102, 8103, 8104, 8105, 8106, 8107, 8108, 8109, 8110, 8111, 8112, 8113, 8114, 8115, 8116, 8117, 8118, 8119, 8120, 8121, 8122, 8123, 8124, 8125, 8126, 8127, 8128, 8129, 8130, 8131, 8132, 8133, 8134, 8135, 8136, 8137, 8138, 8139, 8140, 8141, 8142, 8143, 8144, 8145, 8146, 8147, 8148, 8149, 8150, 8151, 8152, 8153, 8154, 8155, 8156, 8157, 8158, 8159, 8160, 8161, 8162, 8163, 8164, 8165, 8166, 8167, 8168, 8169, 8170, 8171, 8172, 8173, 8174, 8175, 8176, 8177, 8178, 8179, 8180, 8181, 8182, 8183, 8184, 8185, 8186, 8187, 8188, 8189, 8190, 8191, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8203, 8204, 8205, 8206, 8207, 8208, 8209, 8210, 8211, 8212, 8213, 8214, 8215, 8216, 8217, 8218, 8219, 8220, 8221, 8222, 8223, 8224, 8225, 8226, 8227, 8228, 8229, 8230, 8231, 8232, 8233, 8234, 8235, 8236, 8237, 8238, 8239, 8240, 8241, 8242, 8243, 8244, 8245, 8246, 8247, 8248, 8249, 8250, 8251, 8252, 8253, 8254, 8255, 8256, 8257, 8258, 8259, 8260, 8261, 8262, 8263, 8264, 8265, 8266, 8267, 8268, 8269, 8270, 8271, 8272, 8273, 8274, 8275, 8276, 8277, 8278, 8279, 8280, 8281, 8282, 8283, 8284, 8285, 8286, 8287, 8288, 8289, 8290, 8291, 8292, 8293, 8294, 8295, 8296, 8297, 8298, 8299, 8300, 8301, 8302, 8303, 8304, 8305, 8306, 8307, 8308, 8309, 8310, 8311, 8312, 8313, 8314, 8315, 8316, 8317, 8318, 8319, 8320, 8321, 8322, 8323, 8324, 8325, 8326, 8327, 8328, 8329, 8330, 8331, 8332, 8333, 8334, 8335, 8336, 8337, 8338, 8339, 8340, 8341, 8342, 8343, 8344, 8345, 8346, 8347, 8348, 8349, 8350, 8351, 8352, 8353, 8354, 8355, 8356, 8357, 8358, 8359, 8360, 8361, 8362, 8363, 8364, 8365, 8366, 8367, 8368, 8369, 8370, 8371, 8372, 8373, 8374, 8375, 8376, 8377, 8378, 8379, 8380, 8381, 8382, 8383, 8384, 8385, 8386, 8387, 8388, 8389, 8390, 8391, 8392, default */
/***/ (function(module) {

module.exports = JSON.parse("[[[0,44],\"disallowed_STD3_valid\"],[[45,46],\"valid\"],[[47,47],\"disallowed_STD3_valid\"],[[48,57],\"valid\"],[[58,64],\"disallowed_STD3_valid\"],[[65,65],\"mapped\",\"a\"],[[66,66],\"mapped\",\"b\"],[[67,67],\"mapped\",\"c\"],[[68,68],\"mapped\",\"d\"],[[69,69],\"mapped\",\"e\"],[[70,70],\"mapped\",\"f\"],[[71,71],\"mapped\",\"g\"],[[72,72],\"mapped\",\"h\"],[[73,73],\"mapped\",\"i\"],[[74,74],\"mapped\",\"j\"],[[75,75],\"mapped\",\"k\"],[[76,76],\"mapped\",\"l\"],[[77,77],\"mapped\",\"m\"],[[78,78],\"mapped\",\"n\"],[[79,79],\"mapped\",\"o\"],[[80,80],\"mapped\",\"p\"],[[81,81],\"mapped\",\"q\"],[[82,82],\"mapped\",\"r\"],[[83,83],\"mapped\",\"s\"],[[84,84],\"mapped\",\"t\"],[[85,85],\"mapped\",\"u\"],[[86,86],\"mapped\",\"v\"],[[87,87],\"mapped\",\"w\"],[[88,88],\"mapped\",\"x\"],[[89,89],\"mapped\",\"y\"],[[90,90],\"mapped\",\"z\"],[[91,96],\"disallowed_STD3_valid\"],[[97,122],\"valid\"],[[123,127],\"disallowed_STD3_valid\"],[[128,159],\"disallowed\"],[[160,160],\"disallowed_STD3_mapped\",\" \"],[[161,167],\"valid\",\"\",\"NV8\"],[[168,168],\"disallowed_STD3_mapped\",\" ̈\"],[[169,169],\"valid\",\"\",\"NV8\"],[[170,170],\"mapped\",\"a\"],[[171,172],\"valid\",\"\",\"NV8\"],[[173,173],\"ignored\"],[[174,174],\"valid\",\"\",\"NV8\"],[[175,175],\"disallowed_STD3_mapped\",\" ̄\"],[[176,177],\"valid\",\"\",\"NV8\"],[[178,178],\"mapped\",\"2\"],[[179,179],\"mapped\",\"3\"],[[180,180],\"disallowed_STD3_mapped\",\" ́\"],[[181,181],\"mapped\",\"μ\"],[[182,182],\"valid\",\"\",\"NV8\"],[[183,183],\"valid\"],[[184,184],\"disallowed_STD3_mapped\",\" ̧\"],[[185,185],\"mapped\",\"1\"],[[186,186],\"mapped\",\"o\"],[[187,187],\"valid\",\"\",\"NV8\"],[[188,188],\"mapped\",\"1⁄4\"],[[189,189],\"mapped\",\"1⁄2\"],[[190,190],\"mapped\",\"3⁄4\"],[[191,191],\"valid\",\"\",\"NV8\"],[[192,192],\"mapped\",\"à\"],[[193,193],\"mapped\",\"á\"],[[194,194],\"mapped\",\"â\"],[[195,195],\"mapped\",\"ã\"],[[196,196],\"mapped\",\"ä\"],[[197,197],\"mapped\",\"å\"],[[198,198],\"mapped\",\"æ\"],[[199,199],\"mapped\",\"ç\"],[[200,200],\"mapped\",\"è\"],[[201,201],\"mapped\",\"é\"],[[202,202],\"mapped\",\"ê\"],[[203,203],\"mapped\",\"ë\"],[[204,204],\"mapped\",\"ì\"],[[205,205],\"mapped\",\"í\"],[[206,206],\"mapped\",\"î\"],[[207,207],\"mapped\",\"ï\"],[[208,208],\"mapped\",\"ð\"],[[209,209],\"mapped\",\"ñ\"],[[210,210],\"mapped\",\"ò\"],[[211,211],\"mapped\",\"ó\"],[[212,212],\"mapped\",\"ô\"],[[213,213],\"mapped\",\"õ\"],[[214,214],\"mapped\",\"ö\"],[[215,215],\"valid\",\"\",\"NV8\"],[[216,216],\"mapped\",\"ø\"],[[217,217],\"mapped\",\"ù\"],[[218,218],\"mapped\",\"ú\"],[[219,219],\"mapped\",\"û\"],[[220,220],\"mapped\",\"ü\"],[[221,221],\"mapped\",\"ý\"],[[222,222],\"mapped\",\"þ\"],[[223,223],\"deviation\",\"ss\"],[[224,246],\"valid\"],[[247,247],\"valid\",\"\",\"NV8\"],[[248,255],\"valid\"],[[256,256],\"mapped\",\"ā\"],[[257,257],\"valid\"],[[258,258],\"mapped\",\"ă\"],[[259,259],\"valid\"],[[260,260],\"mapped\",\"ą\"],[[261,261],\"valid\"],[[262,262],\"mapped\",\"ć\"],[[263,263],\"valid\"],[[264,264],\"mapped\",\"ĉ\"],[[265,265],\"valid\"],[[266,266],\"mapped\",\"ċ\"],[[267,267],\"valid\"],[[268,268],\"mapped\",\"č\"],[[269,269],\"valid\"],[[270,270],\"mapped\",\"ď\"],[[271,271],\"valid\"],[[272,272],\"mapped\",\"đ\"],[[273,273],\"valid\"],[[274,274],\"mapped\",\"ē\"],[[275,275],\"valid\"],[[276,276],\"mapped\",\"ĕ\"],[[277,277],\"valid\"],[[278,278],\"mapped\",\"ė\"],[[279,279],\"valid\"],[[280,280],\"mapped\",\"ę\"],[[281,281],\"valid\"],[[282,282],\"mapped\",\"ě\"],[[283,283],\"valid\"],[[284,284],\"mapped\",\"ĝ\"],[[285,285],\"valid\"],[[286,286],\"mapped\",\"ğ\"],[[287,287],\"valid\"],[[288,288],\"mapped\",\"ġ\"],[[289,289],\"valid\"],[[290,290],\"mapped\",\"ģ\"],[[291,291],\"valid\"],[[292,292],\"mapped\",\"ĥ\"],[[293,293],\"valid\"],[[294,294],\"mapped\",\"ħ\"],[[295,295],\"valid\"],[[296,296],\"mapped\",\"ĩ\"],[[297,297],\"valid\"],[[298,298],\"mapped\",\"ī\"],[[299,299],\"valid\"],[[300,300],\"mapped\",\"ĭ\"],[[301,301],\"valid\"],[[302,302],\"mapped\",\"į\"],[[303,303],\"valid\"],[[304,304],\"mapped\",\"i̇\"],[[305,305],\"valid\"],[[306,307],\"mapped\",\"ij\"],[[308,308],\"mapped\",\"ĵ\"],[[309,309],\"valid\"],[[310,310],\"mapped\",\"ķ\"],[[311,312],\"valid\"],[[313,313],\"mapped\",\"ĺ\"],[[314,314],\"valid\"],[[315,315],\"mapped\",\"ļ\"],[[316,316],\"valid\"],[[317,317],\"mapped\",\"ľ\"],[[318,318],\"valid\"],[[319,320],\"mapped\",\"l·\"],[[321,321],\"mapped\",\"ł\"],[[322,322],\"valid\"],[[323,323],\"mapped\",\"ń\"],[[324,324],\"valid\"],[[325,325],\"mapped\",\"ņ\"],[[326,326],\"valid\"],[[327,327],\"mapped\",\"ň\"],[[328,328],\"valid\"],[[329,329],\"mapped\",\"ʼn\"],[[330,330],\"mapped\",\"ŋ\"],[[331,331],\"valid\"],[[332,332],\"mapped\",\"ō\"],[[333,333],\"valid\"],[[334,334],\"mapped\",\"ŏ\"],[[335,335],\"valid\"],[[336,336],\"mapped\",\"ő\"],[[337,337],\"valid\"],[[338,338],\"mapped\",\"œ\"],[[339,339],\"valid\"],[[340,340],\"mapped\",\"ŕ\"],[[341,341],\"valid\"],[[342,342],\"mapped\",\"ŗ\"],[[343,343],\"valid\"],[[344,344],\"mapped\",\"ř\"],[[345,345],\"valid\"],[[346,346],\"mapped\",\"ś\"],[[347,347],\"valid\"],[[348,348],\"mapped\",\"ŝ\"],[[349,349],\"valid\"],[[350,350],\"mapped\",\"ş\"],[[351,351],\"valid\"],[[352,352],\"mapped\",\"š\"],[[353,353],\"valid\"],[[354,354],\"mapped\",\"ţ\"],[[355,355],\"valid\"],[[356,356],\"mapped\",\"ť\"],[[357,357],\"valid\"],[[358,358],\"mapped\",\"ŧ\"],[[359,359],\"valid\"],[[360,360],\"mapped\",\"ũ\"],[[361,361],\"valid\"],[[362,362],\"mapped\",\"ū\"],[[363,363],\"valid\"],[[364,364],\"mapped\",\"ŭ\"],[[365,365],\"valid\"],[[366,366],\"mapped\",\"ů\"],[[367,367],\"valid\"],[[368,368],\"mapped\",\"ű\"],[[369,369],\"valid\"],[[370,370],\"mapped\",\"ų\"],[[371,371],\"valid\"],[[372,372],\"mapped\",\"ŵ\"],[[373,373],\"valid\"],[[374,374],\"mapped\",\"ŷ\"],[[375,375],\"valid\"],[[376,376],\"mapped\",\"ÿ\"],[[377,377],\"mapped\",\"ź\"],[[378,378],\"valid\"],[[379,379],\"mapped\",\"ż\"],[[380,380],\"valid\"],[[381,381],\"mapped\",\"ž\"],[[382,382],\"valid\"],[[383,383],\"mapped\",\"s\"],[[384,384],\"valid\"],[[385,385],\"mapped\",\"ɓ\"],[[386,386],\"mapped\",\"ƃ\"],[[387,387],\"valid\"],[[388,388],\"mapped\",\"ƅ\"],[[389,389],\"valid\"],[[390,390],\"mapped\",\"ɔ\"],[[391,391],\"mapped\",\"ƈ\"],[[392,392],\"valid\"],[[393,393],\"mapped\",\"ɖ\"],[[394,394],\"mapped\",\"ɗ\"],[[395,395],\"mapped\",\"ƌ\"],[[396,397],\"valid\"],[[398,398],\"mapped\",\"ǝ\"],[[399,399],\"mapped\",\"ə\"],[[400,400],\"mapped\",\"ɛ\"],[[401,401],\"mapped\",\"ƒ\"],[[402,402],\"valid\"],[[403,403],\"mapped\",\"ɠ\"],[[404,404],\"mapped\",\"ɣ\"],[[405,405],\"valid\"],[[406,406],\"mapped\",\"ɩ\"],[[407,407],\"mapped\",\"ɨ\"],[[408,408],\"mapped\",\"ƙ\"],[[409,411],\"valid\"],[[412,412],\"mapped\",\"ɯ\"],[[413,413],\"mapped\",\"ɲ\"],[[414,414],\"valid\"],[[415,415],\"mapped\",\"ɵ\"],[[416,416],\"mapped\",\"ơ\"],[[417,417],\"valid\"],[[418,418],\"mapped\",\"ƣ\"],[[419,419],\"valid\"],[[420,420],\"mapped\",\"ƥ\"],[[421,421],\"valid\"],[[422,422],\"mapped\",\"ʀ\"],[[423,423],\"mapped\",\"ƨ\"],[[424,424],\"valid\"],[[425,425],\"mapped\",\"ʃ\"],[[426,427],\"valid\"],[[428,428],\"mapped\",\"ƭ\"],[[429,429],\"valid\"],[[430,430],\"mapped\",\"ʈ\"],[[431,431],\"mapped\",\"ư\"],[[432,432],\"valid\"],[[433,433],\"mapped\",\"ʊ\"],[[434,434],\"mapped\",\"ʋ\"],[[435,435],\"mapped\",\"ƴ\"],[[436,436],\"valid\"],[[437,437],\"mapped\",\"ƶ\"],[[438,438],\"valid\"],[[439,439],\"mapped\",\"ʒ\"],[[440,440],\"mapped\",\"ƹ\"],[[441,443],\"valid\"],[[444,444],\"mapped\",\"ƽ\"],[[445,451],\"valid\"],[[452,454],\"mapped\",\"dž\"],[[455,457],\"mapped\",\"lj\"],[[458,460],\"mapped\",\"nj\"],[[461,461],\"mapped\",\"ǎ\"],[[462,462],\"valid\"],[[463,463],\"mapped\",\"ǐ\"],[[464,464],\"valid\"],[[465,465],\"mapped\",\"ǒ\"],[[466,466],\"valid\"],[[467,467],\"mapped\",\"ǔ\"],[[468,468],\"valid\"],[[469,469],\"mapped\",\"ǖ\"],[[470,470],\"valid\"],[[471,471],\"mapped\",\"ǘ\"],[[472,472],\"valid\"],[[473,473],\"mapped\",\"ǚ\"],[[474,474],\"valid\"],[[475,475],\"mapped\",\"ǜ\"],[[476,477],\"valid\"],[[478,478],\"mapped\",\"ǟ\"],[[479,479],\"valid\"],[[480,480],\"mapped\",\"ǡ\"],[[481,481],\"valid\"],[[482,482],\"mapped\",\"ǣ\"],[[483,483],\"valid\"],[[484,484],\"mapped\",\"ǥ\"],[[485,485],\"valid\"],[[486,486],\"mapped\",\"ǧ\"],[[487,487],\"valid\"],[[488,488],\"mapped\",\"ǩ\"],[[489,489],\"valid\"],[[490,490],\"mapped\",\"ǫ\"],[[491,491],\"valid\"],[[492,492],\"mapped\",\"ǭ\"],[[493,493],\"valid\"],[[494,494],\"mapped\",\"ǯ\"],[[495,496],\"valid\"],[[497,499],\"mapped\",\"dz\"],[[500,500],\"mapped\",\"ǵ\"],[[501,501],\"valid\"],[[502,502],\"mapped\",\"ƕ\"],[[503,503],\"mapped\",\"ƿ\"],[[504,504],\"mapped\",\"ǹ\"],[[505,505],\"valid\"],[[506,506],\"mapped\",\"ǻ\"],[[507,507],\"valid\"],[[508,508],\"mapped\",\"ǽ\"],[[509,509],\"valid\"],[[510,510],\"mapped\",\"ǿ\"],[[511,511],\"valid\"],[[512,512],\"mapped\",\"ȁ\"],[[513,513],\"valid\"],[[514,514],\"mapped\",\"ȃ\"],[[515,515],\"valid\"],[[516,516],\"mapped\",\"ȅ\"],[[517,517],\"valid\"],[[518,518],\"mapped\",\"ȇ\"],[[519,519],\"valid\"],[[520,520],\"mapped\",\"ȉ\"],[[521,521],\"valid\"],[[522,522],\"mapped\",\"ȋ\"],[[523,523],\"valid\"],[[524,524],\"mapped\",\"ȍ\"],[[525,525],\"valid\"],[[526,526],\"mapped\",\"ȏ\"],[[527,527],\"valid\"],[[528,528],\"mapped\",\"ȑ\"],[[529,529],\"valid\"],[[530,530],\"mapped\",\"ȓ\"],[[531,531],\"valid\"],[[532,532],\"mapped\",\"ȕ\"],[[533,533],\"valid\"],[[534,534],\"mapped\",\"ȗ\"],[[535,535],\"valid\"],[[536,536],\"mapped\",\"ș\"],[[537,537],\"valid\"],[[538,538],\"mapped\",\"ț\"],[[539,539],\"valid\"],[[540,540],\"mapped\",\"ȝ\"],[[541,541],\"valid\"],[[542,542],\"mapped\",\"ȟ\"],[[543,543],\"valid\"],[[544,544],\"mapped\",\"ƞ\"],[[545,545],\"valid\"],[[546,546],\"mapped\",\"ȣ\"],[[547,547],\"valid\"],[[548,548],\"mapped\",\"ȥ\"],[[549,549],\"valid\"],[[550,550],\"mapped\",\"ȧ\"],[[551,551],\"valid\"],[[552,552],\"mapped\",\"ȩ\"],[[553,553],\"valid\"],[[554,554],\"mapped\",\"ȫ\"],[[555,555],\"valid\"],[[556,556],\"mapped\",\"ȭ\"],[[557,557],\"valid\"],[[558,558],\"mapped\",\"ȯ\"],[[559,559],\"valid\"],[[560,560],\"mapped\",\"ȱ\"],[[561,561],\"valid\"],[[562,562],\"mapped\",\"ȳ\"],[[563,563],\"valid\"],[[564,566],\"valid\"],[[567,569],\"valid\"],[[570,570],\"mapped\",\"ⱥ\"],[[571,571],\"mapped\",\"ȼ\"],[[572,572],\"valid\"],[[573,573],\"mapped\",\"ƚ\"],[[574,574],\"mapped\",\"ⱦ\"],[[575,576],\"valid\"],[[577,577],\"mapped\",\"ɂ\"],[[578,578],\"valid\"],[[579,579],\"mapped\",\"ƀ\"],[[580,580],\"mapped\",\"ʉ\"],[[581,581],\"mapped\",\"ʌ\"],[[582,582],\"mapped\",\"ɇ\"],[[583,583],\"valid\"],[[584,584],\"mapped\",\"ɉ\"],[[585,585],\"valid\"],[[586,586],\"mapped\",\"ɋ\"],[[587,587],\"valid\"],[[588,588],\"mapped\",\"ɍ\"],[[589,589],\"valid\"],[[590,590],\"mapped\",\"ɏ\"],[[591,591],\"valid\"],[[592,680],\"valid\"],[[681,685],\"valid\"],[[686,687],\"valid\"],[[688,688],\"mapped\",\"h\"],[[689,689],\"mapped\",\"ɦ\"],[[690,690],\"mapped\",\"j\"],[[691,691],\"mapped\",\"r\"],[[692,692],\"mapped\",\"ɹ\"],[[693,693],\"mapped\",\"ɻ\"],[[694,694],\"mapped\",\"ʁ\"],[[695,695],\"mapped\",\"w\"],[[696,696],\"mapped\",\"y\"],[[697,705],\"valid\"],[[706,709],\"valid\",\"\",\"NV8\"],[[710,721],\"valid\"],[[722,727],\"valid\",\"\",\"NV8\"],[[728,728],\"disallowed_STD3_mapped\",\" ̆\"],[[729,729],\"disallowed_STD3_mapped\",\" ̇\"],[[730,730],\"disallowed_STD3_mapped\",\" ̊\"],[[731,731],\"disallowed_STD3_mapped\",\" ̨\"],[[732,732],\"disallowed_STD3_mapped\",\" ̃\"],[[733,733],\"disallowed_STD3_mapped\",\" ̋\"],[[734,734],\"valid\",\"\",\"NV8\"],[[735,735],\"valid\",\"\",\"NV8\"],[[736,736],\"mapped\",\"ɣ\"],[[737,737],\"mapped\",\"l\"],[[738,738],\"mapped\",\"s\"],[[739,739],\"mapped\",\"x\"],[[740,740],\"mapped\",\"ʕ\"],[[741,745],\"valid\",\"\",\"NV8\"],[[746,747],\"valid\",\"\",\"NV8\"],[[748,748],\"valid\"],[[749,749],\"valid\",\"\",\"NV8\"],[[750,750],\"valid\"],[[751,767],\"valid\",\"\",\"NV8\"],[[768,831],\"valid\"],[[832,832],\"mapped\",\"̀\"],[[833,833],\"mapped\",\"́\"],[[834,834],\"valid\"],[[835,835],\"mapped\",\"̓\"],[[836,836],\"mapped\",\"̈́\"],[[837,837],\"mapped\",\"ι\"],[[838,846],\"valid\"],[[847,847],\"ignored\"],[[848,855],\"valid\"],[[856,860],\"valid\"],[[861,863],\"valid\"],[[864,865],\"valid\"],[[866,866],\"valid\"],[[867,879],\"valid\"],[[880,880],\"mapped\",\"ͱ\"],[[881,881],\"valid\"],[[882,882],\"mapped\",\"ͳ\"],[[883,883],\"valid\"],[[884,884],\"mapped\",\"ʹ\"],[[885,885],\"valid\"],[[886,886],\"mapped\",\"ͷ\"],[[887,887],\"valid\"],[[888,889],\"disallowed\"],[[890,890],\"disallowed_STD3_mapped\",\" ι\"],[[891,893],\"valid\"],[[894,894],\"disallowed_STD3_mapped\",\";\"],[[895,895],\"mapped\",\"ϳ\"],[[896,899],\"disallowed\"],[[900,900],\"disallowed_STD3_mapped\",\" ́\"],[[901,901],\"disallowed_STD3_mapped\",\" ̈́\"],[[902,902],\"mapped\",\"ά\"],[[903,903],\"mapped\",\"·\"],[[904,904],\"mapped\",\"έ\"],[[905,905],\"mapped\",\"ή\"],[[906,906],\"mapped\",\"ί\"],[[907,907],\"disallowed\"],[[908,908],\"mapped\",\"ό\"],[[909,909],\"disallowed\"],[[910,910],\"mapped\",\"ύ\"],[[911,911],\"mapped\",\"ώ\"],[[912,912],\"valid\"],[[913,913],\"mapped\",\"α\"],[[914,914],\"mapped\",\"β\"],[[915,915],\"mapped\",\"γ\"],[[916,916],\"mapped\",\"δ\"],[[917,917],\"mapped\",\"ε\"],[[918,918],\"mapped\",\"ζ\"],[[919,919],\"mapped\",\"η\"],[[920,920],\"mapped\",\"θ\"],[[921,921],\"mapped\",\"ι\"],[[922,922],\"mapped\",\"κ\"],[[923,923],\"mapped\",\"λ\"],[[924,924],\"mapped\",\"μ\"],[[925,925],\"mapped\",\"ν\"],[[926,926],\"mapped\",\"ξ\"],[[927,927],\"mapped\",\"ο\"],[[928,928],\"mapped\",\"π\"],[[929,929],\"mapped\",\"ρ\"],[[930,930],\"disallowed\"],[[931,931],\"mapped\",\"σ\"],[[932,932],\"mapped\",\"τ\"],[[933,933],\"mapped\",\"υ\"],[[934,934],\"mapped\",\"φ\"],[[935,935],\"mapped\",\"χ\"],[[936,936],\"mapped\",\"ψ\"],[[937,937],\"mapped\",\"ω\"],[[938,938],\"mapped\",\"ϊ\"],[[939,939],\"mapped\",\"ϋ\"],[[940,961],\"valid\"],[[962,962],\"deviation\",\"σ\"],[[963,974],\"valid\"],[[975,975],\"mapped\",\"ϗ\"],[[976,976],\"mapped\",\"β\"],[[977,977],\"mapped\",\"θ\"],[[978,978],\"mapped\",\"υ\"],[[979,979],\"mapped\",\"ύ\"],[[980,980],\"mapped\",\"ϋ\"],[[981,981],\"mapped\",\"φ\"],[[982,982],\"mapped\",\"π\"],[[983,983],\"valid\"],[[984,984],\"mapped\",\"ϙ\"],[[985,985],\"valid\"],[[986,986],\"mapped\",\"ϛ\"],[[987,987],\"valid\"],[[988,988],\"mapped\",\"ϝ\"],[[989,989],\"valid\"],[[990,990],\"mapped\",\"ϟ\"],[[991,991],\"valid\"],[[992,992],\"mapped\",\"ϡ\"],[[993,993],\"valid\"],[[994,994],\"mapped\",\"ϣ\"],[[995,995],\"valid\"],[[996,996],\"mapped\",\"ϥ\"],[[997,997],\"valid\"],[[998,998],\"mapped\",\"ϧ\"],[[999,999],\"valid\"],[[1000,1000],\"mapped\",\"ϩ\"],[[1001,1001],\"valid\"],[[1002,1002],\"mapped\",\"ϫ\"],[[1003,1003],\"valid\"],[[1004,1004],\"mapped\",\"ϭ\"],[[1005,1005],\"valid\"],[[1006,1006],\"mapped\",\"ϯ\"],[[1007,1007],\"valid\"],[[1008,1008],\"mapped\",\"κ\"],[[1009,1009],\"mapped\",\"ρ\"],[[1010,1010],\"mapped\",\"σ\"],[[1011,1011],\"valid\"],[[1012,1012],\"mapped\",\"θ\"],[[1013,1013],\"mapped\",\"ε\"],[[1014,1014],\"valid\",\"\",\"NV8\"],[[1015,1015],\"mapped\",\"ϸ\"],[[1016,1016],\"valid\"],[[1017,1017],\"mapped\",\"σ\"],[[1018,1018],\"mapped\",\"ϻ\"],[[1019,1019],\"valid\"],[[1020,1020],\"valid\"],[[1021,1021],\"mapped\",\"ͻ\"],[[1022,1022],\"mapped\",\"ͼ\"],[[1023,1023],\"mapped\",\"ͽ\"],[[1024,1024],\"mapped\",\"ѐ\"],[[1025,1025],\"mapped\",\"ё\"],[[1026,1026],\"mapped\",\"ђ\"],[[1027,1027],\"mapped\",\"ѓ\"],[[1028,1028],\"mapped\",\"є\"],[[1029,1029],\"mapped\",\"ѕ\"],[[1030,1030],\"mapped\",\"і\"],[[1031,1031],\"mapped\",\"ї\"],[[1032,1032],\"mapped\",\"ј\"],[[1033,1033],\"mapped\",\"љ\"],[[1034,1034],\"mapped\",\"њ\"],[[1035,1035],\"mapped\",\"ћ\"],[[1036,1036],\"mapped\",\"ќ\"],[[1037,1037],\"mapped\",\"ѝ\"],[[1038,1038],\"mapped\",\"ў\"],[[1039,1039],\"mapped\",\"џ\"],[[1040,1040],\"mapped\",\"а\"],[[1041,1041],\"mapped\",\"б\"],[[1042,1042],\"mapped\",\"в\"],[[1043,1043],\"mapped\",\"г\"],[[1044,1044],\"mapped\",\"д\"],[[1045,1045],\"mapped\",\"е\"],[[1046,1046],\"mapped\",\"ж\"],[[1047,1047],\"mapped\",\"з\"],[[1048,1048],\"mapped\",\"и\"],[[1049,1049],\"mapped\",\"й\"],[[1050,1050],\"mapped\",\"к\"],[[1051,1051],\"mapped\",\"л\"],[[1052,1052],\"mapped\",\"м\"],[[1053,1053],\"mapped\",\"н\"],[[1054,1054],\"mapped\",\"о\"],[[1055,1055],\"mapped\",\"п\"],[[1056,1056],\"mapped\",\"р\"],[[1057,1057],\"mapped\",\"с\"],[[1058,1058],\"mapped\",\"т\"],[[1059,1059],\"mapped\",\"у\"],[[1060,1060],\"mapped\",\"ф\"],[[1061,1061],\"mapped\",\"х\"],[[1062,1062],\"mapped\",\"ц\"],[[1063,1063],\"mapped\",\"ч\"],[[1064,1064],\"mapped\",\"ш\"],[[1065,1065],\"mapped\",\"щ\"],[[1066,1066],\"mapped\",\"ъ\"],[[1067,1067],\"mapped\",\"ы\"],[[1068,1068],\"mapped\",\"ь\"],[[1069,1069],\"mapped\",\"э\"],[[1070,1070],\"mapped\",\"ю\"],[[1071,1071],\"mapped\",\"я\"],[[1072,1103],\"valid\"],[[1104,1104],\"valid\"],[[1105,1116],\"valid\"],[[1117,1117],\"valid\"],[[1118,1119],\"valid\"],[[1120,1120],\"mapped\",\"ѡ\"],[[1121,1121],\"valid\"],[[1122,1122],\"mapped\",\"ѣ\"],[[1123,1123],\"valid\"],[[1124,1124],\"mapped\",\"ѥ\"],[[1125,1125],\"valid\"],[[1126,1126],\"mapped\",\"ѧ\"],[[1127,1127],\"valid\"],[[1128,1128],\"mapped\",\"ѩ\"],[[1129,1129],\"valid\"],[[1130,1130],\"mapped\",\"ѫ\"],[[1131,1131],\"valid\"],[[1132,1132],\"mapped\",\"ѭ\"],[[1133,1133],\"valid\"],[[1134,1134],\"mapped\",\"ѯ\"],[[1135,1135],\"valid\"],[[1136,1136],\"mapped\",\"ѱ\"],[[1137,1137],\"valid\"],[[1138,1138],\"mapped\",\"ѳ\"],[[1139,1139],\"valid\"],[[1140,1140],\"mapped\",\"ѵ\"],[[1141,1141],\"valid\"],[[1142,1142],\"mapped\",\"ѷ\"],[[1143,1143],\"valid\"],[[1144,1144],\"mapped\",\"ѹ\"],[[1145,1145],\"valid\"],[[1146,1146],\"mapped\",\"ѻ\"],[[1147,1147],\"valid\"],[[1148,1148],\"mapped\",\"ѽ\"],[[1149,1149],\"valid\"],[[1150,1150],\"mapped\",\"ѿ\"],[[1151,1151],\"valid\"],[[1152,1152],\"mapped\",\"ҁ\"],[[1153,1153],\"valid\"],[[1154,1154],\"valid\",\"\",\"NV8\"],[[1155,1158],\"valid\"],[[1159,1159],\"valid\"],[[1160,1161],\"valid\",\"\",\"NV8\"],[[1162,1162],\"mapped\",\"ҋ\"],[[1163,1163],\"valid\"],[[1164,1164],\"mapped\",\"ҍ\"],[[1165,1165],\"valid\"],[[1166,1166],\"mapped\",\"ҏ\"],[[1167,1167],\"valid\"],[[1168,1168],\"mapped\",\"ґ\"],[[1169,1169],\"valid\"],[[1170,1170],\"mapped\",\"ғ\"],[[1171,1171],\"valid\"],[[1172,1172],\"mapped\",\"ҕ\"],[[1173,1173],\"valid\"],[[1174,1174],\"mapped\",\"җ\"],[[1175,1175],\"valid\"],[[1176,1176],\"mapped\",\"ҙ\"],[[1177,1177],\"valid\"],[[1178,1178],\"mapped\",\"қ\"],[[1179,1179],\"valid\"],[[1180,1180],\"mapped\",\"ҝ\"],[[1181,1181],\"valid\"],[[1182,1182],\"mapped\",\"ҟ\"],[[1183,1183],\"valid\"],[[1184,1184],\"mapped\",\"ҡ\"],[[1185,1185],\"valid\"],[[1186,1186],\"mapped\",\"ң\"],[[1187,1187],\"valid\"],[[1188,1188],\"mapped\",\"ҥ\"],[[1189,1189],\"valid\"],[[1190,1190],\"mapped\",\"ҧ\"],[[1191,1191],\"valid\"],[[1192,1192],\"mapped\",\"ҩ\"],[[1193,1193],\"valid\"],[[1194,1194],\"mapped\",\"ҫ\"],[[1195,1195],\"valid\"],[[1196,1196],\"mapped\",\"ҭ\"],[[1197,1197],\"valid\"],[[1198,1198],\"mapped\",\"ү\"],[[1199,1199],\"valid\"],[[1200,1200],\"mapped\",\"ұ\"],[[1201,1201],\"valid\"],[[1202,1202],\"mapped\",\"ҳ\"],[[1203,1203],\"valid\"],[[1204,1204],\"mapped\",\"ҵ\"],[[1205,1205],\"valid\"],[[1206,1206],\"mapped\",\"ҷ\"],[[1207,1207],\"valid\"],[[1208,1208],\"mapped\",\"ҹ\"],[[1209,1209],\"valid\"],[[1210,1210],\"mapped\",\"һ\"],[[1211,1211],\"valid\"],[[1212,1212],\"mapped\",\"ҽ\"],[[1213,1213],\"valid\"],[[1214,1214],\"mapped\",\"ҿ\"],[[1215,1215],\"valid\"],[[1216,1216],\"disallowed\"],[[1217,1217],\"mapped\",\"ӂ\"],[[1218,1218],\"valid\"],[[1219,1219],\"mapped\",\"ӄ\"],[[1220,1220],\"valid\"],[[1221,1221],\"mapped\",\"ӆ\"],[[1222,1222],\"valid\"],[[1223,1223],\"mapped\",\"ӈ\"],[[1224,1224],\"valid\"],[[1225,1225],\"mapped\",\"ӊ\"],[[1226,1226],\"valid\"],[[1227,1227],\"mapped\",\"ӌ\"],[[1228,1228],\"valid\"],[[1229,1229],\"mapped\",\"ӎ\"],[[1230,1230],\"valid\"],[[1231,1231],\"valid\"],[[1232,1232],\"mapped\",\"ӑ\"],[[1233,1233],\"valid\"],[[1234,1234],\"mapped\",\"ӓ\"],[[1235,1235],\"valid\"],[[1236,1236],\"mapped\",\"ӕ\"],[[1237,1237],\"valid\"],[[1238,1238],\"mapped\",\"ӗ\"],[[1239,1239],\"valid\"],[[1240,1240],\"mapped\",\"ә\"],[[1241,1241],\"valid\"],[[1242,1242],\"mapped\",\"ӛ\"],[[1243,1243],\"valid\"],[[1244,1244],\"mapped\",\"ӝ\"],[[1245,1245],\"valid\"],[[1246,1246],\"mapped\",\"ӟ\"],[[1247,1247],\"valid\"],[[1248,1248],\"mapped\",\"ӡ\"],[[1249,1249],\"valid\"],[[1250,1250],\"mapped\",\"ӣ\"],[[1251,1251],\"valid\"],[[1252,1252],\"mapped\",\"ӥ\"],[[1253,1253],\"valid\"],[[1254,1254],\"mapped\",\"ӧ\"],[[1255,1255],\"valid\"],[[1256,1256],\"mapped\",\"ө\"],[[1257,1257],\"valid\"],[[1258,1258],\"mapped\",\"ӫ\"],[[1259,1259],\"valid\"],[[1260,1260],\"mapped\",\"ӭ\"],[[1261,1261],\"valid\"],[[1262,1262],\"mapped\",\"ӯ\"],[[1263,1263],\"valid\"],[[1264,1264],\"mapped\",\"ӱ\"],[[1265,1265],\"valid\"],[[1266,1266],\"mapped\",\"ӳ\"],[[1267,1267],\"valid\"],[[1268,1268],\"mapped\",\"ӵ\"],[[1269,1269],\"valid\"],[[1270,1270],\"mapped\",\"ӷ\"],[[1271,1271],\"valid\"],[[1272,1272],\"mapped\",\"ӹ\"],[[1273,1273],\"valid\"],[[1274,1274],\"mapped\",\"ӻ\"],[[1275,1275],\"valid\"],[[1276,1276],\"mapped\",\"ӽ\"],[[1277,1277],\"valid\"],[[1278,1278],\"mapped\",\"ӿ\"],[[1279,1279],\"valid\"],[[1280,1280],\"mapped\",\"ԁ\"],[[1281,1281],\"valid\"],[[1282,1282],\"mapped\",\"ԃ\"],[[1283,1283],\"valid\"],[[1284,1284],\"mapped\",\"ԅ\"],[[1285,1285],\"valid\"],[[1286,1286],\"mapped\",\"ԇ\"],[[1287,1287],\"valid\"],[[1288,1288],\"mapped\",\"ԉ\"],[[1289,1289],\"valid\"],[[1290,1290],\"mapped\",\"ԋ\"],[[1291,1291],\"valid\"],[[1292,1292],\"mapped\",\"ԍ\"],[[1293,1293],\"valid\"],[[1294,1294],\"mapped\",\"ԏ\"],[[1295,1295],\"valid\"],[[1296,1296],\"mapped\",\"ԑ\"],[[1297,1297],\"valid\"],[[1298,1298],\"mapped\",\"ԓ\"],[[1299,1299],\"valid\"],[[1300,1300],\"mapped\",\"ԕ\"],[[1301,1301],\"valid\"],[[1302,1302],\"mapped\",\"ԗ\"],[[1303,1303],\"valid\"],[[1304,1304],\"mapped\",\"ԙ\"],[[1305,1305],\"valid\"],[[1306,1306],\"mapped\",\"ԛ\"],[[1307,1307],\"valid\"],[[1308,1308],\"mapped\",\"ԝ\"],[[1309,1309],\"valid\"],[[1310,1310],\"mapped\",\"ԟ\"],[[1311,1311],\"valid\"],[[1312,1312],\"mapped\",\"ԡ\"],[[1313,1313],\"valid\"],[[1314,1314],\"mapped\",\"ԣ\"],[[1315,1315],\"valid\"],[[1316,1316],\"mapped\",\"ԥ\"],[[1317,1317],\"valid\"],[[1318,1318],\"mapped\",\"ԧ\"],[[1319,1319],\"valid\"],[[1320,1320],\"mapped\",\"ԩ\"],[[1321,1321],\"valid\"],[[1322,1322],\"mapped\",\"ԫ\"],[[1323,1323],\"valid\"],[[1324,1324],\"mapped\",\"ԭ\"],[[1325,1325],\"valid\"],[[1326,1326],\"mapped\",\"ԯ\"],[[1327,1327],\"valid\"],[[1328,1328],\"disallowed\"],[[1329,1329],\"mapped\",\"ա\"],[[1330,1330],\"mapped\",\"բ\"],[[1331,1331],\"mapped\",\"գ\"],[[1332,1332],\"mapped\",\"դ\"],[[1333,1333],\"mapped\",\"ե\"],[[1334,1334],\"mapped\",\"զ\"],[[1335,1335],\"mapped\",\"է\"],[[1336,1336],\"mapped\",\"ը\"],[[1337,1337],\"mapped\",\"թ\"],[[1338,1338],\"mapped\",\"ժ\"],[[1339,1339],\"mapped\",\"ի\"],[[1340,1340],\"mapped\",\"լ\"],[[1341,1341],\"mapped\",\"խ\"],[[1342,1342],\"mapped\",\"ծ\"],[[1343,1343],\"mapped\",\"կ\"],[[1344,1344],\"mapped\",\"հ\"],[[1345,1345],\"mapped\",\"ձ\"],[[1346,1346],\"mapped\",\"ղ\"],[[1347,1347],\"mapped\",\"ճ\"],[[1348,1348],\"mapped\",\"մ\"],[[1349,1349],\"mapped\",\"յ\"],[[1350,1350],\"mapped\",\"ն\"],[[1351,1351],\"mapped\",\"շ\"],[[1352,1352],\"mapped\",\"ո\"],[[1353,1353],\"mapped\",\"չ\"],[[1354,1354],\"mapped\",\"պ\"],[[1355,1355],\"mapped\",\"ջ\"],[[1356,1356],\"mapped\",\"ռ\"],[[1357,1357],\"mapped\",\"ս\"],[[1358,1358],\"mapped\",\"վ\"],[[1359,1359],\"mapped\",\"տ\"],[[1360,1360],\"mapped\",\"ր\"],[[1361,1361],\"mapped\",\"ց\"],[[1362,1362],\"mapped\",\"ւ\"],[[1363,1363],\"mapped\",\"փ\"],[[1364,1364],\"mapped\",\"ք\"],[[1365,1365],\"mapped\",\"օ\"],[[1366,1366],\"mapped\",\"ֆ\"],[[1367,1368],\"disallowed\"],[[1369,1369],\"valid\"],[[1370,1375],\"valid\",\"\",\"NV8\"],[[1376,1376],\"disallowed\"],[[1377,1414],\"valid\"],[[1415,1415],\"mapped\",\"եւ\"],[[1416,1416],\"disallowed\"],[[1417,1417],\"valid\",\"\",\"NV8\"],[[1418,1418],\"valid\",\"\",\"NV8\"],[[1419,1420],\"disallowed\"],[[1421,1422],\"valid\",\"\",\"NV8\"],[[1423,1423],\"valid\",\"\",\"NV8\"],[[1424,1424],\"disallowed\"],[[1425,1441],\"valid\"],[[1442,1442],\"valid\"],[[1443,1455],\"valid\"],[[1456,1465],\"valid\"],[[1466,1466],\"valid\"],[[1467,1469],\"valid\"],[[1470,1470],\"valid\",\"\",\"NV8\"],[[1471,1471],\"valid\"],[[1472,1472],\"valid\",\"\",\"NV8\"],[[1473,1474],\"valid\"],[[1475,1475],\"valid\",\"\",\"NV8\"],[[1476,1476],\"valid\"],[[1477,1477],\"valid\"],[[1478,1478],\"valid\",\"\",\"NV8\"],[[1479,1479],\"valid\"],[[1480,1487],\"disallowed\"],[[1488,1514],\"valid\"],[[1515,1519],\"disallowed\"],[[1520,1524],\"valid\"],[[1525,1535],\"disallowed\"],[[1536,1539],\"disallowed\"],[[1540,1540],\"disallowed\"],[[1541,1541],\"disallowed\"],[[1542,1546],\"valid\",\"\",\"NV8\"],[[1547,1547],\"valid\",\"\",\"NV8\"],[[1548,1548],\"valid\",\"\",\"NV8\"],[[1549,1551],\"valid\",\"\",\"NV8\"],[[1552,1557],\"valid\"],[[1558,1562],\"valid\"],[[1563,1563],\"valid\",\"\",\"NV8\"],[[1564,1564],\"disallowed\"],[[1565,1565],\"disallowed\"],[[1566,1566],\"valid\",\"\",\"NV8\"],[[1567,1567],\"valid\",\"\",\"NV8\"],[[1568,1568],\"valid\"],[[1569,1594],\"valid\"],[[1595,1599],\"valid\"],[[1600,1600],\"valid\",\"\",\"NV8\"],[[1601,1618],\"valid\"],[[1619,1621],\"valid\"],[[1622,1624],\"valid\"],[[1625,1630],\"valid\"],[[1631,1631],\"valid\"],[[1632,1641],\"valid\"],[[1642,1645],\"valid\",\"\",\"NV8\"],[[1646,1647],\"valid\"],[[1648,1652],\"valid\"],[[1653,1653],\"mapped\",\"اٴ\"],[[1654,1654],\"mapped\",\"وٴ\"],[[1655,1655],\"mapped\",\"ۇٴ\"],[[1656,1656],\"mapped\",\"يٴ\"],[[1657,1719],\"valid\"],[[1720,1721],\"valid\"],[[1722,1726],\"valid\"],[[1727,1727],\"valid\"],[[1728,1742],\"valid\"],[[1743,1743],\"valid\"],[[1744,1747],\"valid\"],[[1748,1748],\"valid\",\"\",\"NV8\"],[[1749,1756],\"valid\"],[[1757,1757],\"disallowed\"],[[1758,1758],\"valid\",\"\",\"NV8\"],[[1759,1768],\"valid\"],[[1769,1769],\"valid\",\"\",\"NV8\"],[[1770,1773],\"valid\"],[[1774,1775],\"valid\"],[[1776,1785],\"valid\"],[[1786,1790],\"valid\"],[[1791,1791],\"valid\"],[[1792,1805],\"valid\",\"\",\"NV8\"],[[1806,1806],\"disallowed\"],[[1807,1807],\"disallowed\"],[[1808,1836],\"valid\"],[[1837,1839],\"valid\"],[[1840,1866],\"valid\"],[[1867,1868],\"disallowed\"],[[1869,1871],\"valid\"],[[1872,1901],\"valid\"],[[1902,1919],\"valid\"],[[1920,1968],\"valid\"],[[1969,1969],\"valid\"],[[1970,1983],\"disallowed\"],[[1984,2037],\"valid\"],[[2038,2042],\"valid\",\"\",\"NV8\"],[[2043,2047],\"disallowed\"],[[2048,2093],\"valid\"],[[2094,2095],\"disallowed\"],[[2096,2110],\"valid\",\"\",\"NV8\"],[[2111,2111],\"disallowed\"],[[2112,2139],\"valid\"],[[2140,2141],\"disallowed\"],[[2142,2142],\"valid\",\"\",\"NV8\"],[[2143,2143],\"disallowed\"],[[2144,2154],\"valid\"],[[2155,2207],\"disallowed\"],[[2208,2208],\"valid\"],[[2209,2209],\"valid\"],[[2210,2220],\"valid\"],[[2221,2226],\"valid\"],[[2227,2228],\"valid\"],[[2229,2229],\"disallowed\"],[[2230,2237],\"valid\"],[[2238,2259],\"disallowed\"],[[2260,2273],\"valid\"],[[2274,2274],\"disallowed\"],[[2275,2275],\"valid\"],[[2276,2302],\"valid\"],[[2303,2303],\"valid\"],[[2304,2304],\"valid\"],[[2305,2307],\"valid\"],[[2308,2308],\"valid\"],[[2309,2361],\"valid\"],[[2362,2363],\"valid\"],[[2364,2381],\"valid\"],[[2382,2382],\"valid\"],[[2383,2383],\"valid\"],[[2384,2388],\"valid\"],[[2389,2389],\"valid\"],[[2390,2391],\"valid\"],[[2392,2392],\"mapped\",\"क़\"],[[2393,2393],\"mapped\",\"ख़\"],[[2394,2394],\"mapped\",\"ग़\"],[[2395,2395],\"mapped\",\"ज़\"],[[2396,2396],\"mapped\",\"ड़\"],[[2397,2397],\"mapped\",\"ढ़\"],[[2398,2398],\"mapped\",\"फ़\"],[[2399,2399],\"mapped\",\"य़\"],[[2400,2403],\"valid\"],[[2404,2405],\"valid\",\"\",\"NV8\"],[[2406,2415],\"valid\"],[[2416,2416],\"valid\",\"\",\"NV8\"],[[2417,2418],\"valid\"],[[2419,2423],\"valid\"],[[2424,2424],\"valid\"],[[2425,2426],\"valid\"],[[2427,2428],\"valid\"],[[2429,2429],\"valid\"],[[2430,2431],\"valid\"],[[2432,2432],\"valid\"],[[2433,2435],\"valid\"],[[2436,2436],\"disallowed\"],[[2437,2444],\"valid\"],[[2445,2446],\"disallowed\"],[[2447,2448],\"valid\"],[[2449,2450],\"disallowed\"],[[2451,2472],\"valid\"],[[2473,2473],\"disallowed\"],[[2474,2480],\"valid\"],[[2481,2481],\"disallowed\"],[[2482,2482],\"valid\"],[[2483,2485],\"disallowed\"],[[2486,2489],\"valid\"],[[2490,2491],\"disallowed\"],[[2492,2492],\"valid\"],[[2493,2493],\"valid\"],[[2494,2500],\"valid\"],[[2501,2502],\"disallowed\"],[[2503,2504],\"valid\"],[[2505,2506],\"disallowed\"],[[2507,2509],\"valid\"],[[2510,2510],\"valid\"],[[2511,2518],\"disallowed\"],[[2519,2519],\"valid\"],[[2520,2523],\"disallowed\"],[[2524,2524],\"mapped\",\"ড়\"],[[2525,2525],\"mapped\",\"ঢ়\"],[[2526,2526],\"disallowed\"],[[2527,2527],\"mapped\",\"য়\"],[[2528,2531],\"valid\"],[[2532,2533],\"disallowed\"],[[2534,2545],\"valid\"],[[2546,2554],\"valid\",\"\",\"NV8\"],[[2555,2555],\"valid\",\"\",\"NV8\"],[[2556,2556],\"valid\"],[[2557,2557],\"valid\",\"\",\"NV8\"],[[2558,2560],\"disallowed\"],[[2561,2561],\"valid\"],[[2562,2562],\"valid\"],[[2563,2563],\"valid\"],[[2564,2564],\"disallowed\"],[[2565,2570],\"valid\"],[[2571,2574],\"disallowed\"],[[2575,2576],\"valid\"],[[2577,2578],\"disallowed\"],[[2579,2600],\"valid\"],[[2601,2601],\"disallowed\"],[[2602,2608],\"valid\"],[[2609,2609],\"disallowed\"],[[2610,2610],\"valid\"],[[2611,2611],\"mapped\",\"ਲ਼\"],[[2612,2612],\"disallowed\"],[[2613,2613],\"valid\"],[[2614,2614],\"mapped\",\"ਸ਼\"],[[2615,2615],\"disallowed\"],[[2616,2617],\"valid\"],[[2618,2619],\"disallowed\"],[[2620,2620],\"valid\"],[[2621,2621],\"disallowed\"],[[2622,2626],\"valid\"],[[2627,2630],\"disallowed\"],[[2631,2632],\"valid\"],[[2633,2634],\"disallowed\"],[[2635,2637],\"valid\"],[[2638,2640],\"disallowed\"],[[2641,2641],\"valid\"],[[2642,2648],\"disallowed\"],[[2649,2649],\"mapped\",\"ਖ਼\"],[[2650,2650],\"mapped\",\"ਗ਼\"],[[2651,2651],\"mapped\",\"ਜ਼\"],[[2652,2652],\"valid\"],[[2653,2653],\"disallowed\"],[[2654,2654],\"mapped\",\"ਫ਼\"],[[2655,2661],\"disallowed\"],[[2662,2676],\"valid\"],[[2677,2677],\"valid\"],[[2678,2688],\"disallowed\"],[[2689,2691],\"valid\"],[[2692,2692],\"disallowed\"],[[2693,2699],\"valid\"],[[2700,2700],\"valid\"],[[2701,2701],\"valid\"],[[2702,2702],\"disallowed\"],[[2703,2705],\"valid\"],[[2706,2706],\"disallowed\"],[[2707,2728],\"valid\"],[[2729,2729],\"disallowed\"],[[2730,2736],\"valid\"],[[2737,2737],\"disallowed\"],[[2738,2739],\"valid\"],[[2740,2740],\"disallowed\"],[[2741,2745],\"valid\"],[[2746,2747],\"disallowed\"],[[2748,2757],\"valid\"],[[2758,2758],\"disallowed\"],[[2759,2761],\"valid\"],[[2762,2762],\"disallowed\"],[[2763,2765],\"valid\"],[[2766,2767],\"disallowed\"],[[2768,2768],\"valid\"],[[2769,2783],\"disallowed\"],[[2784,2784],\"valid\"],[[2785,2787],\"valid\"],[[2788,2789],\"disallowed\"],[[2790,2799],\"valid\"],[[2800,2800],\"valid\",\"\",\"NV8\"],[[2801,2801],\"valid\",\"\",\"NV8\"],[[2802,2808],\"disallowed\"],[[2809,2809],\"valid\"],[[2810,2815],\"valid\"],[[2816,2816],\"disallowed\"],[[2817,2819],\"valid\"],[[2820,2820],\"disallowed\"],[[2821,2828],\"valid\"],[[2829,2830],\"disallowed\"],[[2831,2832],\"valid\"],[[2833,2834],\"disallowed\"],[[2835,2856],\"valid\"],[[2857,2857],\"disallowed\"],[[2858,2864],\"valid\"],[[2865,2865],\"disallowed\"],[[2866,2867],\"valid\"],[[2868,2868],\"disallowed\"],[[2869,2869],\"valid\"],[[2870,2873],\"valid\"],[[2874,2875],\"disallowed\"],[[2876,2883],\"valid\"],[[2884,2884],\"valid\"],[[2885,2886],\"disallowed\"],[[2887,2888],\"valid\"],[[2889,2890],\"disallowed\"],[[2891,2893],\"valid\"],[[2894,2901],\"disallowed\"],[[2902,2903],\"valid\"],[[2904,2907],\"disallowed\"],[[2908,2908],\"mapped\",\"ଡ଼\"],[[2909,2909],\"mapped\",\"ଢ଼\"],[[2910,2910],\"disallowed\"],[[2911,2913],\"valid\"],[[2914,2915],\"valid\"],[[2916,2917],\"disallowed\"],[[2918,2927],\"valid\"],[[2928,2928],\"valid\",\"\",\"NV8\"],[[2929,2929],\"valid\"],[[2930,2935],\"valid\",\"\",\"NV8\"],[[2936,2945],\"disallowed\"],[[2946,2947],\"valid\"],[[2948,2948],\"disallowed\"],[[2949,2954],\"valid\"],[[2955,2957],\"disallowed\"],[[2958,2960],\"valid\"],[[2961,2961],\"disallowed\"],[[2962,2965],\"valid\"],[[2966,2968],\"disallowed\"],[[2969,2970],\"valid\"],[[2971,2971],\"disallowed\"],[[2972,2972],\"valid\"],[[2973,2973],\"disallowed\"],[[2974,2975],\"valid\"],[[2976,2978],\"disallowed\"],[[2979,2980],\"valid\"],[[2981,2983],\"disallowed\"],[[2984,2986],\"valid\"],[[2987,2989],\"disallowed\"],[[2990,2997],\"valid\"],[[2998,2998],\"valid\"],[[2999,3001],\"valid\"],[[3002,3005],\"disallowed\"],[[3006,3010],\"valid\"],[[3011,3013],\"disallowed\"],[[3014,3016],\"valid\"],[[3017,3017],\"disallowed\"],[[3018,3021],\"valid\"],[[3022,3023],\"disallowed\"],[[3024,3024],\"valid\"],[[3025,3030],\"disallowed\"],[[3031,3031],\"valid\"],[[3032,3045],\"disallowed\"],[[3046,3046],\"valid\"],[[3047,3055],\"valid\"],[[3056,3058],\"valid\",\"\",\"NV8\"],[[3059,3066],\"valid\",\"\",\"NV8\"],[[3067,3071],\"disallowed\"],[[3072,3072],\"valid\"],[[3073,3075],\"valid\"],[[3076,3076],\"disallowed\"],[[3077,3084],\"valid\"],[[3085,3085],\"disallowed\"],[[3086,3088],\"valid\"],[[3089,3089],\"disallowed\"],[[3090,3112],\"valid\"],[[3113,3113],\"disallowed\"],[[3114,3123],\"valid\"],[[3124,3124],\"valid\"],[[3125,3129],\"valid\"],[[3130,3132],\"disallowed\"],[[3133,3133],\"valid\"],[[3134,3140],\"valid\"],[[3141,3141],\"disallowed\"],[[3142,3144],\"valid\"],[[3145,3145],\"disallowed\"],[[3146,3149],\"valid\"],[[3150,3156],\"disallowed\"],[[3157,3158],\"valid\"],[[3159,3159],\"disallowed\"],[[3160,3161],\"valid\"],[[3162,3162],\"valid\"],[[3163,3167],\"disallowed\"],[[3168,3169],\"valid\"],[[3170,3171],\"valid\"],[[3172,3173],\"disallowed\"],[[3174,3183],\"valid\"],[[3184,3191],\"disallowed\"],[[3192,3199],\"valid\",\"\",\"NV8\"],[[3200,3200],\"valid\"],[[3201,3201],\"valid\"],[[3202,3203],\"valid\"],[[3204,3204],\"disallowed\"],[[3205,3212],\"valid\"],[[3213,3213],\"disallowed\"],[[3214,3216],\"valid\"],[[3217,3217],\"disallowed\"],[[3218,3240],\"valid\"],[[3241,3241],\"disallowed\"],[[3242,3251],\"valid\"],[[3252,3252],\"disallowed\"],[[3253,3257],\"valid\"],[[3258,3259],\"disallowed\"],[[3260,3261],\"valid\"],[[3262,3268],\"valid\"],[[3269,3269],\"disallowed\"],[[3270,3272],\"valid\"],[[3273,3273],\"disallowed\"],[[3274,3277],\"valid\"],[[3278,3284],\"disallowed\"],[[3285,3286],\"valid\"],[[3287,3293],\"disallowed\"],[[3294,3294],\"valid\"],[[3295,3295],\"disallowed\"],[[3296,3297],\"valid\"],[[3298,3299],\"valid\"],[[3300,3301],\"disallowed\"],[[3302,3311],\"valid\"],[[3312,3312],\"disallowed\"],[[3313,3314],\"valid\"],[[3315,3327],\"disallowed\"],[[3328,3328],\"valid\"],[[3329,3329],\"valid\"],[[3330,3331],\"valid\"],[[3332,3332],\"disallowed\"],[[3333,3340],\"valid\"],[[3341,3341],\"disallowed\"],[[3342,3344],\"valid\"],[[3345,3345],\"disallowed\"],[[3346,3368],\"valid\"],[[3369,3369],\"valid\"],[[3370,3385],\"valid\"],[[3386,3386],\"valid\"],[[3387,3388],\"valid\"],[[3389,3389],\"valid\"],[[3390,3395],\"valid\"],[[3396,3396],\"valid\"],[[3397,3397],\"disallowed\"],[[3398,3400],\"valid\"],[[3401,3401],\"disallowed\"],[[3402,3405],\"valid\"],[[3406,3406],\"valid\"],[[3407,3407],\"valid\",\"\",\"NV8\"],[[3408,3411],\"disallowed\"],[[3412,3414],\"valid\"],[[3415,3415],\"valid\"],[[3416,3422],\"valid\",\"\",\"NV8\"],[[3423,3423],\"valid\"],[[3424,3425],\"valid\"],[[3426,3427],\"valid\"],[[3428,3429],\"disallowed\"],[[3430,3439],\"valid\"],[[3440,3445],\"valid\",\"\",\"NV8\"],[[3446,3448],\"valid\",\"\",\"NV8\"],[[3449,3449],\"valid\",\"\",\"NV8\"],[[3450,3455],\"valid\"],[[3456,3457],\"disallowed\"],[[3458,3459],\"valid\"],[[3460,3460],\"disallowed\"],[[3461,3478],\"valid\"],[[3479,3481],\"disallowed\"],[[3482,3505],\"valid\"],[[3506,3506],\"disallowed\"],[[3507,3515],\"valid\"],[[3516,3516],\"disallowed\"],[[3517,3517],\"valid\"],[[3518,3519],\"disallowed\"],[[3520,3526],\"valid\"],[[3527,3529],\"disallowed\"],[[3530,3530],\"valid\"],[[3531,3534],\"disallowed\"],[[3535,3540],\"valid\"],[[3541,3541],\"disallowed\"],[[3542,3542],\"valid\"],[[3543,3543],\"disallowed\"],[[3544,3551],\"valid\"],[[3552,3557],\"disallowed\"],[[3558,3567],\"valid\"],[[3568,3569],\"disallowed\"],[[3570,3571],\"valid\"],[[3572,3572],\"valid\",\"\",\"NV8\"],[[3573,3584],\"disallowed\"],[[3585,3634],\"valid\"],[[3635,3635],\"mapped\",\"ํา\"],[[3636,3642],\"valid\"],[[3643,3646],\"disallowed\"],[[3647,3647],\"valid\",\"\",\"NV8\"],[[3648,3662],\"valid\"],[[3663,3663],\"valid\",\"\",\"NV8\"],[[3664,3673],\"valid\"],[[3674,3675],\"valid\",\"\",\"NV8\"],[[3676,3712],\"disallowed\"],[[3713,3714],\"valid\"],[[3715,3715],\"disallowed\"],[[3716,3716],\"valid\"],[[3717,3718],\"disallowed\"],[[3719,3720],\"valid\"],[[3721,3721],\"disallowed\"],[[3722,3722],\"valid\"],[[3723,3724],\"disallowed\"],[[3725,3725],\"valid\"],[[3726,3731],\"disallowed\"],[[3732,3735],\"valid\"],[[3736,3736],\"disallowed\"],[[3737,3743],\"valid\"],[[3744,3744],\"disallowed\"],[[3745,3747],\"valid\"],[[3748,3748],\"disallowed\"],[[3749,3749],\"valid\"],[[3750,3750],\"disallowed\"],[[3751,3751],\"valid\"],[[3752,3753],\"disallowed\"],[[3754,3755],\"valid\"],[[3756,3756],\"disallowed\"],[[3757,3762],\"valid\"],[[3763,3763],\"mapped\",\"ໍາ\"],[[3764,3769],\"valid\"],[[3770,3770],\"disallowed\"],[[3771,3773],\"valid\"],[[3774,3775],\"disallowed\"],[[3776,3780],\"valid\"],[[3781,3781],\"disallowed\"],[[3782,3782],\"valid\"],[[3783,3783],\"disallowed\"],[[3784,3789],\"valid\"],[[3790,3791],\"disallowed\"],[[3792,3801],\"valid\"],[[3802,3803],\"disallowed\"],[[3804,3804],\"mapped\",\"ຫນ\"],[[3805,3805],\"mapped\",\"ຫມ\"],[[3806,3807],\"valid\"],[[3808,3839],\"disallowed\"],[[3840,3840],\"valid\"],[[3841,3850],\"valid\",\"\",\"NV8\"],[[3851,3851],\"valid\"],[[3852,3852],\"mapped\",\"་\"],[[3853,3863],\"valid\",\"\",\"NV8\"],[[3864,3865],\"valid\"],[[3866,3871],\"valid\",\"\",\"NV8\"],[[3872,3881],\"valid\"],[[3882,3892],\"valid\",\"\",\"NV8\"],[[3893,3893],\"valid\"],[[3894,3894],\"valid\",\"\",\"NV8\"],[[3895,3895],\"valid\"],[[3896,3896],\"valid\",\"\",\"NV8\"],[[3897,3897],\"valid\"],[[3898,3901],\"valid\",\"\",\"NV8\"],[[3902,3906],\"valid\"],[[3907,3907],\"mapped\",\"གྷ\"],[[3908,3911],\"valid\"],[[3912,3912],\"disallowed\"],[[3913,3916],\"valid\"],[[3917,3917],\"mapped\",\"ཌྷ\"],[[3918,3921],\"valid\"],[[3922,3922],\"mapped\",\"དྷ\"],[[3923,3926],\"valid\"],[[3927,3927],\"mapped\",\"བྷ\"],[[3928,3931],\"valid\"],[[3932,3932],\"mapped\",\"ཛྷ\"],[[3933,3944],\"valid\"],[[3945,3945],\"mapped\",\"ཀྵ\"],[[3946,3946],\"valid\"],[[3947,3948],\"valid\"],[[3949,3952],\"disallowed\"],[[3953,3954],\"valid\"],[[3955,3955],\"mapped\",\"ཱི\"],[[3956,3956],\"valid\"],[[3957,3957],\"mapped\",\"ཱུ\"],[[3958,3958],\"mapped\",\"ྲྀ\"],[[3959,3959],\"mapped\",\"ྲཱྀ\"],[[3960,3960],\"mapped\",\"ླྀ\"],[[3961,3961],\"mapped\",\"ླཱྀ\"],[[3962,3968],\"valid\"],[[3969,3969],\"mapped\",\"ཱྀ\"],[[3970,3972],\"valid\"],[[3973,3973],\"valid\",\"\",\"NV8\"],[[3974,3979],\"valid\"],[[3980,3983],\"valid\"],[[3984,3986],\"valid\"],[[3987,3987],\"mapped\",\"ྒྷ\"],[[3988,3989],\"valid\"],[[3990,3990],\"valid\"],[[3991,3991],\"valid\"],[[3992,3992],\"disallowed\"],[[3993,3996],\"valid\"],[[3997,3997],\"mapped\",\"ྜྷ\"],[[3998,4001],\"valid\"],[[4002,4002],\"mapped\",\"ྡྷ\"],[[4003,4006],\"valid\"],[[4007,4007],\"mapped\",\"ྦྷ\"],[[4008,4011],\"valid\"],[[4012,4012],\"mapped\",\"ྫྷ\"],[[4013,4013],\"valid\"],[[4014,4016],\"valid\"],[[4017,4023],\"valid\"],[[4024,4024],\"valid\"],[[4025,4025],\"mapped\",\"ྐྵ\"],[[4026,4028],\"valid\"],[[4029,4029],\"disallowed\"],[[4030,4037],\"valid\",\"\",\"NV8\"],[[4038,4038],\"valid\"],[[4039,4044],\"valid\",\"\",\"NV8\"],[[4045,4045],\"disallowed\"],[[4046,4046],\"valid\",\"\",\"NV8\"],[[4047,4047],\"valid\",\"\",\"NV8\"],[[4048,4049],\"valid\",\"\",\"NV8\"],[[4050,4052],\"valid\",\"\",\"NV8\"],[[4053,4056],\"valid\",\"\",\"NV8\"],[[4057,4058],\"valid\",\"\",\"NV8\"],[[4059,4095],\"disallowed\"],[[4096,4129],\"valid\"],[[4130,4130],\"valid\"],[[4131,4135],\"valid\"],[[4136,4136],\"valid\"],[[4137,4138],\"valid\"],[[4139,4139],\"valid\"],[[4140,4146],\"valid\"],[[4147,4149],\"valid\"],[[4150,4153],\"valid\"],[[4154,4159],\"valid\"],[[4160,4169],\"valid\"],[[4170,4175],\"valid\",\"\",\"NV8\"],[[4176,4185],\"valid\"],[[4186,4249],\"valid\"],[[4250,4253],\"valid\"],[[4254,4255],\"valid\",\"\",\"NV8\"],[[4256,4293],\"disallowed\"],[[4294,4294],\"disallowed\"],[[4295,4295],\"mapped\",\"ⴧ\"],[[4296,4300],\"disallowed\"],[[4301,4301],\"mapped\",\"ⴭ\"],[[4302,4303],\"disallowed\"],[[4304,4342],\"valid\"],[[4343,4344],\"valid\"],[[4345,4346],\"valid\"],[[4347,4347],\"valid\",\"\",\"NV8\"],[[4348,4348],\"mapped\",\"ნ\"],[[4349,4351],\"valid\"],[[4352,4441],\"valid\",\"\",\"NV8\"],[[4442,4446],\"valid\",\"\",\"NV8\"],[[4447,4448],\"disallowed\"],[[4449,4514],\"valid\",\"\",\"NV8\"],[[4515,4519],\"valid\",\"\",\"NV8\"],[[4520,4601],\"valid\",\"\",\"NV8\"],[[4602,4607],\"valid\",\"\",\"NV8\"],[[4608,4614],\"valid\"],[[4615,4615],\"valid\"],[[4616,4678],\"valid\"],[[4679,4679],\"valid\"],[[4680,4680],\"valid\"],[[4681,4681],\"disallowed\"],[[4682,4685],\"valid\"],[[4686,4687],\"disallowed\"],[[4688,4694],\"valid\"],[[4695,4695],\"disallowed\"],[[4696,4696],\"valid\"],[[4697,4697],\"disallowed\"],[[4698,4701],\"valid\"],[[4702,4703],\"disallowed\"],[[4704,4742],\"valid\"],[[4743,4743],\"valid\"],[[4744,4744],\"valid\"],[[4745,4745],\"disallowed\"],[[4746,4749],\"valid\"],[[4750,4751],\"disallowed\"],[[4752,4782],\"valid\"],[[4783,4783],\"valid\"],[[4784,4784],\"valid\"],[[4785,4785],\"disallowed\"],[[4786,4789],\"valid\"],[[4790,4791],\"disallowed\"],[[4792,4798],\"valid\"],[[4799,4799],\"disallowed\"],[[4800,4800],\"valid\"],[[4801,4801],\"disallowed\"],[[4802,4805],\"valid\"],[[4806,4807],\"disallowed\"],[[4808,4814],\"valid\"],[[4815,4815],\"valid\"],[[4816,4822],\"valid\"],[[4823,4823],\"disallowed\"],[[4824,4846],\"valid\"],[[4847,4847],\"valid\"],[[4848,4878],\"valid\"],[[4879,4879],\"valid\"],[[4880,4880],\"valid\"],[[4881,4881],\"disallowed\"],[[4882,4885],\"valid\"],[[4886,4887],\"disallowed\"],[[4888,4894],\"valid\"],[[4895,4895],\"valid\"],[[4896,4934],\"valid\"],[[4935,4935],\"valid\"],[[4936,4954],\"valid\"],[[4955,4956],\"disallowed\"],[[4957,4958],\"valid\"],[[4959,4959],\"valid\"],[[4960,4960],\"valid\",\"\",\"NV8\"],[[4961,4988],\"valid\",\"\",\"NV8\"],[[4989,4991],\"disallowed\"],[[4992,5007],\"valid\"],[[5008,5017],\"valid\",\"\",\"NV8\"],[[5018,5023],\"disallowed\"],[[5024,5108],\"valid\"],[[5109,5109],\"valid\"],[[5110,5111],\"disallowed\"],[[5112,5112],\"mapped\",\"Ᏸ\"],[[5113,5113],\"mapped\",\"Ᏹ\"],[[5114,5114],\"mapped\",\"Ᏺ\"],[[5115,5115],\"mapped\",\"Ᏻ\"],[[5116,5116],\"mapped\",\"Ᏼ\"],[[5117,5117],\"mapped\",\"Ᏽ\"],[[5118,5119],\"disallowed\"],[[5120,5120],\"valid\",\"\",\"NV8\"],[[5121,5740],\"valid\"],[[5741,5742],\"valid\",\"\",\"NV8\"],[[5743,5750],\"valid\"],[[5751,5759],\"valid\"],[[5760,5760],\"disallowed\"],[[5761,5786],\"valid\"],[[5787,5788],\"valid\",\"\",\"NV8\"],[[5789,5791],\"disallowed\"],[[5792,5866],\"valid\"],[[5867,5872],\"valid\",\"\",\"NV8\"],[[5873,5880],\"valid\"],[[5881,5887],\"disallowed\"],[[5888,5900],\"valid\"],[[5901,5901],\"disallowed\"],[[5902,5908],\"valid\"],[[5909,5919],\"disallowed\"],[[5920,5940],\"valid\"],[[5941,5942],\"valid\",\"\",\"NV8\"],[[5943,5951],\"disallowed\"],[[5952,5971],\"valid\"],[[5972,5983],\"disallowed\"],[[5984,5996],\"valid\"],[[5997,5997],\"disallowed\"],[[5998,6000],\"valid\"],[[6001,6001],\"disallowed\"],[[6002,6003],\"valid\"],[[6004,6015],\"disallowed\"],[[6016,6067],\"valid\"],[[6068,6069],\"disallowed\"],[[6070,6099],\"valid\"],[[6100,6102],\"valid\",\"\",\"NV8\"],[[6103,6103],\"valid\"],[[6104,6107],\"valid\",\"\",\"NV8\"],[[6108,6108],\"valid\"],[[6109,6109],\"valid\"],[[6110,6111],\"disallowed\"],[[6112,6121],\"valid\"],[[6122,6127],\"disallowed\"],[[6128,6137],\"valid\",\"\",\"NV8\"],[[6138,6143],\"disallowed\"],[[6144,6149],\"valid\",\"\",\"NV8\"],[[6150,6150],\"disallowed\"],[[6151,6154],\"valid\",\"\",\"NV8\"],[[6155,6157],\"ignored\"],[[6158,6158],\"disallowed\"],[[6159,6159],\"disallowed\"],[[6160,6169],\"valid\"],[[6170,6175],\"disallowed\"],[[6176,6263],\"valid\"],[[6264,6271],\"disallowed\"],[[6272,6313],\"valid\"],[[6314,6314],\"valid\"],[[6315,6319],\"disallowed\"],[[6320,6389],\"valid\"],[[6390,6399],\"disallowed\"],[[6400,6428],\"valid\"],[[6429,6430],\"valid\"],[[6431,6431],\"disallowed\"],[[6432,6443],\"valid\"],[[6444,6447],\"disallowed\"],[[6448,6459],\"valid\"],[[6460,6463],\"disallowed\"],[[6464,6464],\"valid\",\"\",\"NV8\"],[[6465,6467],\"disallowed\"],[[6468,6469],\"valid\",\"\",\"NV8\"],[[6470,6509],\"valid\"],[[6510,6511],\"disallowed\"],[[6512,6516],\"valid\"],[[6517,6527],\"disallowed\"],[[6528,6569],\"valid\"],[[6570,6571],\"valid\"],[[6572,6575],\"disallowed\"],[[6576,6601],\"valid\"],[[6602,6607],\"disallowed\"],[[6608,6617],\"valid\"],[[6618,6618],\"valid\",\"\",\"XV8\"],[[6619,6621],\"disallowed\"],[[6622,6623],\"valid\",\"\",\"NV8\"],[[6624,6655],\"valid\",\"\",\"NV8\"],[[6656,6683],\"valid\"],[[6684,6685],\"disallowed\"],[[6686,6687],\"valid\",\"\",\"NV8\"],[[6688,6750],\"valid\"],[[6751,6751],\"disallowed\"],[[6752,6780],\"valid\"],[[6781,6782],\"disallowed\"],[[6783,6793],\"valid\"],[[6794,6799],\"disallowed\"],[[6800,6809],\"valid\"],[[6810,6815],\"disallowed\"],[[6816,6822],\"valid\",\"\",\"NV8\"],[[6823,6823],\"valid\"],[[6824,6829],\"valid\",\"\",\"NV8\"],[[6830,6831],\"disallowed\"],[[6832,6845],\"valid\"],[[6846,6846],\"valid\",\"\",\"NV8\"],[[6847,6911],\"disallowed\"],[[6912,6987],\"valid\"],[[6988,6991],\"disallowed\"],[[6992,7001],\"valid\"],[[7002,7018],\"valid\",\"\",\"NV8\"],[[7019,7027],\"valid\"],[[7028,7036],\"valid\",\"\",\"NV8\"],[[7037,7039],\"disallowed\"],[[7040,7082],\"valid\"],[[7083,7085],\"valid\"],[[7086,7097],\"valid\"],[[7098,7103],\"valid\"],[[7104,7155],\"valid\"],[[7156,7163],\"disallowed\"],[[7164,7167],\"valid\",\"\",\"NV8\"],[[7168,7223],\"valid\"],[[7224,7226],\"disallowed\"],[[7227,7231],\"valid\",\"\",\"NV8\"],[[7232,7241],\"valid\"],[[7242,7244],\"disallowed\"],[[7245,7293],\"valid\"],[[7294,7295],\"valid\",\"\",\"NV8\"],[[7296,7296],\"mapped\",\"в\"],[[7297,7297],\"mapped\",\"д\"],[[7298,7298],\"mapped\",\"о\"],[[7299,7299],\"mapped\",\"с\"],[[7300,7301],\"mapped\",\"т\"],[[7302,7302],\"mapped\",\"ъ\"],[[7303,7303],\"mapped\",\"ѣ\"],[[7304,7304],\"mapped\",\"ꙋ\"],[[7305,7359],\"disallowed\"],[[7360,7367],\"valid\",\"\",\"NV8\"],[[7368,7375],\"disallowed\"],[[7376,7378],\"valid\"],[[7379,7379],\"valid\",\"\",\"NV8\"],[[7380,7410],\"valid\"],[[7411,7414],\"valid\"],[[7415,7415],\"valid\"],[[7416,7417],\"valid\"],[[7418,7423],\"disallowed\"],[[7424,7467],\"valid\"],[[7468,7468],\"mapped\",\"a\"],[[7469,7469],\"mapped\",\"æ\"],[[7470,7470],\"mapped\",\"b\"],[[7471,7471],\"valid\"],[[7472,7472],\"mapped\",\"d\"],[[7473,7473],\"mapped\",\"e\"],[[7474,7474],\"mapped\",\"ǝ\"],[[7475,7475],\"mapped\",\"g\"],[[7476,7476],\"mapped\",\"h\"],[[7477,7477],\"mapped\",\"i\"],[[7478,7478],\"mapped\",\"j\"],[[7479,7479],\"mapped\",\"k\"],[[7480,7480],\"mapped\",\"l\"],[[7481,7481],\"mapped\",\"m\"],[[7482,7482],\"mapped\",\"n\"],[[7483,7483],\"valid\"],[[7484,7484],\"mapped\",\"o\"],[[7485,7485],\"mapped\",\"ȣ\"],[[7486,7486],\"mapped\",\"p\"],[[7487,7487],\"mapped\",\"r\"],[[7488,7488],\"mapped\",\"t\"],[[7489,7489],\"mapped\",\"u\"],[[7490,7490],\"mapped\",\"w\"],[[7491,7491],\"mapped\",\"a\"],[[7492,7492],\"mapped\",\"ɐ\"],[[7493,7493],\"mapped\",\"ɑ\"],[[7494,7494],\"mapped\",\"ᴂ\"],[[7495,7495],\"mapped\",\"b\"],[[7496,7496],\"mapped\",\"d\"],[[7497,7497],\"mapped\",\"e\"],[[7498,7498],\"mapped\",\"ə\"],[[7499,7499],\"mapped\",\"ɛ\"],[[7500,7500],\"mapped\",\"ɜ\"],[[7501,7501],\"mapped\",\"g\"],[[7502,7502],\"valid\"],[[7503,7503],\"mapped\",\"k\"],[[7504,7504],\"mapped\",\"m\"],[[7505,7505],\"mapped\",\"ŋ\"],[[7506,7506],\"mapped\",\"o\"],[[7507,7507],\"mapped\",\"ɔ\"],[[7508,7508],\"mapped\",\"ᴖ\"],[[7509,7509],\"mapped\",\"ᴗ\"],[[7510,7510],\"mapped\",\"p\"],[[7511,7511],\"mapped\",\"t\"],[[7512,7512],\"mapped\",\"u\"],[[7513,7513],\"mapped\",\"ᴝ\"],[[7514,7514],\"mapped\",\"ɯ\"],[[7515,7515],\"mapped\",\"v\"],[[7516,7516],\"mapped\",\"ᴥ\"],[[7517,7517],\"mapped\",\"β\"],[[7518,7518],\"mapped\",\"γ\"],[[7519,7519],\"mapped\",\"δ\"],[[7520,7520],\"mapped\",\"φ\"],[[7521,7521],\"mapped\",\"χ\"],[[7522,7522],\"mapped\",\"i\"],[[7523,7523],\"mapped\",\"r\"],[[7524,7524],\"mapped\",\"u\"],[[7525,7525],\"mapped\",\"v\"],[[7526,7526],\"mapped\",\"β\"],[[7527,7527],\"mapped\",\"γ\"],[[7528,7528],\"mapped\",\"ρ\"],[[7529,7529],\"mapped\",\"φ\"],[[7530,7530],\"mapped\",\"χ\"],[[7531,7531],\"valid\"],[[7532,7543],\"valid\"],[[7544,7544],\"mapped\",\"н\"],[[7545,7578],\"valid\"],[[7579,7579],\"mapped\",\"ɒ\"],[[7580,7580],\"mapped\",\"c\"],[[7581,7581],\"mapped\",\"ɕ\"],[[7582,7582],\"mapped\",\"ð\"],[[7583,7583],\"mapped\",\"ɜ\"],[[7584,7584],\"mapped\",\"f\"],[[7585,7585],\"mapped\",\"ɟ\"],[[7586,7586],\"mapped\",\"ɡ\"],[[7587,7587],\"mapped\",\"ɥ\"],[[7588,7588],\"mapped\",\"ɨ\"],[[7589,7589],\"mapped\",\"ɩ\"],[[7590,7590],\"mapped\",\"ɪ\"],[[7591,7591],\"mapped\",\"ᵻ\"],[[7592,7592],\"mapped\",\"ʝ\"],[[7593,7593],\"mapped\",\"ɭ\"],[[7594,7594],\"mapped\",\"ᶅ\"],[[7595,7595],\"mapped\",\"ʟ\"],[[7596,7596],\"mapped\",\"ɱ\"],[[7597,7597],\"mapped\",\"ɰ\"],[[7598,7598],\"mapped\",\"ɲ\"],[[7599,7599],\"mapped\",\"ɳ\"],[[7600,7600],\"mapped\",\"ɴ\"],[[7601,7601],\"mapped\",\"ɵ\"],[[7602,7602],\"mapped\",\"ɸ\"],[[7603,7603],\"mapped\",\"ʂ\"],[[7604,7604],\"mapped\",\"ʃ\"],[[7605,7605],\"mapped\",\"ƫ\"],[[7606,7606],\"mapped\",\"ʉ\"],[[7607,7607],\"mapped\",\"ʊ\"],[[7608,7608],\"mapped\",\"ᴜ\"],[[7609,7609],\"mapped\",\"ʋ\"],[[7610,7610],\"mapped\",\"ʌ\"],[[7611,7611],\"mapped\",\"z\"],[[7612,7612],\"mapped\",\"ʐ\"],[[7613,7613],\"mapped\",\"ʑ\"],[[7614,7614],\"mapped\",\"ʒ\"],[[7615,7615],\"mapped\",\"θ\"],[[7616,7619],\"valid\"],[[7620,7626],\"valid\"],[[7627,7654],\"valid\"],[[7655,7669],\"valid\"],[[7670,7673],\"valid\"],[[7674,7674],\"disallowed\"],[[7675,7675],\"valid\"],[[7676,7676],\"valid\"],[[7677,7677],\"valid\"],[[7678,7679],\"valid\"],[[7680,7680],\"mapped\",\"ḁ\"],[[7681,7681],\"valid\"],[[7682,7682],\"mapped\",\"ḃ\"],[[7683,7683],\"valid\"],[[7684,7684],\"mapped\",\"ḅ\"],[[7685,7685],\"valid\"],[[7686,7686],\"mapped\",\"ḇ\"],[[7687,7687],\"valid\"],[[7688,7688],\"mapped\",\"ḉ\"],[[7689,7689],\"valid\"],[[7690,7690],\"mapped\",\"ḋ\"],[[7691,7691],\"valid\"],[[7692,7692],\"mapped\",\"ḍ\"],[[7693,7693],\"valid\"],[[7694,7694],\"mapped\",\"ḏ\"],[[7695,7695],\"valid\"],[[7696,7696],\"mapped\",\"ḑ\"],[[7697,7697],\"valid\"],[[7698,7698],\"mapped\",\"ḓ\"],[[7699,7699],\"valid\"],[[7700,7700],\"mapped\",\"ḕ\"],[[7701,7701],\"valid\"],[[7702,7702],\"mapped\",\"ḗ\"],[[7703,7703],\"valid\"],[[7704,7704],\"mapped\",\"ḙ\"],[[7705,7705],\"valid\"],[[7706,7706],\"mapped\",\"ḛ\"],[[7707,7707],\"valid\"],[[7708,7708],\"mapped\",\"ḝ\"],[[7709,7709],\"valid\"],[[7710,7710],\"mapped\",\"ḟ\"],[[7711,7711],\"valid\"],[[7712,7712],\"mapped\",\"ḡ\"],[[7713,7713],\"valid\"],[[7714,7714],\"mapped\",\"ḣ\"],[[7715,7715],\"valid\"],[[7716,7716],\"mapped\",\"ḥ\"],[[7717,7717],\"valid\"],[[7718,7718],\"mapped\",\"ḧ\"],[[7719,7719],\"valid\"],[[7720,7720],\"mapped\",\"ḩ\"],[[7721,7721],\"valid\"],[[7722,7722],\"mapped\",\"ḫ\"],[[7723,7723],\"valid\"],[[7724,7724],\"mapped\",\"ḭ\"],[[7725,7725],\"valid\"],[[7726,7726],\"mapped\",\"ḯ\"],[[7727,7727],\"valid\"],[[7728,7728],\"mapped\",\"ḱ\"],[[7729,7729],\"valid\"],[[7730,7730],\"mapped\",\"ḳ\"],[[7731,7731],\"valid\"],[[7732,7732],\"mapped\",\"ḵ\"],[[7733,7733],\"valid\"],[[7734,7734],\"mapped\",\"ḷ\"],[[7735,7735],\"valid\"],[[7736,7736],\"mapped\",\"ḹ\"],[[7737,7737],\"valid\"],[[7738,7738],\"mapped\",\"ḻ\"],[[7739,7739],\"valid\"],[[7740,7740],\"mapped\",\"ḽ\"],[[7741,7741],\"valid\"],[[7742,7742],\"mapped\",\"ḿ\"],[[7743,7743],\"valid\"],[[7744,7744],\"mapped\",\"ṁ\"],[[7745,7745],\"valid\"],[[7746,7746],\"mapped\",\"ṃ\"],[[7747,7747],\"valid\"],[[7748,7748],\"mapped\",\"ṅ\"],[[7749,7749],\"valid\"],[[7750,7750],\"mapped\",\"ṇ\"],[[7751,7751],\"valid\"],[[7752,7752],\"mapped\",\"ṉ\"],[[7753,7753],\"valid\"],[[7754,7754],\"mapped\",\"ṋ\"],[[7755,7755],\"valid\"],[[7756,7756],\"mapped\",\"ṍ\"],[[7757,7757],\"valid\"],[[7758,7758],\"mapped\",\"ṏ\"],[[7759,7759],\"valid\"],[[7760,7760],\"mapped\",\"ṑ\"],[[7761,7761],\"valid\"],[[7762,7762],\"mapped\",\"ṓ\"],[[7763,7763],\"valid\"],[[7764,7764],\"mapped\",\"ṕ\"],[[7765,7765],\"valid\"],[[7766,7766],\"mapped\",\"ṗ\"],[[7767,7767],\"valid\"],[[7768,7768],\"mapped\",\"ṙ\"],[[7769,7769],\"valid\"],[[7770,7770],\"mapped\",\"ṛ\"],[[7771,7771],\"valid\"],[[7772,7772],\"mapped\",\"ṝ\"],[[7773,7773],\"valid\"],[[7774,7774],\"mapped\",\"ṟ\"],[[7775,7775],\"valid\"],[[7776,7776],\"mapped\",\"ṡ\"],[[7777,7777],\"valid\"],[[7778,7778],\"mapped\",\"ṣ\"],[[7779,7779],\"valid\"],[[7780,7780],\"mapped\",\"ṥ\"],[[7781,7781],\"valid\"],[[7782,7782],\"mapped\",\"ṧ\"],[[7783,7783],\"valid\"],[[7784,7784],\"mapped\",\"ṩ\"],[[7785,7785],\"valid\"],[[7786,7786],\"mapped\",\"ṫ\"],[[7787,7787],\"valid\"],[[7788,7788],\"mapped\",\"ṭ\"],[[7789,7789],\"valid\"],[[7790,7790],\"mapped\",\"ṯ\"],[[7791,7791],\"valid\"],[[7792,7792],\"mapped\",\"ṱ\"],[[7793,7793],\"valid\"],[[7794,7794],\"mapped\",\"ṳ\"],[[7795,7795],\"valid\"],[[7796,7796],\"mapped\",\"ṵ\"],[[7797,7797],\"valid\"],[[7798,7798],\"mapped\",\"ṷ\"],[[7799,7799],\"valid\"],[[7800,7800],\"mapped\",\"ṹ\"],[[7801,7801],\"valid\"],[[7802,7802],\"mapped\",\"ṻ\"],[[7803,7803],\"valid\"],[[7804,7804],\"mapped\",\"ṽ\"],[[7805,7805],\"valid\"],[[7806,7806],\"mapped\",\"ṿ\"],[[7807,7807],\"valid\"],[[7808,7808],\"mapped\",\"ẁ\"],[[7809,7809],\"valid\"],[[7810,7810],\"mapped\",\"ẃ\"],[[7811,7811],\"valid\"],[[7812,7812],\"mapped\",\"ẅ\"],[[7813,7813],\"valid\"],[[7814,7814],\"mapped\",\"ẇ\"],[[7815,7815],\"valid\"],[[7816,7816],\"mapped\",\"ẉ\"],[[7817,7817],\"valid\"],[[7818,7818],\"mapped\",\"ẋ\"],[[7819,7819],\"valid\"],[[7820,7820],\"mapped\",\"ẍ\"],[[7821,7821],\"valid\"],[[7822,7822],\"mapped\",\"ẏ\"],[[7823,7823],\"valid\"],[[7824,7824],\"mapped\",\"ẑ\"],[[7825,7825],\"valid\"],[[7826,7826],\"mapped\",\"ẓ\"],[[7827,7827],\"valid\"],[[7828,7828],\"mapped\",\"ẕ\"],[[7829,7833],\"valid\"],[[7834,7834],\"mapped\",\"aʾ\"],[[7835,7835],\"mapped\",\"ṡ\"],[[7836,7837],\"valid\"],[[7838,7838],\"mapped\",\"ss\"],[[7839,7839],\"valid\"],[[7840,7840],\"mapped\",\"ạ\"],[[7841,7841],\"valid\"],[[7842,7842],\"mapped\",\"ả\"],[[7843,7843],\"valid\"],[[7844,7844],\"mapped\",\"ấ\"],[[7845,7845],\"valid\"],[[7846,7846],\"mapped\",\"ầ\"],[[7847,7847],\"valid\"],[[7848,7848],\"mapped\",\"ẩ\"],[[7849,7849],\"valid\"],[[7850,7850],\"mapped\",\"ẫ\"],[[7851,7851],\"valid\"],[[7852,7852],\"mapped\",\"ậ\"],[[7853,7853],\"valid\"],[[7854,7854],\"mapped\",\"ắ\"],[[7855,7855],\"valid\"],[[7856,7856],\"mapped\",\"ằ\"],[[7857,7857],\"valid\"],[[7858,7858],\"mapped\",\"ẳ\"],[[7859,7859],\"valid\"],[[7860,7860],\"mapped\",\"ẵ\"],[[7861,7861],\"valid\"],[[7862,7862],\"mapped\",\"ặ\"],[[7863,7863],\"valid\"],[[7864,7864],\"mapped\",\"ẹ\"],[[7865,7865],\"valid\"],[[7866,7866],\"mapped\",\"ẻ\"],[[7867,7867],\"valid\"],[[7868,7868],\"mapped\",\"ẽ\"],[[7869,7869],\"valid\"],[[7870,7870],\"mapped\",\"ế\"],[[7871,7871],\"valid\"],[[7872,7872],\"mapped\",\"ề\"],[[7873,7873],\"valid\"],[[7874,7874],\"mapped\",\"ể\"],[[7875,7875],\"valid\"],[[7876,7876],\"mapped\",\"ễ\"],[[7877,7877],\"valid\"],[[7878,7878],\"mapped\",\"ệ\"],[[7879,7879],\"valid\"],[[7880,7880],\"mapped\",\"ỉ\"],[[7881,7881],\"valid\"],[[7882,7882],\"mapped\",\"ị\"],[[7883,7883],\"valid\"],[[7884,7884],\"mapped\",\"ọ\"],[[7885,7885],\"valid\"],[[7886,7886],\"mapped\",\"ỏ\"],[[7887,7887],\"valid\"],[[7888,7888],\"mapped\",\"ố\"],[[7889,7889],\"valid\"],[[7890,7890],\"mapped\",\"ồ\"],[[7891,7891],\"valid\"],[[7892,7892],\"mapped\",\"ổ\"],[[7893,7893],\"valid\"],[[7894,7894],\"mapped\",\"ỗ\"],[[7895,7895],\"valid\"],[[7896,7896],\"mapped\",\"ộ\"],[[7897,7897],\"valid\"],[[7898,7898],\"mapped\",\"ớ\"],[[7899,7899],\"valid\"],[[7900,7900],\"mapped\",\"ờ\"],[[7901,7901],\"valid\"],[[7902,7902],\"mapped\",\"ở\"],[[7903,7903],\"valid\"],[[7904,7904],\"mapped\",\"ỡ\"],[[7905,7905],\"valid\"],[[7906,7906],\"mapped\",\"ợ\"],[[7907,7907],\"valid\"],[[7908,7908],\"mapped\",\"ụ\"],[[7909,7909],\"valid\"],[[7910,7910],\"mapped\",\"ủ\"],[[7911,7911],\"valid\"],[[7912,7912],\"mapped\",\"ứ\"],[[7913,7913],\"valid\"],[[7914,7914],\"mapped\",\"ừ\"],[[7915,7915],\"valid\"],[[7916,7916],\"mapped\",\"ử\"],[[7917,7917],\"valid\"],[[7918,7918],\"mapped\",\"ữ\"],[[7919,7919],\"valid\"],[[7920,7920],\"mapped\",\"ự\"],[[7921,7921],\"valid\"],[[7922,7922],\"mapped\",\"ỳ\"],[[7923,7923],\"valid\"],[[7924,7924],\"mapped\",\"ỵ\"],[[7925,7925],\"valid\"],[[7926,7926],\"mapped\",\"ỷ\"],[[7927,7927],\"valid\"],[[7928,7928],\"mapped\",\"ỹ\"],[[7929,7929],\"valid\"],[[7930,7930],\"mapped\",\"ỻ\"],[[7931,7931],\"valid\"],[[7932,7932],\"mapped\",\"ỽ\"],[[7933,7933],\"valid\"],[[7934,7934],\"mapped\",\"ỿ\"],[[7935,7935],\"valid\"],[[7936,7943],\"valid\"],[[7944,7944],\"mapped\",\"ἀ\"],[[7945,7945],\"mapped\",\"ἁ\"],[[7946,7946],\"mapped\",\"ἂ\"],[[7947,7947],\"mapped\",\"ἃ\"],[[7948,7948],\"mapped\",\"ἄ\"],[[7949,7949],\"mapped\",\"ἅ\"],[[7950,7950],\"mapped\",\"ἆ\"],[[7951,7951],\"mapped\",\"ἇ\"],[[7952,7957],\"valid\"],[[7958,7959],\"disallowed\"],[[7960,7960],\"mapped\",\"ἐ\"],[[7961,7961],\"mapped\",\"ἑ\"],[[7962,7962],\"mapped\",\"ἒ\"],[[7963,7963],\"mapped\",\"ἓ\"],[[7964,7964],\"mapped\",\"ἔ\"],[[7965,7965],\"mapped\",\"ἕ\"],[[7966,7967],\"disallowed\"],[[7968,7975],\"valid\"],[[7976,7976],\"mapped\",\"ἠ\"],[[7977,7977],\"mapped\",\"ἡ\"],[[7978,7978],\"mapped\",\"ἢ\"],[[7979,7979],\"mapped\",\"ἣ\"],[[7980,7980],\"mapped\",\"ἤ\"],[[7981,7981],\"mapped\",\"ἥ\"],[[7982,7982],\"mapped\",\"ἦ\"],[[7983,7983],\"mapped\",\"ἧ\"],[[7984,7991],\"valid\"],[[7992,7992],\"mapped\",\"ἰ\"],[[7993,7993],\"mapped\",\"ἱ\"],[[7994,7994],\"mapped\",\"ἲ\"],[[7995,7995],\"mapped\",\"ἳ\"],[[7996,7996],\"mapped\",\"ἴ\"],[[7997,7997],\"mapped\",\"ἵ\"],[[7998,7998],\"mapped\",\"ἶ\"],[[7999,7999],\"mapped\",\"ἷ\"],[[8000,8005],\"valid\"],[[8006,8007],\"disallowed\"],[[8008,8008],\"mapped\",\"ὀ\"],[[8009,8009],\"mapped\",\"ὁ\"],[[8010,8010],\"mapped\",\"ὂ\"],[[8011,8011],\"mapped\",\"ὃ\"],[[8012,8012],\"mapped\",\"ὄ\"],[[8013,8013],\"mapped\",\"ὅ\"],[[8014,8015],\"disallowed\"],[[8016,8023],\"valid\"],[[8024,8024],\"disallowed\"],[[8025,8025],\"mapped\",\"ὑ\"],[[8026,8026],\"disallowed\"],[[8027,8027],\"mapped\",\"ὓ\"],[[8028,8028],\"disallowed\"],[[8029,8029],\"mapped\",\"ὕ\"],[[8030,8030],\"disallowed\"],[[8031,8031],\"mapped\",\"ὗ\"],[[8032,8039],\"valid\"],[[8040,8040],\"mapped\",\"ὠ\"],[[8041,8041],\"mapped\",\"ὡ\"],[[8042,8042],\"mapped\",\"ὢ\"],[[8043,8043],\"mapped\",\"ὣ\"],[[8044,8044],\"mapped\",\"ὤ\"],[[8045,8045],\"mapped\",\"ὥ\"],[[8046,8046],\"mapped\",\"ὦ\"],[[8047,8047],\"mapped\",\"ὧ\"],[[8048,8048],\"valid\"],[[8049,8049],\"mapped\",\"ά\"],[[8050,8050],\"valid\"],[[8051,8051],\"mapped\",\"έ\"],[[8052,8052],\"valid\"],[[8053,8053],\"mapped\",\"ή\"],[[8054,8054],\"valid\"],[[8055,8055],\"mapped\",\"ί\"],[[8056,8056],\"valid\"],[[8057,8057],\"mapped\",\"ό\"],[[8058,8058],\"valid\"],[[8059,8059],\"mapped\",\"ύ\"],[[8060,8060],\"valid\"],[[8061,8061],\"mapped\",\"ώ\"],[[8062,8063],\"disallowed\"],[[8064,8064],\"mapped\",\"ἀι\"],[[8065,8065],\"mapped\",\"ἁι\"],[[8066,8066],\"mapped\",\"ἂι\"],[[8067,8067],\"mapped\",\"ἃι\"],[[8068,8068],\"mapped\",\"ἄι\"],[[8069,8069],\"mapped\",\"ἅι\"],[[8070,8070],\"mapped\",\"ἆι\"],[[8071,8071],\"mapped\",\"ἇι\"],[[8072,8072],\"mapped\",\"ἀι\"],[[8073,8073],\"mapped\",\"ἁι\"],[[8074,8074],\"mapped\",\"ἂι\"],[[8075,8075],\"mapped\",\"ἃι\"],[[8076,8076],\"mapped\",\"ἄι\"],[[8077,8077],\"mapped\",\"ἅι\"],[[8078,8078],\"mapped\",\"ἆι\"],[[8079,8079],\"mapped\",\"ἇι\"],[[8080,8080],\"mapped\",\"ἠι\"],[[8081,8081],\"mapped\",\"ἡι\"],[[8082,8082],\"mapped\",\"ἢι\"],[[8083,8083],\"mapped\",\"ἣι\"],[[8084,8084],\"mapped\",\"ἤι\"],[[8085,8085],\"mapped\",\"ἥι\"],[[8086,8086],\"mapped\",\"ἦι\"],[[8087,8087],\"mapped\",\"ἧι\"],[[8088,8088],\"mapped\",\"ἠι\"],[[8089,8089],\"mapped\",\"ἡι\"],[[8090,8090],\"mapped\",\"ἢι\"],[[8091,8091],\"mapped\",\"ἣι\"],[[8092,8092],\"mapped\",\"ἤι\"],[[8093,8093],\"mapped\",\"ἥι\"],[[8094,8094],\"mapped\",\"ἦι\"],[[8095,8095],\"mapped\",\"ἧι\"],[[8096,8096],\"mapped\",\"ὠι\"],[[8097,8097],\"mapped\",\"ὡι\"],[[8098,8098],\"mapped\",\"ὢι\"],[[8099,8099],\"mapped\",\"ὣι\"],[[8100,8100],\"mapped\",\"ὤι\"],[[8101,8101],\"mapped\",\"ὥι\"],[[8102,8102],\"mapped\",\"ὦι\"],[[8103,8103],\"mapped\",\"ὧι\"],[[8104,8104],\"mapped\",\"ὠι\"],[[8105,8105],\"mapped\",\"ὡι\"],[[8106,8106],\"mapped\",\"ὢι\"],[[8107,8107],\"mapped\",\"ὣι\"],[[8108,8108],\"mapped\",\"ὤι\"],[[8109,8109],\"mapped\",\"ὥι\"],[[8110,8110],\"mapped\",\"ὦι\"],[[8111,8111],\"mapped\",\"ὧι\"],[[8112,8113],\"valid\"],[[8114,8114],\"mapped\",\"ὰι\"],[[8115,8115],\"mapped\",\"αι\"],[[8116,8116],\"mapped\",\"άι\"],[[8117,8117],\"disallowed\"],[[8118,8118],\"valid\"],[[8119,8119],\"mapped\",\"ᾶι\"],[[8120,8120],\"mapped\",\"ᾰ\"],[[8121,8121],\"mapped\",\"ᾱ\"],[[8122,8122],\"mapped\",\"ὰ\"],[[8123,8123],\"mapped\",\"ά\"],[[8124,8124],\"mapped\",\"αι\"],[[8125,8125],\"disallowed_STD3_mapped\",\" ̓\"],[[8126,8126],\"mapped\",\"ι\"],[[8127,8127],\"disallowed_STD3_mapped\",\" ̓\"],[[8128,8128],\"disallowed_STD3_mapped\",\" ͂\"],[[8129,8129],\"disallowed_STD3_mapped\",\" ̈͂\"],[[8130,8130],\"mapped\",\"ὴι\"],[[8131,8131],\"mapped\",\"ηι\"],[[8132,8132],\"mapped\",\"ήι\"],[[8133,8133],\"disallowed\"],[[8134,8134],\"valid\"],[[8135,8135],\"mapped\",\"ῆι\"],[[8136,8136],\"mapped\",\"ὲ\"],[[8137,8137],\"mapped\",\"έ\"],[[8138,8138],\"mapped\",\"ὴ\"],[[8139,8139],\"mapped\",\"ή\"],[[8140,8140],\"mapped\",\"ηι\"],[[8141,8141],\"disallowed_STD3_mapped\",\" ̓̀\"],[[8142,8142],\"disallowed_STD3_mapped\",\" ̓́\"],[[8143,8143],\"disallowed_STD3_mapped\",\" ̓͂\"],[[8144,8146],\"valid\"],[[8147,8147],\"mapped\",\"ΐ\"],[[8148,8149],\"disallowed\"],[[8150,8151],\"valid\"],[[8152,8152],\"mapped\",\"ῐ\"],[[8153,8153],\"mapped\",\"ῑ\"],[[8154,8154],\"mapped\",\"ὶ\"],[[8155,8155],\"mapped\",\"ί\"],[[8156,8156],\"disallowed\"],[[8157,8157],\"disallowed_STD3_mapped\",\" ̔̀\"],[[8158,8158],\"disallowed_STD3_mapped\",\" ̔́\"],[[8159,8159],\"disallowed_STD3_mapped\",\" ̔͂\"],[[8160,8162],\"valid\"],[[8163,8163],\"mapped\",\"ΰ\"],[[8164,8167],\"valid\"],[[8168,8168],\"mapped\",\"ῠ\"],[[8169,8169],\"mapped\",\"ῡ\"],[[8170,8170],\"mapped\",\"ὺ\"],[[8171,8171],\"mapped\",\"ύ\"],[[8172,8172],\"mapped\",\"ῥ\"],[[8173,8173],\"disallowed_STD3_mapped\",\" ̈̀\"],[[8174,8174],\"disallowed_STD3_mapped\",\" ̈́\"],[[8175,8175],\"disallowed_STD3_mapped\",\"`\"],[[8176,8177],\"disallowed\"],[[8178,8178],\"mapped\",\"ὼι\"],[[8179,8179],\"mapped\",\"ωι\"],[[8180,8180],\"mapped\",\"ώι\"],[[8181,8181],\"disallowed\"],[[8182,8182],\"valid\"],[[8183,8183],\"mapped\",\"ῶι\"],[[8184,8184],\"mapped\",\"ὸ\"],[[8185,8185],\"mapped\",\"ό\"],[[8186,8186],\"mapped\",\"ὼ\"],[[8187,8187],\"mapped\",\"ώ\"],[[8188,8188],\"mapped\",\"ωι\"],[[8189,8189],\"disallowed_STD3_mapped\",\" ́\"],[[8190,8190],\"disallowed_STD3_mapped\",\" ̔\"],[[8191,8191],\"disallowed\"],[[8192,8202],\"disallowed_STD3_mapped\",\" \"],[[8203,8203],\"ignored\"],[[8204,8205],\"deviation\",\"\"],[[8206,8207],\"disallowed\"],[[8208,8208],\"valid\",\"\",\"NV8\"],[[8209,8209],\"mapped\",\"‐\"],[[8210,8214],\"valid\",\"\",\"NV8\"],[[8215,8215],\"disallowed_STD3_mapped\",\" ̳\"],[[8216,8227],\"valid\",\"\",\"NV8\"],[[8228,8230],\"disallowed\"],[[8231,8231],\"valid\",\"\",\"NV8\"],[[8232,8238],\"disallowed\"],[[8239,8239],\"disallowed_STD3_mapped\",\" \"],[[8240,8242],\"valid\",\"\",\"NV8\"],[[8243,8243],\"mapped\",\"′′\"],[[8244,8244],\"mapped\",\"′′′\"],[[8245,8245],\"valid\",\"\",\"NV8\"],[[8246,8246],\"mapped\",\"‵‵\"],[[8247,8247],\"mapped\",\"‵‵‵\"],[[8248,8251],\"valid\",\"\",\"NV8\"],[[8252,8252],\"disallowed_STD3_mapped\",\"!!\"],[[8253,8253],\"valid\",\"\",\"NV8\"],[[8254,8254],\"disallowed_STD3_mapped\",\" ̅\"],[[8255,8262],\"valid\",\"\",\"NV8\"],[[8263,8263],\"disallowed_STD3_mapped\",\"??\"],[[8264,8264],\"disallowed_STD3_mapped\",\"?!\"],[[8265,8265],\"disallowed_STD3_mapped\",\"!?\"],[[8266,8269],\"valid\",\"\",\"NV8\"],[[8270,8274],\"valid\",\"\",\"NV8\"],[[8275,8276],\"valid\",\"\",\"NV8\"],[[8277,8278],\"valid\",\"\",\"NV8\"],[[8279,8279],\"mapped\",\"′′′′\"],[[8280,8286],\"valid\",\"\",\"NV8\"],[[8287,8287],\"disallowed_STD3_mapped\",\" \"],[[8288,8288],\"ignored\"],[[8289,8291],\"disallowed\"],[[8292,8292],\"ignored\"],[[8293,8293],\"disallowed\"],[[8294,8297],\"disallowed\"],[[8298,8303],\"disallowed\"],[[8304,8304],\"mapped\",\"0\"],[[8305,8305],\"mapped\",\"i\"],[[8306,8307],\"disallowed\"],[[8308,8308],\"mapped\",\"4\"],[[8309,8309],\"mapped\",\"5\"],[[8310,8310],\"mapped\",\"6\"],[[8311,8311],\"mapped\",\"7\"],[[8312,8312],\"mapped\",\"8\"],[[8313,8313],\"mapped\",\"9\"],[[8314,8314],\"disallowed_STD3_mapped\",\"+\"],[[8315,8315],\"mapped\",\"−\"],[[8316,8316],\"disallowed_STD3_mapped\",\"=\"],[[8317,8317],\"disallowed_STD3_mapped\",\"(\"],[[8318,8318],\"disallowed_STD3_mapped\",\")\"],[[8319,8319],\"mapped\",\"n\"],[[8320,8320],\"mapped\",\"0\"],[[8321,8321],\"mapped\",\"1\"],[[8322,8322],\"mapped\",\"2\"],[[8323,8323],\"mapped\",\"3\"],[[8324,8324],\"mapped\",\"4\"],[[8325,8325],\"mapped\",\"5\"],[[8326,8326],\"mapped\",\"6\"],[[8327,8327],\"mapped\",\"7\"],[[8328,8328],\"mapped\",\"8\"],[[8329,8329],\"mapped\",\"9\"],[[8330,8330],\"disallowed_STD3_mapped\",\"+\"],[[8331,8331],\"mapped\",\"−\"],[[8332,8332],\"disallowed_STD3_mapped\",\"=\"],[[8333,8333],\"disallowed_STD3_mapped\",\"(\"],[[8334,8334],\"disallowed_STD3_mapped\",\")\"],[[8335,8335],\"disallowed\"],[[8336,8336],\"mapped\",\"a\"],[[8337,8337],\"mapped\",\"e\"],[[8338,8338],\"mapped\",\"o\"],[[8339,8339],\"mapped\",\"x\"],[[8340,8340],\"mapped\",\"ə\"],[[8341,8341],\"mapped\",\"h\"],[[8342,8342],\"mapped\",\"k\"],[[8343,8343],\"mapped\",\"l\"],[[8344,8344],\"mapped\",\"m\"],[[8345,8345],\"mapped\",\"n\"],[[8346,8346],\"mapped\",\"p\"],[[8347,8347],\"mapped\",\"s\"],[[8348,8348],\"mapped\",\"t\"],[[8349,8351],\"disallowed\"],[[8352,8359],\"valid\",\"\",\"NV8\"],[[8360,8360],\"mapped\",\"rs\"],[[8361,8362],\"valid\",\"\",\"NV8\"],[[8363,8363],\"valid\",\"\",\"NV8\"],[[8364,8364],\"valid\",\"\",\"NV8\"],[[8365,8367],\"valid\",\"\",\"NV8\"],[[8368,8369],\"valid\",\"\",\"NV8\"],[[8370,8373],\"valid\",\"\",\"NV8\"],[[8374,8376],\"valid\",\"\",\"NV8\"],[[8377,8377],\"valid\",\"\",\"NV8\"],[[8378,8378],\"valid\",\"\",\"NV8\"],[[8379,8381],\"valid\",\"\",\"NV8\"],[[8382,8382],\"valid\",\"\",\"NV8\"],[[8383,8383],\"valid\",\"\",\"NV8\"],[[8384,8399],\"disallowed\"],[[8400,8417],\"valid\",\"\",\"NV8\"],[[8418,8419],\"valid\",\"\",\"NV8\"],[[8420,8426],\"valid\",\"\",\"NV8\"],[[8427,8427],\"valid\",\"\",\"NV8\"],[[8428,8431],\"valid\",\"\",\"NV8\"],[[8432,8432],\"valid\",\"\",\"NV8\"],[[8433,8447],\"disallowed\"],[[8448,8448],\"disallowed_STD3_mapped\",\"a/c\"],[[8449,8449],\"disallowed_STD3_mapped\",\"a/s\"],[[8450,8450],\"mapped\",\"c\"],[[8451,8451],\"mapped\",\"°c\"],[[8452,8452],\"valid\",\"\",\"NV8\"],[[8453,8453],\"disallowed_STD3_mapped\",\"c/o\"],[[8454,8454],\"disallowed_STD3_mapped\",\"c/u\"],[[8455,8455],\"mapped\",\"ɛ\"],[[8456,8456],\"valid\",\"\",\"NV8\"],[[8457,8457],\"mapped\",\"°f\"],[[8458,8458],\"mapped\",\"g\"],[[8459,8462],\"mapped\",\"h\"],[[8463,8463],\"mapped\",\"ħ\"],[[8464,8465],\"mapped\",\"i\"],[[8466,8467],\"mapped\",\"l\"],[[8468,8468],\"valid\",\"\",\"NV8\"],[[8469,8469],\"mapped\",\"n\"],[[8470,8470],\"mapped\",\"no\"],[[8471,8472],\"valid\",\"\",\"NV8\"],[[8473,8473],\"mapped\",\"p\"],[[8474,8474],\"mapped\",\"q\"],[[8475,8477],\"mapped\",\"r\"],[[8478,8479],\"valid\",\"\",\"NV8\"],[[8480,8480],\"mapped\",\"sm\"],[[8481,8481],\"mapped\",\"tel\"],[[8482,8482],\"mapped\",\"tm\"],[[8483,8483],\"valid\",\"\",\"NV8\"],[[8484,8484],\"mapped\",\"z\"],[[8485,8485],\"valid\",\"\",\"NV8\"],[[8486,8486],\"mapped\",\"ω\"],[[8487,8487],\"valid\",\"\",\"NV8\"],[[8488,8488],\"mapped\",\"z\"],[[8489,8489],\"valid\",\"\",\"NV8\"],[[8490,8490],\"mapped\",\"k\"],[[8491,8491],\"mapped\",\"å\"],[[8492,8492],\"mapped\",\"b\"],[[8493,8493],\"mapped\",\"c\"],[[8494,8494],\"valid\",\"\",\"NV8\"],[[8495,8496],\"mapped\",\"e\"],[[8497,8497],\"mapped\",\"f\"],[[8498,8498],\"disallowed\"],[[8499,8499],\"mapped\",\"m\"],[[8500,8500],\"mapped\",\"o\"],[[8501,8501],\"mapped\",\"א\"],[[8502,8502],\"mapped\",\"ב\"],[[8503,8503],\"mapped\",\"ג\"],[[8504,8504],\"mapped\",\"ד\"],[[8505,8505],\"mapped\",\"i\"],[[8506,8506],\"valid\",\"\",\"NV8\"],[[8507,8507],\"mapped\",\"fax\"],[[8508,8508],\"mapped\",\"π\"],[[8509,8510],\"mapped\",\"γ\"],[[8511,8511],\"mapped\",\"π\"],[[8512,8512],\"mapped\",\"∑\"],[[8513,8516],\"valid\",\"\",\"NV8\"],[[8517,8518],\"mapped\",\"d\"],[[8519,8519],\"mapped\",\"e\"],[[8520,8520],\"mapped\",\"i\"],[[8521,8521],\"mapped\",\"j\"],[[8522,8523],\"valid\",\"\",\"NV8\"],[[8524,8524],\"valid\",\"\",\"NV8\"],[[8525,8525],\"valid\",\"\",\"NV8\"],[[8526,8526],\"valid\"],[[8527,8527],\"valid\",\"\",\"NV8\"],[[8528,8528],\"mapped\",\"1⁄7\"],[[8529,8529],\"mapped\",\"1⁄9\"],[[8530,8530],\"mapped\",\"1⁄10\"],[[8531,8531],\"mapped\",\"1⁄3\"],[[8532,8532],\"mapped\",\"2⁄3\"],[[8533,8533],\"mapped\",\"1⁄5\"],[[8534,8534],\"mapped\",\"2⁄5\"],[[8535,8535],\"mapped\",\"3⁄5\"],[[8536,8536],\"mapped\",\"4⁄5\"],[[8537,8537],\"mapped\",\"1⁄6\"],[[8538,8538],\"mapped\",\"5⁄6\"],[[8539,8539],\"mapped\",\"1⁄8\"],[[8540,8540],\"mapped\",\"3⁄8\"],[[8541,8541],\"mapped\",\"5⁄8\"],[[8542,8542],\"mapped\",\"7⁄8\"],[[8543,8543],\"mapped\",\"1⁄\"],[[8544,8544],\"mapped\",\"i\"],[[8545,8545],\"mapped\",\"ii\"],[[8546,8546],\"mapped\",\"iii\"],[[8547,8547],\"mapped\",\"iv\"],[[8548,8548],\"mapped\",\"v\"],[[8549,8549],\"mapped\",\"vi\"],[[8550,8550],\"mapped\",\"vii\"],[[8551,8551],\"mapped\",\"viii\"],[[8552,8552],\"mapped\",\"ix\"],[[8553,8553],\"mapped\",\"x\"],[[8554,8554],\"mapped\",\"xi\"],[[8555,8555],\"mapped\",\"xii\"],[[8556,8556],\"mapped\",\"l\"],[[8557,8557],\"mapped\",\"c\"],[[8558,8558],\"mapped\",\"d\"],[[8559,8559],\"mapped\",\"m\"],[[8560,8560],\"mapped\",\"i\"],[[8561,8561],\"mapped\",\"ii\"],[[8562,8562],\"mapped\",\"iii\"],[[8563,8563],\"mapped\",\"iv\"],[[8564,8564],\"mapped\",\"v\"],[[8565,8565],\"mapped\",\"vi\"],[[8566,8566],\"mapped\",\"vii\"],[[8567,8567],\"mapped\",\"viii\"],[[8568,8568],\"mapped\",\"ix\"],[[8569,8569],\"mapped\",\"x\"],[[8570,8570],\"mapped\",\"xi\"],[[8571,8571],\"mapped\",\"xii\"],[[8572,8572],\"mapped\",\"l\"],[[8573,8573],\"mapped\",\"c\"],[[8574,8574],\"mapped\",\"d\"],[[8575,8575],\"mapped\",\"m\"],[[8576,8578],\"valid\",\"\",\"NV8\"],[[8579,8579],\"disallowed\"],[[8580,8580],\"valid\"],[[8581,8584],\"valid\",\"\",\"NV8\"],[[8585,8585],\"mapped\",\"0⁄3\"],[[8586,8587],\"valid\",\"\",\"NV8\"],[[8588,8591],\"disallowed\"],[[8592,8682],\"valid\",\"\",\"NV8\"],[[8683,8691],\"valid\",\"\",\"NV8\"],[[8692,8703],\"valid\",\"\",\"NV8\"],[[8704,8747],\"valid\",\"\",\"NV8\"],[[8748,8748],\"mapped\",\"∫∫\"],[[8749,8749],\"mapped\",\"∫∫∫\"],[[8750,8750],\"valid\",\"\",\"NV8\"],[[8751,8751],\"mapped\",\"∮∮\"],[[8752,8752],\"mapped\",\"∮∮∮\"],[[8753,8799],\"valid\",\"\",\"NV8\"],[[8800,8800],\"disallowed_STD3_valid\"],[[8801,8813],\"valid\",\"\",\"NV8\"],[[8814,8815],\"disallowed_STD3_valid\"],[[8816,8945],\"valid\",\"\",\"NV8\"],[[8946,8959],\"valid\",\"\",\"NV8\"],[[8960,8960],\"valid\",\"\",\"NV8\"],[[8961,8961],\"valid\",\"\",\"NV8\"],[[8962,9000],\"valid\",\"\",\"NV8\"],[[9001,9001],\"mapped\",\"〈\"],[[9002,9002],\"mapped\",\"〉\"],[[9003,9082],\"valid\",\"\",\"NV8\"],[[9083,9083],\"valid\",\"\",\"NV8\"],[[9084,9084],\"valid\",\"\",\"NV8\"],[[9085,9114],\"valid\",\"\",\"NV8\"],[[9115,9166],\"valid\",\"\",\"NV8\"],[[9167,9168],\"valid\",\"\",\"NV8\"],[[9169,9179],\"valid\",\"\",\"NV8\"],[[9180,9191],\"valid\",\"\",\"NV8\"],[[9192,9192],\"valid\",\"\",\"NV8\"],[[9193,9203],\"valid\",\"\",\"NV8\"],[[9204,9210],\"valid\",\"\",\"NV8\"],[[9211,9214],\"valid\",\"\",\"NV8\"],[[9215,9215],\"valid\",\"\",\"NV8\"],[[9216,9252],\"valid\",\"\",\"NV8\"],[[9253,9254],\"valid\",\"\",\"NV8\"],[[9255,9279],\"disallowed\"],[[9280,9290],\"valid\",\"\",\"NV8\"],[[9291,9311],\"disallowed\"],[[9312,9312],\"mapped\",\"1\"],[[9313,9313],\"mapped\",\"2\"],[[9314,9314],\"mapped\",\"3\"],[[9315,9315],\"mapped\",\"4\"],[[9316,9316],\"mapped\",\"5\"],[[9317,9317],\"mapped\",\"6\"],[[9318,9318],\"mapped\",\"7\"],[[9319,9319],\"mapped\",\"8\"],[[9320,9320],\"mapped\",\"9\"],[[9321,9321],\"mapped\",\"10\"],[[9322,9322],\"mapped\",\"11\"],[[9323,9323],\"mapped\",\"12\"],[[9324,9324],\"mapped\",\"13\"],[[9325,9325],\"mapped\",\"14\"],[[9326,9326],\"mapped\",\"15\"],[[9327,9327],\"mapped\",\"16\"],[[9328,9328],\"mapped\",\"17\"],[[9329,9329],\"mapped\",\"18\"],[[9330,9330],\"mapped\",\"19\"],[[9331,9331],\"mapped\",\"20\"],[[9332,9332],\"disallowed_STD3_mapped\",\"(1)\"],[[9333,9333],\"disallowed_STD3_mapped\",\"(2)\"],[[9334,9334],\"disallowed_STD3_mapped\",\"(3)\"],[[9335,9335],\"disallowed_STD3_mapped\",\"(4)\"],[[9336,9336],\"disallowed_STD3_mapped\",\"(5)\"],[[9337,9337],\"disallowed_STD3_mapped\",\"(6)\"],[[9338,9338],\"disallowed_STD3_mapped\",\"(7)\"],[[9339,9339],\"disallowed_STD3_mapped\",\"(8)\"],[[9340,9340],\"disallowed_STD3_mapped\",\"(9)\"],[[9341,9341],\"disallowed_STD3_mapped\",\"(10)\"],[[9342,9342],\"disallowed_STD3_mapped\",\"(11)\"],[[9343,9343],\"disallowed_STD3_mapped\",\"(12)\"],[[9344,9344],\"disallowed_STD3_mapped\",\"(13)\"],[[9345,9345],\"disallowed_STD3_mapped\",\"(14)\"],[[9346,9346],\"disallowed_STD3_mapped\",\"(15)\"],[[9347,9347],\"disallowed_STD3_mapped\",\"(16)\"],[[9348,9348],\"disallowed_STD3_mapped\",\"(17)\"],[[9349,9349],\"disallowed_STD3_mapped\",\"(18)\"],[[9350,9350],\"disallowed_STD3_mapped\",\"(19)\"],[[9351,9351],\"disallowed_STD3_mapped\",\"(20)\"],[[9352,9371],\"disallowed\"],[[9372,9372],\"disallowed_STD3_mapped\",\"(a)\"],[[9373,9373],\"disallowed_STD3_mapped\",\"(b)\"],[[9374,9374],\"disallowed_STD3_mapped\",\"(c)\"],[[9375,9375],\"disallowed_STD3_mapped\",\"(d)\"],[[9376,9376],\"disallowed_STD3_mapped\",\"(e)\"],[[9377,9377],\"disallowed_STD3_mapped\",\"(f)\"],[[9378,9378],\"disallowed_STD3_mapped\",\"(g)\"],[[9379,9379],\"disallowed_STD3_mapped\",\"(h)\"],[[9380,9380],\"disallowed_STD3_mapped\",\"(i)\"],[[9381,9381],\"disallowed_STD3_mapped\",\"(j)\"],[[9382,9382],\"disallowed_STD3_mapped\",\"(k)\"],[[9383,9383],\"disallowed_STD3_mapped\",\"(l)\"],[[9384,9384],\"disallowed_STD3_mapped\",\"(m)\"],[[9385,9385],\"disallowed_STD3_mapped\",\"(n)\"],[[9386,9386],\"disallowed_STD3_mapped\",\"(o)\"],[[9387,9387],\"disallowed_STD3_mapped\",\"(p)\"],[[9388,9388],\"disallowed_STD3_mapped\",\"(q)\"],[[9389,9389],\"disallowed_STD3_mapped\",\"(r)\"],[[9390,9390],\"disallowed_STD3_mapped\",\"(s)\"],[[9391,9391],\"disallowed_STD3_mapped\",\"(t)\"],[[9392,9392],\"disallowed_STD3_mapped\",\"(u)\"],[[9393,9393],\"disallowed_STD3_mapped\",\"(v)\"],[[9394,9394],\"disallowed_STD3_mapped\",\"(w)\"],[[9395,9395],\"disallowed_STD3_mapped\",\"(x)\"],[[9396,9396],\"disallowed_STD3_mapped\",\"(y)\"],[[9397,9397],\"disallowed_STD3_mapped\",\"(z)\"],[[9398,9398],\"mapped\",\"a\"],[[9399,9399],\"mapped\",\"b\"],[[9400,9400],\"mapped\",\"c\"],[[9401,9401],\"mapped\",\"d\"],[[9402,9402],\"mapped\",\"e\"],[[9403,9403],\"mapped\",\"f\"],[[9404,9404],\"mapped\",\"g\"],[[9405,9405],\"mapped\",\"h\"],[[9406,9406],\"mapped\",\"i\"],[[9407,9407],\"mapped\",\"j\"],[[9408,9408],\"mapped\",\"k\"],[[9409,9409],\"mapped\",\"l\"],[[9410,9410],\"mapped\",\"m\"],[[9411,9411],\"mapped\",\"n\"],[[9412,9412],\"mapped\",\"o\"],[[9413,9413],\"mapped\",\"p\"],[[9414,9414],\"mapped\",\"q\"],[[9415,9415],\"mapped\",\"r\"],[[9416,9416],\"mapped\",\"s\"],[[9417,9417],\"mapped\",\"t\"],[[9418,9418],\"mapped\",\"u\"],[[9419,9419],\"mapped\",\"v\"],[[9420,9420],\"mapped\",\"w\"],[[9421,9421],\"mapped\",\"x\"],[[9422,9422],\"mapped\",\"y\"],[[9423,9423],\"mapped\",\"z\"],[[9424,9424],\"mapped\",\"a\"],[[9425,9425],\"mapped\",\"b\"],[[9426,9426],\"mapped\",\"c\"],[[9427,9427],\"mapped\",\"d\"],[[9428,9428],\"mapped\",\"e\"],[[9429,9429],\"mapped\",\"f\"],[[9430,9430],\"mapped\",\"g\"],[[9431,9431],\"mapped\",\"h\"],[[9432,9432],\"mapped\",\"i\"],[[9433,9433],\"mapped\",\"j\"],[[9434,9434],\"mapped\",\"k\"],[[9435,9435],\"mapped\",\"l\"],[[9436,9436],\"mapped\",\"m\"],[[9437,9437],\"mapped\",\"n\"],[[9438,9438],\"mapped\",\"o\"],[[9439,9439],\"mapped\",\"p\"],[[9440,9440],\"mapped\",\"q\"],[[9441,9441],\"mapped\",\"r\"],[[9442,9442],\"mapped\",\"s\"],[[9443,9443],\"mapped\",\"t\"],[[9444,9444],\"mapped\",\"u\"],[[9445,9445],\"mapped\",\"v\"],[[9446,9446],\"mapped\",\"w\"],[[9447,9447],\"mapped\",\"x\"],[[9448,9448],\"mapped\",\"y\"],[[9449,9449],\"mapped\",\"z\"],[[9450,9450],\"mapped\",\"0\"],[[9451,9470],\"valid\",\"\",\"NV8\"],[[9471,9471],\"valid\",\"\",\"NV8\"],[[9472,9621],\"valid\",\"\",\"NV8\"],[[9622,9631],\"valid\",\"\",\"NV8\"],[[9632,9711],\"valid\",\"\",\"NV8\"],[[9712,9719],\"valid\",\"\",\"NV8\"],[[9720,9727],\"valid\",\"\",\"NV8\"],[[9728,9747],\"valid\",\"\",\"NV8\"],[[9748,9749],\"valid\",\"\",\"NV8\"],[[9750,9751],\"valid\",\"\",\"NV8\"],[[9752,9752],\"valid\",\"\",\"NV8\"],[[9753,9753],\"valid\",\"\",\"NV8\"],[[9754,9839],\"valid\",\"\",\"NV8\"],[[9840,9841],\"valid\",\"\",\"NV8\"],[[9842,9853],\"valid\",\"\",\"NV8\"],[[9854,9855],\"valid\",\"\",\"NV8\"],[[9856,9865],\"valid\",\"\",\"NV8\"],[[9866,9873],\"valid\",\"\",\"NV8\"],[[9874,9884],\"valid\",\"\",\"NV8\"],[[9885,9885],\"valid\",\"\",\"NV8\"],[[9886,9887],\"valid\",\"\",\"NV8\"],[[9888,9889],\"valid\",\"\",\"NV8\"],[[9890,9905],\"valid\",\"\",\"NV8\"],[[9906,9906],\"valid\",\"\",\"NV8\"],[[9907,9916],\"valid\",\"\",\"NV8\"],[[9917,9919],\"valid\",\"\",\"NV8\"],[[9920,9923],\"valid\",\"\",\"NV8\"],[[9924,9933],\"valid\",\"\",\"NV8\"],[[9934,9934],\"valid\",\"\",\"NV8\"],[[9935,9953],\"valid\",\"\",\"NV8\"],[[9954,9954],\"valid\",\"\",\"NV8\"],[[9955,9955],\"valid\",\"\",\"NV8\"],[[9956,9959],\"valid\",\"\",\"NV8\"],[[9960,9983],\"valid\",\"\",\"NV8\"],[[9984,9984],\"valid\",\"\",\"NV8\"],[[9985,9988],\"valid\",\"\",\"NV8\"],[[9989,9989],\"valid\",\"\",\"NV8\"],[[9990,9993],\"valid\",\"\",\"NV8\"],[[9994,9995],\"valid\",\"\",\"NV8\"],[[9996,10023],\"valid\",\"\",\"NV8\"],[[10024,10024],\"valid\",\"\",\"NV8\"],[[10025,10059],\"valid\",\"\",\"NV8\"],[[10060,10060],\"valid\",\"\",\"NV8\"],[[10061,10061],\"valid\",\"\",\"NV8\"],[[10062,10062],\"valid\",\"\",\"NV8\"],[[10063,10066],\"valid\",\"\",\"NV8\"],[[10067,10069],\"valid\",\"\",\"NV8\"],[[10070,10070],\"valid\",\"\",\"NV8\"],[[10071,10071],\"valid\",\"\",\"NV8\"],[[10072,10078],\"valid\",\"\",\"NV8\"],[[10079,10080],\"valid\",\"\",\"NV8\"],[[10081,10087],\"valid\",\"\",\"NV8\"],[[10088,10101],\"valid\",\"\",\"NV8\"],[[10102,10132],\"valid\",\"\",\"NV8\"],[[10133,10135],\"valid\",\"\",\"NV8\"],[[10136,10159],\"valid\",\"\",\"NV8\"],[[10160,10160],\"valid\",\"\",\"NV8\"],[[10161,10174],\"valid\",\"\",\"NV8\"],[[10175,10175],\"valid\",\"\",\"NV8\"],[[10176,10182],\"valid\",\"\",\"NV8\"],[[10183,10186],\"valid\",\"\",\"NV8\"],[[10187,10187],\"valid\",\"\",\"NV8\"],[[10188,10188],\"valid\",\"\",\"NV8\"],[[10189,10189],\"valid\",\"\",\"NV8\"],[[10190,10191],\"valid\",\"\",\"NV8\"],[[10192,10219],\"valid\",\"\",\"NV8\"],[[10220,10223],\"valid\",\"\",\"NV8\"],[[10224,10239],\"valid\",\"\",\"NV8\"],[[10240,10495],\"valid\",\"\",\"NV8\"],[[10496,10763],\"valid\",\"\",\"NV8\"],[[10764,10764],\"mapped\",\"∫∫∫∫\"],[[10765,10867],\"valid\",\"\",\"NV8\"],[[10868,10868],\"disallowed_STD3_mapped\",\"::=\"],[[10869,10869],\"disallowed_STD3_mapped\",\"==\"],[[10870,10870],\"disallowed_STD3_mapped\",\"===\"],[[10871,10971],\"valid\",\"\",\"NV8\"],[[10972,10972],\"mapped\",\"⫝̸\"],[[10973,11007],\"valid\",\"\",\"NV8\"],[[11008,11021],\"valid\",\"\",\"NV8\"],[[11022,11027],\"valid\",\"\",\"NV8\"],[[11028,11034],\"valid\",\"\",\"NV8\"],[[11035,11039],\"valid\",\"\",\"NV8\"],[[11040,11043],\"valid\",\"\",\"NV8\"],[[11044,11084],\"valid\",\"\",\"NV8\"],[[11085,11087],\"valid\",\"\",\"NV8\"],[[11088,11092],\"valid\",\"\",\"NV8\"],[[11093,11097],\"valid\",\"\",\"NV8\"],[[11098,11123],\"valid\",\"\",\"NV8\"],[[11124,11125],\"disallowed\"],[[11126,11157],\"valid\",\"\",\"NV8\"],[[11158,11159],\"disallowed\"],[[11160,11193],\"valid\",\"\",\"NV8\"],[[11194,11196],\"disallowed\"],[[11197,11208],\"valid\",\"\",\"NV8\"],[[11209,11209],\"disallowed\"],[[11210,11217],\"valid\",\"\",\"NV8\"],[[11218,11218],\"valid\",\"\",\"NV8\"],[[11219,11243],\"disallowed\"],[[11244,11247],\"valid\",\"\",\"NV8\"],[[11248,11263],\"disallowed\"],[[11264,11264],\"mapped\",\"ⰰ\"],[[11265,11265],\"mapped\",\"ⰱ\"],[[11266,11266],\"mapped\",\"ⰲ\"],[[11267,11267],\"mapped\",\"ⰳ\"],[[11268,11268],\"mapped\",\"ⰴ\"],[[11269,11269],\"mapped\",\"ⰵ\"],[[11270,11270],\"mapped\",\"ⰶ\"],[[11271,11271],\"mapped\",\"ⰷ\"],[[11272,11272],\"mapped\",\"ⰸ\"],[[11273,11273],\"mapped\",\"ⰹ\"],[[11274,11274],\"mapped\",\"ⰺ\"],[[11275,11275],\"mapped\",\"ⰻ\"],[[11276,11276],\"mapped\",\"ⰼ\"],[[11277,11277],\"mapped\",\"ⰽ\"],[[11278,11278],\"mapped\",\"ⰾ\"],[[11279,11279],\"mapped\",\"ⰿ\"],[[11280,11280],\"mapped\",\"ⱀ\"],[[11281,11281],\"mapped\",\"ⱁ\"],[[11282,11282],\"mapped\",\"ⱂ\"],[[11283,11283],\"mapped\",\"ⱃ\"],[[11284,11284],\"mapped\",\"ⱄ\"],[[11285,11285],\"mapped\",\"ⱅ\"],[[11286,11286],\"mapped\",\"ⱆ\"],[[11287,11287],\"mapped\",\"ⱇ\"],[[11288,11288],\"mapped\",\"ⱈ\"],[[11289,11289],\"mapped\",\"ⱉ\"],[[11290,11290],\"mapped\",\"ⱊ\"],[[11291,11291],\"mapped\",\"ⱋ\"],[[11292,11292],\"mapped\",\"ⱌ\"],[[11293,11293],\"mapped\",\"ⱍ\"],[[11294,11294],\"mapped\",\"ⱎ\"],[[11295,11295],\"mapped\",\"ⱏ\"],[[11296,11296],\"mapped\",\"ⱐ\"],[[11297,11297],\"mapped\",\"ⱑ\"],[[11298,11298],\"mapped\",\"ⱒ\"],[[11299,11299],\"mapped\",\"ⱓ\"],[[11300,11300],\"mapped\",\"ⱔ\"],[[11301,11301],\"mapped\",\"ⱕ\"],[[11302,11302],\"mapped\",\"ⱖ\"],[[11303,11303],\"mapped\",\"ⱗ\"],[[11304,11304],\"mapped\",\"ⱘ\"],[[11305,11305],\"mapped\",\"ⱙ\"],[[11306,11306],\"mapped\",\"ⱚ\"],[[11307,11307],\"mapped\",\"ⱛ\"],[[11308,11308],\"mapped\",\"ⱜ\"],[[11309,11309],\"mapped\",\"ⱝ\"],[[11310,11310],\"mapped\",\"ⱞ\"],[[11311,11311],\"disallowed\"],[[11312,11358],\"valid\"],[[11359,11359],\"disallowed\"],[[11360,11360],\"mapped\",\"ⱡ\"],[[11361,11361],\"valid\"],[[11362,11362],\"mapped\",\"ɫ\"],[[11363,11363],\"mapped\",\"ᵽ\"],[[11364,11364],\"mapped\",\"ɽ\"],[[11365,11366],\"valid\"],[[11367,11367],\"mapped\",\"ⱨ\"],[[11368,11368],\"valid\"],[[11369,11369],\"mapped\",\"ⱪ\"],[[11370,11370],\"valid\"],[[11371,11371],\"mapped\",\"ⱬ\"],[[11372,11372],\"valid\"],[[11373,11373],\"mapped\",\"ɑ\"],[[11374,11374],\"mapped\",\"ɱ\"],[[11375,11375],\"mapped\",\"ɐ\"],[[11376,11376],\"mapped\",\"ɒ\"],[[11377,11377],\"valid\"],[[11378,11378],\"mapped\",\"ⱳ\"],[[11379,11379],\"valid\"],[[11380,11380],\"valid\"],[[11381,11381],\"mapped\",\"ⱶ\"],[[11382,11383],\"valid\"],[[11384,11387],\"valid\"],[[11388,11388],\"mapped\",\"j\"],[[11389,11389],\"mapped\",\"v\"],[[11390,11390],\"mapped\",\"ȿ\"],[[11391,11391],\"mapped\",\"ɀ\"],[[11392,11392],\"mapped\",\"ⲁ\"],[[11393,11393],\"valid\"],[[11394,11394],\"mapped\",\"ⲃ\"],[[11395,11395],\"valid\"],[[11396,11396],\"mapped\",\"ⲅ\"],[[11397,11397],\"valid\"],[[11398,11398],\"mapped\",\"ⲇ\"],[[11399,11399],\"valid\"],[[11400,11400],\"mapped\",\"ⲉ\"],[[11401,11401],\"valid\"],[[11402,11402],\"mapped\",\"ⲋ\"],[[11403,11403],\"valid\"],[[11404,11404],\"mapped\",\"ⲍ\"],[[11405,11405],\"valid\"],[[11406,11406],\"mapped\",\"ⲏ\"],[[11407,11407],\"valid\"],[[11408,11408],\"mapped\",\"ⲑ\"],[[11409,11409],\"valid\"],[[11410,11410],\"mapped\",\"ⲓ\"],[[11411,11411],\"valid\"],[[11412,11412],\"mapped\",\"ⲕ\"],[[11413,11413],\"valid\"],[[11414,11414],\"mapped\",\"ⲗ\"],[[11415,11415],\"valid\"],[[11416,11416],\"mapped\",\"ⲙ\"],[[11417,11417],\"valid\"],[[11418,11418],\"mapped\",\"ⲛ\"],[[11419,11419],\"valid\"],[[11420,11420],\"mapped\",\"ⲝ\"],[[11421,11421],\"valid\"],[[11422,11422],\"mapped\",\"ⲟ\"],[[11423,11423],\"valid\"],[[11424,11424],\"mapped\",\"ⲡ\"],[[11425,11425],\"valid\"],[[11426,11426],\"mapped\",\"ⲣ\"],[[11427,11427],\"valid\"],[[11428,11428],\"mapped\",\"ⲥ\"],[[11429,11429],\"valid\"],[[11430,11430],\"mapped\",\"ⲧ\"],[[11431,11431],\"valid\"],[[11432,11432],\"mapped\",\"ⲩ\"],[[11433,11433],\"valid\"],[[11434,11434],\"mapped\",\"ⲫ\"],[[11435,11435],\"valid\"],[[11436,11436],\"mapped\",\"ⲭ\"],[[11437,11437],\"valid\"],[[11438,11438],\"mapped\",\"ⲯ\"],[[11439,11439],\"valid\"],[[11440,11440],\"mapped\",\"ⲱ\"],[[11441,11441],\"valid\"],[[11442,11442],\"mapped\",\"ⲳ\"],[[11443,11443],\"valid\"],[[11444,11444],\"mapped\",\"ⲵ\"],[[11445,11445],\"valid\"],[[11446,11446],\"mapped\",\"ⲷ\"],[[11447,11447],\"valid\"],[[11448,11448],\"mapped\",\"ⲹ\"],[[11449,11449],\"valid\"],[[11450,11450],\"mapped\",\"ⲻ\"],[[11451,11451],\"valid\"],[[11452,11452],\"mapped\",\"ⲽ\"],[[11453,11453],\"valid\"],[[11454,11454],\"mapped\",\"ⲿ\"],[[11455,11455],\"valid\"],[[11456,11456],\"mapped\",\"ⳁ\"],[[11457,11457],\"valid\"],[[11458,11458],\"mapped\",\"ⳃ\"],[[11459,11459],\"valid\"],[[11460,11460],\"mapped\",\"ⳅ\"],[[11461,11461],\"valid\"],[[11462,11462],\"mapped\",\"ⳇ\"],[[11463,11463],\"valid\"],[[11464,11464],\"mapped\",\"ⳉ\"],[[11465,11465],\"valid\"],[[11466,11466],\"mapped\",\"ⳋ\"],[[11467,11467],\"valid\"],[[11468,11468],\"mapped\",\"ⳍ\"],[[11469,11469],\"valid\"],[[11470,11470],\"mapped\",\"ⳏ\"],[[11471,11471],\"valid\"],[[11472,11472],\"mapped\",\"ⳑ\"],[[11473,11473],\"valid\"],[[11474,11474],\"mapped\",\"ⳓ\"],[[11475,11475],\"valid\"],[[11476,11476],\"mapped\",\"ⳕ\"],[[11477,11477],\"valid\"],[[11478,11478],\"mapped\",\"ⳗ\"],[[11479,11479],\"valid\"],[[11480,11480],\"mapped\",\"ⳙ\"],[[11481,11481],\"valid\"],[[11482,11482],\"mapped\",\"ⳛ\"],[[11483,11483],\"valid\"],[[11484,11484],\"mapped\",\"ⳝ\"],[[11485,11485],\"valid\"],[[11486,11486],\"mapped\",\"ⳟ\"],[[11487,11487],\"valid\"],[[11488,11488],\"mapped\",\"ⳡ\"],[[11489,11489],\"valid\"],[[11490,11490],\"mapped\",\"ⳣ\"],[[11491,11492],\"valid\"],[[11493,11498],\"valid\",\"\",\"NV8\"],[[11499,11499],\"mapped\",\"ⳬ\"],[[11500,11500],\"valid\"],[[11501,11501],\"mapped\",\"ⳮ\"],[[11502,11505],\"valid\"],[[11506,11506],\"mapped\",\"ⳳ\"],[[11507,11507],\"valid\"],[[11508,11512],\"disallowed\"],[[11513,11519],\"valid\",\"\",\"NV8\"],[[11520,11557],\"valid\"],[[11558,11558],\"disallowed\"],[[11559,11559],\"valid\"],[[11560,11564],\"disallowed\"],[[11565,11565],\"valid\"],[[11566,11567],\"disallowed\"],[[11568,11621],\"valid\"],[[11622,11623],\"valid\"],[[11624,11630],\"disallowed\"],[[11631,11631],\"mapped\",\"ⵡ\"],[[11632,11632],\"valid\",\"\",\"NV8\"],[[11633,11646],\"disallowed\"],[[11647,11647],\"valid\"],[[11648,11670],\"valid\"],[[11671,11679],\"disallowed\"],[[11680,11686],\"valid\"],[[11687,11687],\"disallowed\"],[[11688,11694],\"valid\"],[[11695,11695],\"disallowed\"],[[11696,11702],\"valid\"],[[11703,11703],\"disallowed\"],[[11704,11710],\"valid\"],[[11711,11711],\"disallowed\"],[[11712,11718],\"valid\"],[[11719,11719],\"disallowed\"],[[11720,11726],\"valid\"],[[11727,11727],\"disallowed\"],[[11728,11734],\"valid\"],[[11735,11735],\"disallowed\"],[[11736,11742],\"valid\"],[[11743,11743],\"disallowed\"],[[11744,11775],\"valid\"],[[11776,11799],\"valid\",\"\",\"NV8\"],[[11800,11803],\"valid\",\"\",\"NV8\"],[[11804,11805],\"valid\",\"\",\"NV8\"],[[11806,11822],\"valid\",\"\",\"NV8\"],[[11823,11823],\"valid\"],[[11824,11824],\"valid\",\"\",\"NV8\"],[[11825,11825],\"valid\",\"\",\"NV8\"],[[11826,11835],\"valid\",\"\",\"NV8\"],[[11836,11842],\"valid\",\"\",\"NV8\"],[[11843,11844],\"valid\",\"\",\"NV8\"],[[11845,11849],\"valid\",\"\",\"NV8\"],[[11850,11903],\"disallowed\"],[[11904,11929],\"valid\",\"\",\"NV8\"],[[11930,11930],\"disallowed\"],[[11931,11934],\"valid\",\"\",\"NV8\"],[[11935,11935],\"mapped\",\"母\"],[[11936,12018],\"valid\",\"\",\"NV8\"],[[12019,12019],\"mapped\",\"龟\"],[[12020,12031],\"disallowed\"],[[12032,12032],\"mapped\",\"一\"],[[12033,12033],\"mapped\",\"丨\"],[[12034,12034],\"mapped\",\"丶\"],[[12035,12035],\"mapped\",\"丿\"],[[12036,12036],\"mapped\",\"乙\"],[[12037,12037],\"mapped\",\"亅\"],[[12038,12038],\"mapped\",\"二\"],[[12039,12039],\"mapped\",\"亠\"],[[12040,12040],\"mapped\",\"人\"],[[12041,12041],\"mapped\",\"儿\"],[[12042,12042],\"mapped\",\"入\"],[[12043,12043],\"mapped\",\"八\"],[[12044,12044],\"mapped\",\"冂\"],[[12045,12045],\"mapped\",\"冖\"],[[12046,12046],\"mapped\",\"冫\"],[[12047,12047],\"mapped\",\"几\"],[[12048,12048],\"mapped\",\"凵\"],[[12049,12049],\"mapped\",\"刀\"],[[12050,12050],\"mapped\",\"力\"],[[12051,12051],\"mapped\",\"勹\"],[[12052,12052],\"mapped\",\"匕\"],[[12053,12053],\"mapped\",\"匚\"],[[12054,12054],\"mapped\",\"匸\"],[[12055,12055],\"mapped\",\"十\"],[[12056,12056],\"mapped\",\"卜\"],[[12057,12057],\"mapped\",\"卩\"],[[12058,12058],\"mapped\",\"厂\"],[[12059,12059],\"mapped\",\"厶\"],[[12060,12060],\"mapped\",\"又\"],[[12061,12061],\"mapped\",\"口\"],[[12062,12062],\"mapped\",\"囗\"],[[12063,12063],\"mapped\",\"土\"],[[12064,12064],\"mapped\",\"士\"],[[12065,12065],\"mapped\",\"夂\"],[[12066,12066],\"mapped\",\"夊\"],[[12067,12067],\"mapped\",\"夕\"],[[12068,12068],\"mapped\",\"大\"],[[12069,12069],\"mapped\",\"女\"],[[12070,12070],\"mapped\",\"子\"],[[12071,12071],\"mapped\",\"宀\"],[[12072,12072],\"mapped\",\"寸\"],[[12073,12073],\"mapped\",\"小\"],[[12074,12074],\"mapped\",\"尢\"],[[12075,12075],\"mapped\",\"尸\"],[[12076,12076],\"mapped\",\"屮\"],[[12077,12077],\"mapped\",\"山\"],[[12078,12078],\"mapped\",\"巛\"],[[12079,12079],\"mapped\",\"工\"],[[12080,12080],\"mapped\",\"己\"],[[12081,12081],\"mapped\",\"巾\"],[[12082,12082],\"mapped\",\"干\"],[[12083,12083],\"mapped\",\"幺\"],[[12084,12084],\"mapped\",\"广\"],[[12085,12085],\"mapped\",\"廴\"],[[12086,12086],\"mapped\",\"廾\"],[[12087,12087],\"mapped\",\"弋\"],[[12088,12088],\"mapped\",\"弓\"],[[12089,12089],\"mapped\",\"彐\"],[[12090,12090],\"mapped\",\"彡\"],[[12091,12091],\"mapped\",\"彳\"],[[12092,12092],\"mapped\",\"心\"],[[12093,12093],\"mapped\",\"戈\"],[[12094,12094],\"mapped\",\"戶\"],[[12095,12095],\"mapped\",\"手\"],[[12096,12096],\"mapped\",\"支\"],[[12097,12097],\"mapped\",\"攴\"],[[12098,12098],\"mapped\",\"文\"],[[12099,12099],\"mapped\",\"斗\"],[[12100,12100],\"mapped\",\"斤\"],[[12101,12101],\"mapped\",\"方\"],[[12102,12102],\"mapped\",\"无\"],[[12103,12103],\"mapped\",\"日\"],[[12104,12104],\"mapped\",\"曰\"],[[12105,12105],\"mapped\",\"月\"],[[12106,12106],\"mapped\",\"木\"],[[12107,12107],\"mapped\",\"欠\"],[[12108,12108],\"mapped\",\"止\"],[[12109,12109],\"mapped\",\"歹\"],[[12110,12110],\"mapped\",\"殳\"],[[12111,12111],\"mapped\",\"毋\"],[[12112,12112],\"mapped\",\"比\"],[[12113,12113],\"mapped\",\"毛\"],[[12114,12114],\"mapped\",\"氏\"],[[12115,12115],\"mapped\",\"气\"],[[12116,12116],\"mapped\",\"水\"],[[12117,12117],\"mapped\",\"火\"],[[12118,12118],\"mapped\",\"爪\"],[[12119,12119],\"mapped\",\"父\"],[[12120,12120],\"mapped\",\"爻\"],[[12121,12121],\"mapped\",\"爿\"],[[12122,12122],\"mapped\",\"片\"],[[12123,12123],\"mapped\",\"牙\"],[[12124,12124],\"mapped\",\"牛\"],[[12125,12125],\"mapped\",\"犬\"],[[12126,12126],\"mapped\",\"玄\"],[[12127,12127],\"mapped\",\"玉\"],[[12128,12128],\"mapped\",\"瓜\"],[[12129,12129],\"mapped\",\"瓦\"],[[12130,12130],\"mapped\",\"甘\"],[[12131,12131],\"mapped\",\"生\"],[[12132,12132],\"mapped\",\"用\"],[[12133,12133],\"mapped\",\"田\"],[[12134,12134],\"mapped\",\"疋\"],[[12135,12135],\"mapped\",\"疒\"],[[12136,12136],\"mapped\",\"癶\"],[[12137,12137],\"mapped\",\"白\"],[[12138,12138],\"mapped\",\"皮\"],[[12139,12139],\"mapped\",\"皿\"],[[12140,12140],\"mapped\",\"目\"],[[12141,12141],\"mapped\",\"矛\"],[[12142,12142],\"mapped\",\"矢\"],[[12143,12143],\"mapped\",\"石\"],[[12144,12144],\"mapped\",\"示\"],[[12145,12145],\"mapped\",\"禸\"],[[12146,12146],\"mapped\",\"禾\"],[[12147,12147],\"mapped\",\"穴\"],[[12148,12148],\"mapped\",\"立\"],[[12149,12149],\"mapped\",\"竹\"],[[12150,12150],\"mapped\",\"米\"],[[12151,12151],\"mapped\",\"糸\"],[[12152,12152],\"mapped\",\"缶\"],[[12153,12153],\"mapped\",\"网\"],[[12154,12154],\"mapped\",\"羊\"],[[12155,12155],\"mapped\",\"羽\"],[[12156,12156],\"mapped\",\"老\"],[[12157,12157],\"mapped\",\"而\"],[[12158,12158],\"mapped\",\"耒\"],[[12159,12159],\"mapped\",\"耳\"],[[12160,12160],\"mapped\",\"聿\"],[[12161,12161],\"mapped\",\"肉\"],[[12162,12162],\"mapped\",\"臣\"],[[12163,12163],\"mapped\",\"自\"],[[12164,12164],\"mapped\",\"至\"],[[12165,12165],\"mapped\",\"臼\"],[[12166,12166],\"mapped\",\"舌\"],[[12167,12167],\"mapped\",\"舛\"],[[12168,12168],\"mapped\",\"舟\"],[[12169,12169],\"mapped\",\"艮\"],[[12170,12170],\"mapped\",\"色\"],[[12171,12171],\"mapped\",\"艸\"],[[12172,12172],\"mapped\",\"虍\"],[[12173,12173],\"mapped\",\"虫\"],[[12174,12174],\"mapped\",\"血\"],[[12175,12175],\"mapped\",\"行\"],[[12176,12176],\"mapped\",\"衣\"],[[12177,12177],\"mapped\",\"襾\"],[[12178,12178],\"mapped\",\"見\"],[[12179,12179],\"mapped\",\"角\"],[[12180,12180],\"mapped\",\"言\"],[[12181,12181],\"mapped\",\"谷\"],[[12182,12182],\"mapped\",\"豆\"],[[12183,12183],\"mapped\",\"豕\"],[[12184,12184],\"mapped\",\"豸\"],[[12185,12185],\"mapped\",\"貝\"],[[12186,12186],\"mapped\",\"赤\"],[[12187,12187],\"mapped\",\"走\"],[[12188,12188],\"mapped\",\"足\"],[[12189,12189],\"mapped\",\"身\"],[[12190,12190],\"mapped\",\"車\"],[[12191,12191],\"mapped\",\"辛\"],[[12192,12192],\"mapped\",\"辰\"],[[12193,12193],\"mapped\",\"辵\"],[[12194,12194],\"mapped\",\"邑\"],[[12195,12195],\"mapped\",\"酉\"],[[12196,12196],\"mapped\",\"釆\"],[[12197,12197],\"mapped\",\"里\"],[[12198,12198],\"mapped\",\"金\"],[[12199,12199],\"mapped\",\"長\"],[[12200,12200],\"mapped\",\"門\"],[[12201,12201],\"mapped\",\"阜\"],[[12202,12202],\"mapped\",\"隶\"],[[12203,12203],\"mapped\",\"隹\"],[[12204,12204],\"mapped\",\"雨\"],[[12205,12205],\"mapped\",\"靑\"],[[12206,12206],\"mapped\",\"非\"],[[12207,12207],\"mapped\",\"面\"],[[12208,12208],\"mapped\",\"革\"],[[12209,12209],\"mapped\",\"韋\"],[[12210,12210],\"mapped\",\"韭\"],[[12211,12211],\"mapped\",\"音\"],[[12212,12212],\"mapped\",\"頁\"],[[12213,12213],\"mapped\",\"風\"],[[12214,12214],\"mapped\",\"飛\"],[[12215,12215],\"mapped\",\"食\"],[[12216,12216],\"mapped\",\"首\"],[[12217,12217],\"mapped\",\"香\"],[[12218,12218],\"mapped\",\"馬\"],[[12219,12219],\"mapped\",\"骨\"],[[12220,12220],\"mapped\",\"高\"],[[12221,12221],\"mapped\",\"髟\"],[[12222,12222],\"mapped\",\"鬥\"],[[12223,12223],\"mapped\",\"鬯\"],[[12224,12224],\"mapped\",\"鬲\"],[[12225,12225],\"mapped\",\"鬼\"],[[12226,12226],\"mapped\",\"魚\"],[[12227,12227],\"mapped\",\"鳥\"],[[12228,12228],\"mapped\",\"鹵\"],[[12229,12229],\"mapped\",\"鹿\"],[[12230,12230],\"mapped\",\"麥\"],[[12231,12231],\"mapped\",\"麻\"],[[12232,12232],\"mapped\",\"黃\"],[[12233,12233],\"mapped\",\"黍\"],[[12234,12234],\"mapped\",\"黑\"],[[12235,12235],\"mapped\",\"黹\"],[[12236,12236],\"mapped\",\"黽\"],[[12237,12237],\"mapped\",\"鼎\"],[[12238,12238],\"mapped\",\"鼓\"],[[12239,12239],\"mapped\",\"鼠\"],[[12240,12240],\"mapped\",\"鼻\"],[[12241,12241],\"mapped\",\"齊\"],[[12242,12242],\"mapped\",\"齒\"],[[12243,12243],\"mapped\",\"龍\"],[[12244,12244],\"mapped\",\"龜\"],[[12245,12245],\"mapped\",\"龠\"],[[12246,12271],\"disallowed\"],[[12272,12283],\"disallowed\"],[[12284,12287],\"disallowed\"],[[12288,12288],\"disallowed_STD3_mapped\",\" \"],[[12289,12289],\"valid\",\"\",\"NV8\"],[[12290,12290],\"mapped\",\".\"],[[12291,12292],\"valid\",\"\",\"NV8\"],[[12293,12295],\"valid\"],[[12296,12329],\"valid\",\"\",\"NV8\"],[[12330,12333],\"valid\"],[[12334,12341],\"valid\",\"\",\"NV8\"],[[12342,12342],\"mapped\",\"〒\"],[[12343,12343],\"valid\",\"\",\"NV8\"],[[12344,12344],\"mapped\",\"十\"],[[12345,12345],\"mapped\",\"卄\"],[[12346,12346],\"mapped\",\"卅\"],[[12347,12347],\"valid\",\"\",\"NV8\"],[[12348,12348],\"valid\"],[[12349,12349],\"valid\",\"\",\"NV8\"],[[12350,12350],\"valid\",\"\",\"NV8\"],[[12351,12351],\"valid\",\"\",\"NV8\"],[[12352,12352],\"disallowed\"],[[12353,12436],\"valid\"],[[12437,12438],\"valid\"],[[12439,12440],\"disallowed\"],[[12441,12442],\"valid\"],[[12443,12443],\"disallowed_STD3_mapped\",\" ゙\"],[[12444,12444],\"disallowed_STD3_mapped\",\" ゚\"],[[12445,12446],\"valid\"],[[12447,12447],\"mapped\",\"より\"],[[12448,12448],\"valid\",\"\",\"NV8\"],[[12449,12542],\"valid\"],[[12543,12543],\"mapped\",\"コト\"],[[12544,12548],\"disallowed\"],[[12549,12588],\"valid\"],[[12589,12589],\"valid\"],[[12590,12590],\"valid\"],[[12591,12592],\"disallowed\"],[[12593,12593],\"mapped\",\"ᄀ\"],[[12594,12594],\"mapped\",\"ᄁ\"],[[12595,12595],\"mapped\",\"ᆪ\"],[[12596,12596],\"mapped\",\"ᄂ\"],[[12597,12597],\"mapped\",\"ᆬ\"],[[12598,12598],\"mapped\",\"ᆭ\"],[[12599,12599],\"mapped\",\"ᄃ\"],[[12600,12600],\"mapped\",\"ᄄ\"],[[12601,12601],\"mapped\",\"ᄅ\"],[[12602,12602],\"mapped\",\"ᆰ\"],[[12603,12603],\"mapped\",\"ᆱ\"],[[12604,12604],\"mapped\",\"ᆲ\"],[[12605,12605],\"mapped\",\"ᆳ\"],[[12606,12606],\"mapped\",\"ᆴ\"],[[12607,12607],\"mapped\",\"ᆵ\"],[[12608,12608],\"mapped\",\"ᄚ\"],[[12609,12609],\"mapped\",\"ᄆ\"],[[12610,12610],\"mapped\",\"ᄇ\"],[[12611,12611],\"mapped\",\"ᄈ\"],[[12612,12612],\"mapped\",\"ᄡ\"],[[12613,12613],\"mapped\",\"ᄉ\"],[[12614,12614],\"mapped\",\"ᄊ\"],[[12615,12615],\"mapped\",\"ᄋ\"],[[12616,12616],\"mapped\",\"ᄌ\"],[[12617,12617],\"mapped\",\"ᄍ\"],[[12618,12618],\"mapped\",\"ᄎ\"],[[12619,12619],\"mapped\",\"ᄏ\"],[[12620,12620],\"mapped\",\"ᄐ\"],[[12621,12621],\"mapped\",\"ᄑ\"],[[12622,12622],\"mapped\",\"ᄒ\"],[[12623,12623],\"mapped\",\"ᅡ\"],[[12624,12624],\"mapped\",\"ᅢ\"],[[12625,12625],\"mapped\",\"ᅣ\"],[[12626,12626],\"mapped\",\"ᅤ\"],[[12627,12627],\"mapped\",\"ᅥ\"],[[12628,12628],\"mapped\",\"ᅦ\"],[[12629,12629],\"mapped\",\"ᅧ\"],[[12630,12630],\"mapped\",\"ᅨ\"],[[12631,12631],\"mapped\",\"ᅩ\"],[[12632,12632],\"mapped\",\"ᅪ\"],[[12633,12633],\"mapped\",\"ᅫ\"],[[12634,12634],\"mapped\",\"ᅬ\"],[[12635,12635],\"mapped\",\"ᅭ\"],[[12636,12636],\"mapped\",\"ᅮ\"],[[12637,12637],\"mapped\",\"ᅯ\"],[[12638,12638],\"mapped\",\"ᅰ\"],[[12639,12639],\"mapped\",\"ᅱ\"],[[12640,12640],\"mapped\",\"ᅲ\"],[[12641,12641],\"mapped\",\"ᅳ\"],[[12642,12642],\"mapped\",\"ᅴ\"],[[12643,12643],\"mapped\",\"ᅵ\"],[[12644,12644],\"disallowed\"],[[12645,12645],\"mapped\",\"ᄔ\"],[[12646,12646],\"mapped\",\"ᄕ\"],[[12647,12647],\"mapped\",\"ᇇ\"],[[12648,12648],\"mapped\",\"ᇈ\"],[[12649,12649],\"mapped\",\"ᇌ\"],[[12650,12650],\"mapped\",\"ᇎ\"],[[12651,12651],\"mapped\",\"ᇓ\"],[[12652,12652],\"mapped\",\"ᇗ\"],[[12653,12653],\"mapped\",\"ᇙ\"],[[12654,12654],\"mapped\",\"ᄜ\"],[[12655,12655],\"mapped\",\"ᇝ\"],[[12656,12656],\"mapped\",\"ᇟ\"],[[12657,12657],\"mapped\",\"ᄝ\"],[[12658,12658],\"mapped\",\"ᄞ\"],[[12659,12659],\"mapped\",\"ᄠ\"],[[12660,12660],\"mapped\",\"ᄢ\"],[[12661,12661],\"mapped\",\"ᄣ\"],[[12662,12662],\"mapped\",\"ᄧ\"],[[12663,12663],\"mapped\",\"ᄩ\"],[[12664,12664],\"mapped\",\"ᄫ\"],[[12665,12665],\"mapped\",\"ᄬ\"],[[12666,12666],\"mapped\",\"ᄭ\"],[[12667,12667],\"mapped\",\"ᄮ\"],[[12668,12668],\"mapped\",\"ᄯ\"],[[12669,12669],\"mapped\",\"ᄲ\"],[[12670,12670],\"mapped\",\"ᄶ\"],[[12671,12671],\"mapped\",\"ᅀ\"],[[12672,12672],\"mapped\",\"ᅇ\"],[[12673,12673],\"mapped\",\"ᅌ\"],[[12674,12674],\"mapped\",\"ᇱ\"],[[12675,12675],\"mapped\",\"ᇲ\"],[[12676,12676],\"mapped\",\"ᅗ\"],[[12677,12677],\"mapped\",\"ᅘ\"],[[12678,12678],\"mapped\",\"ᅙ\"],[[12679,12679],\"mapped\",\"ᆄ\"],[[12680,12680],\"mapped\",\"ᆅ\"],[[12681,12681],\"mapped\",\"ᆈ\"],[[12682,12682],\"mapped\",\"ᆑ\"],[[12683,12683],\"mapped\",\"ᆒ\"],[[12684,12684],\"mapped\",\"ᆔ\"],[[12685,12685],\"mapped\",\"ᆞ\"],[[12686,12686],\"mapped\",\"ᆡ\"],[[12687,12687],\"disallowed\"],[[12688,12689],\"valid\",\"\",\"NV8\"],[[12690,12690],\"mapped\",\"一\"],[[12691,12691],\"mapped\",\"二\"],[[12692,12692],\"mapped\",\"三\"],[[12693,12693],\"mapped\",\"四\"],[[12694,12694],\"mapped\",\"上\"],[[12695,12695],\"mapped\",\"中\"],[[12696,12696],\"mapped\",\"下\"],[[12697,12697],\"mapped\",\"甲\"],[[12698,12698],\"mapped\",\"乙\"],[[12699,12699],\"mapped\",\"丙\"],[[12700,12700],\"mapped\",\"丁\"],[[12701,12701],\"mapped\",\"天\"],[[12702,12702],\"mapped\",\"地\"],[[12703,12703],\"mapped\",\"人\"],[[12704,12727],\"valid\"],[[12728,12730],\"valid\"],[[12731,12735],\"disallowed\"],[[12736,12751],\"valid\",\"\",\"NV8\"],[[12752,12771],\"valid\",\"\",\"NV8\"],[[12772,12783],\"disallowed\"],[[12784,12799],\"valid\"],[[12800,12800],\"disallowed_STD3_mapped\",\"(ᄀ)\"],[[12801,12801],\"disallowed_STD3_mapped\",\"(ᄂ)\"],[[12802,12802],\"disallowed_STD3_mapped\",\"(ᄃ)\"],[[12803,12803],\"disallowed_STD3_mapped\",\"(ᄅ)\"],[[12804,12804],\"disallowed_STD3_mapped\",\"(ᄆ)\"],[[12805,12805],\"disallowed_STD3_mapped\",\"(ᄇ)\"],[[12806,12806],\"disallowed_STD3_mapped\",\"(ᄉ)\"],[[12807,12807],\"disallowed_STD3_mapped\",\"(ᄋ)\"],[[12808,12808],\"disallowed_STD3_mapped\",\"(ᄌ)\"],[[12809,12809],\"disallowed_STD3_mapped\",\"(ᄎ)\"],[[12810,12810],\"disallowed_STD3_mapped\",\"(ᄏ)\"],[[12811,12811],\"disallowed_STD3_mapped\",\"(ᄐ)\"],[[12812,12812],\"disallowed_STD3_mapped\",\"(ᄑ)\"],[[12813,12813],\"disallowed_STD3_mapped\",\"(ᄒ)\"],[[12814,12814],\"disallowed_STD3_mapped\",\"(가)\"],[[12815,12815],\"disallowed_STD3_mapped\",\"(나)\"],[[12816,12816],\"disallowed_STD3_mapped\",\"(다)\"],[[12817,12817],\"disallowed_STD3_mapped\",\"(라)\"],[[12818,12818],\"disallowed_STD3_mapped\",\"(마)\"],[[12819,12819],\"disallowed_STD3_mapped\",\"(바)\"],[[12820,12820],\"disallowed_STD3_mapped\",\"(사)\"],[[12821,12821],\"disallowed_STD3_mapped\",\"(아)\"],[[12822,12822],\"disallowed_STD3_mapped\",\"(자)\"],[[12823,12823],\"disallowed_STD3_mapped\",\"(차)\"],[[12824,12824],\"disallowed_STD3_mapped\",\"(카)\"],[[12825,12825],\"disallowed_STD3_mapped\",\"(타)\"],[[12826,12826],\"disallowed_STD3_mapped\",\"(파)\"],[[12827,12827],\"disallowed_STD3_mapped\",\"(하)\"],[[12828,12828],\"disallowed_STD3_mapped\",\"(주)\"],[[12829,12829],\"disallowed_STD3_mapped\",\"(오전)\"],[[12830,12830],\"disallowed_STD3_mapped\",\"(오후)\"],[[12831,12831],\"disallowed\"],[[12832,12832],\"disallowed_STD3_mapped\",\"(一)\"],[[12833,12833],\"disallowed_STD3_mapped\",\"(二)\"],[[12834,12834],\"disallowed_STD3_mapped\",\"(三)\"],[[12835,12835],\"disallowed_STD3_mapped\",\"(四)\"],[[12836,12836],\"disallowed_STD3_mapped\",\"(五)\"],[[12837,12837],\"disallowed_STD3_mapped\",\"(六)\"],[[12838,12838],\"disallowed_STD3_mapped\",\"(七)\"],[[12839,12839],\"disallowed_STD3_mapped\",\"(八)\"],[[12840,12840],\"disallowed_STD3_mapped\",\"(九)\"],[[12841,12841],\"disallowed_STD3_mapped\",\"(十)\"],[[12842,12842],\"disallowed_STD3_mapped\",\"(月)\"],[[12843,12843],\"disallowed_STD3_mapped\",\"(火)\"],[[12844,12844],\"disallowed_STD3_mapped\",\"(水)\"],[[12845,12845],\"disallowed_STD3_mapped\",\"(木)\"],[[12846,12846],\"disallowed_STD3_mapped\",\"(金)\"],[[12847,12847],\"disallowed_STD3_mapped\",\"(土)\"],[[12848,12848],\"disallowed_STD3_mapped\",\"(日)\"],[[12849,12849],\"disallowed_STD3_mapped\",\"(株)\"],[[12850,12850],\"disallowed_STD3_mapped\",\"(有)\"],[[12851,12851],\"disallowed_STD3_mapped\",\"(社)\"],[[12852,12852],\"disallowed_STD3_mapped\",\"(名)\"],[[12853,12853],\"disallowed_STD3_mapped\",\"(特)\"],[[12854,12854],\"disallowed_STD3_mapped\",\"(財)\"],[[12855,12855],\"disallowed_STD3_mapped\",\"(祝)\"],[[12856,12856],\"disallowed_STD3_mapped\",\"(労)\"],[[12857,12857],\"disallowed_STD3_mapped\",\"(代)\"],[[12858,12858],\"disallowed_STD3_mapped\",\"(呼)\"],[[12859,12859],\"disallowed_STD3_mapped\",\"(学)\"],[[12860,12860],\"disallowed_STD3_mapped\",\"(監)\"],[[12861,12861],\"disallowed_STD3_mapped\",\"(企)\"],[[12862,12862],\"disallowed_STD3_mapped\",\"(資)\"],[[12863,12863],\"disallowed_STD3_mapped\",\"(協)\"],[[12864,12864],\"disallowed_STD3_mapped\",\"(祭)\"],[[12865,12865],\"disallowed_STD3_mapped\",\"(休)\"],[[12866,12866],\"disallowed_STD3_mapped\",\"(自)\"],[[12867,12867],\"disallowed_STD3_mapped\",\"(至)\"],[[12868,12868],\"mapped\",\"問\"],[[12869,12869],\"mapped\",\"幼\"],[[12870,12870],\"mapped\",\"文\"],[[12871,12871],\"mapped\",\"箏\"],[[12872,12879],\"valid\",\"\",\"NV8\"],[[12880,12880],\"mapped\",\"pte\"],[[12881,12881],\"mapped\",\"21\"],[[12882,12882],\"mapped\",\"22\"],[[12883,12883],\"mapped\",\"23\"],[[12884,12884],\"mapped\",\"24\"],[[12885,12885],\"mapped\",\"25\"],[[12886,12886],\"mapped\",\"26\"],[[12887,12887],\"mapped\",\"27\"],[[12888,12888],\"mapped\",\"28\"],[[12889,12889],\"mapped\",\"29\"],[[12890,12890],\"mapped\",\"30\"],[[12891,12891],\"mapped\",\"31\"],[[12892,12892],\"mapped\",\"32\"],[[12893,12893],\"mapped\",\"33\"],[[12894,12894],\"mapped\",\"34\"],[[12895,12895],\"mapped\",\"35\"],[[12896,12896],\"mapped\",\"ᄀ\"],[[12897,12897],\"mapped\",\"ᄂ\"],[[12898,12898],\"mapped\",\"ᄃ\"],[[12899,12899],\"mapped\",\"ᄅ\"],[[12900,12900],\"mapped\",\"ᄆ\"],[[12901,12901],\"mapped\",\"ᄇ\"],[[12902,12902],\"mapped\",\"ᄉ\"],[[12903,12903],\"mapped\",\"ᄋ\"],[[12904,12904],\"mapped\",\"ᄌ\"],[[12905,12905],\"mapped\",\"ᄎ\"],[[12906,12906],\"mapped\",\"ᄏ\"],[[12907,12907],\"mapped\",\"ᄐ\"],[[12908,12908],\"mapped\",\"ᄑ\"],[[12909,12909],\"mapped\",\"ᄒ\"],[[12910,12910],\"mapped\",\"가\"],[[12911,12911],\"mapped\",\"나\"],[[12912,12912],\"mapped\",\"다\"],[[12913,12913],\"mapped\",\"라\"],[[12914,12914],\"mapped\",\"마\"],[[12915,12915],\"mapped\",\"바\"],[[12916,12916],\"mapped\",\"사\"],[[12917,12917],\"mapped\",\"아\"],[[12918,12918],\"mapped\",\"자\"],[[12919,12919],\"mapped\",\"차\"],[[12920,12920],\"mapped\",\"카\"],[[12921,12921],\"mapped\",\"타\"],[[12922,12922],\"mapped\",\"파\"],[[12923,12923],\"mapped\",\"하\"],[[12924,12924],\"mapped\",\"참고\"],[[12925,12925],\"mapped\",\"주의\"],[[12926,12926],\"mapped\",\"우\"],[[12927,12927],\"valid\",\"\",\"NV8\"],[[12928,12928],\"mapped\",\"一\"],[[12929,12929],\"mapped\",\"二\"],[[12930,12930],\"mapped\",\"三\"],[[12931,12931],\"mapped\",\"四\"],[[12932,12932],\"mapped\",\"五\"],[[12933,12933],\"mapped\",\"六\"],[[12934,12934],\"mapped\",\"七\"],[[12935,12935],\"mapped\",\"八\"],[[12936,12936],\"mapped\",\"九\"],[[12937,12937],\"mapped\",\"十\"],[[12938,12938],\"mapped\",\"月\"],[[12939,12939],\"mapped\",\"火\"],[[12940,12940],\"mapped\",\"水\"],[[12941,12941],\"mapped\",\"木\"],[[12942,12942],\"mapped\",\"金\"],[[12943,12943],\"mapped\",\"土\"],[[12944,12944],\"mapped\",\"日\"],[[12945,12945],\"mapped\",\"株\"],[[12946,12946],\"mapped\",\"有\"],[[12947,12947],\"mapped\",\"社\"],[[12948,12948],\"mapped\",\"名\"],[[12949,12949],\"mapped\",\"特\"],[[12950,12950],\"mapped\",\"財\"],[[12951,12951],\"mapped\",\"祝\"],[[12952,12952],\"mapped\",\"労\"],[[12953,12953],\"mapped\",\"秘\"],[[12954,12954],\"mapped\",\"男\"],[[12955,12955],\"mapped\",\"女\"],[[12956,12956],\"mapped\",\"適\"],[[12957,12957],\"mapped\",\"優\"],[[12958,12958],\"mapped\",\"印\"],[[12959,12959],\"mapped\",\"注\"],[[12960,12960],\"mapped\",\"項\"],[[12961,12961],\"mapped\",\"休\"],[[12962,12962],\"mapped\",\"写\"],[[12963,12963],\"mapped\",\"正\"],[[12964,12964],\"mapped\",\"上\"],[[12965,12965],\"mapped\",\"中\"],[[12966,12966],\"mapped\",\"下\"],[[12967,12967],\"mapped\",\"左\"],[[12968,12968],\"mapped\",\"右\"],[[12969,12969],\"mapped\",\"医\"],[[12970,12970],\"mapped\",\"宗\"],[[12971,12971],\"mapped\",\"学\"],[[12972,12972],\"mapped\",\"監\"],[[12973,12973],\"mapped\",\"企\"],[[12974,12974],\"mapped\",\"資\"],[[12975,12975],\"mapped\",\"協\"],[[12976,12976],\"mapped\",\"夜\"],[[12977,12977],\"mapped\",\"36\"],[[12978,12978],\"mapped\",\"37\"],[[12979,12979],\"mapped\",\"38\"],[[12980,12980],\"mapped\",\"39\"],[[12981,12981],\"mapped\",\"40\"],[[12982,12982],\"mapped\",\"41\"],[[12983,12983],\"mapped\",\"42\"],[[12984,12984],\"mapped\",\"43\"],[[12985,12985],\"mapped\",\"44\"],[[12986,12986],\"mapped\",\"45\"],[[12987,12987],\"mapped\",\"46\"],[[12988,12988],\"mapped\",\"47\"],[[12989,12989],\"mapped\",\"48\"],[[12990,12990],\"mapped\",\"49\"],[[12991,12991],\"mapped\",\"50\"],[[12992,12992],\"mapped\",\"1月\"],[[12993,12993],\"mapped\",\"2月\"],[[12994,12994],\"mapped\",\"3月\"],[[12995,12995],\"mapped\",\"4月\"],[[12996,12996],\"mapped\",\"5月\"],[[12997,12997],\"mapped\",\"6月\"],[[12998,12998],\"mapped\",\"7月\"],[[12999,12999],\"mapped\",\"8月\"],[[13000,13000],\"mapped\",\"9月\"],[[13001,13001],\"mapped\",\"10月\"],[[13002,13002],\"mapped\",\"11月\"],[[13003,13003],\"mapped\",\"12月\"],[[13004,13004],\"mapped\",\"hg\"],[[13005,13005],\"mapped\",\"erg\"],[[13006,13006],\"mapped\",\"ev\"],[[13007,13007],\"mapped\",\"ltd\"],[[13008,13008],\"mapped\",\"ア\"],[[13009,13009],\"mapped\",\"イ\"],[[13010,13010],\"mapped\",\"ウ\"],[[13011,13011],\"mapped\",\"エ\"],[[13012,13012],\"mapped\",\"オ\"],[[13013,13013],\"mapped\",\"カ\"],[[13014,13014],\"mapped\",\"キ\"],[[13015,13015],\"mapped\",\"ク\"],[[13016,13016],\"mapped\",\"ケ\"],[[13017,13017],\"mapped\",\"コ\"],[[13018,13018],\"mapped\",\"サ\"],[[13019,13019],\"mapped\",\"シ\"],[[13020,13020],\"mapped\",\"ス\"],[[13021,13021],\"mapped\",\"セ\"],[[13022,13022],\"mapped\",\"ソ\"],[[13023,13023],\"mapped\",\"タ\"],[[13024,13024],\"mapped\",\"チ\"],[[13025,13025],\"mapped\",\"ツ\"],[[13026,13026],\"mapped\",\"テ\"],[[13027,13027],\"mapped\",\"ト\"],[[13028,13028],\"mapped\",\"ナ\"],[[13029,13029],\"mapped\",\"ニ\"],[[13030,13030],\"mapped\",\"ヌ\"],[[13031,13031],\"mapped\",\"ネ\"],[[13032,13032],\"mapped\",\"ノ\"],[[13033,13033],\"mapped\",\"ハ\"],[[13034,13034],\"mapped\",\"ヒ\"],[[13035,13035],\"mapped\",\"フ\"],[[13036,13036],\"mapped\",\"ヘ\"],[[13037,13037],\"mapped\",\"ホ\"],[[13038,13038],\"mapped\",\"マ\"],[[13039,13039],\"mapped\",\"ミ\"],[[13040,13040],\"mapped\",\"ム\"],[[13041,13041],\"mapped\",\"メ\"],[[13042,13042],\"mapped\",\"モ\"],[[13043,13043],\"mapped\",\"ヤ\"],[[13044,13044],\"mapped\",\"ユ\"],[[13045,13045],\"mapped\",\"ヨ\"],[[13046,13046],\"mapped\",\"ラ\"],[[13047,13047],\"mapped\",\"リ\"],[[13048,13048],\"mapped\",\"ル\"],[[13049,13049],\"mapped\",\"レ\"],[[13050,13050],\"mapped\",\"ロ\"],[[13051,13051],\"mapped\",\"ワ\"],[[13052,13052],\"mapped\",\"ヰ\"],[[13053,13053],\"mapped\",\"ヱ\"],[[13054,13054],\"mapped\",\"ヲ\"],[[13055,13055],\"disallowed\"],[[13056,13056],\"mapped\",\"アパート\"],[[13057,13057],\"mapped\",\"アルファ\"],[[13058,13058],\"mapped\",\"アンペア\"],[[13059,13059],\"mapped\",\"アール\"],[[13060,13060],\"mapped\",\"イニング\"],[[13061,13061],\"mapped\",\"インチ\"],[[13062,13062],\"mapped\",\"ウォン\"],[[13063,13063],\"mapped\",\"エスクード\"],[[13064,13064],\"mapped\",\"エーカー\"],[[13065,13065],\"mapped\",\"オンス\"],[[13066,13066],\"mapped\",\"オーム\"],[[13067,13067],\"mapped\",\"カイリ\"],[[13068,13068],\"mapped\",\"カラット\"],[[13069,13069],\"mapped\",\"カロリー\"],[[13070,13070],\"mapped\",\"ガロン\"],[[13071,13071],\"mapped\",\"ガンマ\"],[[13072,13072],\"mapped\",\"ギガ\"],[[13073,13073],\"mapped\",\"ギニー\"],[[13074,13074],\"mapped\",\"キュリー\"],[[13075,13075],\"mapped\",\"ギルダー\"],[[13076,13076],\"mapped\",\"キロ\"],[[13077,13077],\"mapped\",\"キログラム\"],[[13078,13078],\"mapped\",\"キロメートル\"],[[13079,13079],\"mapped\",\"キロワット\"],[[13080,13080],\"mapped\",\"グラム\"],[[13081,13081],\"mapped\",\"グラムトン\"],[[13082,13082],\"mapped\",\"クルゼイロ\"],[[13083,13083],\"mapped\",\"クローネ\"],[[13084,13084],\"mapped\",\"ケース\"],[[13085,13085],\"mapped\",\"コルナ\"],[[13086,13086],\"mapped\",\"コーポ\"],[[13087,13087],\"mapped\",\"サイクル\"],[[13088,13088],\"mapped\",\"サンチーム\"],[[13089,13089],\"mapped\",\"シリング\"],[[13090,13090],\"mapped\",\"センチ\"],[[13091,13091],\"mapped\",\"セント\"],[[13092,13092],\"mapped\",\"ダース\"],[[13093,13093],\"mapped\",\"デシ\"],[[13094,13094],\"mapped\",\"ドル\"],[[13095,13095],\"mapped\",\"トン\"],[[13096,13096],\"mapped\",\"ナノ\"],[[13097,13097],\"mapped\",\"ノット\"],[[13098,13098],\"mapped\",\"ハイツ\"],[[13099,13099],\"mapped\",\"パーセント\"],[[13100,13100],\"mapped\",\"パーツ\"],[[13101,13101],\"mapped\",\"バーレル\"],[[13102,13102],\"mapped\",\"ピアストル\"],[[13103,13103],\"mapped\",\"ピクル\"],[[13104,13104],\"mapped\",\"ピコ\"],[[13105,13105],\"mapped\",\"ビル\"],[[13106,13106],\"mapped\",\"ファラッド\"],[[13107,13107],\"mapped\",\"フィート\"],[[13108,13108],\"mapped\",\"ブッシェル\"],[[13109,13109],\"mapped\",\"フラン\"],[[13110,13110],\"mapped\",\"ヘクタール\"],[[13111,13111],\"mapped\",\"ペソ\"],[[13112,13112],\"mapped\",\"ペニヒ\"],[[13113,13113],\"mapped\",\"ヘルツ\"],[[13114,13114],\"mapped\",\"ペンス\"],[[13115,13115],\"mapped\",\"ページ\"],[[13116,13116],\"mapped\",\"ベータ\"],[[13117,13117],\"mapped\",\"ポイント\"],[[13118,13118],\"mapped\",\"ボルト\"],[[13119,13119],\"mapped\",\"ホン\"],[[13120,13120],\"mapped\",\"ポンド\"],[[13121,13121],\"mapped\",\"ホール\"],[[13122,13122],\"mapped\",\"ホーン\"],[[13123,13123],\"mapped\",\"マイクロ\"],[[13124,13124],\"mapped\",\"マイル\"],[[13125,13125],\"mapped\",\"マッハ\"],[[13126,13126],\"mapped\",\"マルク\"],[[13127,13127],\"mapped\",\"マンション\"],[[13128,13128],\"mapped\",\"ミクロン\"],[[13129,13129],\"mapped\",\"ミリ\"],[[13130,13130],\"mapped\",\"ミリバール\"],[[13131,13131],\"mapped\",\"メガ\"],[[13132,13132],\"mapped\",\"メガトン\"],[[13133,13133],\"mapped\",\"メートル\"],[[13134,13134],\"mapped\",\"ヤード\"],[[13135,13135],\"mapped\",\"ヤール\"],[[13136,13136],\"mapped\",\"ユアン\"],[[13137,13137],\"mapped\",\"リットル\"],[[13138,13138],\"mapped\",\"リラ\"],[[13139,13139],\"mapped\",\"ルピー\"],[[13140,13140],\"mapped\",\"ルーブル\"],[[13141,13141],\"mapped\",\"レム\"],[[13142,13142],\"mapped\",\"レントゲン\"],[[13143,13143],\"mapped\",\"ワット\"],[[13144,13144],\"mapped\",\"0点\"],[[13145,13145],\"mapped\",\"1点\"],[[13146,13146],\"mapped\",\"2点\"],[[13147,13147],\"mapped\",\"3点\"],[[13148,13148],\"mapped\",\"4点\"],[[13149,13149],\"mapped\",\"5点\"],[[13150,13150],\"mapped\",\"6点\"],[[13151,13151],\"mapped\",\"7点\"],[[13152,13152],\"mapped\",\"8点\"],[[13153,13153],\"mapped\",\"9点\"],[[13154,13154],\"mapped\",\"10点\"],[[13155,13155],\"mapped\",\"11点\"],[[13156,13156],\"mapped\",\"12点\"],[[13157,13157],\"mapped\",\"13点\"],[[13158,13158],\"mapped\",\"14点\"],[[13159,13159],\"mapped\",\"15点\"],[[13160,13160],\"mapped\",\"16点\"],[[13161,13161],\"mapped\",\"17点\"],[[13162,13162],\"mapped\",\"18点\"],[[13163,13163],\"mapped\",\"19点\"],[[13164,13164],\"mapped\",\"20点\"],[[13165,13165],\"mapped\",\"21点\"],[[13166,13166],\"mapped\",\"22点\"],[[13167,13167],\"mapped\",\"23点\"],[[13168,13168],\"mapped\",\"24点\"],[[13169,13169],\"mapped\",\"hpa\"],[[13170,13170],\"mapped\",\"da\"],[[13171,13171],\"mapped\",\"au\"],[[13172,13172],\"mapped\",\"bar\"],[[13173,13173],\"mapped\",\"ov\"],[[13174,13174],\"mapped\",\"pc\"],[[13175,13175],\"mapped\",\"dm\"],[[13176,13176],\"mapped\",\"dm2\"],[[13177,13177],\"mapped\",\"dm3\"],[[13178,13178],\"mapped\",\"iu\"],[[13179,13179],\"mapped\",\"平成\"],[[13180,13180],\"mapped\",\"昭和\"],[[13181,13181],\"mapped\",\"大正\"],[[13182,13182],\"mapped\",\"明治\"],[[13183,13183],\"mapped\",\"株式会社\"],[[13184,13184],\"mapped\",\"pa\"],[[13185,13185],\"mapped\",\"na\"],[[13186,13186],\"mapped\",\"μa\"],[[13187,13187],\"mapped\",\"ma\"],[[13188,13188],\"mapped\",\"ka\"],[[13189,13189],\"mapped\",\"kb\"],[[13190,13190],\"mapped\",\"mb\"],[[13191,13191],\"mapped\",\"gb\"],[[13192,13192],\"mapped\",\"cal\"],[[13193,13193],\"mapped\",\"kcal\"],[[13194,13194],\"mapped\",\"pf\"],[[13195,13195],\"mapped\",\"nf\"],[[13196,13196],\"mapped\",\"μf\"],[[13197,13197],\"mapped\",\"μg\"],[[13198,13198],\"mapped\",\"mg\"],[[13199,13199],\"mapped\",\"kg\"],[[13200,13200],\"mapped\",\"hz\"],[[13201,13201],\"mapped\",\"khz\"],[[13202,13202],\"mapped\",\"mhz\"],[[13203,13203],\"mapped\",\"ghz\"],[[13204,13204],\"mapped\",\"thz\"],[[13205,13205],\"mapped\",\"μl\"],[[13206,13206],\"mapped\",\"ml\"],[[13207,13207],\"mapped\",\"dl\"],[[13208,13208],\"mapped\",\"kl\"],[[13209,13209],\"mapped\",\"fm\"],[[13210,13210],\"mapped\",\"nm\"],[[13211,13211],\"mapped\",\"μm\"],[[13212,13212],\"mapped\",\"mm\"],[[13213,13213],\"mapped\",\"cm\"],[[13214,13214],\"mapped\",\"km\"],[[13215,13215],\"mapped\",\"mm2\"],[[13216,13216],\"mapped\",\"cm2\"],[[13217,13217],\"mapped\",\"m2\"],[[13218,13218],\"mapped\",\"km2\"],[[13219,13219],\"mapped\",\"mm3\"],[[13220,13220],\"mapped\",\"cm3\"],[[13221,13221],\"mapped\",\"m3\"],[[13222,13222],\"mapped\",\"km3\"],[[13223,13223],\"mapped\",\"m∕s\"],[[13224,13224],\"mapped\",\"m∕s2\"],[[13225,13225],\"mapped\",\"pa\"],[[13226,13226],\"mapped\",\"kpa\"],[[13227,13227],\"mapped\",\"mpa\"],[[13228,13228],\"mapped\",\"gpa\"],[[13229,13229],\"mapped\",\"rad\"],[[13230,13230],\"mapped\",\"rad∕s\"],[[13231,13231],\"mapped\",\"rad∕s2\"],[[13232,13232],\"mapped\",\"ps\"],[[13233,13233],\"mapped\",\"ns\"],[[13234,13234],\"mapped\",\"μs\"],[[13235,13235],\"mapped\",\"ms\"],[[13236,13236],\"mapped\",\"pv\"],[[13237,13237],\"mapped\",\"nv\"],[[13238,13238],\"mapped\",\"μv\"],[[13239,13239],\"mapped\",\"mv\"],[[13240,13240],\"mapped\",\"kv\"],[[13241,13241],\"mapped\",\"mv\"],[[13242,13242],\"mapped\",\"pw\"],[[13243,13243],\"mapped\",\"nw\"],[[13244,13244],\"mapped\",\"μw\"],[[13245,13245],\"mapped\",\"mw\"],[[13246,13246],\"mapped\",\"kw\"],[[13247,13247],\"mapped\",\"mw\"],[[13248,13248],\"mapped\",\"kω\"],[[13249,13249],\"mapped\",\"mω\"],[[13250,13250],\"disallowed\"],[[13251,13251],\"mapped\",\"bq\"],[[13252,13252],\"mapped\",\"cc\"],[[13253,13253],\"mapped\",\"cd\"],[[13254,13254],\"mapped\",\"c∕kg\"],[[13255,13255],\"disallowed\"],[[13256,13256],\"mapped\",\"db\"],[[13257,13257],\"mapped\",\"gy\"],[[13258,13258],\"mapped\",\"ha\"],[[13259,13259],\"mapped\",\"hp\"],[[13260,13260],\"mapped\",\"in\"],[[13261,13261],\"mapped\",\"kk\"],[[13262,13262],\"mapped\",\"km\"],[[13263,13263],\"mapped\",\"kt\"],[[13264,13264],\"mapped\",\"lm\"],[[13265,13265],\"mapped\",\"ln\"],[[13266,13266],\"mapped\",\"log\"],[[13267,13267],\"mapped\",\"lx\"],[[13268,13268],\"mapped\",\"mb\"],[[13269,13269],\"mapped\",\"mil\"],[[13270,13270],\"mapped\",\"mol\"],[[13271,13271],\"mapped\",\"ph\"],[[13272,13272],\"disallowed\"],[[13273,13273],\"mapped\",\"ppm\"],[[13274,13274],\"mapped\",\"pr\"],[[13275,13275],\"mapped\",\"sr\"],[[13276,13276],\"mapped\",\"sv\"],[[13277,13277],\"mapped\",\"wb\"],[[13278,13278],\"mapped\",\"v∕m\"],[[13279,13279],\"mapped\",\"a∕m\"],[[13280,13280],\"mapped\",\"1日\"],[[13281,13281],\"mapped\",\"2日\"],[[13282,13282],\"mapped\",\"3日\"],[[13283,13283],\"mapped\",\"4日\"],[[13284,13284],\"mapped\",\"5日\"],[[13285,13285],\"mapped\",\"6日\"],[[13286,13286],\"mapped\",\"7日\"],[[13287,13287],\"mapped\",\"8日\"],[[13288,13288],\"mapped\",\"9日\"],[[13289,13289],\"mapped\",\"10日\"],[[13290,13290],\"mapped\",\"11日\"],[[13291,13291],\"mapped\",\"12日\"],[[13292,13292],\"mapped\",\"13日\"],[[13293,13293],\"mapped\",\"14日\"],[[13294,13294],\"mapped\",\"15日\"],[[13295,13295],\"mapped\",\"16日\"],[[13296,13296],\"mapped\",\"17日\"],[[13297,13297],\"mapped\",\"18日\"],[[13298,13298],\"mapped\",\"19日\"],[[13299,13299],\"mapped\",\"20日\"],[[13300,13300],\"mapped\",\"21日\"],[[13301,13301],\"mapped\",\"22日\"],[[13302,13302],\"mapped\",\"23日\"],[[13303,13303],\"mapped\",\"24日\"],[[13304,13304],\"mapped\",\"25日\"],[[13305,13305],\"mapped\",\"26日\"],[[13306,13306],\"mapped\",\"27日\"],[[13307,13307],\"mapped\",\"28日\"],[[13308,13308],\"mapped\",\"29日\"],[[13309,13309],\"mapped\",\"30日\"],[[13310,13310],\"mapped\",\"31日\"],[[13311,13311],\"mapped\",\"gal\"],[[13312,19893],\"valid\"],[[19894,19903],\"disallowed\"],[[19904,19967],\"valid\",\"\",\"NV8\"],[[19968,40869],\"valid\"],[[40870,40891],\"valid\"],[[40892,40899],\"valid\"],[[40900,40907],\"valid\"],[[40908,40908],\"valid\"],[[40909,40917],\"valid\"],[[40918,40938],\"valid\"],[[40939,40959],\"disallowed\"],[[40960,42124],\"valid\"],[[42125,42127],\"disallowed\"],[[42128,42145],\"valid\",\"\",\"NV8\"],[[42146,42147],\"valid\",\"\",\"NV8\"],[[42148,42163],\"valid\",\"\",\"NV8\"],[[42164,42164],\"valid\",\"\",\"NV8\"],[[42165,42176],\"valid\",\"\",\"NV8\"],[[42177,42177],\"valid\",\"\",\"NV8\"],[[42178,42180],\"valid\",\"\",\"NV8\"],[[42181,42181],\"valid\",\"\",\"NV8\"],[[42182,42182],\"valid\",\"\",\"NV8\"],[[42183,42191],\"disallowed\"],[[42192,42237],\"valid\"],[[42238,42239],\"valid\",\"\",\"NV8\"],[[42240,42508],\"valid\"],[[42509,42511],\"valid\",\"\",\"NV8\"],[[42512,42539],\"valid\"],[[42540,42559],\"disallowed\"],[[42560,42560],\"mapped\",\"ꙁ\"],[[42561,42561],\"valid\"],[[42562,42562],\"mapped\",\"ꙃ\"],[[42563,42563],\"valid\"],[[42564,42564],\"mapped\",\"ꙅ\"],[[42565,42565],\"valid\"],[[42566,42566],\"mapped\",\"ꙇ\"],[[42567,42567],\"valid\"],[[42568,42568],\"mapped\",\"ꙉ\"],[[42569,42569],\"valid\"],[[42570,42570],\"mapped\",\"ꙋ\"],[[42571,42571],\"valid\"],[[42572,42572],\"mapped\",\"ꙍ\"],[[42573,42573],\"valid\"],[[42574,42574],\"mapped\",\"ꙏ\"],[[42575,42575],\"valid\"],[[42576,42576],\"mapped\",\"ꙑ\"],[[42577,42577],\"valid\"],[[42578,42578],\"mapped\",\"ꙓ\"],[[42579,42579],\"valid\"],[[42580,42580],\"mapped\",\"ꙕ\"],[[42581,42581],\"valid\"],[[42582,42582],\"mapped\",\"ꙗ\"],[[42583,42583],\"valid\"],[[42584,42584],\"mapped\",\"ꙙ\"],[[42585,42585],\"valid\"],[[42586,42586],\"mapped\",\"ꙛ\"],[[42587,42587],\"valid\"],[[42588,42588],\"mapped\",\"ꙝ\"],[[42589,42589],\"valid\"],[[42590,42590],\"mapped\",\"ꙟ\"],[[42591,42591],\"valid\"],[[42592,42592],\"mapped\",\"ꙡ\"],[[42593,42593],\"valid\"],[[42594,42594],\"mapped\",\"ꙣ\"],[[42595,42595],\"valid\"],[[42596,42596],\"mapped\",\"ꙥ\"],[[42597,42597],\"valid\"],[[42598,42598],\"mapped\",\"ꙧ\"],[[42599,42599],\"valid\"],[[42600,42600],\"mapped\",\"ꙩ\"],[[42601,42601],\"valid\"],[[42602,42602],\"mapped\",\"ꙫ\"],[[42603,42603],\"valid\"],[[42604,42604],\"mapped\",\"ꙭ\"],[[42605,42607],\"valid\"],[[42608,42611],\"valid\",\"\",\"NV8\"],[[42612,42619],\"valid\"],[[42620,42621],\"valid\"],[[42622,42622],\"valid\",\"\",\"NV8\"],[[42623,42623],\"valid\"],[[42624,42624],\"mapped\",\"ꚁ\"],[[42625,42625],\"valid\"],[[42626,42626],\"mapped\",\"ꚃ\"],[[42627,42627],\"valid\"],[[42628,42628],\"mapped\",\"ꚅ\"],[[42629,42629],\"valid\"],[[42630,42630],\"mapped\",\"ꚇ\"],[[42631,42631],\"valid\"],[[42632,42632],\"mapped\",\"ꚉ\"],[[42633,42633],\"valid\"],[[42634,42634],\"mapped\",\"ꚋ\"],[[42635,42635],\"valid\"],[[42636,42636],\"mapped\",\"ꚍ\"],[[42637,42637],\"valid\"],[[42638,42638],\"mapped\",\"ꚏ\"],[[42639,42639],\"valid\"],[[42640,42640],\"mapped\",\"ꚑ\"],[[42641,42641],\"valid\"],[[42642,42642],\"mapped\",\"ꚓ\"],[[42643,42643],\"valid\"],[[42644,42644],\"mapped\",\"ꚕ\"],[[42645,42645],\"valid\"],[[42646,42646],\"mapped\",\"ꚗ\"],[[42647,42647],\"valid\"],[[42648,42648],\"mapped\",\"ꚙ\"],[[42649,42649],\"valid\"],[[42650,42650],\"mapped\",\"ꚛ\"],[[42651,42651],\"valid\"],[[42652,42652],\"mapped\",\"ъ\"],[[42653,42653],\"mapped\",\"ь\"],[[42654,42654],\"valid\"],[[42655,42655],\"valid\"],[[42656,42725],\"valid\"],[[42726,42735],\"valid\",\"\",\"NV8\"],[[42736,42737],\"valid\"],[[42738,42743],\"valid\",\"\",\"NV8\"],[[42744,42751],\"disallowed\"],[[42752,42774],\"valid\",\"\",\"NV8\"],[[42775,42778],\"valid\"],[[42779,42783],\"valid\"],[[42784,42785],\"valid\",\"\",\"NV8\"],[[42786,42786],\"mapped\",\"ꜣ\"],[[42787,42787],\"valid\"],[[42788,42788],\"mapped\",\"ꜥ\"],[[42789,42789],\"valid\"],[[42790,42790],\"mapped\",\"ꜧ\"],[[42791,42791],\"valid\"],[[42792,42792],\"mapped\",\"ꜩ\"],[[42793,42793],\"valid\"],[[42794,42794],\"mapped\",\"ꜫ\"],[[42795,42795],\"valid\"],[[42796,42796],\"mapped\",\"ꜭ\"],[[42797,42797],\"valid\"],[[42798,42798],\"mapped\",\"ꜯ\"],[[42799,42801],\"valid\"],[[42802,42802],\"mapped\",\"ꜳ\"],[[42803,42803],\"valid\"],[[42804,42804],\"mapped\",\"ꜵ\"],[[42805,42805],\"valid\"],[[42806,42806],\"mapped\",\"ꜷ\"],[[42807,42807],\"valid\"],[[42808,42808],\"mapped\",\"ꜹ\"],[[42809,42809],\"valid\"],[[42810,42810],\"mapped\",\"ꜻ\"],[[42811,42811],\"valid\"],[[42812,42812],\"mapped\",\"ꜽ\"],[[42813,42813],\"valid\"],[[42814,42814],\"mapped\",\"ꜿ\"],[[42815,42815],\"valid\"],[[42816,42816],\"mapped\",\"ꝁ\"],[[42817,42817],\"valid\"],[[42818,42818],\"mapped\",\"ꝃ\"],[[42819,42819],\"valid\"],[[42820,42820],\"mapped\",\"ꝅ\"],[[42821,42821],\"valid\"],[[42822,42822],\"mapped\",\"ꝇ\"],[[42823,42823],\"valid\"],[[42824,42824],\"mapped\",\"ꝉ\"],[[42825,42825],\"valid\"],[[42826,42826],\"mapped\",\"ꝋ\"],[[42827,42827],\"valid\"],[[42828,42828],\"mapped\",\"ꝍ\"],[[42829,42829],\"valid\"],[[42830,42830],\"mapped\",\"ꝏ\"],[[42831,42831],\"valid\"],[[42832,42832],\"mapped\",\"ꝑ\"],[[42833,42833],\"valid\"],[[42834,42834],\"mapped\",\"ꝓ\"],[[42835,42835],\"valid\"],[[42836,42836],\"mapped\",\"ꝕ\"],[[42837,42837],\"valid\"],[[42838,42838],\"mapped\",\"ꝗ\"],[[42839,42839],\"valid\"],[[42840,42840],\"mapped\",\"ꝙ\"],[[42841,42841],\"valid\"],[[42842,42842],\"mapped\",\"ꝛ\"],[[42843,42843],\"valid\"],[[42844,42844],\"mapped\",\"ꝝ\"],[[42845,42845],\"valid\"],[[42846,42846],\"mapped\",\"ꝟ\"],[[42847,42847],\"valid\"],[[42848,42848],\"mapped\",\"ꝡ\"],[[42849,42849],\"valid\"],[[42850,42850],\"mapped\",\"ꝣ\"],[[42851,42851],\"valid\"],[[42852,42852],\"mapped\",\"ꝥ\"],[[42853,42853],\"valid\"],[[42854,42854],\"mapped\",\"ꝧ\"],[[42855,42855],\"valid\"],[[42856,42856],\"mapped\",\"ꝩ\"],[[42857,42857],\"valid\"],[[42858,42858],\"mapped\",\"ꝫ\"],[[42859,42859],\"valid\"],[[42860,42860],\"mapped\",\"ꝭ\"],[[42861,42861],\"valid\"],[[42862,42862],\"mapped\",\"ꝯ\"],[[42863,42863],\"valid\"],[[42864,42864],\"mapped\",\"ꝯ\"],[[42865,42872],\"valid\"],[[42873,42873],\"mapped\",\"ꝺ\"],[[42874,42874],\"valid\"],[[42875,42875],\"mapped\",\"ꝼ\"],[[42876,42876],\"valid\"],[[42877,42877],\"mapped\",\"ᵹ\"],[[42878,42878],\"mapped\",\"ꝿ\"],[[42879,42879],\"valid\"],[[42880,42880],\"mapped\",\"ꞁ\"],[[42881,42881],\"valid\"],[[42882,42882],\"mapped\",\"ꞃ\"],[[42883,42883],\"valid\"],[[42884,42884],\"mapped\",\"ꞅ\"],[[42885,42885],\"valid\"],[[42886,42886],\"mapped\",\"ꞇ\"],[[42887,42888],\"valid\"],[[42889,42890],\"valid\",\"\",\"NV8\"],[[42891,42891],\"mapped\",\"ꞌ\"],[[42892,42892],\"valid\"],[[42893,42893],\"mapped\",\"ɥ\"],[[42894,42894],\"valid\"],[[42895,42895],\"valid\"],[[42896,42896],\"mapped\",\"ꞑ\"],[[42897,42897],\"valid\"],[[42898,42898],\"mapped\",\"ꞓ\"],[[42899,42899],\"valid\"],[[42900,42901],\"valid\"],[[42902,42902],\"mapped\",\"ꞗ\"],[[42903,42903],\"valid\"],[[42904,42904],\"mapped\",\"ꞙ\"],[[42905,42905],\"valid\"],[[42906,42906],\"mapped\",\"ꞛ\"],[[42907,42907],\"valid\"],[[42908,42908],\"mapped\",\"ꞝ\"],[[42909,42909],\"valid\"],[[42910,42910],\"mapped\",\"ꞟ\"],[[42911,42911],\"valid\"],[[42912,42912],\"mapped\",\"ꞡ\"],[[42913,42913],\"valid\"],[[42914,42914],\"mapped\",\"ꞣ\"],[[42915,42915],\"valid\"],[[42916,42916],\"mapped\",\"ꞥ\"],[[42917,42917],\"valid\"],[[42918,42918],\"mapped\",\"ꞧ\"],[[42919,42919],\"valid\"],[[42920,42920],\"mapped\",\"ꞩ\"],[[42921,42921],\"valid\"],[[42922,42922],\"mapped\",\"ɦ\"],[[42923,42923],\"mapped\",\"ɜ\"],[[42924,42924],\"mapped\",\"ɡ\"],[[42925,42925],\"mapped\",\"ɬ\"],[[42926,42926],\"mapped\",\"ɪ\"],[[42927,42927],\"disallowed\"],[[42928,42928],\"mapped\",\"ʞ\"],[[42929,42929],\"mapped\",\"ʇ\"],[[42930,42930],\"mapped\",\"ʝ\"],[[42931,42931],\"mapped\",\"ꭓ\"],[[42932,42932],\"mapped\",\"ꞵ\"],[[42933,42933],\"valid\"],[[42934,42934],\"mapped\",\"ꞷ\"],[[42935,42935],\"valid\"],[[42936,42998],\"disallowed\"],[[42999,42999],\"valid\"],[[43000,43000],\"mapped\",\"ħ\"],[[43001,43001],\"mapped\",\"œ\"],[[43002,43002],\"valid\"],[[43003,43007],\"valid\"],[[43008,43047],\"valid\"],[[43048,43051],\"valid\",\"\",\"NV8\"],[[43052,43055],\"disallowed\"],[[43056,43065],\"valid\",\"\",\"NV8\"],[[43066,43071],\"disallowed\"],[[43072,43123],\"valid\"],[[43124,43127],\"valid\",\"\",\"NV8\"],[[43128,43135],\"disallowed\"],[[43136,43204],\"valid\"],[[43205,43205],\"valid\"],[[43206,43213],\"disallowed\"],[[43214,43215],\"valid\",\"\",\"NV8\"],[[43216,43225],\"valid\"],[[43226,43231],\"disallowed\"],[[43232,43255],\"valid\"],[[43256,43258],\"valid\",\"\",\"NV8\"],[[43259,43259],\"valid\"],[[43260,43260],\"valid\",\"\",\"NV8\"],[[43261,43261],\"valid\"],[[43262,43263],\"disallowed\"],[[43264,43309],\"valid\"],[[43310,43311],\"valid\",\"\",\"NV8\"],[[43312,43347],\"valid\"],[[43348,43358],\"disallowed\"],[[43359,43359],\"valid\",\"\",\"NV8\"],[[43360,43388],\"valid\",\"\",\"NV8\"],[[43389,43391],\"disallowed\"],[[43392,43456],\"valid\"],[[43457,43469],\"valid\",\"\",\"NV8\"],[[43470,43470],\"disallowed\"],[[43471,43481],\"valid\"],[[43482,43485],\"disallowed\"],[[43486,43487],\"valid\",\"\",\"NV8\"],[[43488,43518],\"valid\"],[[43519,43519],\"disallowed\"],[[43520,43574],\"valid\"],[[43575,43583],\"disallowed\"],[[43584,43597],\"valid\"],[[43598,43599],\"disallowed\"],[[43600,43609],\"valid\"],[[43610,43611],\"disallowed\"],[[43612,43615],\"valid\",\"\",\"NV8\"],[[43616,43638],\"valid\"],[[43639,43641],\"valid\",\"\",\"NV8\"],[[43642,43643],\"valid\"],[[43644,43647],\"valid\"],[[43648,43714],\"valid\"],[[43715,43738],\"disallowed\"],[[43739,43741],\"valid\"],[[43742,43743],\"valid\",\"\",\"NV8\"],[[43744,43759],\"valid\"],[[43760,43761],\"valid\",\"\",\"NV8\"],[[43762,43766],\"valid\"],[[43767,43776],\"disallowed\"],[[43777,43782],\"valid\"],[[43783,43784],\"disallowed\"],[[43785,43790],\"valid\"],[[43791,43792],\"disallowed\"],[[43793,43798],\"valid\"],[[43799,43807],\"disallowed\"],[[43808,43814],\"valid\"],[[43815,43815],\"disallowed\"],[[43816,43822],\"valid\"],[[43823,43823],\"disallowed\"],[[43824,43866],\"valid\"],[[43867,43867],\"valid\",\"\",\"NV8\"],[[43868,43868],\"mapped\",\"ꜧ\"],[[43869,43869],\"mapped\",\"ꬷ\"],[[43870,43870],\"mapped\",\"ɫ\"],[[43871,43871],\"mapped\",\"ꭒ\"],[[43872,43875],\"valid\"],[[43876,43877],\"valid\"],[[43878,43887],\"disallowed\"],[[43888,43888],\"mapped\",\"Ꭰ\"],[[43889,43889],\"mapped\",\"Ꭱ\"],[[43890,43890],\"mapped\",\"Ꭲ\"],[[43891,43891],\"mapped\",\"Ꭳ\"],[[43892,43892],\"mapped\",\"Ꭴ\"],[[43893,43893],\"mapped\",\"Ꭵ\"],[[43894,43894],\"mapped\",\"Ꭶ\"],[[43895,43895],\"mapped\",\"Ꭷ\"],[[43896,43896],\"mapped\",\"Ꭸ\"],[[43897,43897],\"mapped\",\"Ꭹ\"],[[43898,43898],\"mapped\",\"Ꭺ\"],[[43899,43899],\"mapped\",\"Ꭻ\"],[[43900,43900],\"mapped\",\"Ꭼ\"],[[43901,43901],\"mapped\",\"Ꭽ\"],[[43902,43902],\"mapped\",\"Ꭾ\"],[[43903,43903],\"mapped\",\"Ꭿ\"],[[43904,43904],\"mapped\",\"Ꮀ\"],[[43905,43905],\"mapped\",\"Ꮁ\"],[[43906,43906],\"mapped\",\"Ꮂ\"],[[43907,43907],\"mapped\",\"Ꮃ\"],[[43908,43908],\"mapped\",\"Ꮄ\"],[[43909,43909],\"mapped\",\"Ꮅ\"],[[43910,43910],\"mapped\",\"Ꮆ\"],[[43911,43911],\"mapped\",\"Ꮇ\"],[[43912,43912],\"mapped\",\"Ꮈ\"],[[43913,43913],\"mapped\",\"Ꮉ\"],[[43914,43914],\"mapped\",\"Ꮊ\"],[[43915,43915],\"mapped\",\"Ꮋ\"],[[43916,43916],\"mapped\",\"Ꮌ\"],[[43917,43917],\"mapped\",\"Ꮍ\"],[[43918,43918],\"mapped\",\"Ꮎ\"],[[43919,43919],\"mapped\",\"Ꮏ\"],[[43920,43920],\"mapped\",\"Ꮐ\"],[[43921,43921],\"mapped\",\"Ꮑ\"],[[43922,43922],\"mapped\",\"Ꮒ\"],[[43923,43923],\"mapped\",\"Ꮓ\"],[[43924,43924],\"mapped\",\"Ꮔ\"],[[43925,43925],\"mapped\",\"Ꮕ\"],[[43926,43926],\"mapped\",\"Ꮖ\"],[[43927,43927],\"mapped\",\"Ꮗ\"],[[43928,43928],\"mapped\",\"Ꮘ\"],[[43929,43929],\"mapped\",\"Ꮙ\"],[[43930,43930],\"mapped\",\"Ꮚ\"],[[43931,43931],\"mapped\",\"Ꮛ\"],[[43932,43932],\"mapped\",\"Ꮜ\"],[[43933,43933],\"mapped\",\"Ꮝ\"],[[43934,43934],\"mapped\",\"Ꮞ\"],[[43935,43935],\"mapped\",\"Ꮟ\"],[[43936,43936],\"mapped\",\"Ꮠ\"],[[43937,43937],\"mapped\",\"Ꮡ\"],[[43938,43938],\"mapped\",\"Ꮢ\"],[[43939,43939],\"mapped\",\"Ꮣ\"],[[43940,43940],\"mapped\",\"Ꮤ\"],[[43941,43941],\"mapped\",\"Ꮥ\"],[[43942,43942],\"mapped\",\"Ꮦ\"],[[43943,43943],\"mapped\",\"Ꮧ\"],[[43944,43944],\"mapped\",\"Ꮨ\"],[[43945,43945],\"mapped\",\"Ꮩ\"],[[43946,43946],\"mapped\",\"Ꮪ\"],[[43947,43947],\"mapped\",\"Ꮫ\"],[[43948,43948],\"mapped\",\"Ꮬ\"],[[43949,43949],\"mapped\",\"Ꮭ\"],[[43950,43950],\"mapped\",\"Ꮮ\"],[[43951,43951],\"mapped\",\"Ꮯ\"],[[43952,43952],\"mapped\",\"Ꮰ\"],[[43953,43953],\"mapped\",\"Ꮱ\"],[[43954,43954],\"mapped\",\"Ꮲ\"],[[43955,43955],\"mapped\",\"Ꮳ\"],[[43956,43956],\"mapped\",\"Ꮴ\"],[[43957,43957],\"mapped\",\"Ꮵ\"],[[43958,43958],\"mapped\",\"Ꮶ\"],[[43959,43959],\"mapped\",\"Ꮷ\"],[[43960,43960],\"mapped\",\"Ꮸ\"],[[43961,43961],\"mapped\",\"Ꮹ\"],[[43962,43962],\"mapped\",\"Ꮺ\"],[[43963,43963],\"mapped\",\"Ꮻ\"],[[43964,43964],\"mapped\",\"Ꮼ\"],[[43965,43965],\"mapped\",\"Ꮽ\"],[[43966,43966],\"mapped\",\"Ꮾ\"],[[43967,43967],\"mapped\",\"Ꮿ\"],[[43968,44010],\"valid\"],[[44011,44011],\"valid\",\"\",\"NV8\"],[[44012,44013],\"valid\"],[[44014,44015],\"disallowed\"],[[44016,44025],\"valid\"],[[44026,44031],\"disallowed\"],[[44032,55203],\"valid\"],[[55204,55215],\"disallowed\"],[[55216,55238],\"valid\",\"\",\"NV8\"],[[55239,55242],\"disallowed\"],[[55243,55291],\"valid\",\"\",\"NV8\"],[[55292,55295],\"disallowed\"],[[55296,57343],\"disallowed\"],[[57344,63743],\"disallowed\"],[[63744,63744],\"mapped\",\"豈\"],[[63745,63745],\"mapped\",\"更\"],[[63746,63746],\"mapped\",\"車\"],[[63747,63747],\"mapped\",\"賈\"],[[63748,63748],\"mapped\",\"滑\"],[[63749,63749],\"mapped\",\"串\"],[[63750,63750],\"mapped\",\"句\"],[[63751,63752],\"mapped\",\"龜\"],[[63753,63753],\"mapped\",\"契\"],[[63754,63754],\"mapped\",\"金\"],[[63755,63755],\"mapped\",\"喇\"],[[63756,63756],\"mapped\",\"奈\"],[[63757,63757],\"mapped\",\"懶\"],[[63758,63758],\"mapped\",\"癩\"],[[63759,63759],\"mapped\",\"羅\"],[[63760,63760],\"mapped\",\"蘿\"],[[63761,63761],\"mapped\",\"螺\"],[[63762,63762],\"mapped\",\"裸\"],[[63763,63763],\"mapped\",\"邏\"],[[63764,63764],\"mapped\",\"樂\"],[[63765,63765],\"mapped\",\"洛\"],[[63766,63766],\"mapped\",\"烙\"],[[63767,63767],\"mapped\",\"珞\"],[[63768,63768],\"mapped\",\"落\"],[[63769,63769],\"mapped\",\"酪\"],[[63770,63770],\"mapped\",\"駱\"],[[63771,63771],\"mapped\",\"亂\"],[[63772,63772],\"mapped\",\"卵\"],[[63773,63773],\"mapped\",\"欄\"],[[63774,63774],\"mapped\",\"爛\"],[[63775,63775],\"mapped\",\"蘭\"],[[63776,63776],\"mapped\",\"鸞\"],[[63777,63777],\"mapped\",\"嵐\"],[[63778,63778],\"mapped\",\"濫\"],[[63779,63779],\"mapped\",\"藍\"],[[63780,63780],\"mapped\",\"襤\"],[[63781,63781],\"mapped\",\"拉\"],[[63782,63782],\"mapped\",\"臘\"],[[63783,63783],\"mapped\",\"蠟\"],[[63784,63784],\"mapped\",\"廊\"],[[63785,63785],\"mapped\",\"朗\"],[[63786,63786],\"mapped\",\"浪\"],[[63787,63787],\"mapped\",\"狼\"],[[63788,63788],\"mapped\",\"郎\"],[[63789,63789],\"mapped\",\"來\"],[[63790,63790],\"mapped\",\"冷\"],[[63791,63791],\"mapped\",\"勞\"],[[63792,63792],\"mapped\",\"擄\"],[[63793,63793],\"mapped\",\"櫓\"],[[63794,63794],\"mapped\",\"爐\"],[[63795,63795],\"mapped\",\"盧\"],[[63796,63796],\"mapped\",\"老\"],[[63797,63797],\"mapped\",\"蘆\"],[[63798,63798],\"mapped\",\"虜\"],[[63799,63799],\"mapped\",\"路\"],[[63800,63800],\"mapped\",\"露\"],[[63801,63801],\"mapped\",\"魯\"],[[63802,63802],\"mapped\",\"鷺\"],[[63803,63803],\"mapped\",\"碌\"],[[63804,63804],\"mapped\",\"祿\"],[[63805,63805],\"mapped\",\"綠\"],[[63806,63806],\"mapped\",\"菉\"],[[63807,63807],\"mapped\",\"錄\"],[[63808,63808],\"mapped\",\"鹿\"],[[63809,63809],\"mapped\",\"論\"],[[63810,63810],\"mapped\",\"壟\"],[[63811,63811],\"mapped\",\"弄\"],[[63812,63812],\"mapped\",\"籠\"],[[63813,63813],\"mapped\",\"聾\"],[[63814,63814],\"mapped\",\"牢\"],[[63815,63815],\"mapped\",\"磊\"],[[63816,63816],\"mapped\",\"賂\"],[[63817,63817],\"mapped\",\"雷\"],[[63818,63818],\"mapped\",\"壘\"],[[63819,63819],\"mapped\",\"屢\"],[[63820,63820],\"mapped\",\"樓\"],[[63821,63821],\"mapped\",\"淚\"],[[63822,63822],\"mapped\",\"漏\"],[[63823,63823],\"mapped\",\"累\"],[[63824,63824],\"mapped\",\"縷\"],[[63825,63825],\"mapped\",\"陋\"],[[63826,63826],\"mapped\",\"勒\"],[[63827,63827],\"mapped\",\"肋\"],[[63828,63828],\"mapped\",\"凜\"],[[63829,63829],\"mapped\",\"凌\"],[[63830,63830],\"mapped\",\"稜\"],[[63831,63831],\"mapped\",\"綾\"],[[63832,63832],\"mapped\",\"菱\"],[[63833,63833],\"mapped\",\"陵\"],[[63834,63834],\"mapped\",\"讀\"],[[63835,63835],\"mapped\",\"拏\"],[[63836,63836],\"mapped\",\"樂\"],[[63837,63837],\"mapped\",\"諾\"],[[63838,63838],\"mapped\",\"丹\"],[[63839,63839],\"mapped\",\"寧\"],[[63840,63840],\"mapped\",\"怒\"],[[63841,63841],\"mapped\",\"率\"],[[63842,63842],\"mapped\",\"異\"],[[63843,63843],\"mapped\",\"北\"],[[63844,63844],\"mapped\",\"磻\"],[[63845,63845],\"mapped\",\"便\"],[[63846,63846],\"mapped\",\"復\"],[[63847,63847],\"mapped\",\"不\"],[[63848,63848],\"mapped\",\"泌\"],[[63849,63849],\"mapped\",\"數\"],[[63850,63850],\"mapped\",\"索\"],[[63851,63851],\"mapped\",\"參\"],[[63852,63852],\"mapped\",\"塞\"],[[63853,63853],\"mapped\",\"省\"],[[63854,63854],\"mapped\",\"葉\"],[[63855,63855],\"mapped\",\"說\"],[[63856,63856],\"mapped\",\"殺\"],[[63857,63857],\"mapped\",\"辰\"],[[63858,63858],\"mapped\",\"沈\"],[[63859,63859],\"mapped\",\"拾\"],[[63860,63860],\"mapped\",\"若\"],[[63861,63861],\"mapped\",\"掠\"],[[63862,63862],\"mapped\",\"略\"],[[63863,63863],\"mapped\",\"亮\"],[[63864,63864],\"mapped\",\"兩\"],[[63865,63865],\"mapped\",\"凉\"],[[63866,63866],\"mapped\",\"梁\"],[[63867,63867],\"mapped\",\"糧\"],[[63868,63868],\"mapped\",\"良\"],[[63869,63869],\"mapped\",\"諒\"],[[63870,63870],\"mapped\",\"量\"],[[63871,63871],\"mapped\",\"勵\"],[[63872,63872],\"mapped\",\"呂\"],[[63873,63873],\"mapped\",\"女\"],[[63874,63874],\"mapped\",\"廬\"],[[63875,63875],\"mapped\",\"旅\"],[[63876,63876],\"mapped\",\"濾\"],[[63877,63877],\"mapped\",\"礪\"],[[63878,63878],\"mapped\",\"閭\"],[[63879,63879],\"mapped\",\"驪\"],[[63880,63880],\"mapped\",\"麗\"],[[63881,63881],\"mapped\",\"黎\"],[[63882,63882],\"mapped\",\"力\"],[[63883,63883],\"mapped\",\"曆\"],[[63884,63884],\"mapped\",\"歷\"],[[63885,63885],\"mapped\",\"轢\"],[[63886,63886],\"mapped\",\"年\"],[[63887,63887],\"mapped\",\"憐\"],[[63888,63888],\"mapped\",\"戀\"],[[63889,63889],\"mapped\",\"撚\"],[[63890,63890],\"mapped\",\"漣\"],[[63891,63891],\"mapped\",\"煉\"],[[63892,63892],\"mapped\",\"璉\"],[[63893,63893],\"mapped\",\"秊\"],[[63894,63894],\"mapped\",\"練\"],[[63895,63895],\"mapped\",\"聯\"],[[63896,63896],\"mapped\",\"輦\"],[[63897,63897],\"mapped\",\"蓮\"],[[63898,63898],\"mapped\",\"連\"],[[63899,63899],\"mapped\",\"鍊\"],[[63900,63900],\"mapped\",\"列\"],[[63901,63901],\"mapped\",\"劣\"],[[63902,63902],\"mapped\",\"咽\"],[[63903,63903],\"mapped\",\"烈\"],[[63904,63904],\"mapped\",\"裂\"],[[63905,63905],\"mapped\",\"說\"],[[63906,63906],\"mapped\",\"廉\"],[[63907,63907],\"mapped\",\"念\"],[[63908,63908],\"mapped\",\"捻\"],[[63909,63909],\"mapped\",\"殮\"],[[63910,63910],\"mapped\",\"簾\"],[[63911,63911],\"mapped\",\"獵\"],[[63912,63912],\"mapped\",\"令\"],[[63913,63913],\"mapped\",\"囹\"],[[63914,63914],\"mapped\",\"寧\"],[[63915,63915],\"mapped\",\"嶺\"],[[63916,63916],\"mapped\",\"怜\"],[[63917,63917],\"mapped\",\"玲\"],[[63918,63918],\"mapped\",\"瑩\"],[[63919,63919],\"mapped\",\"羚\"],[[63920,63920],\"mapped\",\"聆\"],[[63921,63921],\"mapped\",\"鈴\"],[[63922,63922],\"mapped\",\"零\"],[[63923,63923],\"mapped\",\"靈\"],[[63924,63924],\"mapped\",\"領\"],[[63925,63925],\"mapped\",\"例\"],[[63926,63926],\"mapped\",\"禮\"],[[63927,63927],\"mapped\",\"醴\"],[[63928,63928],\"mapped\",\"隸\"],[[63929,63929],\"mapped\",\"惡\"],[[63930,63930],\"mapped\",\"了\"],[[63931,63931],\"mapped\",\"僚\"],[[63932,63932],\"mapped\",\"寮\"],[[63933,63933],\"mapped\",\"尿\"],[[63934,63934],\"mapped\",\"料\"],[[63935,63935],\"mapped\",\"樂\"],[[63936,63936],\"mapped\",\"燎\"],[[63937,63937],\"mapped\",\"療\"],[[63938,63938],\"mapped\",\"蓼\"],[[63939,63939],\"mapped\",\"遼\"],[[63940,63940],\"mapped\",\"龍\"],[[63941,63941],\"mapped\",\"暈\"],[[63942,63942],\"mapped\",\"阮\"],[[63943,63943],\"mapped\",\"劉\"],[[63944,63944],\"mapped\",\"杻\"],[[63945,63945],\"mapped\",\"柳\"],[[63946,63946],\"mapped\",\"流\"],[[63947,63947],\"mapped\",\"溜\"],[[63948,63948],\"mapped\",\"琉\"],[[63949,63949],\"mapped\",\"留\"],[[63950,63950],\"mapped\",\"硫\"],[[63951,63951],\"mapped\",\"紐\"],[[63952,63952],\"mapped\",\"類\"],[[63953,63953],\"mapped\",\"六\"],[[63954,63954],\"mapped\",\"戮\"],[[63955,63955],\"mapped\",\"陸\"],[[63956,63956],\"mapped\",\"倫\"],[[63957,63957],\"mapped\",\"崙\"],[[63958,63958],\"mapped\",\"淪\"],[[63959,63959],\"mapped\",\"輪\"],[[63960,63960],\"mapped\",\"律\"],[[63961,63961],\"mapped\",\"慄\"],[[63962,63962],\"mapped\",\"栗\"],[[63963,63963],\"mapped\",\"率\"],[[63964,63964],\"mapped\",\"隆\"],[[63965,63965],\"mapped\",\"利\"],[[63966,63966],\"mapped\",\"吏\"],[[63967,63967],\"mapped\",\"履\"],[[63968,63968],\"mapped\",\"易\"],[[63969,63969],\"mapped\",\"李\"],[[63970,63970],\"mapped\",\"梨\"],[[63971,63971],\"mapped\",\"泥\"],[[63972,63972],\"mapped\",\"理\"],[[63973,63973],\"mapped\",\"痢\"],[[63974,63974],\"mapped\",\"罹\"],[[63975,63975],\"mapped\",\"裏\"],[[63976,63976],\"mapped\",\"裡\"],[[63977,63977],\"mapped\",\"里\"],[[63978,63978],\"mapped\",\"離\"],[[63979,63979],\"mapped\",\"匿\"],[[63980,63980],\"mapped\",\"溺\"],[[63981,63981],\"mapped\",\"吝\"],[[63982,63982],\"mapped\",\"燐\"],[[63983,63983],\"mapped\",\"璘\"],[[63984,63984],\"mapped\",\"藺\"],[[63985,63985],\"mapped\",\"隣\"],[[63986,63986],\"mapped\",\"鱗\"],[[63987,63987],\"mapped\",\"麟\"],[[63988,63988],\"mapped\",\"林\"],[[63989,63989],\"mapped\",\"淋\"],[[63990,63990],\"mapped\",\"臨\"],[[63991,63991],\"mapped\",\"立\"],[[63992,63992],\"mapped\",\"笠\"],[[63993,63993],\"mapped\",\"粒\"],[[63994,63994],\"mapped\",\"狀\"],[[63995,63995],\"mapped\",\"炙\"],[[63996,63996],\"mapped\",\"識\"],[[63997,63997],\"mapped\",\"什\"],[[63998,63998],\"mapped\",\"茶\"],[[63999,63999],\"mapped\",\"刺\"],[[64000,64000],\"mapped\",\"切\"],[[64001,64001],\"mapped\",\"度\"],[[64002,64002],\"mapped\",\"拓\"],[[64003,64003],\"mapped\",\"糖\"],[[64004,64004],\"mapped\",\"宅\"],[[64005,64005],\"mapped\",\"洞\"],[[64006,64006],\"mapped\",\"暴\"],[[64007,64007],\"mapped\",\"輻\"],[[64008,64008],\"mapped\",\"行\"],[[64009,64009],\"mapped\",\"降\"],[[64010,64010],\"mapped\",\"見\"],[[64011,64011],\"mapped\",\"廓\"],[[64012,64012],\"mapped\",\"兀\"],[[64013,64013],\"mapped\",\"嗀\"],[[64014,64015],\"valid\"],[[64016,64016],\"mapped\",\"塚\"],[[64017,64017],\"valid\"],[[64018,64018],\"mapped\",\"晴\"],[[64019,64020],\"valid\"],[[64021,64021],\"mapped\",\"凞\"],[[64022,64022],\"mapped\",\"猪\"],[[64023,64023],\"mapped\",\"益\"],[[64024,64024],\"mapped\",\"礼\"],[[64025,64025],\"mapped\",\"神\"],[[64026,64026],\"mapped\",\"祥\"],[[64027,64027],\"mapped\",\"福\"],[[64028,64028],\"mapped\",\"靖\"],[[64029,64029],\"mapped\",\"精\"],[[64030,64030],\"mapped\",\"羽\"],[[64031,64031],\"valid\"],[[64032,64032],\"mapped\",\"蘒\"],[[64033,64033],\"valid\"],[[64034,64034],\"mapped\",\"諸\"],[[64035,64036],\"valid\"],[[64037,64037],\"mapped\",\"逸\"],[[64038,64038],\"mapped\",\"都\"],[[64039,64041],\"valid\"],[[64042,64042],\"mapped\",\"飯\"],[[64043,64043],\"mapped\",\"飼\"],[[64044,64044],\"mapped\",\"館\"],[[64045,64045],\"mapped\",\"鶴\"],[[64046,64046],\"mapped\",\"郞\"],[[64047,64047],\"mapped\",\"隷\"],[[64048,64048],\"mapped\",\"侮\"],[[64049,64049],\"mapped\",\"僧\"],[[64050,64050],\"mapped\",\"免\"],[[64051,64051],\"mapped\",\"勉\"],[[64052,64052],\"mapped\",\"勤\"],[[64053,64053],\"mapped\",\"卑\"],[[64054,64054],\"mapped\",\"喝\"],[[64055,64055],\"mapped\",\"嘆\"],[[64056,64056],\"mapped\",\"器\"],[[64057,64057],\"mapped\",\"塀\"],[[64058,64058],\"mapped\",\"墨\"],[[64059,64059],\"mapped\",\"層\"],[[64060,64060],\"mapped\",\"屮\"],[[64061,64061],\"mapped\",\"悔\"],[[64062,64062],\"mapped\",\"慨\"],[[64063,64063],\"mapped\",\"憎\"],[[64064,64064],\"mapped\",\"懲\"],[[64065,64065],\"mapped\",\"敏\"],[[64066,64066],\"mapped\",\"既\"],[[64067,64067],\"mapped\",\"暑\"],[[64068,64068],\"mapped\",\"梅\"],[[64069,64069],\"mapped\",\"海\"],[[64070,64070],\"mapped\",\"渚\"],[[64071,64071],\"mapped\",\"漢\"],[[64072,64072],\"mapped\",\"煮\"],[[64073,64073],\"mapped\",\"爫\"],[[64074,64074],\"mapped\",\"琢\"],[[64075,64075],\"mapped\",\"碑\"],[[64076,64076],\"mapped\",\"社\"],[[64077,64077],\"mapped\",\"祉\"],[[64078,64078],\"mapped\",\"祈\"],[[64079,64079],\"mapped\",\"祐\"],[[64080,64080],\"mapped\",\"祖\"],[[64081,64081],\"mapped\",\"祝\"],[[64082,64082],\"mapped\",\"禍\"],[[64083,64083],\"mapped\",\"禎\"],[[64084,64084],\"mapped\",\"穀\"],[[64085,64085],\"mapped\",\"突\"],[[64086,64086],\"mapped\",\"節\"],[[64087,64087],\"mapped\",\"練\"],[[64088,64088],\"mapped\",\"縉\"],[[64089,64089],\"mapped\",\"繁\"],[[64090,64090],\"mapped\",\"署\"],[[64091,64091],\"mapped\",\"者\"],[[64092,64092],\"mapped\",\"臭\"],[[64093,64094],\"mapped\",\"艹\"],[[64095,64095],\"mapped\",\"著\"],[[64096,64096],\"mapped\",\"褐\"],[[64097,64097],\"mapped\",\"視\"],[[64098,64098],\"mapped\",\"謁\"],[[64099,64099],\"mapped\",\"謹\"],[[64100,64100],\"mapped\",\"賓\"],[[64101,64101],\"mapped\",\"贈\"],[[64102,64102],\"mapped\",\"辶\"],[[64103,64103],\"mapped\",\"逸\"],[[64104,64104],\"mapped\",\"難\"],[[64105,64105],\"mapped\",\"響\"],[[64106,64106],\"mapped\",\"頻\"],[[64107,64107],\"mapped\",\"恵\"],[[64108,64108],\"mapped\",\"𤋮\"],[[64109,64109],\"mapped\",\"舘\"],[[64110,64111],\"disallowed\"],[[64112,64112],\"mapped\",\"並\"],[[64113,64113],\"mapped\",\"况\"],[[64114,64114],\"mapped\",\"全\"],[[64115,64115],\"mapped\",\"侀\"],[[64116,64116],\"mapped\",\"充\"],[[64117,64117],\"mapped\",\"冀\"],[[64118,64118],\"mapped\",\"勇\"],[[64119,64119],\"mapped\",\"勺\"],[[64120,64120],\"mapped\",\"喝\"],[[64121,64121],\"mapped\",\"啕\"],[[64122,64122],\"mapped\",\"喙\"],[[64123,64123],\"mapped\",\"嗢\"],[[64124,64124],\"mapped\",\"塚\"],[[64125,64125],\"mapped\",\"墳\"],[[64126,64126],\"mapped\",\"奄\"],[[64127,64127],\"mapped\",\"奔\"],[[64128,64128],\"mapped\",\"婢\"],[[64129,64129],\"mapped\",\"嬨\"],[[64130,64130],\"mapped\",\"廒\"],[[64131,64131],\"mapped\",\"廙\"],[[64132,64132],\"mapped\",\"彩\"],[[64133,64133],\"mapped\",\"徭\"],[[64134,64134],\"mapped\",\"惘\"],[[64135,64135],\"mapped\",\"慎\"],[[64136,64136],\"mapped\",\"愈\"],[[64137,64137],\"mapped\",\"憎\"],[[64138,64138],\"mapped\",\"慠\"],[[64139,64139],\"mapped\",\"懲\"],[[64140,64140],\"mapped\",\"戴\"],[[64141,64141],\"mapped\",\"揄\"],[[64142,64142],\"mapped\",\"搜\"],[[64143,64143],\"mapped\",\"摒\"],[[64144,64144],\"mapped\",\"敖\"],[[64145,64145],\"mapped\",\"晴\"],[[64146,64146],\"mapped\",\"朗\"],[[64147,64147],\"mapped\",\"望\"],[[64148,64148],\"mapped\",\"杖\"],[[64149,64149],\"mapped\",\"歹\"],[[64150,64150],\"mapped\",\"殺\"],[[64151,64151],\"mapped\",\"流\"],[[64152,64152],\"mapped\",\"滛\"],[[64153,64153],\"mapped\",\"滋\"],[[64154,64154],\"mapped\",\"漢\"],[[64155,64155],\"mapped\",\"瀞\"],[[64156,64156],\"mapped\",\"煮\"],[[64157,64157],\"mapped\",\"瞧\"],[[64158,64158],\"mapped\",\"爵\"],[[64159,64159],\"mapped\",\"犯\"],[[64160,64160],\"mapped\",\"猪\"],[[64161,64161],\"mapped\",\"瑱\"],[[64162,64162],\"mapped\",\"甆\"],[[64163,64163],\"mapped\",\"画\"],[[64164,64164],\"mapped\",\"瘝\"],[[64165,64165],\"mapped\",\"瘟\"],[[64166,64166],\"mapped\",\"益\"],[[64167,64167],\"mapped\",\"盛\"],[[64168,64168],\"mapped\",\"直\"],[[64169,64169],\"mapped\",\"睊\"],[[64170,64170],\"mapped\",\"着\"],[[64171,64171],\"mapped\",\"磌\"],[[64172,64172],\"mapped\",\"窱\"],[[64173,64173],\"mapped\",\"節\"],[[64174,64174],\"mapped\",\"类\"],[[64175,64175],\"mapped\",\"絛\"],[[64176,64176],\"mapped\",\"練\"],[[64177,64177],\"mapped\",\"缾\"],[[64178,64178],\"mapped\",\"者\"],[[64179,64179],\"mapped\",\"荒\"],[[64180,64180],\"mapped\",\"華\"],[[64181,64181],\"mapped\",\"蝹\"],[[64182,64182],\"mapped\",\"襁\"],[[64183,64183],\"mapped\",\"覆\"],[[64184,64184],\"mapped\",\"視\"],[[64185,64185],\"mapped\",\"調\"],[[64186,64186],\"mapped\",\"諸\"],[[64187,64187],\"mapped\",\"請\"],[[64188,64188],\"mapped\",\"謁\"],[[64189,64189],\"mapped\",\"諾\"],[[64190,64190],\"mapped\",\"諭\"],[[64191,64191],\"mapped\",\"謹\"],[[64192,64192],\"mapped\",\"變\"],[[64193,64193],\"mapped\",\"贈\"],[[64194,64194],\"mapped\",\"輸\"],[[64195,64195],\"mapped\",\"遲\"],[[64196,64196],\"mapped\",\"醙\"],[[64197,64197],\"mapped\",\"鉶\"],[[64198,64198],\"mapped\",\"陼\"],[[64199,64199],\"mapped\",\"難\"],[[64200,64200],\"mapped\",\"靖\"],[[64201,64201],\"mapped\",\"韛\"],[[64202,64202],\"mapped\",\"響\"],[[64203,64203],\"mapped\",\"頋\"],[[64204,64204],\"mapped\",\"頻\"],[[64205,64205],\"mapped\",\"鬒\"],[[64206,64206],\"mapped\",\"龜\"],[[64207,64207],\"mapped\",\"𢡊\"],[[64208,64208],\"mapped\",\"𢡄\"],[[64209,64209],\"mapped\",\"𣏕\"],[[64210,64210],\"mapped\",\"㮝\"],[[64211,64211],\"mapped\",\"䀘\"],[[64212,64212],\"mapped\",\"䀹\"],[[64213,64213],\"mapped\",\"𥉉\"],[[64214,64214],\"mapped\",\"𥳐\"],[[64215,64215],\"mapped\",\"𧻓\"],[[64216,64216],\"mapped\",\"齃\"],[[64217,64217],\"mapped\",\"龎\"],[[64218,64255],\"disallowed\"],[[64256,64256],\"mapped\",\"ff\"],[[64257,64257],\"mapped\",\"fi\"],[[64258,64258],\"mapped\",\"fl\"],[[64259,64259],\"mapped\",\"ffi\"],[[64260,64260],\"mapped\",\"ffl\"],[[64261,64262],\"mapped\",\"st\"],[[64263,64274],\"disallowed\"],[[64275,64275],\"mapped\",\"մն\"],[[64276,64276],\"mapped\",\"մե\"],[[64277,64277],\"mapped\",\"մի\"],[[64278,64278],\"mapped\",\"վն\"],[[64279,64279],\"mapped\",\"մխ\"],[[64280,64284],\"disallowed\"],[[64285,64285],\"mapped\",\"יִ\"],[[64286,64286],\"valid\"],[[64287,64287],\"mapped\",\"ײַ\"],[[64288,64288],\"mapped\",\"ע\"],[[64289,64289],\"mapped\",\"א\"],[[64290,64290],\"mapped\",\"ד\"],[[64291,64291],\"mapped\",\"ה\"],[[64292,64292],\"mapped\",\"כ\"],[[64293,64293],\"mapped\",\"ל\"],[[64294,64294],\"mapped\",\"ם\"],[[64295,64295],\"mapped\",\"ר\"],[[64296,64296],\"mapped\",\"ת\"],[[64297,64297],\"disallowed_STD3_mapped\",\"+\"],[[64298,64298],\"mapped\",\"שׁ\"],[[64299,64299],\"mapped\",\"שׂ\"],[[64300,64300],\"mapped\",\"שּׁ\"],[[64301,64301],\"mapped\",\"שּׂ\"],[[64302,64302],\"mapped\",\"אַ\"],[[64303,64303],\"mapped\",\"אָ\"],[[64304,64304],\"mapped\",\"אּ\"],[[64305,64305],\"mapped\",\"בּ\"],[[64306,64306],\"mapped\",\"גּ\"],[[64307,64307],\"mapped\",\"דּ\"],[[64308,64308],\"mapped\",\"הּ\"],[[64309,64309],\"mapped\",\"וּ\"],[[64310,64310],\"mapped\",\"זּ\"],[[64311,64311],\"disallowed\"],[[64312,64312],\"mapped\",\"טּ\"],[[64313,64313],\"mapped\",\"יּ\"],[[64314,64314],\"mapped\",\"ךּ\"],[[64315,64315],\"mapped\",\"כּ\"],[[64316,64316],\"mapped\",\"לּ\"],[[64317,64317],\"disallowed\"],[[64318,64318],\"mapped\",\"מּ\"],[[64319,64319],\"disallowed\"],[[64320,64320],\"mapped\",\"נּ\"],[[64321,64321],\"mapped\",\"סּ\"],[[64322,64322],\"disallowed\"],[[64323,64323],\"mapped\",\"ףּ\"],[[64324,64324],\"mapped\",\"פּ\"],[[64325,64325],\"disallowed\"],[[64326,64326],\"mapped\",\"צּ\"],[[64327,64327],\"mapped\",\"קּ\"],[[64328,64328],\"mapped\",\"רּ\"],[[64329,64329],\"mapped\",\"שּ\"],[[64330,64330],\"mapped\",\"תּ\"],[[64331,64331],\"mapped\",\"וֹ\"],[[64332,64332],\"mapped\",\"בֿ\"],[[64333,64333],\"mapped\",\"כֿ\"],[[64334,64334],\"mapped\",\"פֿ\"],[[64335,64335],\"mapped\",\"אל\"],[[64336,64337],\"mapped\",\"ٱ\"],[[64338,64341],\"mapped\",\"ٻ\"],[[64342,64345],\"mapped\",\"پ\"],[[64346,64349],\"mapped\",\"ڀ\"],[[64350,64353],\"mapped\",\"ٺ\"],[[64354,64357],\"mapped\",\"ٿ\"],[[64358,64361],\"mapped\",\"ٹ\"],[[64362,64365],\"mapped\",\"ڤ\"],[[64366,64369],\"mapped\",\"ڦ\"],[[64370,64373],\"mapped\",\"ڄ\"],[[64374,64377],\"mapped\",\"ڃ\"],[[64378,64381],\"mapped\",\"چ\"],[[64382,64385],\"mapped\",\"ڇ\"],[[64386,64387],\"mapped\",\"ڍ\"],[[64388,64389],\"mapped\",\"ڌ\"],[[64390,64391],\"mapped\",\"ڎ\"],[[64392,64393],\"mapped\",\"ڈ\"],[[64394,64395],\"mapped\",\"ژ\"],[[64396,64397],\"mapped\",\"ڑ\"],[[64398,64401],\"mapped\",\"ک\"],[[64402,64405],\"mapped\",\"گ\"],[[64406,64409],\"mapped\",\"ڳ\"],[[64410,64413],\"mapped\",\"ڱ\"],[[64414,64415],\"mapped\",\"ں\"],[[64416,64419],\"mapped\",\"ڻ\"],[[64420,64421],\"mapped\",\"ۀ\"],[[64422,64425],\"mapped\",\"ہ\"],[[64426,64429],\"mapped\",\"ھ\"],[[64430,64431],\"mapped\",\"ے\"],[[64432,64433],\"mapped\",\"ۓ\"],[[64434,64449],\"valid\",\"\",\"NV8\"],[[64450,64466],\"disallowed\"],[[64467,64470],\"mapped\",\"ڭ\"],[[64471,64472],\"mapped\",\"ۇ\"],[[64473,64474],\"mapped\",\"ۆ\"],[[64475,64476],\"mapped\",\"ۈ\"],[[64477,64477],\"mapped\",\"ۇٴ\"],[[64478,64479],\"mapped\",\"ۋ\"],[[64480,64481],\"mapped\",\"ۅ\"],[[64482,64483],\"mapped\",\"ۉ\"],[[64484,64487],\"mapped\",\"ې\"],[[64488,64489],\"mapped\",\"ى\"],[[64490,64491],\"mapped\",\"ئا\"],[[64492,64493],\"mapped\",\"ئە\"],[[64494,64495],\"mapped\",\"ئو\"],[[64496,64497],\"mapped\",\"ئۇ\"],[[64498,64499],\"mapped\",\"ئۆ\"],[[64500,64501],\"mapped\",\"ئۈ\"],[[64502,64504],\"mapped\",\"ئې\"],[[64505,64507],\"mapped\",\"ئى\"],[[64508,64511],\"mapped\",\"ی\"],[[64512,64512],\"mapped\",\"ئج\"],[[64513,64513],\"mapped\",\"ئح\"],[[64514,64514],\"mapped\",\"ئم\"],[[64515,64515],\"mapped\",\"ئى\"],[[64516,64516],\"mapped\",\"ئي\"],[[64517,64517],\"mapped\",\"بج\"],[[64518,64518],\"mapped\",\"بح\"],[[64519,64519],\"mapped\",\"بخ\"],[[64520,64520],\"mapped\",\"بم\"],[[64521,64521],\"mapped\",\"بى\"],[[64522,64522],\"mapped\",\"بي\"],[[64523,64523],\"mapped\",\"تج\"],[[64524,64524],\"mapped\",\"تح\"],[[64525,64525],\"mapped\",\"تخ\"],[[64526,64526],\"mapped\",\"تم\"],[[64527,64527],\"mapped\",\"تى\"],[[64528,64528],\"mapped\",\"تي\"],[[64529,64529],\"mapped\",\"ثج\"],[[64530,64530],\"mapped\",\"ثم\"],[[64531,64531],\"mapped\",\"ثى\"],[[64532,64532],\"mapped\",\"ثي\"],[[64533,64533],\"mapped\",\"جح\"],[[64534,64534],\"mapped\",\"جم\"],[[64535,64535],\"mapped\",\"حج\"],[[64536,64536],\"mapped\",\"حم\"],[[64537,64537],\"mapped\",\"خج\"],[[64538,64538],\"mapped\",\"خح\"],[[64539,64539],\"mapped\",\"خم\"],[[64540,64540],\"mapped\",\"سج\"],[[64541,64541],\"mapped\",\"سح\"],[[64542,64542],\"mapped\",\"سخ\"],[[64543,64543],\"mapped\",\"سم\"],[[64544,64544],\"mapped\",\"صح\"],[[64545,64545],\"mapped\",\"صم\"],[[64546,64546],\"mapped\",\"ضج\"],[[64547,64547],\"mapped\",\"ضح\"],[[64548,64548],\"mapped\",\"ضخ\"],[[64549,64549],\"mapped\",\"ضم\"],[[64550,64550],\"mapped\",\"طح\"],[[64551,64551],\"mapped\",\"طم\"],[[64552,64552],\"mapped\",\"ظم\"],[[64553,64553],\"mapped\",\"عج\"],[[64554,64554],\"mapped\",\"عم\"],[[64555,64555],\"mapped\",\"غج\"],[[64556,64556],\"mapped\",\"غم\"],[[64557,64557],\"mapped\",\"فج\"],[[64558,64558],\"mapped\",\"فح\"],[[64559,64559],\"mapped\",\"فخ\"],[[64560,64560],\"mapped\",\"فم\"],[[64561,64561],\"mapped\",\"فى\"],[[64562,64562],\"mapped\",\"في\"],[[64563,64563],\"mapped\",\"قح\"],[[64564,64564],\"mapped\",\"قم\"],[[64565,64565],\"mapped\",\"قى\"],[[64566,64566],\"mapped\",\"قي\"],[[64567,64567],\"mapped\",\"كا\"],[[64568,64568],\"mapped\",\"كج\"],[[64569,64569],\"mapped\",\"كح\"],[[64570,64570],\"mapped\",\"كخ\"],[[64571,64571],\"mapped\",\"كل\"],[[64572,64572],\"mapped\",\"كم\"],[[64573,64573],\"mapped\",\"كى\"],[[64574,64574],\"mapped\",\"كي\"],[[64575,64575],\"mapped\",\"لج\"],[[64576,64576],\"mapped\",\"لح\"],[[64577,64577],\"mapped\",\"لخ\"],[[64578,64578],\"mapped\",\"لم\"],[[64579,64579],\"mapped\",\"لى\"],[[64580,64580],\"mapped\",\"لي\"],[[64581,64581],\"mapped\",\"مج\"],[[64582,64582],\"mapped\",\"مح\"],[[64583,64583],\"mapped\",\"مخ\"],[[64584,64584],\"mapped\",\"مم\"],[[64585,64585],\"mapped\",\"مى\"],[[64586,64586],\"mapped\",\"مي\"],[[64587,64587],\"mapped\",\"نج\"],[[64588,64588],\"mapped\",\"نح\"],[[64589,64589],\"mapped\",\"نخ\"],[[64590,64590],\"mapped\",\"نم\"],[[64591,64591],\"mapped\",\"نى\"],[[64592,64592],\"mapped\",\"ني\"],[[64593,64593],\"mapped\",\"هج\"],[[64594,64594],\"mapped\",\"هم\"],[[64595,64595],\"mapped\",\"هى\"],[[64596,64596],\"mapped\",\"هي\"],[[64597,64597],\"mapped\",\"يج\"],[[64598,64598],\"mapped\",\"يح\"],[[64599,64599],\"mapped\",\"يخ\"],[[64600,64600],\"mapped\",\"يم\"],[[64601,64601],\"mapped\",\"يى\"],[[64602,64602],\"mapped\",\"يي\"],[[64603,64603],\"mapped\",\"ذٰ\"],[[64604,64604],\"mapped\",\"رٰ\"],[[64605,64605],\"mapped\",\"ىٰ\"],[[64606,64606],\"disallowed_STD3_mapped\",\" ٌّ\"],[[64607,64607],\"disallowed_STD3_mapped\",\" ٍّ\"],[[64608,64608],\"disallowed_STD3_mapped\",\" َّ\"],[[64609,64609],\"disallowed_STD3_mapped\",\" ُّ\"],[[64610,64610],\"disallowed_STD3_mapped\",\" ِّ\"],[[64611,64611],\"disallowed_STD3_mapped\",\" ّٰ\"],[[64612,64612],\"mapped\",\"ئر\"],[[64613,64613],\"mapped\",\"ئز\"],[[64614,64614],\"mapped\",\"ئم\"],[[64615,64615],\"mapped\",\"ئن\"],[[64616,64616],\"mapped\",\"ئى\"],[[64617,64617],\"mapped\",\"ئي\"],[[64618,64618],\"mapped\",\"بر\"],[[64619,64619],\"mapped\",\"بز\"],[[64620,64620],\"mapped\",\"بم\"],[[64621,64621],\"mapped\",\"بن\"],[[64622,64622],\"mapped\",\"بى\"],[[64623,64623],\"mapped\",\"بي\"],[[64624,64624],\"mapped\",\"تر\"],[[64625,64625],\"mapped\",\"تز\"],[[64626,64626],\"mapped\",\"تم\"],[[64627,64627],\"mapped\",\"تن\"],[[64628,64628],\"mapped\",\"تى\"],[[64629,64629],\"mapped\",\"تي\"],[[64630,64630],\"mapped\",\"ثر\"],[[64631,64631],\"mapped\",\"ثز\"],[[64632,64632],\"mapped\",\"ثم\"],[[64633,64633],\"mapped\",\"ثن\"],[[64634,64634],\"mapped\",\"ثى\"],[[64635,64635],\"mapped\",\"ثي\"],[[64636,64636],\"mapped\",\"فى\"],[[64637,64637],\"mapped\",\"في\"],[[64638,64638],\"mapped\",\"قى\"],[[64639,64639],\"mapped\",\"قي\"],[[64640,64640],\"mapped\",\"كا\"],[[64641,64641],\"mapped\",\"كل\"],[[64642,64642],\"mapped\",\"كم\"],[[64643,64643],\"mapped\",\"كى\"],[[64644,64644],\"mapped\",\"كي\"],[[64645,64645],\"mapped\",\"لم\"],[[64646,64646],\"mapped\",\"لى\"],[[64647,64647],\"mapped\",\"لي\"],[[64648,64648],\"mapped\",\"ما\"],[[64649,64649],\"mapped\",\"مم\"],[[64650,64650],\"mapped\",\"نر\"],[[64651,64651],\"mapped\",\"نز\"],[[64652,64652],\"mapped\",\"نم\"],[[64653,64653],\"mapped\",\"نن\"],[[64654,64654],\"mapped\",\"نى\"],[[64655,64655],\"mapped\",\"ني\"],[[64656,64656],\"mapped\",\"ىٰ\"],[[64657,64657],\"mapped\",\"ير\"],[[64658,64658],\"mapped\",\"يز\"],[[64659,64659],\"mapped\",\"يم\"],[[64660,64660],\"mapped\",\"ين\"],[[64661,64661],\"mapped\",\"يى\"],[[64662,64662],\"mapped\",\"يي\"],[[64663,64663],\"mapped\",\"ئج\"],[[64664,64664],\"mapped\",\"ئح\"],[[64665,64665],\"mapped\",\"ئخ\"],[[64666,64666],\"mapped\",\"ئم\"],[[64667,64667],\"mapped\",\"ئه\"],[[64668,64668],\"mapped\",\"بج\"],[[64669,64669],\"mapped\",\"بح\"],[[64670,64670],\"mapped\",\"بخ\"],[[64671,64671],\"mapped\",\"بم\"],[[64672,64672],\"mapped\",\"به\"],[[64673,64673],\"mapped\",\"تج\"],[[64674,64674],\"mapped\",\"تح\"],[[64675,64675],\"mapped\",\"تخ\"],[[64676,64676],\"mapped\",\"تم\"],[[64677,64677],\"mapped\",\"ته\"],[[64678,64678],\"mapped\",\"ثم\"],[[64679,64679],\"mapped\",\"جح\"],[[64680,64680],\"mapped\",\"جم\"],[[64681,64681],\"mapped\",\"حج\"],[[64682,64682],\"mapped\",\"حم\"],[[64683,64683],\"mapped\",\"خج\"],[[64684,64684],\"mapped\",\"خم\"],[[64685,64685],\"mapped\",\"سج\"],[[64686,64686],\"mapped\",\"سح\"],[[64687,64687],\"mapped\",\"سخ\"],[[64688,64688],\"mapped\",\"سم\"],[[64689,64689],\"mapped\",\"صح\"],[[64690,64690],\"mapped\",\"صخ\"],[[64691,64691],\"mapped\",\"صم\"],[[64692,64692],\"mapped\",\"ضج\"],[[64693,64693],\"mapped\",\"ضح\"],[[64694,64694],\"mapped\",\"ضخ\"],[[64695,64695],\"mapped\",\"ضم\"],[[64696,64696],\"mapped\",\"طح\"],[[64697,64697],\"mapped\",\"ظم\"],[[64698,64698],\"mapped\",\"عج\"],[[64699,64699],\"mapped\",\"عم\"],[[64700,64700],\"mapped\",\"غج\"],[[64701,64701],\"mapped\",\"غم\"],[[64702,64702],\"mapped\",\"فج\"],[[64703,64703],\"mapped\",\"فح\"],[[64704,64704],\"mapped\",\"فخ\"],[[64705,64705],\"mapped\",\"فم\"],[[64706,64706],\"mapped\",\"قح\"],[[64707,64707],\"mapped\",\"قم\"],[[64708,64708],\"mapped\",\"كج\"],[[64709,64709],\"mapped\",\"كح\"],[[64710,64710],\"mapped\",\"كخ\"],[[64711,64711],\"mapped\",\"كل\"],[[64712,64712],\"mapped\",\"كم\"],[[64713,64713],\"mapped\",\"لج\"],[[64714,64714],\"mapped\",\"لح\"],[[64715,64715],\"mapped\",\"لخ\"],[[64716,64716],\"mapped\",\"لم\"],[[64717,64717],\"mapped\",\"له\"],[[64718,64718],\"mapped\",\"مج\"],[[64719,64719],\"mapped\",\"مح\"],[[64720,64720],\"mapped\",\"مخ\"],[[64721,64721],\"mapped\",\"مم\"],[[64722,64722],\"mapped\",\"نج\"],[[64723,64723],\"mapped\",\"نح\"],[[64724,64724],\"mapped\",\"نخ\"],[[64725,64725],\"mapped\",\"نم\"],[[64726,64726],\"mapped\",\"نه\"],[[64727,64727],\"mapped\",\"هج\"],[[64728,64728],\"mapped\",\"هم\"],[[64729,64729],\"mapped\",\"هٰ\"],[[64730,64730],\"mapped\",\"يج\"],[[64731,64731],\"mapped\",\"يح\"],[[64732,64732],\"mapped\",\"يخ\"],[[64733,64733],\"mapped\",\"يم\"],[[64734,64734],\"mapped\",\"يه\"],[[64735,64735],\"mapped\",\"ئم\"],[[64736,64736],\"mapped\",\"ئه\"],[[64737,64737],\"mapped\",\"بم\"],[[64738,64738],\"mapped\",\"به\"],[[64739,64739],\"mapped\",\"تم\"],[[64740,64740],\"mapped\",\"ته\"],[[64741,64741],\"mapped\",\"ثم\"],[[64742,64742],\"mapped\",\"ثه\"],[[64743,64743],\"mapped\",\"سم\"],[[64744,64744],\"mapped\",\"سه\"],[[64745,64745],\"mapped\",\"شم\"],[[64746,64746],\"mapped\",\"شه\"],[[64747,64747],\"mapped\",\"كل\"],[[64748,64748],\"mapped\",\"كم\"],[[64749,64749],\"mapped\",\"لم\"],[[64750,64750],\"mapped\",\"نم\"],[[64751,64751],\"mapped\",\"نه\"],[[64752,64752],\"mapped\",\"يم\"],[[64753,64753],\"mapped\",\"يه\"],[[64754,64754],\"mapped\",\"ـَّ\"],[[64755,64755],\"mapped\",\"ـُّ\"],[[64756,64756],\"mapped\",\"ـِّ\"],[[64757,64757],\"mapped\",\"طى\"],[[64758,64758],\"mapped\",\"طي\"],[[64759,64759],\"mapped\",\"عى\"],[[64760,64760],\"mapped\",\"عي\"],[[64761,64761],\"mapped\",\"غى\"],[[64762,64762],\"mapped\",\"غي\"],[[64763,64763],\"mapped\",\"سى\"],[[64764,64764],\"mapped\",\"سي\"],[[64765,64765],\"mapped\",\"شى\"],[[64766,64766],\"mapped\",\"شي\"],[[64767,64767],\"mapped\",\"حى\"],[[64768,64768],\"mapped\",\"حي\"],[[64769,64769],\"mapped\",\"جى\"],[[64770,64770],\"mapped\",\"جي\"],[[64771,64771],\"mapped\",\"خى\"],[[64772,64772],\"mapped\",\"خي\"],[[64773,64773],\"mapped\",\"صى\"],[[64774,64774],\"mapped\",\"صي\"],[[64775,64775],\"mapped\",\"ضى\"],[[64776,64776],\"mapped\",\"ضي\"],[[64777,64777],\"mapped\",\"شج\"],[[64778,64778],\"mapped\",\"شح\"],[[64779,64779],\"mapped\",\"شخ\"],[[64780,64780],\"mapped\",\"شم\"],[[64781,64781],\"mapped\",\"شر\"],[[64782,64782],\"mapped\",\"سر\"],[[64783,64783],\"mapped\",\"صر\"],[[64784,64784],\"mapped\",\"ضر\"],[[64785,64785],\"mapped\",\"طى\"],[[64786,64786],\"mapped\",\"طي\"],[[64787,64787],\"mapped\",\"عى\"],[[64788,64788],\"mapped\",\"عي\"],[[64789,64789],\"mapped\",\"غى\"],[[64790,64790],\"mapped\",\"غي\"],[[64791,64791],\"mapped\",\"سى\"],[[64792,64792],\"mapped\",\"سي\"],[[64793,64793],\"mapped\",\"شى\"],[[64794,64794],\"mapped\",\"شي\"],[[64795,64795],\"mapped\",\"حى\"],[[64796,64796],\"mapped\",\"حي\"],[[64797,64797],\"mapped\",\"جى\"],[[64798,64798],\"mapped\",\"جي\"],[[64799,64799],\"mapped\",\"خى\"],[[64800,64800],\"mapped\",\"خي\"],[[64801,64801],\"mapped\",\"صى\"],[[64802,64802],\"mapped\",\"صي\"],[[64803,64803],\"mapped\",\"ضى\"],[[64804,64804],\"mapped\",\"ضي\"],[[64805,64805],\"mapped\",\"شج\"],[[64806,64806],\"mapped\",\"شح\"],[[64807,64807],\"mapped\",\"شخ\"],[[64808,64808],\"mapped\",\"شم\"],[[64809,64809],\"mapped\",\"شر\"],[[64810,64810],\"mapped\",\"سر\"],[[64811,64811],\"mapped\",\"صر\"],[[64812,64812],\"mapped\",\"ضر\"],[[64813,64813],\"mapped\",\"شج\"],[[64814,64814],\"mapped\",\"شح\"],[[64815,64815],\"mapped\",\"شخ\"],[[64816,64816],\"mapped\",\"شم\"],[[64817,64817],\"mapped\",\"سه\"],[[64818,64818],\"mapped\",\"شه\"],[[64819,64819],\"mapped\",\"طم\"],[[64820,64820],\"mapped\",\"سج\"],[[64821,64821],\"mapped\",\"سح\"],[[64822,64822],\"mapped\",\"سخ\"],[[64823,64823],\"mapped\",\"شج\"],[[64824,64824],\"mapped\",\"شح\"],[[64825,64825],\"mapped\",\"شخ\"],[[64826,64826],\"mapped\",\"طم\"],[[64827,64827],\"mapped\",\"ظم\"],[[64828,64829],\"mapped\",\"اً\"],[[64830,64831],\"valid\",\"\",\"NV8\"],[[64832,64847],\"disallowed\"],[[64848,64848],\"mapped\",\"تجم\"],[[64849,64850],\"mapped\",\"تحج\"],[[64851,64851],\"mapped\",\"تحم\"],[[64852,64852],\"mapped\",\"تخم\"],[[64853,64853],\"mapped\",\"تمج\"],[[64854,64854],\"mapped\",\"تمح\"],[[64855,64855],\"mapped\",\"تمخ\"],[[64856,64857],\"mapped\",\"جمح\"],[[64858,64858],\"mapped\",\"حمي\"],[[64859,64859],\"mapped\",\"حمى\"],[[64860,64860],\"mapped\",\"سحج\"],[[64861,64861],\"mapped\",\"سجح\"],[[64862,64862],\"mapped\",\"سجى\"],[[64863,64864],\"mapped\",\"سمح\"],[[64865,64865],\"mapped\",\"سمج\"],[[64866,64867],\"mapped\",\"سمم\"],[[64868,64869],\"mapped\",\"صحح\"],[[64870,64870],\"mapped\",\"صمم\"],[[64871,64872],\"mapped\",\"شحم\"],[[64873,64873],\"mapped\",\"شجي\"],[[64874,64875],\"mapped\",\"شمخ\"],[[64876,64877],\"mapped\",\"شمم\"],[[64878,64878],\"mapped\",\"ضحى\"],[[64879,64880],\"mapped\",\"ضخم\"],[[64881,64882],\"mapped\",\"طمح\"],[[64883,64883],\"mapped\",\"طمم\"],[[64884,64884],\"mapped\",\"طمي\"],[[64885,64885],\"mapped\",\"عجم\"],[[64886,64887],\"mapped\",\"عمم\"],[[64888,64888],\"mapped\",\"عمى\"],[[64889,64889],\"mapped\",\"غمم\"],[[64890,64890],\"mapped\",\"غمي\"],[[64891,64891],\"mapped\",\"غمى\"],[[64892,64893],\"mapped\",\"فخم\"],[[64894,64894],\"mapped\",\"قمح\"],[[64895,64895],\"mapped\",\"قمم\"],[[64896,64896],\"mapped\",\"لحم\"],[[64897,64897],\"mapped\",\"لحي\"],[[64898,64898],\"mapped\",\"لحى\"],[[64899,64900],\"mapped\",\"لجج\"],[[64901,64902],\"mapped\",\"لخم\"],[[64903,64904],\"mapped\",\"لمح\"],[[64905,64905],\"mapped\",\"محج\"],[[64906,64906],\"mapped\",\"محم\"],[[64907,64907],\"mapped\",\"محي\"],[[64908,64908],\"mapped\",\"مجح\"],[[64909,64909],\"mapped\",\"مجم\"],[[64910,64910],\"mapped\",\"مخج\"],[[64911,64911],\"mapped\",\"مخم\"],[[64912,64913],\"disallowed\"],[[64914,64914],\"mapped\",\"مجخ\"],[[64915,64915],\"mapped\",\"همج\"],[[64916,64916],\"mapped\",\"همم\"],[[64917,64917],\"mapped\",\"نحم\"],[[64918,64918],\"mapped\",\"نحى\"],[[64919,64920],\"mapped\",\"نجم\"],[[64921,64921],\"mapped\",\"نجى\"],[[64922,64922],\"mapped\",\"نمي\"],[[64923,64923],\"mapped\",\"نمى\"],[[64924,64925],\"mapped\",\"يمم\"],[[64926,64926],\"mapped\",\"بخي\"],[[64927,64927],\"mapped\",\"تجي\"],[[64928,64928],\"mapped\",\"تجى\"],[[64929,64929],\"mapped\",\"تخي\"],[[64930,64930],\"mapped\",\"تخى\"],[[64931,64931],\"mapped\",\"تمي\"],[[64932,64932],\"mapped\",\"تمى\"],[[64933,64933],\"mapped\",\"جمي\"],[[64934,64934],\"mapped\",\"جحى\"],[[64935,64935],\"mapped\",\"جمى\"],[[64936,64936],\"mapped\",\"سخى\"],[[64937,64937],\"mapped\",\"صحي\"],[[64938,64938],\"mapped\",\"شحي\"],[[64939,64939],\"mapped\",\"ضحي\"],[[64940,64940],\"mapped\",\"لجي\"],[[64941,64941],\"mapped\",\"لمي\"],[[64942,64942],\"mapped\",\"يحي\"],[[64943,64943],\"mapped\",\"يجي\"],[[64944,64944],\"mapped\",\"يمي\"],[[64945,64945],\"mapped\",\"ممي\"],[[64946,64946],\"mapped\",\"قمي\"],[[64947,64947],\"mapped\",\"نحي\"],[[64948,64948],\"mapped\",\"قمح\"],[[64949,64949],\"mapped\",\"لحم\"],[[64950,64950],\"mapped\",\"عمي\"],[[64951,64951],\"mapped\",\"كمي\"],[[64952,64952],\"mapped\",\"نجح\"],[[64953,64953],\"mapped\",\"مخي\"],[[64954,64954],\"mapped\",\"لجم\"],[[64955,64955],\"mapped\",\"كمم\"],[[64956,64956],\"mapped\",\"لجم\"],[[64957,64957],\"mapped\",\"نجح\"],[[64958,64958],\"mapped\",\"جحي\"],[[64959,64959],\"mapped\",\"حجي\"],[[64960,64960],\"mapped\",\"مجي\"],[[64961,64961],\"mapped\",\"فمي\"],[[64962,64962],\"mapped\",\"بحي\"],[[64963,64963],\"mapped\",\"كمم\"],[[64964,64964],\"mapped\",\"عجم\"],[[64965,64965],\"mapped\",\"صمم\"],[[64966,64966],\"mapped\",\"سخي\"],[[64967,64967],\"mapped\",\"نجي\"],[[64968,64975],\"disallowed\"],[[64976,65007],\"disallowed\"],[[65008,65008],\"mapped\",\"صلے\"],[[65009,65009],\"mapped\",\"قلے\"],[[65010,65010],\"mapped\",\"الله\"],[[65011,65011],\"mapped\",\"اكبر\"],[[65012,65012],\"mapped\",\"محمد\"],[[65013,65013],\"mapped\",\"صلعم\"],[[65014,65014],\"mapped\",\"رسول\"],[[65015,65015],\"mapped\",\"عليه\"],[[65016,65016],\"mapped\",\"وسلم\"],[[65017,65017],\"mapped\",\"صلى\"],[[65018,65018],\"disallowed_STD3_mapped\",\"صلى الله عليه وسلم\"],[[65019,65019],\"disallowed_STD3_mapped\",\"جل جلاله\"],[[65020,65020],\"mapped\",\"ریال\"],[[65021,65021],\"valid\",\"\",\"NV8\"],[[65022,65023],\"disallowed\"],[[65024,65039],\"ignored\"],[[65040,65040],\"disallowed_STD3_mapped\",\",\"],[[65041,65041],\"mapped\",\"、\"],[[65042,65042],\"disallowed\"],[[65043,65043],\"disallowed_STD3_mapped\",\":\"],[[65044,65044],\"disallowed_STD3_mapped\",\";\"],[[65045,65045],\"disallowed_STD3_mapped\",\"!\"],[[65046,65046],\"disallowed_STD3_mapped\",\"?\"],[[65047,65047],\"mapped\",\"〖\"],[[65048,65048],\"mapped\",\"〗\"],[[65049,65049],\"disallowed\"],[[65050,65055],\"disallowed\"],[[65056,65059],\"valid\"],[[65060,65062],\"valid\"],[[65063,65069],\"valid\"],[[65070,65071],\"valid\"],[[65072,65072],\"disallowed\"],[[65073,65073],\"mapped\",\"—\"],[[65074,65074],\"mapped\",\"–\"],[[65075,65076],\"disallowed_STD3_mapped\",\"_\"],[[65077,65077],\"disallowed_STD3_mapped\",\"(\"],[[65078,65078],\"disallowed_STD3_mapped\",\")\"],[[65079,65079],\"disallowed_STD3_mapped\",\"{\"],[[65080,65080],\"disallowed_STD3_mapped\",\"}\"],[[65081,65081],\"mapped\",\"〔\"],[[65082,65082],\"mapped\",\"〕\"],[[65083,65083],\"mapped\",\"【\"],[[65084,65084],\"mapped\",\"】\"],[[65085,65085],\"mapped\",\"《\"],[[65086,65086],\"mapped\",\"》\"],[[65087,65087],\"mapped\",\"〈\"],[[65088,65088],\"mapped\",\"〉\"],[[65089,65089],\"mapped\",\"「\"],[[65090,65090],\"mapped\",\"」\"],[[65091,65091],\"mapped\",\"『\"],[[65092,65092],\"mapped\",\"』\"],[[65093,65094],\"valid\",\"\",\"NV8\"],[[65095,65095],\"disallowed_STD3_mapped\",\"[\"],[[65096,65096],\"disallowed_STD3_mapped\",\"]\"],[[65097,65100],\"disallowed_STD3_mapped\",\" ̅\"],[[65101,65103],\"disallowed_STD3_mapped\",\"_\"],[[65104,65104],\"disallowed_STD3_mapped\",\",\"],[[65105,65105],\"mapped\",\"、\"],[[65106,65106],\"disallowed\"],[[65107,65107],\"disallowed\"],[[65108,65108],\"disallowed_STD3_mapped\",\";\"],[[65109,65109],\"disallowed_STD3_mapped\",\":\"],[[65110,65110],\"disallowed_STD3_mapped\",\"?\"],[[65111,65111],\"disallowed_STD3_mapped\",\"!\"],[[65112,65112],\"mapped\",\"—\"],[[65113,65113],\"disallowed_STD3_mapped\",\"(\"],[[65114,65114],\"disallowed_STD3_mapped\",\")\"],[[65115,65115],\"disallowed_STD3_mapped\",\"{\"],[[65116,65116],\"disallowed_STD3_mapped\",\"}\"],[[65117,65117],\"mapped\",\"〔\"],[[65118,65118],\"mapped\",\"〕\"],[[65119,65119],\"disallowed_STD3_mapped\",\"#\"],[[65120,65120],\"disallowed_STD3_mapped\",\"&\"],[[65121,65121],\"disallowed_STD3_mapped\",\"*\"],[[65122,65122],\"disallowed_STD3_mapped\",\"+\"],[[65123,65123],\"mapped\",\"-\"],[[65124,65124],\"disallowed_STD3_mapped\",\"<\"],[[65125,65125],\"disallowed_STD3_mapped\",\">\"],[[65126,65126],\"disallowed_STD3_mapped\",\"=\"],[[65127,65127],\"disallowed\"],[[65128,65128],\"disallowed_STD3_mapped\",\"\\\\\"],[[65129,65129],\"disallowed_STD3_mapped\",\"$\"],[[65130,65130],\"disallowed_STD3_mapped\",\"%\"],[[65131,65131],\"disallowed_STD3_mapped\",\"@\"],[[65132,65135],\"disallowed\"],[[65136,65136],\"disallowed_STD3_mapped\",\" ً\"],[[65137,65137],\"mapped\",\"ـً\"],[[65138,65138],\"disallowed_STD3_mapped\",\" ٌ\"],[[65139,65139],\"valid\"],[[65140,65140],\"disallowed_STD3_mapped\",\" ٍ\"],[[65141,65141],\"disallowed\"],[[65142,65142],\"disallowed_STD3_mapped\",\" َ\"],[[65143,65143],\"mapped\",\"ـَ\"],[[65144,65144],\"disallowed_STD3_mapped\",\" ُ\"],[[65145,65145],\"mapped\",\"ـُ\"],[[65146,65146],\"disallowed_STD3_mapped\",\" ِ\"],[[65147,65147],\"mapped\",\"ـِ\"],[[65148,65148],\"disallowed_STD3_mapped\",\" ّ\"],[[65149,65149],\"mapped\",\"ـّ\"],[[65150,65150],\"disallowed_STD3_mapped\",\" ْ\"],[[65151,65151],\"mapped\",\"ـْ\"],[[65152,65152],\"mapped\",\"ء\"],[[65153,65154],\"mapped\",\"آ\"],[[65155,65156],\"mapped\",\"أ\"],[[65157,65158],\"mapped\",\"ؤ\"],[[65159,65160],\"mapped\",\"إ\"],[[65161,65164],\"mapped\",\"ئ\"],[[65165,65166],\"mapped\",\"ا\"],[[65167,65170],\"mapped\",\"ب\"],[[65171,65172],\"mapped\",\"ة\"],[[65173,65176],\"mapped\",\"ت\"],[[65177,65180],\"mapped\",\"ث\"],[[65181,65184],\"mapped\",\"ج\"],[[65185,65188],\"mapped\",\"ح\"],[[65189,65192],\"mapped\",\"خ\"],[[65193,65194],\"mapped\",\"د\"],[[65195,65196],\"mapped\",\"ذ\"],[[65197,65198],\"mapped\",\"ر\"],[[65199,65200],\"mapped\",\"ز\"],[[65201,65204],\"mapped\",\"س\"],[[65205,65208],\"mapped\",\"ش\"],[[65209,65212],\"mapped\",\"ص\"],[[65213,65216],\"mapped\",\"ض\"],[[65217,65220],\"mapped\",\"ط\"],[[65221,65224],\"mapped\",\"ظ\"],[[65225,65228],\"mapped\",\"ع\"],[[65229,65232],\"mapped\",\"غ\"],[[65233,65236],\"mapped\",\"ف\"],[[65237,65240],\"mapped\",\"ق\"],[[65241,65244],\"mapped\",\"ك\"],[[65245,65248],\"mapped\",\"ل\"],[[65249,65252],\"mapped\",\"م\"],[[65253,65256],\"mapped\",\"ن\"],[[65257,65260],\"mapped\",\"ه\"],[[65261,65262],\"mapped\",\"و\"],[[65263,65264],\"mapped\",\"ى\"],[[65265,65268],\"mapped\",\"ي\"],[[65269,65270],\"mapped\",\"لآ\"],[[65271,65272],\"mapped\",\"لأ\"],[[65273,65274],\"mapped\",\"لإ\"],[[65275,65276],\"mapped\",\"لا\"],[[65277,65278],\"disallowed\"],[[65279,65279],\"ignored\"],[[65280,65280],\"disallowed\"],[[65281,65281],\"disallowed_STD3_mapped\",\"!\"],[[65282,65282],\"disallowed_STD3_mapped\",\"\\\"\"],[[65283,65283],\"disallowed_STD3_mapped\",\"#\"],[[65284,65284],\"disallowed_STD3_mapped\",\"$\"],[[65285,65285],\"disallowed_STD3_mapped\",\"%\"],[[65286,65286],\"disallowed_STD3_mapped\",\"&\"],[[65287,65287],\"disallowed_STD3_mapped\",\"'\"],[[65288,65288],\"disallowed_STD3_mapped\",\"(\"],[[65289,65289],\"disallowed_STD3_mapped\",\")\"],[[65290,65290],\"disallowed_STD3_mapped\",\"*\"],[[65291,65291],\"disallowed_STD3_mapped\",\"+\"],[[65292,65292],\"disallowed_STD3_mapped\",\",\"],[[65293,65293],\"mapped\",\"-\"],[[65294,65294],\"mapped\",\".\"],[[65295,65295],\"disallowed_STD3_mapped\",\"/\"],[[65296,65296],\"mapped\",\"0\"],[[65297,65297],\"mapped\",\"1\"],[[65298,65298],\"mapped\",\"2\"],[[65299,65299],\"mapped\",\"3\"],[[65300,65300],\"mapped\",\"4\"],[[65301,65301],\"mapped\",\"5\"],[[65302,65302],\"mapped\",\"6\"],[[65303,65303],\"mapped\",\"7\"],[[65304,65304],\"mapped\",\"8\"],[[65305,65305],\"mapped\",\"9\"],[[65306,65306],\"disallowed_STD3_mapped\",\":\"],[[65307,65307],\"disallowed_STD3_mapped\",\";\"],[[65308,65308],\"disallowed_STD3_mapped\",\"<\"],[[65309,65309],\"disallowed_STD3_mapped\",\"=\"],[[65310,65310],\"disallowed_STD3_mapped\",\">\"],[[65311,65311],\"disallowed_STD3_mapped\",\"?\"],[[65312,65312],\"disallowed_STD3_mapped\",\"@\"],[[65313,65313],\"mapped\",\"a\"],[[65314,65314],\"mapped\",\"b\"],[[65315,65315],\"mapped\",\"c\"],[[65316,65316],\"mapped\",\"d\"],[[65317,65317],\"mapped\",\"e\"],[[65318,65318],\"mapped\",\"f\"],[[65319,65319],\"mapped\",\"g\"],[[65320,65320],\"mapped\",\"h\"],[[65321,65321],\"mapped\",\"i\"],[[65322,65322],\"mapped\",\"j\"],[[65323,65323],\"mapped\",\"k\"],[[65324,65324],\"mapped\",\"l\"],[[65325,65325],\"mapped\",\"m\"],[[65326,65326],\"mapped\",\"n\"],[[65327,65327],\"mapped\",\"o\"],[[65328,65328],\"mapped\",\"p\"],[[65329,65329],\"mapped\",\"q\"],[[65330,65330],\"mapped\",\"r\"],[[65331,65331],\"mapped\",\"s\"],[[65332,65332],\"mapped\",\"t\"],[[65333,65333],\"mapped\",\"u\"],[[65334,65334],\"mapped\",\"v\"],[[65335,65335],\"mapped\",\"w\"],[[65336,65336],\"mapped\",\"x\"],[[65337,65337],\"mapped\",\"y\"],[[65338,65338],\"mapped\",\"z\"],[[65339,65339],\"disallowed_STD3_mapped\",\"[\"],[[65340,65340],\"disallowed_STD3_mapped\",\"\\\\\"],[[65341,65341],\"disallowed_STD3_mapped\",\"]\"],[[65342,65342],\"disallowed_STD3_mapped\",\"^\"],[[65343,65343],\"disallowed_STD3_mapped\",\"_\"],[[65344,65344],\"disallowed_STD3_mapped\",\"`\"],[[65345,65345],\"mapped\",\"a\"],[[65346,65346],\"mapped\",\"b\"],[[65347,65347],\"mapped\",\"c\"],[[65348,65348],\"mapped\",\"d\"],[[65349,65349],\"mapped\",\"e\"],[[65350,65350],\"mapped\",\"f\"],[[65351,65351],\"mapped\",\"g\"],[[65352,65352],\"mapped\",\"h\"],[[65353,65353],\"mapped\",\"i\"],[[65354,65354],\"mapped\",\"j\"],[[65355,65355],\"mapped\",\"k\"],[[65356,65356],\"mapped\",\"l\"],[[65357,65357],\"mapped\",\"m\"],[[65358,65358],\"mapped\",\"n\"],[[65359,65359],\"mapped\",\"o\"],[[65360,65360],\"mapped\",\"p\"],[[65361,65361],\"mapped\",\"q\"],[[65362,65362],\"mapped\",\"r\"],[[65363,65363],\"mapped\",\"s\"],[[65364,65364],\"mapped\",\"t\"],[[65365,65365],\"mapped\",\"u\"],[[65366,65366],\"mapped\",\"v\"],[[65367,65367],\"mapped\",\"w\"],[[65368,65368],\"mapped\",\"x\"],[[65369,65369],\"mapped\",\"y\"],[[65370,65370],\"mapped\",\"z\"],[[65371,65371],\"disallowed_STD3_mapped\",\"{\"],[[65372,65372],\"disallowed_STD3_mapped\",\"|\"],[[65373,65373],\"disallowed_STD3_mapped\",\"}\"],[[65374,65374],\"disallowed_STD3_mapped\",\"~\"],[[65375,65375],\"mapped\",\"⦅\"],[[65376,65376],\"mapped\",\"⦆\"],[[65377,65377],\"mapped\",\".\"],[[65378,65378],\"mapped\",\"「\"],[[65379,65379],\"mapped\",\"」\"],[[65380,65380],\"mapped\",\"、\"],[[65381,65381],\"mapped\",\"・\"],[[65382,65382],\"mapped\",\"ヲ\"],[[65383,65383],\"mapped\",\"ァ\"],[[65384,65384],\"mapped\",\"ィ\"],[[65385,65385],\"mapped\",\"ゥ\"],[[65386,65386],\"mapped\",\"ェ\"],[[65387,65387],\"mapped\",\"ォ\"],[[65388,65388],\"mapped\",\"ャ\"],[[65389,65389],\"mapped\",\"ュ\"],[[65390,65390],\"mapped\",\"ョ\"],[[65391,65391],\"mapped\",\"ッ\"],[[65392,65392],\"mapped\",\"ー\"],[[65393,65393],\"mapped\",\"ア\"],[[65394,65394],\"mapped\",\"イ\"],[[65395,65395],\"mapped\",\"ウ\"],[[65396,65396],\"mapped\",\"エ\"],[[65397,65397],\"mapped\",\"オ\"],[[65398,65398],\"mapped\",\"カ\"],[[65399,65399],\"mapped\",\"キ\"],[[65400,65400],\"mapped\",\"ク\"],[[65401,65401],\"mapped\",\"ケ\"],[[65402,65402],\"mapped\",\"コ\"],[[65403,65403],\"mapped\",\"サ\"],[[65404,65404],\"mapped\",\"シ\"],[[65405,65405],\"mapped\",\"ス\"],[[65406,65406],\"mapped\",\"セ\"],[[65407,65407],\"mapped\",\"ソ\"],[[65408,65408],\"mapped\",\"タ\"],[[65409,65409],\"mapped\",\"チ\"],[[65410,65410],\"mapped\",\"ツ\"],[[65411,65411],\"mapped\",\"テ\"],[[65412,65412],\"mapped\",\"ト\"],[[65413,65413],\"mapped\",\"ナ\"],[[65414,65414],\"mapped\",\"ニ\"],[[65415,65415],\"mapped\",\"ヌ\"],[[65416,65416],\"mapped\",\"ネ\"],[[65417,65417],\"mapped\",\"ノ\"],[[65418,65418],\"mapped\",\"ハ\"],[[65419,65419],\"mapped\",\"ヒ\"],[[65420,65420],\"mapped\",\"フ\"],[[65421,65421],\"mapped\",\"ヘ\"],[[65422,65422],\"mapped\",\"ホ\"],[[65423,65423],\"mapped\",\"マ\"],[[65424,65424],\"mapped\",\"ミ\"],[[65425,65425],\"mapped\",\"ム\"],[[65426,65426],\"mapped\",\"メ\"],[[65427,65427],\"mapped\",\"モ\"],[[65428,65428],\"mapped\",\"ヤ\"],[[65429,65429],\"mapped\",\"ユ\"],[[65430,65430],\"mapped\",\"ヨ\"],[[65431,65431],\"mapped\",\"ラ\"],[[65432,65432],\"mapped\",\"リ\"],[[65433,65433],\"mapped\",\"ル\"],[[65434,65434],\"mapped\",\"レ\"],[[65435,65435],\"mapped\",\"ロ\"],[[65436,65436],\"mapped\",\"ワ\"],[[65437,65437],\"mapped\",\"ン\"],[[65438,65438],\"mapped\",\"゙\"],[[65439,65439],\"mapped\",\"゚\"],[[65440,65440],\"disallowed\"],[[65441,65441],\"mapped\",\"ᄀ\"],[[65442,65442],\"mapped\",\"ᄁ\"],[[65443,65443],\"mapped\",\"ᆪ\"],[[65444,65444],\"mapped\",\"ᄂ\"],[[65445,65445],\"mapped\",\"ᆬ\"],[[65446,65446],\"mapped\",\"ᆭ\"],[[65447,65447],\"mapped\",\"ᄃ\"],[[65448,65448],\"mapped\",\"ᄄ\"],[[65449,65449],\"mapped\",\"ᄅ\"],[[65450,65450],\"mapped\",\"ᆰ\"],[[65451,65451],\"mapped\",\"ᆱ\"],[[65452,65452],\"mapped\",\"ᆲ\"],[[65453,65453],\"mapped\",\"ᆳ\"],[[65454,65454],\"mapped\",\"ᆴ\"],[[65455,65455],\"mapped\",\"ᆵ\"],[[65456,65456],\"mapped\",\"ᄚ\"],[[65457,65457],\"mapped\",\"ᄆ\"],[[65458,65458],\"mapped\",\"ᄇ\"],[[65459,65459],\"mapped\",\"ᄈ\"],[[65460,65460],\"mapped\",\"ᄡ\"],[[65461,65461],\"mapped\",\"ᄉ\"],[[65462,65462],\"mapped\",\"ᄊ\"],[[65463,65463],\"mapped\",\"ᄋ\"],[[65464,65464],\"mapped\",\"ᄌ\"],[[65465,65465],\"mapped\",\"ᄍ\"],[[65466,65466],\"mapped\",\"ᄎ\"],[[65467,65467],\"mapped\",\"ᄏ\"],[[65468,65468],\"mapped\",\"ᄐ\"],[[65469,65469],\"mapped\",\"ᄑ\"],[[65470,65470],\"mapped\",\"ᄒ\"],[[65471,65473],\"disallowed\"],[[65474,65474],\"mapped\",\"ᅡ\"],[[65475,65475],\"mapped\",\"ᅢ\"],[[65476,65476],\"mapped\",\"ᅣ\"],[[65477,65477],\"mapped\",\"ᅤ\"],[[65478,65478],\"mapped\",\"ᅥ\"],[[65479,65479],\"mapped\",\"ᅦ\"],[[65480,65481],\"disallowed\"],[[65482,65482],\"mapped\",\"ᅧ\"],[[65483,65483],\"mapped\",\"ᅨ\"],[[65484,65484],\"mapped\",\"ᅩ\"],[[65485,65485],\"mapped\",\"ᅪ\"],[[65486,65486],\"mapped\",\"ᅫ\"],[[65487,65487],\"mapped\",\"ᅬ\"],[[65488,65489],\"disallowed\"],[[65490,65490],\"mapped\",\"ᅭ\"],[[65491,65491],\"mapped\",\"ᅮ\"],[[65492,65492],\"mapped\",\"ᅯ\"],[[65493,65493],\"mapped\",\"ᅰ\"],[[65494,65494],\"mapped\",\"ᅱ\"],[[65495,65495],\"mapped\",\"ᅲ\"],[[65496,65497],\"disallowed\"],[[65498,65498],\"mapped\",\"ᅳ\"],[[65499,65499],\"mapped\",\"ᅴ\"],[[65500,65500],\"mapped\",\"ᅵ\"],[[65501,65503],\"disallowed\"],[[65504,65504],\"mapped\",\"¢\"],[[65505,65505],\"mapped\",\"£\"],[[65506,65506],\"mapped\",\"¬\"],[[65507,65507],\"disallowed_STD3_mapped\",\" ̄\"],[[65508,65508],\"mapped\",\"¦\"],[[65509,65509],\"mapped\",\"¥\"],[[65510,65510],\"mapped\",\"₩\"],[[65511,65511],\"disallowed\"],[[65512,65512],\"mapped\",\"│\"],[[65513,65513],\"mapped\",\"←\"],[[65514,65514],\"mapped\",\"↑\"],[[65515,65515],\"mapped\",\"→\"],[[65516,65516],\"mapped\",\"↓\"],[[65517,65517],\"mapped\",\"■\"],[[65518,65518],\"mapped\",\"○\"],[[65519,65528],\"disallowed\"],[[65529,65531],\"disallowed\"],[[65532,65532],\"disallowed\"],[[65533,65533],\"disallowed\"],[[65534,65535],\"disallowed\"],[[65536,65547],\"valid\"],[[65548,65548],\"disallowed\"],[[65549,65574],\"valid\"],[[65575,65575],\"disallowed\"],[[65576,65594],\"valid\"],[[65595,65595],\"disallowed\"],[[65596,65597],\"valid\"],[[65598,65598],\"disallowed\"],[[65599,65613],\"valid\"],[[65614,65615],\"disallowed\"],[[65616,65629],\"valid\"],[[65630,65663],\"disallowed\"],[[65664,65786],\"valid\"],[[65787,65791],\"disallowed\"],[[65792,65794],\"valid\",\"\",\"NV8\"],[[65795,65798],\"disallowed\"],[[65799,65843],\"valid\",\"\",\"NV8\"],[[65844,65846],\"disallowed\"],[[65847,65855],\"valid\",\"\",\"NV8\"],[[65856,65930],\"valid\",\"\",\"NV8\"],[[65931,65932],\"valid\",\"\",\"NV8\"],[[65933,65934],\"valid\",\"\",\"NV8\"],[[65935,65935],\"disallowed\"],[[65936,65947],\"valid\",\"\",\"NV8\"],[[65948,65951],\"disallowed\"],[[65952,65952],\"valid\",\"\",\"NV8\"],[[65953,65999],\"disallowed\"],[[66000,66044],\"valid\",\"\",\"NV8\"],[[66045,66045],\"valid\"],[[66046,66175],\"disallowed\"],[[66176,66204],\"valid\"],[[66205,66207],\"disallowed\"],[[66208,66256],\"valid\"],[[66257,66271],\"disallowed\"],[[66272,66272],\"valid\"],[[66273,66299],\"valid\",\"\",\"NV8\"],[[66300,66303],\"disallowed\"],[[66304,66334],\"valid\"],[[66335,66335],\"valid\"],[[66336,66339],\"valid\",\"\",\"NV8\"],[[66340,66348],\"disallowed\"],[[66349,66351],\"valid\"],[[66352,66368],\"valid\"],[[66369,66369],\"valid\",\"\",\"NV8\"],[[66370,66377],\"valid\"],[[66378,66378],\"valid\",\"\",\"NV8\"],[[66379,66383],\"disallowed\"],[[66384,66426],\"valid\"],[[66427,66431],\"disallowed\"],[[66432,66461],\"valid\"],[[66462,66462],\"disallowed\"],[[66463,66463],\"valid\",\"\",\"NV8\"],[[66464,66499],\"valid\"],[[66500,66503],\"disallowed\"],[[66504,66511],\"valid\"],[[66512,66517],\"valid\",\"\",\"NV8\"],[[66518,66559],\"disallowed\"],[[66560,66560],\"mapped\",\"𐐨\"],[[66561,66561],\"mapped\",\"𐐩\"],[[66562,66562],\"mapped\",\"𐐪\"],[[66563,66563],\"mapped\",\"𐐫\"],[[66564,66564],\"mapped\",\"𐐬\"],[[66565,66565],\"mapped\",\"𐐭\"],[[66566,66566],\"mapped\",\"𐐮\"],[[66567,66567],\"mapped\",\"𐐯\"],[[66568,66568],\"mapped\",\"𐐰\"],[[66569,66569],\"mapped\",\"𐐱\"],[[66570,66570],\"mapped\",\"𐐲\"],[[66571,66571],\"mapped\",\"𐐳\"],[[66572,66572],\"mapped\",\"𐐴\"],[[66573,66573],\"mapped\",\"𐐵\"],[[66574,66574],\"mapped\",\"𐐶\"],[[66575,66575],\"mapped\",\"𐐷\"],[[66576,66576],\"mapped\",\"𐐸\"],[[66577,66577],\"mapped\",\"𐐹\"],[[66578,66578],\"mapped\",\"𐐺\"],[[66579,66579],\"mapped\",\"𐐻\"],[[66580,66580],\"mapped\",\"𐐼\"],[[66581,66581],\"mapped\",\"𐐽\"],[[66582,66582],\"mapped\",\"𐐾\"],[[66583,66583],\"mapped\",\"𐐿\"],[[66584,66584],\"mapped\",\"𐑀\"],[[66585,66585],\"mapped\",\"𐑁\"],[[66586,66586],\"mapped\",\"𐑂\"],[[66587,66587],\"mapped\",\"𐑃\"],[[66588,66588],\"mapped\",\"𐑄\"],[[66589,66589],\"mapped\",\"𐑅\"],[[66590,66590],\"mapped\",\"𐑆\"],[[66591,66591],\"mapped\",\"𐑇\"],[[66592,66592],\"mapped\",\"𐑈\"],[[66593,66593],\"mapped\",\"𐑉\"],[[66594,66594],\"mapped\",\"𐑊\"],[[66595,66595],\"mapped\",\"𐑋\"],[[66596,66596],\"mapped\",\"𐑌\"],[[66597,66597],\"mapped\",\"𐑍\"],[[66598,66598],\"mapped\",\"𐑎\"],[[66599,66599],\"mapped\",\"𐑏\"],[[66600,66637],\"valid\"],[[66638,66717],\"valid\"],[[66718,66719],\"disallowed\"],[[66720,66729],\"valid\"],[[66730,66735],\"disallowed\"],[[66736,66736],\"mapped\",\"𐓘\"],[[66737,66737],\"mapped\",\"𐓙\"],[[66738,66738],\"mapped\",\"𐓚\"],[[66739,66739],\"mapped\",\"𐓛\"],[[66740,66740],\"mapped\",\"𐓜\"],[[66741,66741],\"mapped\",\"𐓝\"],[[66742,66742],\"mapped\",\"𐓞\"],[[66743,66743],\"mapped\",\"𐓟\"],[[66744,66744],\"mapped\",\"𐓠\"],[[66745,66745],\"mapped\",\"𐓡\"],[[66746,66746],\"mapped\",\"𐓢\"],[[66747,66747],\"mapped\",\"𐓣\"],[[66748,66748],\"mapped\",\"𐓤\"],[[66749,66749],\"mapped\",\"𐓥\"],[[66750,66750],\"mapped\",\"𐓦\"],[[66751,66751],\"mapped\",\"𐓧\"],[[66752,66752],\"mapped\",\"𐓨\"],[[66753,66753],\"mapped\",\"𐓩\"],[[66754,66754],\"mapped\",\"𐓪\"],[[66755,66755],\"mapped\",\"𐓫\"],[[66756,66756],\"mapped\",\"𐓬\"],[[66757,66757],\"mapped\",\"𐓭\"],[[66758,66758],\"mapped\",\"𐓮\"],[[66759,66759],\"mapped\",\"𐓯\"],[[66760,66760],\"mapped\",\"𐓰\"],[[66761,66761],\"mapped\",\"𐓱\"],[[66762,66762],\"mapped\",\"𐓲\"],[[66763,66763],\"mapped\",\"𐓳\"],[[66764,66764],\"mapped\",\"𐓴\"],[[66765,66765],\"mapped\",\"𐓵\"],[[66766,66766],\"mapped\",\"𐓶\"],[[66767,66767],\"mapped\",\"𐓷\"],[[66768,66768],\"mapped\",\"𐓸\"],[[66769,66769],\"mapped\",\"𐓹\"],[[66770,66770],\"mapped\",\"𐓺\"],[[66771,66771],\"mapped\",\"𐓻\"],[[66772,66775],\"disallowed\"],[[66776,66811],\"valid\"],[[66812,66815],\"disallowed\"],[[66816,66855],\"valid\"],[[66856,66863],\"disallowed\"],[[66864,66915],\"valid\"],[[66916,66926],\"disallowed\"],[[66927,66927],\"valid\",\"\",\"NV8\"],[[66928,67071],\"disallowed\"],[[67072,67382],\"valid\"],[[67383,67391],\"disallowed\"],[[67392,67413],\"valid\"],[[67414,67423],\"disallowed\"],[[67424,67431],\"valid\"],[[67432,67583],\"disallowed\"],[[67584,67589],\"valid\"],[[67590,67591],\"disallowed\"],[[67592,67592],\"valid\"],[[67593,67593],\"disallowed\"],[[67594,67637],\"valid\"],[[67638,67638],\"disallowed\"],[[67639,67640],\"valid\"],[[67641,67643],\"disallowed\"],[[67644,67644],\"valid\"],[[67645,67646],\"disallowed\"],[[67647,67647],\"valid\"],[[67648,67669],\"valid\"],[[67670,67670],\"disallowed\"],[[67671,67679],\"valid\",\"\",\"NV8\"],[[67680,67702],\"valid\"],[[67703,67711],\"valid\",\"\",\"NV8\"],[[67712,67742],\"valid\"],[[67743,67750],\"disallowed\"],[[67751,67759],\"valid\",\"\",\"NV8\"],[[67760,67807],\"disallowed\"],[[67808,67826],\"valid\"],[[67827,67827],\"disallowed\"],[[67828,67829],\"valid\"],[[67830,67834],\"disallowed\"],[[67835,67839],\"valid\",\"\",\"NV8\"],[[67840,67861],\"valid\"],[[67862,67865],\"valid\",\"\",\"NV8\"],[[67866,67867],\"valid\",\"\",\"NV8\"],[[67868,67870],\"disallowed\"],[[67871,67871],\"valid\",\"\",\"NV8\"],[[67872,67897],\"valid\"],[[67898,67902],\"disallowed\"],[[67903,67903],\"valid\",\"\",\"NV8\"],[[67904,67967],\"disallowed\"],[[67968,68023],\"valid\"],[[68024,68027],\"disallowed\"],[[68028,68029],\"valid\",\"\",\"NV8\"],[[68030,68031],\"valid\"],[[68032,68047],\"valid\",\"\",\"NV8\"],[[68048,68049],\"disallowed\"],[[68050,68095],\"valid\",\"\",\"NV8\"],[[68096,68099],\"valid\"],[[68100,68100],\"disallowed\"],[[68101,68102],\"valid\"],[[68103,68107],\"disallowed\"],[[68108,68115],\"valid\"],[[68116,68116],\"disallowed\"],[[68117,68119],\"valid\"],[[68120,68120],\"disallowed\"],[[68121,68147],\"valid\"],[[68148,68151],\"disallowed\"],[[68152,68154],\"valid\"],[[68155,68158],\"disallowed\"],[[68159,68159],\"valid\"],[[68160,68167],\"valid\",\"\",\"NV8\"],[[68168,68175],\"disallowed\"],[[68176,68184],\"valid\",\"\",\"NV8\"],[[68185,68191],\"disallowed\"],[[68192,68220],\"valid\"],[[68221,68223],\"valid\",\"\",\"NV8\"],[[68224,68252],\"valid\"],[[68253,68255],\"valid\",\"\",\"NV8\"],[[68256,68287],\"disallowed\"],[[68288,68295],\"valid\"],[[68296,68296],\"valid\",\"\",\"NV8\"],[[68297,68326],\"valid\"],[[68327,68330],\"disallowed\"],[[68331,68342],\"valid\",\"\",\"NV8\"],[[68343,68351],\"disallowed\"],[[68352,68405],\"valid\"],[[68406,68408],\"disallowed\"],[[68409,68415],\"valid\",\"\",\"NV8\"],[[68416,68437],\"valid\"],[[68438,68439],\"disallowed\"],[[68440,68447],\"valid\",\"\",\"NV8\"],[[68448,68466],\"valid\"],[[68467,68471],\"disallowed\"],[[68472,68479],\"valid\",\"\",\"NV8\"],[[68480,68497],\"valid\"],[[68498,68504],\"disallowed\"],[[68505,68508],\"valid\",\"\",\"NV8\"],[[68509,68520],\"disallowed\"],[[68521,68527],\"valid\",\"\",\"NV8\"],[[68528,68607],\"disallowed\"],[[68608,68680],\"valid\"],[[68681,68735],\"disallowed\"],[[68736,68736],\"mapped\",\"𐳀\"],[[68737,68737],\"mapped\",\"𐳁\"],[[68738,68738],\"mapped\",\"𐳂\"],[[68739,68739],\"mapped\",\"𐳃\"],[[68740,68740],\"mapped\",\"𐳄\"],[[68741,68741],\"mapped\",\"𐳅\"],[[68742,68742],\"mapped\",\"𐳆\"],[[68743,68743],\"mapped\",\"𐳇\"],[[68744,68744],\"mapped\",\"𐳈\"],[[68745,68745],\"mapped\",\"𐳉\"],[[68746,68746],\"mapped\",\"𐳊\"],[[68747,68747],\"mapped\",\"𐳋\"],[[68748,68748],\"mapped\",\"𐳌\"],[[68749,68749],\"mapped\",\"𐳍\"],[[68750,68750],\"mapped\",\"𐳎\"],[[68751,68751],\"mapped\",\"𐳏\"],[[68752,68752],\"mapped\",\"𐳐\"],[[68753,68753],\"mapped\",\"𐳑\"],[[68754,68754],\"mapped\",\"𐳒\"],[[68755,68755],\"mapped\",\"𐳓\"],[[68756,68756],\"mapped\",\"𐳔\"],[[68757,68757],\"mapped\",\"𐳕\"],[[68758,68758],\"mapped\",\"𐳖\"],[[68759,68759],\"mapped\",\"𐳗\"],[[68760,68760],\"mapped\",\"𐳘\"],[[68761,68761],\"mapped\",\"𐳙\"],[[68762,68762],\"mapped\",\"𐳚\"],[[68763,68763],\"mapped\",\"𐳛\"],[[68764,68764],\"mapped\",\"𐳜\"],[[68765,68765],\"mapped\",\"𐳝\"],[[68766,68766],\"mapped\",\"𐳞\"],[[68767,68767],\"mapped\",\"𐳟\"],[[68768,68768],\"mapped\",\"𐳠\"],[[68769,68769],\"mapped\",\"𐳡\"],[[68770,68770],\"mapped\",\"𐳢\"],[[68771,68771],\"mapped\",\"𐳣\"],[[68772,68772],\"mapped\",\"𐳤\"],[[68773,68773],\"mapped\",\"𐳥\"],[[68774,68774],\"mapped\",\"𐳦\"],[[68775,68775],\"mapped\",\"𐳧\"],[[68776,68776],\"mapped\",\"𐳨\"],[[68777,68777],\"mapped\",\"𐳩\"],[[68778,68778],\"mapped\",\"𐳪\"],[[68779,68779],\"mapped\",\"𐳫\"],[[68780,68780],\"mapped\",\"𐳬\"],[[68781,68781],\"mapped\",\"𐳭\"],[[68782,68782],\"mapped\",\"𐳮\"],[[68783,68783],\"mapped\",\"𐳯\"],[[68784,68784],\"mapped\",\"𐳰\"],[[68785,68785],\"mapped\",\"𐳱\"],[[68786,68786],\"mapped\",\"𐳲\"],[[68787,68799],\"disallowed\"],[[68800,68850],\"valid\"],[[68851,68857],\"disallowed\"],[[68858,68863],\"valid\",\"\",\"NV8\"],[[68864,69215],\"disallowed\"],[[69216,69246],\"valid\",\"\",\"NV8\"],[[69247,69631],\"disallowed\"],[[69632,69702],\"valid\"],[[69703,69709],\"valid\",\"\",\"NV8\"],[[69710,69713],\"disallowed\"],[[69714,69733],\"valid\",\"\",\"NV8\"],[[69734,69743],\"valid\"],[[69744,69758],\"disallowed\"],[[69759,69759],\"valid\"],[[69760,69818],\"valid\"],[[69819,69820],\"valid\",\"\",\"NV8\"],[[69821,69821],\"disallowed\"],[[69822,69825],\"valid\",\"\",\"NV8\"],[[69826,69839],\"disallowed\"],[[69840,69864],\"valid\"],[[69865,69871],\"disallowed\"],[[69872,69881],\"valid\"],[[69882,69887],\"disallowed\"],[[69888,69940],\"valid\"],[[69941,69941],\"disallowed\"],[[69942,69951],\"valid\"],[[69952,69955],\"valid\",\"\",\"NV8\"],[[69956,69967],\"disallowed\"],[[69968,70003],\"valid\"],[[70004,70005],\"valid\",\"\",\"NV8\"],[[70006,70006],\"valid\"],[[70007,70015],\"disallowed\"],[[70016,70084],\"valid\"],[[70085,70088],\"valid\",\"\",\"NV8\"],[[70089,70089],\"valid\",\"\",\"NV8\"],[[70090,70092],\"valid\"],[[70093,70093],\"valid\",\"\",\"NV8\"],[[70094,70095],\"disallowed\"],[[70096,70105],\"valid\"],[[70106,70106],\"valid\"],[[70107,70107],\"valid\",\"\",\"NV8\"],[[70108,70108],\"valid\"],[[70109,70111],\"valid\",\"\",\"NV8\"],[[70112,70112],\"disallowed\"],[[70113,70132],\"valid\",\"\",\"NV8\"],[[70133,70143],\"disallowed\"],[[70144,70161],\"valid\"],[[70162,70162],\"disallowed\"],[[70163,70199],\"valid\"],[[70200,70205],\"valid\",\"\",\"NV8\"],[[70206,70206],\"valid\"],[[70207,70271],\"disallowed\"],[[70272,70278],\"valid\"],[[70279,70279],\"disallowed\"],[[70280,70280],\"valid\"],[[70281,70281],\"disallowed\"],[[70282,70285],\"valid\"],[[70286,70286],\"disallowed\"],[[70287,70301],\"valid\"],[[70302,70302],\"disallowed\"],[[70303,70312],\"valid\"],[[70313,70313],\"valid\",\"\",\"NV8\"],[[70314,70319],\"disallowed\"],[[70320,70378],\"valid\"],[[70379,70383],\"disallowed\"],[[70384,70393],\"valid\"],[[70394,70399],\"disallowed\"],[[70400,70400],\"valid\"],[[70401,70403],\"valid\"],[[70404,70404],\"disallowed\"],[[70405,70412],\"valid\"],[[70413,70414],\"disallowed\"],[[70415,70416],\"valid\"],[[70417,70418],\"disallowed\"],[[70419,70440],\"valid\"],[[70441,70441],\"disallowed\"],[[70442,70448],\"valid\"],[[70449,70449],\"disallowed\"],[[70450,70451],\"valid\"],[[70452,70452],\"disallowed\"],[[70453,70457],\"valid\"],[[70458,70459],\"disallowed\"],[[70460,70468],\"valid\"],[[70469,70470],\"disallowed\"],[[70471,70472],\"valid\"],[[70473,70474],\"disallowed\"],[[70475,70477],\"valid\"],[[70478,70479],\"disallowed\"],[[70480,70480],\"valid\"],[[70481,70486],\"disallowed\"],[[70487,70487],\"valid\"],[[70488,70492],\"disallowed\"],[[70493,70499],\"valid\"],[[70500,70501],\"disallowed\"],[[70502,70508],\"valid\"],[[70509,70511],\"disallowed\"],[[70512,70516],\"valid\"],[[70517,70655],\"disallowed\"],[[70656,70730],\"valid\"],[[70731,70735],\"valid\",\"\",\"NV8\"],[[70736,70745],\"valid\"],[[70746,70746],\"disallowed\"],[[70747,70747],\"valid\",\"\",\"NV8\"],[[70748,70748],\"disallowed\"],[[70749,70749],\"valid\",\"\",\"NV8\"],[[70750,70783],\"disallowed\"],[[70784,70853],\"valid\"],[[70854,70854],\"valid\",\"\",\"NV8\"],[[70855,70855],\"valid\"],[[70856,70863],\"disallowed\"],[[70864,70873],\"valid\"],[[70874,71039],\"disallowed\"],[[71040,71093],\"valid\"],[[71094,71095],\"disallowed\"],[[71096,71104],\"valid\"],[[71105,71113],\"valid\",\"\",\"NV8\"],[[71114,71127],\"valid\",\"\",\"NV8\"],[[71128,71133],\"valid\"],[[71134,71167],\"disallowed\"],[[71168,71232],\"valid\"],[[71233,71235],\"valid\",\"\",\"NV8\"],[[71236,71236],\"valid\"],[[71237,71247],\"disallowed\"],[[71248,71257],\"valid\"],[[71258,71263],\"disallowed\"],[[71264,71276],\"valid\",\"\",\"NV8\"],[[71277,71295],\"disallowed\"],[[71296,71351],\"valid\"],[[71352,71359],\"disallowed\"],[[71360,71369],\"valid\"],[[71370,71423],\"disallowed\"],[[71424,71449],\"valid\"],[[71450,71452],\"disallowed\"],[[71453,71467],\"valid\"],[[71468,71471],\"disallowed\"],[[71472,71481],\"valid\"],[[71482,71487],\"valid\",\"\",\"NV8\"],[[71488,71839],\"disallowed\"],[[71840,71840],\"mapped\",\"𑣀\"],[[71841,71841],\"mapped\",\"𑣁\"],[[71842,71842],\"mapped\",\"𑣂\"],[[71843,71843],\"mapped\",\"𑣃\"],[[71844,71844],\"mapped\",\"𑣄\"],[[71845,71845],\"mapped\",\"𑣅\"],[[71846,71846],\"mapped\",\"𑣆\"],[[71847,71847],\"mapped\",\"𑣇\"],[[71848,71848],\"mapped\",\"𑣈\"],[[71849,71849],\"mapped\",\"𑣉\"],[[71850,71850],\"mapped\",\"𑣊\"],[[71851,71851],\"mapped\",\"𑣋\"],[[71852,71852],\"mapped\",\"𑣌\"],[[71853,71853],\"mapped\",\"𑣍\"],[[71854,71854],\"mapped\",\"𑣎\"],[[71855,71855],\"mapped\",\"𑣏\"],[[71856,71856],\"mapped\",\"𑣐\"],[[71857,71857],\"mapped\",\"𑣑\"],[[71858,71858],\"mapped\",\"𑣒\"],[[71859,71859],\"mapped\",\"𑣓\"],[[71860,71860],\"mapped\",\"𑣔\"],[[71861,71861],\"mapped\",\"𑣕\"],[[71862,71862],\"mapped\",\"𑣖\"],[[71863,71863],\"mapped\",\"𑣗\"],[[71864,71864],\"mapped\",\"𑣘\"],[[71865,71865],\"mapped\",\"𑣙\"],[[71866,71866],\"mapped\",\"𑣚\"],[[71867,71867],\"mapped\",\"𑣛\"],[[71868,71868],\"mapped\",\"𑣜\"],[[71869,71869],\"mapped\",\"𑣝\"],[[71870,71870],\"mapped\",\"𑣞\"],[[71871,71871],\"mapped\",\"𑣟\"],[[71872,71913],\"valid\"],[[71914,71922],\"valid\",\"\",\"NV8\"],[[71923,71934],\"disallowed\"],[[71935,71935],\"valid\"],[[71936,72191],\"disallowed\"],[[72192,72254],\"valid\"],[[72255,72262],\"valid\",\"\",\"NV8\"],[[72263,72263],\"valid\"],[[72264,72271],\"disallowed\"],[[72272,72323],\"valid\"],[[72324,72325],\"disallowed\"],[[72326,72345],\"valid\"],[[72346,72348],\"valid\",\"\",\"NV8\"],[[72349,72349],\"disallowed\"],[[72350,72354],\"valid\",\"\",\"NV8\"],[[72355,72383],\"disallowed\"],[[72384,72440],\"valid\"],[[72441,72703],\"disallowed\"],[[72704,72712],\"valid\"],[[72713,72713],\"disallowed\"],[[72714,72758],\"valid\"],[[72759,72759],\"disallowed\"],[[72760,72768],\"valid\"],[[72769,72773],\"valid\",\"\",\"NV8\"],[[72774,72783],\"disallowed\"],[[72784,72793],\"valid\"],[[72794,72812],\"valid\",\"\",\"NV8\"],[[72813,72815],\"disallowed\"],[[72816,72817],\"valid\",\"\",\"NV8\"],[[72818,72847],\"valid\"],[[72848,72849],\"disallowed\"],[[72850,72871],\"valid\"],[[72872,72872],\"disallowed\"],[[72873,72886],\"valid\"],[[72887,72959],\"disallowed\"],[[72960,72966],\"valid\"],[[72967,72967],\"disallowed\"],[[72968,72969],\"valid\"],[[72970,72970],\"disallowed\"],[[72971,73014],\"valid\"],[[73015,73017],\"disallowed\"],[[73018,73018],\"valid\"],[[73019,73019],\"disallowed\"],[[73020,73021],\"valid\"],[[73022,73022],\"disallowed\"],[[73023,73031],\"valid\"],[[73032,73039],\"disallowed\"],[[73040,73049],\"valid\"],[[73050,73727],\"disallowed\"],[[73728,74606],\"valid\"],[[74607,74648],\"valid\"],[[74649,74649],\"valid\"],[[74650,74751],\"disallowed\"],[[74752,74850],\"valid\",\"\",\"NV8\"],[[74851,74862],\"valid\",\"\",\"NV8\"],[[74863,74863],\"disallowed\"],[[74864,74867],\"valid\",\"\",\"NV8\"],[[74868,74868],\"valid\",\"\",\"NV8\"],[[74869,74879],\"disallowed\"],[[74880,75075],\"valid\"],[[75076,77823],\"disallowed\"],[[77824,78894],\"valid\"],[[78895,82943],\"disallowed\"],[[82944,83526],\"valid\"],[[83527,92159],\"disallowed\"],[[92160,92728],\"valid\"],[[92729,92735],\"disallowed\"],[[92736,92766],\"valid\"],[[92767,92767],\"disallowed\"],[[92768,92777],\"valid\"],[[92778,92781],\"disallowed\"],[[92782,92783],\"valid\",\"\",\"NV8\"],[[92784,92879],\"disallowed\"],[[92880,92909],\"valid\"],[[92910,92911],\"disallowed\"],[[92912,92916],\"valid\"],[[92917,92917],\"valid\",\"\",\"NV8\"],[[92918,92927],\"disallowed\"],[[92928,92982],\"valid\"],[[92983,92991],\"valid\",\"\",\"NV8\"],[[92992,92995],\"valid\"],[[92996,92997],\"valid\",\"\",\"NV8\"],[[92998,93007],\"disallowed\"],[[93008,93017],\"valid\"],[[93018,93018],\"disallowed\"],[[93019,93025],\"valid\",\"\",\"NV8\"],[[93026,93026],\"disallowed\"],[[93027,93047],\"valid\"],[[93048,93052],\"disallowed\"],[[93053,93071],\"valid\"],[[93072,93951],\"disallowed\"],[[93952,94020],\"valid\"],[[94021,94031],\"disallowed\"],[[94032,94078],\"valid\"],[[94079,94094],\"disallowed\"],[[94095,94111],\"valid\"],[[94112,94175],\"disallowed\"],[[94176,94176],\"valid\"],[[94177,94177],\"valid\"],[[94178,94207],\"disallowed\"],[[94208,100332],\"valid\"],[[100333,100351],\"disallowed\"],[[100352,101106],\"valid\"],[[101107,110591],\"disallowed\"],[[110592,110593],\"valid\"],[[110594,110878],\"valid\"],[[110879,110959],\"disallowed\"],[[110960,111355],\"valid\"],[[111356,113663],\"disallowed\"],[[113664,113770],\"valid\"],[[113771,113775],\"disallowed\"],[[113776,113788],\"valid\"],[[113789,113791],\"disallowed\"],[[113792,113800],\"valid\"],[[113801,113807],\"disallowed\"],[[113808,113817],\"valid\"],[[113818,113819],\"disallowed\"],[[113820,113820],\"valid\",\"\",\"NV8\"],[[113821,113822],\"valid\"],[[113823,113823],\"valid\",\"\",\"NV8\"],[[113824,113827],\"ignored\"],[[113828,118783],\"disallowed\"],[[118784,119029],\"valid\",\"\",\"NV8\"],[[119030,119039],\"disallowed\"],[[119040,119078],\"valid\",\"\",\"NV8\"],[[119079,119080],\"disallowed\"],[[119081,119081],\"valid\",\"\",\"NV8\"],[[119082,119133],\"valid\",\"\",\"NV8\"],[[119134,119134],\"mapped\",\"𝅗𝅥\"],[[119135,119135],\"mapped\",\"𝅘𝅥\"],[[119136,119136],\"mapped\",\"𝅘𝅥𝅮\"],[[119137,119137],\"mapped\",\"𝅘𝅥𝅯\"],[[119138,119138],\"mapped\",\"𝅘𝅥𝅰\"],[[119139,119139],\"mapped\",\"𝅘𝅥𝅱\"],[[119140,119140],\"mapped\",\"𝅘𝅥𝅲\"],[[119141,119154],\"valid\",\"\",\"NV8\"],[[119155,119162],\"disallowed\"],[[119163,119226],\"valid\",\"\",\"NV8\"],[[119227,119227],\"mapped\",\"𝆹𝅥\"],[[119228,119228],\"mapped\",\"𝆺𝅥\"],[[119229,119229],\"mapped\",\"𝆹𝅥𝅮\"],[[119230,119230],\"mapped\",\"𝆺𝅥𝅮\"],[[119231,119231],\"mapped\",\"𝆹𝅥𝅯\"],[[119232,119232],\"mapped\",\"𝆺𝅥𝅯\"],[[119233,119261],\"valid\",\"\",\"NV8\"],[[119262,119272],\"valid\",\"\",\"NV8\"],[[119273,119295],\"disallowed\"],[[119296,119365],\"valid\",\"\",\"NV8\"],[[119366,119551],\"disallowed\"],[[119552,119638],\"valid\",\"\",\"NV8\"],[[119639,119647],\"disallowed\"],[[119648,119665],\"valid\",\"\",\"NV8\"],[[119666,119807],\"disallowed\"],[[119808,119808],\"mapped\",\"a\"],[[119809,119809],\"mapped\",\"b\"],[[119810,119810],\"mapped\",\"c\"],[[119811,119811],\"mapped\",\"d\"],[[119812,119812],\"mapped\",\"e\"],[[119813,119813],\"mapped\",\"f\"],[[119814,119814],\"mapped\",\"g\"],[[119815,119815],\"mapped\",\"h\"],[[119816,119816],\"mapped\",\"i\"],[[119817,119817],\"mapped\",\"j\"],[[119818,119818],\"mapped\",\"k\"],[[119819,119819],\"mapped\",\"l\"],[[119820,119820],\"mapped\",\"m\"],[[119821,119821],\"mapped\",\"n\"],[[119822,119822],\"mapped\",\"o\"],[[119823,119823],\"mapped\",\"p\"],[[119824,119824],\"mapped\",\"q\"],[[119825,119825],\"mapped\",\"r\"],[[119826,119826],\"mapped\",\"s\"],[[119827,119827],\"mapped\",\"t\"],[[119828,119828],\"mapped\",\"u\"],[[119829,119829],\"mapped\",\"v\"],[[119830,119830],\"mapped\",\"w\"],[[119831,119831],\"mapped\",\"x\"],[[119832,119832],\"mapped\",\"y\"],[[119833,119833],\"mapped\",\"z\"],[[119834,119834],\"mapped\",\"a\"],[[119835,119835],\"mapped\",\"b\"],[[119836,119836],\"mapped\",\"c\"],[[119837,119837],\"mapped\",\"d\"],[[119838,119838],\"mapped\",\"e\"],[[119839,119839],\"mapped\",\"f\"],[[119840,119840],\"mapped\",\"g\"],[[119841,119841],\"mapped\",\"h\"],[[119842,119842],\"mapped\",\"i\"],[[119843,119843],\"mapped\",\"j\"],[[119844,119844],\"mapped\",\"k\"],[[119845,119845],\"mapped\",\"l\"],[[119846,119846],\"mapped\",\"m\"],[[119847,119847],\"mapped\",\"n\"],[[119848,119848],\"mapped\",\"o\"],[[119849,119849],\"mapped\",\"p\"],[[119850,119850],\"mapped\",\"q\"],[[119851,119851],\"mapped\",\"r\"],[[119852,119852],\"mapped\",\"s\"],[[119853,119853],\"mapped\",\"t\"],[[119854,119854],\"mapped\",\"u\"],[[119855,119855],\"mapped\",\"v\"],[[119856,119856],\"mapped\",\"w\"],[[119857,119857],\"mapped\",\"x\"],[[119858,119858],\"mapped\",\"y\"],[[119859,119859],\"mapped\",\"z\"],[[119860,119860],\"mapped\",\"a\"],[[119861,119861],\"mapped\",\"b\"],[[119862,119862],\"mapped\",\"c\"],[[119863,119863],\"mapped\",\"d\"],[[119864,119864],\"mapped\",\"e\"],[[119865,119865],\"mapped\",\"f\"],[[119866,119866],\"mapped\",\"g\"],[[119867,119867],\"mapped\",\"h\"],[[119868,119868],\"mapped\",\"i\"],[[119869,119869],\"mapped\",\"j\"],[[119870,119870],\"mapped\",\"k\"],[[119871,119871],\"mapped\",\"l\"],[[119872,119872],\"mapped\",\"m\"],[[119873,119873],\"mapped\",\"n\"],[[119874,119874],\"mapped\",\"o\"],[[119875,119875],\"mapped\",\"p\"],[[119876,119876],\"mapped\",\"q\"],[[119877,119877],\"mapped\",\"r\"],[[119878,119878],\"mapped\",\"s\"],[[119879,119879],\"mapped\",\"t\"],[[119880,119880],\"mapped\",\"u\"],[[119881,119881],\"mapped\",\"v\"],[[119882,119882],\"mapped\",\"w\"],[[119883,119883],\"mapped\",\"x\"],[[119884,119884],\"mapped\",\"y\"],[[119885,119885],\"mapped\",\"z\"],[[119886,119886],\"mapped\",\"a\"],[[119887,119887],\"mapped\",\"b\"],[[119888,119888],\"mapped\",\"c\"],[[119889,119889],\"mapped\",\"d\"],[[119890,119890],\"mapped\",\"e\"],[[119891,119891],\"mapped\",\"f\"],[[119892,119892],\"mapped\",\"g\"],[[119893,119893],\"disallowed\"],[[119894,119894],\"mapped\",\"i\"],[[119895,119895],\"mapped\",\"j\"],[[119896,119896],\"mapped\",\"k\"],[[119897,119897],\"mapped\",\"l\"],[[119898,119898],\"mapped\",\"m\"],[[119899,119899],\"mapped\",\"n\"],[[119900,119900],\"mapped\",\"o\"],[[119901,119901],\"mapped\",\"p\"],[[119902,119902],\"mapped\",\"q\"],[[119903,119903],\"mapped\",\"r\"],[[119904,119904],\"mapped\",\"s\"],[[119905,119905],\"mapped\",\"t\"],[[119906,119906],\"mapped\",\"u\"],[[119907,119907],\"mapped\",\"v\"],[[119908,119908],\"mapped\",\"w\"],[[119909,119909],\"mapped\",\"x\"],[[119910,119910],\"mapped\",\"y\"],[[119911,119911],\"mapped\",\"z\"],[[119912,119912],\"mapped\",\"a\"],[[119913,119913],\"mapped\",\"b\"],[[119914,119914],\"mapped\",\"c\"],[[119915,119915],\"mapped\",\"d\"],[[119916,119916],\"mapped\",\"e\"],[[119917,119917],\"mapped\",\"f\"],[[119918,119918],\"mapped\",\"g\"],[[119919,119919],\"mapped\",\"h\"],[[119920,119920],\"mapped\",\"i\"],[[119921,119921],\"mapped\",\"j\"],[[119922,119922],\"mapped\",\"k\"],[[119923,119923],\"mapped\",\"l\"],[[119924,119924],\"mapped\",\"m\"],[[119925,119925],\"mapped\",\"n\"],[[119926,119926],\"mapped\",\"o\"],[[119927,119927],\"mapped\",\"p\"],[[119928,119928],\"mapped\",\"q\"],[[119929,119929],\"mapped\",\"r\"],[[119930,119930],\"mapped\",\"s\"],[[119931,119931],\"mapped\",\"t\"],[[119932,119932],\"mapped\",\"u\"],[[119933,119933],\"mapped\",\"v\"],[[119934,119934],\"mapped\",\"w\"],[[119935,119935],\"mapped\",\"x\"],[[119936,119936],\"mapped\",\"y\"],[[119937,119937],\"mapped\",\"z\"],[[119938,119938],\"mapped\",\"a\"],[[119939,119939],\"mapped\",\"b\"],[[119940,119940],\"mapped\",\"c\"],[[119941,119941],\"mapped\",\"d\"],[[119942,119942],\"mapped\",\"e\"],[[119943,119943],\"mapped\",\"f\"],[[119944,119944],\"mapped\",\"g\"],[[119945,119945],\"mapped\",\"h\"],[[119946,119946],\"mapped\",\"i\"],[[119947,119947],\"mapped\",\"j\"],[[119948,119948],\"mapped\",\"k\"],[[119949,119949],\"mapped\",\"l\"],[[119950,119950],\"mapped\",\"m\"],[[119951,119951],\"mapped\",\"n\"],[[119952,119952],\"mapped\",\"o\"],[[119953,119953],\"mapped\",\"p\"],[[119954,119954],\"mapped\",\"q\"],[[119955,119955],\"mapped\",\"r\"],[[119956,119956],\"mapped\",\"s\"],[[119957,119957],\"mapped\",\"t\"],[[119958,119958],\"mapped\",\"u\"],[[119959,119959],\"mapped\",\"v\"],[[119960,119960],\"mapped\",\"w\"],[[119961,119961],\"mapped\",\"x\"],[[119962,119962],\"mapped\",\"y\"],[[119963,119963],\"mapped\",\"z\"],[[119964,119964],\"mapped\",\"a\"],[[119965,119965],\"disallowed\"],[[119966,119966],\"mapped\",\"c\"],[[119967,119967],\"mapped\",\"d\"],[[119968,119969],\"disallowed\"],[[119970,119970],\"mapped\",\"g\"],[[119971,119972],\"disallowed\"],[[119973,119973],\"mapped\",\"j\"],[[119974,119974],\"mapped\",\"k\"],[[119975,119976],\"disallowed\"],[[119977,119977],\"mapped\",\"n\"],[[119978,119978],\"mapped\",\"o\"],[[119979,119979],\"mapped\",\"p\"],[[119980,119980],\"mapped\",\"q\"],[[119981,119981],\"disallowed\"],[[119982,119982],\"mapped\",\"s\"],[[119983,119983],\"mapped\",\"t\"],[[119984,119984],\"mapped\",\"u\"],[[119985,119985],\"mapped\",\"v\"],[[119986,119986],\"mapped\",\"w\"],[[119987,119987],\"mapped\",\"x\"],[[119988,119988],\"mapped\",\"y\"],[[119989,119989],\"mapped\",\"z\"],[[119990,119990],\"mapped\",\"a\"],[[119991,119991],\"mapped\",\"b\"],[[119992,119992],\"mapped\",\"c\"],[[119993,119993],\"mapped\",\"d\"],[[119994,119994],\"disallowed\"],[[119995,119995],\"mapped\",\"f\"],[[119996,119996],\"disallowed\"],[[119997,119997],\"mapped\",\"h\"],[[119998,119998],\"mapped\",\"i\"],[[119999,119999],\"mapped\",\"j\"],[[120000,120000],\"mapped\",\"k\"],[[120001,120001],\"mapped\",\"l\"],[[120002,120002],\"mapped\",\"m\"],[[120003,120003],\"mapped\",\"n\"],[[120004,120004],\"disallowed\"],[[120005,120005],\"mapped\",\"p\"],[[120006,120006],\"mapped\",\"q\"],[[120007,120007],\"mapped\",\"r\"],[[120008,120008],\"mapped\",\"s\"],[[120009,120009],\"mapped\",\"t\"],[[120010,120010],\"mapped\",\"u\"],[[120011,120011],\"mapped\",\"v\"],[[120012,120012],\"mapped\",\"w\"],[[120013,120013],\"mapped\",\"x\"],[[120014,120014],\"mapped\",\"y\"],[[120015,120015],\"mapped\",\"z\"],[[120016,120016],\"mapped\",\"a\"],[[120017,120017],\"mapped\",\"b\"],[[120018,120018],\"mapped\",\"c\"],[[120019,120019],\"mapped\",\"d\"],[[120020,120020],\"mapped\",\"e\"],[[120021,120021],\"mapped\",\"f\"],[[120022,120022],\"mapped\",\"g\"],[[120023,120023],\"mapped\",\"h\"],[[120024,120024],\"mapped\",\"i\"],[[120025,120025],\"mapped\",\"j\"],[[120026,120026],\"mapped\",\"k\"],[[120027,120027],\"mapped\",\"l\"],[[120028,120028],\"mapped\",\"m\"],[[120029,120029],\"mapped\",\"n\"],[[120030,120030],\"mapped\",\"o\"],[[120031,120031],\"mapped\",\"p\"],[[120032,120032],\"mapped\",\"q\"],[[120033,120033],\"mapped\",\"r\"],[[120034,120034],\"mapped\",\"s\"],[[120035,120035],\"mapped\",\"t\"],[[120036,120036],\"mapped\",\"u\"],[[120037,120037],\"mapped\",\"v\"],[[120038,120038],\"mapped\",\"w\"],[[120039,120039],\"mapped\",\"x\"],[[120040,120040],\"mapped\",\"y\"],[[120041,120041],\"mapped\",\"z\"],[[120042,120042],\"mapped\",\"a\"],[[120043,120043],\"mapped\",\"b\"],[[120044,120044],\"mapped\",\"c\"],[[120045,120045],\"mapped\",\"d\"],[[120046,120046],\"mapped\",\"e\"],[[120047,120047],\"mapped\",\"f\"],[[120048,120048],\"mapped\",\"g\"],[[120049,120049],\"mapped\",\"h\"],[[120050,120050],\"mapped\",\"i\"],[[120051,120051],\"mapped\",\"j\"],[[120052,120052],\"mapped\",\"k\"],[[120053,120053],\"mapped\",\"l\"],[[120054,120054],\"mapped\",\"m\"],[[120055,120055],\"mapped\",\"n\"],[[120056,120056],\"mapped\",\"o\"],[[120057,120057],\"mapped\",\"p\"],[[120058,120058],\"mapped\",\"q\"],[[120059,120059],\"mapped\",\"r\"],[[120060,120060],\"mapped\",\"s\"],[[120061,120061],\"mapped\",\"t\"],[[120062,120062],\"mapped\",\"u\"],[[120063,120063],\"mapped\",\"v\"],[[120064,120064],\"mapped\",\"w\"],[[120065,120065],\"mapped\",\"x\"],[[120066,120066],\"mapped\",\"y\"],[[120067,120067],\"mapped\",\"z\"],[[120068,120068],\"mapped\",\"a\"],[[120069,120069],\"mapped\",\"b\"],[[120070,120070],\"disallowed\"],[[120071,120071],\"mapped\",\"d\"],[[120072,120072],\"mapped\",\"e\"],[[120073,120073],\"mapped\",\"f\"],[[120074,120074],\"mapped\",\"g\"],[[120075,120076],\"disallowed\"],[[120077,120077],\"mapped\",\"j\"],[[120078,120078],\"mapped\",\"k\"],[[120079,120079],\"mapped\",\"l\"],[[120080,120080],\"mapped\",\"m\"],[[120081,120081],\"mapped\",\"n\"],[[120082,120082],\"mapped\",\"o\"],[[120083,120083],\"mapped\",\"p\"],[[120084,120084],\"mapped\",\"q\"],[[120085,120085],\"disallowed\"],[[120086,120086],\"mapped\",\"s\"],[[120087,120087],\"mapped\",\"t\"],[[120088,120088],\"mapped\",\"u\"],[[120089,120089],\"mapped\",\"v\"],[[120090,120090],\"mapped\",\"w\"],[[120091,120091],\"mapped\",\"x\"],[[120092,120092],\"mapped\",\"y\"],[[120093,120093],\"disallowed\"],[[120094,120094],\"mapped\",\"a\"],[[120095,120095],\"mapped\",\"b\"],[[120096,120096],\"mapped\",\"c\"],[[120097,120097],\"mapped\",\"d\"],[[120098,120098],\"mapped\",\"e\"],[[120099,120099],\"mapped\",\"f\"],[[120100,120100],\"mapped\",\"g\"],[[120101,120101],\"mapped\",\"h\"],[[120102,120102],\"mapped\",\"i\"],[[120103,120103],\"mapped\",\"j\"],[[120104,120104],\"mapped\",\"k\"],[[120105,120105],\"mapped\",\"l\"],[[120106,120106],\"mapped\",\"m\"],[[120107,120107],\"mapped\",\"n\"],[[120108,120108],\"mapped\",\"o\"],[[120109,120109],\"mapped\",\"p\"],[[120110,120110],\"mapped\",\"q\"],[[120111,120111],\"mapped\",\"r\"],[[120112,120112],\"mapped\",\"s\"],[[120113,120113],\"mapped\",\"t\"],[[120114,120114],\"mapped\",\"u\"],[[120115,120115],\"mapped\",\"v\"],[[120116,120116],\"mapped\",\"w\"],[[120117,120117],\"mapped\",\"x\"],[[120118,120118],\"mapped\",\"y\"],[[120119,120119],\"mapped\",\"z\"],[[120120,120120],\"mapped\",\"a\"],[[120121,120121],\"mapped\",\"b\"],[[120122,120122],\"disallowed\"],[[120123,120123],\"mapped\",\"d\"],[[120124,120124],\"mapped\",\"e\"],[[120125,120125],\"mapped\",\"f\"],[[120126,120126],\"mapped\",\"g\"],[[120127,120127],\"disallowed\"],[[120128,120128],\"mapped\",\"i\"],[[120129,120129],\"mapped\",\"j\"],[[120130,120130],\"mapped\",\"k\"],[[120131,120131],\"mapped\",\"l\"],[[120132,120132],\"mapped\",\"m\"],[[120133,120133],\"disallowed\"],[[120134,120134],\"mapped\",\"o\"],[[120135,120137],\"disallowed\"],[[120138,120138],\"mapped\",\"s\"],[[120139,120139],\"mapped\",\"t\"],[[120140,120140],\"mapped\",\"u\"],[[120141,120141],\"mapped\",\"v\"],[[120142,120142],\"mapped\",\"w\"],[[120143,120143],\"mapped\",\"x\"],[[120144,120144],\"mapped\",\"y\"],[[120145,120145],\"disallowed\"],[[120146,120146],\"mapped\",\"a\"],[[120147,120147],\"mapped\",\"b\"],[[120148,120148],\"mapped\",\"c\"],[[120149,120149],\"mapped\",\"d\"],[[120150,120150],\"mapped\",\"e\"],[[120151,120151],\"mapped\",\"f\"],[[120152,120152],\"mapped\",\"g\"],[[120153,120153],\"mapped\",\"h\"],[[120154,120154],\"mapped\",\"i\"],[[120155,120155],\"mapped\",\"j\"],[[120156,120156],\"mapped\",\"k\"],[[120157,120157],\"mapped\",\"l\"],[[120158,120158],\"mapped\",\"m\"],[[120159,120159],\"mapped\",\"n\"],[[120160,120160],\"mapped\",\"o\"],[[120161,120161],\"mapped\",\"p\"],[[120162,120162],\"mapped\",\"q\"],[[120163,120163],\"mapped\",\"r\"],[[120164,120164],\"mapped\",\"s\"],[[120165,120165],\"mapped\",\"t\"],[[120166,120166],\"mapped\",\"u\"],[[120167,120167],\"mapped\",\"v\"],[[120168,120168],\"mapped\",\"w\"],[[120169,120169],\"mapped\",\"x\"],[[120170,120170],\"mapped\",\"y\"],[[120171,120171],\"mapped\",\"z\"],[[120172,120172],\"mapped\",\"a\"],[[120173,120173],\"mapped\",\"b\"],[[120174,120174],\"mapped\",\"c\"],[[120175,120175],\"mapped\",\"d\"],[[120176,120176],\"mapped\",\"e\"],[[120177,120177],\"mapped\",\"f\"],[[120178,120178],\"mapped\",\"g\"],[[120179,120179],\"mapped\",\"h\"],[[120180,120180],\"mapped\",\"i\"],[[120181,120181],\"mapped\",\"j\"],[[120182,120182],\"mapped\",\"k\"],[[120183,120183],\"mapped\",\"l\"],[[120184,120184],\"mapped\",\"m\"],[[120185,120185],\"mapped\",\"n\"],[[120186,120186],\"mapped\",\"o\"],[[120187,120187],\"mapped\",\"p\"],[[120188,120188],\"mapped\",\"q\"],[[120189,120189],\"mapped\",\"r\"],[[120190,120190],\"mapped\",\"s\"],[[120191,120191],\"mapped\",\"t\"],[[120192,120192],\"mapped\",\"u\"],[[120193,120193],\"mapped\",\"v\"],[[120194,120194],\"mapped\",\"w\"],[[120195,120195],\"mapped\",\"x\"],[[120196,120196],\"mapped\",\"y\"],[[120197,120197],\"mapped\",\"z\"],[[120198,120198],\"mapped\",\"a\"],[[120199,120199],\"mapped\",\"b\"],[[120200,120200],\"mapped\",\"c\"],[[120201,120201],\"mapped\",\"d\"],[[120202,120202],\"mapped\",\"e\"],[[120203,120203],\"mapped\",\"f\"],[[120204,120204],\"mapped\",\"g\"],[[120205,120205],\"mapped\",\"h\"],[[120206,120206],\"mapped\",\"i\"],[[120207,120207],\"mapped\",\"j\"],[[120208,120208],\"mapped\",\"k\"],[[120209,120209],\"mapped\",\"l\"],[[120210,120210],\"mapped\",\"m\"],[[120211,120211],\"mapped\",\"n\"],[[120212,120212],\"mapped\",\"o\"],[[120213,120213],\"mapped\",\"p\"],[[120214,120214],\"mapped\",\"q\"],[[120215,120215],\"mapped\",\"r\"],[[120216,120216],\"mapped\",\"s\"],[[120217,120217],\"mapped\",\"t\"],[[120218,120218],\"mapped\",\"u\"],[[120219,120219],\"mapped\",\"v\"],[[120220,120220],\"mapped\",\"w\"],[[120221,120221],\"mapped\",\"x\"],[[120222,120222],\"mapped\",\"y\"],[[120223,120223],\"mapped\",\"z\"],[[120224,120224],\"mapped\",\"a\"],[[120225,120225],\"mapped\",\"b\"],[[120226,120226],\"mapped\",\"c\"],[[120227,120227],\"mapped\",\"d\"],[[120228,120228],\"mapped\",\"e\"],[[120229,120229],\"mapped\",\"f\"],[[120230,120230],\"mapped\",\"g\"],[[120231,120231],\"mapped\",\"h\"],[[120232,120232],\"mapped\",\"i\"],[[120233,120233],\"mapped\",\"j\"],[[120234,120234],\"mapped\",\"k\"],[[120235,120235],\"mapped\",\"l\"],[[120236,120236],\"mapped\",\"m\"],[[120237,120237],\"mapped\",\"n\"],[[120238,120238],\"mapped\",\"o\"],[[120239,120239],\"mapped\",\"p\"],[[120240,120240],\"mapped\",\"q\"],[[120241,120241],\"mapped\",\"r\"],[[120242,120242],\"mapped\",\"s\"],[[120243,120243],\"mapped\",\"t\"],[[120244,120244],\"mapped\",\"u\"],[[120245,120245],\"mapped\",\"v\"],[[120246,120246],\"mapped\",\"w\"],[[120247,120247],\"mapped\",\"x\"],[[120248,120248],\"mapped\",\"y\"],[[120249,120249],\"mapped\",\"z\"],[[120250,120250],\"mapped\",\"a\"],[[120251,120251],\"mapped\",\"b\"],[[120252,120252],\"mapped\",\"c\"],[[120253,120253],\"mapped\",\"d\"],[[120254,120254],\"mapped\",\"e\"],[[120255,120255],\"mapped\",\"f\"],[[120256,120256],\"mapped\",\"g\"],[[120257,120257],\"mapped\",\"h\"],[[120258,120258],\"mapped\",\"i\"],[[120259,120259],\"mapped\",\"j\"],[[120260,120260],\"mapped\",\"k\"],[[120261,120261],\"mapped\",\"l\"],[[120262,120262],\"mapped\",\"m\"],[[120263,120263],\"mapped\",\"n\"],[[120264,120264],\"mapped\",\"o\"],[[120265,120265],\"mapped\",\"p\"],[[120266,120266],\"mapped\",\"q\"],[[120267,120267],\"mapped\",\"r\"],[[120268,120268],\"mapped\",\"s\"],[[120269,120269],\"mapped\",\"t\"],[[120270,120270],\"mapped\",\"u\"],[[120271,120271],\"mapped\",\"v\"],[[120272,120272],\"mapped\",\"w\"],[[120273,120273],\"mapped\",\"x\"],[[120274,120274],\"mapped\",\"y\"],[[120275,120275],\"mapped\",\"z\"],[[120276,120276],\"mapped\",\"a\"],[[120277,120277],\"mapped\",\"b\"],[[120278,120278],\"mapped\",\"c\"],[[120279,120279],\"mapped\",\"d\"],[[120280,120280],\"mapped\",\"e\"],[[120281,120281],\"mapped\",\"f\"],[[120282,120282],\"mapped\",\"g\"],[[120283,120283],\"mapped\",\"h\"],[[120284,120284],\"mapped\",\"i\"],[[120285,120285],\"mapped\",\"j\"],[[120286,120286],\"mapped\",\"k\"],[[120287,120287],\"mapped\",\"l\"],[[120288,120288],\"mapped\",\"m\"],[[120289,120289],\"mapped\",\"n\"],[[120290,120290],\"mapped\",\"o\"],[[120291,120291],\"mapped\",\"p\"],[[120292,120292],\"mapped\",\"q\"],[[120293,120293],\"mapped\",\"r\"],[[120294,120294],\"mapped\",\"s\"],[[120295,120295],\"mapped\",\"t\"],[[120296,120296],\"mapped\",\"u\"],[[120297,120297],\"mapped\",\"v\"],[[120298,120298],\"mapped\",\"w\"],[[120299,120299],\"mapped\",\"x\"],[[120300,120300],\"mapped\",\"y\"],[[120301,120301],\"mapped\",\"z\"],[[120302,120302],\"mapped\",\"a\"],[[120303,120303],\"mapped\",\"b\"],[[120304,120304],\"mapped\",\"c\"],[[120305,120305],\"mapped\",\"d\"],[[120306,120306],\"mapped\",\"e\"],[[120307,120307],\"mapped\",\"f\"],[[120308,120308],\"mapped\",\"g\"],[[120309,120309],\"mapped\",\"h\"],[[120310,120310],\"mapped\",\"i\"],[[120311,120311],\"mapped\",\"j\"],[[120312,120312],\"mapped\",\"k\"],[[120313,120313],\"mapped\",\"l\"],[[120314,120314],\"mapped\",\"m\"],[[120315,120315],\"mapped\",\"n\"],[[120316,120316],\"mapped\",\"o\"],[[120317,120317],\"mapped\",\"p\"],[[120318,120318],\"mapped\",\"q\"],[[120319,120319],\"mapped\",\"r\"],[[120320,120320],\"mapped\",\"s\"],[[120321,120321],\"mapped\",\"t\"],[[120322,120322],\"mapped\",\"u\"],[[120323,120323],\"mapped\",\"v\"],[[120324,120324],\"mapped\",\"w\"],[[120325,120325],\"mapped\",\"x\"],[[120326,120326],\"mapped\",\"y\"],[[120327,120327],\"mapped\",\"z\"],[[120328,120328],\"mapped\",\"a\"],[[120329,120329],\"mapped\",\"b\"],[[120330,120330],\"mapped\",\"c\"],[[120331,120331],\"mapped\",\"d\"],[[120332,120332],\"mapped\",\"e\"],[[120333,120333],\"mapped\",\"f\"],[[120334,120334],\"mapped\",\"g\"],[[120335,120335],\"mapped\",\"h\"],[[120336,120336],\"mapped\",\"i\"],[[120337,120337],\"mapped\",\"j\"],[[120338,120338],\"mapped\",\"k\"],[[120339,120339],\"mapped\",\"l\"],[[120340,120340],\"mapped\",\"m\"],[[120341,120341],\"mapped\",\"n\"],[[120342,120342],\"mapped\",\"o\"],[[120343,120343],\"mapped\",\"p\"],[[120344,120344],\"mapped\",\"q\"],[[120345,120345],\"mapped\",\"r\"],[[120346,120346],\"mapped\",\"s\"],[[120347,120347],\"mapped\",\"t\"],[[120348,120348],\"mapped\",\"u\"],[[120349,120349],\"mapped\",\"v\"],[[120350,120350],\"mapped\",\"w\"],[[120351,120351],\"mapped\",\"x\"],[[120352,120352],\"mapped\",\"y\"],[[120353,120353],\"mapped\",\"z\"],[[120354,120354],\"mapped\",\"a\"],[[120355,120355],\"mapped\",\"b\"],[[120356,120356],\"mapped\",\"c\"],[[120357,120357],\"mapped\",\"d\"],[[120358,120358],\"mapped\",\"e\"],[[120359,120359],\"mapped\",\"f\"],[[120360,120360],\"mapped\",\"g\"],[[120361,120361],\"mapped\",\"h\"],[[120362,120362],\"mapped\",\"i\"],[[120363,120363],\"mapped\",\"j\"],[[120364,120364],\"mapped\",\"k\"],[[120365,120365],\"mapped\",\"l\"],[[120366,120366],\"mapped\",\"m\"],[[120367,120367],\"mapped\",\"n\"],[[120368,120368],\"mapped\",\"o\"],[[120369,120369],\"mapped\",\"p\"],[[120370,120370],\"mapped\",\"q\"],[[120371,120371],\"mapped\",\"r\"],[[120372,120372],\"mapped\",\"s\"],[[120373,120373],\"mapped\",\"t\"],[[120374,120374],\"mapped\",\"u\"],[[120375,120375],\"mapped\",\"v\"],[[120376,120376],\"mapped\",\"w\"],[[120377,120377],\"mapped\",\"x\"],[[120378,120378],\"mapped\",\"y\"],[[120379,120379],\"mapped\",\"z\"],[[120380,120380],\"mapped\",\"a\"],[[120381,120381],\"mapped\",\"b\"],[[120382,120382],\"mapped\",\"c\"],[[120383,120383],\"mapped\",\"d\"],[[120384,120384],\"mapped\",\"e\"],[[120385,120385],\"mapped\",\"f\"],[[120386,120386],\"mapped\",\"g\"],[[120387,120387],\"mapped\",\"h\"],[[120388,120388],\"mapped\",\"i\"],[[120389,120389],\"mapped\",\"j\"],[[120390,120390],\"mapped\",\"k\"],[[120391,120391],\"mapped\",\"l\"],[[120392,120392],\"mapped\",\"m\"],[[120393,120393],\"mapped\",\"n\"],[[120394,120394],\"mapped\",\"o\"],[[120395,120395],\"mapped\",\"p\"],[[120396,120396],\"mapped\",\"q\"],[[120397,120397],\"mapped\",\"r\"],[[120398,120398],\"mapped\",\"s\"],[[120399,120399],\"mapped\",\"t\"],[[120400,120400],\"mapped\",\"u\"],[[120401,120401],\"mapped\",\"v\"],[[120402,120402],\"mapped\",\"w\"],[[120403,120403],\"mapped\",\"x\"],[[120404,120404],\"mapped\",\"y\"],[[120405,120405],\"mapped\",\"z\"],[[120406,120406],\"mapped\",\"a\"],[[120407,120407],\"mapped\",\"b\"],[[120408,120408],\"mapped\",\"c\"],[[120409,120409],\"mapped\",\"d\"],[[120410,120410],\"mapped\",\"e\"],[[120411,120411],\"mapped\",\"f\"],[[120412,120412],\"mapped\",\"g\"],[[120413,120413],\"mapped\",\"h\"],[[120414,120414],\"mapped\",\"i\"],[[120415,120415],\"mapped\",\"j\"],[[120416,120416],\"mapped\",\"k\"],[[120417,120417],\"mapped\",\"l\"],[[120418,120418],\"mapped\",\"m\"],[[120419,120419],\"mapped\",\"n\"],[[120420,120420],\"mapped\",\"o\"],[[120421,120421],\"mapped\",\"p\"],[[120422,120422],\"mapped\",\"q\"],[[120423,120423],\"mapped\",\"r\"],[[120424,120424],\"mapped\",\"s\"],[[120425,120425],\"mapped\",\"t\"],[[120426,120426],\"mapped\",\"u\"],[[120427,120427],\"mapped\",\"v\"],[[120428,120428],\"mapped\",\"w\"],[[120429,120429],\"mapped\",\"x\"],[[120430,120430],\"mapped\",\"y\"],[[120431,120431],\"mapped\",\"z\"],[[120432,120432],\"mapped\",\"a\"],[[120433,120433],\"mapped\",\"b\"],[[120434,120434],\"mapped\",\"c\"],[[120435,120435],\"mapped\",\"d\"],[[120436,120436],\"mapped\",\"e\"],[[120437,120437],\"mapped\",\"f\"],[[120438,120438],\"mapped\",\"g\"],[[120439,120439],\"mapped\",\"h\"],[[120440,120440],\"mapped\",\"i\"],[[120441,120441],\"mapped\",\"j\"],[[120442,120442],\"mapped\",\"k\"],[[120443,120443],\"mapped\",\"l\"],[[120444,120444],\"mapped\",\"m\"],[[120445,120445],\"mapped\",\"n\"],[[120446,120446],\"mapped\",\"o\"],[[120447,120447],\"mapped\",\"p\"],[[120448,120448],\"mapped\",\"q\"],[[120449,120449],\"mapped\",\"r\"],[[120450,120450],\"mapped\",\"s\"],[[120451,120451],\"mapped\",\"t\"],[[120452,120452],\"mapped\",\"u\"],[[120453,120453],\"mapped\",\"v\"],[[120454,120454],\"mapped\",\"w\"],[[120455,120455],\"mapped\",\"x\"],[[120456,120456],\"mapped\",\"y\"],[[120457,120457],\"mapped\",\"z\"],[[120458,120458],\"mapped\",\"a\"],[[120459,120459],\"mapped\",\"b\"],[[120460,120460],\"mapped\",\"c\"],[[120461,120461],\"mapped\",\"d\"],[[120462,120462],\"mapped\",\"e\"],[[120463,120463],\"mapped\",\"f\"],[[120464,120464],\"mapped\",\"g\"],[[120465,120465],\"mapped\",\"h\"],[[120466,120466],\"mapped\",\"i\"],[[120467,120467],\"mapped\",\"j\"],[[120468,120468],\"mapped\",\"k\"],[[120469,120469],\"mapped\",\"l\"],[[120470,120470],\"mapped\",\"m\"],[[120471,120471],\"mapped\",\"n\"],[[120472,120472],\"mapped\",\"o\"],[[120473,120473],\"mapped\",\"p\"],[[120474,120474],\"mapped\",\"q\"],[[120475,120475],\"mapped\",\"r\"],[[120476,120476],\"mapped\",\"s\"],[[120477,120477],\"mapped\",\"t\"],[[120478,120478],\"mapped\",\"u\"],[[120479,120479],\"mapped\",\"v\"],[[120480,120480],\"mapped\",\"w\"],[[120481,120481],\"mapped\",\"x\"],[[120482,120482],\"mapped\",\"y\"],[[120483,120483],\"mapped\",\"z\"],[[120484,120484],\"mapped\",\"ı\"],[[120485,120485],\"mapped\",\"ȷ\"],[[120486,120487],\"disallowed\"],[[120488,120488],\"mapped\",\"α\"],[[120489,120489],\"mapped\",\"β\"],[[120490,120490],\"mapped\",\"γ\"],[[120491,120491],\"mapped\",\"δ\"],[[120492,120492],\"mapped\",\"ε\"],[[120493,120493],\"mapped\",\"ζ\"],[[120494,120494],\"mapped\",\"η\"],[[120495,120495],\"mapped\",\"θ\"],[[120496,120496],\"mapped\",\"ι\"],[[120497,120497],\"mapped\",\"κ\"],[[120498,120498],\"mapped\",\"λ\"],[[120499,120499],\"mapped\",\"μ\"],[[120500,120500],\"mapped\",\"ν\"],[[120501,120501],\"mapped\",\"ξ\"],[[120502,120502],\"mapped\",\"ο\"],[[120503,120503],\"mapped\",\"π\"],[[120504,120504],\"mapped\",\"ρ\"],[[120505,120505],\"mapped\",\"θ\"],[[120506,120506],\"mapped\",\"σ\"],[[120507,120507],\"mapped\",\"τ\"],[[120508,120508],\"mapped\",\"υ\"],[[120509,120509],\"mapped\",\"φ\"],[[120510,120510],\"mapped\",\"χ\"],[[120511,120511],\"mapped\",\"ψ\"],[[120512,120512],\"mapped\",\"ω\"],[[120513,120513],\"mapped\",\"∇\"],[[120514,120514],\"mapped\",\"α\"],[[120515,120515],\"mapped\",\"β\"],[[120516,120516],\"mapped\",\"γ\"],[[120517,120517],\"mapped\",\"δ\"],[[120518,120518],\"mapped\",\"ε\"],[[120519,120519],\"mapped\",\"ζ\"],[[120520,120520],\"mapped\",\"η\"],[[120521,120521],\"mapped\",\"θ\"],[[120522,120522],\"mapped\",\"ι\"],[[120523,120523],\"mapped\",\"κ\"],[[120524,120524],\"mapped\",\"λ\"],[[120525,120525],\"mapped\",\"μ\"],[[120526,120526],\"mapped\",\"ν\"],[[120527,120527],\"mapped\",\"ξ\"],[[120528,120528],\"mapped\",\"ο\"],[[120529,120529],\"mapped\",\"π\"],[[120530,120530],\"mapped\",\"ρ\"],[[120531,120532],\"mapped\",\"σ\"],[[120533,120533],\"mapped\",\"τ\"],[[120534,120534],\"mapped\",\"υ\"],[[120535,120535],\"mapped\",\"φ\"],[[120536,120536],\"mapped\",\"χ\"],[[120537,120537],\"mapped\",\"ψ\"],[[120538,120538],\"mapped\",\"ω\"],[[120539,120539],\"mapped\",\"∂\"],[[120540,120540],\"mapped\",\"ε\"],[[120541,120541],\"mapped\",\"θ\"],[[120542,120542],\"mapped\",\"κ\"],[[120543,120543],\"mapped\",\"φ\"],[[120544,120544],\"mapped\",\"ρ\"],[[120545,120545],\"mapped\",\"π\"],[[120546,120546],\"mapped\",\"α\"],[[120547,120547],\"mapped\",\"β\"],[[120548,120548],\"mapped\",\"γ\"],[[120549,120549],\"mapped\",\"δ\"],[[120550,120550],\"mapped\",\"ε\"],[[120551,120551],\"mapped\",\"ζ\"],[[120552,120552],\"mapped\",\"η\"],[[120553,120553],\"mapped\",\"θ\"],[[120554,120554],\"mapped\",\"ι\"],[[120555,120555],\"mapped\",\"κ\"],[[120556,120556],\"mapped\",\"λ\"],[[120557,120557],\"mapped\",\"μ\"],[[120558,120558],\"mapped\",\"ν\"],[[120559,120559],\"mapped\",\"ξ\"],[[120560,120560],\"mapped\",\"ο\"],[[120561,120561],\"mapped\",\"π\"],[[120562,120562],\"mapped\",\"ρ\"],[[120563,120563],\"mapped\",\"θ\"],[[120564,120564],\"mapped\",\"σ\"],[[120565,120565],\"mapped\",\"τ\"],[[120566,120566],\"mapped\",\"υ\"],[[120567,120567],\"mapped\",\"φ\"],[[120568,120568],\"mapped\",\"χ\"],[[120569,120569],\"mapped\",\"ψ\"],[[120570,120570],\"mapped\",\"ω\"],[[120571,120571],\"mapped\",\"∇\"],[[120572,120572],\"mapped\",\"α\"],[[120573,120573],\"mapped\",\"β\"],[[120574,120574],\"mapped\",\"γ\"],[[120575,120575],\"mapped\",\"δ\"],[[120576,120576],\"mapped\",\"ε\"],[[120577,120577],\"mapped\",\"ζ\"],[[120578,120578],\"mapped\",\"η\"],[[120579,120579],\"mapped\",\"θ\"],[[120580,120580],\"mapped\",\"ι\"],[[120581,120581],\"mapped\",\"κ\"],[[120582,120582],\"mapped\",\"λ\"],[[120583,120583],\"mapped\",\"μ\"],[[120584,120584],\"mapped\",\"ν\"],[[120585,120585],\"mapped\",\"ξ\"],[[120586,120586],\"mapped\",\"ο\"],[[120587,120587],\"mapped\",\"π\"],[[120588,120588],\"mapped\",\"ρ\"],[[120589,120590],\"mapped\",\"σ\"],[[120591,120591],\"mapped\",\"τ\"],[[120592,120592],\"mapped\",\"υ\"],[[120593,120593],\"mapped\",\"φ\"],[[120594,120594],\"mapped\",\"χ\"],[[120595,120595],\"mapped\",\"ψ\"],[[120596,120596],\"mapped\",\"ω\"],[[120597,120597],\"mapped\",\"∂\"],[[120598,120598],\"mapped\",\"ε\"],[[120599,120599],\"mapped\",\"θ\"],[[120600,120600],\"mapped\",\"κ\"],[[120601,120601],\"mapped\",\"φ\"],[[120602,120602],\"mapped\",\"ρ\"],[[120603,120603],\"mapped\",\"π\"],[[120604,120604],\"mapped\",\"α\"],[[120605,120605],\"mapped\",\"β\"],[[120606,120606],\"mapped\",\"γ\"],[[120607,120607],\"mapped\",\"δ\"],[[120608,120608],\"mapped\",\"ε\"],[[120609,120609],\"mapped\",\"ζ\"],[[120610,120610],\"mapped\",\"η\"],[[120611,120611],\"mapped\",\"θ\"],[[120612,120612],\"mapped\",\"ι\"],[[120613,120613],\"mapped\",\"κ\"],[[120614,120614],\"mapped\",\"λ\"],[[120615,120615],\"mapped\",\"μ\"],[[120616,120616],\"mapped\",\"ν\"],[[120617,120617],\"mapped\",\"ξ\"],[[120618,120618],\"mapped\",\"ο\"],[[120619,120619],\"mapped\",\"π\"],[[120620,120620],\"mapped\",\"ρ\"],[[120621,120621],\"mapped\",\"θ\"],[[120622,120622],\"mapped\",\"σ\"],[[120623,120623],\"mapped\",\"τ\"],[[120624,120624],\"mapped\",\"υ\"],[[120625,120625],\"mapped\",\"φ\"],[[120626,120626],\"mapped\",\"χ\"],[[120627,120627],\"mapped\",\"ψ\"],[[120628,120628],\"mapped\",\"ω\"],[[120629,120629],\"mapped\",\"∇\"],[[120630,120630],\"mapped\",\"α\"],[[120631,120631],\"mapped\",\"β\"],[[120632,120632],\"mapped\",\"γ\"],[[120633,120633],\"mapped\",\"δ\"],[[120634,120634],\"mapped\",\"ε\"],[[120635,120635],\"mapped\",\"ζ\"],[[120636,120636],\"mapped\",\"η\"],[[120637,120637],\"mapped\",\"θ\"],[[120638,120638],\"mapped\",\"ι\"],[[120639,120639],\"mapped\",\"κ\"],[[120640,120640],\"mapped\",\"λ\"],[[120641,120641],\"mapped\",\"μ\"],[[120642,120642],\"mapped\",\"ν\"],[[120643,120643],\"mapped\",\"ξ\"],[[120644,120644],\"mapped\",\"ο\"],[[120645,120645],\"mapped\",\"π\"],[[120646,120646],\"mapped\",\"ρ\"],[[120647,120648],\"mapped\",\"σ\"],[[120649,120649],\"mapped\",\"τ\"],[[120650,120650],\"mapped\",\"υ\"],[[120651,120651],\"mapped\",\"φ\"],[[120652,120652],\"mapped\",\"χ\"],[[120653,120653],\"mapped\",\"ψ\"],[[120654,120654],\"mapped\",\"ω\"],[[120655,120655],\"mapped\",\"∂\"],[[120656,120656],\"mapped\",\"ε\"],[[120657,120657],\"mapped\",\"θ\"],[[120658,120658],\"mapped\",\"κ\"],[[120659,120659],\"mapped\",\"φ\"],[[120660,120660],\"mapped\",\"ρ\"],[[120661,120661],\"mapped\",\"π\"],[[120662,120662],\"mapped\",\"α\"],[[120663,120663],\"mapped\",\"β\"],[[120664,120664],\"mapped\",\"γ\"],[[120665,120665],\"mapped\",\"δ\"],[[120666,120666],\"mapped\",\"ε\"],[[120667,120667],\"mapped\",\"ζ\"],[[120668,120668],\"mapped\",\"η\"],[[120669,120669],\"mapped\",\"θ\"],[[120670,120670],\"mapped\",\"ι\"],[[120671,120671],\"mapped\",\"κ\"],[[120672,120672],\"mapped\",\"λ\"],[[120673,120673],\"mapped\",\"μ\"],[[120674,120674],\"mapped\",\"ν\"],[[120675,120675],\"mapped\",\"ξ\"],[[120676,120676],\"mapped\",\"ο\"],[[120677,120677],\"mapped\",\"π\"],[[120678,120678],\"mapped\",\"ρ\"],[[120679,120679],\"mapped\",\"θ\"],[[120680,120680],\"mapped\",\"σ\"],[[120681,120681],\"mapped\",\"τ\"],[[120682,120682],\"mapped\",\"υ\"],[[120683,120683],\"mapped\",\"φ\"],[[120684,120684],\"mapped\",\"χ\"],[[120685,120685],\"mapped\",\"ψ\"],[[120686,120686],\"mapped\",\"ω\"],[[120687,120687],\"mapped\",\"∇\"],[[120688,120688],\"mapped\",\"α\"],[[120689,120689],\"mapped\",\"β\"],[[120690,120690],\"mapped\",\"γ\"],[[120691,120691],\"mapped\",\"δ\"],[[120692,120692],\"mapped\",\"ε\"],[[120693,120693],\"mapped\",\"ζ\"],[[120694,120694],\"mapped\",\"η\"],[[120695,120695],\"mapped\",\"θ\"],[[120696,120696],\"mapped\",\"ι\"],[[120697,120697],\"mapped\",\"κ\"],[[120698,120698],\"mapped\",\"λ\"],[[120699,120699],\"mapped\",\"μ\"],[[120700,120700],\"mapped\",\"ν\"],[[120701,120701],\"mapped\",\"ξ\"],[[120702,120702],\"mapped\",\"ο\"],[[120703,120703],\"mapped\",\"π\"],[[120704,120704],\"mapped\",\"ρ\"],[[120705,120706],\"mapped\",\"σ\"],[[120707,120707],\"mapped\",\"τ\"],[[120708,120708],\"mapped\",\"υ\"],[[120709,120709],\"mapped\",\"φ\"],[[120710,120710],\"mapped\",\"χ\"],[[120711,120711],\"mapped\",\"ψ\"],[[120712,120712],\"mapped\",\"ω\"],[[120713,120713],\"mapped\",\"∂\"],[[120714,120714],\"mapped\",\"ε\"],[[120715,120715],\"mapped\",\"θ\"],[[120716,120716],\"mapped\",\"κ\"],[[120717,120717],\"mapped\",\"φ\"],[[120718,120718],\"mapped\",\"ρ\"],[[120719,120719],\"mapped\",\"π\"],[[120720,120720],\"mapped\",\"α\"],[[120721,120721],\"mapped\",\"β\"],[[120722,120722],\"mapped\",\"γ\"],[[120723,120723],\"mapped\",\"δ\"],[[120724,120724],\"mapped\",\"ε\"],[[120725,120725],\"mapped\",\"ζ\"],[[120726,120726],\"mapped\",\"η\"],[[120727,120727],\"mapped\",\"θ\"],[[120728,120728],\"mapped\",\"ι\"],[[120729,120729],\"mapped\",\"κ\"],[[120730,120730],\"mapped\",\"λ\"],[[120731,120731],\"mapped\",\"μ\"],[[120732,120732],\"mapped\",\"ν\"],[[120733,120733],\"mapped\",\"ξ\"],[[120734,120734],\"mapped\",\"ο\"],[[120735,120735],\"mapped\",\"π\"],[[120736,120736],\"mapped\",\"ρ\"],[[120737,120737],\"mapped\",\"θ\"],[[120738,120738],\"mapped\",\"σ\"],[[120739,120739],\"mapped\",\"τ\"],[[120740,120740],\"mapped\",\"υ\"],[[120741,120741],\"mapped\",\"φ\"],[[120742,120742],\"mapped\",\"χ\"],[[120743,120743],\"mapped\",\"ψ\"],[[120744,120744],\"mapped\",\"ω\"],[[120745,120745],\"mapped\",\"∇\"],[[120746,120746],\"mapped\",\"α\"],[[120747,120747],\"mapped\",\"β\"],[[120748,120748],\"mapped\",\"γ\"],[[120749,120749],\"mapped\",\"δ\"],[[120750,120750],\"mapped\",\"ε\"],[[120751,120751],\"mapped\",\"ζ\"],[[120752,120752],\"mapped\",\"η\"],[[120753,120753],\"mapped\",\"θ\"],[[120754,120754],\"mapped\",\"ι\"],[[120755,120755],\"mapped\",\"κ\"],[[120756,120756],\"mapped\",\"λ\"],[[120757,120757],\"mapped\",\"μ\"],[[120758,120758],\"mapped\",\"ν\"],[[120759,120759],\"mapped\",\"ξ\"],[[120760,120760],\"mapped\",\"ο\"],[[120761,120761],\"mapped\",\"π\"],[[120762,120762],\"mapped\",\"ρ\"],[[120763,120764],\"mapped\",\"σ\"],[[120765,120765],\"mapped\",\"τ\"],[[120766,120766],\"mapped\",\"υ\"],[[120767,120767],\"mapped\",\"φ\"],[[120768,120768],\"mapped\",\"χ\"],[[120769,120769],\"mapped\",\"ψ\"],[[120770,120770],\"mapped\",\"ω\"],[[120771,120771],\"mapped\",\"∂\"],[[120772,120772],\"mapped\",\"ε\"],[[120773,120773],\"mapped\",\"θ\"],[[120774,120774],\"mapped\",\"κ\"],[[120775,120775],\"mapped\",\"φ\"],[[120776,120776],\"mapped\",\"ρ\"],[[120777,120777],\"mapped\",\"π\"],[[120778,120779],\"mapped\",\"ϝ\"],[[120780,120781],\"disallowed\"],[[120782,120782],\"mapped\",\"0\"],[[120783,120783],\"mapped\",\"1\"],[[120784,120784],\"mapped\",\"2\"],[[120785,120785],\"mapped\",\"3\"],[[120786,120786],\"mapped\",\"4\"],[[120787,120787],\"mapped\",\"5\"],[[120788,120788],\"mapped\",\"6\"],[[120789,120789],\"mapped\",\"7\"],[[120790,120790],\"mapped\",\"8\"],[[120791,120791],\"mapped\",\"9\"],[[120792,120792],\"mapped\",\"0\"],[[120793,120793],\"mapped\",\"1\"],[[120794,120794],\"mapped\",\"2\"],[[120795,120795],\"mapped\",\"3\"],[[120796,120796],\"mapped\",\"4\"],[[120797,120797],\"mapped\",\"5\"],[[120798,120798],\"mapped\",\"6\"],[[120799,120799],\"mapped\",\"7\"],[[120800,120800],\"mapped\",\"8\"],[[120801,120801],\"mapped\",\"9\"],[[120802,120802],\"mapped\",\"0\"],[[120803,120803],\"mapped\",\"1\"],[[120804,120804],\"mapped\",\"2\"],[[120805,120805],\"mapped\",\"3\"],[[120806,120806],\"mapped\",\"4\"],[[120807,120807],\"mapped\",\"5\"],[[120808,120808],\"mapped\",\"6\"],[[120809,120809],\"mapped\",\"7\"],[[120810,120810],\"mapped\",\"8\"],[[120811,120811],\"mapped\",\"9\"],[[120812,120812],\"mapped\",\"0\"],[[120813,120813],\"mapped\",\"1\"],[[120814,120814],\"mapped\",\"2\"],[[120815,120815],\"mapped\",\"3\"],[[120816,120816],\"mapped\",\"4\"],[[120817,120817],\"mapped\",\"5\"],[[120818,120818],\"mapped\",\"6\"],[[120819,120819],\"mapped\",\"7\"],[[120820,120820],\"mapped\",\"8\"],[[120821,120821],\"mapped\",\"9\"],[[120822,120822],\"mapped\",\"0\"],[[120823,120823],\"mapped\",\"1\"],[[120824,120824],\"mapped\",\"2\"],[[120825,120825],\"mapped\",\"3\"],[[120826,120826],\"mapped\",\"4\"],[[120827,120827],\"mapped\",\"5\"],[[120828,120828],\"mapped\",\"6\"],[[120829,120829],\"mapped\",\"7\"],[[120830,120830],\"mapped\",\"8\"],[[120831,120831],\"mapped\",\"9\"],[[120832,121343],\"valid\",\"\",\"NV8\"],[[121344,121398],\"valid\"],[[121399,121402],\"valid\",\"\",\"NV8\"],[[121403,121452],\"valid\"],[[121453,121460],\"valid\",\"\",\"NV8\"],[[121461,121461],\"valid\"],[[121462,121475],\"valid\",\"\",\"NV8\"],[[121476,121476],\"valid\"],[[121477,121483],\"valid\",\"\",\"NV8\"],[[121484,121498],\"disallowed\"],[[121499,121503],\"valid\"],[[121504,121504],\"disallowed\"],[[121505,121519],\"valid\"],[[121520,122879],\"disallowed\"],[[122880,122886],\"valid\"],[[122887,122887],\"disallowed\"],[[122888,122904],\"valid\"],[[122905,122906],\"disallowed\"],[[122907,122913],\"valid\"],[[122914,122914],\"disallowed\"],[[122915,122916],\"valid\"],[[122917,122917],\"disallowed\"],[[122918,122922],\"valid\"],[[122923,124927],\"disallowed\"],[[124928,125124],\"valid\"],[[125125,125126],\"disallowed\"],[[125127,125135],\"valid\",\"\",\"NV8\"],[[125136,125142],\"valid\"],[[125143,125183],\"disallowed\"],[[125184,125184],\"mapped\",\"𞤢\"],[[125185,125185],\"mapped\",\"𞤣\"],[[125186,125186],\"mapped\",\"𞤤\"],[[125187,125187],\"mapped\",\"𞤥\"],[[125188,125188],\"mapped\",\"𞤦\"],[[125189,125189],\"mapped\",\"𞤧\"],[[125190,125190],\"mapped\",\"𞤨\"],[[125191,125191],\"mapped\",\"𞤩\"],[[125192,125192],\"mapped\",\"𞤪\"],[[125193,125193],\"mapped\",\"𞤫\"],[[125194,125194],\"mapped\",\"𞤬\"],[[125195,125195],\"mapped\",\"𞤭\"],[[125196,125196],\"mapped\",\"𞤮\"],[[125197,125197],\"mapped\",\"𞤯\"],[[125198,125198],\"mapped\",\"𞤰\"],[[125199,125199],\"mapped\",\"𞤱\"],[[125200,125200],\"mapped\",\"𞤲\"],[[125201,125201],\"mapped\",\"𞤳\"],[[125202,125202],\"mapped\",\"𞤴\"],[[125203,125203],\"mapped\",\"𞤵\"],[[125204,125204],\"mapped\",\"𞤶\"],[[125205,125205],\"mapped\",\"𞤷\"],[[125206,125206],\"mapped\",\"𞤸\"],[[125207,125207],\"mapped\",\"𞤹\"],[[125208,125208],\"mapped\",\"𞤺\"],[[125209,125209],\"mapped\",\"𞤻\"],[[125210,125210],\"mapped\",\"𞤼\"],[[125211,125211],\"mapped\",\"𞤽\"],[[125212,125212],\"mapped\",\"𞤾\"],[[125213,125213],\"mapped\",\"𞤿\"],[[125214,125214],\"mapped\",\"𞥀\"],[[125215,125215],\"mapped\",\"𞥁\"],[[125216,125216],\"mapped\",\"𞥂\"],[[125217,125217],\"mapped\",\"𞥃\"],[[125218,125258],\"valid\"],[[125259,125263],\"disallowed\"],[[125264,125273],\"valid\"],[[125274,125277],\"disallowed\"],[[125278,125279],\"valid\",\"\",\"NV8\"],[[125280,126463],\"disallowed\"],[[126464,126464],\"mapped\",\"ا\"],[[126465,126465],\"mapped\",\"ب\"],[[126466,126466],\"mapped\",\"ج\"],[[126467,126467],\"mapped\",\"د\"],[[126468,126468],\"disallowed\"],[[126469,126469],\"mapped\",\"و\"],[[126470,126470],\"mapped\",\"ز\"],[[126471,126471],\"mapped\",\"ح\"],[[126472,126472],\"mapped\",\"ط\"],[[126473,126473],\"mapped\",\"ي\"],[[126474,126474],\"mapped\",\"ك\"],[[126475,126475],\"mapped\",\"ل\"],[[126476,126476],\"mapped\",\"م\"],[[126477,126477],\"mapped\",\"ن\"],[[126478,126478],\"mapped\",\"س\"],[[126479,126479],\"mapped\",\"ع\"],[[126480,126480],\"mapped\",\"ف\"],[[126481,126481],\"mapped\",\"ص\"],[[126482,126482],\"mapped\",\"ق\"],[[126483,126483],\"mapped\",\"ر\"],[[126484,126484],\"mapped\",\"ش\"],[[126485,126485],\"mapped\",\"ت\"],[[126486,126486],\"mapped\",\"ث\"],[[126487,126487],\"mapped\",\"خ\"],[[126488,126488],\"mapped\",\"ذ\"],[[126489,126489],\"mapped\",\"ض\"],[[126490,126490],\"mapped\",\"ظ\"],[[126491,126491],\"mapped\",\"غ\"],[[126492,126492],\"mapped\",\"ٮ\"],[[126493,126493],\"mapped\",\"ں\"],[[126494,126494],\"mapped\",\"ڡ\"],[[126495,126495],\"mapped\",\"ٯ\"],[[126496,126496],\"disallowed\"],[[126497,126497],\"mapped\",\"ب\"],[[126498,126498],\"mapped\",\"ج\"],[[126499,126499],\"disallowed\"],[[126500,126500],\"mapped\",\"ه\"],[[126501,126502],\"disallowed\"],[[126503,126503],\"mapped\",\"ح\"],[[126504,126504],\"disallowed\"],[[126505,126505],\"mapped\",\"ي\"],[[126506,126506],\"mapped\",\"ك\"],[[126507,126507],\"mapped\",\"ل\"],[[126508,126508],\"mapped\",\"م\"],[[126509,126509],\"mapped\",\"ن\"],[[126510,126510],\"mapped\",\"س\"],[[126511,126511],\"mapped\",\"ع\"],[[126512,126512],\"mapped\",\"ف\"],[[126513,126513],\"mapped\",\"ص\"],[[126514,126514],\"mapped\",\"ق\"],[[126515,126515],\"disallowed\"],[[126516,126516],\"mapped\",\"ش\"],[[126517,126517],\"mapped\",\"ت\"],[[126518,126518],\"mapped\",\"ث\"],[[126519,126519],\"mapped\",\"خ\"],[[126520,126520],\"disallowed\"],[[126521,126521],\"mapped\",\"ض\"],[[126522,126522],\"disallowed\"],[[126523,126523],\"mapped\",\"غ\"],[[126524,126529],\"disallowed\"],[[126530,126530],\"mapped\",\"ج\"],[[126531,126534],\"disallowed\"],[[126535,126535],\"mapped\",\"ح\"],[[126536,126536],\"disallowed\"],[[126537,126537],\"mapped\",\"ي\"],[[126538,126538],\"disallowed\"],[[126539,126539],\"mapped\",\"ل\"],[[126540,126540],\"disallowed\"],[[126541,126541],\"mapped\",\"ن\"],[[126542,126542],\"mapped\",\"س\"],[[126543,126543],\"mapped\",\"ع\"],[[126544,126544],\"disallowed\"],[[126545,126545],\"mapped\",\"ص\"],[[126546,126546],\"mapped\",\"ق\"],[[126547,126547],\"disallowed\"],[[126548,126548],\"mapped\",\"ش\"],[[126549,126550],\"disallowed\"],[[126551,126551],\"mapped\",\"خ\"],[[126552,126552],\"disallowed\"],[[126553,126553],\"mapped\",\"ض\"],[[126554,126554],\"disallowed\"],[[126555,126555],\"mapped\",\"غ\"],[[126556,126556],\"disallowed\"],[[126557,126557],\"mapped\",\"ں\"],[[126558,126558],\"disallowed\"],[[126559,126559],\"mapped\",\"ٯ\"],[[126560,126560],\"disallowed\"],[[126561,126561],\"mapped\",\"ب\"],[[126562,126562],\"mapped\",\"ج\"],[[126563,126563],\"disallowed\"],[[126564,126564],\"mapped\",\"ه\"],[[126565,126566],\"disallowed\"],[[126567,126567],\"mapped\",\"ح\"],[[126568,126568],\"mapped\",\"ط\"],[[126569,126569],\"mapped\",\"ي\"],[[126570,126570],\"mapped\",\"ك\"],[[126571,126571],\"disallowed\"],[[126572,126572],\"mapped\",\"م\"],[[126573,126573],\"mapped\",\"ن\"],[[126574,126574],\"mapped\",\"س\"],[[126575,126575],\"mapped\",\"ع\"],[[126576,126576],\"mapped\",\"ف\"],[[126577,126577],\"mapped\",\"ص\"],[[126578,126578],\"mapped\",\"ق\"],[[126579,126579],\"disallowed\"],[[126580,126580],\"mapped\",\"ش\"],[[126581,126581],\"mapped\",\"ت\"],[[126582,126582],\"mapped\",\"ث\"],[[126583,126583],\"mapped\",\"خ\"],[[126584,126584],\"disallowed\"],[[126585,126585],\"mapped\",\"ض\"],[[126586,126586],\"mapped\",\"ظ\"],[[126587,126587],\"mapped\",\"غ\"],[[126588,126588],\"mapped\",\"ٮ\"],[[126589,126589],\"disallowed\"],[[126590,126590],\"mapped\",\"ڡ\"],[[126591,126591],\"disallowed\"],[[126592,126592],\"mapped\",\"ا\"],[[126593,126593],\"mapped\",\"ب\"],[[126594,126594],\"mapped\",\"ج\"],[[126595,126595],\"mapped\",\"د\"],[[126596,126596],\"mapped\",\"ه\"],[[126597,126597],\"mapped\",\"و\"],[[126598,126598],\"mapped\",\"ز\"],[[126599,126599],\"mapped\",\"ح\"],[[126600,126600],\"mapped\",\"ط\"],[[126601,126601],\"mapped\",\"ي\"],[[126602,126602],\"disallowed\"],[[126603,126603],\"mapped\",\"ل\"],[[126604,126604],\"mapped\",\"م\"],[[126605,126605],\"mapped\",\"ن\"],[[126606,126606],\"mapped\",\"س\"],[[126607,126607],\"mapped\",\"ع\"],[[126608,126608],\"mapped\",\"ف\"],[[126609,126609],\"mapped\",\"ص\"],[[126610,126610],\"mapped\",\"ق\"],[[126611,126611],\"mapped\",\"ر\"],[[126612,126612],\"mapped\",\"ش\"],[[126613,126613],\"mapped\",\"ت\"],[[126614,126614],\"mapped\",\"ث\"],[[126615,126615],\"mapped\",\"خ\"],[[126616,126616],\"mapped\",\"ذ\"],[[126617,126617],\"mapped\",\"ض\"],[[126618,126618],\"mapped\",\"ظ\"],[[126619,126619],\"mapped\",\"غ\"],[[126620,126624],\"disallowed\"],[[126625,126625],\"mapped\",\"ب\"],[[126626,126626],\"mapped\",\"ج\"],[[126627,126627],\"mapped\",\"د\"],[[126628,126628],\"disallowed\"],[[126629,126629],\"mapped\",\"و\"],[[126630,126630],\"mapped\",\"ز\"],[[126631,126631],\"mapped\",\"ح\"],[[126632,126632],\"mapped\",\"ط\"],[[126633,126633],\"mapped\",\"ي\"],[[126634,126634],\"disallowed\"],[[126635,126635],\"mapped\",\"ل\"],[[126636,126636],\"mapped\",\"م\"],[[126637,126637],\"mapped\",\"ن\"],[[126638,126638],\"mapped\",\"س\"],[[126639,126639],\"mapped\",\"ع\"],[[126640,126640],\"mapped\",\"ف\"],[[126641,126641],\"mapped\",\"ص\"],[[126642,126642],\"mapped\",\"ق\"],[[126643,126643],\"mapped\",\"ر\"],[[126644,126644],\"mapped\",\"ش\"],[[126645,126645],\"mapped\",\"ت\"],[[126646,126646],\"mapped\",\"ث\"],[[126647,126647],\"mapped\",\"خ\"],[[126648,126648],\"mapped\",\"ذ\"],[[126649,126649],\"mapped\",\"ض\"],[[126650,126650],\"mapped\",\"ظ\"],[[126651,126651],\"mapped\",\"غ\"],[[126652,126703],\"disallowed\"],[[126704,126705],\"valid\",\"\",\"NV8\"],[[126706,126975],\"disallowed\"],[[126976,127019],\"valid\",\"\",\"NV8\"],[[127020,127023],\"disallowed\"],[[127024,127123],\"valid\",\"\",\"NV8\"],[[127124,127135],\"disallowed\"],[[127136,127150],\"valid\",\"\",\"NV8\"],[[127151,127152],\"disallowed\"],[[127153,127166],\"valid\",\"\",\"NV8\"],[[127167,127167],\"valid\",\"\",\"NV8\"],[[127168,127168],\"disallowed\"],[[127169,127183],\"valid\",\"\",\"NV8\"],[[127184,127184],\"disallowed\"],[[127185,127199],\"valid\",\"\",\"NV8\"],[[127200,127221],\"valid\",\"\",\"NV8\"],[[127222,127231],\"disallowed\"],[[127232,127232],\"disallowed\"],[[127233,127233],\"disallowed_STD3_mapped\",\"0,\"],[[127234,127234],\"disallowed_STD3_mapped\",\"1,\"],[[127235,127235],\"disallowed_STD3_mapped\",\"2,\"],[[127236,127236],\"disallowed_STD3_mapped\",\"3,\"],[[127237,127237],\"disallowed_STD3_mapped\",\"4,\"],[[127238,127238],\"disallowed_STD3_mapped\",\"5,\"],[[127239,127239],\"disallowed_STD3_mapped\",\"6,\"],[[127240,127240],\"disallowed_STD3_mapped\",\"7,\"],[[127241,127241],\"disallowed_STD3_mapped\",\"8,\"],[[127242,127242],\"disallowed_STD3_mapped\",\"9,\"],[[127243,127244],\"valid\",\"\",\"NV8\"],[[127245,127247],\"disallowed\"],[[127248,127248],\"disallowed_STD3_mapped\",\"(a)\"],[[127249,127249],\"disallowed_STD3_mapped\",\"(b)\"],[[127250,127250],\"disallowed_STD3_mapped\",\"(c)\"],[[127251,127251],\"disallowed_STD3_mapped\",\"(d)\"],[[127252,127252],\"disallowed_STD3_mapped\",\"(e)\"],[[127253,127253],\"disallowed_STD3_mapped\",\"(f)\"],[[127254,127254],\"disallowed_STD3_mapped\",\"(g)\"],[[127255,127255],\"disallowed_STD3_mapped\",\"(h)\"],[[127256,127256],\"disallowed_STD3_mapped\",\"(i)\"],[[127257,127257],\"disallowed_STD3_mapped\",\"(j)\"],[[127258,127258],\"disallowed_STD3_mapped\",\"(k)\"],[[127259,127259],\"disallowed_STD3_mapped\",\"(l)\"],[[127260,127260],\"disallowed_STD3_mapped\",\"(m)\"],[[127261,127261],\"disallowed_STD3_mapped\",\"(n)\"],[[127262,127262],\"disallowed_STD3_mapped\",\"(o)\"],[[127263,127263],\"disallowed_STD3_mapped\",\"(p)\"],[[127264,127264],\"disallowed_STD3_mapped\",\"(q)\"],[[127265,127265],\"disallowed_STD3_mapped\",\"(r)\"],[[127266,127266],\"disallowed_STD3_mapped\",\"(s)\"],[[127267,127267],\"disallowed_STD3_mapped\",\"(t)\"],[[127268,127268],\"disallowed_STD3_mapped\",\"(u)\"],[[127269,127269],\"disallowed_STD3_mapped\",\"(v)\"],[[127270,127270],\"disallowed_STD3_mapped\",\"(w)\"],[[127271,127271],\"disallowed_STD3_mapped\",\"(x)\"],[[127272,127272],\"disallowed_STD3_mapped\",\"(y)\"],[[127273,127273],\"disallowed_STD3_mapped\",\"(z)\"],[[127274,127274],\"mapped\",\"〔s〕\"],[[127275,127275],\"mapped\",\"c\"],[[127276,127276],\"mapped\",\"r\"],[[127277,127277],\"mapped\",\"cd\"],[[127278,127278],\"mapped\",\"wz\"],[[127279,127279],\"disallowed\"],[[127280,127280],\"mapped\",\"a\"],[[127281,127281],\"mapped\",\"b\"],[[127282,127282],\"mapped\",\"c\"],[[127283,127283],\"mapped\",\"d\"],[[127284,127284],\"mapped\",\"e\"],[[127285,127285],\"mapped\",\"f\"],[[127286,127286],\"mapped\",\"g\"],[[127287,127287],\"mapped\",\"h\"],[[127288,127288],\"mapped\",\"i\"],[[127289,127289],\"mapped\",\"j\"],[[127290,127290],\"mapped\",\"k\"],[[127291,127291],\"mapped\",\"l\"],[[127292,127292],\"mapped\",\"m\"],[[127293,127293],\"mapped\",\"n\"],[[127294,127294],\"mapped\",\"o\"],[[127295,127295],\"mapped\",\"p\"],[[127296,127296],\"mapped\",\"q\"],[[127297,127297],\"mapped\",\"r\"],[[127298,127298],\"mapped\",\"s\"],[[127299,127299],\"mapped\",\"t\"],[[127300,127300],\"mapped\",\"u\"],[[127301,127301],\"mapped\",\"v\"],[[127302,127302],\"mapped\",\"w\"],[[127303,127303],\"mapped\",\"x\"],[[127304,127304],\"mapped\",\"y\"],[[127305,127305],\"mapped\",\"z\"],[[127306,127306],\"mapped\",\"hv\"],[[127307,127307],\"mapped\",\"mv\"],[[127308,127308],\"mapped\",\"sd\"],[[127309,127309],\"mapped\",\"ss\"],[[127310,127310],\"mapped\",\"ppv\"],[[127311,127311],\"mapped\",\"wc\"],[[127312,127318],\"valid\",\"\",\"NV8\"],[[127319,127319],\"valid\",\"\",\"NV8\"],[[127320,127326],\"valid\",\"\",\"NV8\"],[[127327,127327],\"valid\",\"\",\"NV8\"],[[127328,127337],\"valid\",\"\",\"NV8\"],[[127338,127338],\"mapped\",\"mc\"],[[127339,127339],\"mapped\",\"md\"],[[127340,127343],\"disallowed\"],[[127344,127352],\"valid\",\"\",\"NV8\"],[[127353,127353],\"valid\",\"\",\"NV8\"],[[127354,127354],\"valid\",\"\",\"NV8\"],[[127355,127356],\"valid\",\"\",\"NV8\"],[[127357,127358],\"valid\",\"\",\"NV8\"],[[127359,127359],\"valid\",\"\",\"NV8\"],[[127360,127369],\"valid\",\"\",\"NV8\"],[[127370,127373],\"valid\",\"\",\"NV8\"],[[127374,127375],\"valid\",\"\",\"NV8\"],[[127376,127376],\"mapped\",\"dj\"],[[127377,127386],\"valid\",\"\",\"NV8\"],[[127387,127404],\"valid\",\"\",\"NV8\"],[[127405,127461],\"disallowed\"],[[127462,127487],\"valid\",\"\",\"NV8\"],[[127488,127488],\"mapped\",\"ほか\"],[[127489,127489],\"mapped\",\"ココ\"],[[127490,127490],\"mapped\",\"サ\"],[[127491,127503],\"disallowed\"],[[127504,127504],\"mapped\",\"手\"],[[127505,127505],\"mapped\",\"字\"],[[127506,127506],\"mapped\",\"双\"],[[127507,127507],\"mapped\",\"デ\"],[[127508,127508],\"mapped\",\"二\"],[[127509,127509],\"mapped\",\"多\"],[[127510,127510],\"mapped\",\"解\"],[[127511,127511],\"mapped\",\"天\"],[[127512,127512],\"mapped\",\"交\"],[[127513,127513],\"mapped\",\"映\"],[[127514,127514],\"mapped\",\"無\"],[[127515,127515],\"mapped\",\"料\"],[[127516,127516],\"mapped\",\"前\"],[[127517,127517],\"mapped\",\"後\"],[[127518,127518],\"mapped\",\"再\"],[[127519,127519],\"mapped\",\"新\"],[[127520,127520],\"mapped\",\"初\"],[[127521,127521],\"mapped\",\"終\"],[[127522,127522],\"mapped\",\"生\"],[[127523,127523],\"mapped\",\"販\"],[[127524,127524],\"mapped\",\"声\"],[[127525,127525],\"mapped\",\"吹\"],[[127526,127526],\"mapped\",\"演\"],[[127527,127527],\"mapped\",\"投\"],[[127528,127528],\"mapped\",\"捕\"],[[127529,127529],\"mapped\",\"一\"],[[127530,127530],\"mapped\",\"三\"],[[127531,127531],\"mapped\",\"遊\"],[[127532,127532],\"mapped\",\"左\"],[[127533,127533],\"mapped\",\"中\"],[[127534,127534],\"mapped\",\"右\"],[[127535,127535],\"mapped\",\"指\"],[[127536,127536],\"mapped\",\"走\"],[[127537,127537],\"mapped\",\"打\"],[[127538,127538],\"mapped\",\"禁\"],[[127539,127539],\"mapped\",\"空\"],[[127540,127540],\"mapped\",\"合\"],[[127541,127541],\"mapped\",\"満\"],[[127542,127542],\"mapped\",\"有\"],[[127543,127543],\"mapped\",\"月\"],[[127544,127544],\"mapped\",\"申\"],[[127545,127545],\"mapped\",\"割\"],[[127546,127546],\"mapped\",\"営\"],[[127547,127547],\"mapped\",\"配\"],[[127548,127551],\"disallowed\"],[[127552,127552],\"mapped\",\"〔本〕\"],[[127553,127553],\"mapped\",\"〔三〕\"],[[127554,127554],\"mapped\",\"〔二〕\"],[[127555,127555],\"mapped\",\"〔安〕\"],[[127556,127556],\"mapped\",\"〔点〕\"],[[127557,127557],\"mapped\",\"〔打〕\"],[[127558,127558],\"mapped\",\"〔盗〕\"],[[127559,127559],\"mapped\",\"〔勝〕\"],[[127560,127560],\"mapped\",\"〔敗〕\"],[[127561,127567],\"disallowed\"],[[127568,127568],\"mapped\",\"得\"],[[127569,127569],\"mapped\",\"可\"],[[127570,127583],\"disallowed\"],[[127584,127589],\"valid\",\"\",\"NV8\"],[[127590,127743],\"disallowed\"],[[127744,127776],\"valid\",\"\",\"NV8\"],[[127777,127788],\"valid\",\"\",\"NV8\"],[[127789,127791],\"valid\",\"\",\"NV8\"],[[127792,127797],\"valid\",\"\",\"NV8\"],[[127798,127798],\"valid\",\"\",\"NV8\"],[[127799,127868],\"valid\",\"\",\"NV8\"],[[127869,127869],\"valid\",\"\",\"NV8\"],[[127870,127871],\"valid\",\"\",\"NV8\"],[[127872,127891],\"valid\",\"\",\"NV8\"],[[127892,127903],\"valid\",\"\",\"NV8\"],[[127904,127940],\"valid\",\"\",\"NV8\"],[[127941,127941],\"valid\",\"\",\"NV8\"],[[127942,127946],\"valid\",\"\",\"NV8\"],[[127947,127950],\"valid\",\"\",\"NV8\"],[[127951,127955],\"valid\",\"\",\"NV8\"],[[127956,127967],\"valid\",\"\",\"NV8\"],[[127968,127984],\"valid\",\"\",\"NV8\"],[[127985,127991],\"valid\",\"\",\"NV8\"],[[127992,127999],\"valid\",\"\",\"NV8\"],[[128000,128062],\"valid\",\"\",\"NV8\"],[[128063,128063],\"valid\",\"\",\"NV8\"],[[128064,128064],\"valid\",\"\",\"NV8\"],[[128065,128065],\"valid\",\"\",\"NV8\"],[[128066,128247],\"valid\",\"\",\"NV8\"],[[128248,128248],\"valid\",\"\",\"NV8\"],[[128249,128252],\"valid\",\"\",\"NV8\"],[[128253,128254],\"valid\",\"\",\"NV8\"],[[128255,128255],\"valid\",\"\",\"NV8\"],[[128256,128317],\"valid\",\"\",\"NV8\"],[[128318,128319],\"valid\",\"\",\"NV8\"],[[128320,128323],\"valid\",\"\",\"NV8\"],[[128324,128330],\"valid\",\"\",\"NV8\"],[[128331,128335],\"valid\",\"\",\"NV8\"],[[128336,128359],\"valid\",\"\",\"NV8\"],[[128360,128377],\"valid\",\"\",\"NV8\"],[[128378,128378],\"valid\",\"\",\"NV8\"],[[128379,128419],\"valid\",\"\",\"NV8\"],[[128420,128420],\"valid\",\"\",\"NV8\"],[[128421,128506],\"valid\",\"\",\"NV8\"],[[128507,128511],\"valid\",\"\",\"NV8\"],[[128512,128512],\"valid\",\"\",\"NV8\"],[[128513,128528],\"valid\",\"\",\"NV8\"],[[128529,128529],\"valid\",\"\",\"NV8\"],[[128530,128532],\"valid\",\"\",\"NV8\"],[[128533,128533],\"valid\",\"\",\"NV8\"],[[128534,128534],\"valid\",\"\",\"NV8\"],[[128535,128535],\"valid\",\"\",\"NV8\"],[[128536,128536],\"valid\",\"\",\"NV8\"],[[128537,128537],\"valid\",\"\",\"NV8\"],[[128538,128538],\"valid\",\"\",\"NV8\"],[[128539,128539],\"valid\",\"\",\"NV8\"],[[128540,128542],\"valid\",\"\",\"NV8\"],[[128543,128543],\"valid\",\"\",\"NV8\"],[[128544,128549],\"valid\",\"\",\"NV8\"],[[128550,128551],\"valid\",\"\",\"NV8\"],[[128552,128555],\"valid\",\"\",\"NV8\"],[[128556,128556],\"valid\",\"\",\"NV8\"],[[128557,128557],\"valid\",\"\",\"NV8\"],[[128558,128559],\"valid\",\"\",\"NV8\"],[[128560,128563],\"valid\",\"\",\"NV8\"],[[128564,128564],\"valid\",\"\",\"NV8\"],[[128565,128576],\"valid\",\"\",\"NV8\"],[[128577,128578],\"valid\",\"\",\"NV8\"],[[128579,128580],\"valid\",\"\",\"NV8\"],[[128581,128591],\"valid\",\"\",\"NV8\"],[[128592,128639],\"valid\",\"\",\"NV8\"],[[128640,128709],\"valid\",\"\",\"NV8\"],[[128710,128719],\"valid\",\"\",\"NV8\"],[[128720,128720],\"valid\",\"\",\"NV8\"],[[128721,128722],\"valid\",\"\",\"NV8\"],[[128723,128724],\"valid\",\"\",\"NV8\"],[[128725,128735],\"disallowed\"],[[128736,128748],\"valid\",\"\",\"NV8\"],[[128749,128751],\"disallowed\"],[[128752,128755],\"valid\",\"\",\"NV8\"],[[128756,128758],\"valid\",\"\",\"NV8\"],[[128759,128760],\"valid\",\"\",\"NV8\"],[[128761,128767],\"disallowed\"],[[128768,128883],\"valid\",\"\",\"NV8\"],[[128884,128895],\"disallowed\"],[[128896,128980],\"valid\",\"\",\"NV8\"],[[128981,129023],\"disallowed\"],[[129024,129035],\"valid\",\"\",\"NV8\"],[[129036,129039],\"disallowed\"],[[129040,129095],\"valid\",\"\",\"NV8\"],[[129096,129103],\"disallowed\"],[[129104,129113],\"valid\",\"\",\"NV8\"],[[129114,129119],\"disallowed\"],[[129120,129159],\"valid\",\"\",\"NV8\"],[[129160,129167],\"disallowed\"],[[129168,129197],\"valid\",\"\",\"NV8\"],[[129198,129279],\"disallowed\"],[[129280,129291],\"valid\",\"\",\"NV8\"],[[129292,129295],\"disallowed\"],[[129296,129304],\"valid\",\"\",\"NV8\"],[[129305,129310],\"valid\",\"\",\"NV8\"],[[129311,129311],\"valid\",\"\",\"NV8\"],[[129312,129319],\"valid\",\"\",\"NV8\"],[[129320,129327],\"valid\",\"\",\"NV8\"],[[129328,129328],\"valid\",\"\",\"NV8\"],[[129329,129330],\"valid\",\"\",\"NV8\"],[[129331,129342],\"valid\",\"\",\"NV8\"],[[129343,129343],\"disallowed\"],[[129344,129355],\"valid\",\"\",\"NV8\"],[[129356,129356],\"valid\",\"\",\"NV8\"],[[129357,129359],\"disallowed\"],[[129360,129374],\"valid\",\"\",\"NV8\"],[[129375,129387],\"valid\",\"\",\"NV8\"],[[129388,129407],\"disallowed\"],[[129408,129412],\"valid\",\"\",\"NV8\"],[[129413,129425],\"valid\",\"\",\"NV8\"],[[129426,129431],\"valid\",\"\",\"NV8\"],[[129432,129471],\"disallowed\"],[[129472,129472],\"valid\",\"\",\"NV8\"],[[129473,129487],\"disallowed\"],[[129488,129510],\"valid\",\"\",\"NV8\"],[[129511,131069],\"disallowed\"],[[131070,131071],\"disallowed\"],[[131072,173782],\"valid\"],[[173783,173823],\"disallowed\"],[[173824,177972],\"valid\"],[[177973,177983],\"disallowed\"],[[177984,178205],\"valid\"],[[178206,178207],\"disallowed\"],[[178208,183969],\"valid\"],[[183970,183983],\"disallowed\"],[[183984,191456],\"valid\"],[[191457,194559],\"disallowed\"],[[194560,194560],\"mapped\",\"丽\"],[[194561,194561],\"mapped\",\"丸\"],[[194562,194562],\"mapped\",\"乁\"],[[194563,194563],\"mapped\",\"𠄢\"],[[194564,194564],\"mapped\",\"你\"],[[194565,194565],\"mapped\",\"侮\"],[[194566,194566],\"mapped\",\"侻\"],[[194567,194567],\"mapped\",\"倂\"],[[194568,194568],\"mapped\",\"偺\"],[[194569,194569],\"mapped\",\"備\"],[[194570,194570],\"mapped\",\"僧\"],[[194571,194571],\"mapped\",\"像\"],[[194572,194572],\"mapped\",\"㒞\"],[[194573,194573],\"mapped\",\"𠘺\"],[[194574,194574],\"mapped\",\"免\"],[[194575,194575],\"mapped\",\"兔\"],[[194576,194576],\"mapped\",\"兤\"],[[194577,194577],\"mapped\",\"具\"],[[194578,194578],\"mapped\",\"𠔜\"],[[194579,194579],\"mapped\",\"㒹\"],[[194580,194580],\"mapped\",\"內\"],[[194581,194581],\"mapped\",\"再\"],[[194582,194582],\"mapped\",\"𠕋\"],[[194583,194583],\"mapped\",\"冗\"],[[194584,194584],\"mapped\",\"冤\"],[[194585,194585],\"mapped\",\"仌\"],[[194586,194586],\"mapped\",\"冬\"],[[194587,194587],\"mapped\",\"况\"],[[194588,194588],\"mapped\",\"𩇟\"],[[194589,194589],\"mapped\",\"凵\"],[[194590,194590],\"mapped\",\"刃\"],[[194591,194591],\"mapped\",\"㓟\"],[[194592,194592],\"mapped\",\"刻\"],[[194593,194593],\"mapped\",\"剆\"],[[194594,194594],\"mapped\",\"割\"],[[194595,194595],\"mapped\",\"剷\"],[[194596,194596],\"mapped\",\"㔕\"],[[194597,194597],\"mapped\",\"勇\"],[[194598,194598],\"mapped\",\"勉\"],[[194599,194599],\"mapped\",\"勤\"],[[194600,194600],\"mapped\",\"勺\"],[[194601,194601],\"mapped\",\"包\"],[[194602,194602],\"mapped\",\"匆\"],[[194603,194603],\"mapped\",\"北\"],[[194604,194604],\"mapped\",\"卉\"],[[194605,194605],\"mapped\",\"卑\"],[[194606,194606],\"mapped\",\"博\"],[[194607,194607],\"mapped\",\"即\"],[[194608,194608],\"mapped\",\"卽\"],[[194609,194611],\"mapped\",\"卿\"],[[194612,194612],\"mapped\",\"𠨬\"],[[194613,194613],\"mapped\",\"灰\"],[[194614,194614],\"mapped\",\"及\"],[[194615,194615],\"mapped\",\"叟\"],[[194616,194616],\"mapped\",\"𠭣\"],[[194617,194617],\"mapped\",\"叫\"],[[194618,194618],\"mapped\",\"叱\"],[[194619,194619],\"mapped\",\"吆\"],[[194620,194620],\"mapped\",\"咞\"],[[194621,194621],\"mapped\",\"吸\"],[[194622,194622],\"mapped\",\"呈\"],[[194623,194623],\"mapped\",\"周\"],[[194624,194624],\"mapped\",\"咢\"],[[194625,194625],\"mapped\",\"哶\"],[[194626,194626],\"mapped\",\"唐\"],[[194627,194627],\"mapped\",\"啓\"],[[194628,194628],\"mapped\",\"啣\"],[[194629,194630],\"mapped\",\"善\"],[[194631,194631],\"mapped\",\"喙\"],[[194632,194632],\"mapped\",\"喫\"],[[194633,194633],\"mapped\",\"喳\"],[[194634,194634],\"mapped\",\"嗂\"],[[194635,194635],\"mapped\",\"圖\"],[[194636,194636],\"mapped\",\"嘆\"],[[194637,194637],\"mapped\",\"圗\"],[[194638,194638],\"mapped\",\"噑\"],[[194639,194639],\"mapped\",\"噴\"],[[194640,194640],\"mapped\",\"切\"],[[194641,194641],\"mapped\",\"壮\"],[[194642,194642],\"mapped\",\"城\"],[[194643,194643],\"mapped\",\"埴\"],[[194644,194644],\"mapped\",\"堍\"],[[194645,194645],\"mapped\",\"型\"],[[194646,194646],\"mapped\",\"堲\"],[[194647,194647],\"mapped\",\"報\"],[[194648,194648],\"mapped\",\"墬\"],[[194649,194649],\"mapped\",\"𡓤\"],[[194650,194650],\"mapped\",\"売\"],[[194651,194651],\"mapped\",\"壷\"],[[194652,194652],\"mapped\",\"夆\"],[[194653,194653],\"mapped\",\"多\"],[[194654,194654],\"mapped\",\"夢\"],[[194655,194655],\"mapped\",\"奢\"],[[194656,194656],\"mapped\",\"𡚨\"],[[194657,194657],\"mapped\",\"𡛪\"],[[194658,194658],\"mapped\",\"姬\"],[[194659,194659],\"mapped\",\"娛\"],[[194660,194660],\"mapped\",\"娧\"],[[194661,194661],\"mapped\",\"姘\"],[[194662,194662],\"mapped\",\"婦\"],[[194663,194663],\"mapped\",\"㛮\"],[[194664,194664],\"disallowed\"],[[194665,194665],\"mapped\",\"嬈\"],[[194666,194667],\"mapped\",\"嬾\"],[[194668,194668],\"mapped\",\"𡧈\"],[[194669,194669],\"mapped\",\"寃\"],[[194670,194670],\"mapped\",\"寘\"],[[194671,194671],\"mapped\",\"寧\"],[[194672,194672],\"mapped\",\"寳\"],[[194673,194673],\"mapped\",\"𡬘\"],[[194674,194674],\"mapped\",\"寿\"],[[194675,194675],\"mapped\",\"将\"],[[194676,194676],\"disallowed\"],[[194677,194677],\"mapped\",\"尢\"],[[194678,194678],\"mapped\",\"㞁\"],[[194679,194679],\"mapped\",\"屠\"],[[194680,194680],\"mapped\",\"屮\"],[[194681,194681],\"mapped\",\"峀\"],[[194682,194682],\"mapped\",\"岍\"],[[194683,194683],\"mapped\",\"𡷤\"],[[194684,194684],\"mapped\",\"嵃\"],[[194685,194685],\"mapped\",\"𡷦\"],[[194686,194686],\"mapped\",\"嵮\"],[[194687,194687],\"mapped\",\"嵫\"],[[194688,194688],\"mapped\",\"嵼\"],[[194689,194689],\"mapped\",\"巡\"],[[194690,194690],\"mapped\",\"巢\"],[[194691,194691],\"mapped\",\"㠯\"],[[194692,194692],\"mapped\",\"巽\"],[[194693,194693],\"mapped\",\"帨\"],[[194694,194694],\"mapped\",\"帽\"],[[194695,194695],\"mapped\",\"幩\"],[[194696,194696],\"mapped\",\"㡢\"],[[194697,194697],\"mapped\",\"𢆃\"],[[194698,194698],\"mapped\",\"㡼\"],[[194699,194699],\"mapped\",\"庰\"],[[194700,194700],\"mapped\",\"庳\"],[[194701,194701],\"mapped\",\"庶\"],[[194702,194702],\"mapped\",\"廊\"],[[194703,194703],\"mapped\",\"𪎒\"],[[194704,194704],\"mapped\",\"廾\"],[[194705,194706],\"mapped\",\"𢌱\"],[[194707,194707],\"mapped\",\"舁\"],[[194708,194709],\"mapped\",\"弢\"],[[194710,194710],\"mapped\",\"㣇\"],[[194711,194711],\"mapped\",\"𣊸\"],[[194712,194712],\"mapped\",\"𦇚\"],[[194713,194713],\"mapped\",\"形\"],[[194714,194714],\"mapped\",\"彫\"],[[194715,194715],\"mapped\",\"㣣\"],[[194716,194716],\"mapped\",\"徚\"],[[194717,194717],\"mapped\",\"忍\"],[[194718,194718],\"mapped\",\"志\"],[[194719,194719],\"mapped\",\"忹\"],[[194720,194720],\"mapped\",\"悁\"],[[194721,194721],\"mapped\",\"㤺\"],[[194722,194722],\"mapped\",\"㤜\"],[[194723,194723],\"mapped\",\"悔\"],[[194724,194724],\"mapped\",\"𢛔\"],[[194725,194725],\"mapped\",\"惇\"],[[194726,194726],\"mapped\",\"慈\"],[[194727,194727],\"mapped\",\"慌\"],[[194728,194728],\"mapped\",\"慎\"],[[194729,194729],\"mapped\",\"慌\"],[[194730,194730],\"mapped\",\"慺\"],[[194731,194731],\"mapped\",\"憎\"],[[194732,194732],\"mapped\",\"憲\"],[[194733,194733],\"mapped\",\"憤\"],[[194734,194734],\"mapped\",\"憯\"],[[194735,194735],\"mapped\",\"懞\"],[[194736,194736],\"mapped\",\"懲\"],[[194737,194737],\"mapped\",\"懶\"],[[194738,194738],\"mapped\",\"成\"],[[194739,194739],\"mapped\",\"戛\"],[[194740,194740],\"mapped\",\"扝\"],[[194741,194741],\"mapped\",\"抱\"],[[194742,194742],\"mapped\",\"拔\"],[[194743,194743],\"mapped\",\"捐\"],[[194744,194744],\"mapped\",\"𢬌\"],[[194745,194745],\"mapped\",\"挽\"],[[194746,194746],\"mapped\",\"拼\"],[[194747,194747],\"mapped\",\"捨\"],[[194748,194748],\"mapped\",\"掃\"],[[194749,194749],\"mapped\",\"揤\"],[[194750,194750],\"mapped\",\"𢯱\"],[[194751,194751],\"mapped\",\"搢\"],[[194752,194752],\"mapped\",\"揅\"],[[194753,194753],\"mapped\",\"掩\"],[[194754,194754],\"mapped\",\"㨮\"],[[194755,194755],\"mapped\",\"摩\"],[[194756,194756],\"mapped\",\"摾\"],[[194757,194757],\"mapped\",\"撝\"],[[194758,194758],\"mapped\",\"摷\"],[[194759,194759],\"mapped\",\"㩬\"],[[194760,194760],\"mapped\",\"敏\"],[[194761,194761],\"mapped\",\"敬\"],[[194762,194762],\"mapped\",\"𣀊\"],[[194763,194763],\"mapped\",\"旣\"],[[194764,194764],\"mapped\",\"書\"],[[194765,194765],\"mapped\",\"晉\"],[[194766,194766],\"mapped\",\"㬙\"],[[194767,194767],\"mapped\",\"暑\"],[[194768,194768],\"mapped\",\"㬈\"],[[194769,194769],\"mapped\",\"㫤\"],[[194770,194770],\"mapped\",\"冒\"],[[194771,194771],\"mapped\",\"冕\"],[[194772,194772],\"mapped\",\"最\"],[[194773,194773],\"mapped\",\"暜\"],[[194774,194774],\"mapped\",\"肭\"],[[194775,194775],\"mapped\",\"䏙\"],[[194776,194776],\"mapped\",\"朗\"],[[194777,194777],\"mapped\",\"望\"],[[194778,194778],\"mapped\",\"朡\"],[[194779,194779],\"mapped\",\"杞\"],[[194780,194780],\"mapped\",\"杓\"],[[194781,194781],\"mapped\",\"𣏃\"],[[194782,194782],\"mapped\",\"㭉\"],[[194783,194783],\"mapped\",\"柺\"],[[194784,194784],\"mapped\",\"枅\"],[[194785,194785],\"mapped\",\"桒\"],[[194786,194786],\"mapped\",\"梅\"],[[194787,194787],\"mapped\",\"𣑭\"],[[194788,194788],\"mapped\",\"梎\"],[[194789,194789],\"mapped\",\"栟\"],[[194790,194790],\"mapped\",\"椔\"],[[194791,194791],\"mapped\",\"㮝\"],[[194792,194792],\"mapped\",\"楂\"],[[194793,194793],\"mapped\",\"榣\"],[[194794,194794],\"mapped\",\"槪\"],[[194795,194795],\"mapped\",\"檨\"],[[194796,194796],\"mapped\",\"𣚣\"],[[194797,194797],\"mapped\",\"櫛\"],[[194798,194798],\"mapped\",\"㰘\"],[[194799,194799],\"mapped\",\"次\"],[[194800,194800],\"mapped\",\"𣢧\"],[[194801,194801],\"mapped\",\"歔\"],[[194802,194802],\"mapped\",\"㱎\"],[[194803,194803],\"mapped\",\"歲\"],[[194804,194804],\"mapped\",\"殟\"],[[194805,194805],\"mapped\",\"殺\"],[[194806,194806],\"mapped\",\"殻\"],[[194807,194807],\"mapped\",\"𣪍\"],[[194808,194808],\"mapped\",\"𡴋\"],[[194809,194809],\"mapped\",\"𣫺\"],[[194810,194810],\"mapped\",\"汎\"],[[194811,194811],\"mapped\",\"𣲼\"],[[194812,194812],\"mapped\",\"沿\"],[[194813,194813],\"mapped\",\"泍\"],[[194814,194814],\"mapped\",\"汧\"],[[194815,194815],\"mapped\",\"洖\"],[[194816,194816],\"mapped\",\"派\"],[[194817,194817],\"mapped\",\"海\"],[[194818,194818],\"mapped\",\"流\"],[[194819,194819],\"mapped\",\"浩\"],[[194820,194820],\"mapped\",\"浸\"],[[194821,194821],\"mapped\",\"涅\"],[[194822,194822],\"mapped\",\"𣴞\"],[[194823,194823],\"mapped\",\"洴\"],[[194824,194824],\"mapped\",\"港\"],[[194825,194825],\"mapped\",\"湮\"],[[194826,194826],\"mapped\",\"㴳\"],[[194827,194827],\"mapped\",\"滋\"],[[194828,194828],\"mapped\",\"滇\"],[[194829,194829],\"mapped\",\"𣻑\"],[[194830,194830],\"mapped\",\"淹\"],[[194831,194831],\"mapped\",\"潮\"],[[194832,194832],\"mapped\",\"𣽞\"],[[194833,194833],\"mapped\",\"𣾎\"],[[194834,194834],\"mapped\",\"濆\"],[[194835,194835],\"mapped\",\"瀹\"],[[194836,194836],\"mapped\",\"瀞\"],[[194837,194837],\"mapped\",\"瀛\"],[[194838,194838],\"mapped\",\"㶖\"],[[194839,194839],\"mapped\",\"灊\"],[[194840,194840],\"mapped\",\"災\"],[[194841,194841],\"mapped\",\"灷\"],[[194842,194842],\"mapped\",\"炭\"],[[194843,194843],\"mapped\",\"𠔥\"],[[194844,194844],\"mapped\",\"煅\"],[[194845,194845],\"mapped\",\"𤉣\"],[[194846,194846],\"mapped\",\"熜\"],[[194847,194847],\"disallowed\"],[[194848,194848],\"mapped\",\"爨\"],[[194849,194849],\"mapped\",\"爵\"],[[194850,194850],\"mapped\",\"牐\"],[[194851,194851],\"mapped\",\"𤘈\"],[[194852,194852],\"mapped\",\"犀\"],[[194853,194853],\"mapped\",\"犕\"],[[194854,194854],\"mapped\",\"𤜵\"],[[194855,194855],\"mapped\",\"𤠔\"],[[194856,194856],\"mapped\",\"獺\"],[[194857,194857],\"mapped\",\"王\"],[[194858,194858],\"mapped\",\"㺬\"],[[194859,194859],\"mapped\",\"玥\"],[[194860,194861],\"mapped\",\"㺸\"],[[194862,194862],\"mapped\",\"瑇\"],[[194863,194863],\"mapped\",\"瑜\"],[[194864,194864],\"mapped\",\"瑱\"],[[194865,194865],\"mapped\",\"璅\"],[[194866,194866],\"mapped\",\"瓊\"],[[194867,194867],\"mapped\",\"㼛\"],[[194868,194868],\"mapped\",\"甤\"],[[194869,194869],\"mapped\",\"𤰶\"],[[194870,194870],\"mapped\",\"甾\"],[[194871,194871],\"mapped\",\"𤲒\"],[[194872,194872],\"mapped\",\"異\"],[[194873,194873],\"mapped\",\"𢆟\"],[[194874,194874],\"mapped\",\"瘐\"],[[194875,194875],\"mapped\",\"𤾡\"],[[194876,194876],\"mapped\",\"𤾸\"],[[194877,194877],\"mapped\",\"𥁄\"],[[194878,194878],\"mapped\",\"㿼\"],[[194879,194879],\"mapped\",\"䀈\"],[[194880,194880],\"mapped\",\"直\"],[[194881,194881],\"mapped\",\"𥃳\"],[[194882,194882],\"mapped\",\"𥃲\"],[[194883,194883],\"mapped\",\"𥄙\"],[[194884,194884],\"mapped\",\"𥄳\"],[[194885,194885],\"mapped\",\"眞\"],[[194886,194887],\"mapped\",\"真\"],[[194888,194888],\"mapped\",\"睊\"],[[194889,194889],\"mapped\",\"䀹\"],[[194890,194890],\"mapped\",\"瞋\"],[[194891,194891],\"mapped\",\"䁆\"],[[194892,194892],\"mapped\",\"䂖\"],[[194893,194893],\"mapped\",\"𥐝\"],[[194894,194894],\"mapped\",\"硎\"],[[194895,194895],\"mapped\",\"碌\"],[[194896,194896],\"mapped\",\"磌\"],[[194897,194897],\"mapped\",\"䃣\"],[[194898,194898],\"mapped\",\"𥘦\"],[[194899,194899],\"mapped\",\"祖\"],[[194900,194900],\"mapped\",\"𥚚\"],[[194901,194901],\"mapped\",\"𥛅\"],[[194902,194902],\"mapped\",\"福\"],[[194903,194903],\"mapped\",\"秫\"],[[194904,194904],\"mapped\",\"䄯\"],[[194905,194905],\"mapped\",\"穀\"],[[194906,194906],\"mapped\",\"穊\"],[[194907,194907],\"mapped\",\"穏\"],[[194908,194908],\"mapped\",\"𥥼\"],[[194909,194910],\"mapped\",\"𥪧\"],[[194911,194911],\"disallowed\"],[[194912,194912],\"mapped\",\"䈂\"],[[194913,194913],\"mapped\",\"𥮫\"],[[194914,194914],\"mapped\",\"篆\"],[[194915,194915],\"mapped\",\"築\"],[[194916,194916],\"mapped\",\"䈧\"],[[194917,194917],\"mapped\",\"𥲀\"],[[194918,194918],\"mapped\",\"糒\"],[[194919,194919],\"mapped\",\"䊠\"],[[194920,194920],\"mapped\",\"糨\"],[[194921,194921],\"mapped\",\"糣\"],[[194922,194922],\"mapped\",\"紀\"],[[194923,194923],\"mapped\",\"𥾆\"],[[194924,194924],\"mapped\",\"絣\"],[[194925,194925],\"mapped\",\"䌁\"],[[194926,194926],\"mapped\",\"緇\"],[[194927,194927],\"mapped\",\"縂\"],[[194928,194928],\"mapped\",\"繅\"],[[194929,194929],\"mapped\",\"䌴\"],[[194930,194930],\"mapped\",\"𦈨\"],[[194931,194931],\"mapped\",\"𦉇\"],[[194932,194932],\"mapped\",\"䍙\"],[[194933,194933],\"mapped\",\"𦋙\"],[[194934,194934],\"mapped\",\"罺\"],[[194935,194935],\"mapped\",\"𦌾\"],[[194936,194936],\"mapped\",\"羕\"],[[194937,194937],\"mapped\",\"翺\"],[[194938,194938],\"mapped\",\"者\"],[[194939,194939],\"mapped\",\"𦓚\"],[[194940,194940],\"mapped\",\"𦔣\"],[[194941,194941],\"mapped\",\"聠\"],[[194942,194942],\"mapped\",\"𦖨\"],[[194943,194943],\"mapped\",\"聰\"],[[194944,194944],\"mapped\",\"𣍟\"],[[194945,194945],\"mapped\",\"䏕\"],[[194946,194946],\"mapped\",\"育\"],[[194947,194947],\"mapped\",\"脃\"],[[194948,194948],\"mapped\",\"䐋\"],[[194949,194949],\"mapped\",\"脾\"],[[194950,194950],\"mapped\",\"媵\"],[[194951,194951],\"mapped\",\"𦞧\"],[[194952,194952],\"mapped\",\"𦞵\"],[[194953,194953],\"mapped\",\"𣎓\"],[[194954,194954],\"mapped\",\"𣎜\"],[[194955,194955],\"mapped\",\"舁\"],[[194956,194956],\"mapped\",\"舄\"],[[194957,194957],\"mapped\",\"辞\"],[[194958,194958],\"mapped\",\"䑫\"],[[194959,194959],\"mapped\",\"芑\"],[[194960,194960],\"mapped\",\"芋\"],[[194961,194961],\"mapped\",\"芝\"],[[194962,194962],\"mapped\",\"劳\"],[[194963,194963],\"mapped\",\"花\"],[[194964,194964],\"mapped\",\"芳\"],[[194965,194965],\"mapped\",\"芽\"],[[194966,194966],\"mapped\",\"苦\"],[[194967,194967],\"mapped\",\"𦬼\"],[[194968,194968],\"mapped\",\"若\"],[[194969,194969],\"mapped\",\"茝\"],[[194970,194970],\"mapped\",\"荣\"],[[194971,194971],\"mapped\",\"莭\"],[[194972,194972],\"mapped\",\"茣\"],[[194973,194973],\"mapped\",\"莽\"],[[194974,194974],\"mapped\",\"菧\"],[[194975,194975],\"mapped\",\"著\"],[[194976,194976],\"mapped\",\"荓\"],[[194977,194977],\"mapped\",\"菊\"],[[194978,194978],\"mapped\",\"菌\"],[[194979,194979],\"mapped\",\"菜\"],[[194980,194980],\"mapped\",\"𦰶\"],[[194981,194981],\"mapped\",\"𦵫\"],[[194982,194982],\"mapped\",\"𦳕\"],[[194983,194983],\"mapped\",\"䔫\"],[[194984,194984],\"mapped\",\"蓱\"],[[194985,194985],\"mapped\",\"蓳\"],[[194986,194986],\"mapped\",\"蔖\"],[[194987,194987],\"mapped\",\"𧏊\"],[[194988,194988],\"mapped\",\"蕤\"],[[194989,194989],\"mapped\",\"𦼬\"],[[194990,194990],\"mapped\",\"䕝\"],[[194991,194991],\"mapped\",\"䕡\"],[[194992,194992],\"mapped\",\"𦾱\"],[[194993,194993],\"mapped\",\"𧃒\"],[[194994,194994],\"mapped\",\"䕫\"],[[194995,194995],\"mapped\",\"虐\"],[[194996,194996],\"mapped\",\"虜\"],[[194997,194997],\"mapped\",\"虧\"],[[194998,194998],\"mapped\",\"虩\"],[[194999,194999],\"mapped\",\"蚩\"],[[195000,195000],\"mapped\",\"蚈\"],[[195001,195001],\"mapped\",\"蜎\"],[[195002,195002],\"mapped\",\"蛢\"],[[195003,195003],\"mapped\",\"蝹\"],[[195004,195004],\"mapped\",\"蜨\"],[[195005,195005],\"mapped\",\"蝫\"],[[195006,195006],\"mapped\",\"螆\"],[[195007,195007],\"disallowed\"],[[195008,195008],\"mapped\",\"蟡\"],[[195009,195009],\"mapped\",\"蠁\"],[[195010,195010],\"mapped\",\"䗹\"],[[195011,195011],\"mapped\",\"衠\"],[[195012,195012],\"mapped\",\"衣\"],[[195013,195013],\"mapped\",\"𧙧\"],[[195014,195014],\"mapped\",\"裗\"],[[195015,195015],\"mapped\",\"裞\"],[[195016,195016],\"mapped\",\"䘵\"],[[195017,195017],\"mapped\",\"裺\"],[[195018,195018],\"mapped\",\"㒻\"],[[195019,195019],\"mapped\",\"𧢮\"],[[195020,195020],\"mapped\",\"𧥦\"],[[195021,195021],\"mapped\",\"䚾\"],[[195022,195022],\"mapped\",\"䛇\"],[[195023,195023],\"mapped\",\"誠\"],[[195024,195024],\"mapped\",\"諭\"],[[195025,195025],\"mapped\",\"變\"],[[195026,195026],\"mapped\",\"豕\"],[[195027,195027],\"mapped\",\"𧲨\"],[[195028,195028],\"mapped\",\"貫\"],[[195029,195029],\"mapped\",\"賁\"],[[195030,195030],\"mapped\",\"贛\"],[[195031,195031],\"mapped\",\"起\"],[[195032,195032],\"mapped\",\"𧼯\"],[[195033,195033],\"mapped\",\"𠠄\"],[[195034,195034],\"mapped\",\"跋\"],[[195035,195035],\"mapped\",\"趼\"],[[195036,195036],\"mapped\",\"跰\"],[[195037,195037],\"mapped\",\"𠣞\"],[[195038,195038],\"mapped\",\"軔\"],[[195039,195039],\"mapped\",\"輸\"],[[195040,195040],\"mapped\",\"𨗒\"],[[195041,195041],\"mapped\",\"𨗭\"],[[195042,195042],\"mapped\",\"邔\"],[[195043,195043],\"mapped\",\"郱\"],[[195044,195044],\"mapped\",\"鄑\"],[[195045,195045],\"mapped\",\"𨜮\"],[[195046,195046],\"mapped\",\"鄛\"],[[195047,195047],\"mapped\",\"鈸\"],[[195048,195048],\"mapped\",\"鋗\"],[[195049,195049],\"mapped\",\"鋘\"],[[195050,195050],\"mapped\",\"鉼\"],[[195051,195051],\"mapped\",\"鏹\"],[[195052,195052],\"mapped\",\"鐕\"],[[195053,195053],\"mapped\",\"𨯺\"],[[195054,195054],\"mapped\",\"開\"],[[195055,195055],\"mapped\",\"䦕\"],[[195056,195056],\"mapped\",\"閷\"],[[195057,195057],\"mapped\",\"𨵷\"],[[195058,195058],\"mapped\",\"䧦\"],[[195059,195059],\"mapped\",\"雃\"],[[195060,195060],\"mapped\",\"嶲\"],[[195061,195061],\"mapped\",\"霣\"],[[195062,195062],\"mapped\",\"𩅅\"],[[195063,195063],\"mapped\",\"𩈚\"],[[195064,195064],\"mapped\",\"䩮\"],[[195065,195065],\"mapped\",\"䩶\"],[[195066,195066],\"mapped\",\"韠\"],[[195067,195067],\"mapped\",\"𩐊\"],[[195068,195068],\"mapped\",\"䪲\"],[[195069,195069],\"mapped\",\"𩒖\"],[[195070,195071],\"mapped\",\"頋\"],[[195072,195072],\"mapped\",\"頩\"],[[195073,195073],\"mapped\",\"𩖶\"],[[195074,195074],\"mapped\",\"飢\"],[[195075,195075],\"mapped\",\"䬳\"],[[195076,195076],\"mapped\",\"餩\"],[[195077,195077],\"mapped\",\"馧\"],[[195078,195078],\"mapped\",\"駂\"],[[195079,195079],\"mapped\",\"駾\"],[[195080,195080],\"mapped\",\"䯎\"],[[195081,195081],\"mapped\",\"𩬰\"],[[195082,195082],\"mapped\",\"鬒\"],[[195083,195083],\"mapped\",\"鱀\"],[[195084,195084],\"mapped\",\"鳽\"],[[195085,195085],\"mapped\",\"䳎\"],[[195086,195086],\"mapped\",\"䳭\"],[[195087,195087],\"mapped\",\"鵧\"],[[195088,195088],\"mapped\",\"𪃎\"],[[195089,195089],\"mapped\",\"䳸\"],[[195090,195090],\"mapped\",\"𪄅\"],[[195091,195091],\"mapped\",\"𪈎\"],[[195092,195092],\"mapped\",\"𪊑\"],[[195093,195093],\"mapped\",\"麻\"],[[195094,195094],\"mapped\",\"䵖\"],[[195095,195095],\"mapped\",\"黹\"],[[195096,195096],\"mapped\",\"黾\"],[[195097,195097],\"mapped\",\"鼅\"],[[195098,195098],\"mapped\",\"鼏\"],[[195099,195099],\"mapped\",\"鼖\"],[[195100,195100],\"mapped\",\"鼻\"],[[195101,195101],\"mapped\",\"𪘀\"],[[195102,196605],\"disallowed\"],[[196606,196607],\"disallowed\"],[[196608,262141],\"disallowed\"],[[262142,262143],\"disallowed\"],[[262144,327677],\"disallowed\"],[[327678,327679],\"disallowed\"],[[327680,393213],\"disallowed\"],[[393214,393215],\"disallowed\"],[[393216,458749],\"disallowed\"],[[458750,458751],\"disallowed\"],[[458752,524285],\"disallowed\"],[[524286,524287],\"disallowed\"],[[524288,589821],\"disallowed\"],[[589822,589823],\"disallowed\"],[[589824,655357],\"disallowed\"],[[655358,655359],\"disallowed\"],[[655360,720893],\"disallowed\"],[[720894,720895],\"disallowed\"],[[720896,786429],\"disallowed\"],[[786430,786431],\"disallowed\"],[[786432,851965],\"disallowed\"],[[851966,851967],\"disallowed\"],[[851968,917501],\"disallowed\"],[[917502,917503],\"disallowed\"],[[917504,917504],\"disallowed\"],[[917505,917505],\"disallowed\"],[[917506,917535],\"disallowed\"],[[917536,917631],\"disallowed\"],[[917632,917759],\"disallowed\"],[[917760,917999],\"ignored\"],[[918000,983037],\"disallowed\"],[[983038,983039],\"disallowed\"],[[983040,1048573],\"disallowed\"],[[1048574,1048575],\"disallowed\"],[[1048576,1114109],\"disallowed\"],[[1114110,1114111],\"disallowed\"]]");

/***/ }),

/***/ "./node_modules/tr46/lib/regexes.js":
/*!******************************************!*\
  !*** ./node_modules/tr46/lib/regexes.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const combiningMarks = /[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D00-\u0D03\u0D3B\u0D3C\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF7-\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\u{101FD}\u{102E0}\u{10376}-\u{1037A}\u{10A01}-\u{10A03}\u{10A05}\u{10A06}\u{10A0C}-\u{10A0F}\u{10A38}-\u{10A3A}\u{10A3F}\u{10AE5}\u{10AE6}\u{11000}-\u{11002}\u{11038}-\u{11046}\u{1107F}-\u{11082}\u{110B0}-\u{110BA}\u{11100}-\u{11102}\u{11127}-\u{11134}\u{11173}\u{11180}-\u{11182}\u{111B3}-\u{111C0}\u{111CA}-\u{111CC}\u{1122C}-\u{11237}\u{1123E}\u{112DF}-\u{112EA}\u{11300}-\u{11303}\u{1133C}\u{1133E}-\u{11344}\u{11347}\u{11348}\u{1134B}-\u{1134D}\u{11357}\u{11362}\u{11363}\u{11366}-\u{1136C}\u{11370}-\u{11374}\u{11435}-\u{11446}\u{114B0}-\u{114C3}\u{115AF}-\u{115B5}\u{115B8}-\u{115C0}\u{115DC}\u{115DD}\u{11630}-\u{11640}\u{116AB}-\u{116B7}\u{1171D}-\u{1172B}\u{11A01}-\u{11A0A}\u{11A33}-\u{11A39}\u{11A3B}-\u{11A3E}\u{11A47}\u{11A51}-\u{11A5B}\u{11A8A}-\u{11A99}\u{11C2F}-\u{11C36}\u{11C38}-\u{11C3F}\u{11C92}-\u{11CA7}\u{11CA9}-\u{11CB6}\u{11D31}-\u{11D36}\u{11D3A}\u{11D3C}\u{11D3D}\u{11D3F}-\u{11D45}\u{11D47}\u{16AF0}-\u{16AF4}\u{16B30}-\u{16B36}\u{16F51}-\u{16F7E}\u{16F8F}-\u{16F92}\u{1BC9D}\u{1BC9E}\u{1D165}-\u{1D169}\u{1D16D}-\u{1D172}\u{1D17B}-\u{1D182}\u{1D185}-\u{1D18B}\u{1D1AA}-\u{1D1AD}\u{1D242}-\u{1D244}\u{1DA00}-\u{1DA36}\u{1DA3B}-\u{1DA6C}\u{1DA75}\u{1DA84}\u{1DA9B}-\u{1DA9F}\u{1DAA1}-\u{1DAAF}\u{1E000}-\u{1E006}\u{1E008}-\u{1E018}\u{1E01B}-\u{1E021}\u{1E023}\u{1E024}\u{1E026}-\u{1E02A}\u{1E8D0}-\u{1E8D6}\u{1E944}-\u{1E94A}\u{E0100}-\u{E01EF}]/u;
const combiningClassVirama = /[\u094D\u09CD\u0A4D\u0ACD\u0B4D\u0BCD\u0C4D\u0CCD\u0D3B\u0D3C\u0D4D\u0DCA\u0E3A\u0F84\u1039\u103A\u1714\u1734\u17D2\u1A60\u1B44\u1BAA\u1BAB\u1BF2\u1BF3\u2D7F\uA806\uA8C4\uA953\uA9C0\uAAF6\uABED\u{10A3F}\u{11046}\u{1107F}\u{110B9}\u{11133}\u{11134}\u{111C0}\u{11235}\u{112EA}\u{1134D}\u{11442}\u{114C2}\u{115BF}\u{1163F}\u{116B6}\u{1172B}\u{11A34}\u{11A47}\u{11A99}\u{11C3F}\u{11D44}\u{11D45}]/u;
const validZWNJ = /[\u0620\u0626\u0628\u062A-\u062E\u0633-\u063F\u0641-\u0647\u0649\u064A\u066E\u066F\u0678-\u0687\u069A-\u06BF\u06C1\u06C2\u06CC\u06CE\u06D0\u06D1\u06FA-\u06FC\u06FF\u0712-\u0714\u071A-\u071D\u071F-\u0727\u0729\u072B\u072D\u072E\u074E-\u0758\u075C-\u076A\u076D-\u0770\u0772\u0775-\u0777\u077A-\u077F\u07CA-\u07EA\u0841-\u0845\u0848\u084A-\u0853\u0855\u0860\u0862-\u0865\u0868\u08A0-\u08A9\u08AF\u08B0\u08B3\u08B4\u08B6-\u08B8\u08BA-\u08BD\u1807\u1820-\u1877\u1887-\u18A8\u18AA\uA840-\uA872\u{10AC0}-\u{10AC4}\u{10ACD}\u{10AD3}-\u{10ADC}\u{10ADE}-\u{10AE0}\u{10AEB}-\u{10AEE}\u{10B80}\u{10B82}\u{10B86}-\u{10B88}\u{10B8A}\u{10B8B}\u{10B8D}\u{10B90}\u{10BAD}\u{10BAE}\u{1E900}-\u{1E943}][\xAD\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u061C\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u070F\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u200B\u200E\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFEFF\uFFF9-\uFFFB\u{101FD}\u{102E0}\u{10376}-\u{1037A}\u{10A01}-\u{10A03}\u{10A05}\u{10A06}\u{10A0C}-\u{10A0F}\u{10A38}-\u{10A3A}\u{10A3F}\u{10AE5}\u{10AE6}\u{11001}\u{11038}-\u{11046}\u{1107F}-\u{11081}\u{110B3}-\u{110B6}\u{110B9}\u{110BA}\u{110BD}\u{11100}-\u{11102}\u{11127}-\u{1112B}\u{1112D}-\u{11134}\u{11173}\u{11180}\u{11181}\u{111B6}-\u{111BE}\u{111CA}-\u{111CC}\u{1122F}-\u{11231}\u{11234}\u{11236}\u{11237}\u{1123E}\u{112DF}\u{112E3}-\u{112EA}\u{11300}\u{11301}\u{1133C}\u{11340}\u{11366}-\u{1136C}\u{11370}-\u{11374}\u{11438}-\u{1143F}\u{11442}-\u{11444}\u{11446}\u{114B3}-\u{114B8}\u{114BA}\u{114BF}\u{114C0}\u{114C2}\u{114C3}\u{115B2}-\u{115B5}\u{115BC}\u{115BD}\u{115BF}\u{115C0}\u{115DC}\u{115DD}\u{11633}-\u{1163A}\u{1163D}\u{1163F}\u{11640}\u{116AB}\u{116AD}\u{116B0}-\u{116B5}\u{116B7}\u{1171D}-\u{1171F}\u{11722}-\u{11725}\u{11727}-\u{1172B}\u{11A01}-\u{11A06}\u{11A09}\u{11A0A}\u{11A33}-\u{11A38}\u{11A3B}-\u{11A3E}\u{11A47}\u{11A51}-\u{11A56}\u{11A59}-\u{11A5B}\u{11A8A}-\u{11A96}\u{11A98}\u{11A99}\u{11C30}-\u{11C36}\u{11C38}-\u{11C3D}\u{11C3F}\u{11C92}-\u{11CA7}\u{11CAA}-\u{11CB0}\u{11CB2}\u{11CB3}\u{11CB5}\u{11CB6}\u{11D31}-\u{11D36}\u{11D3A}\u{11D3C}\u{11D3D}\u{11D3F}-\u{11D45}\u{11D47}\u{16AF0}-\u{16AF4}\u{16B30}-\u{16B36}\u{16F8F}-\u{16F92}\u{1BC9D}\u{1BC9E}\u{1BCA0}-\u{1BCA3}\u{1D167}-\u{1D169}\u{1D173}-\u{1D182}\u{1D185}-\u{1D18B}\u{1D1AA}-\u{1D1AD}\u{1D242}-\u{1D244}\u{1DA00}-\u{1DA36}\u{1DA3B}-\u{1DA6C}\u{1DA75}\u{1DA84}\u{1DA9B}-\u{1DA9F}\u{1DAA1}-\u{1DAAF}\u{1E000}-\u{1E006}\u{1E008}-\u{1E018}\u{1E01B}-\u{1E021}\u{1E023}\u{1E024}\u{1E026}-\u{1E02A}\u{1E8D0}-\u{1E8D6}\u{1E944}-\u{1E94A}\u{E0001}\u{E0020}-\u{E007F}\u{E0100}-\u{E01EF}]*\u200C[\xAD\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u061C\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u070F\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u200B\u200E\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\uFEFF\uFFF9-\uFFFB\u{101FD}\u{102E0}\u{10376}-\u{1037A}\u{10A01}-\u{10A03}\u{10A05}\u{10A06}\u{10A0C}-\u{10A0F}\u{10A38}-\u{10A3A}\u{10A3F}\u{10AE5}\u{10AE6}\u{11001}\u{11038}-\u{11046}\u{1107F}-\u{11081}\u{110B3}-\u{110B6}\u{110B9}\u{110BA}\u{110BD}\u{11100}-\u{11102}\u{11127}-\u{1112B}\u{1112D}-\u{11134}\u{11173}\u{11180}\u{11181}\u{111B6}-\u{111BE}\u{111CA}-\u{111CC}\u{1122F}-\u{11231}\u{11234}\u{11236}\u{11237}\u{1123E}\u{112DF}\u{112E3}-\u{112EA}\u{11300}\u{11301}\u{1133C}\u{11340}\u{11366}-\u{1136C}\u{11370}-\u{11374}\u{11438}-\u{1143F}\u{11442}-\u{11444}\u{11446}\u{114B3}-\u{114B8}\u{114BA}\u{114BF}\u{114C0}\u{114C2}\u{114C3}\u{115B2}-\u{115B5}\u{115BC}\u{115BD}\u{115BF}\u{115C0}\u{115DC}\u{115DD}\u{11633}-\u{1163A}\u{1163D}\u{1163F}\u{11640}\u{116AB}\u{116AD}\u{116B0}-\u{116B5}\u{116B7}\u{1171D}-\u{1171F}\u{11722}-\u{11725}\u{11727}-\u{1172B}\u{11A01}-\u{11A06}\u{11A09}\u{11A0A}\u{11A33}-\u{11A38}\u{11A3B}-\u{11A3E}\u{11A47}\u{11A51}-\u{11A56}\u{11A59}-\u{11A5B}\u{11A8A}-\u{11A96}\u{11A98}\u{11A99}\u{11C30}-\u{11C36}\u{11C38}-\u{11C3D}\u{11C3F}\u{11C92}-\u{11CA7}\u{11CAA}-\u{11CB0}\u{11CB2}\u{11CB3}\u{11CB5}\u{11CB6}\u{11D31}-\u{11D36}\u{11D3A}\u{11D3C}\u{11D3D}\u{11D3F}-\u{11D45}\u{11D47}\u{16AF0}-\u{16AF4}\u{16B30}-\u{16B36}\u{16F8F}-\u{16F92}\u{1BC9D}\u{1BC9E}\u{1BCA0}-\u{1BCA3}\u{1D167}-\u{1D169}\u{1D173}-\u{1D182}\u{1D185}-\u{1D18B}\u{1D1AA}-\u{1D1AD}\u{1D242}-\u{1D244}\u{1DA00}-\u{1DA36}\u{1DA3B}-\u{1DA6C}\u{1DA75}\u{1DA84}\u{1DA9B}-\u{1DA9F}\u{1DAA1}-\u{1DAAF}\u{1E000}-\u{1E006}\u{1E008}-\u{1E018}\u{1E01B}-\u{1E021}\u{1E023}\u{1E024}\u{1E026}-\u{1E02A}\u{1E8D0}-\u{1E8D6}\u{1E944}-\u{1E94A}\u{E0001}\u{E0020}-\u{E007F}\u{E0100}-\u{E01EF}]*[\u0620\u0622-\u063F\u0641-\u064A\u066E\u066F\u0671-\u0673\u0675-\u06D3\u06D5\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u077F\u07CA-\u07EA\u0840-\u0855\u0860\u0862-\u0865\u0867-\u086A\u08A0-\u08AC\u08AE-\u08B4\u08B6-\u08BD\u1807\u1820-\u1877\u1887-\u18A8\u18AA\uA840-\uA871\u{10AC0}-\u{10AC5}\u{10AC7}\u{10AC9}\u{10ACA}\u{10ACE}-\u{10AD6}\u{10AD8}-\u{10AE1}\u{10AE4}\u{10AEB}-\u{10AEF}\u{10B80}-\u{10B91}\u{10BA9}-\u{10BAE}\u{1E900}-\u{1E943}]/u;
const bidiDomain = /[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05EA\u05F0-\u05F4\u0600-\u0605\u0608\u060B\u060D\u061B\u061C\u061E-\u064A\u0660-\u0669\u066B-\u066F\u0671-\u06D5\u06DD\u06E5\u06E6\u06EE\u06EF\u06FA-\u070D\u070F\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0830-\u083E\u0840-\u0858\u085E\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08E2\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFC\uFE70-\uFE74\uFE76-\uFEFC\u{10800}-\u{10805}\u{10808}\u{1080A}-\u{10835}\u{10837}\u{10838}\u{1083C}\u{1083F}-\u{10855}\u{10857}-\u{1089E}\u{108A7}-\u{108AF}\u{108E0}-\u{108F2}\u{108F4}\u{108F5}\u{108FB}-\u{1091B}\u{10920}-\u{10939}\u{1093F}\u{10980}-\u{109B7}\u{109BC}-\u{109CF}\u{109D2}-\u{10A00}\u{10A10}-\u{10A13}\u{10A15}-\u{10A17}\u{10A19}-\u{10A33}\u{10A40}-\u{10A47}\u{10A50}-\u{10A58}\u{10A60}-\u{10A9F}\u{10AC0}-\u{10AE4}\u{10AEB}-\u{10AF6}\u{10B00}-\u{10B35}\u{10B40}-\u{10B55}\u{10B58}-\u{10B72}\u{10B78}-\u{10B91}\u{10B99}-\u{10B9C}\u{10BA9}-\u{10BAF}\u{10C00}-\u{10C48}\u{10C80}-\u{10CB2}\u{10CC0}-\u{10CF2}\u{10CFA}-\u{10CFF}\u{10E60}-\u{10E7E}\u{1E800}-\u{1E8C4}\u{1E8C7}-\u{1E8CF}\u{1E900}-\u{1E943}\u{1E950}-\u{1E959}\u{1E95E}\u{1E95F}\u{1EE00}-\u{1EE03}\u{1EE05}-\u{1EE1F}\u{1EE21}\u{1EE22}\u{1EE24}\u{1EE27}\u{1EE29}-\u{1EE32}\u{1EE34}-\u{1EE37}\u{1EE39}\u{1EE3B}\u{1EE42}\u{1EE47}\u{1EE49}\u{1EE4B}\u{1EE4D}-\u{1EE4F}\u{1EE51}\u{1EE52}\u{1EE54}\u{1EE57}\u{1EE59}\u{1EE5B}\u{1EE5D}\u{1EE5F}\u{1EE61}\u{1EE62}\u{1EE64}\u{1EE67}-\u{1EE6A}\u{1EE6C}-\u{1EE72}\u{1EE74}-\u{1EE77}\u{1EE79}-\u{1EE7C}\u{1EE7E}\u{1EE80}-\u{1EE89}\u{1EE8B}-\u{1EE9B}\u{1EEA1}-\u{1EEA3}\u{1EEA5}-\u{1EEA9}\u{1EEAB}-\u{1EEBB}]/u;
const bidiS1LTR = /[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02BB-\u02C1\u02D0\u02D1\u02E0-\u02E4\u02EE\u0370-\u0373\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0482\u048A-\u052F\u0531-\u0556\u0559-\u055F\u0561-\u0587\u0589\u0903-\u0939\u093B\u093D-\u0940\u0949-\u094C\u094E-\u0950\u0958-\u0961\u0964-\u0980\u0982\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD-\u09C0\u09C7\u09C8\u09CB\u09CC\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09FA\u09FC\u09FD\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A40\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD-\u0AC0\u0AC9\u0ACB\u0ACC\u0AD0\u0AE0\u0AE1\u0AE6-\u0AF0\u0AF9\u0B02\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD0\u0BD7\u0BE6-\u0BF2\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C41-\u0C44\u0C58-\u0C5A\u0C60\u0C61\u0C66-\u0C6F\u0C7F\u0C80\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD-\u0CC4\u0CC6-\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D4E\u0D4F\u0D54-\u0D61\u0D66-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E4F-\u0E5B\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00-\u0F17\u0F1A-\u0F34\u0F36\u0F38\u0F3E-\u0F47\u0F49-\u0F6C\u0F7F\u0F85\u0F88-\u0F8C\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE-\u0FDA\u1000-\u102C\u1031\u1038\u103B\u103C\u103F-\u1057\u105A-\u105D\u1061-\u1070\u1075-\u1081\u1083\u1084\u1087-\u108C\u108E-\u109C\u109E-\u10C5\u10C7\u10CD\u10D0-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1360-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u167F\u1681-\u169A\u16A0-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1735\u1736\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17B6\u17BE-\u17C5\u17C7\u17C8\u17D4-\u17DA\u17DC\u17E0-\u17E9\u1810-\u1819\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A19\u1A1A\u1A1E-\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1A80-\u1A89\u1A90-\u1A99\u1AA0-\u1AAD\u1B04-\u1B33\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B4B\u1B50-\u1B6A\u1B74-\u1B7C\u1B82-\u1BA1\u1BA6\u1BA7\u1BAA\u1BAE-\u1BE5\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2\u1BF3\u1BFC-\u1C2B\u1C34\u1C35\u1C3B-\u1C49\u1C4D-\u1C88\u1CC0-\u1CC7\u1CD3\u1CE1\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5-\u1CF7\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200E\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u214F\u2160-\u2188\u2336-\u237A\u2395\u249C-\u24E9\u26AC\u2800-\u28FF\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D70\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u302E\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u3190-\u31BA\u31F0-\u321C\u3220-\u324F\u3260-\u327B\u327F-\u32B0\u32C0-\u32CB\u32D0-\u32FE\u3300-\u3376\u337B-\u33DD\u33E0-\u33FE\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA60C\uA610-\uA62B\uA640-\uA66E\uA680-\uA69D\uA6A0-\uA6EF\uA6F2-\uA6F7\uA722-\uA787\uA789-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA824\uA827\uA830-\uA837\uA840-\uA873\uA880-\uA8C3\uA8CE-\uA8D9\uA8F2-\uA8FD\uA900-\uA925\uA92E-\uA946\uA952\uA953\uA95F-\uA97C\uA983-\uA9B2\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD-\uA9CD\uA9CF-\uA9D9\uA9DE-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA2F\uAA30\uAA33\uAA34\uAA40-\uAA42\uAA44-\uAA4B\uAA4D\uAA50-\uAA59\uAA5C-\uAA7B\uAA7D-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAAEB\uAAEE-\uAAF5\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB65\uAB70-\uABE4\uABE6\uABE7\uABE9-\uABEC\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uD800-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u{10000}-\u{1000B}\u{1000D}-\u{10026}\u{10028}-\u{1003A}\u{1003C}\u{1003D}\u{1003F}-\u{1004D}\u{10050}-\u{1005D}\u{10080}-\u{100FA}\u{10100}\u{10102}\u{10107}-\u{10133}\u{10137}-\u{1013F}\u{1018D}\u{1018E}\u{101D0}-\u{101FC}\u{10280}-\u{1029C}\u{102A0}-\u{102D0}\u{10300}-\u{10323}\u{1032D}-\u{1034A}\u{10350}-\u{10375}\u{10380}-\u{1039D}\u{1039F}-\u{103C3}\u{103C8}-\u{103D5}\u{10400}-\u{1049D}\u{104A0}-\u{104A9}\u{104B0}-\u{104D3}\u{104D8}-\u{104FB}\u{10500}-\u{10527}\u{10530}-\u{10563}\u{1056F}\u{10600}-\u{10736}\u{10740}-\u{10755}\u{10760}-\u{10767}\u{11000}\u{11002}-\u{11037}\u{11047}-\u{1104D}\u{11066}-\u{1106F}\u{11082}-\u{110B2}\u{110B7}\u{110B8}\u{110BB}-\u{110C1}\u{110D0}-\u{110E8}\u{110F0}-\u{110F9}\u{11103}-\u{11126}\u{1112C}\u{11136}-\u{11143}\u{11150}-\u{11172}\u{11174}-\u{11176}\u{11182}-\u{111B5}\u{111BF}-\u{111C9}\u{111CD}\u{111D0}-\u{111DF}\u{111E1}-\u{111F4}\u{11200}-\u{11211}\u{11213}-\u{1122E}\u{11232}\u{11233}\u{11235}\u{11238}-\u{1123D}\u{11280}-\u{11286}\u{11288}\u{1128A}-\u{1128D}\u{1128F}-\u{1129D}\u{1129F}-\u{112A9}\u{112B0}-\u{112DE}\u{112E0}-\u{112E2}\u{112F0}-\u{112F9}\u{11302}\u{11303}\u{11305}-\u{1130C}\u{1130F}\u{11310}\u{11313}-\u{11328}\u{1132A}-\u{11330}\u{11332}\u{11333}\u{11335}-\u{11339}\u{1133D}-\u{1133F}\u{11341}-\u{11344}\u{11347}\u{11348}\u{1134B}-\u{1134D}\u{11350}\u{11357}\u{1135D}-\u{11363}\u{11400}-\u{11437}\u{11440}\u{11441}\u{11445}\u{11447}-\u{11459}\u{1145B}\u{1145D}\u{11480}-\u{114B2}\u{114B9}\u{114BB}-\u{114BE}\u{114C1}\u{114C4}-\u{114C7}\u{114D0}-\u{114D9}\u{11580}-\u{115B1}\u{115B8}-\u{115BB}\u{115BE}\u{115C1}-\u{115DB}\u{11600}-\u{11632}\u{1163B}\u{1163C}\u{1163E}\u{11641}-\u{11644}\u{11650}-\u{11659}\u{11680}-\u{116AA}\u{116AC}\u{116AE}\u{116AF}\u{116B6}\u{116C0}-\u{116C9}\u{11700}-\u{11719}\u{11720}\u{11721}\u{11726}\u{11730}-\u{1173F}\u{118A0}-\u{118F2}\u{118FF}\u{11A00}\u{11A07}\u{11A08}\u{11A0B}-\u{11A32}\u{11A39}\u{11A3A}\u{11A3F}-\u{11A46}\u{11A50}\u{11A57}\u{11A58}\u{11A5C}-\u{11A83}\u{11A86}-\u{11A89}\u{11A97}\u{11A9A}-\u{11A9C}\u{11A9E}-\u{11AA2}\u{11AC0}-\u{11AF8}\u{11C00}-\u{11C08}\u{11C0A}-\u{11C2F}\u{11C3E}-\u{11C45}\u{11C50}-\u{11C6C}\u{11C70}-\u{11C8F}\u{11CA9}\u{11CB1}\u{11CB4}\u{11D00}-\u{11D06}\u{11D08}\u{11D09}\u{11D0B}-\u{11D30}\u{11D46}\u{11D50}-\u{11D59}\u{12000}-\u{12399}\u{12400}-\u{1246E}\u{12470}-\u{12474}\u{12480}-\u{12543}\u{13000}-\u{1342E}\u{14400}-\u{14646}\u{16800}-\u{16A38}\u{16A40}-\u{16A5E}\u{16A60}-\u{16A69}\u{16A6E}\u{16A6F}\u{16AD0}-\u{16AED}\u{16AF5}\u{16B00}-\u{16B2F}\u{16B37}-\u{16B45}\u{16B50}-\u{16B59}\u{16B5B}-\u{16B61}\u{16B63}-\u{16B77}\u{16B7D}-\u{16B8F}\u{16F00}-\u{16F44}\u{16F50}-\u{16F7E}\u{16F93}-\u{16F9F}\u{16FE0}\u{16FE1}\u{17000}-\u{187EC}\u{18800}-\u{18AF2}\u{1B000}-\u{1B11E}\u{1B170}-\u{1B2FB}\u{1BC00}-\u{1BC6A}\u{1BC70}-\u{1BC7C}\u{1BC80}-\u{1BC88}\u{1BC90}-\u{1BC99}\u{1BC9C}\u{1BC9F}\u{1D000}-\u{1D0F5}\u{1D100}-\u{1D126}\u{1D129}-\u{1D166}\u{1D16A}-\u{1D172}\u{1D183}\u{1D184}\u{1D18C}-\u{1D1A9}\u{1D1AE}-\u{1D1E8}\u{1D360}-\u{1D371}\u{1D400}-\u{1D454}\u{1D456}-\u{1D49C}\u{1D49E}\u{1D49F}\u{1D4A2}\u{1D4A5}\u{1D4A6}\u{1D4A9}-\u{1D4AC}\u{1D4AE}-\u{1D4B9}\u{1D4BB}\u{1D4BD}-\u{1D4C3}\u{1D4C5}-\u{1D505}\u{1D507}-\u{1D50A}\u{1D50D}-\u{1D514}\u{1D516}-\u{1D51C}\u{1D51E}-\u{1D539}\u{1D53B}-\u{1D53E}\u{1D540}-\u{1D544}\u{1D546}\u{1D54A}-\u{1D550}\u{1D552}-\u{1D6A5}\u{1D6A8}-\u{1D6DA}\u{1D6DC}-\u{1D714}\u{1D716}-\u{1D74E}\u{1D750}-\u{1D788}\u{1D78A}-\u{1D7C2}\u{1D7C4}-\u{1D7CB}\u{1D800}-\u{1D9FF}\u{1DA37}-\u{1DA3A}\u{1DA6D}-\u{1DA74}\u{1DA76}-\u{1DA83}\u{1DA85}-\u{1DA8B}\u{1F110}-\u{1F12E}\u{1F130}-\u{1F169}\u{1F170}-\u{1F1AC}\u{1F1E6}-\u{1F202}\u{1F210}-\u{1F23B}\u{1F240}-\u{1F248}\u{1F250}\u{1F251}\u{20000}-\u{2A6D6}\u{2A700}-\u{2B734}\u{2B740}-\u{2B81D}\u{2B820}-\u{2CEA1}\u{2CEB0}-\u{2EBE0}\u{2F800}-\u{2FA1D}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/u;
const bidiS1RTL = /[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05EA\u05F0-\u05F4\u0608\u060B\u060D\u061B\u061C\u061E-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u070D\u070F\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0830-\u083E\u0840-\u0858\u085E\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFC\uFE70-\uFE74\uFE76-\uFEFC\u{10800}-\u{10805}\u{10808}\u{1080A}-\u{10835}\u{10837}\u{10838}\u{1083C}\u{1083F}-\u{10855}\u{10857}-\u{1089E}\u{108A7}-\u{108AF}\u{108E0}-\u{108F2}\u{108F4}\u{108F5}\u{108FB}-\u{1091B}\u{10920}-\u{10939}\u{1093F}\u{10980}-\u{109B7}\u{109BC}-\u{109CF}\u{109D2}-\u{10A00}\u{10A10}-\u{10A13}\u{10A15}-\u{10A17}\u{10A19}-\u{10A33}\u{10A40}-\u{10A47}\u{10A50}-\u{10A58}\u{10A60}-\u{10A9F}\u{10AC0}-\u{10AE4}\u{10AEB}-\u{10AF6}\u{10B00}-\u{10B35}\u{10B40}-\u{10B55}\u{10B58}-\u{10B72}\u{10B78}-\u{10B91}\u{10B99}-\u{10B9C}\u{10BA9}-\u{10BAF}\u{10C00}-\u{10C48}\u{10C80}-\u{10CB2}\u{10CC0}-\u{10CF2}\u{10CFA}-\u{10CFF}\u{1E800}-\u{1E8C4}\u{1E8C7}-\u{1E8CF}\u{1E900}-\u{1E943}\u{1E950}-\u{1E959}\u{1E95E}\u{1E95F}\u{1EE00}-\u{1EE03}\u{1EE05}-\u{1EE1F}\u{1EE21}\u{1EE22}\u{1EE24}\u{1EE27}\u{1EE29}-\u{1EE32}\u{1EE34}-\u{1EE37}\u{1EE39}\u{1EE3B}\u{1EE42}\u{1EE47}\u{1EE49}\u{1EE4B}\u{1EE4D}-\u{1EE4F}\u{1EE51}\u{1EE52}\u{1EE54}\u{1EE57}\u{1EE59}\u{1EE5B}\u{1EE5D}\u{1EE5F}\u{1EE61}\u{1EE62}\u{1EE64}\u{1EE67}-\u{1EE6A}\u{1EE6C}-\u{1EE72}\u{1EE74}-\u{1EE77}\u{1EE79}-\u{1EE7C}\u{1EE7E}\u{1EE80}-\u{1EE89}\u{1EE8B}-\u{1EE9B}\u{1EEA1}-\u{1EEA3}\u{1EEA5}-\u{1EEA9}\u{1EEAB}-\u{1EEBB}]/u;
const bidiS2 = /^[\0-\x08\x0E-\x1B!-@\[-`\{-\x84\x86-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02B9\u02BA\u02C2-\u02CF\u02D2-\u02DF\u02E5-\u02ED\u02EF-\u036F\u0374\u0375\u037E\u0384\u0385\u0387\u03F6\u0483-\u0489\u058A\u058D-\u058F\u0591-\u05C7\u05D0-\u05EA\u05F0-\u05F4\u0600-\u061C\u061E-\u070D\u070F-\u074A\u074D-\u07B1\u07C0-\u07FA\u0800-\u082D\u0830-\u083E\u0840-\u085B\u085E\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u09F2\u09F3\u09FB\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AF1\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0BF3-\u0BFA\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C78-\u0C7E\u0C81\u0CBC\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E3F\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39-\u0F3D\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1390-\u1399\u1400\u169B\u169C\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DB\u17DD\u17F0-\u17F9\u1800-\u180E\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1940\u1944\u1945\u19DE-\u19FF\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u200B-\u200D\u200F-\u2027\u202F-\u205E\u2060-\u2064\u206A-\u2070\u2074-\u207E\u2080-\u208E\u20A0-\u20BF\u20D0-\u20F0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u2150-\u215F\u2189-\u218B\u2190-\u2335\u237B-\u2394\u2396-\u2426\u2440-\u244A\u2460-\u249B\u24EA-\u26AB\u26AD-\u27FF\u2900-\u2B73\u2B76-\u2B95\u2B98-\u2BB9\u2BBD-\u2BC8\u2BCA-\u2BD2\u2BEC-\u2BEF\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF9-\u2CFF\u2D7F\u2DE0-\u2E49\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3001-\u3004\u3008-\u3020\u302A-\u302D\u3030\u3036\u3037\u303D-\u303F\u3099-\u309C\u30A0\u30FB\u31C0-\u31E3\u321D\u321E\u3250-\u325F\u327C-\u327E\u32B1-\u32BF\u32CC-\u32CF\u3377-\u337A\u33DE\u33DF\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA60D-\uA60F\uA66F-\uA67F\uA69E\uA69F\uA6F0\uA6F1\uA700-\uA721\uA788\uA802\uA806\uA80B\uA825\uA826\uA828-\uA82B\uA838\uA839\uA874-\uA877\uA8C4\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1D-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBC1\uFBD3-\uFD3F\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFD\uFE00-\uFE19\uFE20-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFE70-\uFE74\uFE76-\uFEFC\uFEFF\uFF01-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFF9-\uFFFD\u{10101}\u{10140}-\u{1018C}\u{10190}-\u{1019B}\u{101A0}\u{101FD}\u{102E0}-\u{102FB}\u{10376}-\u{1037A}\u{10800}-\u{10805}\u{10808}\u{1080A}-\u{10835}\u{10837}\u{10838}\u{1083C}\u{1083F}-\u{10855}\u{10857}-\u{1089E}\u{108A7}-\u{108AF}\u{108E0}-\u{108F2}\u{108F4}\u{108F5}\u{108FB}-\u{1091B}\u{1091F}-\u{10939}\u{1093F}\u{10980}-\u{109B7}\u{109BC}-\u{109CF}\u{109D2}-\u{10A03}\u{10A05}\u{10A06}\u{10A0C}-\u{10A13}\u{10A15}-\u{10A17}\u{10A19}-\u{10A33}\u{10A38}-\u{10A3A}\u{10A3F}-\u{10A47}\u{10A50}-\u{10A58}\u{10A60}-\u{10A9F}\u{10AC0}-\u{10AE6}\u{10AEB}-\u{10AF6}\u{10B00}-\u{10B35}\u{10B39}-\u{10B55}\u{10B58}-\u{10B72}\u{10B78}-\u{10B91}\u{10B99}-\u{10B9C}\u{10BA9}-\u{10BAF}\u{10C00}-\u{10C48}\u{10C80}-\u{10CB2}\u{10CC0}-\u{10CF2}\u{10CFA}-\u{10CFF}\u{10E60}-\u{10E7E}\u{11001}\u{11038}-\u{11046}\u{11052}-\u{11065}\u{1107F}-\u{11081}\u{110B3}-\u{110B6}\u{110B9}\u{110BA}\u{11100}-\u{11102}\u{11127}-\u{1112B}\u{1112D}-\u{11134}\u{11173}\u{11180}\u{11181}\u{111B6}-\u{111BE}\u{111CA}-\u{111CC}\u{1122F}-\u{11231}\u{11234}\u{11236}\u{11237}\u{1123E}\u{112DF}\u{112E3}-\u{112EA}\u{11300}\u{11301}\u{1133C}\u{11340}\u{11366}-\u{1136C}\u{11370}-\u{11374}\u{11438}-\u{1143F}\u{11442}-\u{11444}\u{11446}\u{114B3}-\u{114B8}\u{114BA}\u{114BF}\u{114C0}\u{114C2}\u{114C3}\u{115B2}-\u{115B5}\u{115BC}\u{115BD}\u{115BF}\u{115C0}\u{115DC}\u{115DD}\u{11633}-\u{1163A}\u{1163D}\u{1163F}\u{11640}\u{11660}-\u{1166C}\u{116AB}\u{116AD}\u{116B0}-\u{116B5}\u{116B7}\u{1171D}-\u{1171F}\u{11722}-\u{11725}\u{11727}-\u{1172B}\u{11A01}-\u{11A06}\u{11A09}\u{11A0A}\u{11A33}-\u{11A38}\u{11A3B}-\u{11A3E}\u{11A47}\u{11A51}-\u{11A56}\u{11A59}-\u{11A5B}\u{11A8A}-\u{11A96}\u{11A98}\u{11A99}\u{11C30}-\u{11C36}\u{11C38}-\u{11C3D}\u{11C92}-\u{11CA7}\u{11CAA}-\u{11CB0}\u{11CB2}\u{11CB3}\u{11CB5}\u{11CB6}\u{11D31}-\u{11D36}\u{11D3A}\u{11D3C}\u{11D3D}\u{11D3F}-\u{11D45}\u{11D47}\u{16AF0}-\u{16AF4}\u{16B30}-\u{16B36}\u{16F8F}-\u{16F92}\u{1BC9D}\u{1BC9E}\u{1BCA0}-\u{1BCA3}\u{1D167}-\u{1D169}\u{1D173}-\u{1D182}\u{1D185}-\u{1D18B}\u{1D1AA}-\u{1D1AD}\u{1D200}-\u{1D245}\u{1D300}-\u{1D356}\u{1D6DB}\u{1D715}\u{1D74F}\u{1D789}\u{1D7C3}\u{1D7CE}-\u{1D7FF}\u{1DA00}-\u{1DA36}\u{1DA3B}-\u{1DA6C}\u{1DA75}\u{1DA84}\u{1DA9B}-\u{1DA9F}\u{1DAA1}-\u{1DAAF}\u{1E000}-\u{1E006}\u{1E008}-\u{1E018}\u{1E01B}-\u{1E021}\u{1E023}\u{1E024}\u{1E026}-\u{1E02A}\u{1E800}-\u{1E8C4}\u{1E8C7}-\u{1E8D6}\u{1E900}-\u{1E94A}\u{1E950}-\u{1E959}\u{1E95E}\u{1E95F}\u{1EE00}-\u{1EE03}\u{1EE05}-\u{1EE1F}\u{1EE21}\u{1EE22}\u{1EE24}\u{1EE27}\u{1EE29}-\u{1EE32}\u{1EE34}-\u{1EE37}\u{1EE39}\u{1EE3B}\u{1EE42}\u{1EE47}\u{1EE49}\u{1EE4B}\u{1EE4D}-\u{1EE4F}\u{1EE51}\u{1EE52}\u{1EE54}\u{1EE57}\u{1EE59}\u{1EE5B}\u{1EE5D}\u{1EE5F}\u{1EE61}\u{1EE62}\u{1EE64}\u{1EE67}-\u{1EE6A}\u{1EE6C}-\u{1EE72}\u{1EE74}-\u{1EE77}\u{1EE79}-\u{1EE7C}\u{1EE7E}\u{1EE80}-\u{1EE89}\u{1EE8B}-\u{1EE9B}\u{1EEA1}-\u{1EEA3}\u{1EEA5}-\u{1EEA9}\u{1EEAB}-\u{1EEBB}\u{1EEF0}\u{1EEF1}\u{1F000}-\u{1F02B}\u{1F030}-\u{1F093}\u{1F0A0}-\u{1F0AE}\u{1F0B1}-\u{1F0BF}\u{1F0C1}-\u{1F0CF}\u{1F0D1}-\u{1F0F5}\u{1F100}-\u{1F10C}\u{1F16A}\u{1F16B}\u{1F260}-\u{1F265}\u{1F300}-\u{1F6D4}\u{1F6E0}-\u{1F6EC}\u{1F6F0}-\u{1F6F8}\u{1F700}-\u{1F773}\u{1F780}-\u{1F7D4}\u{1F800}-\u{1F80B}\u{1F810}-\u{1F847}\u{1F850}-\u{1F859}\u{1F860}-\u{1F887}\u{1F890}-\u{1F8AD}\u{1F900}-\u{1F90B}\u{1F910}-\u{1F93E}\u{1F940}-\u{1F94C}\u{1F950}-\u{1F96B}\u{1F980}-\u{1F997}\u{1F9C0}\u{1F9D0}-\u{1F9E6}\u{E0001}\u{E0020}-\u{E007F}\u{E0100}-\u{E01EF}]*$/u;
const bidiS3 = /[0-9\xB2\xB3\xB9\u05BE\u05C0\u05C3\u05C6\u05D0-\u05EA\u05F0-\u05F4\u0600-\u0605\u0608\u060B\u060D\u061B\u061C\u061E-\u064A\u0660-\u0669\u066B-\u066F\u0671-\u06D5\u06DD\u06E5\u06E6\u06EE-\u070D\u070F\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0830-\u083E\u0840-\u0858\u085E\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08E2\u200F\u2070\u2074-\u2079\u2080-\u2089\u2488-\u249B\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBC1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFC\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\u{102E1}-\u{102FB}\u{10800}-\u{10805}\u{10808}\u{1080A}-\u{10835}\u{10837}\u{10838}\u{1083C}\u{1083F}-\u{10855}\u{10857}-\u{1089E}\u{108A7}-\u{108AF}\u{108E0}-\u{108F2}\u{108F4}\u{108F5}\u{108FB}-\u{1091B}\u{10920}-\u{10939}\u{1093F}\u{10980}-\u{109B7}\u{109BC}-\u{109CF}\u{109D2}-\u{10A00}\u{10A10}-\u{10A13}\u{10A15}-\u{10A17}\u{10A19}-\u{10A33}\u{10A40}-\u{10A47}\u{10A50}-\u{10A58}\u{10A60}-\u{10A9F}\u{10AC0}-\u{10AE4}\u{10AEB}-\u{10AF6}\u{10B00}-\u{10B35}\u{10B40}-\u{10B55}\u{10B58}-\u{10B72}\u{10B78}-\u{10B91}\u{10B99}-\u{10B9C}\u{10BA9}-\u{10BAF}\u{10C00}-\u{10C48}\u{10C80}-\u{10CB2}\u{10CC0}-\u{10CF2}\u{10CFA}-\u{10CFF}\u{10E60}-\u{10E7E}\u{1D7CE}-\u{1D7FF}\u{1E800}-\u{1E8C4}\u{1E8C7}-\u{1E8CF}\u{1E900}-\u{1E943}\u{1E950}-\u{1E959}\u{1E95E}\u{1E95F}\u{1EE00}-\u{1EE03}\u{1EE05}-\u{1EE1F}\u{1EE21}\u{1EE22}\u{1EE24}\u{1EE27}\u{1EE29}-\u{1EE32}\u{1EE34}-\u{1EE37}\u{1EE39}\u{1EE3B}\u{1EE42}\u{1EE47}\u{1EE49}\u{1EE4B}\u{1EE4D}-\u{1EE4F}\u{1EE51}\u{1EE52}\u{1EE54}\u{1EE57}\u{1EE59}\u{1EE5B}\u{1EE5D}\u{1EE5F}\u{1EE61}\u{1EE62}\u{1EE64}\u{1EE67}-\u{1EE6A}\u{1EE6C}-\u{1EE72}\u{1EE74}-\u{1EE77}\u{1EE79}-\u{1EE7C}\u{1EE7E}\u{1EE80}-\u{1EE89}\u{1EE8B}-\u{1EE9B}\u{1EEA1}-\u{1EEA3}\u{1EEA5}-\u{1EEA9}\u{1EEAB}-\u{1EEBB}\u{1F100}-\u{1F10A}][\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\u{101FD}\u{102E0}\u{10376}-\u{1037A}\u{10A01}-\u{10A03}\u{10A05}\u{10A06}\u{10A0C}-\u{10A0F}\u{10A38}-\u{10A3A}\u{10A3F}\u{10AE5}\u{10AE6}\u{11001}\u{11038}-\u{11046}\u{1107F}-\u{11081}\u{110B3}-\u{110B6}\u{110B9}\u{110BA}\u{11100}-\u{11102}\u{11127}-\u{1112B}\u{1112D}-\u{11134}\u{11173}\u{11180}\u{11181}\u{111B6}-\u{111BE}\u{111CA}-\u{111CC}\u{1122F}-\u{11231}\u{11234}\u{11236}\u{11237}\u{1123E}\u{112DF}\u{112E3}-\u{112EA}\u{11300}\u{11301}\u{1133C}\u{11340}\u{11366}-\u{1136C}\u{11370}-\u{11374}\u{11438}-\u{1143F}\u{11442}-\u{11444}\u{11446}\u{114B3}-\u{114B8}\u{114BA}\u{114BF}\u{114C0}\u{114C2}\u{114C3}\u{115B2}-\u{115B5}\u{115BC}\u{115BD}\u{115BF}\u{115C0}\u{115DC}\u{115DD}\u{11633}-\u{1163A}\u{1163D}\u{1163F}\u{11640}\u{116AB}\u{116AD}\u{116B0}-\u{116B5}\u{116B7}\u{1171D}-\u{1171F}\u{11722}-\u{11725}\u{11727}-\u{1172B}\u{11A01}-\u{11A06}\u{11A09}\u{11A0A}\u{11A33}-\u{11A38}\u{11A3B}-\u{11A3E}\u{11A47}\u{11A51}-\u{11A56}\u{11A59}-\u{11A5B}\u{11A8A}-\u{11A96}\u{11A98}\u{11A99}\u{11C30}-\u{11C36}\u{11C38}-\u{11C3D}\u{11C92}-\u{11CA7}\u{11CAA}-\u{11CB0}\u{11CB2}\u{11CB3}\u{11CB5}\u{11CB6}\u{11D31}-\u{11D36}\u{11D3A}\u{11D3C}\u{11D3D}\u{11D3F}-\u{11D45}\u{11D47}\u{16AF0}-\u{16AF4}\u{16B30}-\u{16B36}\u{16F8F}-\u{16F92}\u{1BC9D}\u{1BC9E}\u{1D167}-\u{1D169}\u{1D17B}-\u{1D182}\u{1D185}-\u{1D18B}\u{1D1AA}-\u{1D1AD}\u{1D242}-\u{1D244}\u{1DA00}-\u{1DA36}\u{1DA3B}-\u{1DA6C}\u{1DA75}\u{1DA84}\u{1DA9B}-\u{1DA9F}\u{1DAA1}-\u{1DAAF}\u{1E000}-\u{1E006}\u{1E008}-\u{1E018}\u{1E01B}-\u{1E021}\u{1E023}\u{1E024}\u{1E026}-\u{1E02A}\u{1E8D0}-\u{1E8D6}\u{1E944}-\u{1E94A}\u{E0100}-\u{E01EF}]*$/u;
const bidiS4EN = /[0-9\xB2\xB3\xB9\u06F0-\u06F9\u2070\u2074-\u2079\u2080-\u2089\u2488-\u249B\uFF10-\uFF19\u{102E1}-\u{102FB}\u{1D7CE}-\u{1D7FF}\u{1F100}-\u{1F10A}]/u;
const bidiS4AN = /[\u0600-\u0605\u0660-\u0669\u066B\u066C\u06DD\u08E2\u{10E60}-\u{10E7E}]/u;
const bidiS5 = /^[\0-\x08\x0E-\x1B!-\x84\x86-\u0377\u037A-\u037F\u0384-\u038A\u038C\u038E-\u03A1\u03A3-\u052F\u0531-\u0556\u0559-\u055F\u0561-\u0587\u0589\u058A\u058D-\u058F\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0606\u0607\u0609\u060A\u060C\u060E-\u061A\u064B-\u065F\u066A\u0670\u06D6-\u06DC\u06DE-\u06E4\u06E7-\u06ED\u06F0-\u06F9\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u07F6-\u07F9\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09FD\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AF1\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B77\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BFA\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C78-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4F\u0D54-\u0D63\u0D66-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4\u0E01-\u0E3A\u0E3F-\u0E5B\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00-\u0F47\u0F49-\u0F6C\u0F71-\u0F97\u0F99-\u0FBC\u0FBE-\u0FCC\u0FCE-\u0FDA\u1000-\u10C5\u10C7\u10CD\u10D0-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u137C\u1380-\u1399\u13A0-\u13F5\u13F8-\u13FD\u1400-\u167F\u1681-\u169C\u16A0-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1736\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17DD\u17E0-\u17E9\u17F0-\u17F9\u1800-\u180E\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1940\u1944-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u19DE-\u1A1B\u1A1E-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA0-\u1AAD\u1AB0-\u1ABE\u1B00-\u1B4B\u1B50-\u1B7C\u1B80-\u1BF3\u1BFC-\u1C37\u1C3B-\u1C49\u1C4D-\u1C88\u1CC0-\u1CC7\u1CD0-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FC4\u1FC6-\u1FD3\u1FD6-\u1FDB\u1FDD-\u1FEF\u1FF2-\u1FF4\u1FF6-\u1FFE\u200B-\u200E\u2010-\u2027\u202F-\u205E\u2060-\u2064\u206A-\u2071\u2074-\u208E\u2090-\u209C\u20A0-\u20BF\u20D0-\u20F0\u2100-\u218B\u2190-\u2426\u2440-\u244A\u2460-\u2B73\u2B76-\u2B95\u2B98-\u2BB9\u2BBD-\u2BC8\u2BCA-\u2BD2\u2BEC-\u2BEF\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CF3\u2CF9-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D70\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2E49\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3001-\u303F\u3041-\u3096\u3099-\u30FF\u3105-\u312E\u3131-\u318E\u3190-\u31BA\u31C0-\u31E3\u31F0-\u321E\u3220-\u32FE\u3300-\u4DB5\u4DC0-\u9FEA\uA000-\uA48C\uA490-\uA4C6\uA4D0-\uA62B\uA640-\uA6F7\uA700-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA82B\uA830-\uA839\uA840-\uA877\uA880-\uA8C5\uA8CE-\uA8D9\uA8E0-\uA8FD\uA900-\uA953\uA95F-\uA97C\uA980-\uA9CD\uA9CF-\uA9D9\uA9DE-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA5C-\uAAC2\uAADB-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB65\uAB70-\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uD800-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1E\uFB29\uFD3E\uFD3F\uFDFD\uFE00-\uFE19\uFE20-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFEFF\uFF01-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFF9-\uFFFD\u{10000}-\u{1000B}\u{1000D}-\u{10026}\u{10028}-\u{1003A}\u{1003C}\u{1003D}\u{1003F}-\u{1004D}\u{10050}-\u{1005D}\u{10080}-\u{100FA}\u{10100}-\u{10102}\u{10107}-\u{10133}\u{10137}-\u{1018E}\u{10190}-\u{1019B}\u{101A0}\u{101D0}-\u{101FD}\u{10280}-\u{1029C}\u{102A0}-\u{102D0}\u{102E0}-\u{102FB}\u{10300}-\u{10323}\u{1032D}-\u{1034A}\u{10350}-\u{1037A}\u{10380}-\u{1039D}\u{1039F}-\u{103C3}\u{103C8}-\u{103D5}\u{10400}-\u{1049D}\u{104A0}-\u{104A9}\u{104B0}-\u{104D3}\u{104D8}-\u{104FB}\u{10500}-\u{10527}\u{10530}-\u{10563}\u{1056F}\u{10600}-\u{10736}\u{10740}-\u{10755}\u{10760}-\u{10767}\u{1091F}\u{10A01}-\u{10A03}\u{10A05}\u{10A06}\u{10A0C}-\u{10A0F}\u{10A38}-\u{10A3A}\u{10A3F}\u{10AE5}\u{10AE6}\u{10B39}-\u{10B3F}\u{11000}-\u{1104D}\u{11052}-\u{1106F}\u{1107F}-\u{110C1}\u{110D0}-\u{110E8}\u{110F0}-\u{110F9}\u{11100}-\u{11134}\u{11136}-\u{11143}\u{11150}-\u{11176}\u{11180}-\u{111CD}\u{111D0}-\u{111DF}\u{111E1}-\u{111F4}\u{11200}-\u{11211}\u{11213}-\u{1123E}\u{11280}-\u{11286}\u{11288}\u{1128A}-\u{1128D}\u{1128F}-\u{1129D}\u{1129F}-\u{112A9}\u{112B0}-\u{112EA}\u{112F0}-\u{112F9}\u{11300}-\u{11303}\u{11305}-\u{1130C}\u{1130F}\u{11310}\u{11313}-\u{11328}\u{1132A}-\u{11330}\u{11332}\u{11333}\u{11335}-\u{11339}\u{1133C}-\u{11344}\u{11347}\u{11348}\u{1134B}-\u{1134D}\u{11350}\u{11357}\u{1135D}-\u{11363}\u{11366}-\u{1136C}\u{11370}-\u{11374}\u{11400}-\u{11459}\u{1145B}\u{1145D}\u{11480}-\u{114C7}\u{114D0}-\u{114D9}\u{11580}-\u{115B5}\u{115B8}-\u{115DD}\u{11600}-\u{11644}\u{11650}-\u{11659}\u{11660}-\u{1166C}\u{11680}-\u{116B7}\u{116C0}-\u{116C9}\u{11700}-\u{11719}\u{1171D}-\u{1172B}\u{11730}-\u{1173F}\u{118A0}-\u{118F2}\u{118FF}\u{11A00}-\u{11A47}\u{11A50}-\u{11A83}\u{11A86}-\u{11A9C}\u{11A9E}-\u{11AA2}\u{11AC0}-\u{11AF8}\u{11C00}-\u{11C08}\u{11C0A}-\u{11C36}\u{11C38}-\u{11C45}\u{11C50}-\u{11C6C}\u{11C70}-\u{11C8F}\u{11C92}-\u{11CA7}\u{11CA9}-\u{11CB6}\u{11D00}-\u{11D06}\u{11D08}\u{11D09}\u{11D0B}-\u{11D36}\u{11D3A}\u{11D3C}\u{11D3D}\u{11D3F}-\u{11D47}\u{11D50}-\u{11D59}\u{12000}-\u{12399}\u{12400}-\u{1246E}\u{12470}-\u{12474}\u{12480}-\u{12543}\u{13000}-\u{1342E}\u{14400}-\u{14646}\u{16800}-\u{16A38}\u{16A40}-\u{16A5E}\u{16A60}-\u{16A69}\u{16A6E}\u{16A6F}\u{16AD0}-\u{16AED}\u{16AF0}-\u{16AF5}\u{16B00}-\u{16B45}\u{16B50}-\u{16B59}\u{16B5B}-\u{16B61}\u{16B63}-\u{16B77}\u{16B7D}-\u{16B8F}\u{16F00}-\u{16F44}\u{16F50}-\u{16F7E}\u{16F8F}-\u{16F9F}\u{16FE0}\u{16FE1}\u{17000}-\u{187EC}\u{18800}-\u{18AF2}\u{1B000}-\u{1B11E}\u{1B170}-\u{1B2FB}\u{1BC00}-\u{1BC6A}\u{1BC70}-\u{1BC7C}\u{1BC80}-\u{1BC88}\u{1BC90}-\u{1BC99}\u{1BC9C}-\u{1BCA3}\u{1D000}-\u{1D0F5}\u{1D100}-\u{1D126}\u{1D129}-\u{1D1E8}\u{1D200}-\u{1D245}\u{1D300}-\u{1D356}\u{1D360}-\u{1D371}\u{1D400}-\u{1D454}\u{1D456}-\u{1D49C}\u{1D49E}\u{1D49F}\u{1D4A2}\u{1D4A5}\u{1D4A6}\u{1D4A9}-\u{1D4AC}\u{1D4AE}-\u{1D4B9}\u{1D4BB}\u{1D4BD}-\u{1D4C3}\u{1D4C5}-\u{1D505}\u{1D507}-\u{1D50A}\u{1D50D}-\u{1D514}\u{1D516}-\u{1D51C}\u{1D51E}-\u{1D539}\u{1D53B}-\u{1D53E}\u{1D540}-\u{1D544}\u{1D546}\u{1D54A}-\u{1D550}\u{1D552}-\u{1D6A5}\u{1D6A8}-\u{1D7CB}\u{1D7CE}-\u{1DA8B}\u{1DA9B}-\u{1DA9F}\u{1DAA1}-\u{1DAAF}\u{1E000}-\u{1E006}\u{1E008}-\u{1E018}\u{1E01B}-\u{1E021}\u{1E023}\u{1E024}\u{1E026}-\u{1E02A}\u{1E8D0}-\u{1E8D6}\u{1E944}-\u{1E94A}\u{1EEF0}\u{1EEF1}\u{1F000}-\u{1F02B}\u{1F030}-\u{1F093}\u{1F0A0}-\u{1F0AE}\u{1F0B1}-\u{1F0BF}\u{1F0C1}-\u{1F0CF}\u{1F0D1}-\u{1F0F5}\u{1F100}-\u{1F10C}\u{1F110}-\u{1F12E}\u{1F130}-\u{1F16B}\u{1F170}-\u{1F1AC}\u{1F1E6}-\u{1F202}\u{1F210}-\u{1F23B}\u{1F240}-\u{1F248}\u{1F250}\u{1F251}\u{1F260}-\u{1F265}\u{1F300}-\u{1F6D4}\u{1F6E0}-\u{1F6EC}\u{1F6F0}-\u{1F6F8}\u{1F700}-\u{1F773}\u{1F780}-\u{1F7D4}\u{1F800}-\u{1F80B}\u{1F810}-\u{1F847}\u{1F850}-\u{1F859}\u{1F860}-\u{1F887}\u{1F890}-\u{1F8AD}\u{1F900}-\u{1F90B}\u{1F910}-\u{1F93E}\u{1F940}-\u{1F94C}\u{1F950}-\u{1F96B}\u{1F980}-\u{1F997}\u{1F9C0}\u{1F9D0}-\u{1F9E6}\u{20000}-\u{2A6D6}\u{2A700}-\u{2B734}\u{2B740}-\u{2B81D}\u{2B820}-\u{2CEA1}\u{2CEB0}-\u{2EBE0}\u{2F800}-\u{2FA1D}\u{E0001}\u{E0020}-\u{E007F}\u{E0100}-\u{E01EF}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]*$/u;
const bidiS6 = /[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02B8\u02BB-\u02C1\u02D0\u02D1\u02E0-\u02E4\u02EE\u0370-\u0373\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0482\u048A-\u052F\u0531-\u0556\u0559-\u055F\u0561-\u0587\u0589\u06F0-\u06F9\u0903-\u0939\u093B\u093D-\u0940\u0949-\u094C\u094E-\u0950\u0958-\u0961\u0964-\u0980\u0982\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD-\u09C0\u09C7\u09C8\u09CB\u09CC\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09FA\u09FC\u09FD\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3E-\u0A40\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD-\u0AC0\u0AC9\u0ACB\u0ACC\u0AD0\u0AE0\u0AE1\u0AE6-\u0AF0\u0AF9\u0B02\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD0\u0BD7\u0BE6-\u0BF2\u0C01-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C41-\u0C44\u0C58-\u0C5A\u0C60\u0C61\u0C66-\u0C6F\u0C7F\u0C80\u0C82\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD-\u0CC4\u0CC6-\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D02\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D4E\u0D4F\u0D54-\u0D61\u0D66-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2-\u0DF4\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E4F-\u0E5B\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00-\u0F17\u0F1A-\u0F34\u0F36\u0F38\u0F3E-\u0F47\u0F49-\u0F6C\u0F7F\u0F85\u0F88-\u0F8C\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE-\u0FDA\u1000-\u102C\u1031\u1038\u103B\u103C\u103F-\u1057\u105A-\u105D\u1061-\u1070\u1075-\u1081\u1083\u1084\u1087-\u108C\u108E-\u109C\u109E-\u10C5\u10C7\u10CD\u10D0-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1360-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u167F\u1681-\u169A\u16A0-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1735\u1736\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17B6\u17BE-\u17C5\u17C7\u17C8\u17D4-\u17DA\u17DC\u17E0-\u17E9\u1810-\u1819\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1923-\u1926\u1929-\u192B\u1930\u1931\u1933-\u1938\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A19\u1A1A\u1A1E-\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D-\u1A72\u1A80-\u1A89\u1A90-\u1A99\u1AA0-\u1AAD\u1B04-\u1B33\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B4B\u1B50-\u1B6A\u1B74-\u1B7C\u1B82-\u1BA1\u1BA6\u1BA7\u1BAA\u1BAE-\u1BE5\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2\u1BF3\u1BFC-\u1C2B\u1C34\u1C35\u1C3B-\u1C49\u1C4D-\u1C88\u1CC0-\u1CC7\u1CD3\u1CE1\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5-\u1CF7\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200E\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u214F\u2160-\u2188\u2336-\u237A\u2395\u2488-\u24E9\u26AC\u2800-\u28FF\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D70\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u302E\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u3190-\u31BA\u31F0-\u321C\u3220-\u324F\u3260-\u327B\u327F-\u32B0\u32C0-\u32CB\u32D0-\u32FE\u3300-\u3376\u337B-\u33DD\u33E0-\u33FE\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA60C\uA610-\uA62B\uA640-\uA66E\uA680-\uA69D\uA6A0-\uA6EF\uA6F2-\uA6F7\uA722-\uA787\uA789-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA824\uA827\uA830-\uA837\uA840-\uA873\uA880-\uA8C3\uA8CE-\uA8D9\uA8F2-\uA8FD\uA900-\uA925\uA92E-\uA946\uA952\uA953\uA95F-\uA97C\uA983-\uA9B2\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD-\uA9CD\uA9CF-\uA9D9\uA9DE-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA2F\uAA30\uAA33\uAA34\uAA40-\uAA42\uAA44-\uAA4B\uAA4D\uAA50-\uAA59\uAA5C-\uAA7B\uAA7D-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAAEB\uAAEE-\uAAF5\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB65\uAB70-\uABE4\uABE6\uABE7\uABE9-\uABEC\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uD800-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u{10000}-\u{1000B}\u{1000D}-\u{10026}\u{10028}-\u{1003A}\u{1003C}\u{1003D}\u{1003F}-\u{1004D}\u{10050}-\u{1005D}\u{10080}-\u{100FA}\u{10100}\u{10102}\u{10107}-\u{10133}\u{10137}-\u{1013F}\u{1018D}\u{1018E}\u{101D0}-\u{101FC}\u{10280}-\u{1029C}\u{102A0}-\u{102D0}\u{102E1}-\u{102FB}\u{10300}-\u{10323}\u{1032D}-\u{1034A}\u{10350}-\u{10375}\u{10380}-\u{1039D}\u{1039F}-\u{103C3}\u{103C8}-\u{103D5}\u{10400}-\u{1049D}\u{104A0}-\u{104A9}\u{104B0}-\u{104D3}\u{104D8}-\u{104FB}\u{10500}-\u{10527}\u{10530}-\u{10563}\u{1056F}\u{10600}-\u{10736}\u{10740}-\u{10755}\u{10760}-\u{10767}\u{11000}\u{11002}-\u{11037}\u{11047}-\u{1104D}\u{11066}-\u{1106F}\u{11082}-\u{110B2}\u{110B7}\u{110B8}\u{110BB}-\u{110C1}\u{110D0}-\u{110E8}\u{110F0}-\u{110F9}\u{11103}-\u{11126}\u{1112C}\u{11136}-\u{11143}\u{11150}-\u{11172}\u{11174}-\u{11176}\u{11182}-\u{111B5}\u{111BF}-\u{111C9}\u{111CD}\u{111D0}-\u{111DF}\u{111E1}-\u{111F4}\u{11200}-\u{11211}\u{11213}-\u{1122E}\u{11232}\u{11233}\u{11235}\u{11238}-\u{1123D}\u{11280}-\u{11286}\u{11288}\u{1128A}-\u{1128D}\u{1128F}-\u{1129D}\u{1129F}-\u{112A9}\u{112B0}-\u{112DE}\u{112E0}-\u{112E2}\u{112F0}-\u{112F9}\u{11302}\u{11303}\u{11305}-\u{1130C}\u{1130F}\u{11310}\u{11313}-\u{11328}\u{1132A}-\u{11330}\u{11332}\u{11333}\u{11335}-\u{11339}\u{1133D}-\u{1133F}\u{11341}-\u{11344}\u{11347}\u{11348}\u{1134B}-\u{1134D}\u{11350}\u{11357}\u{1135D}-\u{11363}\u{11400}-\u{11437}\u{11440}\u{11441}\u{11445}\u{11447}-\u{11459}\u{1145B}\u{1145D}\u{11480}-\u{114B2}\u{114B9}\u{114BB}-\u{114BE}\u{114C1}\u{114C4}-\u{114C7}\u{114D0}-\u{114D9}\u{11580}-\u{115B1}\u{115B8}-\u{115BB}\u{115BE}\u{115C1}-\u{115DB}\u{11600}-\u{11632}\u{1163B}\u{1163C}\u{1163E}\u{11641}-\u{11644}\u{11650}-\u{11659}\u{11680}-\u{116AA}\u{116AC}\u{116AE}\u{116AF}\u{116B6}\u{116C0}-\u{116C9}\u{11700}-\u{11719}\u{11720}\u{11721}\u{11726}\u{11730}-\u{1173F}\u{118A0}-\u{118F2}\u{118FF}\u{11A00}\u{11A07}\u{11A08}\u{11A0B}-\u{11A32}\u{11A39}\u{11A3A}\u{11A3F}-\u{11A46}\u{11A50}\u{11A57}\u{11A58}\u{11A5C}-\u{11A83}\u{11A86}-\u{11A89}\u{11A97}\u{11A9A}-\u{11A9C}\u{11A9E}-\u{11AA2}\u{11AC0}-\u{11AF8}\u{11C00}-\u{11C08}\u{11C0A}-\u{11C2F}\u{11C3E}-\u{11C45}\u{11C50}-\u{11C6C}\u{11C70}-\u{11C8F}\u{11CA9}\u{11CB1}\u{11CB4}\u{11D00}-\u{11D06}\u{11D08}\u{11D09}\u{11D0B}-\u{11D30}\u{11D46}\u{11D50}-\u{11D59}\u{12000}-\u{12399}\u{12400}-\u{1246E}\u{12470}-\u{12474}\u{12480}-\u{12543}\u{13000}-\u{1342E}\u{14400}-\u{14646}\u{16800}-\u{16A38}\u{16A40}-\u{16A5E}\u{16A60}-\u{16A69}\u{16A6E}\u{16A6F}\u{16AD0}-\u{16AED}\u{16AF5}\u{16B00}-\u{16B2F}\u{16B37}-\u{16B45}\u{16B50}-\u{16B59}\u{16B5B}-\u{16B61}\u{16B63}-\u{16B77}\u{16B7D}-\u{16B8F}\u{16F00}-\u{16F44}\u{16F50}-\u{16F7E}\u{16F93}-\u{16F9F}\u{16FE0}\u{16FE1}\u{17000}-\u{187EC}\u{18800}-\u{18AF2}\u{1B000}-\u{1B11E}\u{1B170}-\u{1B2FB}\u{1BC00}-\u{1BC6A}\u{1BC70}-\u{1BC7C}\u{1BC80}-\u{1BC88}\u{1BC90}-\u{1BC99}\u{1BC9C}\u{1BC9F}\u{1D000}-\u{1D0F5}\u{1D100}-\u{1D126}\u{1D129}-\u{1D166}\u{1D16A}-\u{1D172}\u{1D183}\u{1D184}\u{1D18C}-\u{1D1A9}\u{1D1AE}-\u{1D1E8}\u{1D360}-\u{1D371}\u{1D400}-\u{1D454}\u{1D456}-\u{1D49C}\u{1D49E}\u{1D49F}\u{1D4A2}\u{1D4A5}\u{1D4A6}\u{1D4A9}-\u{1D4AC}\u{1D4AE}-\u{1D4B9}\u{1D4BB}\u{1D4BD}-\u{1D4C3}\u{1D4C5}-\u{1D505}\u{1D507}-\u{1D50A}\u{1D50D}-\u{1D514}\u{1D516}-\u{1D51C}\u{1D51E}-\u{1D539}\u{1D53B}-\u{1D53E}\u{1D540}-\u{1D544}\u{1D546}\u{1D54A}-\u{1D550}\u{1D552}-\u{1D6A5}\u{1D6A8}-\u{1D6DA}\u{1D6DC}-\u{1D714}\u{1D716}-\u{1D74E}\u{1D750}-\u{1D788}\u{1D78A}-\u{1D7C2}\u{1D7C4}-\u{1D7CB}\u{1D7CE}-\u{1D9FF}\u{1DA37}-\u{1DA3A}\u{1DA6D}-\u{1DA74}\u{1DA76}-\u{1DA83}\u{1DA85}-\u{1DA8B}\u{1F100}-\u{1F10A}\u{1F110}-\u{1F12E}\u{1F130}-\u{1F169}\u{1F170}-\u{1F1AC}\u{1F1E6}-\u{1F202}\u{1F210}-\u{1F23B}\u{1F240}-\u{1F248}\u{1F250}\u{1F251}\u{20000}-\u{2A6D6}\u{2A700}-\u{2B734}\u{2B740}-\u{2B81D}\u{2B820}-\u{2CEA1}\u{2CEB0}-\u{2EBE0}\u{2F800}-\u{2FA1D}\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}][\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0AFA-\u0AFF\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81\u0CBC\u0CCC\u0CCD\u0CE2\u0CE3\u0D00\u0D01\u0D3B\u0D3C\u0D41-\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u1922\u1927\u1928\u1932\u1939-\u193B\u1A17\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80\u1B81\u1BA2-\u1BA5\u1BA8\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF9\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEC\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F\u{101FD}\u{102E0}\u{10376}-\u{1037A}\u{10A01}-\u{10A03}\u{10A05}\u{10A06}\u{10A0C}-\u{10A0F}\u{10A38}-\u{10A3A}\u{10A3F}\u{10AE5}\u{10AE6}\u{11001}\u{11038}-\u{11046}\u{1107F}-\u{11081}\u{110B3}-\u{110B6}\u{110B9}\u{110BA}\u{11100}-\u{11102}\u{11127}-\u{1112B}\u{1112D}-\u{11134}\u{11173}\u{11180}\u{11181}\u{111B6}-\u{111BE}\u{111CA}-\u{111CC}\u{1122F}-\u{11231}\u{11234}\u{11236}\u{11237}\u{1123E}\u{112DF}\u{112E3}-\u{112EA}\u{11300}\u{11301}\u{1133C}\u{11340}\u{11366}-\u{1136C}\u{11370}-\u{11374}\u{11438}-\u{1143F}\u{11442}-\u{11444}\u{11446}\u{114B3}-\u{114B8}\u{114BA}\u{114BF}\u{114C0}\u{114C2}\u{114C3}\u{115B2}-\u{115B5}\u{115BC}\u{115BD}\u{115BF}\u{115C0}\u{115DC}\u{115DD}\u{11633}-\u{1163A}\u{1163D}\u{1163F}\u{11640}\u{116AB}\u{116AD}\u{116B0}-\u{116B5}\u{116B7}\u{1171D}-\u{1171F}\u{11722}-\u{11725}\u{11727}-\u{1172B}\u{11A01}-\u{11A06}\u{11A09}\u{11A0A}\u{11A33}-\u{11A38}\u{11A3B}-\u{11A3E}\u{11A47}\u{11A51}-\u{11A56}\u{11A59}-\u{11A5B}\u{11A8A}-\u{11A96}\u{11A98}\u{11A99}\u{11C30}-\u{11C36}\u{11C38}-\u{11C3D}\u{11C92}-\u{11CA7}\u{11CAA}-\u{11CB0}\u{11CB2}\u{11CB3}\u{11CB5}\u{11CB6}\u{11D31}-\u{11D36}\u{11D3A}\u{11D3C}\u{11D3D}\u{11D3F}-\u{11D45}\u{11D47}\u{16AF0}-\u{16AF4}\u{16B30}-\u{16B36}\u{16F8F}-\u{16F92}\u{1BC9D}\u{1BC9E}\u{1D167}-\u{1D169}\u{1D17B}-\u{1D182}\u{1D185}-\u{1D18B}\u{1D1AA}-\u{1D1AD}\u{1D242}-\u{1D244}\u{1DA00}-\u{1DA36}\u{1DA3B}-\u{1DA6C}\u{1DA75}\u{1DA84}\u{1DA9B}-\u{1DA9F}\u{1DAA1}-\u{1DAAF}\u{1E000}-\u{1E006}\u{1E008}-\u{1E018}\u{1E01B}-\u{1E021}\u{1E023}\u{1E024}\u{1E026}-\u{1E02A}\u{1E8D0}-\u{1E8D6}\u{1E944}-\u{1E94A}\u{E0100}-\u{E01EF}]*$/u;

module.exports = {
  combiningMarks,
  combiningClassVirama,
  validZWNJ,
  bidiDomain,
  bidiS1LTR,
  bidiS1RTL,
  bidiS2,
  bidiS3,
  bidiS4EN,
  bidiS4AN,
  bidiS5,
  bidiS6
};


/***/ }),

/***/ "./node_modules/universal-url/browser.js":
/*!***********************************************!*\
  !*** ./node_modules/universal-url/browser.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
const output = {};
let g, hasNative;



if (typeof window !== "undefined")
{
	g = window;
}
else if (typeof global !== "undefined")
{
	g = global;
}
else if (typeof self !== "undefined")
{
	g = self;
}
else
{
	g = this;
}



try
{
	const url = new g.URL("http://domain.com");
	const params = new g.URLSearchParams("?param=value")

	hasNative = "searchParams" in url && params.get("param") === "value";
}
catch (error)
{
	hasNative = false;
}



if (hasNative)
{
	output.URL = g.URL;
	output.URLSearchParams = g.URLSearchParams;
}
else
{
	const lib = __webpack_require__(/*! whatwg-url */ "./node_modules/universal-url/node_modules/whatwg-url/lib/public-api.js");

	output.URL = lib.URL;
	output.URLSearchParams = lib.URLSearchParams;
}



output.shim = () =>
{
	g.URL = output.URL;
	g.URLSearchParams = output.URLSearchParams;
};



module.exports = output;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/URL-impl.js":
/*!****************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/URL-impl.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const usm = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js");
const urlencoded = __webpack_require__(/*! ./urlencoded */ "./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js");
const URLSearchParams = __webpack_require__(/*! ./URLSearchParams */ "./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams.js");

exports.implementation = class URLImpl {
  constructor(constructorArgs) {
    const url = constructorArgs[0];
    const base = constructorArgs[1];

    let parsedBase = null;
    if (base !== undefined) {
      parsedBase = usm.basicURLParse(base);
      if (parsedBase === null) {
        throw new TypeError(`Invalid base URL: ${base}`);
      }
    }

    const parsedURL = usm.basicURLParse(url, { baseURL: parsedBase });
    if (parsedURL === null) {
      throw new TypeError(`Invalid URL: ${url}`);
    }

    const query = parsedURL.query !== null ? parsedURL.query : "";

    this._url = parsedURL;

    // We cannot invoke the "new URLSearchParams object" algorithm without going through the constructor, which strips
    // question mark by default. Therefore the doNotStripQMark hack is used.
    this._query = URLSearchParams.createImpl([query], { doNotStripQMark: true });
    this._query._url = this;
  }

  get href() {
    return usm.serializeURL(this._url);
  }

  set href(v) {
    const parsedURL = usm.basicURLParse(v);
    if (parsedURL === null) {
      throw new TypeError(`Invalid URL: ${v}`);
    }

    this._url = parsedURL;

    this._query._list.splice(0);
    const { query } = parsedURL;
    if (query !== null) {
      this._query._list = urlencoded.parseUrlencoded(query);
    }
  }

  get origin() {
    return usm.serializeURLOrigin(this._url);
  }

  get protocol() {
    return this._url.scheme + ":";
  }

  set protocol(v) {
    usm.basicURLParse(v + ":", { url: this._url, stateOverride: "scheme start" });
  }

  get username() {
    return this._url.username;
  }

  set username(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    usm.setTheUsername(this._url, v);
  }

  get password() {
    return this._url.password;
  }

  set password(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    usm.setThePassword(this._url, v);
  }

  get host() {
    const url = this._url;

    if (url.host === null) {
      return "";
    }

    if (url.port === null) {
      return usm.serializeHost(url.host);
    }

    return usm.serializeHost(url.host) + ":" + usm.serializeInteger(url.port);
  }

  set host(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    usm.basicURLParse(v, { url: this._url, stateOverride: "host" });
  }

  get hostname() {
    if (this._url.host === null) {
      return "";
    }

    return usm.serializeHost(this._url.host);
  }

  set hostname(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    usm.basicURLParse(v, { url: this._url, stateOverride: "hostname" });
  }

  get port() {
    if (this._url.port === null) {
      return "";
    }

    return usm.serializeInteger(this._url.port);
  }

  set port(v) {
    if (usm.cannotHaveAUsernamePasswordPort(this._url)) {
      return;
    }

    if (v === "") {
      this._url.port = null;
    } else {
      usm.basicURLParse(v, { url: this._url, stateOverride: "port" });
    }
  }

  get pathname() {
    if (this._url.cannotBeABaseURL) {
      return this._url.path[0];
    }

    if (this._url.path.length === 0) {
      return "";
    }

    return "/" + this._url.path.join("/");
  }

  set pathname(v) {
    if (this._url.cannotBeABaseURL) {
      return;
    }

    this._url.path = [];
    usm.basicURLParse(v, { url: this._url, stateOverride: "path start" });
  }

  get search() {
    if (this._url.query === null || this._url.query === "") {
      return "";
    }

    return "?" + this._url.query;
  }

  set search(v) {
    const url = this._url;

    if (v === "") {
      url.query = null;
      this._query._list = [];
      return;
    }

    const input = v[0] === "?" ? v.substring(1) : v;
    url.query = "";
    usm.basicURLParse(input, { url, stateOverride: "query" });
    this._query._list = urlencoded.parseUrlencoded(input);
  }

  get searchParams() {
    return this._query;
  }

  get hash() {
    if (this._url.fragment === null || this._url.fragment === "") {
      return "";
    }

    return "#" + this._url.fragment;
  }

  set hash(v) {
    if (v === "") {
      this._url.fragment = null;
      return;
    }

    const input = v[0] === "#" ? v.substring(1) : v;
    this._url.fragment = "";
    usm.basicURLParse(input, { url: this._url, stateOverride: "fragment" });
  }

  toJSON() {
    return this.href;
  }
};


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/URL.js":
/*!***********************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/URL.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const conversions = __webpack_require__(/*! webidl-conversions */ "./node_modules/webidl-conversions/lib/index.js");
const utils = __webpack_require__(/*! ./utils.js */ "./node_modules/universal-url/node_modules/whatwg-url/lib/utils.js");

const impl = utils.implSymbol;

class URL {
  constructor(url) {
    if (arguments.length < 1) {
      throw new TypeError("Failed to construct 'URL': 1 argument required, but only " + arguments.length + " present.");
    }
    const args = [];
    {
      let curArg = arguments[0];
      curArg = conversions["USVString"](curArg, { context: "Failed to construct 'URL': parameter 1" });
      args.push(curArg);
    }
    {
      let curArg = arguments[1];
      if (curArg !== undefined) {
        curArg = conversions["USVString"](curArg, { context: "Failed to construct 'URL': parameter 2" });
      }
      args.push(curArg);
    }
    return iface.setup(Object.create(new.target.prototype), args);
  }

  toJSON() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl].toJSON();
  }

  get href() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["href"];
  }

  set href(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'href' property on 'URL': The provided value" });

    this[impl]["href"] = V;
  }

  toString() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }
    return this[impl]["href"];
  }

  get origin() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["origin"];
  }

  get protocol() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["protocol"];
  }

  set protocol(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'protocol' property on 'URL': The provided value" });

    this[impl]["protocol"] = V;
  }

  get username() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["username"];
  }

  set username(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'username' property on 'URL': The provided value" });

    this[impl]["username"] = V;
  }

  get password() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["password"];
  }

  set password(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'password' property on 'URL': The provided value" });

    this[impl]["password"] = V;
  }

  get host() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["host"];
  }

  set host(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'host' property on 'URL': The provided value" });

    this[impl]["host"] = V;
  }

  get hostname() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["hostname"];
  }

  set hostname(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'hostname' property on 'URL': The provided value" });

    this[impl]["hostname"] = V;
  }

  get port() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["port"];
  }

  set port(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'port' property on 'URL': The provided value" });

    this[impl]["port"] = V;
  }

  get pathname() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["pathname"];
  }

  set pathname(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'pathname' property on 'URL': The provided value" });

    this[impl]["pathname"] = V;
  }

  get search() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["search"];
  }

  set search(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'search' property on 'URL': The provided value" });

    this[impl]["search"] = V;
  }

  get searchParams() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return utils.getSameObject(this, "searchParams", () => {
      return utils.tryWrapperForImpl(this[impl]["searchParams"]);
    });
  }

  get hash() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl]["hash"];
  }

  set hash(V) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    V = conversions["USVString"](V, { context: "Failed to set the 'hash' property on 'URL': The provided value" });

    this[impl]["hash"] = V;
  }
}
Object.defineProperties(URL.prototype, {
  toJSON: { enumerable: true },
  href: { enumerable: true },
  toString: { enumerable: true },
  origin: { enumerable: true },
  protocol: { enumerable: true },
  username: { enumerable: true },
  password: { enumerable: true },
  host: { enumerable: true },
  hostname: { enumerable: true },
  port: { enumerable: true },
  pathname: { enumerable: true },
  search: { enumerable: true },
  searchParams: { enumerable: true },
  hash: { enumerable: true },
  [Symbol.toStringTag]: { value: "URL", configurable: true }
});
const iface = {
  // When an interface-module that implements this interface as a mixin is loaded, it will append its own `.is()`
  // method into this array. It allows objects that directly implements *those* interfaces to be recognized as
  // implementing this mixin interface.
  _mixedIntoPredicates: [],
  is(obj) {
    if (obj) {
      if (utils.hasOwn(obj, impl) && obj[impl] instanceof Impl.implementation) {
        return true;
      }
      for (const isMixedInto of module.exports._mixedIntoPredicates) {
        if (isMixedInto(obj)) {
          return true;
        }
      }
    }
    return false;
  },
  isImpl(obj) {
    if (obj) {
      if (obj instanceof Impl.implementation) {
        return true;
      }

      const wrapper = utils.wrapperForImpl(obj);
      for (const isMixedInto of module.exports._mixedIntoPredicates) {
        if (isMixedInto(wrapper)) {
          return true;
        }
      }
    }
    return false;
  },
  convert(obj, { context = "The provided value" } = {}) {
    if (module.exports.is(obj)) {
      return utils.implForWrapper(obj);
    }
    throw new TypeError(`${context} is not of type 'URL'.`);
  },

  create(constructorArgs, privateData) {
    let obj = Object.create(URL.prototype);
    obj = this.setup(obj, constructorArgs, privateData);
    return obj;
  },
  createImpl(constructorArgs, privateData) {
    let obj = Object.create(URL.prototype);
    obj = this.setup(obj, constructorArgs, privateData);
    return utils.implForWrapper(obj);
  },
  _internalSetup(obj) {},
  setup(obj, constructorArgs, privateData) {
    if (!privateData) privateData = {};

    privateData.wrapper = obj;

    this._internalSetup(obj);
    Object.defineProperty(obj, impl, {
      value: new Impl.implementation(constructorArgs, privateData),
      configurable: true
    });

    obj[impl][utils.wrapperSymbol] = obj;
    if (Impl.init) {
      Impl.init(obj[impl], privateData);
    }
    return obj;
  },
  interface: URL,
  expose: {
    Window: { URL },
    Worker: { URL }
  }
}; // iface
module.exports = iface;

const Impl = __webpack_require__(/*! ./URL-impl.js */ "./node_modules/universal-url/node_modules/whatwg-url/lib/URL-impl.js");


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams-impl.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams-impl.js ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const stableSortBy = __webpack_require__(/*! lodash.sortby */ "./node_modules/lodash.sortby/index.js");
const urlencoded = __webpack_require__(/*! ./urlencoded */ "./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js");

exports.implementation = class URLSearchParamsImpl {
  constructor(constructorArgs, { doNotStripQMark = false }) {
    let init = constructorArgs[0];
    this._list = [];
    this._url = null;

    if (!doNotStripQMark && typeof init === "string" && init[0] === "?") {
      init = init.slice(1);
    }

    if (Array.isArray(init)) {
      for (const pair of init) {
        if (pair.length !== 2) {
          throw new TypeError("Failed to construct 'URLSearchParams': parameter 1 sequence's element does not " +
                              "contain exactly two elements.");
        }
        this._list.push([pair[0], pair[1]]);
      }
    } else if (typeof init === "object" && Object.getPrototypeOf(init) === null) {
      for (const name of Object.keys(init)) {
        const value = init[name];
        this._list.push([name, value]);
      }
    } else {
      this._list = urlencoded.parseUrlencoded(init);
    }
  }

  _updateSteps() {
    if (this._url !== null) {
      let query = urlencoded.serializeUrlencoded(this._list);
      if (query === "") {
        query = null;
      }
      this._url._url.query = query;
    }
  }

  append(name, value) {
    this._list.push([name, value]);
    this._updateSteps();
  }

  delete(name) {
    let i = 0;
    while (i < this._list.length) {
      if (this._list[i][0] === name) {
        this._list.splice(i, 1);
      } else {
        i++;
      }
    }
    this._updateSteps();
  }

  get(name) {
    for (const tuple of this._list) {
      if (tuple[0] === name) {
        return tuple[1];
      }
    }
    return null;
  }

  getAll(name) {
    const output = [];
    for (const tuple of this._list) {
      if (tuple[0] === name) {
        output.push(tuple[1]);
      }
    }
    return output;
  }

  has(name) {
    for (const tuple of this._list) {
      if (tuple[0] === name) {
        return true;
      }
    }
    return false;
  }

  set(name, value) {
    let found = false;
    let i = 0;
    while (i < this._list.length) {
      if (this._list[i][0] === name) {
        if (found) {
          this._list.splice(i, 1);
        } else {
          found = true;
          this._list[i][1] = value;
          i++;
        }
      } else {
        i++;
      }
    }
    if (!found) {
      this._list.push([name, value]);
    }
    this._updateSteps();
  }

  sort() {
    this._list = stableSortBy(this._list, [0]);
    this._updateSteps();
  }

  [Symbol.iterator]() {
    return this._list[Symbol.iterator]();
  }

  toString() {
    return urlencoded.serializeUrlencoded(this._list);
  }
};


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams.js ***!
  \***********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const conversions = __webpack_require__(/*! webidl-conversions */ "./node_modules/webidl-conversions/lib/index.js");
const utils = __webpack_require__(/*! ./utils.js */ "./node_modules/universal-url/node_modules/whatwg-url/lib/utils.js");

const impl = utils.implSymbol;

const IteratorPrototype = Object.create(utils.IteratorPrototype, {
  next: {
    value: function next() {
      const internal = this[utils.iterInternalSymbol];
      const { target, kind, index } = internal;
      const values = Array.from(target[impl]);
      const len = values.length;
      if (index >= len) {
        return { value: undefined, done: true };
      }

      const pair = values[index];
      internal.index = index + 1;
      const [key, value] = pair.map(utils.tryWrapperForImpl);

      let result;
      switch (kind) {
        case "key":
          result = key;
          break;
        case "value":
          result = value;
          break;
        case "key+value":
          result = [key, value];
          break;
      }
      return { value: result, done: false };
    },
    writable: true,
    enumerable: true,
    configurable: true
  },
  [Symbol.toStringTag]: {
    value: "URLSearchParams Iterator",
    configurable: true
  }
});
class URLSearchParams {
  constructor() {
    const args = [];
    {
      let curArg = arguments[0];
      if (curArg !== undefined) {
        if (utils.isObject(curArg)) {
          if (curArg[Symbol.iterator] !== undefined) {
            if (!utils.isObject(curArg)) {
              throw new TypeError(
                "Failed to construct 'URLSearchParams': parameter 1" + " sequence" + " is not an iterable object."
              );
            } else {
              const V = [];
              const tmp = curArg;
              for (let nextItem of tmp) {
                if (!utils.isObject(nextItem)) {
                  throw new TypeError(
                    "Failed to construct 'URLSearchParams': parameter 1" +
                      " sequence" +
                      "'s element" +
                      " is not an iterable object."
                  );
                } else {
                  const V = [];
                  const tmp = nextItem;
                  for (let nextItem of tmp) {
                    nextItem = conversions["USVString"](nextItem, {
                      context:
                        "Failed to construct 'URLSearchParams': parameter 1" + " sequence" + "'s element" + "'s element"
                    });

                    V.push(nextItem);
                  }
                  nextItem = V;
                }

                V.push(nextItem);
              }
              curArg = V;
            }
          } else {
            if (!utils.isObject(curArg)) {
              throw new TypeError(
                "Failed to construct 'URLSearchParams': parameter 1" + " record" + " is not an object."
              );
            } else {
              const result = Object.create(null);
              for (const key of Reflect.ownKeys(curArg)) {
                const desc = Object.getOwnPropertyDescriptor(curArg, key);
                if (desc && desc.enumerable) {
                  let typedKey = key;
                  let typedValue = curArg[key];

                  typedKey = conversions["USVString"](typedKey, {
                    context: "Failed to construct 'URLSearchParams': parameter 1" + " record" + "'s key"
                  });

                  typedValue = conversions["USVString"](typedValue, {
                    context: "Failed to construct 'URLSearchParams': parameter 1" + " record" + "'s value"
                  });

                  result[typedKey] = typedValue;
                }
              }
              curArg = result;
            }
          }
        } else {
          curArg = conversions["USVString"](curArg, { context: "Failed to construct 'URLSearchParams': parameter 1" });
        }
      } else {
        curArg = "";
      }
      args.push(curArg);
    }
    return iface.setup(Object.create(new.target.prototype), args);
  }

  append(name, value) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    if (arguments.length < 2) {
      throw new TypeError(
        "Failed to execute 'append' on 'URLSearchParams': 2 arguments required, but only " +
          arguments.length +
          " present."
      );
    }
    const args = [];
    {
      let curArg = arguments[0];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'append' on 'URLSearchParams': parameter 1"
      });
      args.push(curArg);
    }
    {
      let curArg = arguments[1];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'append' on 'URLSearchParams': parameter 2"
      });
      args.push(curArg);
    }
    return this[impl].append(...args);
  }

  delete(name) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    if (arguments.length < 1) {
      throw new TypeError(
        "Failed to execute 'delete' on 'URLSearchParams': 1 argument required, but only " +
          arguments.length +
          " present."
      );
    }
    const args = [];
    {
      let curArg = arguments[0];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'delete' on 'URLSearchParams': parameter 1"
      });
      args.push(curArg);
    }
    return this[impl].delete(...args);
  }

  get(name) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    if (arguments.length < 1) {
      throw new TypeError(
        "Failed to execute 'get' on 'URLSearchParams': 1 argument required, but only " + arguments.length + " present."
      );
    }
    const args = [];
    {
      let curArg = arguments[0];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'get' on 'URLSearchParams': parameter 1"
      });
      args.push(curArg);
    }
    return this[impl].get(...args);
  }

  getAll(name) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    if (arguments.length < 1) {
      throw new TypeError(
        "Failed to execute 'getAll' on 'URLSearchParams': 1 argument required, but only " +
          arguments.length +
          " present."
      );
    }
    const args = [];
    {
      let curArg = arguments[0];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'getAll' on 'URLSearchParams': parameter 1"
      });
      args.push(curArg);
    }
    return utils.tryWrapperForImpl(this[impl].getAll(...args));
  }

  has(name) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    if (arguments.length < 1) {
      throw new TypeError(
        "Failed to execute 'has' on 'URLSearchParams': 1 argument required, but only " + arguments.length + " present."
      );
    }
    const args = [];
    {
      let curArg = arguments[0];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'has' on 'URLSearchParams': parameter 1"
      });
      args.push(curArg);
    }
    return this[impl].has(...args);
  }

  set(name, value) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    if (arguments.length < 2) {
      throw new TypeError(
        "Failed to execute 'set' on 'URLSearchParams': 2 arguments required, but only " + arguments.length + " present."
      );
    }
    const args = [];
    {
      let curArg = arguments[0];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'set' on 'URLSearchParams': parameter 1"
      });
      args.push(curArg);
    }
    {
      let curArg = arguments[1];
      curArg = conversions["USVString"](curArg, {
        context: "Failed to execute 'set' on 'URLSearchParams': parameter 2"
      });
      args.push(curArg);
    }
    return this[impl].set(...args);
  }

  sort() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl].sort();
  }

  toString() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }

    return this[impl].toString();
  }

  keys() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }
    return module.exports.createDefaultIterator(this, "key");
  }

  values() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }
    return module.exports.createDefaultIterator(this, "value");
  }

  entries() {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }
    return module.exports.createDefaultIterator(this, "key+value");
  }

  forEach(callback) {
    if (!this || !module.exports.is(this)) {
      throw new TypeError("Illegal invocation");
    }
    if (arguments.length < 1) {
      throw new TypeError("Failed to execute 'forEach' on 'iterable': 1 argument required, " + "but only 0 present.");
    }
    if (typeof callback !== "function") {
      throw new TypeError(
        "Failed to execute 'forEach' on 'iterable': The callback provided " + "as parameter 1 is not a function."
      );
    }
    const thisArg = arguments[1];
    let pairs = Array.from(this[impl]);
    let i = 0;
    while (i < pairs.length) {
      const [key, value] = pairs[i].map(utils.tryWrapperForImpl);
      callback.call(thisArg, value, key, this);
      pairs = Array.from(this[impl]);
      i++;
    }
  }
}
Object.defineProperties(URLSearchParams.prototype, {
  append: { enumerable: true },
  delete: { enumerable: true },
  get: { enumerable: true },
  getAll: { enumerable: true },
  has: { enumerable: true },
  set: { enumerable: true },
  sort: { enumerable: true },
  toString: { enumerable: true },
  keys: { enumerable: true },
  values: { enumerable: true },
  entries: { enumerable: true },
  forEach: { enumerable: true },
  [Symbol.toStringTag]: { value: "URLSearchParams", configurable: true },
  [Symbol.iterator]: { value: URLSearchParams.prototype.entries, configurable: true, writable: true }
});
const iface = {
  // When an interface-module that implements this interface as a mixin is loaded, it will append its own `.is()`
  // method into this array. It allows objects that directly implements *those* interfaces to be recognized as
  // implementing this mixin interface.
  _mixedIntoPredicates: [],
  is(obj) {
    if (obj) {
      if (utils.hasOwn(obj, impl) && obj[impl] instanceof Impl.implementation) {
        return true;
      }
      for (const isMixedInto of module.exports._mixedIntoPredicates) {
        if (isMixedInto(obj)) {
          return true;
        }
      }
    }
    return false;
  },
  isImpl(obj) {
    if (obj) {
      if (obj instanceof Impl.implementation) {
        return true;
      }

      const wrapper = utils.wrapperForImpl(obj);
      for (const isMixedInto of module.exports._mixedIntoPredicates) {
        if (isMixedInto(wrapper)) {
          return true;
        }
      }
    }
    return false;
  },
  convert(obj, { context = "The provided value" } = {}) {
    if (module.exports.is(obj)) {
      return utils.implForWrapper(obj);
    }
    throw new TypeError(`${context} is not of type 'URLSearchParams'.`);
  },

  createDefaultIterator(target, kind) {
    const iterator = Object.create(IteratorPrototype);
    Object.defineProperty(iterator, utils.iterInternalSymbol, {
      value: { target, kind, index: 0 },
      configurable: true
    });
    return iterator;
  },

  create(constructorArgs, privateData) {
    let obj = Object.create(URLSearchParams.prototype);
    obj = this.setup(obj, constructorArgs, privateData);
    return obj;
  },
  createImpl(constructorArgs, privateData) {
    let obj = Object.create(URLSearchParams.prototype);
    obj = this.setup(obj, constructorArgs, privateData);
    return utils.implForWrapper(obj);
  },
  _internalSetup(obj) {},
  setup(obj, constructorArgs, privateData) {
    if (!privateData) privateData = {};

    privateData.wrapper = obj;

    this._internalSetup(obj);
    Object.defineProperty(obj, impl, {
      value: new Impl.implementation(constructorArgs, privateData),
      configurable: true
    });

    obj[impl][utils.wrapperSymbol] = obj;
    if (Impl.init) {
      Impl.init(obj[impl], privateData);
    }
    return obj;
  },
  interface: URLSearchParams,
  expose: {
    Window: { URLSearchParams },
    Worker: { URLSearchParams }
  }
}; // iface
module.exports = iface;

const Impl = __webpack_require__(/*! ./URLSearchParams-impl.js */ "./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams-impl.js");


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/infra.js":
/*!*************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/infra.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function isASCIIDigit(c) {
  return c >= 0x30 && c <= 0x39;
}

function isASCIIAlpha(c) {
  return (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A);
}

function isASCIIAlphanumeric(c) {
  return isASCIIAlpha(c) || isASCIIDigit(c);
}

function isASCIIHex(c) {
  return isASCIIDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);
}

module.exports = {
  isASCIIDigit,
  isASCIIAlpha,
  isASCIIAlphanumeric,
  isASCIIHex
};


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/public-api.js":
/*!******************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/public-api.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.URL = __webpack_require__(/*! ./URL */ "./node_modules/universal-url/node_modules/whatwg-url/lib/URL.js").interface;
exports.URLSearchParams = __webpack_require__(/*! ./URLSearchParams */ "./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams.js").interface;

exports.parseURL = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").parseURL;
exports.basicURLParse = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").basicURLParse;
exports.serializeURL = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").serializeURL;
exports.serializeHost = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").serializeHost;
exports.serializeInteger = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").serializeInteger;
exports.serializeURLOrigin = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").serializeURLOrigin;
exports.setTheUsername = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").setTheUsername;
exports.setThePassword = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").setThePassword;
exports.cannotHaveAUsernamePasswordPort = __webpack_require__(/*! ./url-state-machine */ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js").cannotHaveAUsernamePasswordPort;

exports.percentDecode = __webpack_require__(/*! ./urlencoded */ "./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js").percentDecode;


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/url-state-machine.js ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {
const punycode = __webpack_require__(/*! punycode */ "./node_modules/node-libs-browser/node_modules/punycode/punycode.js");
const tr46 = __webpack_require__(/*! tr46 */ "./node_modules/tr46/index.js");

const infra = __webpack_require__(/*! ./infra */ "./node_modules/universal-url/node_modules/whatwg-url/lib/infra.js");
const { percentEncode, percentDecode } = __webpack_require__(/*! ./urlencoded */ "./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js");

const specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

const failure = Symbol("failure");

function countSymbols(str) {
  return punycode.ucs2.decode(str).length;
}

function at(input, idx) {
  const c = input[idx];
  return isNaN(c) ? undefined : String.fromCodePoint(c);
}

function isSingleDot(buffer) {
  return buffer === "." || buffer.toLowerCase() === "%2e";
}

function isDoubleDot(buffer) {
  buffer = buffer.toLowerCase();
  return buffer === ".." || buffer === "%2e." || buffer === ".%2e" || buffer === "%2e%2e";
}

function isWindowsDriveLetterCodePoints(cp1, cp2) {
  return infra.isASCIIAlpha(cp1) && (cp2 === 58 || cp2 === 124);
}

function isWindowsDriveLetterString(string) {
  return string.length === 2 && infra.isASCIIAlpha(string.codePointAt(0)) && (string[1] === ":" || string[1] === "|");
}

function isNormalizedWindowsDriveLetterString(string) {
  return string.length === 2 && infra.isASCIIAlpha(string.codePointAt(0)) && string[1] === ":";
}

function containsForbiddenHostCodePoint(string) {
  return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|\?|@|\[|\\|\]/) !== -1;
}

function containsForbiddenHostCodePointExcludingPercent(string) {
  return string.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|\?|@|\[|\\|\]/) !== -1;
}

function isSpecialScheme(scheme) {
  return specialSchemes[scheme] !== undefined;
}

function isSpecial(url) {
  return isSpecialScheme(url.scheme);
}

function isNotSpecial(url) {
  return !isSpecialScheme(url.scheme);
}

function defaultPort(scheme) {
  return specialSchemes[scheme];
}

function utf8PercentEncode(c) {
  const buf = Buffer.from(c);

  let str = "";

  for (let i = 0; i < buf.length; ++i) {
    str += percentEncode(buf[i]);
  }

  return str;
}

function isC0ControlPercentEncode(c) {
  return c <= 0x1F || c > 0x7E;
}

const extraUserinfoPercentEncodeSet =
  new Set([47, 58, 59, 61, 64, 91, 92, 93, 94, 124]);
function isUserinfoPercentEncode(c) {
  return isPathPercentEncode(c) || extraUserinfoPercentEncodeSet.has(c);
}

const extraFragmentPercentEncodeSet = new Set([32, 34, 60, 62, 96]);
function isFragmentPercentEncode(c) {
  return isC0ControlPercentEncode(c) || extraFragmentPercentEncodeSet.has(c);
}

const extraPathPercentEncodeSet = new Set([35, 63, 123, 125]);
function isPathPercentEncode(c) {
  return isFragmentPercentEncode(c) || extraPathPercentEncodeSet.has(c);
}

function percentEncodeChar(c, encodeSetPredicate) {
  const cStr = String.fromCodePoint(c);

  if (encodeSetPredicate(c)) {
    return utf8PercentEncode(cStr);
  }

  return cStr;
}

function parseIPv4Number(input) {
  let R = 10;

  if (input.length >= 2 && input.charAt(0) === "0" && input.charAt(1).toLowerCase() === "x") {
    input = input.substring(2);
    R = 16;
  } else if (input.length >= 2 && input.charAt(0) === "0") {
    input = input.substring(1);
    R = 8;
  }

  if (input === "") {
    return 0;
  }

  let regex = /[^0-7]/;
  if (R === 10) {
    regex = /[^0-9]/;
  }
  if (R === 16) {
    regex = /[^0-9A-Fa-f]/;
  }

  if (regex.test(input)) {
    return failure;
  }

  return parseInt(input, R);
}

function parseIPv4(input) {
  const parts = input.split(".");
  if (parts[parts.length - 1] === "") {
    if (parts.length > 1) {
      parts.pop();
    }
  }

  if (parts.length > 4) {
    return input;
  }

  const numbers = [];
  for (const part of parts) {
    if (part === "") {
      return input;
    }
    const n = parseIPv4Number(part);
    if (n === failure) {
      return input;
    }

    numbers.push(n);
  }

  for (let i = 0; i < numbers.length - 1; ++i) {
    if (numbers[i] > 255) {
      return failure;
    }
  }
  if (numbers[numbers.length - 1] >= Math.pow(256, 5 - numbers.length)) {
    return failure;
  }

  let ipv4 = numbers.pop();
  let counter = 0;

  for (const n of numbers) {
    ipv4 += n * Math.pow(256, 3 - counter);
    ++counter;
  }

  return ipv4;
}

function serializeIPv4(address) {
  let output = "";
  let n = address;

  for (let i = 1; i <= 4; ++i) {
    output = String(n % 256) + output;
    if (i !== 4) {
      output = "." + output;
    }
    n = Math.floor(n / 256);
  }

  return output;
}

function parseIPv6(input) {
  const address = [0, 0, 0, 0, 0, 0, 0, 0];
  let pieceIndex = 0;
  let compress = null;
  let pointer = 0;

  input = punycode.ucs2.decode(input);

  if (input[pointer] === 58) {
    if (input[pointer + 1] !== 58) {
      return failure;
    }

    pointer += 2;
    ++pieceIndex;
    compress = pieceIndex;
  }

  while (pointer < input.length) {
    if (pieceIndex === 8) {
      return failure;
    }

    if (input[pointer] === 58) {
      if (compress !== null) {
        return failure;
      }
      ++pointer;
      ++pieceIndex;
      compress = pieceIndex;
      continue;
    }

    let value = 0;
    let length = 0;

    while (length < 4 && infra.isASCIIHex(input[pointer])) {
      value = value * 0x10 + parseInt(at(input, pointer), 16);
      ++pointer;
      ++length;
    }

    if (input[pointer] === 46) {
      if (length === 0) {
        return failure;
      }

      pointer -= length;

      if (pieceIndex > 6) {
        return failure;
      }

      let numbersSeen = 0;

      while (input[pointer] !== undefined) {
        let ipv4Piece = null;

        if (numbersSeen > 0) {
          if (input[pointer] === 46 && numbersSeen < 4) {
            ++pointer;
          } else {
            return failure;
          }
        }

        if (!infra.isASCIIDigit(input[pointer])) {
          return failure;
        }

        while (infra.isASCIIDigit(input[pointer])) {
          const number = parseInt(at(input, pointer));
          if (ipv4Piece === null) {
            ipv4Piece = number;
          } else if (ipv4Piece === 0) {
            return failure;
          } else {
            ipv4Piece = ipv4Piece * 10 + number;
          }
          if (ipv4Piece > 255) {
            return failure;
          }
          ++pointer;
        }

        address[pieceIndex] = address[pieceIndex] * 0x100 + ipv4Piece;

        ++numbersSeen;

        if (numbersSeen === 2 || numbersSeen === 4) {
          ++pieceIndex;
        }
      }

      if (numbersSeen !== 4) {
        return failure;
      }

      break;
    } else if (input[pointer] === 58) {
      ++pointer;
      if (input[pointer] === undefined) {
        return failure;
      }
    } else if (input[pointer] !== undefined) {
      return failure;
    }

    address[pieceIndex] = value;
    ++pieceIndex;
  }

  if (compress !== null) {
    let swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex !== 0 && swaps > 0) {
      const temp = address[compress + swaps - 1];
      address[compress + swaps - 1] = address[pieceIndex];
      address[pieceIndex] = temp;
      --pieceIndex;
      --swaps;
    }
  } else if (compress === null && pieceIndex !== 8) {
    return failure;
  }

  return address;
}

function serializeIPv6(address) {
  let output = "";
  const seqResult = findLongestZeroSequence(address);
  const compress = seqResult.idx;
  let ignore0 = false;

  for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
    if (ignore0 && address[pieceIndex] === 0) {
      continue;
    } else if (ignore0) {
      ignore0 = false;
    }

    if (compress === pieceIndex) {
      const separator = pieceIndex === 0 ? "::" : ":";
      output += separator;
      ignore0 = true;
      continue;
    }

    output += address[pieceIndex].toString(16);

    if (pieceIndex !== 7) {
      output += ":";
    }
  }

  return output;
}

function parseHost(input, isNotSpecialArg = false) {
  if (input[0] === "[") {
    if (input[input.length - 1] !== "]") {
      return failure;
    }

    return parseIPv6(input.substring(1, input.length - 1));
  }

  if (isNotSpecialArg) {
    return parseOpaqueHost(input);
  }

  const domain = percentDecode(Buffer.from(input)).toString();
  const asciiDomain = domainToASCII(domain);
  if (asciiDomain === failure) {
    return failure;
  }

  if (containsForbiddenHostCodePoint(asciiDomain)) {
    return failure;
  }

  const ipv4Host = parseIPv4(asciiDomain);
  if (typeof ipv4Host === "number" || ipv4Host === failure) {
    return ipv4Host;
  }

  return asciiDomain;
}

function parseOpaqueHost(input) {
  if (containsForbiddenHostCodePointExcludingPercent(input)) {
    return failure;
  }

  let output = "";
  const decoded = punycode.ucs2.decode(input);
  for (let i = 0; i < decoded.length; ++i) {
    output += percentEncodeChar(decoded[i], isC0ControlPercentEncode);
  }
  return output;
}

function findLongestZeroSequence(arr) {
  let maxIdx = null;
  let maxLen = 1; // only find elements > 1
  let currStart = null;
  let currLen = 0;

  for (let i = 0; i < arr.length; ++i) {
    if (arr[i] !== 0) {
      if (currLen > maxLen) {
        maxIdx = currStart;
        maxLen = currLen;
      }

      currStart = null;
      currLen = 0;
    } else {
      if (currStart === null) {
        currStart = i;
      }
      ++currLen;
    }
  }

  // if trailing zeros
  if (currLen > maxLen) {
    maxIdx = currStart;
    maxLen = currLen;
  }

  return {
    idx: maxIdx,
    len: maxLen
  };
}

function serializeHost(host) {
  if (typeof host === "number") {
    return serializeIPv4(host);
  }

  // IPv6 serializer
  if (host instanceof Array) {
    return "[" + serializeIPv6(host) + "]";
  }

  return host;
}

function domainToASCII(domain, beStrict = false) {
  const result = tr46.toASCII(domain, {
    checkBidi: true,
    checkHyphens: false,
    checkJoiners: true,
    useSTD3ASCIIRules: beStrict,
    verifyDNSLength: beStrict
  });
  if (result === null) {
    return failure;
  }
  return result;
}

function trimControlChars(url) {
  return url.replace(/^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/g, "");
}

function trimTabAndNewline(url) {
  return url.replace(/\u0009|\u000A|\u000D/g, "");
}

function shortenPath(url) {
  const { path } = url;
  if (path.length === 0) {
    return;
  }
  if (url.scheme === "file" && path.length === 1 && isNormalizedWindowsDriveLetter(path[0])) {
    return;
  }

  path.pop();
}

function includesCredentials(url) {
  return url.username !== "" || url.password !== "";
}

function cannotHaveAUsernamePasswordPort(url) {
  return url.host === null || url.host === "" || url.cannotBeABaseURL || url.scheme === "file";
}

function isNormalizedWindowsDriveLetter(string) {
  return /^[A-Za-z]:$/.test(string);
}

function URLStateMachine(input, base, encodingOverride, url, stateOverride) {
  this.pointer = 0;
  this.input = input;
  this.base = base || null;
  this.encodingOverride = encodingOverride || "utf-8";
  this.stateOverride = stateOverride;
  this.url = url;
  this.failure = false;
  this.parseError = false;

  if (!this.url) {
    this.url = {
      scheme: "",
      username: "",
      password: "",
      host: null,
      port: null,
      path: [],
      query: null,
      fragment: null,

      cannotBeABaseURL: false
    };

    const res = trimControlChars(this.input);
    if (res !== this.input) {
      this.parseError = true;
    }
    this.input = res;
  }

  const res = trimTabAndNewline(this.input);
  if (res !== this.input) {
    this.parseError = true;
  }
  this.input = res;

  this.state = stateOverride || "scheme start";

  this.buffer = "";
  this.atFlag = false;
  this.arrFlag = false;
  this.passwordTokenSeenFlag = false;

  this.input = punycode.ucs2.decode(this.input);

  for (; this.pointer <= this.input.length; ++this.pointer) {
    const c = this.input[this.pointer];
    const cStr = isNaN(c) ? undefined : String.fromCodePoint(c);

    // exec state machine
    const ret = this["parse " + this.state](c, cStr);
    if (!ret) {
      break; // terminate algorithm
    } else if (ret === failure) {
      this.failure = true;
      break;
    }
  }
}

URLStateMachine.prototype["parse scheme start"] = function parseSchemeStart(c, cStr) {
  if (infra.isASCIIAlpha(c)) {
    this.buffer += cStr.toLowerCase();
    this.state = "scheme";
  } else if (!this.stateOverride) {
    this.state = "no scheme";
    --this.pointer;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

URLStateMachine.prototype["parse scheme"] = function parseScheme(c, cStr) {
  if (infra.isASCIIAlphanumeric(c) || c === 43 || c === 45 || c === 46) {
    this.buffer += cStr.toLowerCase();
  } else if (c === 58) {
    if (this.stateOverride) {
      if (isSpecial(this.url) && !isSpecialScheme(this.buffer)) {
        return false;
      }

      if (!isSpecial(this.url) && isSpecialScheme(this.buffer)) {
        return false;
      }

      if ((includesCredentials(this.url) || this.url.port !== null) && this.buffer === "file") {
        return false;
      }

      if (this.url.scheme === "file" && (this.url.host === "" || this.url.host === null)) {
        return false;
      }
    }
    this.url.scheme = this.buffer;
    if (this.stateOverride) {
      if (this.url.port === defaultPort(this.url.scheme)) {
        this.url.port = null;
      }
      return false;
    }
    this.buffer = "";
    if (this.url.scheme === "file") {
      if (this.input[this.pointer + 1] !== 47 || this.input[this.pointer + 2] !== 47) {
        this.parseError = true;
      }
      this.state = "file";
    } else if (isSpecial(this.url) && this.base !== null && this.base.scheme === this.url.scheme) {
      this.state = "special relative or authority";
    } else if (isSpecial(this.url)) {
      this.state = "special authority slashes";
    } else if (this.input[this.pointer + 1] === 47) {
      this.state = "path or authority";
      ++this.pointer;
    } else {
      this.url.cannotBeABaseURL = true;
      this.url.path.push("");
      this.state = "cannot-be-a-base-URL path";
    }
  } else if (!this.stateOverride) {
    this.buffer = "";
    this.state = "no scheme";
    this.pointer = -1;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

URLStateMachine.prototype["parse no scheme"] = function parseNoScheme(c) {
  if (this.base === null || (this.base.cannotBeABaseURL && c !== 35)) {
    return failure;
  } else if (this.base.cannotBeABaseURL && c === 35) {
    this.url.scheme = this.base.scheme;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
    this.url.fragment = "";
    this.url.cannotBeABaseURL = true;
    this.state = "fragment";
  } else if (this.base.scheme === "file") {
    this.state = "file";
    --this.pointer;
  } else {
    this.state = "relative";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special relative or authority"] = function parseSpecialRelativeOrAuthority(c) {
  if (c === 47 && this.input[this.pointer + 1] === 47) {
    this.state = "special authority ignore slashes";
    ++this.pointer;
  } else {
    this.parseError = true;
    this.state = "relative";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse path or authority"] = function parsePathOrAuthority(c) {
  if (c === 47) {
    this.state = "authority";
  } else {
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse relative"] = function parseRelative(c) {
  this.url.scheme = this.base.scheme;
  if (isNaN(c)) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
  } else if (c === 47) {
    this.state = "relative slash";
  } else if (c === 63) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = "";
    this.state = "query";
  } else if (c === 35) {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice();
    this.url.query = this.base.query;
    this.url.fragment = "";
    this.state = "fragment";
  } else if (isSpecial(this.url) && c === 92) {
    this.parseError = true;
    this.state = "relative slash";
  } else {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.url.path = this.base.path.slice(0, this.base.path.length - 1);

    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse relative slash"] = function parseRelativeSlash(c) {
  if (isSpecial(this.url) && (c === 47 || c === 92)) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "special authority ignore slashes";
  } else if (c === 47) {
    this.state = "authority";
  } else {
    this.url.username = this.base.username;
    this.url.password = this.base.password;
    this.url.host = this.base.host;
    this.url.port = this.base.port;
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special authority slashes"] = function parseSpecialAuthoritySlashes(c) {
  if (c === 47 && this.input[this.pointer + 1] === 47) {
    this.state = "special authority ignore slashes";
    ++this.pointer;
  } else {
    this.parseError = true;
    this.state = "special authority ignore slashes";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse special authority ignore slashes"] = function parseSpecialAuthorityIgnoreSlashes(c) {
  if (c !== 47 && c !== 92) {
    this.state = "authority";
    --this.pointer;
  } else {
    this.parseError = true;
  }

  return true;
};

URLStateMachine.prototype["parse authority"] = function parseAuthority(c, cStr) {
  if (c === 64) {
    this.parseError = true;
    if (this.atFlag) {
      this.buffer = "%40" + this.buffer;
    }
    this.atFlag = true;

    // careful, this is based on buffer and has its own pointer (this.pointer != pointer) and inner chars
    const len = countSymbols(this.buffer);
    for (let pointer = 0; pointer < len; ++pointer) {
      const codePoint = this.buffer.codePointAt(pointer);

      if (codePoint === 58 && !this.passwordTokenSeenFlag) {
        this.passwordTokenSeenFlag = true;
        continue;
      }
      const encodedCodePoints = percentEncodeChar(codePoint, isUserinfoPercentEncode);
      if (this.passwordTokenSeenFlag) {
        this.url.password += encodedCodePoints;
      } else {
        this.url.username += encodedCodePoints;
      }
    }
    this.buffer = "";
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92)) {
    if (this.atFlag && this.buffer === "") {
      this.parseError = true;
      return failure;
    }
    this.pointer -= countSymbols(this.buffer) + 1;
    this.buffer = "";
    this.state = "host";
  } else {
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse hostname"] =
URLStateMachine.prototype["parse host"] = function parseHostName(c, cStr) {
  if (this.stateOverride && this.url.scheme === "file") {
    --this.pointer;
    this.state = "file host";
  } else if (c === 58 && !this.arrFlag) {
    if (this.buffer === "") {
      this.parseError = true;
      return failure;
    }

    const host = parseHost(this.buffer, isNotSpecial(this.url));
    if (host === failure) {
      return failure;
    }

    this.url.host = host;
    this.buffer = "";
    this.state = "port";
    if (this.stateOverride === "hostname") {
      return false;
    }
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92)) {
    --this.pointer;
    if (isSpecial(this.url) && this.buffer === "") {
      this.parseError = true;
      return failure;
    } else if (this.stateOverride && this.buffer === "" &&
               (includesCredentials(this.url) || this.url.port !== null)) {
      this.parseError = true;
      return false;
    }

    const host = parseHost(this.buffer, isNotSpecial(this.url));
    if (host === failure) {
      return failure;
    }

    this.url.host = host;
    this.buffer = "";
    this.state = "path start";
    if (this.stateOverride) {
      return false;
    }
  } else {
    if (c === 91) {
      this.arrFlag = true;
    } else if (c === 93) {
      this.arrFlag = false;
    }
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse port"] = function parsePort(c, cStr) {
  if (infra.isASCIIDigit(c)) {
    this.buffer += cStr;
  } else if (isNaN(c) || c === 47 || c === 63 || c === 35 ||
             (isSpecial(this.url) && c === 92) ||
             this.stateOverride) {
    if (this.buffer !== "") {
      const port = parseInt(this.buffer);
      if (port > Math.pow(2, 16) - 1) {
        this.parseError = true;
        return failure;
      }
      this.url.port = port === defaultPort(this.url.scheme) ? null : port;
      this.buffer = "";
    }
    if (this.stateOverride) {
      return false;
    }
    this.state = "path start";
    --this.pointer;
  } else {
    this.parseError = true;
    return failure;
  }

  return true;
};

const fileOtherwiseCodePoints = new Set([47, 92, 63, 35]);

function startsWithWindowsDriveLetter(input, pointer) {
  const length = input.length - pointer;
  return length >= 2 &&
    isWindowsDriveLetterCodePoints(input[pointer], input[pointer + 1]) &&
    (length === 2 || fileOtherwiseCodePoints.has(input[pointer + 2]));
}

URLStateMachine.prototype["parse file"] = function parseFile(c) {
  this.url.scheme = "file";

  if (c === 47 || c === 92) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "file slash";
  } else if (this.base !== null && this.base.scheme === "file") {
    if (isNaN(c)) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = this.base.query;
    } else if (c === 63) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = "";
      this.state = "query";
    } else if (c === 35) {
      this.url.host = this.base.host;
      this.url.path = this.base.path.slice();
      this.url.query = this.base.query;
      this.url.fragment = "";
      this.state = "fragment";
    } else {
      if (!startsWithWindowsDriveLetter(this.input, this.pointer)) {
        this.url.host = this.base.host;
        this.url.path = this.base.path.slice();
        shortenPath(this.url);
      } else {
        this.parseError = true;
      }

      this.state = "path";
      --this.pointer;
    }
  } else {
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse file slash"] = function parseFileSlash(c) {
  if (c === 47 || c === 92) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "file host";
  } else {
    if (this.base !== null && this.base.scheme === "file" &&
        !startsWithWindowsDriveLetter(this.input, this.pointer)) {
      if (isNormalizedWindowsDriveLetterString(this.base.path[0])) {
        this.url.path.push(this.base.path[0]);
      } else {
        this.url.host = this.base.host;
      }
    }
    this.state = "path";
    --this.pointer;
  }

  return true;
};

URLStateMachine.prototype["parse file host"] = function parseFileHost(c, cStr) {
  if (isNaN(c) || c === 47 || c === 92 || c === 63 || c === 35) {
    --this.pointer;
    if (!this.stateOverride && isWindowsDriveLetterString(this.buffer)) {
      this.parseError = true;
      this.state = "path";
    } else if (this.buffer === "") {
      this.url.host = "";
      if (this.stateOverride) {
        return false;
      }
      this.state = "path start";
    } else {
      let host = parseHost(this.buffer, isNotSpecial(this.url));
      if (host === failure) {
        return failure;
      }
      if (host === "localhost") {
        host = "";
      }
      this.url.host = host;

      if (this.stateOverride) {
        return false;
      }

      this.buffer = "";
      this.state = "path start";
    }
  } else {
    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse path start"] = function parsePathStart(c) {
  if (isSpecial(this.url)) {
    if (c === 92) {
      this.parseError = true;
    }
    this.state = "path";

    if (c !== 47 && c !== 92) {
      --this.pointer;
    }
  } else if (!this.stateOverride && c === 63) {
    this.url.query = "";
    this.state = "query";
  } else if (!this.stateOverride && c === 35) {
    this.url.fragment = "";
    this.state = "fragment";
  } else if (c !== undefined) {
    this.state = "path";
    if (c !== 47) {
      --this.pointer;
    }
  }

  return true;
};

URLStateMachine.prototype["parse path"] = function parsePath(c) {
  if (isNaN(c) || c === 47 || (isSpecial(this.url) && c === 92) ||
      (!this.stateOverride && (c === 63 || c === 35))) {
    if (isSpecial(this.url) && c === 92) {
      this.parseError = true;
    }

    if (isDoubleDot(this.buffer)) {
      shortenPath(this.url);
      if (c !== 47 && !(isSpecial(this.url) && c === 92)) {
        this.url.path.push("");
      }
    } else if (isSingleDot(this.buffer) && c !== 47 &&
               !(isSpecial(this.url) && c === 92)) {
      this.url.path.push("");
    } else if (!isSingleDot(this.buffer)) {
      if (this.url.scheme === "file" && this.url.path.length === 0 && isWindowsDriveLetterString(this.buffer)) {
        if (this.url.host !== "" && this.url.host !== null) {
          this.parseError = true;
          this.url.host = "";
        }
        this.buffer = this.buffer[0] + ":";
      }
      this.url.path.push(this.buffer);
    }
    this.buffer = "";
    if (this.url.scheme === "file" && (c === undefined || c === 63 || c === 35)) {
      while (this.url.path.length > 1 && this.url.path[0] === "") {
        this.parseError = true;
        this.url.path.shift();
      }
    }
    if (c === 63) {
      this.url.query = "";
      this.state = "query";
    }
    if (c === 35) {
      this.url.fragment = "";
      this.state = "fragment";
    }
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.

    if (c === 37 &&
      (!infra.isASCIIHex(this.input[this.pointer + 1]) ||
        !infra.isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.buffer += percentEncodeChar(c, isPathPercentEncode);
  }

  return true;
};

URLStateMachine.prototype["parse cannot-be-a-base-URL path"] = function parseCannotBeABaseURLPath(c) {
  if (c === 63) {
    this.url.query = "";
    this.state = "query";
  } else if (c === 35) {
    this.url.fragment = "";
    this.state = "fragment";
  } else {
    // TODO: Add: not a URL code point
    if (!isNaN(c) && c !== 37) {
      this.parseError = true;
    }

    if (c === 37 &&
        (!infra.isASCIIHex(this.input[this.pointer + 1]) ||
         !infra.isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    if (!isNaN(c)) {
      this.url.path[0] = this.url.path[0] + percentEncodeChar(c, isC0ControlPercentEncode);
    }
  }

  return true;
};

URLStateMachine.prototype["parse query"] = function parseQuery(c, cStr) {
  if (isNaN(c) || (!this.stateOverride && c === 35)) {
    if (!isSpecial(this.url) || this.url.scheme === "ws" || this.url.scheme === "wss") {
      this.encodingOverride = "utf-8";
    }

    const buffer = Buffer.from(this.buffer); // TODO: Use encoding override instead
    for (let i = 0; i < buffer.length; ++i) {
      if (buffer[i] < 0x21 ||
          buffer[i] > 0x7E ||
          buffer[i] === 0x22 || buffer[i] === 0x23 || buffer[i] === 0x3C || buffer[i] === 0x3E ||
          (buffer[i] === 0x27 && isSpecial(this.url))) {
        this.url.query += percentEncode(buffer[i]);
      } else {
        this.url.query += String.fromCodePoint(buffer[i]);
      }
    }

    this.buffer = "";
    if (c === 35) {
      this.url.fragment = "";
      this.state = "fragment";
    }
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.
    if (c === 37 &&
      (!infra.isASCIIHex(this.input[this.pointer + 1]) ||
        !infra.isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.buffer += cStr;
  }

  return true;
};

URLStateMachine.prototype["parse fragment"] = function parseFragment(c) {
  if (isNaN(c)) { // do nothing
  } else if (c === 0x0) {
    this.parseError = true;
  } else {
    // TODO: If c is not a URL code point and not "%", parse error.
    if (c === 37 &&
      (!infra.isASCIIHex(this.input[this.pointer + 1]) ||
        !infra.isASCIIHex(this.input[this.pointer + 2]))) {
      this.parseError = true;
    }

    this.url.fragment += percentEncodeChar(c, isFragmentPercentEncode);
  }

  return true;
};

function serializeURL(url, excludeFragment) {
  let output = url.scheme + ":";
  if (url.host !== null) {
    output += "//";

    if (url.username !== "" || url.password !== "") {
      output += url.username;
      if (url.password !== "") {
        output += ":" + url.password;
      }
      output += "@";
    }

    output += serializeHost(url.host);

    if (url.port !== null) {
      output += ":" + url.port;
    }
  } else if (url.host === null && url.scheme === "file") {
    output += "//";
  }

  if (url.cannotBeABaseURL) {
    output += url.path[0];
  } else {
    for (const string of url.path) {
      output += "/" + string;
    }
  }

  if (url.query !== null) {
    output += "?" + url.query;
  }

  if (!excludeFragment && url.fragment !== null) {
    output += "#" + url.fragment;
  }

  return output;
}

function serializeOrigin(tuple) {
  let result = tuple.scheme + "://";
  result += serializeHost(tuple.host);

  if (tuple.port !== null) {
    result += ":" + tuple.port;
  }

  return result;
}

module.exports.serializeURL = serializeURL;

module.exports.serializeURLOrigin = function (url) {
  // https://url.spec.whatwg.org/#concept-url-origin
  switch (url.scheme) {
    case "blob":
      try {
        return module.exports.serializeURLOrigin(module.exports.parseURL(url.path[0]));
      } catch (e) {
        // serializing an opaque origin returns "null"
        return "null";
      }
    case "ftp":
    case "http":
    case "https":
    case "ws":
    case "wss":
      return serializeOrigin({
        scheme: url.scheme,
        host: url.host,
        port: url.port
      });
    case "file":
      // The spec says:
      // > Unfortunate as it is, this is left as an exercise to the reader. When in doubt, return a new opaque origin.
      // Browsers tested so far:
      // - Chrome says "file://", but treats file: URLs as cross-origin for most (all?) purposes; see e.g.
      //   https://bugs.chromium.org/p/chromium/issues/detail?id=37586
      // - Firefox says "null", but treats file: URLs as same-origin sometimes based on directory stuff; see
      //   https://developer.mozilla.org/en-US/docs/Archive/Misc_top_level/Same-origin_policy_for_file:_URIs
      return "null";
    default:
      // serializing an opaque origin returns "null"
      return "null";
  }
};

module.exports.basicURLParse = function (input, options) {
  if (options === undefined) {
    options = {};
  }

  const usm = new URLStateMachine(input, options.baseURL, options.encodingOverride, options.url, options.stateOverride);
  if (usm.failure) {
    return null;
  }

  return usm.url;
};

module.exports.setTheUsername = function (url, username) {
  url.username = "";
  const decoded = punycode.ucs2.decode(username);
  for (let i = 0; i < decoded.length; ++i) {
    url.username += percentEncodeChar(decoded[i], isUserinfoPercentEncode);
  }
};

module.exports.setThePassword = function (url, password) {
  url.password = "";
  const decoded = punycode.ucs2.decode(password);
  for (let i = 0; i < decoded.length; ++i) {
    url.password += percentEncodeChar(decoded[i], isUserinfoPercentEncode);
  }
};

module.exports.serializeHost = serializeHost;

module.exports.cannotHaveAUsernamePasswordPort = cannotHaveAUsernamePasswordPort;

module.exports.serializeInteger = function (integer) {
  return String(integer);
};

module.exports.parseURL = function (input, options) {
  if (options === undefined) {
    options = {};
  }

  // We don't handle blobs, so this just delegates:
  return module.exports.basicURLParse(input, { baseURL: options.baseURL, encodingOverride: options.encodingOverride });
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../buffer/index.js */ "./node_modules/buffer/index.js").Buffer))

/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js":
/*!******************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {
const { isASCIIHex } = __webpack_require__(/*! ./infra */ "./node_modules/universal-url/node_modules/whatwg-url/lib/infra.js");

function strictlySplitByteSequence(buf, cp) {
  const list = [];
  let last = 0;
  let i = buf.indexOf(cp);
  while (i >= 0) {
    list.push(buf.slice(last, i));
    last = i + 1;
    i = buf.indexOf(cp, last);
  }
  if (last !== buf.length) {
    list.push(buf.slice(last));
  }
  return list;
}

function replaceByteInByteSequence(buf, from, to) {
  let i = buf.indexOf(from);
  while (i >= 0) {
    buf[i] = to;
    i = buf.indexOf(from, i + 1);
  }
  return buf;
}

function percentEncode(c) {
  let hex = c.toString(16).toUpperCase();
  if (hex.length === 1) {
    hex = "0" + hex;
  }

  return "%" + hex;
}

function percentDecode(input) {
  const output = Buffer.alloc(input.byteLength);
  let ptr = 0;
  for (let i = 0; i < input.length; ++i) {
    if (input[i] !== 37 || !isASCIIHex(input[i + 1]) || !isASCIIHex(input[i + 2])) {
      output[ptr++] = input[i];
    } else {
      output[ptr++] = parseInt(input.slice(i + 1, i + 3).toString(), 16);
      i += 2;
    }
  }
  return output.slice(0, ptr);
}

function parseUrlencoded(input) {
  const sequences = strictlySplitByteSequence(input, 38);
  const output = [];
  for (const bytes of sequences) {
    if (bytes.length === 0) {
      continue;
    }

    let name;
    let value;
    const indexOfEqual = bytes.indexOf(61);

    if (indexOfEqual >= 0) {
      name = bytes.slice(0, indexOfEqual);
      value = bytes.slice(indexOfEqual + 1);
    } else {
      name = bytes;
      value = Buffer.alloc(0);
    }

    name = replaceByteInByteSequence(Buffer.from(name), 43, 32);
    value = replaceByteInByteSequence(Buffer.from(value), 43, 32);

    output.push([percentDecode(name).toString(), percentDecode(value).toString()]);
  }
  return output;
}

function serializeUrlencodedByte(input) {
  let output = "";
  for (const byte of input) {
    if (byte === 32) {
      output += "+";
    } else if (byte === 42 ||
               byte === 45 ||
               byte === 46 ||
               (byte >= 48 && byte <= 57) ||
               (byte >= 65 && byte <= 90) ||
               byte === 95 ||
               (byte >= 97 && byte <= 122)) {
      output += String.fromCodePoint(byte);
    } else {
      output += percentEncode(byte);
    }
  }
  return output;
}

function serializeUrlencoded(tuples, encodingOverride = undefined) {
  let encoding = "utf-8";
  if (encodingOverride !== undefined) {
    encoding = encodingOverride;
  }

  let output = "";
  for (const [i, tuple] of tuples.entries()) {
    // TODO: handle encoding override
    const name = serializeUrlencodedByte(Buffer.from(tuple[0]));
    let value = tuple[1];
    if (tuple.length > 2 && tuple[2] !== undefined) {
      if (tuple[2] === "hidden" && name === "_charset_") {
        value = encoding;
      } else if (tuple[2] === "file") {
        // value is a File object
        value = value.name;
      }
    }
    value = serializeUrlencodedByte(Buffer.from(value));
    if (i !== 0) {
      output += "&";
    }
    output += `${name}=${value}`;
  }
  return output;
}

module.exports = {
  percentEncode,
  percentDecode,

  // application/x-www-form-urlencoded string parser
  parseUrlencoded(input) {
    return parseUrlencoded(Buffer.from(input));
  },

  // application/x-www-form-urlencoded serializer
  serializeUrlencoded
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../buffer/index.js */ "./node_modules/buffer/index.js").Buffer))

/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/utils.js":
/*!*************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/utils.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Returns "Type(value) is Object" in ES terminology.
function isObject(value) {
  return typeof value === "object" && value !== null || typeof value === "function";
}

function hasOwn(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

const getOwnPropertyDescriptors = typeof Object.getOwnPropertyDescriptors === "function" ?
  Object.getOwnPropertyDescriptors :
  // Polyfill exists until we require Node.js v8.x
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptors
  obj => {
    if (obj === undefined || obj === null) {
      throw new TypeError("Cannot convert undefined or null to object");
    }
    obj = Object(obj);
    const ownKeys = Reflect.ownKeys(obj);
    const descriptors = {};
    for (const key of ownKeys) {
      const descriptor = Reflect.getOwnPropertyDescriptor(obj, key);
      if (descriptor !== undefined) {
        Reflect.defineProperty(descriptors, key, {
          value: descriptor,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
    return descriptors;
  };

const wrapperSymbol = Symbol("wrapper");
const implSymbol = Symbol("impl");
const sameObjectCaches = Symbol("SameObject caches");

function getSameObject(wrapper, prop, creator) {
  if (!wrapper[sameObjectCaches]) {
    wrapper[sameObjectCaches] = Object.create(null);
  }

  if (prop in wrapper[sameObjectCaches]) {
    return wrapper[sameObjectCaches][prop];
  }

  wrapper[sameObjectCaches][prop] = creator();
  return wrapper[sameObjectCaches][prop];
}

function wrapperForImpl(impl) {
  return impl ? impl[wrapperSymbol] : null;
}

function implForWrapper(wrapper) {
  return wrapper ? wrapper[implSymbol] : null;
}

function tryWrapperForImpl(impl) {
  const wrapper = wrapperForImpl(impl);
  return wrapper ? wrapper : impl;
}

function tryImplForWrapper(wrapper) {
  const impl = implForWrapper(wrapper);
  return impl ? impl : wrapper;
}

const iterInternalSymbol = Symbol("internal");
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]()));

function isArrayIndexPropName(P) {
  if (typeof P !== "string") {
    return false;
  }
  const i = P >>> 0;
  if (i === Math.pow(2, 32) - 1) {
    return false;
  }
  const s = `${i}`;
  if (P !== s) {
    return false;
  }
  return true;
}

const supportsPropertyIndex = Symbol("supports property index");
const supportedPropertyIndices = Symbol("supported property indices");
const supportsPropertyName = Symbol("supports property name");
const supportedPropertyNames = Symbol("supported property names");
const indexedGet = Symbol("indexed property get");
const indexedSetNew = Symbol("indexed property set new");
const indexedSetExisting = Symbol("indexed property set existing");
const namedGet = Symbol("named property get");
const namedSetNew = Symbol("named property set new");
const namedSetExisting = Symbol("named property set existing");
const namedDelete = Symbol("named property delete");

module.exports = exports = {
  isObject,
  hasOwn,
  getOwnPropertyDescriptors,
  wrapperSymbol,
  implSymbol,
  getSameObject,
  wrapperForImpl,
  implForWrapper,
  tryWrapperForImpl,
  tryImplForWrapper,
  iterInternalSymbol,
  IteratorPrototype,
  isArrayIndexPropName,
  supportsPropertyIndex,
  supportedPropertyIndices,
  supportsPropertyName,
  supportedPropertyNames,
  indexedGet,
  indexedSetNew,
  indexedSetExisting,
  namedGet,
  namedSetNew,
  namedSetExisting,
  namedDelete
};


/***/ }),

/***/ "./node_modules/webidl-conversions/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/webidl-conversions/lib/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _(message, opts) {
    return `${opts && opts.context ? opts.context : "Value"} ${message}.`;
}

function type(V) {
    if (V === null) {
        return "Null";
    }
    switch (typeof V) {
        case "undefined":
            return "Undefined";
        case "boolean":
            return "Boolean";
        case "number":
            return "Number";
        case "string":
            return "String";
        case "symbol":
            return "Symbol";
        case "object":
            // Falls through
        case "function":
            // Falls through
        default:
            // Per ES spec, typeof returns an implemention-defined value that is not any of the existing ones for
            // uncallable non-standard exotic objects. Yet Type() which the Web IDL spec depends on returns Object for
            // such cases. So treat the default case as an object.
            return "Object";
    }
}

// Round x to the nearest integer, choosing the even integer if it lies halfway between two.
function evenRound(x) {
    // There are four cases for numbers with fractional part being .5:
    //
    // case |     x     | floor(x) | round(x) | expected | x <> 0 | x % 1 | x & 1 |   example
    //   1  |  2n + 0.5 |  2n      |  2n + 1  |  2n      |   >    |  0.5  |   0   |  0.5 ->  0
    //   2  |  2n + 1.5 |  2n + 1  |  2n + 2  |  2n + 2  |   >    |  0.5  |   1   |  1.5 ->  2
    //   3  | -2n - 0.5 | -2n - 1  | -2n      | -2n      |   <    | -0.5  |   0   | -0.5 ->  0
    //   4  | -2n - 1.5 | -2n - 2  | -2n - 1  | -2n - 2  |   <    | -0.5  |   1   | -1.5 -> -2
    // (where n is a non-negative integer)
    //
    // Branch here for cases 1 and 4
    if ((x > 0 && (x % 1) === +0.5 && (x & 1) === 0) ||
        (x < 0 && (x % 1) === -0.5 && (x & 1) === 1)) {
        return censorNegativeZero(Math.floor(x));
    }

    return censorNegativeZero(Math.round(x));
}

function integerPart(n) {
    return censorNegativeZero(Math.trunc(n));
}

function sign(x) {
    return x < 0 ? -1 : 1;
}

function modulo(x, y) {
    // https://tc39.github.io/ecma262/#eqn-modulo
    // Note that http://stackoverflow.com/a/4467559/3191 does NOT work for large modulos
    const signMightNotMatch = x % y;
    if (sign(y) !== sign(signMightNotMatch)) {
        return signMightNotMatch + y;
    }
    return signMightNotMatch;
}

function censorNegativeZero(x) {
    return x === 0 ? 0 : x;
}

function createIntegerConversion(bitLength, typeOpts) {
    const isSigned = !typeOpts.unsigned;

    let lowerBound;
    let upperBound;
    if (bitLength === 64) {
        upperBound = Math.pow(2, 53) - 1;
        lowerBound = !isSigned ? 0 : -Math.pow(2, 53) + 1;
    } else if (!isSigned) {
        lowerBound = 0;
        upperBound = Math.pow(2, bitLength) - 1;
    } else {
        lowerBound = -Math.pow(2, bitLength - 1);
        upperBound = Math.pow(2, bitLength - 1) - 1;
    }

    const twoToTheBitLength = Math.pow(2, bitLength);
    const twoToOneLessThanTheBitLength = Math.pow(2, bitLength - 1);

    return (V, opts) => {
        if (opts === undefined) {
            opts = {};
        }

        let x = +V;
        x = censorNegativeZero(x); // Spec discussion ongoing: https://github.com/heycam/webidl/issues/306

        if (opts.enforceRange) {
            if (!Number.isFinite(x)) {
                throw new TypeError(_("is not a finite number", opts));
            }

            x = integerPart(x);

            if (x < lowerBound || x > upperBound) {
                throw new TypeError(_(
                    `is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`, opts));
            }

            return x;
        }

        if (!Number.isNaN(x) && opts.clamp) {
            x = Math.min(Math.max(x, lowerBound), upperBound);
            x = evenRound(x);
            return x;
        }

        if (!Number.isFinite(x) || x === 0) {
            return 0;
        }
        x = integerPart(x);

        // Math.pow(2, 64) is not accurately representable in JavaScript, so try to avoid these per-spec operations if
        // possible. Hopefully it's an optimization for the non-64-bitLength cases too.
        if (x >= lowerBound && x <= upperBound) {
            return x;
        }

        // These will not work great for bitLength of 64, but oh well. See the README for more details.
        x = modulo(x, twoToTheBitLength);
        if (isSigned && x >= twoToOneLessThanTheBitLength) {
            return x - twoToTheBitLength;
        }
        return x;
    };
}

exports.any = V => {
    return V;
};

exports.void = function () {
    return undefined;
};

exports.boolean = function (val) {
    return !!val;
};

exports.byte = createIntegerConversion(8, { unsigned: false });
exports.octet = createIntegerConversion(8, { unsigned: true });

exports.short = createIntegerConversion(16, { unsigned: false });
exports["unsigned short"] = createIntegerConversion(16, { unsigned: true });

exports.long = createIntegerConversion(32, { unsigned: false });
exports["unsigned long"] = createIntegerConversion(32, { unsigned: true });

exports["long long"] = createIntegerConversion(64, { unsigned: false });
exports["unsigned long long"] = createIntegerConversion(64, { unsigned: true });

exports.double = (V, opts) => {
    const x = +V;

    if (!Number.isFinite(x)) {
        throw new TypeError(_("is not a finite floating-point value", opts));
    }

    return x;
};

exports["unrestricted double"] = V => {
    const x = +V;

    return x;
};

exports.float = (V, opts) => {
    const x = +V;

    if (!Number.isFinite(x)) {
        throw new TypeError(_("is not a finite floating-point value", opts));
    }

    if (Object.is(x, -0)) {
        return x;
    }

    const y = Math.fround(x);

    if (!Number.isFinite(y)) {
        throw new TypeError(_("is outside the range of a single-precision floating-point value", opts));
    }

    return y;
};

exports["unrestricted float"] = V => {
    const x = +V;

    if (isNaN(x)) {
        return x;
    }

    if (Object.is(x, -0)) {
        return x;
    }

    return Math.fround(x);
};

exports.DOMString = function (V, opts) {
    if (opts === undefined) {
        opts = {};
    }

    if (opts.treatNullAsEmptyString && V === null) {
        return "";
    }

    if (typeof V === "symbol") {
        throw new TypeError(_("is a symbol, which cannot be converted to a string", opts));
    }

    return String(V);
};

exports.ByteString = (V, opts) => {
    const x = exports.DOMString(V, opts);
    let c;
    for (let i = 0; (c = x.codePointAt(i)) !== undefined; ++i) {
        if (c > 255) {
            throw new TypeError(_("is not a valid ByteString", opts));
        }
    }

    return x;
};

exports.USVString = (V, opts) => {
    const S = exports.DOMString(V, opts);
    const n = S.length;
    const U = [];
    for (let i = 0; i < n; ++i) {
        const c = S.charCodeAt(i);
        if (c < 0xD800 || c > 0xDFFF) {
            U.push(String.fromCodePoint(c));
        } else if (0xDC00 <= c && c <= 0xDFFF) {
            U.push(String.fromCodePoint(0xFFFD));
        } else if (i === n - 1) {
            U.push(String.fromCodePoint(0xFFFD));
        } else {
            const d = S.charCodeAt(i + 1);
            if (0xDC00 <= d && d <= 0xDFFF) {
                const a = c & 0x3FF;
                const b = d & 0x3FF;
                U.push(String.fromCodePoint((2 << 15) + ((2 << 9) * a) + b));
                ++i;
            } else {
                U.push(String.fromCodePoint(0xFFFD));
            }
        }
    }

    return U.join("");
};

exports.object = (V, opts) => {
    if (type(V) !== "Object") {
        throw new TypeError(_("is not an object", opts));
    }

    return V;
};

// Not exported, but used in Function and VoidFunction.

// Neither Function nor VoidFunction is defined with [TreatNonObjectAsNull], so
// handling for that is omitted.
function convertCallbackFunction(V, opts) {
    if (typeof V !== "function") {
        throw new TypeError(_("is not a function", opts));
    }
    return V;
}

[
    Error,
    ArrayBuffer, // The IsDetachedBuffer abstract operation is not exposed in JS
    DataView, Int8Array, Int16Array, Int32Array, Uint8Array,
    Uint16Array, Uint32Array, Uint8ClampedArray, Float32Array, Float64Array
].forEach(func => {
    const name = func.name;
    const article = /^[AEIOU]/.test(name) ? "an" : "a";
    exports[name] = (V, opts) => {
        if (!(V instanceof func)) {
            throw new TypeError(_(`is not ${article} ${name} object`, opts));
        }

        return V;
    };
});

// Common definitions

exports.ArrayBufferView = (V, opts) => {
    if (!ArrayBuffer.isView(V)) {
        throw new TypeError(_("is not a view on an ArrayBuffer object", opts));
    }

    return V;
};

exports.BufferSource = (V, opts) => {
    if (!(ArrayBuffer.isView(V) || V instanceof ArrayBuffer)) {
        throw new TypeError(_("is not an ArrayBuffer object or a view on one", opts));
    }

    return V;
};

exports.DOMTimeStamp = exports["unsigned long long"];

exports.Function = convertCallbackFunction;

exports.VoidFunction = convertCallbackFunction;


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/Browser/AuthController.js":
/*!***************************************!*\
  !*** ./src/Browser/AuthController.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var utils = __webpack_require__(/*! ../utils */ "./src/utils.js");

var Service = __webpack_require__(/*! ../Service */ "./src/Service.js");

var LoginButton = __webpack_require__(/*! ./LoginButton */ "./src/Browser/LoginButton.js");

var AuthStates = __webpack_require__(/*! ./AuthStates */ "./src/Browser/AuthStates.js");

var Cookies = __webpack_require__(/*! ./CookieUtils */ "./src/Browser/CookieUtils.js");

var COOKIE_STRING = 'pryv-libjs-';
var QUERY_REGEXP = /[?#&]+([^=&]+)=([^&]*)/g;
var PRYV_REGEXP = /[?#&]+prYv([^=&]+)=([^&]*)/g;
/**
 * @private
 */

var AuthController =
/*#__PURE__*/
function () {
  function AuthController(settings, serviceInfoUrl, serviceCustomizations) {
    _classCallCheck(this, AuthController);

    this.stateChangeListners = [];
    this.settings = settings;
    this.serviceInfoUrl = serviceInfoUrl;
    this.serviceCustomizations = serviceCustomizations;

    if (!settings) {
      throw new Error('settings cannot be null');
    } // -- First of all get the button 


    if (this.settings.spanButtonID) {
      this.loginButton = new LoginButton(this);
      this.stateChangeListners.push(this.loginButton.onStateChange.bind(this.loginButton));
    } else {
      if (document) {
        console.log('WARNING: Pryv.Browser initialized with no spanButtonID');
      }
    }

    try {
      // Wrap all in a large try catch 
      // -- Check Error CallBack
      if (!this.settings.onStateChange) {
        throw new Error('Missing settings.onStateChange');
      }

      this.stateChangeListners.push(this.settings.onStateChange); // -- settings 

      if (!this.settings.authRequest) {
        throw new Error('Missing settings.authRequest');
      } // -- Extract returnURL 


      this.settings.authRequest.returnURL = AuthController.getReturnURL(this.settings.authRequest.returnURL);

      if (!this.settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }

      this.cookieKey = COOKIE_STRING + this.settings.authRequest.requestingAppId;

      if (!this.settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      } // -- Extract service info from URL query params if nor specified -- //


      if (!this.serviceInfoUrl) {// TODO
      }
    } catch (e) {
      this.state = {
        id: AuthStates.ERROR,
        message: 'During initialization',
        error: e
      };
      throw e;
    }
  }
  /**
   * @returns {PryvService}
   */


  _createClass(AuthController, [{
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var params, res, loginCookie;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.state = {
                  id: AuthStates.LOADING
                };

                if (!this.pryvService) {
                  _context.next = 3;
                  break;
                }

                throw new Error('Browser service already initialized');

              case 3:
                // 1. fetch service-info
                this.pryvService = new Service(this.serviceInfoUrl, this.serviceCustomizations);
                _context.prev = 4;
                _context.next = 7;
                return this.pryvService.info();

              case 7:
                this.pryvServiceInfo = _context.sent;
                _context.next = 14;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](4);
                this.state = {
                  id: AuthStates.ERROR,
                  message: 'Cannot fetch service/info',
                  error: _context.t0
                };
                throw _context.t0;

              case 14:
                if (!this.loginButton) {
                  _context.next = 24;
                  break;
                }

                _context.prev = 15;
                _context.next = 18;
                return this.loginButton.loadAssets(this.pryvService);

              case 18:
                _context.next = 24;
                break;

              case 20:
                _context.prev = 20;
                _context.t1 = _context["catch"](15);
                this.state = {
                  id: AuthStates.ERROR,
                  message: 'Cannot fetch button visuals',
                  error: _context.t1
                };
                throw _context.t1;

              case 24:
                // 3. Check if there is a prYvkey as result of "out of page login"
                params = AuthController.getQueryParamsFromURL();

                if (!params.prYvkey) {
                  _context.next = 37;
                  break;
                }

                _context.prev = 26;
                _context.next = 29;
                return utils.superagent.get(this.pryvServiceInfo.access + params.prYvkey);

              case 29:
                res = _context.sent;
                this.processAccess(res.body);
                _context.next = 36;
                break;

              case 33:
                _context.prev = 33;
                _context.t2 = _context["catch"](26);
                this.state = {
                  id: AuthStates.ERROR,
                  message: 'Cannot fetch result',
                  error: _context.t2
                };

              case 36:
                return _context.abrupt("return", this.pryvService);

              case 37:
                // 4. check autologin 
                loginCookie = null;

                try {
                  loginCookie = Cookies.get(this.cookieKey);
                } catch (e) {
                  console.log(e);
                }

                if (loginCookie) {
                  this.state = {
                    id: AuthStates.AUTHORIZED,
                    apiEndpoint: loginCookie.apiEndpoint,
                    displayName: loginCookie.displayName,
                    action: this.logOut
                  };
                } else {
                  // 5. Propose Login
                  this.readyAndClean();
                }

                return _context.abrupt("return", this.pryvService);

              case 41:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 10], [15, 20], [26, 33]]);
      }));

      function init() {
        return _init.apply(this, arguments);
      }

      return init;
    }()
    /**
     * Called at the end init() and when logging out()
     */

  }, {
    key: "readyAndClean",
    value: function readyAndClean() {
      Cookies.del(this.cookieKey);
      this.accessData = null;
      this.state = {
        id: AuthStates.INITIALIZED,
        serviceInfo: this.serviceInfo,
        action: this.openLoginPage
      };
    } // ----------------------- ACCESS --------------- ///

    /**
     * @private
     */

  }, {
    key: "postAccess",
    value: function () {
      var _postAccess = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        var res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return utils.superagent.post(this.pryvServiceInfo.access).set('accept', 'json').send(this.settings.authRequest);

              case 3:
                res = _context2.sent;
                return _context2.abrupt("return", res.body);

              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2["catch"](0);
                this.state = {
                  id: AuthStates.ERROR,
                  message: 'Requesting access',
                  error: _context2.t0
                };
                throw _context2.t0;

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 7]]);
      }));

      function postAccess() {
        return _postAccess.apply(this, arguments);
      }

      return postAccess;
    }()
    /**
    * @private
    */

  }, {
    key: "getAccess",
    value: function () {
      var _getAccess = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        var res;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return utils.superagent.get(this.accessData.poll).set('accept', 'json');

              case 2:
                res = _context3.sent;
                return _context3.abrupt("return", res.body);

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getAccess() {
        return _getAccess.apply(this, arguments);
      }

      return getAccess;
    }()
    /**
     * @private 
     */

  }, {
    key: "poll",
    value: function () {
      var _poll = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(this.accessData.status !== 'NEED_SIGNIN')) {
                  _context4.next = 3;
                  break;
                }

                this.polling = false;
                return _context4.abrupt("return");

              case 3:
                if (!this.settings.authRequest.returnURL) {
                  _context4.next = 5;
                  break;
                }

                return _context4.abrupt("return");

              case 5:
                this.polling = true;
                _context4.t0 = this;
                _context4.next = 9;
                return this.getAccess();

              case 9:
                _context4.t1 = _context4.sent;

                _context4.t0.processAccess.call(_context4.t0, _context4.t1);

                setTimeout(this.poll.bind(this), this.accessData.poll_rate_ms);

              case 12:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function poll() {
        return _poll.apply(this, arguments);
      }

      return poll;
    }()
    /**
     * @private 
     */

  }, {
    key: "processAccess",
    value: function processAccess(accessData) {
      if (!accessData || !accessData.status) {
        this.state = {
          id: AuthStates.ERROR,
          message: 'Invalid Access data response',
          error: new Error('Invalid Access data response')
        };
        throw this.state.error;
      }

      this.accessData = accessData;

      switch (this.accessData.status) {
        case 'ERROR':
          this.state = {
            id: AuthStates.ERROR,
            message: 'Error on the backend'
          };
          break;

        case 'ACCEPTED':
          var apiEndpoint = Service.buildAPIEndpoint(this.pryvServiceInfo, this.accessData.username, this.accessData.token);
          Cookies.set(this.cookieKey, {
            apiEndpoint: apiEndpoint,
            displayName: this.accessData.username
          });
          this.state = {
            id: AuthStates.AUTHORIZED,
            apiEndpoint: apiEndpoint,
            displayName: this.accessData.username,
            action: this.logOut
          };
          break;
      }
    } // ---------------------- STATES ----------------- //

  }, {
    key: "openLoginPage",
    // ------------------ ACTIONS  ----------- //

    /**
     * Follow Browser Process and 
     * Open Login Page.
     */
    value: function () {
      var _openLoginPage = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                console.log('OpenLogin', this); // 1. Make sure Browser is initialized

                if (this.pryvServiceInfo) {
                  _context5.next = 3;
                  break;
                }

                throw new Error('Browser service must be initialized first');

              case 3:
                if (this.accessData) {
                  _context5.next = 9;
                  break;
                }

                _context5.t0 = this;
                _context5.next = 7;
                return this.postAccess();

              case 7:
                _context5.t1 = _context5.sent;

                _context5.t0.processAccess.call(_context5.t0, _context5.t1);

              case 9:
                // 3.a Open Popup (even if already opened)
                if (this.accessData.status === 'NEED_SIGNIN') this.popupLogin(); // 3.a.1 Poll Access if not yet in course

                if (!this.polling) this.poll();

              case 11:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function openLoginPage() {
        return _openLoginPage.apply(this, arguments);
      }

      return openLoginPage;
    }()
    /**
     * Revoke Connection and clean local cookies
     * 
     */

  }, {
    key: "logOut",
    value: function logOut() {
      var message = this.loginButton ? this.loginButton.myMessages.LOGOUT_CONFIRM : 'Logout ?';

      if (confirm(message)) {
        this.readyAndClean();
      }
    }
  }, {
    key: "popupLogin",
    value: function popupLogin() {
      if (!this.accessData || !this.accessData.url) {
        throw new Error('Pryv Sign-In Error: NO SETUP. Please call Browser.setupAuth() first.');
      }

      if (this.settings.authRequest.returnURL) {
        // open on same page (no Popup) 
        location.href = this.accessData.url;
        return;
      }

      var screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft,
          screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop,
          outerWidth = typeof window.outerWidth !== 'undefined' ? window.outerWidth : document.body.clientWidth,
          outerHeight = typeof window.outerHeight !== 'undefined' ? window.outerHeight : document.body.clientHeight - 22,
          width = 270,
          height = 420,
          left = parseInt(screenX + (outerWidth - width) / 2, 10),
          top = parseInt(screenY + (outerHeight - height) / 2.5, 10),
          features = 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',scrollbars=yes'; // Keep "url" for retro-compatibility for Pryv.io before v1.0.4 

      var authUrl = this.accessData.authUrl || this.accessData.url;
      this.popup = window.open(authUrl, 'prYv Sign-in', features);

      if (!this.popup) {
        // TODO try to fall back on access
        console.log('FAILED_TO_OPEN_WINDOW');
      } else if (window.focus) {
        this.popup.focus();
      }

      return;
    } // ------------------ Internal utils ------------------- //

    /**
     * From the settings and the environement  
     * @param {string} [setting] Url 
     * @param {Object} [windowLocationForTest] fake window.location.href
     * @param {Object} [navigatorForTests] fake navigaotor for testsuseragent
     */

  }, {
    key: "state",
    set: function set(newState) {
      var _this = this;

      //console.log('State Changed:' + JSON.stringify(newState));
      this._state = newState;
      this.stateChangeListners.map(function (listner) {
        try {
          listner(_this.state);
        } catch (e) {
          console.log(e);
        }
      });
    },
    get: function get() {
      return this._state;
    }
  }], [{
    key: "getReturnURL",
    value: function getReturnURL(setting, windowLocationForTest, navigatorForTests) {
      var returnURL = setting || 'auto#';
      var locationHref = windowLocationForTest || window.location.href; // check the trailer

      var trailer = returnURL.slice(-1);

      if ('#&?'.indexOf(trailer) < 0) {
        throw new Error('Pryv access: Last character of --returnURL setting-- is not ' + '"?", "&" or "#": ' + returnURL);
      } // is Popup ? (not mobile && auto#)


      if (returnURL.indexOf('auto') === 0 && !AuthController.browserIsMobileOrTablet(navigatorForTests)) {
        return false;
      } // set self as return url?


      if (returnURL.indexOf('auto') === 0 && AuthController.browserIsMobileOrTablet(navigatorForTests) || returnURL.indexOf('self') === 0) {
        // 
        // eventually clean-up current url from previous pryv returnURL
        returnURL = locationHref + returnURL.substring(4);
        ;
      }

      return AuthController.cleanURLFromPrYvParams(returnURL);
    }
    /**
     * 
     * @param {Object} [navigatorForTests] mock navigator var only for testing purposes 
     */

  }, {
    key: "browserIsMobileOrTablet",
    value: function browserIsMobileOrTablet(navigatorForTests) {
      var myNavigator = navigatorForTests || navigator;
      var check = false;

      (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
      })(myNavigator.userAgent || myNavigator.vendor || myNavigator.opera);

      return check;
    }
  }, {
    key: "getQueryParamsFromURL",
    value: function getQueryParamsFromURL(url) {
      url = url || window.location.href;
      var vars = {};
      url.replace(QUERY_REGEXP, function (m, key, value) {
        vars[key] = decodeURIComponent(value);
      });
      return vars;
    } //util to grab parameters from url query string

  }, {
    key: "getServiceInfoFromURL",
    value: function getServiceInfoFromURL(url) {
      var vars = AuthController.getQueryParamsFromURL(url); //TODO check validity of status

      return vars[AuthController.options.SERVICE_INFO_QUERY_PARAM_KEY];
    }
  }, {
    key: "getStatusFromURL",
    //util to grab parameters from url query string
    value: function getStatusFromURL(url) {
      var vars = AuthController.getQueryParamsFromURL(url); //TODO check validity of status

      return vars.prYvstatus;
    }
  }, {
    key: "cleanURLFromPrYvParams",
    //util to grab parameters from url query string
    value: function cleanURLFromPrYvParams(url) {
      return url.replace(PRYV_REGEXP, '');
    }
  }]);

  return AuthController;
}();

AuthController.options = {
  SERVICE_INFO_QUERY_PARAM_KEY: 'pryvServiceInfoUrl'
};
module.exports = AuthController;

/***/ }),

/***/ "./src/Browser/AuthStates.js":
/*!***********************************!*\
  !*** ./src/Browser/AuthStates.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Enum Possible states: ERROR, LOADING, INITIALIZED, AUTHORIZED, LOGOUT
 * @readonly
 * @enum {string}
 * @memberof Pryv.Browser
 */
var AuthState = {
  ERROR: 'error',
  LOADING: 'loading',
  INITIALIZED: 'initialized',
  AUTHORIZED: 'authorized',
  LOGOUT: 'logout'
};
module.exports = AuthState;

/***/ }),

/***/ "./src/Browser/CookieUtils.js":
/*!************************************!*\
  !*** ./src/Browser/CookieUtils.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
/**
 * @memberof Pryv.Browser
 * @namespace Pryv.Browser.CookieUtils
 */

/**
  * Set a Local cookier
  * @memberof Pryv.Browser.CookieUtils
  * @param {string} cookieKey - The key for the cookie
  * @param {mixed} value - The Value 
  * @param {number} expireInDays - Expiration date in days from now
  */


function set(cookieKey, value, expireInDays) {
  if (!utils.isBrowser()) return;
  expireInDays = expireInDays || 365;
  var myDate = new Date();
  var hostName = window.location.hostname;
  var path = window.location.pathname;
  myDate.setDate(myDate.getDate() + expireInDays);
  var cookieStr = encodeURIComponent(cookieKey) + '=' + encodeURIComponent(JSON.stringify(value)) + ';expires=' + myDate.toGMTString() + ';domain=.' + hostName + ';path=' + path; // do not add SameSite when removing a cookie

  if (expireInDays >= 0) cookieStr += ';SameSite=Strict';
  document.cookie = cookieStr;
}

exports.set = set;
/**
 * returns the value of a local cookie
 * @memberof Pryv.Browser.CookieUtils
 * @param cookieKey - The key
 */

exports.get = function get(cookieKey) {
  var name = encodeURIComponent(cookieKey);
  if (!utils.isBrowser()) return;
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return JSON.parse(decodeURIComponent(parts.pop().split(";").shift()));
};
/**
 * delete a local cookie
 * @memberof Pryv.Browser.CookieUtils
 * @param cookieKey - The key
 */


exports.del = function del(cookieKey) {
  set(cookieKey, {
    deleted: true
  }, -1);
};

/***/ }),

/***/ "./src/Browser/LoginButton.js":
/*!************************************!*\
  !*** ./src/Browser/LoginButton.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Messages = __webpack_require__(/*! ./LoginButtonMessages */ "./src/Browser/LoginButtonMessages.js");

var AuthStates = __webpack_require__(/*! ./AuthStates */ "./src/Browser/AuthStates.js");
/**
 * @memberof Pryv.Browser
 */


var LoginButton =
/*#__PURE__*/
function () {
  /**
   * @param {Browser} auth 
   */
  function LoginButton(auth) {
    _classCallCheck(this, LoginButton);

    // 1. get Language
    this.languageCode = auth.settings.authRequest.languageCode || 'en';
    this.myMessages = Messages(this.languageCode); // 2. build button

    this.loginButtonSpan = document.getElementById(auth.settings.spanButtonID);

    if (!this.loginButtonSpan) {
      throw new Error('No Cannot find SpanId: ' + auth.settings.spanButtonID + ' in DOM');
    } // up to the time the button is loaded use the Span to dsiplay eventual error messages


    this.loginButtonText = this.loginButtonSpan;
    this.loginButtonSpan.addEventListener('click', this.onClick.bind(this));
    this.auth = auth;
    this.onStateChange({
      id: AuthStates.LOADING
    });
  }
  /**
   * @param {Service} pryvService 
   */


  _createClass(LoginButton, [{
    key: "loadAssets",
    value: function () {
      var _loadAssets = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(pryvService) {
        var assets, thisMessages;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return pryvService.assets();

              case 2:
                assets = _context.sent;
                assets.loginButtonLoadCSS(); // can be async 

                _context.next = 6;
                return assets.loginButtonGetHTML();

              case 6:
                this.loginButtonSpan.innerHTML = _context.sent;
                this.loginButtonText = document.getElementById('pryv-access-btn-text');
                _context.next = 10;
                return assets.loginButtonGetMessages();

              case 10:
                thisMessages = _context.sent;

                if (thisMessages.LOADING) {
                  this.myMessages = Messages(this.languageCode, thisMessages);
                } else {
                  console.log("WARNING Messages cannot be loaded using defaults: ", thisMessages);
                }

                this.onStateChange(); // refresh messages

                this.refreshText();

              case 14:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadAssets(_x) {
        return _loadAssets.apply(this, arguments);
      }

      return loadAssets;
    }()
  }, {
    key: "refreshText",
    value: function refreshText() {
      if (this.loginButtonText) this.loginButtonText.innerHTML = this.text;
    }
  }, {
    key: "onClick",
    value: function onClick() {
      if (this.auth.state.action) {
        this.auth.state.action.apply(this.auth);
      }
    }
  }, {
    key: "onStateChange",
    value: function onStateChange(state) {
      if (state) {
        this.lastState = state;
      }

      switch (this.lastState.id) {
        case AuthStates.ERROR:
          this.text = this.myMessages.ERROR + ': ' + this.lastState.message;
          break;

        case AuthStates.LOADING:
          this.text = this.myMessages.LOADING;
          break;

        case AuthStates.INITIALIZED:
          this.text = this.myMessages.LOGIN + ': ' + this.auth.pryvServiceInfo.name;
          break;

        case AuthStates.AUTHORIZED:
          this.text = this.lastState.displayName;
          break;

        default:
          console.log('WARNING Unhandled state for Login: ' + this.lastState.id);
      }

      this.refreshText();
    }
  }]);

  return LoginButton;
}();

module.exports = LoginButton;

/***/ }),

/***/ "./src/Browser/LoginButtonMessages.js":
/*!********************************************!*\
  !*** ./src/Browser/LoginButtonMessages.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var Messages = {
  LOADING: {
    'en': '...'
  },
  ERROR: {
    'en': 'Error',
    'fr': 'Erreur'
  },
  LOGIN: {
    'en': 'Signin',
    'fr': 'Login'
  },
  LOGOUT_CONFIRM: {
    'en': 'Logout ?',
    'fr': 'Se deconnecter ?'
  }
};

function get(languageCode, definitions) {
  var myMessages = definitions || Messages;
  var res = {};
  Object.keys(myMessages).map(function (key) {
    res[key] = myMessages[key][languageCode] || myMessages[key]['en'];
  });
  return res;
}

module.exports = get;

/***/ }),

/***/ "./src/Connection.js":
/*!***************************!*\
  !*** ./src/Connection.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var utils = __webpack_require__(/*! ./utils.js */ "./src/utils.js");

var jsonParser = __webpack_require__(/*! ./lib/json-parser */ "./src/lib/json-parser.js");

var browserGetEventStreamed = __webpack_require__(/*! ./lib/browser-getEventStreamed */ "./src/lib/browser-getEventStreamed.js");
/**
 * @class Connection
 * A connection is an authenticated link to a Pryv.io account.
 * 
 * @type {TokenAndEndpoint}
 *
 * @example
 * create a connection for the user 'tom' on 'pryv.me' backend with the token 'TTZycvBTiq'
 * const conn = new Pryv.Connection('https://TTZycvBTiq@tom.pryv.me');
 *
 * @property {string} [token]
 * @property {string} endpoint
 * @memberof Pryv
 * 
 * @constructor
 * @this {Connection} 
 * @param {PryvApiEndpoint} pryvApiEndpoint
 */


var Connection =
/*#__PURE__*/
function () {
  function Connection(pryvApiEndpoint) {
    _classCallCheck(this, Connection);

    var _utils$extractTokenAn = utils.extractTokenAndApiEndpoint(pryvApiEndpoint),
        token = _utils$extractTokenAn.token,
        endpoint = _utils$extractTokenAn.endpoint;

    this.token = token;
    this.endpoint = endpoint;
    this.options = {};
    this.options.chunkSize = 1000;
    this._deltaTime = {
      value: 0,
      weight: 0
    };
  }
  /**
   * Issue a Batch call https://api.pryv.com/reference/#call-batch .
   * arrayOfAPICalls will be splited in multiple calls if the size is > `conn.options.chunkSize` .
   * Default chunksize is 1000.
   * @param {Array.<MethodCall>} arrayOfAPICalls Array of Method Calls
   * @param {Function} [progress] Return percentage of progress (0 - 100);
   * @returns {Promise<Array>} Promise to Array of results matching each method call in order
   */


  _createClass(Connection, [{
    key: "api",
    value: function () {
      var _api = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(arrayOfAPICalls, progress) {
        var res, percent, cursor, thisBatch, cursorMax, i, resRequest, _i;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (Array.isArray(arrayOfAPICalls)) {
                  _context.next = 2;
                  break;
                }

                throw new Error('Pryv.api() takes an array as input');

              case 2:
                res = [];
                percent = 0;
                cursor = 0;

              case 5:
                if (!(arrayOfAPICalls.length >= cursor)) {
                  _context.next = 30;
                  break;
                }

                thisBatch = [];
                cursorMax = Math.min(cursor + this.options.chunkSize, arrayOfAPICalls.length); // copy only method and params into a back call to be exuted

                for (i = cursor; i < cursorMax; i++) {
                  thisBatch.push({
                    method: arrayOfAPICalls[i].method,
                    params: arrayOfAPICalls[i].params
                  });
                }

                _context.next = 11;
                return this.post('', thisBatch);

              case 11:
                resRequest = _context.sent;

                if (!(!resRequest || !Array.isArray(resRequest.results))) {
                  _context.next = 14;
                  break;
                }

                throw new Error('API call result is not an Array: ' + JSON.stringify(resRequest));

              case 14:
                if (!(resRequest.results.length != thisBatch.length)) {
                  _context.next = 16;
                  break;
                }

                throw new Error('API call result Array does not match request: ' + JSON.stringify(resRequest));

              case 16:
                _i = 0;

              case 17:
                if (!(_i < resRequest.results.length)) {
                  _context.next = 24;
                  break;
                }

                if (!arrayOfAPICalls[_i + cursor].handleResult) {
                  _context.next = 21;
                  break;
                }

                _context.next = 21;
                return arrayOfAPICalls[_i + cursor].handleResult.call(null, resRequest.results[_i]);

              case 21:
                _i++;
                _context.next = 17;
                break;

              case 24:
                Array.prototype.push.apply(res, resRequest.results);
                percent = Math.round(100 * res.length / arrayOfAPICalls.length);

                if (progress) {
                  progress(percent, res);
                }

              case 27:
                cursor += this.options.chunkSize;
                _context.next = 5;
                break;

              case 30:
                return _context.abrupt("return", res);

              case 31:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function api(_x, _x2) {
        return _api.apply(this, arguments);
      }

      return api;
    }()
    /**
     * Post to API return results  
     * @param {(Array | Object)} data 
     * @param {Object} queryParams
     * @param {string} path 
     * @returns {Promise<Array|Object>}  Promise to result.body
     */

  }, {
    key: "post",
    value: function () {
      var _post2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(path, data, queryParams) {
        var now, res;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                now = Date.now() / 1000;
                _context2.next = 3;
                return this.postRaw(path, data, queryParams);

              case 3:
                res = _context2.sent;

                this._handleMeta(res.body, now);

                return _context2.abrupt("return", res.body);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function post(_x3, _x4, _x5) {
        return _post2.apply(this, arguments);
      }

      return post;
    }()
    /**
     * Raw Post to API return superagent object  
     * @param {Array | Object} data 
     * @param {Object} queryParams
     * @param {string} path 
     * @returns {request.superagent}  Promise from superagent's post request
     */

  }, {
    key: "postRaw",
    value: function () {
      var _postRaw = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(path, data, queryParams) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", this._post(path).query(queryParams).send(data));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function postRaw(_x6, _x7, _x8) {
        return _postRaw.apply(this, arguments);
      }

      return postRaw;
    }()
  }, {
    key: "_post",
    value: function _post(path) {
      return utils.superagent.post(this.endpoint + path).set('Authorization', this.token).set('accept', 'json');
    }
    /**
     * Post to API return results  
     * @param {Object} queryParams
     * @param {string} path 
     * @returns {Promise<Array|Object>}  Promise to result.body
     */

  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(path, queryParams) {
        var now, res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                now = Date.now() / 1000;
                _context4.next = 3;
                return this.getRaw(path, queryParams);

              case 3:
                res = _context4.sent;

                this._handleMeta(res.body, now);

                return _context4.abrupt("return", res.body);

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function get(_x9, _x10) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
    /**
     * Raw Get to API return superagent object
     * @param {Object} queryParams 
     * @param {string} path 
     * @returns {request.superagent}  Promise from superagent's get request
     */

  }, {
    key: "getRaw",
    value: function getRaw(path, queryParams) {
      path = path || '';
      return utils.superagent.get(this.endpoint + path).set('Authorization', this.token).set('accept', 'json').query(queryParams);
    }
    /**
     * ADD Data Points to HFEvent (flatJSON format)
     * https://api.pryv.com/reference/#add-hf-series-data-points
     */

  }, {
    key: "addPointsToHFEvent",
    value: function () {
      var _addPointsToHFEvent = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(eventId, fields, points) {
        var res;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.post('events/' + eventId + '/series', {
                  format: 'flatJSON',
                  fields: fields,
                  points: points
                });

              case 2:
                res = _context5.sent;

                if (!(!res.status === 'ok')) {
                  _context5.next = 5;
                  break;
                }

                throw new Error('Failed loading serie: ' + JSON.stringify(res.status));

              case 5:
                return _context5.abrupt("return", res);

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function addPointsToHFEvent(_x11, _x12, _x13) {
        return _addPointsToHFEvent.apply(this, arguments);
      }

      return addPointsToHFEvent;
    }()
    /**
     * Streamed get Event. 
     * Fallbacks to not streamed, for browsers that does not support `fetch()` API 
     * @see https://api.pryv.com/reference/#get-events
     * @param {Object} queryParams See `events.get` parameters
     * @param {Function} forEachEvent Function taking one event as parameter. Will be called for each event 
     * @returns {Promise<Object>} Promise to result.body transformed with `eventsCount: {count}` replacing `events: [...]`
     */

  }, {
    key: "getEventsStreamed",
    value: function () {
      var _getEventsStreamed = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(queryParams, forEachEvent) {
        var myParser, res, now;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                myParser = jsonParser(forEachEvent, queryParams.includeDeletions);
                res = null;

                if (!(typeof window === 'undefined')) {
                  _context6.next = 8;
                  break;
                }

                _context6.next = 5;
                return this.getRaw('events', queryParams).buffer(false).parse(myParser);

              case 5:
                res = _context6.sent;
                _context6.next = 21;
                break;

              case 8:
                if (!(typeof fetch !== 'undefined')) {
                  _context6.next = 14;
                  break;
                }

                _context6.next = 11;
                return browserGetEventStreamed(this, queryParams, myParser);

              case 11:
                res = _context6.sent;
                _context6.next = 21;
                break;

              case 14:
                // browser no fetch supports
                console.log('WARNING: Browser does not support fetch() required by Pryv.Connection.getEventsStreamed()');
                _context6.next = 17;
                return this.getRaw('events', queryParams);

              case 17:
                res = _context6.sent;
                res.body.eventsCount = 0;

                if (res.body.events) {
                  res.body.events.forEach(forEachEvent);
                  res.body.eventsCount += res.body.events.length;
                  delete res.body.events;
                }

                if (res.body.eventDeletions) {
                  // deletions are in a seprated Array 
                  res.body.eventDeletions.forEach(forEachEvent);
                  res.body.eventsCount += res.body.eventDeletions.length;
                  delete res.body.eventDeletions;
                }

              case 21:
                now = Date.now() / 1000;

                this._handleMeta(res.body, now);

                return _context6.abrupt("return", res.body);

              case 24:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getEventsStreamed(_x14, _x15) {
        return _getEventsStreamed.apply(this, arguments);
      }

      return getEventsStreamed;
    }()
    /**
     * Create an event with attached file
     * NODE.jS ONLY
     * @param {Event} event
     * @param {string} filePath
     */

  }, {
    key: "createEventWithFile",
    value: function () {
      var _createEventWithFile = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(event, filePath) {
        var res, now;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this._post('events').field('event', JSON.stringify(event)).attach('file', filePath);

              case 2:
                res = _context7.sent;
                now = Date.now() / 1000;

                this._handleMeta(res.body, now);

                return _context7.abrupt("return", res.body);

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function createEventWithFile(_x16, _x17) {
        return _createEventWithFile.apply(this, arguments);
      }

      return createEventWithFile;
    }()
    /**
    * Create an event with attached formData
    * !! BROWSER ONLY
    * @param {Event} event
    * @param {FormData} formData https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
    */

  }, {
    key: "createEventWithFormData",
    value: function () {
      var _createEventWithFormData = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(event, formData) {
        var res;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                formData.append('event', JSON.stringify(event));
                _context8.next = 3;
                return this._post('events').send(formData);

              case 3:
                res = _context8.sent;
                return _context8.abrupt("return", res.body);

              case 5:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function createEventWithFormData(_x18, _x19) {
        return _createEventWithFormData.apply(this, arguments);
      }

      return createEventWithFormData;
    }()
    /**
     * Difference in second between the API and locatime
     * deltaTime is refined at each (non Raw) API call
     * @readonly
     * @property {number} deltaTime
     */

  }, {
    key: "_handleMeta",
    // private method that handle meta data parsing
    value: function _handleMeta(res, requestLocalTimestamp) {
      if (!res.meta) throw new Error('Cannot find .meta in response.');
      if (!res.meta.serverTime) throw new Error('Cannot find .meta.serverTime in response.'); // update deltaTime and weight it 

      this._deltaTime.value = (this._deltaTime.value * this._deltaTime.weight + res.meta.serverTime - requestLocalTimestamp) / ++this._deltaTime.weight;
    }
  }, {
    key: "deltaTime",
    get: function get() {
      return this._deltaTime.value;
    }
    /**
     * Pryv API Endpoint of this connection
     * @readonly
     * @property {PryvApiEndpoint} deltaTime
     */

  }, {
    key: "apiEndpoint",
    get: function get() {
      return utils.buildPryvApiEndPoint(this);
    }
  }]);

  return Connection;
}();

module.exports = Connection;
/**
 * API Method call, for batch call https://api.pryv.com/reference/#call-batch
 * @typedef {Object} MethodCall
 * @property {string} method - The method id
 * @property {(Object|Array)}  params - The call parameters as required by the method.
 * @property {(Function|Promise)} [handleResult] - Will be called with the result corresponding to this specific call.
 */

/***/ }),

/***/ "./src/Service.js":
/*!************************!*\
  !*** ./src/Service.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var utils = __webpack_require__(/*! ./utils.js */ "./src/utils.js");

var Connection = __webpack_require__(/*! ./Connection.js */ "./src/Connection.js");

var Assets = __webpack_require__(/*! ./ServiceAssets.js */ "./src/ServiceAssets.js");
/**
 * @class Pryv.Service
 * A Pryv.io deployment is a unique "Service", as an example **Pryv Lab** is a service, deployed with the domain name **pryv.me**.
 * 
 * `Pryv.Service` exposes tools to interact with Pryv.io at a "Platform" level. 
 *
 *  ##### Initizalization with a service info URL
```javascript
const service = new Pryv.Service('https://reg.pryv.me/service/info');
```

- With the content of a serviceInfo configuration

Service information properties can be overriden with specific values. This might be usefull to test new designs on production platforms.

```javascript
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
const serviceCustomizations = {
  name: 'Pryv Lab 2',
  assets: {
    definitions: 'https://pryv.github.io/assets-pryv.me/index.json'
  }
}
const service = new Pryv.Service(serviceInfoUrl, serviceCustomizations);
``` 

 * @memberof Pryv
 * 
 * @constructor
 * @param {string} serviceInfoUrl Url point to /service/info of a Pryv platform see: {@link https://api.pryv.com/reference/#service-info}
 */


var Service =
/*#__PURE__*/
function () {
  function Service(serviceInfoUrl, serviceCustomizations) {
    _classCallCheck(this, Service);

    this._pryvServiceInfo = null;
    this._assets = null;
    this._pryvServiceInfoUrl = serviceInfoUrl;
    this._pryvServiceCustomizations = serviceCustomizations;
  }
  /**
   * Return service info parameters info known of fetch it if needed.
   * Example   
   *  - name of a platform   
   *    `const serviceName = await service.info().name` 
   * @see PryvServiceInfo For details on available properties.
   * @param {boolean?} forceFetch If true, will force fetching service info.
   * @returns {Promise<PryvServiceInfo>} Promise to Service info Object
   */


  _createClass(Service, [{
    key: "info",
    value: function () {
      var _info = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(forceFetch) {
        var baseServiceInfo, res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(forceFetch || !this._pryvServiceInfo)) {
                  _context.next = 9;
                  break;
                }

                baseServiceInfo = {};

                if (!this._pryvServiceInfoUrl) {
                  _context.next = 7;
                  break;
                }

                _context.next = 5;
                return utils.superagent.get(this._pryvServiceInfoUrl).set('Access-Control-Allow-Origin', '*').set('accept', 'json');

              case 5:
                res = _context.sent;
                baseServiceInfo = res.body;

              case 7:
                Object.assign(baseServiceInfo, this._pryvServiceCustomizations);
                this.setServiceInfo(baseServiceInfo);

              case 9:
                return _context.abrupt("return", this._pryvServiceInfo);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function info(_x) {
        return _info.apply(this, arguments);
      }

      return info;
    }()
    /**
     * @private
     * @param {PryvServiceInfo} serviceInfo
     */

  }, {
    key: "setServiceInfo",
    value: function setServiceInfo(serviceInfo) {
      if (!serviceInfo.name) {
        throw new Error('Invalid data from service/info');
      } // cleanup serviceInfo for eventual url not finishing by "/" 
      // code will be obsolete with next version of register


      ['access', 'api', 'register'].forEach(function (key) {
        if (serviceInfo[key].slice(-1) !== '/') {
          serviceInfo[key] += '/';
        }
      });
      this._pryvServiceInfo = serviceInfo;
    }
    /**
     * Return assets property content
     * @param {boolean?} forceFetch If true, will force fetching service info.
     * @returns {Promise<ServiceAssets>} Promise to ServiceAssets 
     */

  }, {
    key: "assets",
    value: function () {
      var _assets = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(forceFetch) {
        var serviceInfo;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(!forceFetch && this._assets)) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt("return", this._assets);

              case 4:
                _context2.next = 6;
                return this.info();

              case 6:
                serviceInfo = _context2.sent;

                if (!(!serviceInfo.assets || !serviceInfo.assets.definitions)) {
                  _context2.next = 10;
                  break;
                }

                console.log('Warning: no assets for this service');
                return _context2.abrupt("return", null);

              case 10:
                _context2.next = 12;
                return Assets.setup(serviceInfo.assets.definitions);

              case 12:
                this._assets = _context2.sent;
                return _context2.abrupt("return", this._assets);

              case 14:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function assets(_x2) {
        return _assets.apply(this, arguments);
      }

      return assets;
    }()
    /**
     * Return service info parameters info known or null if not yet loaded
     * @returns {PryvServiceInfo} Service Info definition
     */

  }, {
    key: "infoSync",
    value: function infoSync() {
      return this._pryvServiceInfo;
    }
    /**
     * Return an API Endpoint from a username and token
     * @param {string} username
     * @param {string} [token]
     * @return {PryvApiEndpoint}
     */

  }, {
    key: "apiEndpointFor",
    value: function () {
      var _apiEndpointFor = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(username, token) {
        var serviceInfo;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.info();

              case 2:
                serviceInfo = _context3.sent;
                return _context3.abrupt("return", Service.buildAPIEndpoint(serviceInfo, username, token));

              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function apiEndpointFor(_x3, _x4) {
        return _apiEndpointFor.apply(this, arguments);
      }

      return apiEndpointFor;
    }()
    /**
     * Return an API Endpoint from a username and token and a PryvServiceInfo. 
     * This is method is rarely used. See **apiEndPointFor** as an alternative.
     * @param {PryvServiceInfo} serviceInfo
     * @param {string} username
     * @param {string} [token]
     * @return {PryvApiEndpoint}
     */

  }, {
    key: "login",

    /**
     * Issue a "login call on the Service" return a Connection on success  
     * **! Warning**: the token of the connection will be a "Personal" token that expires
     * @see https://api.pryv.com/reference-full/#login-user
     * @param {string} username 
     * @param {string} password 
     * @param {string} appId 
     * @param {string} [originHeader=service-info.register] Only for Node.js. If not set will use the register value of service info. In browsers this will overridden by current page location.
     * @throws {Error} on invalid login
     */
    value: function () {
      var _login = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(username, password, appId, originHeader) {
        var apiEndPoint, headers, res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.apiEndpointFor(username);

              case 2:
                apiEndPoint = _context4.sent;
                _context4.prev = 3;
                headers = {
                  accept: 'json'
                };
                _context4.t0 = originHeader;

                if (_context4.t0) {
                  _context4.next = 10;
                  break;
                }

                _context4.next = 9;
                return this.info();

              case 9:
                _context4.t0 = _context4.sent.register;

              case 10:
                originHeader = _context4.t0;

                if (!utils.isBrowser()) {
                  headers.Origin = originHeader;
                }

                _context4.next = 14;
                return utils.superagent.post(apiEndPoint + 'auth/login').set(headers).send({
                  username: username,
                  password: password,
                  appId: appId
                });

              case 14:
                res = _context4.sent;

                if (res.body.token) {
                  _context4.next = 17;
                  break;
                }

                throw new Error('Invalid login response: ' + res.body);

              case 17:
                _context4.t1 = Connection;
                _context4.t2 = Service;
                _context4.next = 21;
                return this.info();

              case 21:
                _context4.t3 = _context4.sent;
                _context4.t4 = username;
                _context4.t5 = res.body.token;
                _context4.t6 = _context4.t2.buildAPIEndpoint.call(_context4.t2, _context4.t3, _context4.t4, _context4.t5);
                return _context4.abrupt("return", new _context4.t1(_context4.t6));

              case 28:
                _context4.prev = 28;
                _context4.t7 = _context4["catch"](3);

                if (!(_context4.t7.response && _context4.t7.response.body && _context4.t7.response.body.error && _context4.t7.response.body.error.message)) {
                  _context4.next = 32;
                  break;
                }

                throw new Error(_context4.t7.response.body.error.message);

              case 32:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[3, 28]]);
      }));

      function login(_x5, _x6, _x7, _x8) {
        return _login.apply(this, arguments);
      }

      return login;
    }()
  }], [{
    key: "buildAPIEndpoint",
    value: function buildAPIEndpoint(serviceInfo, username, token) {
      var endpoint = serviceInfo.api.replace('{username}', username);
      return utils.buildPryvApiEndPoint({
        endpoint: endpoint,
        token: token
      });
    }
  }]);

  return Service;
}();

module.exports = Service;
/**
 * Object to handle Pryv Service Informations https://api.pryv.com/reference/#service-info
 * @typedef {Object} PryvServiceInfo
 * @property {string} register The URL of the register service.
 * @property {string} access The URL of the access page.
 * @property {string} api The API endpoint format.
 * @property {string} name The platform name.
 * @property {string} home The URL of the platform's home page.
 * @property {string} support The email or URL of the support page.
 * @property {string} terms The terms and conditions, in plain text or the URL displaying them.
 * @property {string} eventTypes The URL of the list of validated event types.
 * @property {Object} [assets] Holder for service specific Assets (icons, css, ...)
 * @property {String} [assets.definitions] URL to json object with assets definitions
 */

/***/ }),

/***/ "./src/ServiceAssets.js":
/*!******************************!*\
  !*** ./src/ServiceAssets.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var utils = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/**
 * Holds Pryv Service informations.
 * 
 * It's returned by `service.assets()`
 *
 * @memberof Pryv
 **/


var ServiceAssets =
/*#__PURE__*/
function () {
  /**
   * Private => use ServiceAssets.setup()
   * @param { object} assets The content of service/info.assets properties.
   * @param { string } pryvServiceAssetsSourceUrl Url point to assets of the service of a Pryv platform: https://api.pryv.com/reference/#service-info property `assets.src`
   */
  function ServiceAssets(assets, assetsURL) {
    _classCallCheck(this, ServiceAssets);

    this._assets = assets;
    this._assetsURL = assetsURL;
  }
  /**
   * Load Assets definition
   * @param {string} pryvServiceAssetsSourceUrl
   * @returns {ServiceAssets}
   */


  _createClass(ServiceAssets, [{
    key: "get",

    /**
     * get a value from path separated by `:`
     * exemple of key `lib-js:buttonSignIn`
     * @param {string} [keyPath] if null, will return the all assets  
     */
    value: function get(keyPath) {
      var result = Object.assign({}, this._assets);

      if (keyPath) {
        keyPath.split(':').forEach(function (key) {
          result = result[key];
          if (typeof result === 'undefined') return result;
        });
      }

      return result;
    }
    /**
     * get an Url from path separated by `:`
     * identical to doing assets.relativeURL(assets.get(keyPath))
     * exemple of key `lib-js:buttonSignIn`
     * @param {string} [keyPath] if null, will return the all assets  
     */

  }, {
    key: "getUrl",
    value: function getUrl(keyPath) {
      var url = this.get(keyPath);

      if (typeof url !== 'string') {
        throw new Error(url + ' returned ' + value);
      }

      return this.relativeURL(url);
    }
    /**
     * get relativeUrl
     */

  }, {
    key: "relativeURL",
    value: function relativeURL(url) {
      return relPathToAbs(this._assets.baseUrl || this._assetsURL, url);
    } //----------------   Default service ressources

    /**
     * Set all defaults Favicon, CSS
     */

  }, {
    key: "setAllDefaults",
    value: function () {
      var _setAllDefaults = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.setFavicon();
                _context.next = 3;
                return this.loadCSS();

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function setAllDefaults() {
        return _setAllDefaults.apply(this, arguments);
      }

      return setAllDefaults;
    }()
    /**
     * Set service Favicon to Web Page
     */

  }, {
    key: "setFavicon",
    value: function setFavicon() {
      var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = this.relativeURL(this._assets.favicon["default"].url);
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    /**
     * Set default service CSS
     */

  }, {
    key: "loadCSS",
    value: function () {
      var _loadCSS2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _loadCSS(this.relativeURL(this._assets.css["default"].url));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function loadCSS() {
        return _loadCSS2.apply(this, arguments);
      }

      return loadCSS;
    }() // ---- Login

    /**
    * Load CSS for Login button
    */

  }, {
    key: "loginButtonLoadCSS",
    value: function () {
      var _loginButtonLoadCSS = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _loadCSS(this.relativeURL(this._assets['lib-js'].buttonSignIn.css));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function loginButtonLoadCSS() {
        return _loginButtonLoadCSS.apply(this, arguments);
      }

      return loginButtonLoadCSS;
    }()
    /**
    * Get HTML for Login Button
    */

  }, {
    key: "loginButtonGetHTML",
    value: function () {
      var _loginButtonGetHTML = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4() {
        var res;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return utils.superagent.get(this.relativeURL(this._assets['lib-js'].buttonSignIn.html)).set('accept', 'html');

              case 2:
                res = _context4.sent;
                return _context4.abrupt("return", res.text);

              case 4:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function loginButtonGetHTML() {
        return _loginButtonGetHTML.apply(this, arguments);
      }

      return loginButtonGetHTML;
    }()
    /**
    * Get Messages strings for Login Button
    */

  }, {
    key: "loginButtonGetMessages",
    value: function () {
      var _loginButtonGetMessages = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5() {
        var res;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return utils.superagent.get(this.relativeURL(this._assets['lib-js'].buttonSignIn.messages)).set('accept', 'json');

              case 2:
                res = _context5.sent;
                return _context5.abrupt("return", res.body);

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function loginButtonGetMessages() {
        return _loginButtonGetMessages.apply(this, arguments);
      }

      return loginButtonGetMessages;
    }()
  }], [{
    key: "setup",
    value: function () {
      var _setup = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(pryvServiceAssetsSourceUrl) {
        var res;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return utils.superagent.get(pryvServiceAssetsSourceUrl).set('accept', 'json');

              case 2:
                res = _context6.sent;
                return _context6.abrupt("return", new ServiceAssets(res.body, pryvServiceAssetsSourceUrl));

              case 4:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function setup(_x) {
        return _setup.apply(this, arguments);
      }

      return setup;
    }()
  }]);

  return ServiceAssets;
}();

function _loadCSS(url) {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.id = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  link.media = 'all';
  head.appendChild(link);
}
/*\
|*| Modified version of 
|*| :: translate relative paths to absolute paths ::
|*|
|*| https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|
|*| The following code is released under the GNU Public License, version 3 or later.
|*| http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
\*/


function relPathToAbs(baseUrlString, sRelPath) {
  var baseLocation = location;

  if (baseUrlString) {
    baseLocation = document.createElement('a');
    baseLocation.href = baseUrlString;
  }

  var nUpLn,
      sDir = "",
      sPath = baseLocation.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));

  for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
    nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
    sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + (nUpLn - 1) / 3 + "}$"), "/");
  }

  return baseLocation.protocol + '//' + baseLocation.hostname + ':' + baseLocation.port + sDir + sPath.substr(nStart);
}

module.exports = ServiceAssets;

/***/ }),

/***/ "./src/lib/browser-getEventStreamed.js":
/*!*********************************************!*\
  !*** ./src/lib/browser-getEventStreamed.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @private
 * Replacement for getEventStreamed for Browser
 * To be used as long as superagent does not propose it.
 * 
 */
function getEventStreamed(_x, _x2, _x3) {
  return _getEventStreamed.apply(this, arguments);
}

function _getEventStreamed() {
  _getEventStreamed = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(conn, queryParam, parser) {
    var parserSettings, fakeRes, errResult, bodyObjectResult, url, fetchParams, response, reader, _ref, done, value, result, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, pair;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            /**
             * Holds Parser's settings
             */
            parserSettings = {
              ondata: null,
              onend: null,
              encoding: 'utf8'
            };
            /**
             * Mock Response
             */

            fakeRes = {
              setEncoding: function setEncoding(encoding) {
                parserSettings.encoding = encoding;
              },
              // will receive 'data' and 'end' callbacks
              on: function on(key, f) {
                parserSettings['on' + key] = f;
              }
            };
            /**
             * Holds results from the parser
             */

            /**
             * 
             */
            parser(fakeRes, function (err, bodyObject) {
              errResult = err;
              bodyObjectResult = bodyObject;
            }); // ------------   fetch ------------------- //

            url = new URL(conn.endpoint + 'events');
            url.search = new URLSearchParams(queryParam);
            fetchParams = {
              method: 'GET',
              headers: {
                Accept: 'application/jon'
              }
            };
            if (conn.token) fetchParams.headers.Authorization = conn.token;
            _context.next = 9;
            return fetch(url, fetchParams);

          case 9:
            response = _context.sent;
            reader = response.body.getReader();

          case 11:
            if (false) {}

            _context.next = 14;
            return reader.read();

          case 14:
            _ref = _context.sent;
            done = _ref.done;
            value = _ref.value;
            parserSettings.ondata(new TextDecoder(parserSettings.encoding).decode(value));

            if (!done) {
              _context.next = 21;
              break;
            }

            parserSettings.onend();
            return _context.abrupt("break", 23);

          case 21:
            _context.next = 11;
            break;

          case 23:
            if (!errResult) {
              _context.next = 25;
              break;
            }

            throw new Error(errResult);

          case 25:
            // We're done!
            result = {
              text: fakeRes.text,
              // from the parser
              body: bodyObjectResult,
              // from the parser
              statusCode: response.status,
              headers: {}
            }; // add headers to result

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 29;

            for (_iterator = response.headers.entries()[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              pair = _step.value;
              result.headers[pair[0]] = pair[1];
            }

            _context.next = 37;
            break;

          case 33:
            _context.prev = 33;
            _context.t0 = _context["catch"](29);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 37:
            _context.prev = 37;
            _context.prev = 38;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 40:
            _context.prev = 40;

            if (!_didIteratorError) {
              _context.next = 43;
              break;
            }

            throw _iteratorError;

          case 43:
            return _context.finish(40);

          case 44:
            return _context.finish(37);

          case 45:
            return _context.abrupt("return", result);

          case 46:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[29, 33, 37, 45], [38,, 40, 44]]);
  }));
  return _getEventStreamed.apply(this, arguments);
}

module.exports = getEventStreamed;

/***/ }),

/***/ "./src/lib/json-parser.js":
/*!********************************!*\
  !*** ./src/lib/json-parser.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

// there two steps 1 find events, then eventDeletions
var EVENTMARKERS = ['"events":[', '"eventDeletions":['];
/**
 * Customize superagent parser
 * Work on 'node.js' and use by browser-getEventStreamed
 */

module.exports = function (foreachEvent, includeDeletions) {
  var eventOrEventDeletions = 0; // start with event

  var buffer = ''; // temp data

  var body = null; // to be returned
  //IN EVENTS VARS

  var depth = 0; // level of depth in brackets 

  var inString = false; // cursor is in a String 

  var skipNextOne = false; // when a backslash is found

  var cursorPos = 0; // position of Character Cursor
  // counters

  var eventsCount = 0;
  var eventDeletionsCount = 0;
  var states = {
    A_BEFORE_EVENTS: 0,
    B_IN_EVENTS: 1,
    D_AFTER_EVENTS: 2
  };
  var state = states.A_BEFORE_EVENTS;

  function processBuffer() {
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

  function searchStartEvents() {
    // search for "events": and happend any info before to the body 
    var n = buffer.indexOf(EVENTMARKERS[eventOrEventDeletions]);

    if (n > 0) {
      if (eventOrEventDeletions === 0) {
        // do only once
        body = buffer.substring(0, n);
      }

      buffer = buffer.substr(n + EVENTMARKERS[eventOrEventDeletions].length);
      state = states.B_IN_EVENTS;
      processEvents();
    }
  }

  function processEvents() {
    /// ---- in Event
    while (cursorPos < buffer.length && state === states.B_IN_EVENTS) {
      if (skipNextOne) {
        // ignore next character
        skipNextOne = false;
        cursorPos++;
        continue;
      }

      switch (buffer.charCodeAt(cursorPos)) {
        case 93:
          // ]
          if (depth === 0) {
            // end of events
            if (cursorPos !== 0) {
              throw new Error('Found trailling ] in mid-course');
            }

            if (eventOrEventDeletions === 0 && includeDeletions) {
              state = states.A_BEFORE_EVENTS;
              eventOrEventDeletions = 1; // now look for eventDeletions

              return;
            } else {
              // done 
              state = states.D_AFTER_EVENTS;
              var eventsOrDeletionMsg = '';

              if (eventOrEventDeletions === 1) {
                eventsOrDeletionMsg = '"eventDeletionsCount":' + eventDeletionsCount + ',';
              }

              buffer = eventsOrDeletionMsg + '"eventsCount":' + eventsCount + '' + buffer.substr(1);
            }
          }

          break;

        case 92:
          // \
          skipNextOne = true;
          break;

        case 123:
          // {
          if (!inString) depth++;
          break;

        case 34:
          // "
          inString = !inString;
          break;

        case 125:
          // }
          if (!inString) depth--;

          if (depth === 0) {
            // ignore possible coma ',' if first char
            var ignoreComa = buffer.charCodeAt(0) === 44 ? 1 : 0;
            var eventStr = buffer.substring(ignoreComa, cursorPos + 1);

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

  function afterEvents() {
    // just happend the end of message;
    body += buffer;
    buffer = '';
    return;
  }

  return function (res, fn) {
    res.setEncoding('utf8'); // Already UTF8 in browsers

    res.on('data', function (chunk) {
      buffer += chunk;
      processBuffer();
    });
    res.on('end', function () {
      var err;
      var bodyObject;

      try {
        res.text = body + buffer;
        bodyObject = res.text && JSON.parse(res.text);
      } catch (err_) {
        err = err_; // issue #675: return the raw response if the response parsing fails

        err.rawResponse = res.text || null; // issue #876: return the http status code if the response parsing fails

        err.statusCode = res.statusCode;
      } finally {
        fn(err, bodyObject);
      }
    });
  }; /// --- Direct Push

  function addEvent(strEvent) {
    foreachEvent(JSON.parse(strEvent));
  }
};

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var regexAPIandToken = /(.+):\/\/(.+)@(.+)/gm;
var regexSchemaAndPath = /(.+):\/\/(.+)/gm;
/**
 * Utilities to access Pryv API.
 * Exposes superagent and methods to manipulate Pryv's api endpoints 
 * @memberof Pryv
 * @namespace Pryv.utils
 */

var utils = {
  /**
   * Exposes superagent https://visionmedia.github.io/superagent/
   * @memberof Pryv.utils
   * @property {Superagent} superagent 
   */
  superagent: __webpack_require__(/*! superagent */ "./node_modules/superagent/lib/client.js"),

  /**
   * Returns true is run in a browser
   * @memberof Pryv.utils
   * @returns {boolean}
   */
  isBrowser: function isBrowser() {
    return typeof window !== 'undefined';
  },

  /**
   * From a PryvApiEndpoint URL, return an object (TokenAndAPI) with two properties
   * @memberof Pryv.utils
   * @param {PryvApiEndpoint} pryvApiEndpoint
   * @returns {TokenAndEndpoint}
   */
  extractTokenAndApiEndpoint: function extractTokenAndApiEndpoint(pryvApiEndpoint) {
    regexAPIandToken.lastIndex = 0;
    var res = regexAPIandToken.exec(pryvApiEndpoint);

    if (res !== null) {
      // has token
      // add a trailing '/' to end point if missing
      if (!res[3].endsWith('/')) {
        res[3] += '/';
      }

      return {
        endpoint: res[1] + '://' + res[3],
        token: res[2]
      };
    } // else check if valid url


    regexSchemaAndPath.lastIndex = 0;
    var res2 = regexSchemaAndPath.exec(pryvApiEndpoint);

    if (res2 === null) {
      throw new Error('Cannot find endpoint, invalid URL format');
    } // add a trailing '/' to end point if missing


    if (!res2[2].endsWith('/')) {
      res2[2] += '/';
    }

    return {
      endpoint: res2[1] + '://' + res2[2],
      token: null
    };
  },

  /**
   * Get a PryvApiEndpoint URL from a TokenAndAPI object
   * @memberof Pryv.utils
   * @param {TokenAndEndpoint} tokenAndApi
   * @returns {PryvApiEndpoint}
   */
  buildPryvApiEndPoint: function buildPryvApiEndPoint(tokenAndApi) {
    if (!tokenAndApi.token) {
      var _res = tokenAndApi.endpoint + '';

      if (!tokenAndApi.endpoint.endsWith('/')) {
        _res += '/';
      }

      return _res;
    }

    regexSchemaAndPath.lastIndex = 0;
    var res = regexSchemaAndPath.exec(tokenAndApi.endpoint); // add a trailing '/' to end point if missing

    if (!res[2].endsWith('/')) {
      res[2] += '/';
    }

    return res[1] + '://' + tokenAndApi.token + '@' + res[2];
  }
};
module.exports = utils; // --------------- typedfs ------------------------------- //

/**
 * An object with two properties: token & apiEndpoint
 * @typedef {Object} TokenAndEndpoint
 * @property {string}  [token] Authorization token
 * @property {string}  endpoint url of Pryv api endpoint
 */

/**
 * A String url of the form http(s)://{token}@{apiEndpoint}
 * @typedef {string} PryvApiEndpoint
 */

/**
 * Common Meta are returned by each standard call on the API https://api.pryv.com/reference/#in-method-results
 * @typedef {Object} CommonMeta
 * @property {string} apiVersion The version of the API in the form {major}.{minor}.{revision}. Mirrored in HTTP header API-Version.
 * @property {number} serverTime The current server time as a timestamp in second. Keeping track of server time is necessary to properly handle time in API calls.
 * @property {string} serial The serial will change every time the core or register is updated. If you compare it with the serial of a previous response and notice a difference, you should reload the service information.
 */

/***/ }),

/***/ "./test/Browser.AuthController.test.js":
/*!*********************************************!*\
  !*** ./test/Browser.AuthController.test.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var should = chai.should();
var expect = chai.expect;

var AuthController = __webpack_require__(/*! ../src/Browser/AuthController.js */ "./src/Browser/AuthController.js");

describe('Browser.AuthController', function () {
  it('getReturnURL()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var myUrl, error, fakeNavigator;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            myUrl = 'https://mysite.com/bobby';
            error = null;

            try {
              AuthController.getReturnURL('auto');
            } catch (e) {
              error = e;
            }

            expect(error).to.be.not["null"];
            fakeNavigator = {
              userAgent: 'android'
            };
            expect(AuthController.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(myUrl + '#');
            expect(AuthController.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
            expect(AuthController.getReturnURL(false, myUrl, fakeNavigator)).to.equal(myUrl + '#');
            expect(AuthController.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
            expect(AuthController.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');
            fakeNavigator = {
              userAgent: 'Safari'
            };
            expect(AuthController.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(false);
            expect(AuthController.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(false);
            expect(AuthController.getReturnURL(false, myUrl, fakeNavigator)).to.equal(false);
            expect(AuthController.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
            expect(AuthController.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');
            global.window = {
              location: {
                href: myUrl + '?prYvstatus=zouzou'
              }
            };
            expect(AuthController.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  it('browserIsMobileOrTablet()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            expect(AuthController.browserIsMobileOrTablet({
              userAgent: 'android'
            })).to.be["true"];
            expect(AuthController.browserIsMobileOrTablet({
              userAgent: 'Safari'
            })).to.be["false"];

          case 2:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it('getStatusFromURL()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            expect('2jsadh').to.equal(AuthController.getStatusFromURL('https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));
  it('getServiceInfoFromURL()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var serviceInfoUrl;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            serviceInfoUrl = AuthController.getServiceInfoFromURL('https://my.Url.com/?bobby=2&prYvZoutOu=1&pryvServiceInfoUrl=' + encodeURIComponent('https://reg.pryv.me/service/infos'));
            expect('https://reg.pryv.me/service/infos').to.equal(serviceInfoUrl);

          case 2:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));
  it('cleanURLFromPrYvParams()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            expect('https://my.Url.com/?bobby=2').to.equal(AuthController.cleanURLFromPrYvParams('https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
            expect('https://my.Url.com/?pryvServiceInfoUrl=zzz').to.equal(AuthController.cleanURLFromPrYvParams('https://my.Url.com/?pryvServiceInfoUrl=zzz#prYvZoutOu=1&prYvstatus=2jsadh'));
            expect('https://my.Url.com/').to.equal(AuthController.cleanURLFromPrYvParams('https://my.Url.com/?prYvstatus=2jsadh'));
            expect('https://my.Url.com/').to.equal(AuthController.cleanURLFromPrYvParams('https://my.Url.com/#prYvstatus=2jsadh'));
            expect('https://my.Url.com/#bobby=2').to.equal(AuthController.cleanURLFromPrYvParams('https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  })));
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./test/Browser.test.js":
/*!******************************!*\
  !*** ./test/Browser.test.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var should = chai.should();
var expect = chai.expect;

var testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

function genSettings() {
  function defaultStateChange(state) {
    console.log('Test unimplemented on state change', state);
  }

  return {
    authRequest: {
      requestingAppId: 'lib-js-test',
      requestedPermissions: [{
        streamId: '*',
        level: 'read'
      }]
    },
    onStateChange: defaultStateChange
  };
}

describe('Browser', function () {
  this.timeout(5000);
  var removeZombie = false;
  before(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var browser;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof document !== 'undefined')) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            // in browser
            removeZombie = true;
            browser = new Browser();
            browser.visit('./?pryvServiceInfoUrl=https://zouzou.com/service/info');
            global.document = browser.document;
            global.window = browser.window;
            global.location = browser.location;
            global.navigator = {
              userAgent: 'Safari'
            };

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  after(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (removeZombie) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return");

          case 2:
            // in browser
            delete global.document;
            delete global.window;
            delete global.location;

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it('setupAuth()', function (done) {
    var settings = genSettings();
    var AuthLoaded = false;
    var ServiceInfoLoaded = false;

    settings.onStateChange = function (state) {
      should.exist(state.id);

      if (state.id == Pryv.Browser.AuthStates.LOADING) {
        AuthLoaded = true;
      }

      if (state.id == Pryv.Browser.AuthStates.INITIALIZED) {
        expect(AuthLoaded).to["true"];
        done();
      }
    };

    Pryv.Browser.setupAuth(settings, testData.defaults.serviceInfoUrl).then(function (service) {
      var serviceInfo = service.infoSync();
      should.exist(serviceInfo.access);
      should.exist(serviceInfo.serial);
    })["catch"](function (error) {
      console.log(error);
      should.not.exist(error);
      done();
    });
  });
  it('serviceInfoFromUrl()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            expect('https://zouzou.com/service/info').to.equal(Pryv.Browser.serviceInfoFromUrl());

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./test/Connection.test.js":
/*!*********************************!*\
  !*** ./test/Connection.test.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var should = chai.should();
var expect = chai.expect;

var testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

var conn = new Pryv.Connection(testData.pryvApiEndPoints[0]);

var _require = __webpack_require__(/*! universal-url */ "./node_modules/universal-url/browser.js"),
    URL = _require.URL,
    URLSearchParams = _require.URLSearchParams;

describe('Connection', function () {
  describe('.api()', function () {
    this.timeout(5000);
    it('.api() events.get',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var res;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return conn.api([{
                method: "events.get",
                params: {}
              }]);

            case 2:
              res = _context.sent;
              res.length.should.equal(1);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));
    it('.api() events.get split in chunks',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      var res;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              conn.options.chunkSize = 2;
              _context2.next = 3;
              return conn.api([{
                method: "events.get",
                params: {}
              }, {
                method: "events.get",
                params: {}
              }, {
                method: "events.get",
                params: {}
              }]);

            case 3:
              res = _context2.sent;
              res.length.should.equal(3);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })));
    it('.api() events.get with handleResult call',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var resultsRecievedCount, oneMoreResult, res;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              oneMoreResult = function _ref4(res) {
                should.exist(res.events);
                resultsRecievedCount++;
              };

              conn.options.chunkSize = 2;
              resultsRecievedCount = 0;
              _context3.next = 5;
              return conn.api([{
                method: "events.get",
                params: {},
                handleResult: oneMoreResult
              }, {
                method: "events.get",
                params: {},
                handleResult: oneMoreResult
              }, {
                method: "events.get",
                params: {},
                handleResult: oneMoreResult
              }]);

            case 5:
              res = _context3.sent;
              res.length.should.equal(3);
              res.length.should.equal(resultsRecievedCount);

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })));
    it('.api() events.get with async handleResult call',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var resultsRecievedCount, oneMoreResult, _oneMoreResult, res;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _oneMoreResult = function _ref7() {
                _oneMoreResult = _asyncToGenerator(
                /*#__PURE__*/
                regeneratorRuntime.mark(function _callee4(res) {
                  var promise;
                  return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          should.exist(res.events);
                          promise = new Promise(function (res, rej) {
                            setTimeout(function () {
                              return res("Now it's done!");
                            }, 100);
                          }); // wait until the promise returns us a value

                          _context4.next = 4;
                          return promise;

                        case 4:
                          resultsRecievedCount++;

                        case 5:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  }, _callee4);
                }));
                return _oneMoreResult.apply(this, arguments);
              };

              oneMoreResult = function _ref6(_x) {
                return _oneMoreResult.apply(this, arguments);
              };

              conn.options.chunkSize = 2;
              resultsRecievedCount = 0;
              _context5.next = 6;
              return conn.api([{
                method: "events.get",
                params: {},
                handleResult: oneMoreResult
              }, {
                method: "events.get",
                params: {},
                handleResult: oneMoreResult
              }, {
                method: "events.get",
                params: {},
                handleResult: oneMoreResult
              }]);

            case 6:
              res = _context5.sent;
              res.length.should.equal(3);
              res.length.should.equal(resultsRecievedCount);

            case 9:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    })));
    it('.api() events.get split in chunks and send percentages',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6() {
      var percentres, count, res;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              conn.options.chunkSize = 2;
              percentres = {
                1: 67,
                2: 100
              };
              count = 1;
              _context6.next = 5;
              return conn.api([{
                method: "events.get",
                params: {}
              }, {
                method: "events.get",
                params: {}
              }, {
                method: "events.get",
                params: {}
              }], function (percent) {
                percent.should.equal(percentres[count]);
                count++;
              });

            case 5:
              res = _context6.sent;
              res.length.should.equal(3);

            case 7:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    })));
    it('.api() with callbacks', function (done) {
      conn.api([{
        method: "events.get",
        params: {}
      }]).then(function (res) {
        res.length.should.equal(1);
        done();
      }, function (err) {
        should.not.exist(err);
        done();
      });
    });
  });
  describe('Attachements', function () {
    it('Create event with attachemnt',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7() {
      var res, formData, blob;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              res = null;

              if (!(typeof window === 'undefined')) {
                _context7.next = 7;
                break;
              }

              _context7.next = 4;
              return conn.createEventWithFile({
                type: 'picture/attached',
                streamId: 'data'
              }, './test/Y.png');

            case 4:
              res = _context7.sent;
              _context7.next = 13;
              break;

            case 7:
              // browser
              formData = new FormData();
              blob = new Blob(['Hello'], {
                type: "text/txt"
              });
              formData.append("webmasterfile", blob);
              _context7.next = 12;
              return conn.createEventWithFormData({
                type: 'file/attached',
                streamId: 'data'
              }, formData);

            case 12:
              res = _context7.sent;

            case 13:
              should.exist(res);
              should.exist(res.event);
              should.exist(res.event.attachments);
              res.event.attachments.length.should.equal(1);

            case 17:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    })));
  });
  describe('HF events', function () {
    it('Add data points to HF event',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee8() {
      var res, event, res2;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return conn.api([{
                method: 'events.create',
                params: {
                  type: 'series:mass/kg',
                  streamId: 'data'
                }
              }]);

            case 2:
              res = _context8.sent;
              should.exist(res);
              should.exist(res[0]);
              should.exist(res[0].event);
              should.exist(res[0].event.id);
              event = res[0].event;
              _context8.next = 10;
              return conn.addPointsToHFEvent(event.id, ['deltaTime', 'value'], [[0, 1], [1, 1]]);

            case 10:
              res2 = _context8.sent;
              should.exist(res2);
              'ok'.should.equal(res2.status);

            case 13:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    })));
  });
  describe('.get()', function () {
    it('/events',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee9() {
      var res;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return conn.get('events', {
                limit: 1
              });

            case 2:
              res = _context9.sent;
              res.events.length.should.equal(1);

            case 4:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    })));
  });
  describe('time', function () {
    it('deltatime property',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee10() {
      var deltaTime;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return conn.get('events', {
                limit: 1
              });

            case 2:
              deltaTime = conn.deltaTime;
              expect(Math.abs(deltaTime) < 2).to.be["true"];

            case 4:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10);
    })));
  });
  describe('API', function () {
    it('endpoint property',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee11() {
      var apiEndpoint;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              apiEndpoint = conn.apiEndpoint;
              expect(apiEndpoint.startsWith('https://' + conn.token + '@')).to.be["true"];

            case 2:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11);
    })));
  });
  describe('Streamed event get', function () {
    this.timeout(5000);
    var now = new Date().getTime() / 1000;
    describe('Node & Browser', function () {
      it('streaming ',
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12() {
        var queryParams, eventsCount, forEachEvent, res;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                forEachEvent = function _ref15(event) {
                  eventsCount++;
                };

                queryParams = {
                  fromTime: 0,
                  toTime: now,
                  limit: 10000
                };
                eventsCount = 0;
                _context12.next = 5;
                return conn.getEventsStreamed(queryParams, forEachEvent);

              case 5:
                res = _context12.sent;
                expect(eventsCount).to.equal(res.eventsCount);

              case 7:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12);
      })));
      it('streaming includesDeletion',
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee13() {
        var queryParams, eventsCount, trashedCount, deletedCount, forEachEvent, res;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                forEachEvent = function _ref17(event) {
                  if (event.trashed) {
                    trashedCount++;
                  } else if (event.deleted) {
                    deletedCount++;
                  } else {
                    eventsCount++;
                  }
                };

                queryParams = {
                  fromTime: 0,
                  toTime: now,
                  limit: 10000,
                  includeDeletions: true,
                  modifiedSince: 0
                };
                eventsCount = 0;
                trashedCount = 0;
                deletedCount = 0;
                _context13.next = 7;
                return conn.getEventsStreamed(queryParams, forEachEvent);

              case 7:
                res = _context13.sent;
                expect(eventsCount).to.equal(res.eventsCount);
                expect(trashedCount + deletedCount).to.equal(res.eventDeletionsCount);
                expect(eventsCount).to.be.gt(1);
                expect(deletedCount).to.be.gt(1);
                expect(trashedCount).to.be.gt(1);

              case 13:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee13);
      })));
      it('no-events ',
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee14() {
        var queryParams, forEachEvent, res;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                forEachEvent = function _ref19(event) {};

                queryParams = {
                  fromTime: 0,
                  toTime: now,
                  tags: ['RANDOM-123']
                };
                _context14.next = 4;
                return conn.getEventsStreamed(queryParams, forEachEvent);

              case 4:
                res = _context14.sent;
                expect(0).to.equal(res.eventsCount);

              case 6:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14);
      })));
      it('no-events includeDeletions',
      /*#__PURE__*/
      _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee15() {
        var queryParams, forEachEvent, res;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                forEachEvent = function _ref21(event) {};

                queryParams = {
                  fromTime: 0,
                  toTime: now,
                  tags: ['RANDOM-123'],
                  includeDeletions: true,
                  modifiedSince: 0
                };
                _context15.next = 4;
                return conn.getEventsStreamed(queryParams, forEachEvent);

              case 4:
                res = _context15.sent;
                expect(0).to.equal(res.eventsCount);
                expect(res.eventDeletionsCount).to.be.gte(0);

              case 7:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15);
      })));
    });

    if (typeof window === 'undefined') {
      describe('Browser mock', function () {
        beforeEach(function () {
          var browser = new Browser();
          browser.visit('./');
          global.document = browser.document;
          global.window = browser.window;
          global.location = browser.location;

          function fetch() {
            return browser.fetch.apply(browser, arguments);
          }

          global.fetch = fetch;
          global.URL = URL;
          global.URLSearchParams = URLSearchParams;
        });
        afterEach(function () {
          delete global.document;
          delete global.window;
          delete global.location;
          delete global.fetch;
          delete global.URL;
          delete global.URLSearchParams;
        });
        it(' without fetch',
        /*#__PURE__*/
        _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee16() {
          var queryParams, eventsCount, forEachEvent, res;
          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  forEachEvent = function _ref23(event) {
                    eventsCount++;
                  };

                  delete global.fetch;
                  queryParams = {
                    fromTime: 0,
                    toTime: now,
                    limit: 10000
                  };
                  eventsCount = 0;
                  _context16.next = 6;
                  return conn.getEventsStreamed(queryParams, forEachEvent);

                case 6:
                  res = _context16.sent;
                  expect(eventsCount).to.equal(res.eventsCount);

                case 8:
                case "end":
                  return _context16.stop();
              }
            }
          }, _callee16);
        })));
        xit(' with fetch',
        /*#__PURE__*/
        _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee17() {
          var queryParams, eventsCount, forEachEvent, res;
          return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  forEachEvent = function _ref25(event) {
                    eventsCount++;
                  };

                  queryParams = {
                    fromTime: 0,
                    toTime: now,
                    limit: 10000
                  };
                  eventsCount = 0;
                  _context17.next = 5;
                  return conn.getEventsStreamed(queryParams, forEachEvent);

                case 5:
                  res = _context17.sent;
                  expect(eventsCount).to.equal(res.eventsCount);

                case 7:
                case "end":
                  return _context17.stop();
              }
            }
          }, _callee17);
        })));
      });
    }
  });
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./test/Service.test.js":
/*!******************************!*\
  !*** ./test/Service.test.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var should = chai.should();
var expect = chai.expect;
var assert = chai.assert;

var chaiAsPromised = __webpack_require__(/*! chai-as-promised */ "./node_modules/chai-as-promised/lib/chai-as-promised.js");

chai.use(chaiAsPromised);

var testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

describe('Service', function () {
  it('info()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var pryvService, res;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
            _context.next = 3;
            return pryvService.info();

          case 3:
            res = _context.sent;
            should.exist(res);
            ['access', 'api', 'register'].forEach(function (key) {
              should.exist(res[key]); // all API endpoints should end with a '/';

              res[key].slice(-1).should.equal('/');
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  it('info() 2x ',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var pryvService, res, res2;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
            _context2.next = 3;
            return pryvService.info();

          case 3:
            res = _context2.sent;
            should.exist(res);
            should.exist(res.access);
            _context2.next = 8;
            return pryvService.info();

          case 8:
            res2 = _context2.sent;
            should.exist(res2);
            should.exist(res2.access);

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it('login()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var pryvService, conn;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            this.timeout(5000);
            pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
            _context3.next = 4;
            return pryvService.login(testData.defaults.user.split('.')[0], testData.defaults.password, 'jslib-test');

          case 4:
            conn = _context3.sent;
            should.exist(conn);
            should.exist(conn.token);
            should.exist(conn.endpoint);
            expect(conn.endpoint.includes(testData.defaults.user)).to.equal(true);

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  })));
  it('assets()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var pryvService, assets, assets2;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
            _context4.next = 3;
            return pryvService.assets();

          case 3:
            assets = _context4.sent;
            should.exist(assets); //assets should be cached

            _context4.next = 7;
            return pryvService.assets();

          case 7:
            assets2 = _context4.sent;
            expect(assets).to.equal(assets2);

          case 9:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));
  describe('Errors',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8() {
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            it('Throw error with invalid content',
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee5() {
              var service;
              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      service = new Pryv.Service(null, {});
                      _context5.next = 3;
                      return assert.isRejected(service.info(), 'Invalid data from service/info');

                    case 3:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5);
            })));
            it('Warn if no assets',
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee6() {
              var serviceInfoCopy, pryvService, assets;
              return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      serviceInfoCopy = Object.assign({}, testData.defaults.serviceInfoSettings);
                      delete serviceInfoCopy.assets;
                      pryvService = new Pryv.Service(null, serviceInfoCopy);
                      _context6.next = 5;
                      return pryvService.assets();

                    case 5:
                      assets = _context6.sent;
                      expect(assets).to.be["null"];

                    case 7:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, _callee6);
            })));
            it('login() failed',
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee7() {
              var pryvService;
              return regeneratorRuntime.wrap(function _callee7$(_context7) {
                while (1) {
                  switch (_context7.prev = _context7.next) {
                    case 0:
                      this.timeout(5000);
                      pryvService = new Pryv.Service(testData.defaults.serviceInfoUrl);
                      _context7.next = 4;
                      return assert.isRejected(pryvService.login(testData.defaults.user.split('.')[0], 'bobby', 'jslib-test'), 'The given username/password pair is invalid.');

                    case 4:
                    case "end":
                      return _context7.stop();
                  }
                }
              }, _callee7, this);
            })));

          case 3:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  })));
});

/***/ }),

/***/ "./test/ServiceAssets.test.js":
/*!************************************!*\
  !*** ./test/ServiceAssets.test.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var expect = chai.expect;

var testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

describe('ServiceAssets', function () {
  var removeZombie = false;
  before(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var browser;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof document !== 'undefined')) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            // in browser
            removeZombie = true;
            browser = new Browser();
            browser.visit('./');
            global.document = browser.document;
            global.window = browser.window;
            global.location = browser.location;

          case 8:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
  after(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (removeZombie) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt("return");

          case 2:
            // in browser
            delete global.document;
            delete global.window;
            delete global.location;

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  })));
  it('relativeURL()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var pryvService, assets;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
            _context3.next = 3;
            return pryvService.assets();

          case 3:
            assets = _context3.sent;
            expect(assets.relativeURL('./toto')).to.eql('https://pryv.github.io:/assets-pryv.me/toto');

          case 5:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));
  it('setAllDefaults()',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var pryvService, assets;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
            _context4.next = 3;
            return pryvService.assets();

          case 3:
            assets = _context4.sent;
            _context4.next = 6;
            return assets.setAllDefaults();

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));
  it('Load all external elements',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var pryvService, assets;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
            _context5.next = 3;
            return pryvService.assets();

          case 3:
            assets = _context5.sent;
            _context5.next = 6;
            return assets.loginButtonLoadCSS();

          case 6:
            _context5.next = 8;
            return assets.loginButtonGetHTML();

          case 8:
            _context5.next = 10;
            return assets.loginButtonGetMessages();

          case 10:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  })));
  it('.get() returns all assets',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6() {
    var pryvService, assets, allAssets;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
            _context6.next = 3;
            return pryvService.assets();

          case 3:
            assets = _context6.sent;
            _context6.next = 6;
            return assets.get();

          case 6:
            allAssets = _context6.sent;
            expect(allAssets.favicon["default"].url).to.eql('favicon.ico');

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  })));
  it('.get(keyPath) ',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee7() {
    var pryvService, assets, faviconUrl;
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
            _context7.next = 3;
            return pryvService.assets();

          case 3:
            assets = _context7.sent;
            _context7.next = 6;
            return assets.get('favicon:default:url');

          case 6:
            faviconUrl = _context7.sent;
            expect(faviconUrl).to.eql('favicon.ico');

          case 8:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  })));
  it('.getUrl(keyPath) ',
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8() {
    var pryvService, assets, faviconUrl;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            pryvService = new Pryv.Service(null, testData.defaults.serviceInfoSettings);
            _context8.next = 3;
            return pryvService.assets();

          case 3:
            assets = _context8.sent;
            _context8.next = 6;
            return assets.getUrl('favicon:default:url');

          case 6:
            faviconUrl = _context8.sent;
            expect(faviconUrl).to.eql('https://pryv.github.io:/assets-pryv.me/favicon.ico');

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  })));
});
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./test/browser-index.js":
/*!*******************************!*\
  !*** ./test/browser-index.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Entry Point for WebPack to build test series to be run in browser
 */
mocha.setup({
  ignoreLeaks: true
});

__webpack_require__(/*! ./utils.test.js */ "./test/utils.test.js");

__webpack_require__(/*! ./Connection.test.js */ "./test/Connection.test.js");

__webpack_require__(/*! ./Service.test.js */ "./test/Service.test.js");

__webpack_require__(/*! ./ServiceAssets.test.js */ "./test/ServiceAssets.test.js");

__webpack_require__(/*! ./Browser.test.js */ "./test/Browser.test.js");

__webpack_require__(/*! ./Browser.AuthController.test.js */ "./test/Browser.AuthController.test.js");

/***/ }),

/***/ "./test/test-data.js":
/*!***************************!*\
  !*** ./test/test-data.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Data used for tests
 */
var defaults = {
  user: 'jslibtest.pryv.me',
  password: 'jslibtest',
  token: 'ck60yn9yv00011hd3vu1ocpi7',
  serviceInfoUrl: 'https://reg.pryv.me/service/info',
  serviceInfoSettings: {
    "register": "https://reg.pryv.me",
    "access": "https://access.pryv.me/access",
    "api": "https://{username}.pryv.me/",
    "name": "Pryv Lab",
    "home": "https://www.pryv.com",
    "support": "https://pryv.com/helpdesk",
    "terms": "https://pryv.com/pryv-lab-terms-of-use/",
    "eventTypes": "https://api.pryv.com/event-types/flat.json",
    "assets": {
      "definitions": "https://pryv.github.io/assets-pryv.me/index.json"
    }
  }
};
module.exports = {
  defaults: defaults,
  pryvApiEndPoints: ['https://' + defaults.token + '@' + defaults.user, 'https://' + defaults.user]
};

/***/ }),

/***/ "./test/utils.test.js":
/*!****************************!*\
  !*** ./test/utils.test.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var should = chai.should();

var testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

describe('utils', function () {
  it('extractTokenAndApiEndpoint', function (done) {
    var tokenAndAPI = Pryv.utils.extractTokenAndApiEndpoint(testData.pryvApiEndPoints[0]);
    testData.defaults.token.should.equals(tokenAndAPI.token);
    ('https://' + testData.defaults.user + '/').should.equals(tokenAndAPI.endpoint);
    done();
  });
  it('extractTokenAndApiEndpoint should work without token', function (done) {
    var tokenAndAPI = Pryv.utils.extractTokenAndApiEndpoint(testData.pryvApiEndPoints[1]);
    should.not.exist(tokenAndAPI.token);
    ('https://' + testData.defaults.user + '/').should.equals(tokenAndAPI.endpoint);
    done();
  });
  it('extractTokenAndApiEndpoint should fail on invalid url', function (done) {
    var error = null;

    try {
      var tokenAndAPI = Pryv.utils.extractTokenAndApiEndpoint('blip');
    } catch (e) {
      error = e;
      return done();
    }

    should.exist(error);
  });
  it('buildAPIEndpoint with token', function (done) {
    var apiEndPoint = Pryv.utils.buildPryvApiEndPoint({
      token: testData.defaults.token,
      endpoint: 'https://' + testData.defaults.user
    });
    apiEndPoint.should.equals(testData.pryvApiEndPoints[0] + '/');
    done();
  });
  it('buildAPIEndpoint without token', function (done) {
    var apiEndPoint = Pryv.utils.buildPryvApiEndPoint({
      token: null,
      endpoint: 'https://' + testData.defaults.user
    });
    apiEndPoint.should.equals('https://' + testData.defaults.user + '/');
    done();
  });
});

/***/ })

/******/ });
//# sourceMappingURL=browser-tests.js.map