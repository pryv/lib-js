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

eval("const should = chai.should();\nconst expect = chai.expect();\n\n\nconst testData = __webpack_require__(/*! ./test-data.js */ \"./test/test-data.js\");\n\nconst conn = new Pryv.Connection(testData.pryvApiEndPoints[0]);\n\ndescribe('Connection', function () {\n  it('.api() events.get', async () => {\n    const res = await conn.api(\n      [\n        {\n          \"method\": \"events.get\",\n          \"params\": {}\n        }\n      ]);\n    res.length.should.equal(1);\n  });\n\n  it('.api() events.get split in chunks', async () => {\n    conn.options.chunkSize = 2;\n    const res = await conn.api(\n      [\n        { \"method\": \"events.get\", \"params\": {} },\n        { \"method\": \"events.get\", \"params\": {} },\n        { \"method\": \"events.get\", \"params\": {} }\n      ]);\n    res.length.should.equal(3);\n\n  });\n\n  it('.api() with callbacks', function (done) {\n    conn.api(\n      [\n        { \"method\": \"events.get\", \"params\": {} }\n      ]).then((res) => {\n        res.length.should.equal(1);\n        done();\n      }, (err) => {\n        should.not.exist(err);\n        done();\n      });\n\n  });\n});\n\n//# sourceURL=webpack://browserTest/./test/Connection.test.js?");

/***/ }),

/***/ "./test/browser-index.js":
/*!*******************************!*\
  !*** ./test/browser-index.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/**\n * Entry Point for WebPack to build test series to be run in browser\n */\n__webpack_require__(/*! ./utils.test.js */ \"./test/utils.test.js\");\n__webpack_require__(/*! ./Connection.test.js */ \"./test/Connection.test.js\");\n\n//# sourceURL=webpack://browserTest/./test/browser-index.js?");

/***/ }),

/***/ "./test/test-data.js":
/*!***************************!*\
  !*** ./test/test-data.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n * Data used for tests\n */\nconst defaults = {\n  user: 'marianne.pryv.me',\n  token: 'ck48a23l000hn1g40xjjg1y0i'\n}\n\nmodule.exports = {\n  defaults: defaults,\n  pryvApiEndPoints : [\n    'https://' + defaults.token + '@' + defaults.user\n  ]\n}\n\n//# sourceURL=webpack://browserTest/./test/test-data.js?");

/***/ }),

/***/ "./test/utils.test.js":
/*!****************************!*\
  !*** ./test/utils.test.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("\nconst should = chai.should();\n\nconst testData = __webpack_require__(/*! ./test-data.js */ \"./test/test-data.js\");\n\ndescribe('utils', function () {\n  it('extractTokenAndApiEndpoint', function (done) {\n    const tokenAndAPI = Pryv.utils\n      .extractTokenAndApiEndpoint(testData.pryvApiEndPoints[0]);\n    testData.defaults.token.should.equals(tokenAndAPI.token);\n\n    ('https://' + testData.defaults.user + '/').should.equals(tokenAndAPI.endpoint);\n\n    done();\n  });\n});\n\n\n\n\n//# sourceURL=webpack://browserTest/./test/utils.test.js?");

/***/ })

/******/ });