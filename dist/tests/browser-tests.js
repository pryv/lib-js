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

/***/ "./test/Connection.test.js":
/*!*********************************!*\
  !*** ./test/Connection.test.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var should = chai.should();
var expect = chai.expect();

var testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

var conn = new Pryv.Connection(testData.pryvApiEndPoints[0]);
describe('Connection', function () {
  describe('.api()', function () {
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
                "method": "events.get",
                "params": {}
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
                "method": "events.get",
                "params": {}
              }, {
                "method": "events.get",
                "params": {}
              }, {
                "method": "events.get",
                "params": {}
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
    it('.api() with callbacks', function (done) {
      conn.api([{
        "method": "events.get",
        "params": {}
      }]).then(function (res) {
        res.length.should.equal(1);
        done();
      }, function (err) {
        should.not.exist(err);
        done();
      });
    });
  });
  describe('.get()', function () {
    it('/events',
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var res;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return conn.get('events', {
                limit: 1
              });

            case 2:
              res = _context3.sent;
              res.events.length.should.equal(1);

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })));
  });
});

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
            should.exist(res.access);

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })));
});

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
__webpack_require__(/*! ./utils.test.js */ "./test/utils.test.js");

__webpack_require__(/*! ./Connection.test.js */ "./test/Connection.test.js");

__webpack_require__(/*! ./Service.test.js */ "./test/Service.test.js");

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
  user: 'marianne.pryv.me',
  token: 'ck48a23l000hn1g40xjjg1y0i',
  serviceInfoUrl: 'https://reg.pryv.me/service/info'
};
module.exports = {
  defaults: defaults,
  pryvApiEndPoints: ['https://' + defaults.token + '@' + defaults.user]
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
});

/***/ })

/******/ });
//# sourceMappingURL=browser-tests.js.map