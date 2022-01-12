var browserTest;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/call-bind/callBound.js":
/*!*********************************************!*\
  !*** ./node_modules/call-bind/callBound.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var callBind = __webpack_require__(/*! ./ */ "./node_modules/call-bind/index.js");

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};


/***/ }),

/***/ "./node_modules/call-bind/index.js":
/*!*****************************************!*\
  !*** ./node_modules/call-bind/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = null;
	}
}

module.exports = function callBind(originalFunction) {
	var func = $reflectApply(bind, $call, arguments);
	if ($gOPD && $defineProperty) {
		var desc = $gOPD(func, 'length');
		if (desc.configurable) {
			// original length, plus the receiver, minus any additional arguments (after the receiver)
			$defineProperty(
				func,
				'length',
				{ value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) }
			);
		}
	}
	return func;
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}


/***/ }),

/***/ "./node_modules/chai-as-promised/lib/chai-as-promised.js":
/*!***************************************************************!*\
  !*** ./node_modules/chai-as-promised/lib/chai-as-promised.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

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
/***/ ((module) => {

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
/***/ ((module) => {


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

/***/ "./node_modules/cuid/index.js":
/*!************************************!*\
  !*** ./node_modules/cuid/index.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 *
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

var fingerprint = __webpack_require__(/*! ./lib/fingerprint.js */ "./node_modules/cuid/lib/fingerprint.browser.js");
var pad = __webpack_require__(/*! ./lib/pad.js */ "./node_modules/cuid/lib/pad.js");
var getRandomValue = __webpack_require__(/*! ./lib/getRandomValue.js */ "./node_modules/cuid/lib/getRandomValue.browser.js");

var c = 0,
  blockSize = 4,
  base = 36,
  discreteValues = Math.pow(base, blockSize);

function randomBlock () {
  return pad((getRandomValue() *
    discreteValues << 0)
    .toString(base), blockSize);
}

function safeCounter () {
  c = c < discreteValues ? c : 0;
  c++; // this is not subliminal
  return c - 1;
}

function cuid () {
  // Starting with a lowercase letter makes
  // it HTML element ID friendly.
  var letter = 'c', // hard-coded allows for sequential access

    // timestamp
    // warning: this exposes the exact date and time
    // that the uid was created.
    timestamp = (new Date().getTime()).toString(base),

    // Prevent same-machine collisions.
    counter = pad(safeCounter().toString(base), blockSize),

    // A few chars to generate distinct ids for different
    // clients (so different computers are far less
    // likely to generate the same id)
    print = fingerprint(),

    // Grab some more chars from Math.random()
    random = randomBlock() + randomBlock();

  return letter + timestamp + counter + print + random;
}

cuid.slug = function slug () {
  var date = new Date().getTime().toString(36),
    counter = safeCounter().toString(36).slice(-4),
    print = fingerprint().slice(0, 1) +
      fingerprint().slice(-1),
    random = randomBlock().slice(-2);

  return date.slice(-2) +
    counter + print + random;
};

cuid.isCuid = function isCuid (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  if (stringToCheck.startsWith('c')) return true;
  return false;
};

cuid.isSlug = function isSlug (stringToCheck) {
  if (typeof stringToCheck !== 'string') return false;
  var stringLength = stringToCheck.length;
  if (stringLength >= 7 && stringLength <= 10) return true;
  return false;
};

cuid.fingerprint = fingerprint;

module.exports = cuid;


/***/ }),

/***/ "./node_modules/cuid/lib/fingerprint.browser.js":
/*!******************************************************!*\
  !*** ./node_modules/cuid/lib/fingerprint.browser.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var pad = __webpack_require__(/*! ./pad.js */ "./node_modules/cuid/lib/pad.js");

var env = typeof window === 'object' ? window : self;
var globalCount = Object.keys(env).length;
var mimeTypesLength = navigator.mimeTypes ? navigator.mimeTypes.length : 0;
var clientId = pad((mimeTypesLength +
  navigator.userAgent.length).toString(36) +
  globalCount.toString(36), 4);

module.exports = function fingerprint () {
  return clientId;
};


/***/ }),

/***/ "./node_modules/cuid/lib/getRandomValue.browser.js":
/*!*********************************************************!*\
  !*** ./node_modules/cuid/lib/getRandomValue.browser.js ***!
  \*********************************************************/
/***/ ((module) => {


var getRandomValue;

var crypto = typeof window !== 'undefined' &&
  (window.crypto || window.msCrypto) ||
  typeof self !== 'undefined' &&
  self.crypto;

if (crypto) {
    var lim = Math.pow(2, 32) - 1;
    getRandomValue = function () {
        return Math.abs(crypto.getRandomValues(new Uint32Array(1))[0] / lim);
    };
} else {
    getRandomValue = Math.random;
}

module.exports = getRandomValue;


/***/ }),

/***/ "./node_modules/cuid/lib/pad.js":
/*!**************************************!*\
  !*** ./node_modules/cuid/lib/pad.js ***!
  \**************************************/
/***/ ((module) => {

module.exports = function pad (num, size) {
  var s = '000000000' + num;
  return s.substr(s.length - size);
};


/***/ }),

/***/ "./node_modules/fast-safe-stringify/index.js":
/*!***************************************************!*\
  !*** ./node_modules/fast-safe-stringify/index.js ***!
  \***************************************************/
/***/ ((module) => {

module.exports = stringify
stringify.default = stringify
stringify.stable = deterministicStringify
stringify.stableStringify = deterministicStringify

var LIMIT_REPLACE_NODE = '[...]'
var CIRCULAR_REPLACE_NODE = '[Circular]'

var arr = []
var replacerStack = []

function defaultOptions () {
  return {
    depthLimit: Number.MAX_SAFE_INTEGER,
    edgesLimit: Number.MAX_SAFE_INTEGER
  }
}

// Regular stringify
function stringify (obj, replacer, spacer, options) {
  if (typeof options === 'undefined') {
    options = defaultOptions()
  }

  decirc(obj, '', 0, [], undefined, 0, options)
  var res
  try {
    if (replacerStack.length === 0) {
      res = JSON.stringify(obj, replacer, spacer)
    } else {
      res = JSON.stringify(obj, replaceGetterValues(replacer), spacer)
    }
  } catch (_) {
    return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]')
  } finally {
    while (arr.length !== 0) {
      var part = arr.pop()
      if (part.length === 4) {
        Object.defineProperty(part[0], part[1], part[3])
      } else {
        part[0][part[1]] = part[2]
      }
    }
  }
  return res
}

function setReplace (replace, val, k, parent) {
  var propertyDescriptor = Object.getOwnPropertyDescriptor(parent, k)
  if (propertyDescriptor.get !== undefined) {
    if (propertyDescriptor.configurable) {
      Object.defineProperty(parent, k, { value: replace })
      arr.push([parent, k, val, propertyDescriptor])
    } else {
      replacerStack.push([val, k, replace])
    }
  } else {
    parent[k] = replace
    arr.push([parent, k, val])
  }
}

function decirc (val, k, edgeIndex, stack, parent, depth, options) {
  depth += 1
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        setReplace(CIRCULAR_REPLACE_NODE, val, k, parent)
        return
      }
    }

    if (
      typeof options.depthLimit !== 'undefined' &&
      depth > options.depthLimit
    ) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent)
      return
    }

    if (
      typeof options.edgesLimit !== 'undefined' &&
      edgeIndex + 1 > options.edgesLimit
    ) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent)
      return
    }

    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        decirc(val[i], i, i, stack, val, depth, options)
      }
    } else {
      var keys = Object.keys(val)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        decirc(val[key], key, i, stack, val, depth, options)
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

function deterministicStringify (obj, replacer, spacer, options) {
  if (typeof options === 'undefined') {
    options = defaultOptions()
  }

  var tmp = deterministicDecirc(obj, '', 0, [], undefined, 0, options) || obj
  var res
  try {
    if (replacerStack.length === 0) {
      res = JSON.stringify(tmp, replacer, spacer)
    } else {
      res = JSON.stringify(tmp, replaceGetterValues(replacer), spacer)
    }
  } catch (_) {
    return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]')
  } finally {
    // Ensure that we restore the object as it was.
    while (arr.length !== 0) {
      var part = arr.pop()
      if (part.length === 4) {
        Object.defineProperty(part[0], part[1], part[3])
      } else {
        part[0][part[1]] = part[2]
      }
    }
  }
  return res
}

function deterministicDecirc (val, k, edgeIndex, stack, parent, depth, options) {
  depth += 1
  var i
  if (typeof val === 'object' && val !== null) {
    for (i = 0; i < stack.length; i++) {
      if (stack[i] === val) {
        setReplace(CIRCULAR_REPLACE_NODE, val, k, parent)
        return
      }
    }
    try {
      if (typeof val.toJSON === 'function') {
        return
      }
    } catch (_) {
      return
    }

    if (
      typeof options.depthLimit !== 'undefined' &&
      depth > options.depthLimit
    ) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent)
      return
    }

    if (
      typeof options.edgesLimit !== 'undefined' &&
      edgeIndex + 1 > options.edgesLimit
    ) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent)
      return
    }

    stack.push(val)
    // Optimize for Arrays. Big arrays could kill the performance otherwise!
    if (Array.isArray(val)) {
      for (i = 0; i < val.length; i++) {
        deterministicDecirc(val[i], i, i, stack, val, depth, options)
      }
    } else {
      // Create a temporary object in the required way
      var tmp = {}
      var keys = Object.keys(val).sort(compareFunction)
      for (i = 0; i < keys.length; i++) {
        var key = keys[i]
        deterministicDecirc(val[key], key, i, stack, val, depth, options)
        tmp[key] = val[key]
      }
      if (typeof parent !== 'undefined') {
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
// and mark them as replaced value
function replaceGetterValues (replacer) {
  replacer =
    typeof replacer !== 'undefined'
      ? replacer
      : function (k, v) {
        return v
      }
  return function (key, val) {
    if (replacerStack.length > 0) {
      for (var i = 0; i < replacerStack.length; i++) {
        var part = replacerStack[i]
        if (part[1] === key && part[0] === val) {
          val = part[2]
          replacerStack.splice(i, 1)
          break
        }
      }
    }
    return replacer.call(this, key, val)
  }
}


/***/ }),

/***/ "./node_modules/function-bind/implementation.js":
/*!******************************************************!*\
  !*** ./node_modules/function-bind/implementation.js ***!
  \******************************************************/
/***/ ((module) => {

"use strict";


/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};


/***/ }),

/***/ "./node_modules/function-bind/index.js":
/*!*********************************************!*\
  !*** ./node_modules/function-bind/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/function-bind/implementation.js");

module.exports = Function.prototype.bind || implementation;


/***/ }),

/***/ "./node_modules/get-intrinsic/index.js":
/*!*********************************************!*\
  !*** ./node_modules/get-intrinsic/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var undefined;

var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = __webpack_require__(/*! has-symbols */ "./node_modules/has-symbols/index.js")();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': RangeError,
	'%ReferenceError%': ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var hasOwn = __webpack_require__(/*! has */ "./node_modules/has/src/index.js");
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};


/***/ }),

/***/ "./node_modules/has-symbols/index.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __webpack_require__(/*! ./shams */ "./node_modules/has-symbols/shams.js");

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};


/***/ }),

/***/ "./node_modules/has-symbols/shams.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/shams.js ***!
  \*******************************************/
/***/ ((module) => {

"use strict";


/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};


/***/ }),

/***/ "./node_modules/has/src/index.js":
/*!***************************************!*\
  !*** ./node_modules/has/src/index.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);


/***/ }),

/***/ "./node_modules/lodash.sortby/index.js":
/*!*********************************************!*\
  !*** ./node_modules/lodash.sortby/index.js ***!
  \*********************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
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
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

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


/***/ }),

/***/ "./node_modules/object-inspect/index.js":
/*!**********************************************!*\
  !*** ./node_modules/object-inspect/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var match = String.prototype.match;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol')
    ? Symbol.toStringTag
    : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;

var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || (
    [].__proto__ === Array.prototype // eslint-disable-line no-proto
        ? function (O) {
            return O.__proto__; // eslint-disable-line no-proto
        }
        : null
);

var inspectCustom = (__webpack_require__(/*! ./util.inspect */ "?4f7e").custom);
var inspectSymbol = inspectCustom && isSymbol(inspectCustom) ? inspectCustom : null;

module.exports = function inspect_(obj, options, depth, seen) {
    var opts = options || {};

    if (has(opts, 'quoteStyle') && (opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double')) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (
        has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number'
            ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
            : opts.maxStringLength !== null
        )
    ) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (
        has(opts, 'indent')
        && opts.indent !== null
        && opts.indent !== '\t'
        && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
    ) {
        throw new TypeError('options "indent" must be "\\t", an integer > 0, or `null`');
    }

    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        return String(obj);
    }
    if (typeof obj === 'bigint') {
        return String(obj) + 'n';
    }

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') { depth = 0; }
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]';
    }

    var indent = getIndent(opts, depth);

    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect(value, from, noIndent) {
        if (from) {
            seen = seen.slice();
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function') {
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + keys.join(', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? String(obj).replace(/^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + String(obj.nodeName).toLowerCase();
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) { s += '...'; }
        s += '</' + String(obj.nodeName).toLowerCase() + '>';
        return s;
    }
    if (isArray(obj)) {
        if (obj.length === 0) { return '[]'; }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + xs.join(', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (parts.length === 0) { return '[' + String(obj) + ']'; }
        return '{ [' + String(obj) + '] ' + parts.join(', ') + ' }';
    }
    if (typeof obj === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function') {
            return obj[inspectSymbol]();
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        mapForEach.call(obj, function (value, key) {
            mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
        });
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        setForEach.call(obj, function (value) {
            setParts.push(inspect(value, obj));
        });
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? toStr(obj).slice(8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + [].concat(stringTag || [], protoTag || []).join(': ') + '] ' : '');
        if (ys.length === 0) { return tag + '{}'; }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + ys.join(', ') + ' }';
    }
    return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
    var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return String(s).replace(/"/g, '&quot;');
}

function isArray(obj) { return toStr(obj) === '[object Array]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isDate(obj) { return toStr(obj) === '[object Date]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isRegExp(obj) { return toStr(obj) === '[object RegExp]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isError(obj) { return toStr(obj) === '[object Error]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isString(obj) { return toStr(obj) === '[object String]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isNumber(obj) { return toStr(obj) === '[object Number]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }
function isBoolean(obj) { return toStr(obj) === '[object Boolean]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj)); }

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol;
    }
    if (typeof obj === 'symbol') {
        return true;
    }
    if (!obj || typeof obj !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}

function isBigInt(obj) {
    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}

var hasOwn = Object.prototype.hasOwnProperty || function (key) { return key in this; };
function has(obj, key) {
    return hasOwn.call(obj, key);
}

function toStr(obj) {
    return objectToString.call(obj);
}

function nameOf(f) {
    if (f.name) { return f.name; }
    var m = match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) { return m[1]; }
    return null;
}

function indexOf(xs, x) {
    if (xs.indexOf) { return xs.indexOf(x); }
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) { return i; }
    }
    return -1;
}

function isMap(x) {
    if (!mapSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakMap(x) {
    if (!weakMapHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakRef(x) {
    if (!weakRefDeref || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}

function isSet(x) {
    if (!setSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakSet(x) {
    if (!weakSetHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement(x) {
    if (!x || typeof x !== 'object') { return false; }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString(str.slice(0, opts.maxStringLength), opts) + trailer;
    }
    // eslint-disable-next-line no-control-regex
    var s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) { return '\\' + x; }
    return '\\x' + (n < 0x10 ? '0' : '') + n.toString(16).toUpperCase();
}

function markBoxed(str) {
    return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
    return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : entries.join(', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
    for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}

function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = Array(opts.indent + 1).join(' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: Array(depth + 1).join(baseIndent)
    };
}

function indentedJoin(xs, indent) {
    if (xs.length === 0) { return ''; }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + xs.join(',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
    var isArr = isArray(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
            symMap['$' + syms[k]] = syms[k];
        }
    }

    for (var key in obj) { // eslint-disable-line no-restricted-syntax
        if (!has(obj, key)) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ((/[^\w$]/).test(key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}


/***/ }),

/***/ "./node_modules/punycode/punycode.es6.js":
/*!***********************************************!*\
  !*** ./node_modules/punycode/punycode.es6.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ucs2decode": () => (/* binding */ ucs2decode),
/* harmony export */   "ucs2encode": () => (/* binding */ ucs2encode),
/* harmony export */   "decode": () => (/* binding */ decode),
/* harmony export */   "encode": () => (/* binding */ encode),
/* harmony export */   "toASCII": () => (/* binding */ toASCII),
/* harmony export */   "toUnicode": () => (/* binding */ toUnicode),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });


/** Highest positive signed 32-bit float value */
const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128; // 0x80
const delimiter = '-'; // '\x2D'

/** Regular expressions */
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7E]/; // non-ASCII chars
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
const errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;

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
	const result = [];
	let length = array.length;
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
	const parts = string.split('@');
	let result = '';
	if (parts.length > 1) {
		// In email addresses, only the domain name should be punycoded. Leave
		// the local part (i.e. everything up to `@`) intact.
		result = parts[0] + '@';
		string = parts[1];
	}
	// Avoid `split(regex)` for IE8 compatibility. See #17.
	string = string.replace(regexSeparators, '\x2E');
	const labels = string.split('.');
	const encoded = map(labels, fn).join('.');
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
	const output = [];
	let counter = 0;
	const length = string.length;
	while (counter < length) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			const extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
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
const ucs2encode = array => String.fromCodePoint(...array);

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
const basicToDigit = function(codePoint) {
	if (codePoint - 0x30 < 0x0A) {
		return codePoint - 0x16;
	}
	if (codePoint - 0x41 < 0x1A) {
		return codePoint - 0x41;
	}
	if (codePoint - 0x61 < 0x1A) {
		return codePoint - 0x61;
	}
	return base;
};

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
const digitToBasic = function(digit, flag) {
	//  0..25 map to ASCII a..z or A..Z
	// 26..35 map to ASCII 0..9
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
const adapt = function(delta, numPoints, firstTime) {
	let k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */
const decode = function(input) {
	// Don't use UCS-2.
	const output = [];
	const inputLength = input.length;
	let i = 0;
	let n = initialN;
	let bias = initialBias;

	// Handle the basic code points: let `basic` be the number of input code
	// points before the last delimiter, or `0` if there is none, then copy
	// the first basic code points to the output.

	let basic = input.lastIndexOf(delimiter);
	if (basic < 0) {
		basic = 0;
	}

	for (let j = 0; j < basic; ++j) {
		// if it's not a basic code point
		if (input.charCodeAt(j) >= 0x80) {
			error('not-basic');
		}
		output.push(input.charCodeAt(j));
	}

	// Main decoding loop: start just after the last delimiter if any basic code
	// points were copied; start at the beginning otherwise.

	for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

		// `index` is the index of the next character to be consumed.
		// Decode a generalized variable-length integer into `delta`,
		// which gets added to `i`. The overflow checking is easier
		// if we increase `i` as we go, then subtract off its starting
		// value at the end to obtain `delta`.
		let oldi = i;
		for (let w = 1, k = base; /* no condition */; k += base) {

			if (index >= inputLength) {
				error('invalid-input');
			}

			const digit = basicToDigit(input.charCodeAt(index++));

			if (digit >= base || digit > floor((maxInt - i) / w)) {
				error('overflow');
			}

			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

			if (digit < t) {
				break;
			}

			const baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) {
				error('overflow');
			}

			w *= baseMinusT;

		}

		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);

		// `i` was supposed to wrap around from `out` to `0`,
		// incrementing `n` each time, so we'll fix that now:
		if (floor(i / out) > maxInt - n) {
			error('overflow');
		}

		n += floor(i / out);
		i %= out;

		// Insert `n` at position `i` of the output.
		output.splice(i++, 0, n);

	}

	return String.fromCodePoint(...output);
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */
const encode = function(input) {
	const output = [];

	// Convert the input in UCS-2 to an array of Unicode code points.
	input = ucs2decode(input);

	// Cache the length.
	let inputLength = input.length;

	// Initialize the state.
	let n = initialN;
	let delta = 0;
	let bias = initialBias;

	// Handle the basic code points.
	for (const currentValue of input) {
		if (currentValue < 0x80) {
			output.push(stringFromCharCode(currentValue));
		}
	}

	let basicLength = output.length;
	let handledCPCount = basicLength;

	// `handledCPCount` is the number of code points that have been handled;
	// `basicLength` is the number of basic code points.

	// Finish the basic string with a delimiter unless it's empty.
	if (basicLength) {
		output.push(delimiter);
	}

	// Main encoding loop:
	while (handledCPCount < inputLength) {

		// All non-basic code points < n have been handled already. Find the next
		// larger one:
		let m = maxInt;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) {
				m = currentValue;
			}
		}

		// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
		// but guard against overflow.
		const handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
			error('overflow');
		}

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > maxInt) {
				error('overflow');
			}
			if (currentValue == n) {
				// Represent delta as a generalized variable-length integer.
				let q = delta;
				for (let k = base; /* no condition */; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) {
						break;
					}
					const qMinusT = q - t;
					const baseMinusT = base - t;
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
};

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
const toUnicode = function(input) {
	return mapDomain(input, function(string) {
		return regexPunycode.test(string)
			? decode(string.slice(4).toLowerCase())
			: string;
	});
};

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
const toASCII = function(input) {
	return mapDomain(input, function(string) {
		return regexNonASCII.test(string)
			? 'xn--' + encode(string)
			: string;
	});
};

/*--------------------------------------------------------------------------*/

/** Define the public API */
const punycode = {
	/**
	 * A string representing the current Punycode.js version number.
	 * @memberOf punycode
	 * @type String
	 */
	'version': '2.1.0',
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


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (punycode);


/***/ }),

/***/ "./node_modules/side-channel/index.js":
/*!********************************************!*\
  !*** ./node_modules/side-channel/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");
var callBound = __webpack_require__(/*! call-bind/callBound */ "./node_modules/call-bind/callBound.js");
var inspect = __webpack_require__(/*! object-inspect */ "./node_modules/object-inspect/index.js");

var $TypeError = GetIntrinsic('%TypeError%');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var $Map = GetIntrinsic('%Map%', true);

var $weakMapGet = callBound('WeakMap.prototype.get', true);
var $weakMapSet = callBound('WeakMap.prototype.set', true);
var $weakMapHas = callBound('WeakMap.prototype.has', true);
var $mapGet = callBound('Map.prototype.get', true);
var $mapSet = callBound('Map.prototype.set', true);
var $mapHas = callBound('Map.prototype.has', true);

/*
 * This function traverses the list returning the node corresponding to the
 * given key.
 *
 * That node is also moved to the head of the list, so that if it's accessed
 * again we don't need to traverse the whole list. By doing so, all the recently
 * used nodes can be accessed relatively quickly.
 */
var listGetNode = function (list, key) { // eslint-disable-line consistent-return
	for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
		if (curr.key === key) {
			prev.next = curr.next;
			curr.next = list.next;
			list.next = curr; // eslint-disable-line no-param-reassign
			return curr;
		}
	}
};

var listGet = function (objects, key) {
	var node = listGetNode(objects, key);
	return node && node.value;
};
var listSet = function (objects, key, value) {
	var node = listGetNode(objects, key);
	if (node) {
		node.value = value;
	} else {
		// Prepend the new node to the beginning of the list
		objects.next = { // eslint-disable-line no-param-reassign
			key: key,
			next: objects.next,
			value: value
		};
	}
};
var listHas = function (objects, key) {
	return !!listGetNode(objects, key);
};

module.exports = function getSideChannel() {
	var $wm;
	var $m;
	var $o;
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		get: function (key) { // eslint-disable-line consistent-return
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapGet($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapGet($m, key);
				}
			} else {
				if ($o) { // eslint-disable-line no-lonely-if
					return listGet($o, key);
				}
			}
		},
		has: function (key) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if ($wm) {
					return $weakMapHas($wm, key);
				}
			} else if ($Map) {
				if ($m) {
					return $mapHas($m, key);
				}
			} else {
				if ($o) { // eslint-disable-line no-lonely-if
					return listHas($o, key);
				}
			}
			return false;
		},
		set: function (key, value) {
			if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
				if (!$wm) {
					$wm = new $WeakMap();
				}
				$weakMapSet($wm, key, value);
			} else if ($Map) {
				if (!$m) {
					$m = new $Map();
				}
				$mapSet($m, key, value);
			} else {
				if (!$o) {
					/*
					 * Initialize the linked list as an empty node, so that we don't have
					 * to special-case handling of the first node: we can always refer to
					 * it as (previous node).next, instead of something like (list).head
					 */
					$o = { key: {}, next: null };
				}
				listSet($o, key, value);
			}
		}
	};
	return channel;
};


/***/ }),

/***/ "./node_modules/superagent/lib/agent-base.js":
/*!***************************************************!*\
  !*** ./node_modules/superagent/lib/agent-base.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function Agent() {
  this._defaults = [];
}

var _loop = function _loop() {
  var fn = _arr[_i];

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
};

for (var _i = 0, _arr = ['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert', 'disableTLSCerts']; _i < _arr.length; _i++) {
  _loop();
}

Agent.prototype._setDefaults = function (request) {
  var _iterator = _createForOfIteratorHelper(this._defaults),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var def = _step.value;
      request[def.fn].apply(request, _toConsumableArray(def.args));
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

module.exports = Agent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hZ2VudC1iYXNlLmpzIl0sIm5hbWVzIjpbIkFnZW50IiwiX2RlZmF1bHRzIiwiZm4iLCJwcm90b3R5cGUiLCJhcmdzIiwicHVzaCIsIl9zZXREZWZhdWx0cyIsInJlcXVlc3QiLCJkZWYiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsS0FBVCxHQUFpQjtBQUNmLE9BQUtDLFNBQUwsR0FBaUIsRUFBakI7QUFDRDs7O0FBRUksTUFBTUMsRUFBRSxXQUFSOztBQXdCSDtBQUNBRixFQUFBQSxLQUFLLENBQUNHLFNBQU4sQ0FBZ0JELEVBQWhCLElBQXNCLFlBQW1CO0FBQUEsc0NBQU5FLElBQU07QUFBTkEsTUFBQUEsSUFBTTtBQUFBOztBQUN2QyxTQUFLSCxTQUFMLENBQWVJLElBQWYsQ0FBb0I7QUFBRUgsTUFBQUEsRUFBRSxFQUFGQSxFQUFGO0FBQU1FLE1BQUFBLElBQUksRUFBSkE7QUFBTixLQUFwQjs7QUFDQSxXQUFPLElBQVA7QUFDRCxHQUhEOzs7QUF6QkYsd0JBQWlCLENBQ2YsS0FEZSxFQUVmLElBRmUsRUFHZixNQUhlLEVBSWYsS0FKZSxFQUtmLE9BTGUsRUFNZixNQU5lLEVBT2YsUUFQZSxFQVFmLE1BUmUsRUFTZixpQkFUZSxFQVVmLFdBVmUsRUFXZixPQVhlLEVBWWYsSUFaZSxFQWFmLFdBYmUsRUFjZixTQWRlLEVBZWYsUUFmZSxFQWdCZixXQWhCZSxFQWlCZixPQWpCZSxFQWtCZixJQWxCZSxFQW1CZixLQW5CZSxFQW9CZixLQXBCZSxFQXFCZixNQXJCZSxFQXNCZixpQkF0QmUsQ0FBakIsMEJBdUJHO0FBQUE7QUFNRjs7QUFFREosS0FBSyxDQUFDRyxTQUFOLENBQWdCRyxZQUFoQixHQUErQixVQUFVQyxPQUFWLEVBQW1CO0FBQUEsNkNBQzlCLEtBQUtOLFNBRHlCO0FBQUE7O0FBQUE7QUFDaEQsd0RBQWtDO0FBQUEsVUFBdkJPLEdBQXVCO0FBQ2hDRCxNQUFBQSxPQUFPLENBQUNDLEdBQUcsQ0FBQ04sRUFBTCxDQUFQLE9BQUFLLE9BQU8scUJBQVlDLEdBQUcsQ0FBQ0osSUFBaEIsRUFBUDtBQUNEO0FBSCtDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJakQsQ0FKRDs7QUFNQUssTUFBTSxDQUFDQyxPQUFQLEdBQWlCVixLQUFqQiIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIEFnZW50KCkge1xuICB0aGlzLl9kZWZhdWx0cyA9IFtdO1xufVxuXG5mb3IgKGNvbnN0IGZuIG9mIFtcbiAgJ3VzZScsXG4gICdvbicsXG4gICdvbmNlJyxcbiAgJ3NldCcsXG4gICdxdWVyeScsXG4gICd0eXBlJyxcbiAgJ2FjY2VwdCcsXG4gICdhdXRoJyxcbiAgJ3dpdGhDcmVkZW50aWFscycsXG4gICdzb3J0UXVlcnknLFxuICAncmV0cnknLFxuICAnb2snLFxuICAncmVkaXJlY3RzJyxcbiAgJ3RpbWVvdXQnLFxuICAnYnVmZmVyJyxcbiAgJ3NlcmlhbGl6ZScsXG4gICdwYXJzZScsXG4gICdjYScsXG4gICdrZXknLFxuICAncGZ4JyxcbiAgJ2NlcnQnLFxuICAnZGlzYWJsZVRMU0NlcnRzJ1xuXSkge1xuICAvLyBEZWZhdWx0IHNldHRpbmcgZm9yIGFsbCByZXF1ZXN0cyBmcm9tIHRoaXMgYWdlbnRcbiAgQWdlbnQucHJvdG90eXBlW2ZuXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgdGhpcy5fZGVmYXVsdHMucHVzaCh7IGZuLCBhcmdzIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xufVxuXG5BZ2VudC5wcm90b3R5cGUuX3NldERlZmF1bHRzID0gZnVuY3Rpb24gKHJlcXVlc3QpIHtcbiAgZm9yIChjb25zdCBkZWYgb2YgdGhpcy5fZGVmYXVsdHMpIHtcbiAgICByZXF1ZXN0W2RlZi5mbl0oLi4uZGVmLmFyZ3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnZW50O1xuIl19

/***/ }),

/***/ "./node_modules/superagent/lib/client.js":
/*!***********************************************!*\
  !*** ./node_modules/superagent/lib/client.js ***!
  \***********************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

var qs = __webpack_require__(/*! qs */ "./node_modules/superagent/node_modules/qs/lib/index.js");

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

function serialize(object) {
  if (!isObject(object)) return object;
  var pairs = [];

  for (var key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) pushEncodedKeyValuePair(pairs, key, object[key]);
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


function pushEncodedKeyValuePair(pairs, key, value) {
  if (value === undefined) return;

  if (value === null) {
    pairs.push(encodeURI(key));
    return;
  }

  if (Array.isArray(value)) {
    var _iterator = _createForOfIteratorHelper(value),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var v = _step.value;
        pushEncodedKeyValuePair(pairs, key, v);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  } else if (isObject(value)) {
    for (var subkey in value) {
      if (Object.prototype.hasOwnProperty.call(value, subkey)) pushEncodedKeyValuePair(pairs, "".concat(key, "[").concat(subkey, "]"), value[subkey]);
    }
  } else {
    pairs.push(encodeURI(key) + '=' + encodeURIComponent(value));
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

function parseString(string_) {
  var object = {};
  var pairs = string_.split('&');
  var pair;
  var pos;

  for (var i = 0, length_ = pairs.length; i < length_; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');

    if (pos === -1) {
      object[decodeURIComponent(pair)] = '';
    } else {
      object[decodeURIComponent(pair.slice(0, pos))] = decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return object;
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
  'application/x-www-form-urlencoded': qs.stringify,
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

function parseHeader(string_) {
  var lines = string_.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var value;

  for (var i = 0, length_ = lines.length; i < length_; ++i) {
    line = lines[i];
    index = line.indexOf(':');

    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line.slice(0, index).toLowerCase();
    value = trim(line.slice(index + 1));
    fields[field] = value;
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
  return /[/+]json($|[^-\w])/i.test(mime);
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


function Response(request_) {
  this.req = request_;
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

  if (this.text === null && request_._responseType) {
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

Response.prototype._parseBody = function (string_) {
  var parse = request.parse[this.type];

  if (this.req._parser) {
    return this.req._parser(this, string_);
  }

  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }

  return parse && string_ && (string_.length > 0 || string_ instanceof Object) ? parse(string_) : null;
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
  var message = "cannot ".concat(method, " ").concat(url, " (").concat(this.status, ")");
  var error = new Error(message);
  error.status = this.status;
  error.method = method;
  error.url = url;
  return error;
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
    var error = null;
    var res = null;

    try {
      res = new Response(self);
    } catch (error_) {
      error = new Error('Parser is unable to parse the response');
      error.parse = true;
      error.original = error_; // issue #675: return the raw response if the response parsing fails

      if (self.xhr) {
        // ie9 doesn't have 'response' property
        error.rawResponse = typeof self.xhr.responseType === 'undefined' ? self.xhr.responseText : self.xhr.response; // issue #876: return the http status code if the response parsing fails

        error.status = self.xhr.status ? self.xhr.status : null;
        error.statusCode = error.status; // backwards-compat only
      } else {
        error.rawResponse = null;
        error.status = null;
      }

      return self.callback(error);
    }

    self.emit('response', res);
    var new_error;

    try {
      if (!self._isResponseOK(res)) {
        new_error = new Error(res.statusText || res.text || 'Unsuccessful HTTP response');
      }
    } catch (err) {
      new_error = err; // ok() callback can throw
    } // #1000 don't catch errors from the callback to avoid double calling it


    if (new_error) {
      new_error.original = error;
      new_error.response = res;
      new_error.status = res.status;
      self.callback(new_error, res);
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


Request.prototype.query = function (value) {
  if (typeof value !== 'string') value = serialize(value);
  if (value) this._query.push(value);
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


Request.prototype.callback = function (error, res) {
  if (this._shouldRetry(error, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (error) {
    if (this._maxRetries) error.retries = this._retries - 1;
    this.emit('error', error);
  }

  fn(error, res);
};
/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */


Request.prototype.crossDomainError = function () {
  var error = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  error.crossDomain = true;
  error.status = this.status;
  error.method = this.method;
  error.url = this.url;
  this.callback(error);
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

Request.prototype._isHost = function (object) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return object && _typeof(object) === 'object' && !Array.isArray(object) && Object.prototype.toString.call(object) !== '[object Object]';
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


  xhr.addEventListener('readystatechange', function () {
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
  }); // progress

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

var _loop = function _loop() {
  var method = _arr[_i];

  Agent.prototype[method.toLowerCase()] = function (url, fn) {
    var request_ = new request.Request(method, url);

    this._setDefaults(request_);

    if (fn) {
      request_.end(fn);
    }

    return request_;
  };
};

for (var _i = 0, _arr = ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE']; _i < _arr.length; _i++) {
  _loop();
}

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
  var request_ = request('GET', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
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
  var request_ = request('HEAD', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.query(data);
  if (fn) request_.end(fn);
  return request_;
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
  var request_ = request('OPTIONS', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
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
  var request_ = request('DELETE', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
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
  var request_ = request('PATCH', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
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
  var request_ = request('POST', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
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
  var request_ = request('PUT', url);

  if (typeof data === 'function') {
    fn = data;
    data = null;
  }

  if (data) request_.send(data);
  if (fn) request_.end(fn);
  return request_;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQuanMiXSwibmFtZXMiOlsicm9vdCIsIndpbmRvdyIsInNlbGYiLCJjb25zb2xlIiwid2FybiIsIkVtaXR0ZXIiLCJyZXF1aXJlIiwic2FmZVN0cmluZ2lmeSIsInFzIiwiUmVxdWVzdEJhc2UiLCJpc09iamVjdCIsIlJlc3BvbnNlQmFzZSIsIkFnZW50Iiwibm9vcCIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRob2QiLCJ1cmwiLCJSZXF1ZXN0IiwiZW5kIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwicmVxdWVzdCIsImdldFhIUiIsIlhNTEh0dHBSZXF1ZXN0IiwibG9jYXRpb24iLCJwcm90b2NvbCIsIkFjdGl2ZVhPYmplY3QiLCJFcnJvciIsInRyaW0iLCJzIiwicmVwbGFjZSIsInNlcmlhbGl6ZSIsIm9iamVjdCIsInBhaXJzIiwia2V5IiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwicHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIiLCJqb2luIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJwdXNoIiwiZW5jb2RlVVJJIiwiQXJyYXkiLCJpc0FycmF5IiwidiIsInN1YmtleSIsImVuY29kZVVSSUNvbXBvbmVudCIsInNlcmlhbGl6ZU9iamVjdCIsInBhcnNlU3RyaW5nIiwic3RyaW5nXyIsInNwbGl0IiwicGFpciIsInBvcyIsImkiLCJsZW5ndGhfIiwiaW5kZXhPZiIsImRlY29kZVVSSUNvbXBvbmVudCIsInNsaWNlIiwidHlwZXMiLCJodG1sIiwianNvbiIsInhtbCIsInVybGVuY29kZWQiLCJmb3JtIiwic3RyaW5naWZ5IiwicGFyc2UiLCJKU09OIiwicGFyc2VIZWFkZXIiLCJsaW5lcyIsImZpZWxkcyIsImluZGV4IiwibGluZSIsImZpZWxkIiwidG9Mb3dlckNhc2UiLCJpc0pTT04iLCJtaW1lIiwidGVzdCIsIlJlc3BvbnNlIiwicmVxdWVzdF8iLCJyZXEiLCJ4aHIiLCJ0ZXh0IiwicmVzcG9uc2VUeXBlIiwicmVzcG9uc2VUZXh0Iiwic3RhdHVzVGV4dCIsInN0YXR1cyIsIl9zZXRTdGF0dXNQcm9wZXJ0aWVzIiwiaGVhZGVycyIsImdldEFsbFJlc3BvbnNlSGVhZGVycyIsImhlYWRlciIsImdldFJlc3BvbnNlSGVhZGVyIiwiX3NldEhlYWRlclByb3BlcnRpZXMiLCJfcmVzcG9uc2VUeXBlIiwiYm9keSIsInJlc3BvbnNlIiwiX3BhcnNlQm9keSIsInR5cGUiLCJfcGFyc2VyIiwidG9FcnJvciIsIm1lc3NhZ2UiLCJlcnJvciIsIl9xdWVyeSIsIl9oZWFkZXIiLCJvbiIsInJlcyIsImVycm9yXyIsIm9yaWdpbmFsIiwicmF3UmVzcG9uc2UiLCJzdGF0dXNDb2RlIiwiY2FsbGJhY2siLCJlbWl0IiwibmV3X2Vycm9yIiwiX2lzUmVzcG9uc2VPSyIsImVyciIsInNldCIsImFjY2VwdCIsImF1dGgiLCJ1c2VyIiwicGFzcyIsIm9wdGlvbnMiLCJidG9hIiwiZW5jb2RlciIsInN0cmluZyIsIl9hdXRoIiwicXVlcnkiLCJhdHRhY2giLCJmaWxlIiwiX2RhdGEiLCJfZ2V0Rm9ybURhdGEiLCJhcHBlbmQiLCJuYW1lIiwiX2Zvcm1EYXRhIiwiRm9ybURhdGEiLCJfc2hvdWxkUmV0cnkiLCJfcmV0cnkiLCJmbiIsIl9jYWxsYmFjayIsImNsZWFyVGltZW91dCIsIl9tYXhSZXRyaWVzIiwicmV0cmllcyIsIl9yZXRyaWVzIiwiY3Jvc3NEb21haW5FcnJvciIsImNyb3NzRG9tYWluIiwiYWdlbnQiLCJjYSIsImJ1ZmZlciIsIndyaXRlIiwicGlwZSIsIl9pc0hvc3QiLCJ0b1N0cmluZyIsIl9lbmRDYWxsZWQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsIl9lbmQiLCJfc2V0VXBsb2FkVGltZW91dCIsIl91cGxvYWRUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXRUaW1lciIsInNldFRpbWVvdXQiLCJfdGltZW91dEVycm9yIiwiX2Fib3J0ZWQiLCJkYXRhIiwiX3NldFRpbWVvdXRzIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlYWR5U3RhdGUiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJ0aW1lZG91dCIsImhhbmRsZVByb2dyZXNzIiwiZGlyZWN0aW9uIiwiZSIsInRvdGFsIiwicGVyY2VudCIsImxvYWRlZCIsImhhc0xpc3RlbmVycyIsImJpbmQiLCJ1cGxvYWQiLCJ1c2VybmFtZSIsInBhc3N3b3JkIiwib3BlbiIsIl93aXRoQ3JlZGVudGlhbHMiLCJ3aXRoQ3JlZGVudGlhbHMiLCJjb250ZW50VHlwZSIsIl9zZXJpYWxpemVyIiwic2V0UmVxdWVzdEhlYWRlciIsInNlbmQiLCJfc2V0RGVmYXVsdHMiLCJkZWwiLCJkZWxldGUiLCJnZXQiLCJoZWFkIiwicGF0Y2giLCJwb3N0IiwicHV0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBRUEsSUFBSUEsSUFBSjs7QUFDQSxJQUFJLE9BQU9DLE1BQVAsS0FBa0IsV0FBdEIsRUFBbUM7QUFDakM7QUFDQUQsRUFBQUEsSUFBSSxHQUFHQyxNQUFQO0FBQ0QsQ0FIRCxNQUdPLElBQUksT0FBT0MsSUFBUCxLQUFnQixXQUFwQixFQUFpQztBQUN0QztBQUNBQyxFQUFBQSxPQUFPLENBQUNDLElBQVIsQ0FDRSxxRUFERjtBQUdBSixFQUFBQSxJQUFJLFNBQUo7QUFDRCxDQU5NLE1BTUE7QUFDTDtBQUNBQSxFQUFBQSxJQUFJLEdBQUdFLElBQVA7QUFDRDs7QUFFRCxJQUFNRyxPQUFPLEdBQUdDLE9BQU8sQ0FBQyxtQkFBRCxDQUF2Qjs7QUFDQSxJQUFNQyxhQUFhLEdBQUdELE9BQU8sQ0FBQyxxQkFBRCxDQUE3Qjs7QUFDQSxJQUFNRSxFQUFFLEdBQUdGLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLElBQU1HLFdBQVcsR0FBR0gsT0FBTyxDQUFDLGdCQUFELENBQTNCOztBQUNBLElBQU1JLFFBQVEsR0FBR0osT0FBTyxDQUFDLGFBQUQsQ0FBeEI7O0FBQ0EsSUFBTUssWUFBWSxHQUFHTCxPQUFPLENBQUMsaUJBQUQsQ0FBNUI7O0FBQ0EsSUFB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QUFDQTs7O0FBRUE1RCxPQUFPLENBQUM0SyxHQUFSLEdBQWMsVUFBQ2pMLEdBQUQsRUFBTWtKLElBQU4sRUFBWXhCLEVBQVosRUFBbUI7QUFDL0IsTUFBTXpELFFBQVEsR0FBRzVELE9BQU8sQ0FBQyxLQUFELEVBQVFMLEdBQVIsQ0FBeEI7O0FBQ0EsTUFBSSxPQUFPa0osSUFBUCxLQUFnQixVQUFwQixFQUFnQztBQUM5QnhCLElBQUFBLEVBQUUsR0FBR3dCLElBQUw7QUFDQUEsSUFBQUEsSUFBSSxHQUFHLElBQVA7QUFDRDs7QUFFRCxNQUFJQSxJQUFKLEVBQVVqRixRQUFRLENBQUN3RyxJQUFULENBQWN2QixJQUFkO0FBQ1YsTUFBSXhCLEVBQUosRUFBUXpELFFBQVEsQ0FBQy9ELEdBQVQsQ0FBYXdILEVBQWI7QUFDUixTQUFPekQsUUFBUDtBQUNELENBVkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbmxldCByb290O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIEJyb3dzZXIgd2luZG93XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJykge1xuICAvLyBPdGhlciBlbnZpcm9ubWVudHNcbiAgY29uc29sZS53YXJuKFxuICAgICdVc2luZyBicm93c2VyLW9ubHkgdmVyc2lvbiBvZiBzdXBlcmFnZW50IGluIG5vbi1icm93c2VyIGVudmlyb25tZW50J1xuICApO1xuICByb290ID0gdGhpcztcbn0gZWxzZSB7XG4gIC8vIFdlYiBXb3JrZXJcbiAgcm9vdCA9IHNlbGY7XG59XG5cbmNvbnN0IEVtaXR0ZXIgPSByZXF1aXJlKCdjb21wb25lbnQtZW1pdHRlcicpO1xuY29uc3Qgc2FmZVN0cmluZ2lmeSA9IHJlcXVpcmUoJ2Zhc3Qtc2FmZS1zdHJpbmdpZnknKTtcbmNvbnN0IHFzID0gcmVxdWlyZSgncXMnKTtcbmNvbnN0IFJlcXVlc3RCYXNlID0gcmVxdWlyZSgnLi9yZXF1ZXN0LWJhc2UnKTtcbmNvbnN0IGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pcy1vYmplY3QnKTtcbmNvbnN0IFJlc3BvbnNlQmFzZSA9IHJlcXVpcmUoJy4vcmVzcG9uc2UtYmFzZScpO1xuY29uc3QgQWdlbnQgPSByZXF1aXJlKCcuL2FnZW50LWJhc2UnKTtcblxuLyoqXG4gKiBOb29wLlxuICovXG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4vKipcbiAqIEV4cG9zZSBgcmVxdWVzdGAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobWV0aG9kLCB1cmwpIHtcbiAgLy8gY2FsbGJhY2tcbiAgaWYgKHR5cGVvZiB1cmwgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IGV4cG9ydHMuUmVxdWVzdCgnR0VUJywgbWV0aG9kKS5lbmQodXJsKTtcbiAgfVxuXG4gIC8vIHVybCBmaXJzdFxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBuZXcgZXhwb3J0cy5SZXF1ZXN0KCdHRVQnLCBtZXRob2QpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBleHBvcnRzLlJlcXVlc3QobWV0aG9kLCB1cmwpO1xufTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzO1xuXG5jb25zdCByZXF1ZXN0ID0gZXhwb3J0cztcblxuZXhwb3J0cy5SZXF1ZXN0ID0gUmVxdWVzdDtcblxuLyoqXG4gKiBEZXRlcm1pbmUgWEhSLlxuICovXG5cbnJlcXVlc3QuZ2V0WEhSID0gKCkgPT4ge1xuICBpZiAoXG4gICAgcm9vdC5YTUxIdHRwUmVxdWVzdCAmJlxuICAgICghcm9vdC5sb2NhdGlvbiB8fFxuICAgICAgcm9vdC5sb2NhdGlvbi5wcm90b2NvbCAhPT0gJ2ZpbGU6JyB8fFxuICAgICAgIXJvb3QuQWN0aXZlWE9iamVjdClcbiAgKSB7XG4gICAgcmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7XG4gIH0gY2F0Y2gge31cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7XG4gIH0gY2F0Y2gge31cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuMy4wJyk7XG4gIH0gY2F0Y2gge31cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTtcbiAgfSBjYXRjaCB7fVxuXG4gIHRocm93IG5ldyBFcnJvcignQnJvd3Nlci1vbmx5IHZlcnNpb24gb2Ygc3VwZXJhZ2VudCBjb3VsZCBub3QgZmluZCBYSFInKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLCBhZGRlZCB0byBzdXBwb3J0IElFLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5jb25zdCB0cmltID0gJycudHJpbSA/IChzKSA9PiBzLnRyaW0oKSA6IChzKSA9PiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpO1xuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHJldHVybiBvYmplY3Q7XG4gIGNvbnN0IHBhaXJzID0gW107XG4gIGZvciAoY29uc3Qga2V5IGluIG9iamVjdCkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKVxuICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGtleSwgb2JqZWN0W2tleV0pO1xuICB9XG5cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBIZWxwcyAnc2VyaWFsaXplJyB3aXRoIHNlcmlhbGl6aW5nIGFycmF5cy5cbiAqIE11dGF0ZXMgdGhlIHBhaXJzIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXJzXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqL1xuXG5mdW5jdGlvbiBwdXNoRW5jb2RlZEtleVZhbHVlUGFpcihwYWlycywga2V5LCB2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICBwYWlycy5wdXNoKGVuY29kZVVSSShrZXkpKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IHYgb2YgdmFsdWUpIHtcbiAgICAgIHB1c2hFbmNvZGVkS2V5VmFsdWVQYWlyKHBhaXJzLCBrZXksIHYpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IHN1YmtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3Via2V5KSlcbiAgICAgICAgcHVzaEVuY29kZWRLZXlWYWx1ZVBhaXIocGFpcnMsIGAke2tleX1bJHtzdWJrZXl9XWAsIHZhbHVlW3N1YmtleV0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwYWlycy5wdXNoKGVuY29kZVVSSShrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxucmVxdWVzdC5zZXJpYWxpemVPYmplY3QgPSBzZXJpYWxpemU7XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHJpbmdfKSB7XG4gIGNvbnN0IG9iamVjdCA9IHt9O1xuICBjb25zdCBwYWlycyA9IHN0cmluZ18uc3BsaXQoJyYnKTtcbiAgbGV0IHBhaXI7XG4gIGxldCBwb3M7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aF8gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW5ndGhfOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcG9zID0gcGFpci5pbmRleE9mKCc9Jyk7XG4gICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgIG9iamVjdFtkZWNvZGVVUklDb21wb25lbnQocGFpcildID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdFtkZWNvZGVVUklDb21wb25lbnQocGFpci5zbGljZSgwLCBwb3MpKV0gPSBkZWNvZGVVUklDb21wb25lbnQoXG4gICAgICAgIHBhaXIuc2xpY2UocG9zICsgMSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ3RleHQveG1sJyxcbiAgdXJsZW5jb2RlZDogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gIGZvcm06ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG5yZXF1ZXN0LnNlcmlhbGl6ZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHFzLnN0cmluZ2lmeSxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBzYWZlU3RyaW5naWZ5XG59O1xuXG4vKipcbiAqIERlZmF1bHQgcGFyc2Vycy5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICogICAgICAgcmV0dXJuIHsgb2JqZWN0IHBhcnNlZCBmcm9tIHN0ciB9O1xuICogICAgIH07XG4gKlxuICovXG5cbnJlcXVlc3QucGFyc2UgPSB7XG4gICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnOiBwYXJzZVN0cmluZyxcbiAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnBhcnNlXG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBoZWFkZXIgYHN0cmAgaW50b1xuICogYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIG1hcHBlZCBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXIoc3RyaW5nXykge1xuICBjb25zdCBsaW5lcyA9IHN0cmluZ18uc3BsaXQoL1xccj9cXG4vKTtcbiAgY29uc3QgZmllbGRzID0ge307XG4gIGxldCBpbmRleDtcbiAgbGV0IGxpbmU7XG4gIGxldCBmaWVsZDtcbiAgbGV0IHZhbHVlO1xuXG4gIGZvciAobGV0IGkgPSAwLCBsZW5ndGhfID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuZ3RoXzsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgLy8gY291bGQgYmUgZW1wdHkgbGluZSwganVzdCBza2lwIGl0XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsdWUgPSB0cmltKGxpbmUuc2xpY2UoaW5kZXggKyAxKSk7XG4gICAgZmllbGRzW2ZpZWxkXSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBDaGVjayBpZiBgbWltZWAgaXMganNvbiBvciBoYXMgK2pzb24gc3RydWN0dXJlZCBzeW50YXggc3VmZml4LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtaW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNKU09OKG1pbWUpIHtcbiAgLy8gc2hvdWxkIG1hdGNoIC9qc29uIG9yICtqc29uXG4gIC8vIGJ1dCBub3QgL2pzb24tc2VxXG4gIHJldHVybiAvWy8rXWpzb24oJHxbXi1cXHddKS9pLnRlc3QobWltZSk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcXVlc3RfKSB7XG4gIHRoaXMucmVxID0gcmVxdWVzdF87XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICAvLyByZXNwb25zZVRleHQgaXMgYWNjZXNzaWJsZSBvbmx5IGlmIHJlc3BvbnNlVHlwZSBpcyAnJyBvciAndGV4dCcgYW5kIG9uIG9sZGVyIGJyb3dzZXJzXG4gIHRoaXMudGV4dCA9XG4gICAgKHRoaXMucmVxLm1ldGhvZCAhPT0gJ0hFQUQnICYmXG4gICAgICAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8XG4gICAgdHlwZW9mIHRoaXMueGhyLnJlc3BvbnNlVHlwZSA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgID8gdGhpcy54aHIucmVzcG9uc2VUZXh0XG4gICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICBsZXQgeyBzdGF0dXMgfSA9IHRoaXMueGhyO1xuICAvLyBoYW5kbGUgSUU5IGJ1ZzogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDA0Njk3Mi9tc2llLXJldHVybnMtc3RhdHVzLWNvZGUtb2YtMTIyMy1mb3ItYWpheC1yZXF1ZXN0XG4gIGlmIChzdGF0dXMgPT09IDEyMjMpIHtcbiAgICBzdGF0dXMgPSAyMDQ7XG4gIH1cblxuICB0aGlzLl9zZXRTdGF0dXNQcm9wZXJ0aWVzKHN0YXR1cyk7XG4gIHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnM7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLl9zZXRIZWFkZXJQcm9wZXJ0aWVzKHRoaXMuaGVhZGVyKTtcblxuICBpZiAodGhpcy50ZXh0ID09PSBudWxsICYmIHJlcXVlc3RfLl9yZXNwb25zZVR5cGUpIHtcbiAgICB0aGlzLmJvZHkgPSB0aGlzLnhoci5yZXNwb25zZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmJvZHkgPVxuICAgICAgdGhpcy5yZXEubWV0aG9kID09PSAnSEVBRCdcbiAgICAgICAgPyBudWxsXG4gICAgICAgIDogdGhpcy5fcGFyc2VCb2R5KHRoaXMudGV4dCA/IHRoaXMudGV4dCA6IHRoaXMueGhyLnJlc3BvbnNlKTtcbiAgfVxufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuUmVzcG9uc2VCYXNlKFJlc3BvbnNlLnByb3RvdHlwZSk7XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUuX3BhcnNlQm9keSA9IGZ1bmN0aW9uIChzdHJpbmdfKSB7XG4gIGxldCBwYXJzZSA9IHJlcXVlc3QucGFyc2VbdGhpcy50eXBlXTtcbiAgaWYgKHRoaXMucmVxLl9wYXJzZXIpIHtcbiAgICByZXR1cm4gdGhpcy5yZXEuX3BhcnNlcih0aGlzLCBzdHJpbmdfKTtcbiAgfVxuXG4gIGlmICghcGFyc2UgJiYgaXNKU09OKHRoaXMudHlwZSkpIHtcbiAgICBwYXJzZSA9IHJlcXVlc3QucGFyc2VbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgfVxuXG4gIHJldHVybiBwYXJzZSAmJiBzdHJpbmdfICYmIChzdHJpbmdfLmxlbmd0aCA+IDAgfHwgc3RyaW5nXyBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cmluZ18pXG4gICAgOiBudWxsO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYW4gYEVycm9yYCByZXByZXNlbnRhdGl2ZSBvZiB0aGlzIHJlc3BvbnNlLlxuICpcbiAqIEByZXR1cm4ge0Vycm9yfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9FcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgeyByZXEgfSA9IHRoaXM7XG4gIGNvbnN0IHsgbWV0aG9kIH0gPSByZXE7XG4gIGNvbnN0IHsgdXJsIH0gPSByZXE7XG5cbiAgY29uc3QgbWVzc2FnZSA9IGBjYW5ub3QgJHttZXRob2R9ICR7dXJsfSAoJHt0aGlzLnN0YXR1c30pYDtcbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIGVycm9yLnN0YXR1cyA9IHRoaXMuc3RhdHVzO1xuICBlcnJvci5tZXRob2QgPSBtZXRob2Q7XG4gIGVycm9yLnVybCA9IHVybDtcblxuICByZXR1cm4gZXJyb3I7XG59O1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VgLlxuICovXG5cbnJlcXVlc3QuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXF1ZXN0YCB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCBhbmQgYHVybGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICB0aGlzLl9xdWVyeSA9IHRoaXMuX3F1ZXJ5IHx8IFtdO1xuICB0aGlzLm1ldGhvZCA9IG1ldGhvZDtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaGVhZGVyID0ge307IC8vIHByZXNlcnZlcyBoZWFkZXIgbmFtZSBjYXNlXG4gIHRoaXMuX2hlYWRlciA9IHt9OyAvLyBjb2VyY2VzIGhlYWRlciBuYW1lcyB0byBsb3dlcmNhc2VcbiAgdGhpcy5vbignZW5kJywgKCkgPT4ge1xuICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgbGV0IHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2ggKGVycm9yXykge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ1BhcnNlciBpcyB1bmFibGUgdG8gcGFyc2UgdGhlIHJlc3BvbnNlJyk7XG4gICAgICBlcnJvci5wYXJzZSA9IHRydWU7XG4gICAgICBlcnJvci5vcmlnaW5hbCA9IGVycm9yXztcbiAgICAgIC8vIGlzc3VlICM2NzU6IHJldHVybiB0aGUgcmF3IHJlc3BvbnNlIGlmIHRoZSByZXNwb25zZSBwYXJzaW5nIGZhaWxzXG4gICAgICBpZiAoc2VsZi54aHIpIHtcbiAgICAgICAgLy8gaWU5IGRvZXNuJ3QgaGF2ZSAncmVzcG9uc2UnIHByb3BlcnR5XG4gICAgICAgIGVycm9yLnJhd1Jlc3BvbnNlID1cbiAgICAgICAgICB0eXBlb2Ygc2VsZi54aHIucmVzcG9uc2VUeXBlID09PSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgPyBzZWxmLnhoci5yZXNwb25zZVRleHRcbiAgICAgICAgICAgIDogc2VsZi54aHIucmVzcG9uc2U7XG4gICAgICAgIC8vIGlzc3VlICM4NzY6IHJldHVybiB0aGUgaHR0cCBzdGF0dXMgY29kZSBpZiB0aGUgcmVzcG9uc2UgcGFyc2luZyBmYWlsc1xuICAgICAgICBlcnJvci5zdGF0dXMgPSBzZWxmLnhoci5zdGF0dXMgPyBzZWxmLnhoci5zdGF0dXMgOiBudWxsO1xuICAgICAgICBlcnJvci5zdGF0dXNDb2RlID0gZXJyb3Iuc3RhdHVzOyAvLyBiYWNrd2FyZHMtY29tcGF0IG9ubHlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yLnJhd1Jlc3BvbnNlID0gbnVsbDtcbiAgICAgICAgZXJyb3Iuc3RhdHVzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyb3IpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgncmVzcG9uc2UnLCByZXMpO1xuXG4gICAgbGV0IG5ld19lcnJvcjtcbiAgICB0cnkge1xuICAgICAgaWYgKCFzZWxmLl9pc1Jlc3BvbnNlT0socmVzKSkge1xuICAgICAgICBuZXdfZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgcmVzLnN0YXR1c1RleHQgfHwgcmVzLnRleHQgfHwgJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbmV3X2Vycm9yID0gZXJyOyAvLyBvaygpIGNhbGxiYWNrIGNhbiB0aHJvd1xuICAgIH1cblxuICAgIC8vICMxMDAwIGRvbid0IGNhdGNoIGVycm9ycyBmcm9tIHRoZSBjYWxsYmFjayB0byBhdm9pZCBkb3VibGUgY2FsbGluZyBpdFxuICAgIGlmIChuZXdfZXJyb3IpIHtcbiAgICAgIG5ld19lcnJvci5vcmlnaW5hbCA9IGVycm9yO1xuICAgICAgbmV3X2Vycm9yLnJlc3BvbnNlID0gcmVzO1xuICAgICAgbmV3X2Vycm9yLnN0YXR1cyA9IHJlcy5zdGF0dXM7XG4gICAgICBzZWxmLmNhbGxiYWNrKG5ld19lcnJvciwgcmVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5jYWxsYmFjayhudWxsLCByZXMpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogTWl4aW4gYEVtaXR0ZXJgIGFuZCBgUmVxdWVzdEJhc2VgLlxuICovXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG5SZXF1ZXN0QmFzZShSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbiAodHlwZSkge1xuICB0aGlzLnNldCgnQWNjZXB0JywgcmVxdWVzdC50eXBlc1t0eXBlXSB8fCB0eXBlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBBdXRob3JpemF0aW9uIGZpZWxkIHZhbHVlIHdpdGggYHVzZXJgIGFuZCBgcGFzc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbcGFzc10gb3B0aW9uYWwgaW4gY2FzZSBvZiB1c2luZyAnYmVhcmVyJyBhcyB0eXBlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyB3aXRoICd0eXBlJyBwcm9wZXJ0eSAnYXV0bycsICdiYXNpYycgb3IgJ2JlYXJlcicgKGRlZmF1bHQgJ2Jhc2ljJylcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24gKHVzZXIsIHBhc3MsIG9wdGlvbnMpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHBhc3MgPSAnJztcbiAgaWYgKHR5cGVvZiBwYXNzID09PSAnb2JqZWN0JyAmJiBwYXNzICE9PSBudWxsKSB7XG4gICAgLy8gcGFzcyBpcyBvcHRpb25hbCBhbmQgY2FuIGJlIHJlcGxhY2VkIHdpdGggb3B0aW9uc1xuICAgIG9wdGlvbnMgPSBwYXNzO1xuICAgIHBhc3MgPSAnJztcbiAgfVxuXG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7XG4gICAgICB0eXBlOiB0eXBlb2YgYnRvYSA9PT0gJ2Z1bmN0aW9uJyA/ICdiYXNpYycgOiAnYXV0bydcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgZW5jb2RlciA9IChzdHJpbmcpID0+IHtcbiAgICBpZiAodHlwZW9mIGJ0b2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBidG9hKHN0cmluZyk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGJhc2ljIGF1dGgsIGJ0b2EgaXMgbm90IGEgZnVuY3Rpb24nKTtcbiAgfTtcblxuICByZXR1cm4gdGhpcy5fYXV0aCh1c2VyLCBwYXNzLCBvcHRpb25zLCBlbmNvZGVyKTtcbn07XG5cbi8qKlxuICogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuICogICAgIC5xdWVyeSgnc2l6ZT0xMCcpXG4gKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUucXVlcnkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHZhbHVlID0gc2VyaWFsaXplKHZhbHVlKTtcbiAgaWYgKHZhbHVlKSB0aGlzLl9xdWVyeS5wdXNoKHZhbHVlKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFF1ZXVlIHRoZSBnaXZlbiBgZmlsZWAgYXMgYW4gYXR0YWNobWVudCB0byB0aGUgc3BlY2lmaWVkIGBmaWVsZGAsXG4gKiB3aXRoIG9wdGlvbmFsIGBvcHRpb25zYCAob3IgZmlsZW5hbWUpLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmF0dGFjaCgnY29udGVudCcsIG5ldyBCbG9iKFsnPGEgaWQ9XCJhXCI+PGIgaWQ9XCJiXCI+aGV5ITwvYj48L2E+J10sIHsgdHlwZTogXCJ0ZXh0L2h0bWxcIn0pKVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHBhcmFtIHtCbG9ifEZpbGV9IGZpbGVcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF0dGFjaCA9IGZ1bmN0aW9uIChmaWVsZCwgZmlsZSwgb3B0aW9ucykge1xuICBpZiAoZmlsZSkge1xuICAgIGlmICh0aGlzLl9kYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzdXBlcmFnZW50IGNhbid0IG1peCAuc2VuZCgpIGFuZCAuYXR0YWNoKClcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fZ2V0Rm9ybURhdGEoKS5hcHBlbmQoZmllbGQsIGZpbGUsIG9wdGlvbnMgfHwgZmlsZS5uYW1lKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuX2dldEZvcm1EYXRhID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB7XG4gICAgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuX2Zvcm1EYXRhO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uIChlcnJvciwgcmVzKSB7XG4gIGlmICh0aGlzLl9zaG91bGRSZXRyeShlcnJvciwgcmVzKSkge1xuICAgIHJldHVybiB0aGlzLl9yZXRyeSgpO1xuICB9XG5cbiAgY29uc3QgZm4gPSB0aGlzLl9jYWxsYmFjaztcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcblxuICBpZiAoZXJyb3IpIHtcbiAgICBpZiAodGhpcy5fbWF4UmV0cmllcykgZXJyb3IucmV0cmllcyA9IHRoaXMuX3JldHJpZXMgLSAxO1xuICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnJvcik7XG4gIH1cblxuICBmbihlcnJvciwgcmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgJ1JlcXVlc3QgaGFzIGJlZW4gdGVybWluYXRlZFxcblBvc3NpYmxlIGNhdXNlczogdGhlIG5ldHdvcmsgaXMgb2ZmbGluZSwgT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiwgdGhlIHBhZ2UgaXMgYmVpbmcgdW5sb2FkZWQsIGV0Yy4nXG4gICk7XG4gIGVycm9yLmNyb3NzRG9tYWluID0gdHJ1ZTtcblxuICBlcnJvci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyb3IubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gIGVycm9yLnVybCA9IHRoaXMudXJsO1xuXG4gIHRoaXMuY2FsbGJhY2soZXJyb3IpO1xufTtcblxuLy8gVGhpcyBvbmx5IHdhcm5zLCBiZWNhdXNlIHRoZSByZXF1ZXN0IGlzIHN0aWxsIGxpa2VseSB0byB3b3JrXG5SZXF1ZXN0LnByb3RvdHlwZS5hZ2VudCA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS53YXJuKCdUaGlzIGlzIG5vdCBzdXBwb3J0ZWQgaW4gYnJvd3NlciB2ZXJzaW9uIG9mIHN1cGVyYWdlbnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYSA9IFJlcXVlc3QucHJvdG90eXBlLmFnZW50O1xuUmVxdWVzdC5wcm90b3R5cGUuYnVmZmVyID0gUmVxdWVzdC5wcm90b3R5cGUuY2E7XG5cbi8vIFRoaXMgdGhyb3dzLCBiZWNhdXNlIGl0IGNhbid0IHNlbmQvcmVjZWl2ZSBkYXRhIGFzIGV4cGVjdGVkXG5SZXF1ZXN0LnByb3RvdHlwZS53cml0ZSA9ICgpID0+IHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICdTdHJlYW1pbmcgaXMgbm90IHN1cHBvcnRlZCBpbiBicm93c2VyIHZlcnNpb24gb2Ygc3VwZXJhZ2VudCdcbiAgKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnBpcGUgPSBSZXF1ZXN0LnByb3RvdHlwZS53cml0ZTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhIGhvc3Qgb2JqZWN0LFxuICogd2UgZG9uJ3Qgd2FudCB0byBzZXJpYWxpemUgdGhlc2UgOilcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqIGhvc3Qgb2JqZWN0XG4gKiBAcmV0dXJuIHtCb29sZWFufSBpcyBhIGhvc3Qgb2JqZWN0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUmVxdWVzdC5wcm90b3R5cGUuX2lzSG9zdCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgLy8gTmF0aXZlIG9iamVjdHMgc3RyaW5naWZ5IHRvIFtvYmplY3QgRmlsZV0sIFtvYmplY3QgQmxvYl0sIFtvYmplY3QgRm9ybURhdGFdLCBldGMuXG4gIHJldHVybiAoXG4gICAgb2JqZWN0ICYmXG4gICAgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAhQXJyYXkuaXNBcnJheShvYmplY3QpICYmXG4gICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgIT09ICdbb2JqZWN0IE9iamVjdF0nXG4gICk7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbiAoZm4pIHtcbiAgaWYgKHRoaXMuX2VuZENhbGxlZCkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdXYXJuaW5nOiAuZW5kKCkgd2FzIGNhbGxlZCB0d2ljZS4gVGhpcyBpcyBub3Qgc3VwcG9ydGVkIGluIHN1cGVyYWdlbnQnXG4gICAgKTtcbiAgfVxuXG4gIHRoaXMuX2VuZENhbGxlZCA9IHRydWU7XG5cbiAgLy8gc3RvcmUgY2FsbGJhY2tcbiAgdGhpcy5fY2FsbGJhY2sgPSBmbiB8fCBub29wO1xuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIHRoaXMuX2ZpbmFsaXplUXVlcnlTdHJpbmcoKTtcblxuICB0aGlzLl9lbmQoKTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLl9zZXRVcGxvYWRUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcblxuICAvLyB1cGxvYWQgdGltZW91dCBpdCdzIHdva3JzIG9ubHkgaWYgZGVhZGxpbmUgdGltZW91dCBpcyBvZmZcbiAgaWYgKHRoaXMuX3VwbG9hZFRpbWVvdXQgJiYgIXRoaXMuX3VwbG9hZFRpbWVvdXRUaW1lcikge1xuICAgIHRoaXMuX3VwbG9hZFRpbWVvdXRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2VsZi5fdGltZW91dEVycm9yKFxuICAgICAgICAnVXBsb2FkIHRpbWVvdXQgb2YgJyxcbiAgICAgICAgc2VsZi5fdXBsb2FkVGltZW91dCxcbiAgICAgICAgJ0VUSU1FRE9VVCdcbiAgICAgICk7XG4gICAgfSwgdGhpcy5fdXBsb2FkVGltZW91dCk7XG4gIH1cbn07XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5SZXF1ZXN0LnByb3RvdHlwZS5fZW5kID0gZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5fYWJvcnRlZClcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhcbiAgICAgIG5ldyBFcnJvcignVGhlIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZCBldmVuIGJlZm9yZSAuZW5kKCkgd2FzIGNhbGxlZCcpXG4gICAgKTtcblxuICBjb25zdCBzZWxmID0gdGhpcztcbiAgdGhpcy54aHIgPSByZXF1ZXN0LmdldFhIUigpO1xuICBjb25zdCB7IHhociB9ID0gdGhpcztcbiAgbGV0IGRhdGEgPSB0aGlzLl9mb3JtRGF0YSB8fCB0aGlzLl9kYXRhO1xuXG4gIHRoaXMuX3NldFRpbWVvdXRzKCk7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5hZGRFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgKCkgPT4ge1xuICAgIGNvbnN0IHsgcmVhZHlTdGF0ZSB9ID0geGhyO1xuICAgIGlmIChyZWFkeVN0YXRlID49IDIgJiYgc2VsZi5fcmVzcG9uc2VUaW1lb3V0VGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dChzZWxmLl9yZXNwb25zZVRpbWVvdXRUaW1lcik7XG4gICAgfVxuXG4gICAgaWYgKHJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbiBJRTksIHJlYWRzIHRvIGFueSBwcm9wZXJ0eSAoZS5nLiBzdGF0dXMpIG9mZiBvZiBhbiBhYm9ydGVkIFhIUiB3aWxsXG4gICAgLy8gcmVzdWx0IGluIHRoZSBlcnJvciBcIkNvdWxkIG5vdCBjb21wbGV0ZSB0aGUgb3BlcmF0aW9uIGR1ZSB0byBlcnJvciBjMDBjMDIzZlwiXG4gICAgbGV0IHN0YXR1cztcbiAgICB0cnkge1xuICAgICAgc3RhdHVzID0geGhyLnN0YXR1cztcbiAgICB9IGNhdGNoIHtcbiAgICAgIHN0YXR1cyA9IDA7XG4gICAgfVxuXG4gICAgaWYgKCFzdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLnRpbWVkb3V0IHx8IHNlbGYuX2Fib3J0ZWQpIHJldHVybjtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG5cbiAgICBzZWxmLmVtaXQoJ2VuZCcpO1xuICB9KTtcblxuICAvLyBwcm9ncmVzc1xuICBjb25zdCBoYW5kbGVQcm9ncmVzcyA9IChkaXJlY3Rpb24sIGUpID0+IHtcbiAgICBpZiAoZS50b3RhbCA+IDApIHtcbiAgICAgIGUucGVyY2VudCA9IChlLmxvYWRlZCAvIGUudG90YWwpICogMTAwO1xuXG4gICAgICBpZiAoZS5wZXJjZW50ID09PSAxMDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3VwbG9hZFRpbWVvdXRUaW1lcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZS5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuXG4gIGlmICh0aGlzLmhhc0xpc3RlbmVycygncHJvZ3Jlc3MnKSkge1xuICAgIHRyeSB7XG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBoYW5kbGVQcm9ncmVzcy5iaW5kKG51bGwsICdkb3dubG9hZCcpKTtcbiAgICAgIGlmICh4aHIudXBsb2FkKSB7XG4gICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAncHJvZ3Jlc3MnLFxuICAgICAgICAgIGhhbmRsZVByb2dyZXNzLmJpbmQobnVsbCwgJ3VwbG9hZCcpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBBY2Nlc3NpbmcgeGhyLnVwbG9hZCBmYWlscyBpbiBJRSBmcm9tIGEgd2ViIHdvcmtlciwgc28ganVzdCBwcmV0ZW5kIGl0IGRvZXNuJ3QgZXhpc3QuXG4gICAgICAvLyBSZXBvcnRlZCBoZXJlOlxuICAgICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICAgIH1cbiAgfVxuXG4gIGlmICh4aHIudXBsb2FkKSB7XG4gICAgdGhpcy5fc2V0VXBsb2FkVGltZW91dCgpO1xuICB9XG5cbiAgLy8gaW5pdGlhdGUgcmVxdWVzdFxuICB0cnkge1xuICAgIGlmICh0aGlzLnVzZXJuYW1lICYmIHRoaXMucGFzc3dvcmQpIHtcbiAgICAgIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSwgdGhpcy51c2VybmFtZSwgdGhpcy5wYXNzd29yZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBzZWUgIzExNDlcbiAgICByZXR1cm4gdGhpcy5jYWxsYmFjayhlcnIpO1xuICB9XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmIChcbiAgICAhdGhpcy5fZm9ybURhdGEgJiZcbiAgICB0aGlzLm1ldGhvZCAhPT0gJ0dFVCcgJiZcbiAgICB0aGlzLm1ldGhvZCAhPT0gJ0hFQUQnICYmXG4gICAgdHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnICYmXG4gICAgIXRoaXMuX2lzSG9zdChkYXRhKVxuICApIHtcbiAgICAvLyBzZXJpYWxpemUgc3R1ZmZcbiAgICBjb25zdCBjb250ZW50VHlwZSA9IHRoaXMuX2hlYWRlclsnY29udGVudC10eXBlJ107XG4gICAgbGV0IHNlcmlhbGl6ZSA9XG4gICAgICB0aGlzLl9zZXJpYWxpemVyIHx8XG4gICAgICByZXF1ZXN0LnNlcmlhbGl6ZVtjb250ZW50VHlwZSA/IGNvbnRlbnRUeXBlLnNwbGl0KCc7JylbMF0gOiAnJ107XG4gICAgaWYgKCFzZXJpYWxpemUgJiYgaXNKU09OKGNvbnRlbnRUeXBlKSkge1xuICAgICAgc2VyaWFsaXplID0gcmVxdWVzdC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL2pzb24nXTtcbiAgICB9XG5cbiAgICBpZiAoc2VyaWFsaXplKSBkYXRhID0gc2VyaWFsaXplKGRhdGEpO1xuICB9XG5cbiAgLy8gc2V0IGhlYWRlciBmaWVsZHNcbiAgZm9yIChjb25zdCBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmICh0aGlzLmhlYWRlcltmaWVsZF0gPT09IG51bGwpIGNvbnRpbnVlO1xuXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmhlYWRlciwgZmllbGQpKVxuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICBpZiAodGhpcy5fcmVzcG9uc2VUeXBlKSB7XG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9IHRoaXMuX3Jlc3BvbnNlVHlwZTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG5cbiAgLy8gSUUxMSB4aHIuc2VuZCh1bmRlZmluZWQpIHNlbmRzICd1bmRlZmluZWQnIHN0cmluZyBhcyBQT1NUIHBheWxvYWQgKGluc3RlYWQgb2Ygbm90aGluZylcbiAgLy8gV2UgbmVlZCBudWxsIGhlcmUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgeGhyLnNlbmQodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IGRhdGEpO1xufTtcblxucmVxdWVzdC5hZ2VudCA9ICgpID0+IG5ldyBBZ2VudCgpO1xuXG5mb3IgKGNvbnN0IG1ldGhvZCBvZiBbJ0dFVCcsICdQT1NUJywgJ09QVElPTlMnLCAnUEFUQ0gnLCAnUFVUJywgJ0RFTEVURSddKSB7XG4gIEFnZW50LnByb3RvdHlwZVttZXRob2QudG9Mb3dlckNhc2UoKV0gPSBmdW5jdGlvbiAodXJsLCBmbikge1xuICAgIGNvbnN0IHJlcXVlc3RfID0gbmV3IHJlcXVlc3QuUmVxdWVzdChtZXRob2QsIHVybCk7XG4gICAgdGhpcy5fc2V0RGVmYXVsdHMocmVxdWVzdF8pO1xuICAgIGlmIChmbikge1xuICAgICAgcmVxdWVzdF8uZW5kKGZuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWVzdF87XG4gIH07XG59XG5cbkFnZW50LnByb3RvdHlwZS5kZWwgPSBBZ2VudC5wcm90b3R5cGUuZGVsZXRlO1xuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZ2V0ID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdHRVQnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8ucXVlcnkoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IFtkYXRhXSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5oZWFkID0gKHVybCwgZGF0YSwgZm4pID0+IHtcbiAgY29uc3QgcmVxdWVzdF8gPSByZXF1ZXN0KCdIRUFEJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG5cbi8qKlxuICogT1BUSU9OUyBxdWVyeSB0byBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBbZGF0YV0gb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3Qub3B0aW9ucyA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnT1BUSU9OUycsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG5cbi8qKlxuICogREVMRVRFIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZH0gW2RhdGFdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWwodXJsLCBkYXRhLCBmbikge1xuICBjb25zdCByZXF1ZXN0XyA9IHJlcXVlc3QoJ0RFTEVURScsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn1cblxucmVxdWVzdC5kZWwgPSBkZWw7XG5yZXF1ZXN0LmRlbGV0ZSA9IGRlbDtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IFtkYXRhXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wYXRjaCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnUEFUQ0gnLCB1cmwpO1xuICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICBmbiA9IGRhdGE7XG4gICAgZGF0YSA9IG51bGw7XG4gIH1cblxuICBpZiAoZGF0YSkgcmVxdWVzdF8uc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXF1ZXN0Xy5lbmQoZm4pO1xuICByZXR1cm4gcmVxdWVzdF87XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBbZGF0YV1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucG9zdCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnUE9TVCcsIHVybCk7XG4gIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGZuID0gZGF0YTtcbiAgICBkYXRhID0gbnVsbDtcbiAgfVxuXG4gIGlmIChkYXRhKSByZXF1ZXN0Xy5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcXVlc3RfLmVuZChmbik7XG4gIHJldHVybiByZXF1ZXN0Xztcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gW2RhdGFdIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnB1dCA9ICh1cmwsIGRhdGEsIGZuKSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RfID0gcmVxdWVzdCgnUFVUJywgdXJsKTtcbiAgaWYgKHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZm4gPSBkYXRhO1xuICAgIGRhdGEgPSBudWxsO1xuICB9XG5cbiAgaWYgKGRhdGEpIHJlcXVlc3RfLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxdWVzdF8uZW5kKGZuKTtcbiAgcmV0dXJuIHJlcXVlc3RfO1xufTtcbiJdfQ==

/***/ }),

/***/ "./node_modules/superagent/lib/is-object.js":
/*!**************************************************!*\
  !*** ./node_modules/superagent/lib/is-object.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
function isObject(object) {
  return object !== null && _typeof(object) === 'object';
}

module.exports = isObject;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pcy1vYmplY3QuanMiXSwibmFtZXMiOlsiaXNPYmplY3QiLCJvYmplY3QiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxTQUFTQSxRQUFULENBQWtCQyxNQUFsQixFQUEwQjtBQUN4QixTQUFPQSxNQUFNLEtBQUssSUFBWCxJQUFtQixRQUFPQSxNQUFQLE1BQWtCLFFBQTVDO0FBQ0Q7O0FBRURDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQkgsUUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqZWN0KSB7XG4gIHJldHVybiBvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iXX0=

/***/ }),

/***/ "./node_modules/superagent/lib/request-base.js":
/*!*****************************************************!*\
  !*** ./node_modules/superagent/lib/request-base.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var semver = __webpack_require__(/*! semver */ "?86c3");
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

function RequestBase(object) {
  if (object) return mixin(object);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(object) {
  for (var key in RequestBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(RequestBase.prototype, key)) object[key] = RequestBase.prototype[key];
  }

  return object;
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


RequestBase.prototype.responseType = function (value) {
  this._responseType = value;
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
}; //
// NOTE: we do not include ESOCKETTIMEDOUT because that is from `request` package
//       <https://github.com/sindresorhus/got/pull/537>
//
// NOTE: we do not include EADDRINFO because it was removed from libuv in 2014
//       <https://github.com/libuv/libuv/commit/02e1ebd40b807be5af46343ea873331b2ee4e9c1>
//       <https://github.com/request/request/search?q=ESOCKETTIMEDOUT&unscoped_q=ESOCKETTIMEDOUT>
//
//
// TODO: expose these as configurable defaults
//


var ERROR_CODES = new Set(['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN']);
var STATUS_CODES = new Set([408, 413, 429, 500, 502, 503, 504, 521, 522, 524]); // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)
// const METHODS = new Set(['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE']);

/**
 * Determine if a request should be retried.
 * (Inspired by https://github.com/sindresorhus/got#retry)
 *
 * @param {Error} err an error
 * @param {Response} [res] response
 * @returns {Boolean} if segment should be retried
 */

RequestBase.prototype._shouldRetry = function (error, res) {
  if (!this._maxRetries || this._retries++ >= this._maxRetries) {
    return false;
  }

  if (this._retryCallback) {
    try {
      var override = this._retryCallback(error, res);

      if (override === true) return true;
      if (override === false) return false; // undefined falls back to defaults
    } catch (error_) {
      console.error(error_);
    }
  } // TODO: we would need to make this easily configurable before adding it in (e.g. some might want to add POST)

  /*
  if (
    this.req &&
    this.req.method &&
    !METHODS.has(this.req.method.toUpperCase())
  )
    return false;
  */


  if (res && res.status && STATUS_CODES.has(res.status)) return true;

  if (error) {
    if (error.code && ERROR_CODES.has(error.code)) return true; // Superagent timeout

    if (error.timeout && error.code === 'ECONNABORTED') return true;
    if (error.crossDomain) return true;
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
        if (_this._maxRetries && _this._maxRetries > _this._retries) {
          return;
        }

        if (_this.timedout && _this.timedoutError) {
          reject(_this.timedoutError);
          return;
        }

        var error = new Error('Aborted');
        error.code = 'ABORTED';
        error.status = _this.status;
        error.method = _this.method;
        error.url = _this.url;
        reject(error);
      });
      self.end(function (error, res) {
        if (error) reject(error);else resolve(res);
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

RequestBase.prototype.set = function (field, value) {
  if (isObject(field)) {
    for (var key in field) {
      if (Object.prototype.hasOwnProperty.call(field, key)) this.set(key, field[key]);
    }

    return this;
  }

  this._header[field.toLowerCase()] = value;
  this.header[field] = value;
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


RequestBase.prototype.field = function (name, value) {
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

  if (Array.isArray(value)) {
    for (var i in value) {
      if (Object.prototype.hasOwnProperty.call(value, i)) this.field(name, value[i]);
    }

    return this;
  } // val should be defined now


  if (value === null || undefined === value) {
    throw new Error('.field(name, val) val can not be empty');
  }

  if (typeof value === 'boolean') {
    value = String(value);
  }

  this._getFormData().append(name, value);

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

  if (this.req) {
    // Node v13 has major differences in `abort()`
    // https://github.com/nodejs/node/blob/v12.x/lib/internal/streams/end-of-stream.js
    // https://github.com/nodejs/node/blob/v13.x/lib/internal/streams/end-of-stream.js
    // https://github.com/nodejs/node/blob/v14.x/lib/internal/streams/end-of-stream.js
    // (if you run a diff across these you will see the differences)
    //
    // References:
    // <https://github.com/nodejs/node/issues/31630>
    // <https://github.com/visionmedia/superagent/pull/1084/commits/dc18679a7c5ccfc6046d882015e5126888973bc8>
    //
    // Thanks to @shadowgate15 and @niftylettuce
    if (semver.gte(process.version, 'v13.0.0') && semver.lt(process.version, 'v14.0.0')) {
      // Note that the reason this doesn't work is because in v13 as compared to v14
      // there is no `callback = nop` set in end-of-stream.js above
      throw new Error('Superagent does not work in v13 properly with abort() due to Node.js core changes');
    } else if (semver.gte(process.version, 'v14.0.0')) {
      // We have to manually set `destroyed` to `true` in order for this to work
      // (see core internals of end-of-stream.js above in v14 branch as compared to v12)
      this.req.destroyed = true;
    }

    this.req.abort(); // node
  }

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
  var isObject_ = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    throw new Error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject_ && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw new Error("Can't merge these send calls");
  } // merge


  if (isObject_ && isObject(this._data)) {
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) this._data[key] = data[key];
    }
  } else if (typeof data === 'string') {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if (type) type = type.toLowerCase().trim();

    if (type === 'application/x-www-form-urlencoded') {
      this._data = this._data ? "".concat(this._data, "&").concat(data) : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObject_ || this._isHost(data)) {
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
      var queryArray = this.url.slice(index + 1).split('&');

      if (typeof this._sort === 'function') {
        queryArray.sort(this._sort);
      } else {
        queryArray.sort();
      }

      this.url = this.url.slice(0, index) + '?' + queryArray.join('&');
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

  var error = new Error("".concat(reason + timeout, "ms exceeded"));
  error.timeout = timeout;
  error.code = 'ECONNABORTED';
  error.errno = errno;
  this.timedout = true;
  this.timedoutError = error;
  this.abort();
  this.callback(error);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1ZXN0LWJhc2UuanMiXSwibmFtZXMiOlsic2VtdmVyIiwicmVxdWlyZSIsImlzT2JqZWN0IiwibW9kdWxlIiwiZXhwb3J0cyIsIlJlcXVlc3RCYXNlIiwib2JqZWN0IiwibWl4aW4iLCJrZXkiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsImNhbGwiLCJjbGVhclRpbWVvdXQiLCJfdGltZXIiLCJfcmVzcG9uc2VUaW1lb3V0VGltZXIiLCJfdXBsb2FkVGltZW91dFRpbWVyIiwicGFyc2UiLCJmbiIsIl9wYXJzZXIiLCJyZXNwb25zZVR5cGUiLCJ2YWx1ZSIsIl9yZXNwb25zZVR5cGUiLCJzZXJpYWxpemUiLCJfc2VyaWFsaXplciIsInRpbWVvdXQiLCJvcHRpb25zIiwiX3RpbWVvdXQiLCJfcmVzcG9uc2VUaW1lb3V0IiwiX3VwbG9hZFRpbWVvdXQiLCJvcHRpb24iLCJkZWFkbGluZSIsInJlc3BvbnNlIiwidXBsb2FkIiwiY29uc29sZSIsIndhcm4iLCJyZXRyeSIsImNvdW50IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiX21heFJldHJpZXMiLCJfcmV0cmllcyIsIl9yZXRyeUNhbGxiYWNrIiwiRVJST1JfQ09ERVMiLCJTZXQiLCJTVEFUVVNfQ09ERVMiLCJfc2hvdWxkUmV0cnkiLCJlcnJvciIsInJlcyIsIm92ZXJyaWRlIiwiZXJyb3JfIiwic3RhdHVzIiwiaGFzIiwiY29kZSIsImNyb3NzRG9tYWluIiwiX3JldHJ5IiwicmVxIiwicmVxdWVzdCIsIl9hYm9ydGVkIiwidGltZWRvdXQiLCJ0aW1lZG91dEVycm9yIiwiX2VuZCIsInRoZW4iLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Z1bGxmaWxsZWRQcm9taXNlIiwic2VsZiIsIl9lbmRDYWxsZWQiLCJQcm9taXNlIiwib24iLCJFcnJvciIsIm1ldGhvZCIsInVybCIsImVuZCIsImNhdGNoIiwiY2IiLCJ1bmRlZmluZWQiLCJ1c2UiLCJvayIsIl9va0NhbGxiYWNrIiwiX2lzUmVzcG9uc2VPSyIsImdldCIsImZpZWxkIiwiX2hlYWRlciIsInRvTG93ZXJDYXNlIiwiZ2V0SGVhZGVyIiwic2V0IiwiaGVhZGVyIiwidW5zZXQiLCJuYW1lIiwiX2RhdGEiLCJBcnJheSIsImlzQXJyYXkiLCJpIiwiU3RyaW5nIiwiX2dldEZvcm1EYXRhIiwiYXBwZW5kIiwiYWJvcnQiLCJ4aHIiLCJndGUiLCJwcm9jZXNzIiwidmVyc2lvbiIsImx0IiwiZGVzdHJveWVkIiwiZW1pdCIsIl9hdXRoIiwidXNlciIsInBhc3MiLCJiYXNlNjRFbmNvZGVyIiwidHlwZSIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJ3aXRoQ3JlZGVudGlhbHMiLCJfd2l0aENyZWRlbnRpYWxzIiwicmVkaXJlY3RzIiwibiIsIl9tYXhSZWRpcmVjdHMiLCJtYXhSZXNwb25zZVNpemUiLCJUeXBlRXJyb3IiLCJfbWF4UmVzcG9uc2VTaXplIiwidG9KU09OIiwiZGF0YSIsImhlYWRlcnMiLCJzZW5kIiwiaXNPYmplY3RfIiwiX2Zvcm1EYXRhIiwiX2lzSG9zdCIsInRyaW0iLCJzb3J0UXVlcnkiLCJzb3J0IiwiX3NvcnQiLCJfZmluYWxpemVRdWVyeVN0cmluZyIsInF1ZXJ5IiwiX3F1ZXJ5Iiwiam9pbiIsImluY2x1ZGVzIiwiaW5kZXgiLCJpbmRleE9mIiwicXVlcnlBcnJheSIsInNsaWNlIiwic3BsaXQiLCJfYXBwZW5kUXVlcnlTdHJpbmciLCJfdGltZW91dEVycm9yIiwicmVhc29uIiwiZXJybm8iLCJjYWxsYmFjayIsIl9zZXRUaW1lb3V0cyIsInNldFRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxJQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBQyxRQUFELENBQXRCO0FBRUE7QUFDQTtBQUNBOzs7QUFDQSxJQUFNQyxRQUFRLEdBQUdELE9BQU8sQ0FBQyxhQUFELENBQXhCO0FBRUE7QUFDQTtBQUNBOzs7QUFFQUUsTUFBTSxDQUFDQyxPQUFQLEdBQWlCQyxXQUFqQjtBQUVBO0FBQ0E7QUFDQTtBQUNB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LENBRCtDLENBRy9DOztBQUNBLE1BQUksS0FBS3ZDLFFBQUwsSUFBaUIsQ0FBQyxLQUFLYixNQUEzQixFQUFtQztBQUNqQyxTQUFLQSxNQUFMLEdBQWNxSSxVQUFVLENBQUMsWUFBTTtBQUM3QmpGLE1BQUFBLElBQUksQ0FBQzRFLGFBQUwsQ0FBbUIsYUFBbkIsRUFBa0M1RSxJQUFJLENBQUN2QyxRQUF2QyxFQUFpRCxPQUFqRDtBQUNELEtBRnVCLEVBRXJCLEtBQUtBLFFBRmdCLENBQXhCO0FBR0QsR0FSOEMsQ0FVL0M7OztBQUNBLE1BQUksS0FBS0MsZ0JBQUwsSUFBeUIsQ0FBQyxLQUFLYixxQkFBbkMsRUFBMEQ7QUFDeEQsU0FBS0EscUJBQUwsR0FBNkJvSSxVQUFVLENBQUMsWUFBTTtBQUM1Q2pGLE1BQUFBLElBQUksQ0FBQzRFLGFBQUwsQ0FDRSxzQkFERixFQUVFNUUsSUFBSSxDQUFDdEMsZ0JBRlAsRUFHRSxXQUhGO0FBS0QsS0FOc0MsRUFNcEMsS0FBS0EsZ0JBTitCLENBQXZDO0FBT0Q7QUFDRixDQXBCRCIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHNlbXZlciA9IHJlcXVpcmUoJ3NlbXZlcicpO1xuXG4vKipcbiAqIE1vZHVsZSBvZiBtaXhlZC1pbiBmdW5jdGlvbnMgc2hhcmVkIGJldHdlZW4gbm9kZSBhbmQgY2xpZW50IGNvZGVcbiAqL1xuY29uc3QgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzLW9iamVjdCcpO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVxdWVzdEJhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdEJhc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdEJhc2VgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdEJhc2Uob2JqZWN0KSB7XG4gIGlmIChvYmplY3QpIHJldHVybiBtaXhpbihvYmplY3QpO1xufVxuXG4vKipcbiAqIE1peGluIHRoZSBwcm90b3R5cGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmplY3QpIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gUmVxdWVzdEJhc2UucHJvdG90eXBlKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChSZXF1ZXN0QmFzZS5wcm90b3R5cGUsIGtleSkpXG4gICAgICBvYmplY3Rba2V5XSA9IFJlcXVlc3RCYXNlLnByb3RvdHlwZVtrZXldO1xuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKCkge1xuICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICBjbGVhclRpbWVvdXQodGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXIpO1xuICBjbGVhclRpbWVvdXQodGhpcy5fdXBsb2FkVGltZW91dFRpbWVyKTtcbiAgZGVsZXRlIHRoaXMuX3RpbWVyO1xuICBkZWxldGUgdGhpcy5fcmVzcG9uc2VUaW1lb3V0VGltZXI7XG4gIGRlbGV0ZSB0aGlzLl91cGxvYWRUaW1lb3V0VGltZXI7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBPdmVycmlkZSBkZWZhdWx0IHJlc3BvbnNlIGJvZHkgcGFyc2VyXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB0byBjb252ZXJ0IGluY29taW5nIGRhdGEgaW50byByZXF1ZXN0LmJvZHlcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgdGhpcy5fcGFyc2VyID0gZm47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgZm9ybWF0IG9mIGJpbmFyeSByZXNwb25zZSBib2R5LlxuICogSW4gYnJvd3NlciB2YWxpZCBmb3JtYXRzIGFyZSAnYmxvYicgYW5kICdhcnJheWJ1ZmZlcicsXG4gKiB3aGljaCByZXR1cm4gQmxvYiBhbmQgQXJyYXlCdWZmZXIsIHJlc3BlY3RpdmVseS5cbiAqXG4gKiBJbiBOb2RlIGFsbCB2YWx1ZXMgcmVzdWx0IGluIEJ1ZmZlci5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5yZXNwb25zZVR5cGUoJ2Jsb2InKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUucmVzcG9uc2VUeXBlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHRoaXMuX3Jlc3BvbnNlVHlwZSA9IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgZGVmYXVsdCByZXF1ZXN0IGJvZHkgc2VyaWFsaXplclxuICpcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgdG8gY29udmVydCBkYXRhIHNldCB2aWEgLnNlbmQgb3IgLmF0dGFjaCBpbnRvIHBheWxvYWQgdG8gc2VuZFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZXJpYWxpemUgPSBmdW5jdGlvbiAoZm4pIHtcbiAgdGhpcy5fc2VyaWFsaXplciA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRpbWVvdXRzLlxuICpcbiAqIC0gcmVzcG9uc2UgdGltZW91dCBpcyB0aW1lIGJldHdlZW4gc2VuZGluZyByZXF1ZXN0IGFuZCByZWNlaXZpbmcgdGhlIGZpcnN0IGJ5dGUgb2YgdGhlIHJlc3BvbnNlLiBJbmNsdWRlcyBETlMgYW5kIGNvbm5lY3Rpb24gdGltZS5cbiAqIC0gZGVhZGxpbmUgaXMgdGhlIHRpbWUgZnJvbSBzdGFydCBvZiB0aGUgcmVxdWVzdCB0byByZWNlaXZpbmcgcmVzcG9uc2UgYm9keSBpbiBmdWxsLiBJZiB0aGUgZGVhZGxpbmUgaXMgdG9vIHNob3J0IGxhcmdlIGZpbGVzIG1heSBub3QgbG9hZCBhdCBhbGwgb24gc2xvdyBjb25uZWN0aW9ucy5cbiAqIC0gdXBsb2FkIGlzIHRoZSB0aW1lICBzaW5jZSBsYXN0IGJpdCBvZiBkYXRhIHdhcyBzZW50IG9yIHJlY2VpdmVkLiBUaGlzIHRpbWVvdXQgd29ya3Mgb25seSBpZiBkZWFkbGluZSB0aW1lb3V0IGlzIG9mZlxuICpcbiAqIFZhbHVlIG9mIDAgb3IgZmFsc2UgbWVhbnMgbm8gdGltZW91dC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IG1zIG9yIHtyZXNwb25zZSwgZGVhZGxpbmV9XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhpcy5fdGltZW91dCA9IG9wdGlvbnM7XG4gICAgdGhpcy5fcmVzcG9uc2VUaW1lb3V0ID0gMDtcbiAgICB0aGlzLl91cGxvYWRUaW1lb3V0ID0gMDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZvciAoY29uc3Qgb3B0aW9uIGluIG9wdGlvbnMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdGlvbnMsIG9wdGlvbikpIHtcbiAgICAgIHN3aXRjaCAob3B0aW9uKSB7XG4gICAgICAgIGNhc2UgJ2RlYWRsaW5lJzpcbiAgICAgICAgICB0aGlzLl90aW1lb3V0ID0gb3B0aW9ucy5kZWFkbGluZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmVzcG9uc2UnOlxuICAgICAgICAgIHRoaXMuX3Jlc3BvbnNlVGltZW91dCA9IG9wdGlvbnMucmVzcG9uc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3VwbG9hZCc6XG4gICAgICAgICAgdGhpcy5fdXBsb2FkVGltZW91dCA9IG9wdGlvbnMudXBsb2FkO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGNvbnNvbGUud2FybignVW5rbm93biB0aW1lb3V0IG9wdGlvbicsIG9wdGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBudW1iZXIgb2YgcmV0cnkgYXR0ZW1wdHMgb24gZXJyb3IuXG4gKlxuICogRmFpbGVkIHJlcXVlc3RzIHdpbGwgYmUgcmV0cmllZCAnY291bnQnIHRpbWVzIGlmIHRpbWVvdXQgb3IgZXJyLmNvZGUgPj0gNTAwLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5yZXRyeSA9IGZ1bmN0aW9uIChjb3VudCwgZm4pIHtcbiAgLy8gRGVmYXVsdCB0byAxIGlmIG5vIGNvdW50IHBhc3NlZCBvciB0cnVlXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwIHx8IGNvdW50ID09PSB0cnVlKSBjb3VudCA9IDE7XG4gIGlmIChjb3VudCA8PSAwKSBjb3VudCA9IDA7XG4gIHRoaXMuX21heFJldHJpZXMgPSBjb3VudDtcbiAgdGhpcy5fcmV0cmllcyA9IDA7XG4gIHRoaXMuX3JldHJ5Q2FsbGJhY2sgPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gTk9URTogd2UgZG8gbm90IGluY2x1ZGUgRVNPQ0tFVFRJTUVET1VUIGJlY2F1c2UgdGhhdCBpcyBmcm9tIGByZXF1ZXN0YCBwYWNrYWdlXG4vLyAgICAgICA8aHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9nb3QvcHVsbC81Mzc+XG4vL1xuLy8gTk9URTogd2UgZG8gbm90IGluY2x1ZGUgRUFERFJJTkZPIGJlY2F1c2UgaXQgd2FzIHJlbW92ZWQgZnJvbSBsaWJ1diBpbiAyMDE0XG4vLyAgICAgICA8aHR0cHM6Ly9naXRodWIuY29tL2xpYnV2L2xpYnV2L2NvbW1pdC8wMmUxZWJkNDBiODA3YmU1YWY0NjM0M2VhODczMzMxYjJlZTRlOWMxPlxuLy8gICAgICAgPGh0dHBzOi8vZ2l0aHViLmNvbS9yZXF1ZXN0L3JlcXVlc3Qvc2VhcmNoP3E9RVNPQ0tFVFRJTUVET1VUJnVuc2NvcGVkX3E9RVNPQ0tFVFRJTUVET1VUPlxuLy9cbi8vXG4vLyBUT0RPOiBleHBvc2UgdGhlc2UgYXMgY29uZmlndXJhYmxlIGRlZmF1bHRzXG4vL1xuY29uc3QgRVJST1JfQ09ERVMgPSBuZXcgU2V0KFtcbiAgJ0VUSU1FRE9VVCcsXG4gICdFQ09OTlJFU0VUJyxcbiAgJ0VBRERSSU5VU0UnLFxuICAnRUNPTk5SRUZVU0VEJyxcbiAgJ0VQSVBFJyxcbiAgJ0VOT1RGT1VORCcsXG4gICdFTkVUVU5SRUFDSCcsXG4gICdFQUlfQUdBSU4nXG5dKTtcblxuY29uc3QgU1RBVFVTX0NPREVTID0gbmV3IFNldChbXG4gIDQwOCwgNDEzLCA0MjksIDUwMCwgNTAyLCA1MDMsIDUwNCwgNTIxLCA1MjIsIDUyNFxuXSk7XG5cbi8vIFRPRE86IHdlIHdvdWxkIG5lZWQgdG8gbWFrZSB0aGlzIGVhc2lseSBjb25maWd1cmFibGUgYmVmb3JlIGFkZGluZyBpdCBpbiAoZS5nLiBzb21lIG1pZ2h0IHdhbnQgdG8gYWRkIFBPU1QpXG4vLyBjb25zdCBNRVRIT0RTID0gbmV3IFNldChbJ0dFVCcsICdQVVQnLCAnSEVBRCcsICdERUxFVEUnLCAnT1BUSU9OUycsICdUUkFDRSddKTtcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSByZXF1ZXN0IHNob3VsZCBiZSByZXRyaWVkLlxuICogKEluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvZ290I3JldHJ5KVxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyciBhbiBlcnJvclxuICogQHBhcmFtIHtSZXNwb25zZX0gW3Jlc10gcmVzcG9uc2VcbiAqIEByZXR1cm5zIHtCb29sZWFufSBpZiBzZWdtZW50IHNob3VsZCBiZSByZXRyaWVkXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fc2hvdWxkUmV0cnkgPSBmdW5jdGlvbiAoZXJyb3IsIHJlcykge1xuICBpZiAoIXRoaXMuX21heFJldHJpZXMgfHwgdGhpcy5fcmV0cmllcysrID49IHRoaXMuX21heFJldHJpZXMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy5fcmV0cnlDYWxsYmFjaykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdmVycmlkZSA9IHRoaXMuX3JldHJ5Q2FsbGJhY2soZXJyb3IsIHJlcyk7XG4gICAgICBpZiAob3ZlcnJpZGUgPT09IHRydWUpIHJldHVybiB0cnVlO1xuICAgICAgaWYgKG92ZXJyaWRlID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gdW5kZWZpbmVkIGZhbGxzIGJhY2sgdG8gZGVmYXVsdHNcbiAgICB9IGNhdGNoIChlcnJvcl8pIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JfKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPOiB3ZSB3b3VsZCBuZWVkIHRvIG1ha2UgdGhpcyBlYXNpbHkgY29uZmlndXJhYmxlIGJlZm9yZSBhZGRpbmcgaXQgaW4gKGUuZy4gc29tZSBtaWdodCB3YW50IHRvIGFkZCBQT1NUKVxuICAvKlxuICBpZiAoXG4gICAgdGhpcy5yZXEgJiZcbiAgICB0aGlzLnJlcS5tZXRob2QgJiZcbiAgICAhTUVUSE9EUy5oYXModGhpcy5yZXEubWV0aG9kLnRvVXBwZXJDYXNlKCkpXG4gIClcbiAgICByZXR1cm4gZmFsc2U7XG4gICovXG4gIGlmIChyZXMgJiYgcmVzLnN0YXR1cyAmJiBTVEFUVVNfQ09ERVMuaGFzKHJlcy5zdGF0dXMpKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKGVycm9yKSB7XG4gICAgaWYgKGVycm9yLmNvZGUgJiYgRVJST1JfQ09ERVMuaGFzKGVycm9yLmNvZGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTdXBlcmFnZW50IHRpbWVvdXRcbiAgICBpZiAoZXJyb3IudGltZW91dCAmJiBlcnJvci5jb2RlID09PSAnRUNPTk5BQk9SVEVEJykgcmV0dXJuIHRydWU7XG4gICAgaWYgKGVycm9yLmNyb3NzRG9tYWluKSByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogUmV0cnkgcmVxdWVzdFxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9yZXRyeSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcblxuICAvLyBub2RlXG4gIGlmICh0aGlzLnJlcSkge1xuICAgIHRoaXMucmVxID0gbnVsbDtcbiAgICB0aGlzLnJlcSA9IHRoaXMucmVxdWVzdCgpO1xuICB9XG5cbiAgdGhpcy5fYWJvcnRlZCA9IGZhbHNlO1xuICB0aGlzLnRpbWVkb3V0ID0gZmFsc2U7XG4gIHRoaXMudGltZWRvdXRFcnJvciA9IG51bGw7XG5cbiAgcmV0dXJuIHRoaXMuX2VuZCgpO1xufTtcblxuLyoqXG4gKiBQcm9taXNlIHN1cHBvcnRcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZXNvbHZlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmVqZWN0XVxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgaWYgKCF0aGlzLl9mdWxsZmlsbGVkUHJvbWlzZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLl9lbmRDYWxsZWQpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1dhcm5pbmc6IHN1cGVyYWdlbnQgcmVxdWVzdCB3YXMgc2VudCB0d2ljZSwgYmVjYXVzZSBib3RoIC5lbmQoKSBhbmQgLnRoZW4oKSB3ZXJlIGNhbGxlZC4gTmV2ZXIgY2FsbCAuZW5kKCkgaWYgeW91IHVzZSBwcm9taXNlcydcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5fZnVsbGZpbGxlZFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBzZWxmLm9uKCdhYm9ydCcsICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX21heFJldHJpZXMgJiYgdGhpcy5fbWF4UmV0cmllcyA+IHRoaXMuX3JldHJpZXMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50aW1lZG91dCAmJiB0aGlzLnRpbWVkb3V0RXJyb3IpIHtcbiAgICAgICAgICByZWplY3QodGhpcy50aW1lZG91dEVycm9yKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcignQWJvcnRlZCcpO1xuICAgICAgICBlcnJvci5jb2RlID0gJ0FCT1JURUQnO1xuICAgICAgICBlcnJvci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgICAgICAgZXJyb3IubWV0aG9kID0gdGhpcy5tZXRob2Q7XG4gICAgICAgIGVycm9yLnVybCA9IHRoaXMudXJsO1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG4gICAgICBzZWxmLmVuZCgoZXJyb3IsIHJlcykgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHJlamVjdChlcnJvcik7XG4gICAgICAgIGVsc2UgcmVzb2x2ZShyZXMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5fZnVsbGZpbGxlZFByb21pc2UudGhlbihyZXNvbHZlLCByZWplY3QpO1xufTtcblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24gKGNiKSB7XG4gIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBjYik7XG59O1xuXG4vKipcbiAqIEFsbG93IGZvciBleHRlbnNpb25cbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gKGZuKSB7XG4gIGZuKHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5vayA9IGZ1bmN0aW9uIChjYikge1xuICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ0NhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIHRoaXMuX29rQ2FsbGJhY2sgPSBjYjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX2lzUmVzcG9uc2VPSyA9IGZ1bmN0aW9uIChyZXMpIHtcbiAgaWYgKCFyZXMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGhpcy5fb2tDYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLl9va0NhbGxiYWNrKHJlcyk7XG4gIH1cblxuICByZXR1cm4gcmVzLnN0YXR1cyA+PSAyMDAgJiYgcmVzLnN0YXR1cyA8IDMwMDtcbn07XG5cbi8qKlxuICogR2V0IHJlcXVlc3QgaGVhZGVyIGBmaWVsZGAuXG4gKiBDYXNlLWluc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIHJldHVybiB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICogVGhpcyBpcyBhIGRlcHJlY2F0ZWQgaW50ZXJuYWwgQVBJLiBVc2UgYC5nZXQoZmllbGQpYCBpbnN0ZWFkLlxuICpcbiAqIChnZXRIZWFkZXIgaXMgbm8gbG9uZ2VyIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgc3VwZXJhZ2VudCBjb2RlIGJhc2UpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqIEBkZXByZWNhdGVkXG4gKi9cblxuUmVxdWVzdEJhc2UucHJvdG90eXBlLmdldEhlYWRlciA9IFJlcXVlc3RCYXNlLnByb3RvdHlwZS5nZXQ7XG5cbi8qKlxuICogU2V0IGhlYWRlciBgZmllbGRgIHRvIGB2YWxgLCBvciBtdWx0aXBsZSBmaWVsZHMgd2l0aCBvbmUgb2JqZWN0LlxuICogQ2FzZS1pbnNlbnNpdGl2ZS5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoZmllbGQsIHZhbHVlKSB7XG4gIGlmIChpc09iamVjdChmaWVsZCkpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmaWVsZCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChmaWVsZCwga2V5KSlcbiAgICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXSA9IHZhbHVlO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBoZWFkZXIgYGZpZWxkYC5cbiAqIENhc2UtaW5zZW5zaXRpdmUuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkIGZpZWxkIG5hbWVcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLnVuc2V0ID0gZnVuY3Rpb24gKGZpZWxkKSB7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBXcml0ZSB0aGUgZmllbGQgYG5hbWVgIGFuZCBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdFxuICogZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiIHJlcXVlc3QgYm9kaWVzLlxuICpcbiAqIGBgYCBqc1xuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKCdmb28nLCAnYmFyJylcbiAqICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogcmVxdWVzdC5wb3N0KCcvdXBsb2FkJylcbiAqICAgLmZpZWxkKHsgZm9vOiAnYmFyJywgYmF6OiAncXV4JyB9KVxuICogICAuZW5kKGNhbGxiYWNrKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gbmFtZSBuYW1lIG9mIGZpZWxkXG4gKiBAcGFyYW0ge1N0cmluZ3xCbG9ifEZpbGV8QnVmZmVyfGZzLlJlYWRTdHJlYW19IHZhbCB2YWx1ZSBvZiBmaWVsZFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgLy8gbmFtZSBzaG91bGQgYmUgZWl0aGVyIGEgc3RyaW5nIG9yIGFuIG9iamVjdC5cbiAgaWYgKG5hbWUgPT09IG51bGwgfHwgdW5kZWZpbmVkID09PSBuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCcuZmllbGQobmFtZSwgdmFsKSBuYW1lIGNhbiBub3QgYmUgZW1wdHknKTtcbiAgfVxuXG4gIGlmICh0aGlzLl9kYXRhKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCIuZmllbGQoKSBjYW4ndCBiZSB1c2VkIGlmIC5zZW5kKCkgaXMgdXNlZC4gUGxlYXNlIHVzZSBvbmx5IC5zZW5kKCkgb3Igb25seSAuZmllbGQoKSAmIC5hdHRhY2goKVwiXG4gICAgKTtcbiAgfVxuXG4gIGlmIChpc09iamVjdChuYW1lKSkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIG5hbWUpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobmFtZSwga2V5KSlcbiAgICAgICAgdGhpcy5maWVsZChrZXksIG5hbWVba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBmb3IgKGNvbnN0IGkgaW4gdmFsdWUpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGkpKVxuICAgICAgICB0aGlzLmZpZWxkKG5hbWUsIHZhbHVlW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHZhbCBzaG91bGQgYmUgZGVmaW5lZCBub3dcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHVuZGVmaW5lZCA9PT0gdmFsdWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJy5maWVsZChuYW1lLCB2YWwpIHZhbCBjYW4gbm90IGJlIGVtcHR5Jyk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSk7XG4gIH1cblxuICB0aGlzLl9nZXRGb3JtRGF0YSgpLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IHJlcXVlc3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5hYm9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRoaXMuX2Fib3J0ZWQgPSB0cnVlO1xuICBpZiAodGhpcy54aHIpIHRoaXMueGhyLmFib3J0KCk7IC8vIGJyb3dzZXJcbiAgaWYgKHRoaXMucmVxKSB7XG4gICAgLy8gTm9kZSB2MTMgaGFzIG1ham9yIGRpZmZlcmVuY2VzIGluIGBhYm9ydCgpYFxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL3YxMi54L2xpYi9pbnRlcm5hbC9zdHJlYW1zL2VuZC1vZi1zdHJlYW0uanNcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi92MTMueC9saWIvaW50ZXJuYWwvc3RyZWFtcy9lbmQtb2Ytc3RyZWFtLmpzXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvdjE0LngvbGliL2ludGVybmFsL3N0cmVhbXMvZW5kLW9mLXN0cmVhbS5qc1xuICAgIC8vIChpZiB5b3UgcnVuIGEgZGlmZiBhY3Jvc3MgdGhlc2UgeW91IHdpbGwgc2VlIHRoZSBkaWZmZXJlbmNlcylcbiAgICAvL1xuICAgIC8vIFJlZmVyZW5jZXM6XG4gICAgLy8gPGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvMzE2MzA+XG4gICAgLy8gPGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9zdXBlcmFnZW50L3B1bGwvMTA4NC9jb21taXRzL2RjMTg2NzlhN2M1Y2NmYzYwNDZkODgyMDE1ZTUxMjY4ODg5NzNiYzg+XG4gICAgLy9cbiAgICAvLyBUaGFua3MgdG8gQHNoYWRvd2dhdGUxNSBhbmQgQG5pZnR5bGV0dHVjZVxuICAgIGlmIChcbiAgICAgIHNlbXZlci5ndGUocHJvY2Vzcy52ZXJzaW9uLCAndjEzLjAuMCcpICYmXG4gICAgICBzZW12ZXIubHQocHJvY2Vzcy52ZXJzaW9uLCAndjE0LjAuMCcpXG4gICAgKSB7XG4gICAgICAvLyBOb3RlIHRoYXQgdGhlIHJlYXNvbiB0aGlzIGRvZXNuJ3Qgd29yayBpcyBiZWNhdXNlIGluIHYxMyBhcyBjb21wYXJlZCB0byB2MTRcbiAgICAgIC8vIHRoZXJlIGlzIG5vIGBjYWxsYmFjayA9IG5vcGAgc2V0IGluIGVuZC1vZi1zdHJlYW0uanMgYWJvdmVcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1N1cGVyYWdlbnQgZG9lcyBub3Qgd29yayBpbiB2MTMgcHJvcGVybHkgd2l0aCBhYm9ydCgpIGR1ZSB0byBOb2RlLmpzIGNvcmUgY2hhbmdlcydcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzZW12ZXIuZ3RlKHByb2Nlc3MudmVyc2lvbiwgJ3YxNC4wLjAnKSkge1xuICAgICAgLy8gV2UgaGF2ZSB0byBtYW51YWxseSBzZXQgYGRlc3Ryb3llZGAgdG8gYHRydWVgIGluIG9yZGVyIGZvciB0aGlzIHRvIHdvcmtcbiAgICAgIC8vIChzZWUgY29yZSBpbnRlcm5hbHMgb2YgZW5kLW9mLXN0cmVhbS5qcyBhYm92ZSBpbiB2MTQgYnJhbmNoIGFzIGNvbXBhcmVkIHRvIHYxMilcbiAgICAgIHRoaXMucmVxLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5yZXEuYWJvcnQoKTsgLy8gbm9kZVxuICB9XG5cbiAgdGhpcy5jbGVhclRpbWVvdXQoKTtcbiAgdGhpcy5lbWl0KCdhYm9ydCcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fYXV0aCA9IGZ1bmN0aW9uICh1c2VyLCBwYXNzLCBvcHRpb25zLCBiYXNlNjRFbmNvZGVyKSB7XG4gIHN3aXRjaCAob3B0aW9ucy50eXBlKSB7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCBgQmFzaWMgJHtiYXNlNjRFbmNvZGVyKGAke3VzZXJ9OiR7cGFzc31gKX1gKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYXV0byc6XG4gICAgICB0aGlzLnVzZXJuYW1lID0gdXNlcjtcbiAgICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdiZWFyZXInOiAvLyB1c2FnZSB3b3VsZCBiZSAuYXV0aChhY2Nlc3NUb2tlbiwgeyB0eXBlOiAnYmVhcmVyJyB9KVxuICAgICAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCBgQmVhcmVyICR7dXNlcn1gKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24gKG9uKSB7XG4gIC8vIFRoaXMgaXMgYnJvd3Nlci1vbmx5IGZ1bmN0aW9uYWxpdHkuIE5vZGUgc2lkZSBpcyBuby1vcC5cbiAgaWYgKG9uID09PSB1bmRlZmluZWQpIG9uID0gdHJ1ZTtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gb247XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIG1heCByZWRpcmVjdHMgdG8gYG5gLiBEb2VzIG5vdGhpbmcgaW4gYnJvd3NlciBYSFIgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUucmVkaXJlY3RzID0gZnVuY3Rpb24gKG4pIHtcbiAgdGhpcy5fbWF4UmVkaXJlY3RzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1heGltdW0gc2l6ZSBvZiBidWZmZXJlZCByZXNwb25zZSBib2R5LCBpbiBieXRlcy4gQ291bnRzIHVuY29tcHJlc3NlZCBzaXplLlxuICogRGVmYXVsdCAyMDBNQi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbiBudW1iZXIgb2YgYnl0ZXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICovXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUubWF4UmVzcG9uc2VTaXplID0gZnVuY3Rpb24gKG4pIHtcbiAgaWYgKHR5cGVvZiBuICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYXJndW1lbnQnKTtcbiAgfVxuXG4gIHRoaXMuX21heFJlc3BvbnNlU2l6ZSA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IHRvIGEgcGxhaW4gamF2YXNjcmlwdCBvYmplY3QgKG5vdCBKU09OIHN0cmluZykgb2Ygc2NhbGFyIHByb3BlcnRpZXMuXG4gKiBOb3RlIGFzIHRoaXMgbWV0aG9kIGlzIGRlc2lnbmVkIHRvIHJldHVybiBhIHVzZWZ1bCBub24tdGhpcyB2YWx1ZSxcbiAqIGl0IGNhbm5vdCBiZSBjaGFpbmVkLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gZGVzY3JpYmluZyBtZXRob2QsIHVybCwgYW5kIGRhdGEgb2YgdGhpcyByZXF1ZXN0XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgbWV0aG9kOiB0aGlzLm1ldGhvZCxcbiAgICB1cmw6IHRoaXMudXJsLFxuICAgIGRhdGE6IHRoaXMuX2RhdGEsXG4gICAgaGVhZGVyczogdGhpcy5faGVhZGVyXG4gIH07XG59O1xuXG4vKipcbiAqIFNlbmQgYGRhdGFgIGFzIHRoZSByZXF1ZXN0IGJvZHksIGRlZmF1bHRpbmcgdGhlIGAudHlwZSgpYCB0byBcImpzb25cIiB3aGVuXG4gKiBhbiBvYmplY3QgaXMgZ2l2ZW4uXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifScpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byBqc29uXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoJ25hbWU9dGonKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0cyB0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gKiAgICAgICAgLnNlbmQoJ3NwZWNpZXM9ZmVycmV0JylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjb21wbGV4aXR5XG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gIGNvbnN0IGlzT2JqZWN0XyA9IGlzT2JqZWN0KGRhdGEpO1xuICBsZXQgdHlwZSA9IHRoaXMuX2hlYWRlclsnY29udGVudC10eXBlJ107XG5cbiAgaWYgKHRoaXMuX2Zvcm1EYXRhKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCIuc2VuZCgpIGNhbid0IGJlIHVzZWQgaWYgLmF0dGFjaCgpIG9yIC5maWVsZCgpIGlzIHVzZWQuIFBsZWFzZSB1c2Ugb25seSAuc2VuZCgpIG9yIG9ubHkgLmZpZWxkKCkgJiAuYXR0YWNoKClcIlxuICAgICk7XG4gIH1cblxuICBpZiAoaXNPYmplY3RfICYmICF0aGlzLl9kYXRhKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSBbXTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9pc0hvc3QoZGF0YSkpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB7fTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGF0YSAmJiB0aGlzLl9kYXRhICYmIHRoaXMuX2lzSG9zdCh0aGlzLl9kYXRhKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IG1lcmdlIHRoZXNlIHNlbmQgY2FsbHNcIik7XG4gIH1cblxuICAvLyBtZXJnZVxuICBpZiAoaXNPYmplY3RfICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpKVxuICAgICAgICB0aGlzLl9kYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBkYXRhID09PSAnc3RyaW5nJykge1xuICAgIC8vIGRlZmF1bHQgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2Zvcm0nKTtcbiAgICB0eXBlID0gdGhpcy5faGVhZGVyWydjb250ZW50LXR5cGUnXTtcbiAgICBpZiAodHlwZSkgdHlwZSA9IHR5cGUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgaWYgKHR5cGUgPT09ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKSB7XG4gICAgICB0aGlzLl9kYXRhID0gdGhpcy5fZGF0YSA/IGAke3RoaXMuX2RhdGF9JiR7ZGF0YX1gIDogZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGF0YSA9ICh0aGlzLl9kYXRhIHx8ICcnKSArIGRhdGE7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xuICB9XG5cbiAgaWYgKCFpc09iamVjdF8gfHwgdGhpcy5faXNIb3N0KGRhdGEpKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBkZWZhdWx0IHRvIGpzb25cbiAgaWYgKCF0eXBlKSB0aGlzLnR5cGUoJ2pzb24nKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNvcnQgYHF1ZXJ5c3RyaW5nYCBieSB0aGUgc29ydCBmdW5jdGlvblxuICpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBkZWZhdWx0IG9yZGVyXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3VzZXInKVxuICogICAgICAgICAucXVlcnkoJ25hbWU9TmljaycpXG4gKiAgICAgICAgIC5xdWVyeSgnc2VhcmNoPU1hbm55JylcbiAqICAgICAgICAgLnNvcnRRdWVyeSgpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gY3VzdG9taXplZCBzb3J0IGZ1bmN0aW9uXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3VzZXInKVxuICogICAgICAgICAucXVlcnkoJ25hbWU9TmljaycpXG4gKiAgICAgICAgIC5xdWVyeSgnc2VhcmNoPU1hbm55JylcbiAqICAgICAgICAgLnNvcnRRdWVyeShmdW5jdGlvbihhLCBiKXtcbiAqICAgICAgICAgICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbiAqICAgICAgICAgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc29ydFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3RCYXNlLnByb3RvdHlwZS5zb3J0UXVlcnkgPSBmdW5jdGlvbiAoc29ydCkge1xuICAvLyBfc29ydCBkZWZhdWx0IHRvIHRydWUgYnV0IG90aGVyd2lzZSBjYW4gYmUgYSBmdW5jdGlvbiBvciBib29sZWFuXG4gIHRoaXMuX3NvcnQgPSB0eXBlb2Ygc29ydCA9PT0gJ3VuZGVmaW5lZCcgPyB0cnVlIDogc29ydDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvbXBvc2UgcXVlcnlzdHJpbmcgdG8gYXBwZW5kIHRvIHJlcS51cmxcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUmVxdWVzdEJhc2UucHJvdG90eXBlLl9maW5hbGl6ZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBxdWVyeSA9IHRoaXMuX3F1ZXJ5LmpvaW4oJyYnKTtcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgdGhpcy51cmwgKz0gKHRoaXMudXJsLmluY2x1ZGVzKCc/JykgPyAnJicgOiAnPycpICsgcXVlcnk7XG4gIH1cblxuICB0aGlzLl9xdWVyeS5sZW5ndGggPSAwOyAvLyBNYWtlcyB0aGUgY2FsbCBpZGVtcG90ZW50XG5cbiAgaWYgKHRoaXMuX3NvcnQpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMudXJsLmluZGV4T2YoJz8nKTtcbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgY29uc3QgcXVlcnlBcnJheSA9IHRoaXMudXJsLnNsaWNlKGluZGV4ICsgMSkuc3BsaXQoJyYnKTtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fc29ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBxdWVyeUFycmF5LnNvcnQodGhpcy5fc29ydCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeUFycmF5LnNvcnQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy51cmwgPSB0aGlzLnVybC5zbGljZSgwLCBpbmRleCkgKyAnPycgKyBxdWVyeUFycmF5LmpvaW4oJyYnKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIEZvciBiYWNrd2FyZHMgY29tcGF0IG9ubHlcblJlcXVlc3RCYXNlLnByb3RvdHlwZS5fYXBwZW5kUXVlcnlTdHJpbmcgPSAoKSA9PiB7XG4gIGNvbnNvbGUud2FybignVW5zdXBwb3J0ZWQnKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggdGltZW91dCBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX3RpbWVvdXRFcnJvciA9IGZ1bmN0aW9uIChyZWFzb24sIHRpbWVvdXQsIGVycm5vKSB7XG4gIGlmICh0aGlzLl9hYm9ydGVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoYCR7cmVhc29uICsgdGltZW91dH1tcyBleGNlZWRlZGApO1xuICBlcnJvci50aW1lb3V0ID0gdGltZW91dDtcbiAgZXJyb3IuY29kZSA9ICdFQ09OTkFCT1JURUQnO1xuICBlcnJvci5lcnJubyA9IGVycm5vO1xuICB0aGlzLnRpbWVkb3V0ID0gdHJ1ZTtcbiAgdGhpcy50aW1lZG91dEVycm9yID0gZXJyb3I7XG4gIHRoaXMuYWJvcnQoKTtcbiAgdGhpcy5jYWxsYmFjayhlcnJvcik7XG59O1xuXG5SZXF1ZXN0QmFzZS5wcm90b3R5cGUuX3NldFRpbWVvdXRzID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBzZWxmID0gdGhpcztcblxuICAvLyBkZWFkbGluZVxuICBpZiAodGhpcy5fdGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2VsZi5fdGltZW91dEVycm9yKCdUaW1lb3V0IG9mICcsIHNlbGYuX3RpbWVvdXQsICdFVElNRScpO1xuICAgIH0sIHRoaXMuX3RpbWVvdXQpO1xuICB9XG5cbiAgLy8gcmVzcG9uc2UgdGltZW91dFxuICBpZiAodGhpcy5fcmVzcG9uc2VUaW1lb3V0ICYmICF0aGlzLl9yZXNwb25zZVRpbWVvdXRUaW1lcikge1xuICAgIHRoaXMuX3Jlc3BvbnNlVGltZW91dFRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZWxmLl90aW1lb3V0RXJyb3IoXG4gICAgICAgICdSZXNwb25zZSB0aW1lb3V0IG9mICcsXG4gICAgICAgIHNlbGYuX3Jlc3BvbnNlVGltZW91dCxcbiAgICAgICAgJ0VUSU1FRE9VVCdcbiAgICAgICk7XG4gICAgfSwgdGhpcy5fcmVzcG9uc2VUaW1lb3V0KTtcbiAgfVxufTtcbiJdfQ==

/***/ }),

/***/ "./node_modules/superagent/lib/response-base.js":
/*!******************************************************!*\
  !*** ./node_modules/superagent/lib/response-base.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

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

function ResponseBase(object) {
  if (object) return mixin(object);
}
/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */


function mixin(object) {
  for (var key in ResponseBase.prototype) {
    if (Object.prototype.hasOwnProperty.call(ResponseBase.prototype, key)) object[key] = ResponseBase.prototype[key];
  }

  return object;
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

  var parameters = utils.params(ct);

  for (var key in parameters) {
    if (Object.prototype.hasOwnProperty.call(parameters, key)) this[key] = parameters[key];
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
  var type = Math.trunc(status / 100); // status / class

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNwb25zZS1iYXNlLmpzIl0sIm5hbWVzIjpbInV0aWxzIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJSZXNwb25zZUJhc2UiLCJvYmplY3QiLCJtaXhpbiIsImtleSIsInByb3RvdHlwZSIsIk9iamVjdCIsImhhc093blByb3BlcnR5IiwiY2FsbCIsImdldCIsImZpZWxkIiwiaGVhZGVyIiwidG9Mb3dlckNhc2UiLCJfc2V0SGVhZGVyUHJvcGVydGllcyIsImN0IiwidHlwZSIsInBhcmFtZXRlcnMiLCJwYXJhbXMiLCJsaW5rcyIsImxpbmsiLCJwYXJzZUxpbmtzIiwiX3NldFN0YXR1c1Byb3BlcnRpZXMiLCJzdGF0dXMiLCJNYXRoIiwidHJ1bmMiLCJzdGF0dXNDb2RlIiwic3RhdHVzVHlwZSIsImluZm8iLCJvayIsInJlZGlyZWN0IiwiY2xpZW50RXJyb3IiLCJzZXJ2ZXJFcnJvciIsImVycm9yIiwidG9FcnJvciIsImNyZWF0ZWQiLCJhY2NlcHRlZCIsIm5vQ29udGVudCIsImJhZFJlcXVlc3QiLCJ1bmF1dGhvcml6ZWQiLCJub3RBY2NlcHRhYmxlIiwiZm9yYmlkZGVuIiwibm90Rm91bmQiLCJ1bnByb2Nlc3NhYmxlRW50aXR5Il0sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7QUFDQTtBQUVBLElBQU1BLEtBQUssR0FBR0MsT0FBTyxDQUFDLFNBQUQsQ0FBckI7QUFFQTtBQUNBO0FBQ0E7OztBQUVBQyxNQUFNLENBQUNDLE9BQVAsR0FBaUJDLFlBQWpCO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxZQUFULENBQXNCQyxNQUF0QixFQUE4QjtBQUM1QixNQUFJQSxNQUFKLEVBQVksT0FBT0MsS0FBSyxDQUFDRCxNQUFELENBQVo7QUFDYjtBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQSxTQUFTQyxLQUFULENBQWVELE1BQWYsRUFBdUI7QUFDckIsT0FBSyxJQUFNRSxHQUFYLElB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QUFLYyxTQUFMLEdBQWlCZCxNQUFNLEtBQUssR0FBNUI7QUFDQSxPQUFLZSxVQUFMLEdBQWtCZixNQUFNLEtBQUssR0FBN0I7QUFDQSxPQUFLZ0IsWUFBTCxHQUFvQmhCLE1BQU0sS0FBSyxHQUEvQjtBQUNBLE9BQUtpQixhQUFMLEdBQXFCakIsTUFBTSxLQUFLLEdBQWhDO0FBQ0EsT0FBS2tCLFNBQUwsR0FBaUJsQixNQUFNLEtBQUssR0FBNUI7QUFDQSxPQUFLbUIsUUFBTCxHQUFnQm5CLE1BQU0sS0FBSyxHQUEzQjtBQUNBLE9BQUtvQixtQkFBTCxHQUEyQnBCLE1BQU0sS0FBSyxHQUF0QztBQUNELENBMUJEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG4vKipcbiAqIEV4cG9zZSBgUmVzcG9uc2VCYXNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3BvbnNlQmFzZTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBSZXNwb25zZUJhc2VgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVzcG9uc2VCYXNlKG9iamVjdCkge1xuICBpZiAob2JqZWN0KSByZXR1cm4gbWl4aW4ob2JqZWN0KTtcbn1cblxuLyoqXG4gKiBNaXhpbiB0aGUgcHJvdG90eXBlIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqZWN0KSB7XG4gIGZvciAoY29uc3Qga2V5IGluIFJlc3BvbnNlQmFzZS5wcm90b3R5cGUpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFJlc3BvbnNlQmFzZS5wcm90b3R5cGUsIGtleSkpXG4gICAgICBvYmplY3Rba2V5XSA9IFJlc3BvbnNlQmFzZS5wcm90b3R5cGVba2V5XTtcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2VCYXNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlQmFzZS5wcm90b3R5cGUuX3NldEhlYWRlclByb3BlcnRpZXMgPSBmdW5jdGlvbiAoaGVhZGVyKSB7XG4gIC8vIFRPRE86IG1vYXIhXG4gIC8vIFRPRE86IG1ha2UgdGhpcyBhIHV0aWxcblxuICAvLyBjb250ZW50LXR5cGVcbiAgY29uc3QgY3QgPSBoZWFkZXJbJ2NvbnRlbnQtdHlwZSddIHx8ICcnO1xuICB0aGlzLnR5cGUgPSB1dGlscy50eXBlKGN0KTtcblxuICAvLyBwYXJhbXNcbiAgY29uc3QgcGFyYW1ldGVycyA9IHV0aWxzLnBhcmFtcyhjdCk7XG4gIGZvciAoY29uc3Qga2V5IGluIHBhcmFtZXRlcnMpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmFtZXRlcnMsIGtleSkpXG4gICAgICB0aGlzW2tleV0gPSBwYXJhbWV0ZXJzW2tleV07XG4gIH1cblxuICB0aGlzLmxpbmtzID0ge307XG5cbiAgLy8gbGlua3NcbiAgdHJ5IHtcbiAgICBpZiAoaGVhZGVyLmxpbmspIHtcbiAgICAgIHRoaXMubGlua3MgPSB1dGlscy5wYXJzZUxpbmtzKGhlYWRlci5saW5rKTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIGlnbm9yZVxuICB9XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlQmFzZS5wcm90b3R5cGUuX3NldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbiAoc3RhdHVzKSB7XG4gIGNvbnN0IHR5cGUgPSBNYXRoLnRydW5jKHN0YXR1cyAvIDEwMCk7XG5cbiAgLy8gc3RhdHVzIC8gY2xhc3NcbiAgdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1cyA9IHRoaXMuc3RhdHVzQ29kZTtcbiAgdGhpcy5zdGF0dXNUeXBlID0gdHlwZTtcblxuICAvLyBiYXNpY3NcbiAgdGhpcy5pbmZvID0gdHlwZSA9PT0gMTtcbiAgdGhpcy5vayA9IHR5cGUgPT09IDI7XG4gIHRoaXMucmVkaXJlY3QgPSB0eXBlID09PSAzO1xuICB0aGlzLmNsaWVudEVycm9yID0gdHlwZSA9PT0gNDtcbiAgdGhpcy5zZXJ2ZXJFcnJvciA9IHR5cGUgPT09IDU7XG4gIHRoaXMuZXJyb3IgPSB0eXBlID09PSA0IHx8IHR5cGUgPT09IDUgPyB0aGlzLnRvRXJyb3IoKSA6IGZhbHNlO1xuXG4gIC8vIHN1Z2FyXG4gIHRoaXMuY3JlYXRlZCA9IHN0YXR1cyA9PT0gMjAxO1xuICB0aGlzLmFjY2VwdGVkID0gc3RhdHVzID09PSAyMDI7XG4gIHRoaXMubm9Db250ZW50ID0gc3RhdHVzID09PSAyMDQ7XG4gIHRoaXMuYmFkUmVxdWVzdCA9IHN0YXR1cyA9PT0gNDAwO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IHN0YXR1cyA9PT0gNDAxO1xuICB0aGlzLm5vdEFjY2VwdGFibGUgPSBzdGF0dXMgPT09IDQwNjtcbiAgdGhpcy5mb3JiaWRkZW4gPSBzdGF0dXMgPT09IDQwMztcbiAgdGhpcy5ub3RGb3VuZCA9IHN0YXR1cyA9PT0gNDA0O1xuICB0aGlzLnVucHJvY2Vzc2FibGVFbnRpdHkgPSBzdGF0dXMgPT09IDQyMjtcbn07XG4iXX0=

/***/ }),

/***/ "./node_modules/superagent/lib/utils.js":
/*!**********************************************!*\
  !*** ./node_modules/superagent/lib/utils.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.type = function (string_) {
  return string_.split(/ *; */).shift();
};
/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.params = function (value) {
  var object = {};

  var _iterator = _createForOfIteratorHelper(value.split(/ *; */)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var string_ = _step.value;
      var parts = string_.split(/ *= */);
      var key = parts.shift();

      var _value = parts.shift();

      if (key && _value) object[key] = _value;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return object;
};
/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.parseLinks = function (value) {
  var object = {};

  var _iterator2 = _createForOfIteratorHelper(value.split(/ *, */)),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var string_ = _step2.value;
      var parts = string_.split(/ *; */);
      var url = parts[0].slice(1, -1);
      var rel = parts[1].split(/ *= */)[1].slice(1, -1);
      object[rel] = url;
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  return object;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlscy5qcyJdLCJuYW1lcyI6WyJleHBvcnRzIiwidHlwZSIsInN0cmluZ18iLCJzcGxpdCIsInNoaWZ0IiwicGFyYW1zIiwidmFsdWUiLCJvYmplY3QiLCJwYXJ0cyIsImtleSIsInBhcnNlTGlua3MiLCJ1cmwiLCJzbGljZSIsInJlbCIsImNsZWFuSGVhZGVyIiwiaGVhZGVyIiwiY2hhbmdlc09yaWdpbiIsImhvc3QiLCJhdXRob3JpemF0aW9uIiwiY29va2llIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUFBLE9BQU8sQ0FBQ0MsSUFBUixHQUFlLFVBQUNDLE9BQUQ7QUFBQSxTQUFhQSxPQUFPLENBQUNDLEtBQVIsQ0FBYyxPQUFkLEVBQXVCQyxLQUF2QixFQUFiO0FBQUEsQ0FBZjtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFFQUosT0FBTyxDQUFDSyxNQUFSLEdBQWlCLFVBQUNDLEtBQUQsRUFBVztBQUMxQixNQUFNQyxNQUFNLEdBQUcsRUFBZjs7QUFEMEIsNkNBRUpELEtBQUssQ0FBQ0gsS0FBTixDQUFZLE9BQVosQ0FGSTtBQUFBOztBQUFBO0FBRTFCLHdEQUE0QztBQUFBLFVBQWpDRCxPQUFpQztBQUMxQyxVQUFNTSxLQUFLLEdBQUdOLE9BQU8sQ0FBQ0MsS0FBUixDQUFjLE9BQWQsQ0FBZDtBQUNBLFVBQU1NLEdBQUcsR0FBR0QsS0FBSyxDQUFDSixLQUFOLEVBQVo7O0FBQ0EsVUFBTUUsTUFBSyxHQUFHRSxLQUFLLENBQUNKLEtBQU4sRUFBZDs7QUFFQSxVQUFJSyxHQUFHLElBQUlILE1BQVgsRUFBa0JDLE1BQU0sQ0FBQ0UsR0FBRCxDQUFOLEdBQWNILE1BQWQ7QUFDbkI7QUFSeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFVMUIsU0FBT0MsTUFBUDtBQUNELENBWEQ7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBRUFQLE9BQU8sQ0FBQ1UsVUFBUixHQUFxQixVQUFDSixLQUFELEVBQVc7QUFDOUIsTUFBTUMsTUFBTSxHQUFHLEVBQWY7O0FBRDhCLDhDQUVSRCxLQUFLLENBQUNILEtBQU4sQ0FBWSxPQUFaLENBRlE7QUFBQTs7QUFBQTtBQUU5QiwyREFBNEM7QUFBQSxVQUFqQ0QsT0FBaUM7QUFDMUMsVUFBTU0sS0FBSyxHQUFHTixPQUFPLENBQUNDLEtBQVIsQ0FBYyxPQUFkLENBQWQ7QUFDQSxVQUFNUSxHQUFHLEdBQUdILEtBQUssQ0FBQyxDQUFELENBQUwsQ0FBU0ksS0FBVCxDQUFlLENBQWYsRUFBa0IsQ0FBQyxDQUFuQixDQUFaO0FBQ0EsVUFBTUMsR0FBRyxHQUFHTCxLQUFLLENBQUMsQ0FBRCxDQUFMLENBQVNMLEtBQVQsQ0FBZSxPQUFmLEVBQXdCLENBQXhCLEVBQTJCUyxLQUEzQixDQUFpQyxDQUFqQyxFQUFvQyxDQUFDLENBQXJDLENBQVo7QUFDQUwsTUFBQUEsTUFBTSxDQUFDTSxHQUFELENBQU4sR0FBY0YsR0FBZDtBQUNEO0FBUDZCO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBUzlCLFNBQU9KLE1BQVA7QUFDRCxDQVZEO0FBWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUVBUCxPQUFPLENBQUNjLFdBQVIsR0FBc0IsVUFBQ0MsTUFBRCxFQUFTQyxhQUFULEVBQTJCO0FBQy9DLFNBQU9ELE1BQU0sQ0FBQyxjQUFELENBQWI7QUFDQSxTQUFPQSxNQUFNLENBQUMsZ0JBQUQsQ0FBYjtBQUNBLFNBQU9BLE1BQU0sQ0FBQyxtQkFBRCxDQUFiO0FBQ0EsU0FBT0EsTUFBTSxDQUFDRSxJQUFkLENBSitDLENBSy9DOztBQUNBLE1BQUlELGFBQUosRUFBbUI7QUFDakIsV0FBT0QsTUFBTSxDQUFDRyxhQUFkO0FBQ0EsV0FBT0gsTUFBTSxDQUFDSSxNQUFkO0FBQ0Q7O0FBRUQsU0FBT0osTUFBUDtBQUNELENBWkQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy50eXBlID0gKHN0cmluZ18pID0+IHN0cmluZ18uc3BsaXQoLyAqOyAqLykuc2hpZnQoKTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5wYXJhbXMgPSAodmFsdWUpID0+IHtcbiAgY29uc3Qgb2JqZWN0ID0ge307XG4gIGZvciAoY29uc3Qgc3RyaW5nXyBvZiB2YWx1ZS5zcGxpdCgvICo7ICovKSkge1xuICAgIGNvbnN0IHBhcnRzID0gc3RyaW5nXy5zcGxpdCgvICo9ICovKTtcbiAgICBjb25zdCBrZXkgPSBwYXJ0cy5zaGlmdCgpO1xuICAgIGNvbnN0IHZhbHVlID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsdWUpIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqZWN0O1xufTtcblxuLyoqXG4gKiBQYXJzZSBMaW5rIGhlYWRlciBmaWVsZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5wYXJzZUxpbmtzID0gKHZhbHVlKSA9PiB7XG4gIGNvbnN0IG9iamVjdCA9IHt9O1xuICBmb3IgKGNvbnN0IHN0cmluZ18gb2YgdmFsdWUuc3BsaXQoLyAqLCAqLykpIHtcbiAgICBjb25zdCBwYXJ0cyA9IHN0cmluZ18uc3BsaXQoLyAqOyAqLyk7XG4gICAgY29uc3QgdXJsID0gcGFydHNbMF0uc2xpY2UoMSwgLTEpO1xuICAgIGNvbnN0IHJlbCA9IHBhcnRzWzFdLnNwbGl0KC8gKj0gKi8pWzFdLnNsaWNlKDEsIC0xKTtcbiAgICBvYmplY3RbcmVsXSA9IHVybDtcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59O1xuXG4vKipcbiAqIFN0cmlwIGNvbnRlbnQgcmVsYXRlZCBmaWVsZHMgZnJvbSBgaGVhZGVyYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gaGVhZGVyXG4gKiBAcmV0dXJuIHtPYmplY3R9IGhlYWRlclxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZXhwb3J0cy5jbGVhbkhlYWRlciA9IChoZWFkZXIsIGNoYW5nZXNPcmlnaW4pID0+IHtcbiAgZGVsZXRlIGhlYWRlclsnY29udGVudC10eXBlJ107XG4gIGRlbGV0ZSBoZWFkZXJbJ2NvbnRlbnQtbGVuZ3RoJ107XG4gIGRlbGV0ZSBoZWFkZXJbJ3RyYW5zZmVyLWVuY29kaW5nJ107XG4gIGRlbGV0ZSBoZWFkZXIuaG9zdDtcbiAgLy8gc2VjdWlydHlcbiAgaWYgKGNoYW5nZXNPcmlnaW4pIHtcbiAgICBkZWxldGUgaGVhZGVyLmF1dGhvcml6YXRpb247XG4gICAgZGVsZXRlIGhlYWRlci5jb29raWU7XG4gIH1cblxuICByZXR1cm4gaGVhZGVyO1xufTtcbiJdfQ==

/***/ }),

/***/ "./node_modules/superagent/node_modules/qs/lib/formats.js":
/*!****************************************************************!*\
  !*** ./node_modules/superagent/node_modules/qs/lib/formats.js ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";


var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = {
    'default': Format.RFC3986,
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return String(value);
        }
    },
    RFC1738: Format.RFC1738,
    RFC3986: Format.RFC3986
};


/***/ }),

/***/ "./node_modules/superagent/node_modules/qs/lib/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/superagent/node_modules/qs/lib/index.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var stringify = __webpack_require__(/*! ./stringify */ "./node_modules/superagent/node_modules/qs/lib/stringify.js");
var parse = __webpack_require__(/*! ./parse */ "./node_modules/superagent/node_modules/qs/lib/parse.js");
var formats = __webpack_require__(/*! ./formats */ "./node_modules/superagent/node_modules/qs/lib/formats.js");

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};


/***/ }),

/***/ "./node_modules/superagent/node_modules/qs/lib/parse.js":
/*!**************************************************************!*\
  !*** ./node_modules/superagent/node_modules/qs/lib/parse.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/superagent/node_modules/qs/lib/utils.js");

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictNullHandling: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
    var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
    var parts = cleanStr.split(options.delimiter, limit);
    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
            if (parts[i].indexOf('utf8=') === 0) {
                if (parts[i] === charsetSentinel) {
                    charset = 'utf-8';
                } else if (parts[i] === isoSentinel) {
                    charset = 'iso-8859-1';
                }
                skipIndex = i;
                i = parts.length; // The eslint settings do not allow break;
            }
        }
    }

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part, defaults.decoder, charset, 'key');
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
            val = utils.maybeMap(
                parseArrayValue(part.slice(pos + 1), options),
                function (encodedVal) {
                    return options.decoder(encodedVal, defaults.decoder, charset, 'value');
                }
            );
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(val);
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (has.call(obj, key)) {
            obj[key] = utils.combine(obj[key], val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var leaf = valuesParsed ? val : parseArrayValue(val, options);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            obj = [].concat(leaf);
        } else {
            obj = options.plainObjects ? Object.create(null) : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var index = parseInt(cleanRoot, 10);
            if (!options.parseArrays && cleanRoot === '') {
                obj = { 0: leaf };
            } else if (
                !isNaN(index)
                && root !== cleanRoot
                && String(index) === cleanRoot
                && index >= 0
                && (options.parseArrays && index <= options.arrayLimit)
            ) {
                obj = [];
                obj[index] = leaf;
            } else {
                obj[cleanRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = options.depth > 0 && brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }
    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
        obj = utils.merge(obj, newObj, options);
    }

    if (options.allowSparse === true) {
        return obj;
    }

    return utils.compact(obj);
};


/***/ }),

/***/ "./node_modules/superagent/node_modules/qs/lib/stringify.js":
/*!******************************************************************!*\
  !*** ./node_modules/superagent/node_modules/qs/lib/stringify.js ***!
  \******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var getSideChannel = __webpack_require__(/*! side-channel */ "./node_modules/side-channel/index.js");
var utils = __webpack_require__(/*! ./utils */ "./node_modules/superagent/node_modules/qs/lib/utils.js");
var formats = __webpack_require__(/*! ./formats */ "./node_modules/superagent/node_modules/qs/lib/formats.js");
var has = Object.prototype.hasOwnProperty;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    comma: 'comma',
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var isArray = Array.isArray;
var split = String.prototype.split;
var push = Array.prototype.push;
var pushToArray = function (arr, valueOrArray) {
    push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;

var defaultFormat = formats['default'];
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: defaultFormat,
    formatter: formats.formatters[defaultFormat],
    // deprecated
    indices: false,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
    return typeof v === 'string'
        || typeof v === 'number'
        || typeof v === 'boolean'
        || typeof v === 'symbol'
        || typeof v === 'bigint';
};

var sentinel = {};

var stringify = function stringify(
    object,
    prefix,
    generateArrayPrefix,
    strictNullHandling,
    skipNulls,
    encoder,
    filter,
    sort,
    allowDots,
    serializeDate,
    format,
    formatter,
    encodeValuesOnly,
    charset,
    sideChannel
) {
    var obj = object;

    var tmpSc = sideChannel;
    var step = 0;
    var findFlag = false;
    while ((tmpSc = tmpSc.get(sentinel)) !== undefined && !findFlag) {
        // Where object last appeared in the ref tree
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== 'undefined') {
            if (pos === step) {
                throw new RangeError('Cyclic object value');
            } else {
                findFlag = true; // Break while
            }
        }
        if (typeof tmpSc.get(sentinel) === 'undefined') {
            step = 0;
        }
    }

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value) {
            if (value instanceof Date) {
                return serializeDate(value);
            }
            return value;
        });
    }

    if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
        }

        obj = '';
    }

    if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
            if (generateArrayPrefix === 'comma' && encodeValuesOnly) {
                var valuesArray = split.call(String(obj), ',');
                var valuesJoined = '';
                for (var i = 0; i < valuesArray.length; ++i) {
                    valuesJoined += (i === 0 ? '' : ',') + formatter(encoder(valuesArray[i], defaults.encoder, charset, 'value', format));
                }
                return [formatter(keyValue) + '=' + valuesJoined];
            }
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (generateArrayPrefix === 'comma' && isArray(obj)) {
        // we need to join elements in
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : undefined }];
    } else if (isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === 'object' && key.value !== undefined ? key.value : obj[key];

        if (skipNulls && value === null) {
            continue;
        }

        var keyPrefix = isArray(obj)
            ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix
            : prefix + (allowDots ? '.' + key : '[' + key + ']');

        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify(
            value,
            keyPrefix,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel
        ));
    }

    return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var charset = opts.charset || defaults.charset;
    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    var format = formats['default'];
    if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        format = opts.format;
    }
    var formatter = formats.formatters[format];

    var filter = defaults.filter;
    if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter;
    }

    return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter: filter,
        format: format,
        formatter: formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
    };
};

module.exports = function (object, opts) {
    var obj = object;
    var options = normalizeStringifyOptions(opts);

    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
    } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (options.sort) {
        objKeys.sort(options.sort);
    }

    var sideChannel = getSideChannel();
    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (options.skipNulls && obj[key] === null) {
            continue;
        }
        pushToArray(keys, stringify(
            obj[key],
            key,
            generateArrayPrefix,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel
        ));
    }

    var joined = keys.join(options.delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};


/***/ }),

/***/ "./node_modules/superagent/node_modules/qs/lib/utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/superagent/node_modules/qs/lib/utils.js ***!
  \**************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var formats = __webpack_require__(/*! ./formats */ "./node_modules/superagent/node_modules/qs/lib/formats.js");

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

var compactQueue = function compactQueue(queue) {
    while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];

        if (isArray(obj)) {
            var compacted = [];

            for (var j = 0; j < obj.length; ++j) {
                if (typeof obj[j] !== 'undefined') {
                    compacted.push(obj[j]);
                }
            }

            item.obj[item.prop] = compacted;
        }
    }
};

var arrayToObject = function arrayToObject(source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

var merge = function merge(target, source, options) {
    /* eslint no-param-reassign: 0 */
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (isArray(target)) {
            target.push(source);
        } else if (target && typeof target === 'object') {
            if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
                target[source] = true;
            }
        } else {
            return [target, source];
        }

        return target;
    }

    if (!target || typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
    }

    if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                var targetItem = target[i];
                if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
                    target[i] = merge(targetItem, item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (has.call(acc, key)) {
            acc[key] = merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
    return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key];
        return acc;
    }, target);
};

var decode = function (str, decoder, charset) {
    var strWithoutPlus = str.replace(/\+/g, ' ');
    if (charset === 'iso-8859-1') {
        // unescape never throws, no try...catch needed:
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
    }
    // utf-8
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};

var encode = function encode(str, defaultEncoder, charset, kind, format) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = str;
    if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str);
    } else if (typeof str !== 'string') {
        string = String(str);
    }

    if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
            return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
        });
    }

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D // -
            || c === 0x2E // .
            || c === 0x5F // _
            || c === 0x7E // ~
            || (c >= 0x30 && c <= 0x39) // 0-9
            || (c >= 0x41 && c <= 0x5A) // a-z
            || (c >= 0x61 && c <= 0x7A) // A-Z
            || (format === formats.RFC1738 && (c === 0x28 || c === 0x29)) // ( )
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        /* eslint operator-linebreak: [2, "before"] */
        out += hexTable[0xF0 | (c >> 18)]
            + hexTable[0x80 | ((c >> 12) & 0x3F)]
            + hexTable[0x80 | ((c >> 6) & 0x3F)]
            + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

var compact = function compact(value) {
    var queue = [{ obj: { o: value }, prop: 'o' }];
    var refs = [];

    for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];

        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            var val = obj[key];
            if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                queue.push({ obj: obj, prop: key });
                refs.push(val);
            }
        }
    }

    compactQueue(queue);

    return value;
};

var isRegExp = function isRegExp(obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
    return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
    if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
            mapped.push(fn(val[i]));
        }
        return mapped;
    }
    return fn(val);
};

module.exports = {
    arrayToObject: arrayToObject,
    assign: assign,
    combine: combine,
    compact: compact,
    decode: decode,
    encode: encode,
    isBuffer: isBuffer,
    isRegExp: isRegExp,
    maybeMap: maybeMap,
    merge: merge
};


/***/ }),

/***/ "./node_modules/universal-url/browser.js":
/*!***********************************************!*\
  !*** ./node_modules/universal-url/browser.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const output = {};
let g, hasNative;



if (typeof window !== "undefined")
{
	g = window;
}
else if (typeof __webpack_require__.g !== "undefined")
{
	g = __webpack_require__.g;
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


/***/ }),

/***/ "./node_modules/universal-url/node_modules/tr46/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/tr46/index.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const punycode = __webpack_require__(/*! punycode */ "./node_modules/punycode/punycode.es6.js");
const regexes = __webpack_require__(/*! ./lib/regexes.js */ "./node_modules/universal-url/node_modules/tr46/lib/regexes.js");
const mappingTable = __webpack_require__(/*! ./lib/mappingTable.json */ "./node_modules/universal-url/node_modules/tr46/lib/mappingTable.json");

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

/***/ "./node_modules/universal-url/node_modules/tr46/lib/regexes.js":
/*!*********************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/tr46/lib/regexes.js ***!
  \*********************************************************************/
/***/ ((module) => {

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

/***/ "./node_modules/universal-url/node_modules/webidl-conversions/lib/index.js":
/*!*********************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/webidl-conversions/lib/index.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

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

exports["void"] = function () {
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

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/URL-impl.js":
/*!****************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/URL-impl.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const conversions = __webpack_require__(/*! webidl-conversions */ "./node_modules/universal-url/node_modules/webidl-conversions/lib/index.js");
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const conversions = __webpack_require__(/*! webidl-conversions */ "./node_modules/universal-url/node_modules/webidl-conversions/lib/index.js");
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
/***/ ((module) => {

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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.URL = __webpack_require__(/*! ./URL */ "./node_modules/universal-url/node_modules/whatwg-url/lib/URL.js")["interface"];
exports.URLSearchParams = __webpack_require__(/*! ./URLSearchParams */ "./node_modules/universal-url/node_modules/whatwg-url/lib/URLSearchParams.js")["interface"];

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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const punycode = __webpack_require__(/*! punycode */ "./node_modules/punycode/punycode.es6.js");
const tr46 = __webpack_require__(/*! tr46 */ "./node_modules/universal-url/node_modules/tr46/index.js");

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


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js":
/*!******************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/urlencoded.js ***!
  \******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

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


/***/ }),

/***/ "./node_modules/universal-url/node_modules/whatwg-url/lib/utils.js":
/*!*************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/whatwg-url/lib/utils.js ***!
  \*************************************************************************/
/***/ ((module, exports) => {

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

/***/ "./src/Auth/AuthController.js":
/*!************************************!*\
  !*** ./src/Auth/AuthController.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const utils = __webpack_require__(/*! ../utils */ "./src/utils.js");
const Service = __webpack_require__(/*! ../Service */ "./src/Service.js");
const AuthStates = __webpack_require__(/*! ./AuthStates */ "./src/Auth/AuthStates.js");
const Messages = __webpack_require__(/*! ./LoginMessages */ "./src/Auth/LoginMessages.js");

/**
 * @private
 */
class AuthController {

  /**
   * 
   * @param {*} settings 
   * @param {*} service 
   */
  constructor (settings, service, loginButton) {
    this.settings = settings;
    validateSettings.call(this, settings);

    this.stateChangeListeners = [];
    if (this.settings.onStateChange) {
      this.stateChangeListeners.push(this.settings.onStateChange);
    }
    this.service = service;

    // probably remove
    this.languageCode = this.settings.authRequest.languageCode || 'en';    
    this.messages = Messages(this.languageCode);

    this.loginButton = loginButton;

    function validateSettings (settings) {
      if (!settings) { throw new Error('settings cannot be null'); }
      // -- settings 
      if (!settings.authRequest) { throw new Error('Missing settings.authRequest'); }
  
      // -- Extract returnURL 
      settings.authRequest.returnURL =
        this.getReturnURL(settings.authRequest.returnURL);
  
      if (!settings.authRequest.requestingAppId) {
        throw new Error('Missing settings.authRequest.requestingAppId');
      }
      if (!settings.authRequest.requestedPermissions) {
        throw new Error('Missing settings.authRequest.requestedPermissions');
      }
    }
  }

  /**
   * async function to call right after instanciating object
   * 
   * @returns {PryvService}
   */
  async init () {
    this.serviceInfo = this.service.infoSync();
    this.state = { status: AuthStates.LOADING };
    this.assets = await loadAssets(this);
    
    const loginButton = this.loginButton;
    // initialize human interaction interface
    if (loginButton != null) {
      this.stateChangeListeners.push(loginButton.onStateChange.bind(loginButton));
      // autologin needs cookies/storage implemented in human interaction interface
      await checkAutoLogin(this);
    }

    // if auto login is not prompted
    if (this.state.status != AuthStates.AUTHORIZED) {
      this.state = { status: AuthStates.INITIALIZED, serviceInfo: this.serviceInfo};
    }

    if (loginButton != null && loginButton.finishAuthProcessAfterRedirection != null) {
      await loginButton.finishAuthProcessAfterRedirection(this);
    }
    
    return this.service;
  }

  /**
   * Stops poll for auth request
   */
  stopAuthRequest (msg) {
    this.state = { status: AuthStates.ERROR, message: msg };
  }

  /**
   * Triggered when button is pressed
   */
  async handleClick () {
    if (isAuthorized.call(this)) {
      this.state = { status: AuthStates.SIGNOUT };
    } else if (isInitialized.call(this)) {
      this.startAuthRequest();
    } else if (isNeedSignIn.call(this)) {
      // reopen popup
      this.state = this.state;
    } else {
      console.log('Unhandled action in "handleClick()" for status:', this.state.status);
    }

    function isAuthorized () {
      return this.state.status == AuthStates.AUTHORIZED;
    }
    function isInitialized () {
      return this.state.status === AuthStates.INITIALIZED;
    }
    function isNeedSignIn () {
      return this.state.status === AuthStates.NEED_SIGNIN;
    }
  }

  /**
   * Used only to retrieve returnUrl in browser environments
   * 
   * @param {*} returnURL 
   * @param {*} windowLocationForTest 
   * @param {*} navigatorForTests 
   */
  getReturnURL (
    returnURL,
    windowLocationForTest,
    navigatorForTests
  ) {
    const RETURN_URL_AUTO = 'auto';

    returnURL = returnURL || RETURN_URL_AUTO + '#';

    // check the trailer
    let trailer = returnURL.slice(-1);
    if ('#&?'.indexOf(trailer) < 0) {
      throw new Error('Pryv access: Last character of --returnURL setting-- is not ' +
        '"?", "&" or "#": ' + returnURL);
    }
    // auto mode for desktop
    if (
      returnUrlIsAuto(returnURL) &&
      !utils.browserIsMobileOrTablet(navigatorForTests)
    ) {
      return false;
    } else if (
      // auto mode for mobile or self
      (returnUrlIsAuto(returnURL) &&
        utils.browserIsMobileOrTablet(navigatorForTests)
      )
      || returnURL.indexOf('self') === 0
    ) {
      // set self as return url?
      // eventually clean-up current url from previous pryv returnURL
      const locationHref = windowLocationForTest || window.location.href;
      returnURL = locationHref + returnURL.substring(4);
    }
    return utils.cleanURLFromPrYvParams(returnURL);

    function returnUrlIsAuto (returnURL) {
      return returnURL.indexOf(RETURN_URL_AUTO) === 0;
    }
  }

  async startAuthRequest () {
    this.state = await postAccess.call(this);
    
    await doPolling.call(this);
    
    async function postAccess () {
      try {
        const res = await utils.superagent
          .post(this.serviceInfo.access)
          .send(this.settings.authRequest);
        return res.body;
      } catch (e) {
        this.state = {
          status: AuthStates.ERROR,
          message: 'Requesting access',
          error: e
        };
        throw e; // forward error
      }
    }

    async function doPolling() {
      if (this.state.status !== AuthStates.NEED_SIGNIN) {
        return;
      }
      const pollResponse = await pollAccess(this.state.poll);
      
      if (pollResponse.status === AuthStates.NEED_SIGNIN) {
        setTimeout(await doPolling.bind(this), this.state.poll_rate_ms);
      } else {
        this.state = pollResponse;
      }

      async function pollAccess(pollUrl) {
        try {
          const res = await utils.superagent
            .get(pollUrl)
          return res.body;
        } catch (e) {
          if (e.response &&
              e.response.status === 403 &&
              e.response.body &&
              e.response.body.status === 'REFUSED') {
            return { status: AuthStates.INITIALIZED };
          } else {
            return { status: AuthStates.ERROR, message: 'Error while polling for auth request', error: e };
          }
        }
      }
    }

    
  }

  // -------------- state listeners ---------------------
  set state (newState) {

    // retro-compatibility for lib-js < 2.0.9
    newState.id = newState.status;

    this._state = newState;

    this.stateChangeListeners.map((listener) => {
      try {
        listener(this.state)
      } catch (e) {
        console.log('Error during set state ()', e);
      }
    });
  }

  get state () {
    return this._state;
  }
}

// ----------- private methods -------------

async function checkAutoLogin (authController) {
  const loginButton = authController.loginButton;
  if (loginButton == null) {
    return;
  }

  const storedCredentials = await loginButton.getAuthorizationData();
  if (storedCredentials != null) {
    authController.state = Object.assign({}, {status: AuthStates.AUTHORIZED}, storedCredentials);
  }
}

// ------------------ ACTIONS  ----------- //

async function loadAssets(authController) {
  let loadedAssets = {};
  try {
    loadedAssets = await authController.service.assets();
    if (typeof location !== 'undefined') {
      await loadedAssets.loginButtonLoadCSS();
      const thisMessages = await loadedAssets.loginButtonGetMessages();
      if (thisMessages.LOADING) {
        authController.messages = Messages(authController.languageCode, thisMessages);
      } else {
        console.log("WARNING Messages cannot be loaded using defaults: ", thisMessages)
      }
    }
  } catch (e) {
    authController.state = {
      status: AuthStates.ERROR,
      message: 'Cannot fetch button visuals',
      error: e
    };
    throw e; // forward error
  }
  return loadedAssets;
}

module.exports = AuthController;


/***/ }),

/***/ "./src/Auth/AuthStates.js":
/*!********************************!*\
  !*** ./src/Auth/AuthStates.js ***!
  \********************************/
/***/ ((module) => {



/**
 * Enum Possible states: ERROR, LOADING, INITIALIZED, AUTHORIZED, SIGNOUT
 * @readonly
 * @enum {string}
 * @memberof Pryv.Browser
 */
const AuthState = {
  ERROR : 'ERROR',
  LOADING : 'LOADING',
  INITIALIZED: 'INITIALIZED',
  NEED_SIGNIN: 'NEED_SIGNIN',
  AUTHORIZED: 'ACCEPTED',
  SIGNOUT: 'SIGNOUT',
  REFUSED: 'REFUSED',
} 


module.exports = AuthState 


/***/ }),

/***/ "./src/Auth/LoginMessages.js":
/*!***********************************!*\
  !*** ./src/Auth/LoginMessages.js ***!
  \***********************************/
/***/ ((module) => {

const Messages = {
  LOADING: {
    'en': '...'
  },
  ERROR: {
    'en': 'Error',
    'fr': 'Erreur',
  },
  LOGIN: {
    'en': 'Signin',
    'fr': 'Login'
  },
  SIGNOUT_CONFIRM: {
    'en': 'Logout ?',
    'fr': 'Se deconnecter ?'
  }
}

function get(languageCode, definitions) {
  const myMessages = definitions || Messages;
  const res = {};
  Object.keys(myMessages).map((key) => {
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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const utils = __webpack_require__(/*! ./utils.js */ "./src/utils.js");

const jsonParser = __webpack_require__(/*! ./lib/json-parser */ "./src/lib/json-parser.js");

const browserGetEventStreamed = __webpack_require__(/*! ./lib/browser-getEventStreamed */ "./src/lib/browser-getEventStreamed.js");


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
 * @param {Pryv.Service} [service] - eventually initialize Connection with a Service
 */
class Connection {

  constructor(pryvApiEndpoint, service) {
    const { token, endpoint } = utils.extractTokenAndApiEndpoint(pryvApiEndpoint);
    this.token = token;
    this.endpoint = endpoint;
    this.options = {};
    this.options.chunkSize = 1000;
    this._deltaTime = { value: 0, weight: 0 };
    if (! service instanceof Service) { throw new Error('Invalid service param'); }
    this._service = service;
  }

  /**
   * get Pryv.Service object relative to this connection
   * @readonly
   * @property {Pryv.Service} service
   */
  get service() {
    if (this._service) return this._service;
    this._service = new Service(this.endpoint + 'service/info');
    return this._service;
  }

  /**
   * get username. 
   * It's async as in it constructed from access info
   * @param {*} arrayOfAPICalls 
   * @param {*} progress 
   */
  async username() {
    const accessInfo = await this.accessInfo();
    return accessInfo.user.username;
  }

  /**
   * get access info
   * It's async as it is constructed with get function.
   */
  async accessInfo(){
    return this.get("access-info", null);
  }

  /**
   * Issue a Batch call https://api.pryv.com/reference/#call-batch .
   * arrayOfAPICalls will be splited in multiple calls if the size is > `conn.options.chunkSize` .
   * Default chunksize is 1000.
   * @param {Array.<MethodCall>} arrayOfAPICalls Array of Method Calls
   * @param {Function} [progress] Return percentage of progress (0 - 100);
   * @returns {Promise<Array>} Promise to Array of results matching each method call in order
   */
  async api(arrayOfAPICalls, progress) {
    function httpHandler(batchCall) {
      return this.post('', batchCall);
    };
    return await this._chunkedBatchCall(arrayOfAPICalls, progress, httpHandler.bind(this));
  }

  /**
   * @private
   */
  async _chunkedBatchCall(arrayOfAPICalls, progress, callHandler) {
    if (! Array.isArray(arrayOfAPICalls)) {
      throw new Error('Pryv.api() takes an array as input');
    }

    const res = [];
    let percent = 0;
    for (let cursor = 0; arrayOfAPICalls.length >= cursor; cursor += this.options.chunkSize) {
      const thisBatch = [];
      const cursorMax = Math.min(cursor + this.options.chunkSize, arrayOfAPICalls.length);
      // copy only method and params into a back call to be exuted
      for (let i = cursor; i < cursorMax ; i++) {      
        thisBatch.push({ method: arrayOfAPICalls[i].method, params: arrayOfAPICalls[i].params});
      }
      const resRequest = await callHandler(thisBatch);
      
      // result checks
      if (! resRequest || ! Array.isArray(resRequest.results)) {
        throw new Error('API call result is not an Array: ' + JSON.stringify(resRequest));
      }
      if (resRequest.results.length != thisBatch.length) {
        throw new Error('API call result Array does not match request: ' + JSON.stringify(resRequest));
      }


      // eventually call handleResult 
      for (let i = 0; i < resRequest.results.length; i++) {
        if (arrayOfAPICalls[i + cursor].handleResult) {
          await arrayOfAPICalls[i + cursor].handleResult.call(null, resRequest.results[i]);
        }
      }
      Array.prototype.push.apply(res, resRequest.results)
      percent =  Math.round(100 * res.length / arrayOfAPICalls.length);
      if (progress) { progress(percent, res); }
    }
    return res;
  }

  /**
   * Post to API return results  
   * @param {(Array | Object)} data 
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {Promise<Array|Object>}  Promise to result.body
   */
  async post(path, data, queryParams) {
    const now = Date.now() / 1000;
    const res = await this.postRaw(path, data, queryParams);
    this._handleMeta(res.body, now);
    return res.body;
  }

  /**
   * Raw Post to API return superagent object  
   * @param {Array | Object} data 
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {request.superagent}  Promise from superagent's post request
   */
  async postRaw(path, data, queryParams) {
    return this._post(path)
      .query(queryParams)
      .send(data);
  }

   _post(path) {
    return utils.superagent.post(this.endpoint + path)
      .set('Authorization', this.token)
      .set('accept', 'json');
  }

  /**
   * Post to API return results  
   * @param {Object} queryParams
   * @param {string} path 
   * @returns {Promise<Array|Object>}  Promise to result.body
   */
  async get(path, queryParams) {
    const now = Date.now() / 1000;
    const res = await this.getRaw(path, queryParams);
    this._handleMeta(res.body, now);
    return res.body
  }

  /**
   * Raw Get to API return superagent object
   * @param {Object} queryParams 
   * @param {string} path 
   * @returns {request.superagent}  Promise from superagent's get request
   */
  getRaw(path, queryParams) {
    path = path || '';
    return utils.superagent.get(this.endpoint + path)
      .set('Authorization', this.token)
      .set('accept', 'json')
      .query(queryParams);
  }

  /**
   * ADD Data Points to HFEvent (flatJSON format)
   * https://api.pryv.com/reference/#add-hf-series-data-points
   */
  async addPointsToHFEvent(eventId, fields, points) {
    const res = await this.post('events/' + eventId + '/series',
      {
        format: 'flatJSON',
        fields: fields,
        points: points
      });
    if (!res.status === 'ok') {
      throw new Error('Failed loading serie: ' + JSON.stringify(res.status));
    }
    return res;
  }

  /**
   * Streamed get Event. 
   * Fallbacks to not streamed, for browsers that does not support `fetch()` API 
   * @see https://api.pryv.com/reference/#get-events
   * @param {Object} queryParams See `events.get` parameters
   * @param {Function} forEachEvent Function taking one event as parameter. Will be called for each event 
   * @returns {Promise<Object>} Promise to result.body transformed with `eventsCount: {count}` replacing `events: [...]`
   */
  async getEventsStreamed(queryParams, forEachEvent) {
    const myParser = jsonParser(forEachEvent, queryParams.includeDeletions);
    let res = null;
    if (typeof window === 'undefined') { // node
      res = await this.getRaw('events', queryParams)
        .buffer(false)
        .parse(myParser);

    } else if (typeof fetch !== 'undefined' && !(typeof navigator != 'undefined' && navigator.product == 'ReactNative')) { // browser supports fetch and it is not react native
      res = await browserGetEventStreamed(this, queryParams, myParser);

    } else { // browser no fetch supports
      console.log('WARNING: Browser does not support fetch() required by Pryv.Connection.getEventsStreamed()');
      res = await this.getRaw('events', queryParams);
      res.body.eventsCount = 0;
      if (res.body.events) {
        res.body.events.forEach(forEachEvent);
        res.body.eventsCount += res.body.events.length;
        delete res.body.events;
      }
      if (res.body.eventDeletions) { // deletions are in a seprated Array 
        res.body.eventDeletions.forEach(forEachEvent);
        res.body.eventsCount += res.body.eventDeletions.length;
        delete res.body.eventDeletions;
      }
    }

    const now = Date.now() / 1000;
    this._handleMeta(res.body, now);
    return res.body
  }

  /**
   * Create an event with attached file
   * NODE.jS ONLY
   * @param {Event} event
   * @param {string} filePath
   */
  async createEventWithFile(event, filePath) {
    const res = await this._post('events')
      .field('event', JSON.stringify(event))
      .attach('file', filePath);

    const now = Date.now() / 1000;
    this._handleMeta(res.body, now);
    return res.body
  }

  /**
   * Create an event from a Buffer
   * NODE.jS ONLY
   * @param {Event} event
   * @param {Buffer} bufferData
   * @param {string} fileName
   */
   async createEventWithFileFromBuffer(event, bufferData, filename) {
    const res = await this._post('events')
      .field('event', JSON.stringify(event))
      .attach('file', bufferData, filename);

    const now = Date.now() / 1000;
    this._handleMeta(res.body, now);
    return res.body
  }

  /**
 * Create an event with attached formData
 * !! BROWSER ONLY
 * @param {Event} event
 * @param {FormData} formData https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData
 */
  async createEventWithFormData(event, formData) {
    formData.append('event', JSON.stringify(event));
    const res = await this._post('events').send(formData);
    return res.body
  }

  /**
   * Difference in second between the API and locatime
   * deltaTime is refined at each (non Raw) API call
   * @readonly
   * @property {number} deltaTime
   */
  get deltaTime() {
    return this._deltaTime.value;
  }

  /**
   * Pryv API Endpoint of this connection
   * @readonly
   * @property {PryvApiEndpoint} deltaTime
   */
  get apiEndpoint() {
    return utils.buildPryvApiEndpoint(this);
  }

  // private method that handle meta data parsing
    _handleMeta(res, requestLocalTimestamp) {
    if (!res.meta) throw new Error('Cannot find .meta in response.');
    if (!res.meta.serverTime) throw new Error('Cannot find .meta.serverTime in response.');

    // update deltaTime and weight it 
    this._deltaTime.value = (this._deltaTime.value * this._deltaTime.weight + res.meta.serverTime - requestLocalTimestamp) / ++this._deltaTime.weight;
  }

}


module.exports = Connection;

// service is require "after" to allow circular require
const Service = __webpack_require__(/*! ./Service */ "./src/Service.js");

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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const utils = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
// Connection is required at the end of this file to allow circular requires.
const Assets = __webpack_require__(/*! ./ServiceAssets.js */ "./src/ServiceAssets.js");


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
class Service {

  constructor (serviceInfoUrl, serviceCustomizations) {
    this._pryvServiceInfo = null;
    this._assets = null;
    this._polling = false;
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
  async info (forceFetch) {
    if (forceFetch || !this._pryvServiceInfo) {
      let baseServiceInfo = {};
      if (this._pryvServiceInfoUrl) {
        const res = await utils.superagent.get(this._pryvServiceInfoUrl).set('Access-Control-Allow-Origin', '*').set('accept', 'json');
        baseServiceInfo = res.body;
      }
      Object.assign(baseServiceInfo, this._pryvServiceCustomizations);
      this.setServiceInfo(baseServiceInfo);
    }
    return this._pryvServiceInfo;
  }

  /**
   * @private
   * @param {PryvServiceInfo} serviceInfo
   */
  setServiceInfo (serviceInfo) {
    if (!serviceInfo.name) {
      throw new Error('Invalid data from service/info');
    }
    // cleanup serviceInfo for eventual url not finishing by "/" 
    // code will be obsolete with next version of register
    ['access', 'api', 'register'].forEach((key) => {
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
  async assets (forceFetch) {
    if (!forceFetch && this._assets) {
      return this._assets;
    } else {
      const serviceInfo = await this.info();
      if (!serviceInfo.assets || !serviceInfo.assets.definitions) {
        console.log('Warning: no assets for this service');
        return null;
      }
      this._assets = await Assets.setup(serviceInfo.assets.definitions);
      return this._assets;
    }
  }

  /**
   * Return service info parameters info known or null if not yet loaded
   * @returns {PryvServiceInfo} Service Info definition
   */
  infoSync () {
    return this._pryvServiceInfo;
  }

  /**
   * Return an API Endpoint from a username and token
   * @param {string} username
   * @param {string} [token]
   * @return {PryvApiEndpoint}
   */
  async apiEndpointFor (username, token) {
    const serviceInfo = await this.info();
    return Service.buildAPIEndpoint(serviceInfo, username, token);
  }

  /**
   * Return an API Endpoint from a username and token and a PryvServiceInfo. 
   * This is method is rarely used. See **apiEndpointFor** as an alternative.
   * @param {PryvServiceInfo} serviceInfo
   * @param {string} username
   * @param {string} [token]
   * @return {PryvApiEndpoint}
   */
  static buildAPIEndpoint (serviceInfo, username, token) {
    const endpoint = serviceInfo.api.replace('{username}', username);
    return utils.buildPryvApiEndpoint({ endpoint: endpoint, token: token });
  }

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
  async login (username, password, appId, originHeader) {
    const apiEndpoint = await this.apiEndpointFor(username);

    try {
      const headers = { accept: 'json' };
      originHeader = originHeader || (await this.info()).register;
      if (!utils.isBrowser()) {
        headers.Origin = originHeader;
      }
      const res = await utils.superagent.post(apiEndpoint + 'auth/login')
        .set(headers)
        .send({ username: username, password: password, appId: appId });

      if (!res.body.token) {
        throw new Error('Invalid login response: ' + res.body);
      }
      return new Connection(
        Service.buildAPIEndpoint(await this.info(), username, res.body.token),
        this // Pre load Connection with service
      );
    } catch (e) {
      if (e.response && e.response.body
        && e.response.body.error
        && e.response.body.error.message) {
        throw new Error(e.response.body.error.message)
      }
    }
  }
}

module.exports = Service;

// Require is done after exports to allow circular references
const Connection = __webpack_require__(/*! ./Connection */ "./src/Connection.js");

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
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const utils = __webpack_require__(/*! ./utils.js */ "./src/utils.js");
/**
 * Holds Pryv Service informations.
 * 
 * It's returned by `service.assets()`
 *
 * @memberof Pryv
 **/
class ServiceAssets {
  /**
   * Private => use ServiceAssets.setup()
   * @param { object} assets The content of service/info.assets properties.
   * @param { string } pryvServiceAssetsSourceUrl Url point to assets of the service of a Pryv platform: https://api.pryv.com/reference/#service-info property `assets.src`
   */
  constructor(assets, assetsURL) {
    this._assets = assets;
    this._assetsURL = assetsURL;
  }

  /**
   * Load Assets definition
   * @param {string} pryvServiceAssetsSourceUrl
   * @returns {ServiceAssets}
   */
  static async setup(pryvServiceAssetsSourceUrl) {
    const res = await utils.superagent.get(pryvServiceAssetsSourceUrl).set('accept', 'json');
    return new ServiceAssets(res.body, pryvServiceAssetsSourceUrl);
  }

  /**
   * get a value from path separated by `:`
   * exemple of key `lib-js:buttonSignIn`
   * @param {string} [keyPath] if null, will return the all assets  
   */
  get(keyPath) {
    let result = Object.assign({}, this._assets);
    if (keyPath) {
      keyPath.split(':').forEach((key) => {
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
  getUrl(keyPath) {
    const url = this.get(keyPath);
    if (typeof url !== 'string') {
      throw new Error(url + ' returned ' + value); 
    }
    return this.relativeURL(url);
  }

  /**
   * get relativeUrl
   */
  relativeURL(url) {
    return relPathToAbs(this._assets.baseUrl || this._assetsURL, url);
  }

  //----------------   Default service ressources
  
  /**
   * Set all defaults Favicon, CSS
   */
  async setAllDefaults() {
    this.setFavicon();
    await this.loadCSS();
  }

  /**
   * Set service Favicon to Web Page
   */
  setFavicon() {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = this.relativeURL(this._assets.favicon.default.url);
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  /**
   * Set default service CSS
   */
  async loadCSS() {
    loadCSS(this.relativeURL(this._assets.css.default.url));
  }

  // ---- Login

  /**
  * Load CSS for Login button
  */
  async loginButtonLoadCSS () {
    loadCSS(this.relativeURL(this._assets['lib-js'].buttonSignIn.css));
  }

  /**
  * Get HTML for Login Button
  */
  async loginButtonGetHTML() {
    const res = await utils.superagent.get(this.relativeURL(this._assets['lib-js'].buttonSignIn.html)).set('accept', 'html');
    return res.text;
  }

 /**
 * Get Messages strings for Login Button
 */
  async loginButtonGetMessages() {
    const res = await utils.superagent.get(this.relativeURL(this._assets['lib-js'].buttonSignIn.messages)).set('accept', 'json');
    return res.body;
  }

}

function loadCSS(url) {
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

function relPathToAbs (baseUrlString, sRelPath) {
  var baseLocation = location;
  if (baseUrlString) {
    baseLocation = document.createElement('a');
    baseLocation.href = baseUrlString;
  }

  var nUpLn, sDir = "", sPath = baseLocation.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
  for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
    nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
    sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"),
      "/");
  }
  let portStr = baseLocation.port ? ':' + baseLocation.port : '';
  return baseLocation.protocol + '//' + baseLocation.hostname + portStr + sDir + sPath.substr(nStart);
}


module.exports = ServiceAssets;

/***/ }),

/***/ "./src/lib/browser-getEventStreamed.js":
/*!*********************************************!*\
  !*** ./src/lib/browser-getEventStreamed.js ***!
  \*********************************************/
/***/ ((module) => {


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
  let fetchParams = {method: 'GET', headers: {Accept: 'application/json'}};
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

/***/ }),

/***/ "./src/lib/json-parser.js":
/*!********************************!*\
  !*** ./src/lib/json-parser.js ***!
  \********************************/
/***/ ((module) => {

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

  //IN EVENTS VARS
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
  }

  let state = states.A_BEFORE_EVENTS;

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
      if (eventOrEventDeletions === 0) { // do only once
        body = buffer.substring(0, n);
      }
      buffer = buffer.substr(n + EVENTMARKERS[eventOrEventDeletions].length);
      state = states.B_IN_EVENTS;
      processEvents();
    }
  }


  function processEvents() {
    /// ---- in Event
    while (cursorPos < buffer.length && (state === states.B_IN_EVENTS)) {
      if (skipNextOne) { // ignore next character
        skipNextOne = false;
        cursorPos++;
        continue;
      }
      switch (buffer.charCodeAt(cursorPos)) {
        case 93:  // ]
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
                eventsOrDeletionMsg = '"eventDeletionsCount":' + eventDeletionsCount + ','
              }
              buffer = eventsOrDeletionMsg + '"eventsCount":' + eventsCount + '' + buffer.substr(1);
            }
          }
          break;
        case 92:  // \
          skipNextOne = true;
          break;
        case 123:  // {
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
            buffer = buffer.substr(cursorPos + 1 );
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
  function addEvent(strEvent) {
    foreachEvent(JSON.parse(strEvent));
  }

};

/***/ }),

/***/ "./src/utils.js":
/*!**********************!*\
  !*** ./src/utils.js ***!
  \**********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const regexAPIandToken = /(.+):\/\/(.+)@(.+)/gm;
const regexSchemaAndPath = /(.+):\/\/(.+)/gm;

/**
 * Utilities to access Pryv API.
 * Exposes superagent and methods to manipulate Pryv's api endpoints 
 * @memberof Pryv
 * @namespace Pryv.utils
 */
const utils = {

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
  isBrowser: function() {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
  },


  /**
   * From a PryvApiEndpoint URL, return an object (TokenAndAPI) with two properties
   * @memberof Pryv.utils
   * @param {PryvApiEndpoint} pryvApiEndpoint
   * @returns {TokenAndEndpoint}
   */
  extractTokenAndApiEndpoint: function (pryvApiEndpoint) {
    regexAPIandToken.lastIndex = 0;
    const res = regexAPIandToken.exec(pryvApiEndpoint);

    if (res !== null) { // has token
      // add a trailing '/' to end point if missing
      if (!res[3].endsWith('/')) {
        res[3] += '/';
      }
      return { endpoint: res[1] + '://' + res[3], token: res[2] }
    }
    // else check if valid url
    regexSchemaAndPath.lastIndex = 0;
    const res2 = regexSchemaAndPath.exec(pryvApiEndpoint);
    if (res2 === null) {
      throw new Error('Cannot find endpoint, invalid URL format');
    }
    // add a trailing '/' to end point if missing
    if (!res2[2].endsWith('/')) {
      res2[2] += '/';
    }

    return { endpoint: res2[1] + '://' + res2[2] , token: null }
  },

  /**
   * Get a PryvApiEndpoint URL from a TokenAndAPI object
   * @memberof Pryv.utils
   * @param {TokenAndEndpoint} tokenAndApi
   * @returns {PryvApiEndpoint}
   */
  buildPryvApiEndpoint: function (tokenAndApi) {
    if (! tokenAndApi.token) { 
      let res = tokenAndApi.endpoint + '';
      if (!tokenAndApi.endpoint.endsWith('/')) {
        res += '/';
      }
      return res; 
    }
    regexSchemaAndPath.lastIndex = 0;
    let res = regexSchemaAndPath.exec(tokenAndApi.endpoint);
    // add a trailing '/' to end point if missing
    if (!res[2].endsWith('/')) {
      res[2] += '/';
    }
    return res[1] + '://' + tokenAndApi.token + '@' + res[2];
  },

  /**
   * 
   * @param {Object} [navigatorForTests] mock navigator var only for testing purposes 
   */
  browserIsMobileOrTablet: function (navigator) {
    if (navigator == null) {
      return false;
    }
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || navigator.opera);
    return check;
  },

  cleanURLFromPrYvParams: function (url) {
    const PRYV_REGEXP = /[?#&]+prYv([^=&]+)=([^&]*)/g;
    return url.replace(PRYV_REGEXP, '');
  },

  getQueryParamsFromURL: function (url) {
    let vars = {};
    const QUERY_REGEXP = /[?#&]+([^=&]+)=([^&]*)/g;
    url.replace(QUERY_REGEXP,
      function (m, key, value) {
        vars[key] = decodeURIComponent(value);
      });
    return vars;
  }  
}

module.exports = utils;

// --------------- typedfs ------------------------------- //

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
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const expect = chai.expect;

const utils = __webpack_require__(/*! ../src/utils.js */ "./src/utils.js");
const Service = __webpack_require__(/*! ../src/Service */ "./src/Service.js");
const AuthController = __webpack_require__(/*! ../src/Auth/AuthController.js */ "./src/Auth/AuthController.js");
const testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

describe('Browser.LoginButton', function() {
  this.timeout(5000); 

  let auth;
  let removeZombie = false;
  before(async function() {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./?pryvServiceInfoUrl=https://zouzou.com/service/info');
    __webpack_require__.g.document = browser.document;
    __webpack_require__.g.window = browser.window;
    __webpack_require__.g.location = browser.location;
    __webpack_require__.g.navigator = { userAgent: 'Safari' };
  });

  after(async function() {
    if (!removeZombie) return; // in browser
    delete __webpack_require__.g.document;
    delete __webpack_require__.g.window;
    delete __webpack_require__.g.location;
  });
  before(async function() {
    let service = new Service(testData.serviceInfoUrl);
    await service.info();
    auth = new AuthController({
      authRequest: {
        requestingAppId: 'lib-js-test',
        requestedPermissions: []
      }
    }, service);
    await auth.init();
  });
  
  it('getReturnURL()', async function() {
    const myUrl = 'https://mysite.com/bobby';
    let error = null;
    try {
      auth.getReturnURL('auto');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.not.null;

    let fakeNavigator = { userAgent: 'android' };
    expect(auth.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(auth.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
    expect(auth.getReturnURL(false, myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(auth.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(auth.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');

    fakeNavigator =  { userAgent: 'Safari' };
    expect(auth.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(false);
    expect(auth.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(false);
    expect(auth.getReturnURL(false, myUrl, fakeNavigator)).to.equal(false);
    expect(auth.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
    expect(auth.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');
    __webpack_require__.g.window = { location: { href: myUrl + '?prYvstatus=zouzou'} }
    expect(auth.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
  });

  it('browserIsMobileOrTablet()', async function() {
    expect(utils.browserIsMobileOrTablet({ userAgent: 'android' })).to.be.true;
    expect(utils.browserIsMobileOrTablet({ userAgent: 'Safari' })).to.be.false;
  });


  it('cleanURLFromPrYvParams()', async function() {

    expect('https://my.Url.com/?bobby=2').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/?pryvServiceInfoUrl=zzz').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?pryvServiceInfoUrl=zzz#prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/?prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/#prYvstatus=2jsadh'));

    expect('https://my.Url.com/#bobby=2').to.equal(utils.cleanURLFromPrYvParams(
      'https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
    
  });

});




/***/ }),

/***/ "./test/Browser.test.js":
/*!******************************!*\
  !*** ./test/Browser.test.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


const should = chai.should();
const expect = chai.expect;

const testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

function genSettings() {
  function defaultStateChange(state) { 
    console.log('Test unimplemented on state change', state); 
  }
  return {
    authRequest: {
      requestingAppId: 'lib-js-test',
      requestedPermissions: [{ streamId: '*', level: 'read' }],
    },
    onStateChange: defaultStateChange
  };
}

describe('Browser', function () {
  this.timeout(5000); 

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  let removeZombie = false;

  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./?pryvServiceInfoUrl=https://zouzou.com/service/info');
    __webpack_require__.g.document = browser.document;
    __webpack_require__.g.window = browser.window;
    __webpack_require__.g.location = browser.location;
    __webpack_require__.g.navigator = {userAgent: 'Safari'};
  });

  after(async () => {
    if (!removeZombie) return; // in browser
    delete __webpack_require__.g.document;
    delete __webpack_require__.g.window;
    delete __webpack_require__.g.location;
  });

  it('setupAuth()', async () => {
    const settings = genSettings();
    let AuthLoaded = false;
    settings.onStateChange = function (state) {
      should.exist(state.id);
      if (state.id == Pryv.Auth.AuthStates.LOADING) {
        AuthLoaded = true;
      }
      if (state.id == Pryv.Auth.AuthStates.INITIALIZED) {
        expect(AuthLoaded).to.true;
      }
    }

    try {
      const service = await Pryv.Auth.setupAuth(settings, testData.serviceInfoUrl);
      const serviceInfo = service.infoSync();
      should.exist(serviceInfo.access);
      should.exist(serviceInfo.serial);
    } catch(error) {
      console.log(error);
      should.not.exist(error);
    }
  });


  it('serviceInfoFromUrl()', async () => {
    expect('https://zouzou.com/service/info').to.equal(Pryv.Browser.serviceInfoFromUrl());
  });

});




/***/ }),

/***/ "./test/Connection.test.js":
/*!*********************************!*\
  !*** ./test/Connection.test.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const should = chai.should();
const expect = chai.expect;
const testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");
let conn = null;
const { URL, URLSearchParams } = __webpack_require__(/*! universal-url */ "./node_modules/universal-url/browser.js");
const cuid = __webpack_require__(/*! cuid */ "./node_modules/cuid/index.js");

const isNode = (typeof window === 'undefined');

let readFileSync;
if (isNode) { // node
  readFileSync = (__webpack_require__(/*! fs */ "?0c98").readFileSync);
}

describe('Connection', () => {

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
    conn = new Pryv.Connection(testData.apiEndpointWithToken);

    // create some events
    const toBeDeletedId = cuid();
    const toBeTrashed = cuid();
    const resSetup = await conn.api([
      {
        method: 'events.create',
        params: {
          streamIds: ['data'],
          type: 'note/txt',
          content: 'Hello test ' + new Date()
        }
      },
      {
        method: 'events.create',
        params: {
          streamIds: ['data'],
          type: 'note/txt',
          content: 'Hello test ' + new Date(),
          id: toBeTrashed
        }
      },
      {
        method: 'events.create',
        params: {
          id: toBeDeletedId,
          streamIds: ['data'],
          type: 'note/txt',
          content: 'To be Deleted ' + new Date(),
        }
      },
      {
        method: 'events.delete',
        params: {
          id: toBeTrashed
        }
      },
      {
        method: 'events.delete',
        params: {
          id: toBeDeletedId
        }
      },
      {
        method: 'events.delete',
        params: {
          id: toBeDeletedId
        }
      }
    ]);
  });

  describe('.service', function () {
    it('return a Pryv.Service object', async () => {
      const service = conn.service;
      expect(service instanceof Pryv.Service).to.equal(true);
    });

  });

  describe('.username() ', function () {
    it('return the username of this connection', async () => {
      const username = await conn.username();
      expect(username).to.equals(testData.username);
    });

  });


  describe('.api()', function () {
    this.timeout(5000);
    it('.api() events.get', async () => {
      const res = await conn.api(
        [
          {
            method: "events.get",
            params: {}
          }
        ]);
      res.length.should.equal(1);
    });

    it('.api() events.get split in chunks', async () => {
      conn.options.chunkSize = 2;
      const res = await conn.api(
        [
          { method: "events.get", params: {} },
          { method: "events.get", params: {} },
          { method: "events.get", params: {} }
        ]);
      res.length.should.equal(3);

    });


    it('.api() events.get with handleResult call', async () => {
      conn.options.chunkSize = 2;

      let resultsRecievedCount = 0;
      function oneMoreResult(res) {
        should.exist(res.events);
        resultsRecievedCount++;
      }

      const res = await conn.api(
        [
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult }
        ]);
      res.length.should.equal(3);
      res.length.should.equal(resultsRecievedCount);
    });

    it('.api() events.get with async handleResult call', async () => {
      conn.options.chunkSize = 2;

      let resultsRecievedCount = 0;
      async function oneMoreResult(res) {
        should.exist(res.events);

        let promise = new Promise((res, rej) => {
          setTimeout(() => res("Now it's done!"), 100)
        });
        // wait until the promise returns us a value
        await promise;
        resultsRecievedCount++;
      }

      const res = await conn.api(
        [
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult },
          { method: "events.get", params: {}, handleResult: oneMoreResult }
        ]);
      res.length.should.equal(3);
      res.length.should.equal(resultsRecievedCount);
    });

    it('.api() events.get split in chunks and send percentages', async () => {
      conn.options.chunkSize = 2;
      const percentres = { 1: 67, 2: 100 }
      let count = 1;
      const res = await conn.api(
        [
          { method: "events.get", params: {} },
          { method: "events.get", params: {} },
          { method: "events.get", params: {} }
        ], function (percent) {
          percent.should.equal(percentres[count]);
          count++;
        });
      res.length.should.equal(3);

    });

    it('.api() with callbacks', (done) => {
      conn.api(
        [
          { method: "events.get", params: {} }
        ]).then((res) => {
          res.length.should.equal(1);
          done();
        }, (err) => {
          should.not.exist(err);
          done();
        });

    });
  });

  describe('Attachements', () => {
    it('Node Only: Create event with attachment from file', async function () {
      if (!isNode) { this.skip(); }
      const res = await conn.createEventWithFile({
        type: 'picture/attached',
        streamId: 'data'
      }, './test/Y.png');


      should.exist(res);
      should.exist(res.event);
      should.exist(res.event.attachments);
      res.event.attachments.length.should.equal(1);
      res.event.attachments[0].size.should.equal(14798);
      res.event.attachments[0].type.should.equal('image/png');
      res.event.attachments[0].fileName.should.equal('Y.png');
    });

    it('Node Only: Create event with attachment from Buffer', async function () {
      if (!isNode) { this.skip(); }
    
        const fileData = readFileSync('./test/Y.png');
        const res = await conn.createEventWithFileFromBuffer({
          type: 'picture/attached',
          streamId: 'data'
        }, fileData, 'Y.png');

        should.exist(res);
        should.exist(res.event);
        should.exist(res.event.attachments);
        res.event.attachments.length.should.equal(1);
        res.event.attachments[0].size.should.equal(14798);
        res.event.attachments[0].type.should.equal('image/png');
        res.event.attachments[0].fileName.should.equal('Y.png');

    });

    it('Browser Only: Create event with attachment from Buffer', async function () {
      if (isNode) { this.skip(); }
      
        const blob = new Blob(['Hello'], { type: "text/txt" });
        const res = await conn.createEventWithFileFromBuffer({
          type: 'picture/attached',
          streamId: 'data'
        }, blob, 'Hello.txt');

        should.exist(res);
        should.exist(res.event);
        console.log(res.event);
        should.exist(res.event.attachments);
        res.event.attachments.length.should.equal(1);
        res.event.attachments[0].size.should.equal(5);
        res.event.attachments[0].type.should.equal('text/txt');
        res.event.attachments[0].fileName.should.equal('Hello.txt');
        
    });
    
    it('Browser Only: Create event with attachment formData', async function () {
      if (isNode) { this.skip(); }

      const formData = new FormData();
      const blob = new Blob(['Hello'], { type: "text/txt" });
      formData.append("webmasterfile", blob);

      const res = await conn.createEventWithFormData({
        type: 'file/attached',
        streamId: 'data'
      }, formData);


      should.exist(res);
      should.exist(res.event);
      should.exist(res.event.attachments);
      res.event.attachments.length.should.equal(1);
      res.event.attachments[0].size.should.equal(5);
      res.event.attachments[0].type.should.equal('text/txt');
      res.event.attachments[0].fileName.should.equal('blob');
    });


  });

  describe('HF events', () => {

    it('Add data points to HF event', async () => {

      const res = await conn.api([{
        method: 'events.create',
        params: {
          type: 'series:mass/kg', streamId: 'data'
        }
      }]);
      should.exist(res);
      should.exist(res[0]);
      should.exist(res[0].event);
      should.exist(res[0].event.id);
      const event = res[0].event;

      const res2 = await conn.addPointsToHFEvent(
        event.id,
        ['deltaTime', 'value'],
        [[0, 1], [1, 1]]);

      should.exist(res2);
      'ok'.should.equal(res2.status);
    });

  });

  describe('.get()', () => {
    it('/events', async () => {
      const res = await conn.get('events', { limit: 1 });
      res.events.length.should.equal(1);
    });

  });

  describe('time', () => {
    it('deltatime property', async () => {
      await conn.get('events', { limit: 1 });
      const deltaTime = conn.deltaTime;
      expect(Math.abs(deltaTime) < 2).to.be.true;
    });
  });

  describe('API', () => {
    it('endpoint property', async () => {
      const apiEndpoint = conn.apiEndpoint;
      expect(apiEndpoint.startsWith('https://' + conn.token + '@')).to.be.true;
    });
  });

  describe('Streamed event get', function () {
    this.timeout(5000);
    const now = (new Date()).getTime() / 1000 + 1000;

    describe('Node & Browser', function () {
      it('streaming ', async () => {
        const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
        let eventsCount = 0;
        function forEachEvent(event) { eventsCount++; }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(eventsCount).to.equal(res.eventsCount);
      });


      it('streaming includesDeletion', async () => {
        const queryParams = { fromTime: 0, toTime: now, limit: 10000, includeDeletions: true, modifiedSince: 0, state: 'all' };
        let eventsCount = 0;
        let trashedCount = 0;
        let deletedCount = 0;
        function forEachEvent(event) {
          if (event.deleted) {
            deletedCount++;
          } else if (event.trashed) {
            trashedCount++;
          } else {
            eventsCount++;
          }
        }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(trashedCount + eventsCount).to.equal(res.eventsCount);
        expect(deletedCount).to.equal(res.eventDeletionsCount);
        expect(eventsCount).to.be.gt(0);
        expect(deletedCount).to.be.gt(0);
        expect(trashedCount).to.be.gt(0);
      });

      it('no-events ', async () => {
        const queryParams = { fromTime: 0, toTime: now, types: ['type/unexistent'] };
        function forEachEvent(event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
      });

      it('no-events includeDeletions', async () => {
        const queryParams = { fromTime: 0, toTime: now, types: ['type/unexistent'], includeDeletions: true, modifiedSince: 0 };
        function forEachEvent(event) { }
        const res = await conn.getEventsStreamed(queryParams, forEachEvent);
        expect(0).to.equal(res.eventsCount);
        expect(res.eventDeletionsCount).to.be.gte(0);
      });
    });



    if (typeof window === 'undefined') {
      describe('Browser mock', function () {
        beforeEach(function () {
          const browser = new Browser();
          browser.visit('./');
          __webpack_require__.g.document = browser.document;
          __webpack_require__.g.window = browser.window;
          __webpack_require__.g.location = browser.location;
          function fetch(...args) {
            return browser.fetch(...args);
          }
          __webpack_require__.g.fetch = fetch;
          __webpack_require__.g.URL = URL;
          __webpack_require__.g.URLSearchParams = URLSearchParams;
        });

        afterEach(function () {
          delete __webpack_require__.g.document;
          delete __webpack_require__.g.window;
          delete __webpack_require__.g.location;
          delete __webpack_require__.g.fetch;
          delete __webpack_require__.g.URL;
          delete __webpack_require__.g.URLSearchParams;
        });

        it(' without fetch', async () => {
          delete __webpack_require__.g.fetch;
          const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
          let eventsCount = 0;
          function forEachEvent(event) { eventsCount++; }
          const res = await conn.getEventsStreamed(queryParams, forEachEvent);
          expect(eventsCount).to.equal(res.eventsCount);
        });

        xit(' with fetch', async () => {
          const queryParams = { fromTime: 0, toTime: now, limit: 10000 };
          let eventsCount = 0;
          function forEachEvent(event) { eventsCount++; }
          const res = await conn.getEventsStreamed(queryParams, forEachEvent);
          expect(eventsCount).to.equal(res.eventsCount);
        });
      });
    }
  });

  describe('Access Info', () => {
    let newUser;
    let accessInfoUser;
    before(async () => {
      newUser = (await conn.api([
        {
          method: "accesses.create", params: {
            "name": "test",
            "permissions": [
              {
                "streamId": "data",
                "level": "read"
              }
            ]
          }
        }
      ]))[0];
    });

    beforeEach(async () => {
      const regexAPIandToken = /(.+):\/\/(.+)/gm;
      const res = regexAPIandToken.exec(testData.apiEndpoint);
      const apiEndpointWithToken = res[1] + '://' + newUser.access.token + '@' + res[2];
      const newConn = new Pryv.Connection(apiEndpointWithToken);
      accessInfoUser = await newConn.accessInfo();
    });

    after(async () => {
      await conn.api([
        {
          method: "accesses.delete", params: {
            "id": newUser.access.id
          }
        }
      ]);
    });

    it('has same username', () => {
      should.exist(accessInfoUser);
      should.exist(accessInfoUser.name);
      should.equal(newUser.access.name, accessInfoUser.name);
    });

    it('has same token', () => {
      should.exist(accessInfoUser.token);
      should.equal(newUser.access.token, accessInfoUser.token);
    });

  });

});

/***/ }),

/***/ "./test/Service.test.js":
/*!******************************!*\
  !*** ./test/Service.test.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


                   
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const chaiAsPromised = __webpack_require__(/*! chai-as-promised */ "./node_modules/chai-as-promised/lib/chai-as-promised.js");
chai.use(chaiAsPromised); 

const testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

describe('Service', function () {

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  it('info()', async () => {
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const res = await pryvService.info();
    should.exist(res);
    
    ['access', 'api', 'register'].forEach((key) => {
      should.exist(res[key]);
      // all API endpoints should end with a '/';
      res[key].slice(-1).should.equal('/');
    });
  });

  it('info() 2x ', async () => {
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const res = await pryvService.info();
    should.exist(res);
    should.exist(res.access);
    const res2 = await pryvService.info();
    should.exist(res2);
    should.exist(res2.access);
  });

  it('login()', async function () {
    this.timeout(5000);
    const pryvService = new Pryv.Service(testData.serviceInfoUrl);
    const conn = await pryvService.login(testData.username, testData.password, 'jslib-test');
    should.exist(conn);
    should.exist(conn.token);
    should.exist(conn.endpoint);
  });


  

  it('assets()', async function() {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    should.exist(assets);

    //assets should be cached
    const assets2 = await pryvService.assets();
    expect(assets).to.equal(assets2);
  });

  describe('Errors', async function () {

    it('Throw error with invalid content', async () => {
      const service = new Pryv.Service(null, {});
      await assert.isRejected(service.info(), 
      'Invalid data from service/info');
    });

    it('Warn if no assets', async () => {
      let serviceInfoCopy = Object.assign({}, testData.serviceInfo);
      delete serviceInfoCopy.assets;
      const pryvService = new Pryv.Service(null, serviceInfoCopy);
      const assets = await pryvService.assets();
      expect(assets).to.be.null;
    });

    it('login() failed', async function () {
      this.timeout(5000);
      const pryvService = new Pryv.Service(testData.serviceInfoUrl);
      await assert.isRejected(
        pryvService.login(testData.username, 'bobby', 'jslib-test'),'The given username/password pair is invalid.');
    });

  });
});




/***/ }),

/***/ "./test/ServiceAssets.test.js":
/*!************************************!*\
  !*** ./test/ServiceAssets.test.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const expect = chai.expect;

const testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

describe('ServiceAssets', function () {
  let removeZombie = false;

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });
  
  before(async () => {
    if (typeof document !== 'undefined') return; // in browser
    removeZombie = true;
    const browser = new Browser();
    browser.visit('./');
    __webpack_require__.g.document = browser.document;
    __webpack_require__.g.window = browser.window;
    __webpack_require__.g.location = browser.location;
  });

  after(async () => {
    if (! removeZombie) return; // in browser
    delete __webpack_require__.g.document;
    delete __webpack_require__.g.window; 
    delete __webpack_require__.g.location; 
  });

  it('relativeURL()', async () => {
   
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    expect(assets.relativeURL('./toto')).to.eql(testData.serviceInfo.assets.definitions.replace('index.json', 'toto'));
   
  });

  it('setAllDefaults()', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    await assets.setAllDefaults();

  });

  it('Load all external elements', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
   
   
    await assets.loginButtonLoadCSS();
    await assets.loginButtonGetHTML();
    await assets.loginButtonGetMessages();
    
  });

  it('.get() returns all assets', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const allAssets = await assets.get();
    expect(allAssets.favicon.default.url).to.eql('favicon.ico');
  });

  it('.get(keyPath) ', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const faviconUrl = await assets.get('favicon:default:url');
    expect(faviconUrl).to.eql('favicon.ico');
  });

  it('.getUrl(keyPath) ', async () => {
    const pryvService = new Pryv.Service(null, testData.serviceInfo);
    const assets = await pryvService.assets();
    const faviconUrl = await assets.getUrl('favicon:default:url');
    expect(faviconUrl).to.eql(testData.serviceInfo.assets.definitions.replace('index.json', 'favicon.ico'));
  });

});




/***/ }),

/***/ "./test/test-data.js":
/*!***************************!*\
  !*** ./test/test-data.js ***!
  \***************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const superagent = __webpack_require__(/*! superagent */ "./node_modules/superagent/lib/client.js");

const username = 'jslibtest5';
const serviceInfoUrl = 'https://reg.pryv.me/service/info';
//const serviceInfoUrl = 'https://l.rec.la:4443/reg/service/info';

/**
 * Data used for tests
 */
const testData = {
  username: username,
  password: username,
  serviceInfoUrl: serviceInfoUrl,
  token: null,
  serviceInfo: null,
  apiEndpoint: null,
  apiEndpointWithToken: null
}


async function prepare() {
  if (testData.token != null) return testData;
  console.log('Preparing test Data..');
  // fetch serviceInfo

  const serviceInfo = (await superagent.get(serviceInfoUrl)).body;
  if (serviceInfo.api == null) throw 'Invalid service Info ' + JSON.stringify(serviceInfo);
  // test if user exists
  const userExists = (await superagent.get(serviceInfo.register + username + '/check_username')).body;
  if (typeof userExists.reserved === 'undefined') throw 'Invalid user exists ' + JSON.stringify(userExists);

  let hostingCandidate = null;
  if (! userExists.reserved) { // create user
    // get available hosting
    const hostings = (await superagent.get(serviceInfo.register + 'hostings').set('accept', 'json')).body;
    findOneHostingKey(hostings, 'N');
    function findOneHostingKey(o, parentKey) {      
      for (const key of Object.keys(o)) {
        if (parentKey === 'hostings') {
          hostingCandidate = key;
          return key;
        }
        if (typeof o[key] !== 'string')
             findOneHostingKey(o[key], key);
      }
    };
    if (hostingCandidate == null) throw 'Cannot find hosting in: ' + JSON.stringify(hostings);
    const hosting = hostingCandidate;

    // create user
    await superagent.post(serviceInfo.register + 'user')
      .send({
        appid: 'js-lib-test',
        hosting: hosting,
        username: username,
        password: username,
        email: username + '@pryv.io',
        invitationtoken: 'enjoy',
        languageCode: 'en',
        referer: 'test-suite'
      });
  }
  const apiEndpoint = serviceInfo.api.replace('{username}', username);
  
  // login user
  const headers = {};
  if (typeof window === 'undefined') { headers.Origin = 'https://l.rec.la'; }; // node only
  const loginRes = await superagent.post(apiEndpoint + 'auth/login')
    .set(headers)
    .send({ username: username, password: username, appId: 'js-lib-test' });

  // create data stream
  try {
    const streamRes = await superagent.post(apiEndpoint + 'streams').set('authorization', loginRes.body.token).send(
      {
        id: 'data',
        name: 'Data'
      }
    )
  } catch (e) {
  }
  if ((loginRes.body == null) || (loginRes.body.token == null)) throw 'Failed login process during testData prepare' + loginRes.text;
  testData.serviceInfo = serviceInfo;
  testData.token = loginRes.body.token;

  const regexAPIandToken = /(.+):\/\/(.+)/gm;
  const res = regexAPIandToken.exec(apiEndpoint);
  testData.apiEndpointWithToken = res[1] + '://' + testData.token + '@' + res[2];
  testData.apiEndpoint = apiEndpoint;
}

testData.prepare = prepare;


module.exports = testData;

/***/ }),

/***/ "./test/utils.test.js":
/*!****************************!*\
  !*** ./test/utils.test.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


const should = chai.should();
const expect = chai.expect;

const testData = __webpack_require__(/*! ./test-data.js */ "./test/test-data.js");

describe('utils', function () {

  before(async function () {
    this.timeout(5000);
    await testData.prepare();
  });

  it('extractTokenAndApiEndpoint', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndpointWithToken);
    testData.token.should.equals(tokenAndAPI.token);
  
    (testData.apiEndpoint).should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should work without token', function (done) {
    const tokenAndAPI = Pryv.utils
      .extractTokenAndApiEndpoint(testData.apiEndpoint);
      
    should.not.exist(tokenAndAPI.token);

    (testData.apiEndpoint).should.equals(tokenAndAPI.endpoint);
    done();
  });

  it('extractTokenAndApiEndpoint should fail on invalid url', function (done) {
    let error = null;
    try {
      const tokenAndAPI = Pryv.utils
        .extractTokenAndApiEndpoint('blip');
    } catch (e) {
      error = e;
      
      return done();
    }
    should.exist(error);
    
  });

  it('buildAPIEndpoint with token', function (done) {
    const apiEndpoint = Pryv.utils
      .buildPryvApiEndpoint({ 
        token: testData.token, 
        endpoint: testData.apiEndpoint});   
    apiEndpoint.should.equals(testData.apiEndpointWithToken);
    done();
  });

  it('buildAPIEndpoint without token', function (done) {
    const apiEndpoint = Pryv.utils
      .buildPryvApiEndpoint({
        token: null,
        endpoint: testData.apiEndpoint
      });
    apiEndpoint.should.equals(testData.apiEndpoint);
    done();
  });

});




/***/ }),

/***/ "?4f7e":
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?86c3":
/*!************************!*\
  !*** semver (ignored) ***!
  \************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?0c98":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/universal-url/node_modules/tr46/lib/mappingTable.json":
/*!****************************************************************************!*\
  !*** ./node_modules/universal-url/node_modules/tr46/lib/mappingTable.json ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('[[[0,44],"disallowed_STD3_valid"],[[45,46],"valid"],[[47,47],"disallowed_STD3_valid"],[[48,57],"valid"],[[58,64],"disallowed_STD3_valid"],[[65,65],"mapped","a"],[[66,66],"mapped","b"],[[67,67],"mapped","c"],[[68,68],"mapped","d"],[[69,69],"mapped","e"],[[70,70],"mapped","f"],[[71,71],"mapped","g"],[[72,72],"mapped","h"],[[73,73],"mapped","i"],[[74,74],"mapped","j"],[[75,75],"mapped","k"],[[76,76],"mapped","l"],[[77,77],"mapped","m"],[[78,78],"mapped","n"],[[79,79],"mapped","o"],[[80,80],"mapped","p"],[[81,81],"mapped","q"],[[82,82],"mapped","r"],[[83,83],"mapped","s"],[[84,84],"mapped","t"],[[85,85],"mapped","u"],[[86,86],"mapped","v"],[[87,87],"mapped","w"],[[88,88],"mapped","x"],[[89,89],"mapped","y"],[[90,90],"mapped","z"],[[91,96],"disallowed_STD3_valid"],[[97,122],"valid"],[[123,127],"disallowed_STD3_valid"],[[128,159],"disallowed"],[[160,160],"disallowed_STD3_mapped"," "],[[161,167],"valid","","NV8"],[[168,168],"disallowed_STD3_mapped"," ̈"],[[169,169],"valid","","NV8"],[[170,170],"mapped","a"],[[171,172],"valid","","NV8"],[[173,173],"ignored"],[[174,174],"valid","","NV8"],[[175,175],"disallowed_STD3_mapped"," ̄"],[[176,177],"valid","","NV8"],[[178,178],"mapped","2"],[[179,179],"mapped","3"],[[180,180],"disallowed_STD3_mapped"," ́"],[[181,181],"mapped","μ"],[[182,182],"valid","","NV8"],[[183,183],"valid"],[[184,184],"disallowed_STD3_mapped"," ̧"],[[185,185],"mapped","1"],[[186,186],"mapped","o"],[[187,187],"valid","","NV8"],[[188,188],"mapped","1⁄4"],[[189,189],"mapped","1⁄2"],[[190,190],"mapped","3⁄4"],[[191,191],"valid","","NV8"],[[192,192],"mapped","à"],[[193,193],"mapped","á"],[[194,194],"mapped","â"],[[195,195],"mapped","ã"],[[196,196],"mapped","ä"],[[197,197],"mapped","å"],[[198,198],"mapped","æ"],[[199,199],"mapped","ç"],[[200,200],"mapped","è"],[[201,201],"mapped","é"],[[202,202],"mapped","ê"],[[203,203],"mapped","ë"],[[204,204],"mapped","ì"],[[205,205],"mapped","í"],[[206,206],"mapped","î"],[[207,207],"mapped","ï"],[[208,208],"mapped","ð"],[[209,209],"mapped","ñ"],[[210,210],"mapped","ò"],[[211,211],"mapped","ó"],[[212,212],"mapped","ô"],[[213,213],"mapped","õ"],[[214,214],"mapped","ö"],[[215,215],"valid","","NV8"],[[216,216],"mapped","ø"],[[217,217],"mapped","ù"],[[218,218],"mapped","ú"],[[219,219],"mapped","û"],[[220,220],"mapped","ü"],[[221,221],"mapped","ý"],[[222,222],"mapped","þ"],[[223,223],"deviation","ss"],[[224,246],"valid"],[[247,247],"valid","","NV8"],[[248,255],"valid"],[[256,256],"mapped","ā"],[[257,257],"valid"],[[258,258],"mapped","ă"],[[259,259],"valid"],[[260,260],"mapped","ą"],[[261,261],"valid"],[[262,262],"mapped","ć"],[[263,263],"valid"],[[264,264],"mapped","ĉ"],[[265,265],"valid"],[[266,266],"mapped","ċ"],[[267,267],"valid"],[[268,268],"mapped","č"],[[269,269],"valid"],[[270,270],"mapped","ď"],[[271,271],"valid"],[[272,272],"mapped","đ"],[[273,273],"valid"],[[274,274],"mapped","ē"],[[275,275],"valid"],[[276,276],"mapped","ĕ"],[[277,277],"valid"],[[278,278],"mapped","ė"],[[279,279],"valid"],[[280,280],"mapped","ę"],[[281,281],"valid"],[[282,282],"mapped","ě"],[[283,283],"valid"],[[284,284],"mapped","ĝ"],[[285,285],"valid"],[[286,286],"mapped","ğ"],[[287,287],"valid"],[[288,288],"mapped","ġ"],[[289,289],"valid"],[[290,290],"mapped","ģ"],[[291,291],"valid"],[[292,292],"mapped","ĥ"],[[293,293],"valid"],[[294,294],"mapped","ħ"],[[295,295],"valid"],[[296,296],"mapped","ĩ"],[[297,297],"valid"],[[298,298],"mapped","ī"],[[299,299],"valid"],[[300,300],"mapped","ĭ"],[[301,301],"valid"],[[302,302],"mapped","į"],[[303,303],"valid"],[[304,304],"mapped","i̇"],[[305,305],"valid"],[[306,307],"mapped","ij"],[[308,308],"mapped","ĵ"],[[309,309],"valid"],[[310,310],"mapped","ķ"],[[311,312],"valid"],[[313,313],"mapped","ĺ"],[[314,314],"valid"],[[315,315],"mapped","ļ"],[[316,316],"valid"],[[317,317],"mapped","ľ"],[[318,318],"valid"],[[319,320],"mapped","l·"],[[321,321],"mapped","ł"],[[322,322],"valid"],[[323,323],"mapped","ń"],[[324,324],"valid"],[[325,325],"mapped","ņ"],[[326,326],"valid"],[[327,327],"mapped","ň"],[[328,328],"valid"],[[329,329],"mapped","ʼn"],[[330,330],"mapped","ŋ"],[[331,331],"valid"],[[332,332],"mapped","ō"],[[333,333],"valid"],[[334,334],"mapped","ŏ"],[[335,335],"valid"],[[336,336],"mapped","ő"],[[337,337],"valid"],[[338,338],"mapped","œ"],[[339,339],"valid"],[[340,340],"mapped","ŕ"],[[341,341],"valid"],[[342,342],"mapped","ŗ"],[[343,343],"valid"],[[344,344],"mapped","ř"],[[345,345],"valid"],[[346,346],"mapped","ś"],[[347,347],"valid"],[[348,348],"mapped","ŝ"],[[349,349],"valid"],[[350,350],"mapped","ş"],[[351,351],"valid"],[[352,352],"mapped","š"],[[353,353],"valid"],[[354,354],"mapped","ţ"],[[355,355],"valid"],[[356,356],"mapped","ť"],[[357,357],"valid"],[[358,358],"mapped","ŧ"],[[359,359],"valid"],[[360,360],"mapped","ũ"],[[361,361],"valid"],[[362,362],"mapped","ū"],[[363,363],"valid"],[[364,364],"mapped","ŭ"],[[365,365],"valid"],[[366,366],"mapped","ů"],[[367,367],"valid"],[[368,368],"mapped","ű"],[[369,369],"valid"],[[370,370],"mapped","ų"],[[371,371],"valid"],[[372,372],"mapped","ŵ"],[[373,373],"valid"],[[374,374],"mapped","ŷ"],[[375,375],"valid"],[[376,376],"mapped","ÿ"],[[377,377],"mapped","ź"],[[378,378],"valid"],[[379,379],"mapped","ż"],[[380,380],"valid"],[[381,381],"mapped","ž"],[[382,382],"valid"],[[383,383],"mapped","s"],[[384,384],"valid"],[[385,385],"mapped","ɓ"],[[386,386],"mapped","ƃ"],[[387,387],"valid"],[[388,388],"mapped","ƅ"],[[389,389],"valid"],[[390,390],"mapped","ɔ"],[[391,391],"mapped","ƈ"],[[392,392],"valid"],[[393,393],"mapped","ɖ"],[[394,394],"mapped","ɗ"],[[395,395],"mapped","ƌ"],[[396,397],"valid"],[[398,398],"mapped","ǝ"],[[399,399],"mapped","ə"],[[400,400],"mapped","ɛ"],[[401,401],"mapped","ƒ"],[[402,402],"valid"],[[403,403],"mapped","ɠ"],[[404,404],"mapped","ɣ"],[[405,405],"valid"],[[406,406],"mapped","ɩ"],[[407,407],"mapped","ɨ"],[[408,408],"mapped","ƙ"],[[409,411],"valid"],[[412,412],"mapped","ɯ"],[[413,413],"mapped","ɲ"],[[414,414],"valid"],[[415,415],"mapped","ɵ"],[[416,416],"mapped","ơ"],[[417,417],"valid"],[[418,418],"mapped","ƣ"],[[419,419],"valid"],[[420,420],"mapped","ƥ"],[[421,421],"valid"],[[422,422],"mapped","ʀ"],[[423,423],"mapped","ƨ"],[[424,424],"valid"],[[425,425],"mapped","ʃ"],[[426,427],"valid"],[[428,428],"mapped","ƭ"],[[429,429],"valid"],[[430,430],"mapped","ʈ"],[[431,431],"mapped","ư"],[[432,432],"valid"],[[433,433],"mapped","ʊ"],[[434,434],"mapped","ʋ"],[[435,435],"mapped","ƴ"],[[436,436],"valid"],[[437,437],"mapped","ƶ"],[[438,438],"valid"],[[439,439],"mapped","ʒ"],[[440,440],"mapped","ƹ"],[[441,443],"valid"],[[444,444],"mapped","ƽ"],[[445,451],"valid"],[[452,454],"mapped","dž"],[[455,457],"mapped","lj"],[[458,460],"mapped","nj"],[[461,461],"mapped","ǎ"],[[462,462],"valid"],[[463,463],"mapped","ǐ"],[[464,464],"valid"],[[465,465],"mapped","ǒ"],[[466,466],"valid"],[[467,467],"mapped","ǔ"],[[468,468],"valid"],[[469,469],"mapped","ǖ"],[[470,470],"valid"],[[471,471],"mapped","ǘ"],[[472,472],"valid"],[[473,473],"mapped","ǚ"],[[474,474],"valid"],[[475,475],"mapped","ǜ"],[[476,477],"valid"],[[478,478],"mapped","ǟ"],[[479,479],"valid"],[[480,480],"mapped","ǡ"],[[481,481],"valid"],[[482,482],"mapped","ǣ"],[[483,483],"valid"],[[484,484],"mapped","ǥ"],[[485,485],"valid"],[[486,486],"mapped","ǧ"],[[487,487],"valid"],[[488,488],"mapped","ǩ"],[[489,489],"valid"],[[490,490],"mapped","ǫ"],[[491,491],"valid"],[[492,492],"mapped","ǭ"],[[493,493],"valid"],[[494,494],"mapped","ǯ"],[[495,496],"valid"],[[497,499],"mapped","dz"],[[500,500],"mapped","ǵ"],[[501,501],"valid"],[[502,502],"mapped","ƕ"],[[503,503],"mapped","ƿ"],[[504,504],"mapped","ǹ"],[[505,505],"valid"],[[506,506],"mapped","ǻ"],[[507,507],"valid"],[[508,508],"mapped","ǽ"],[[509,509],"valid"],[[510,510],"mapped","ǿ"],[[511,511],"valid"],[[512,512],"mapped","ȁ"],[[513,513],"valid"],[[514,514],"mapped","ȃ"],[[515,515],"valid"],[[516,516],"mapped","ȅ"],[[517,517],"valid"],[[518,518],"mapped","ȇ"],[[519,519],"valid"],[[520,520],"mapped","ȉ"],[[521,521],"valid"],[[522,522],"mapped","ȋ"],[[523,523],"valid"],[[524,524],"mapped","ȍ"],[[525,525],"valid"],[[526,526],"mapped","ȏ"],[[527,527],"valid"],[[528,528],"mapped","ȑ"],[[529,529],"valid"],[[530,530],"mapped","ȓ"],[[531,531],"valid"],[[532,532],"mapped","ȕ"],[[533,533],"valid"],[[534,534],"mapped","ȗ"],[[535,535],"valid"],[[536,536],"mapped","ș"],[[537,537],"valid"],[[538,538],"mapped","ț"],[[539,539],"valid"],[[540,540],"mapped","ȝ"],[[541,541],"valid"],[[542,542],"mapped","ȟ"],[[543,543],"valid"],[[544,544],"mapped","ƞ"],[[545,545],"valid"],[[546,546],"mapped","ȣ"],[[547,547],"valid"],[[548,548],"mapped","ȥ"],[[549,549],"valid"],[[550,550],"mapped","ȧ"],[[551,551],"valid"],[[552,552],"mapped","ȩ"],[[553,553],"valid"],[[554,554],"mapped","ȫ"],[[555,555],"valid"],[[556,556],"mapped","ȭ"],[[557,557],"valid"],[[558,558],"mapped","ȯ"],[[559,559],"valid"],[[560,560],"mapped","ȱ"],[[561,561],"valid"],[[562,562],"mapped","ȳ"],[[563,563],"valid"],[[564,566],"valid"],[[567,569],"valid"],[[570,570],"mapped","ⱥ"],[[571,571],"mapped","ȼ"],[[572,572],"valid"],[[573,573],"mapped","ƚ"],[[574,574],"mapped","ⱦ"],[[575,576],"valid"],[[577,577],"mapped","ɂ"],[[578,578],"valid"],[[579,579],"mapped","ƀ"],[[580,580],"mapped","ʉ"],[[581,581],"mapped","ʌ"],[[582,582],"mapped","ɇ"],[[583,583],"valid"],[[584,584],"mapped","ɉ"],[[585,585],"valid"],[[586,586],"mapped","ɋ"],[[587,587],"valid"],[[588,588],"mapped","ɍ"],[[589,589],"valid"],[[590,590],"mapped","ɏ"],[[591,591],"valid"],[[592,680],"valid"],[[681,685],"valid"],[[686,687],"valid"],[[688,688],"mapped","h"],[[689,689],"mapped","ɦ"],[[690,690],"mapped","j"],[[691,691],"mapped","r"],[[692,692],"mapped","ɹ"],[[693,693],"mapped","ɻ"],[[694,694],"mapped","ʁ"],[[695,695],"mapped","w"],[[696,696],"mapped","y"],[[697,705],"valid"],[[706,709],"valid","","NV8"],[[710,721],"valid"],[[722,727],"valid","","NV8"],[[728,728],"disallowed_STD3_mapped"," ̆"],[[729,729],"disallowed_STD3_mapped"," ̇"],[[730,730],"disallowed_STD3_mapped"," ̊"],[[731,731],"disallowed_STD3_mapped"," ̨"],[[732,732],"disallowed_STD3_mapped"," ̃"],[[733,733],"disallowed_STD3_mapped"," ̋"],[[734,734],"valid","","NV8"],[[735,735],"valid","","NV8"],[[736,736],"mapped","ɣ"],[[737,737],"mapped","l"],[[738,738],"mapped","s"],[[739,739],"mapped","x"],[[740,740],"mapped","ʕ"],[[741,745],"valid","","NV8"],[[746,747],"valid","","NV8"],[[748,748],"valid"],[[749,749],"valid","","NV8"],[[750,750],"valid"],[[751,767],"valid","","NV8"],[[768,831],"valid"],[[832,832],"mapped","̀"],[[833,833],"mapped","́"],[[834,834],"valid"],[[835,835],"mapped","̓"],[[836,836],"mapped","̈́"],[[837,837],"mapped","ι"],[[838,846],"valid"],[[847,847],"ignored"],[[848,855],"valid"],[[856,860],"valid"],[[861,863],"valid"],[[864,865],"valid"],[[866,866],"valid"],[[867,879],"valid"],[[880,880],"mapped","ͱ"],[[881,881],"valid"],[[882,882],"mapped","ͳ"],[[883,883],"valid"],[[884,884],"mapped","ʹ"],[[885,885],"valid"],[[886,886],"mapped","ͷ"],[[887,887],"valid"],[[888,889],"disallowed"],[[890,890],"disallowed_STD3_mapped"," ι"],[[891,893],"valid"],[[894,894],"disallowed_STD3_mapped",";"],[[895,895],"mapped","ϳ"],[[896,899],"disallowed"],[[900,900],"disallowed_STD3_mapped"," ́"],[[901,901],"disallowed_STD3_mapped"," ̈́"],[[902,902],"mapped","ά"],[[903,903],"mapped","·"],[[904,904],"mapped","έ"],[[905,905],"mapped","ή"],[[906,906],"mapped","ί"],[[907,907],"disallowed"],[[908,908],"mapped","ό"],[[909,909],"disallowed"],[[910,910],"mapped","ύ"],[[911,911],"mapped","ώ"],[[912,912],"valid"],[[913,913],"mapped","α"],[[914,914],"mapped","β"],[[915,915],"mapped","γ"],[[916,916],"mapped","δ"],[[917,917],"mapped","ε"],[[918,918],"mapped","ζ"],[[919,919],"mapped","η"],[[920,920],"mapped","θ"],[[921,921],"mapped","ι"],[[922,922],"mapped","κ"],[[923,923],"mapped","λ"],[[924,924],"mapped","μ"],[[925,925],"mapped","ν"],[[926,926],"mapped","ξ"],[[927,927],"mapped","ο"],[[928,928],"mapped","π"],[[929,929],"mapped","ρ"],[[930,930],"disallowed"],[[931,931],"mapped","σ"],[[932,932],"mapped","τ"],[[933,933],"mapped","υ"],[[934,934],"mapped","φ"],[[935,935],"mapped","χ"],[[936,936],"mapped","ψ"],[[937,937],"mapped","ω"],[[938,938],"mapped","ϊ"],[[939,939],"mapped","ϋ"],[[940,961],"valid"],[[962,962],"deviation","σ"],[[963,974],"valid"],[[975,975],"mapped","ϗ"],[[976,976],"mapped","β"],[[977,977],"mapped","θ"],[[978,978],"mapped","υ"],[[979,979],"mapped","ύ"],[[980,980],"mapped","ϋ"],[[981,981],"mapped","φ"],[[982,982],"mapped","π"],[[983,983],"valid"],[[984,984],"mapped","ϙ"],[[985,985],"valid"],[[986,986],"mapped","ϛ"],[[987,987],"valid"],[[988,988],"mapped","ϝ"],[[989,989],"valid"],[[990,990],"mapped","ϟ"],[[991,991],"valid"],[[992,992],"mapped","ϡ"],[[993,993],"valid"],[[994,994],"mapped","ϣ"],[[995,995],"valid"],[[996,996],"mapped","ϥ"],[[997,997],"valid"],[[998,998],"mapped","ϧ"],[[999,999],"valid"],[[1000,1000],"mapped","ϩ"],[[1001,1001],"valid"],[[1002,1002],"mapped","ϫ"],[[1003,1003],"valid"],[[1004,1004],"mapped","ϭ"],[[1005,1005],"valid"],[[1006,1006],"mapped","ϯ"],[[1007,1007],"valid"],[[1008,1008],"mapped","κ"],[[1009,1009],"mapped","ρ"],[[1010,1010],"mapped","σ"],[[1011,1011],"valid"],[[1012,1012],"mapped","θ"],[[1013,1013],"mapped","ε"],[[1014,1014],"valid","","NV8"],[[1015,1015],"mapped","ϸ"],[[1016,1016],"valid"],[[1017,1017],"mapped","σ"],[[1018,1018],"mapped","ϻ"],[[1019,1019],"valid"],[[1020,1020],"valid"],[[1021,1021],"mapped","ͻ"],[[1022,1022],"mapped","ͼ"],[[1023,1023],"mapped","ͽ"],[[1024,1024],"mapped","ѐ"],[[1025,1025],"mapped","ё"],[[1026,1026],"mapped","ђ"],[[1027,1027],"mapped","ѓ"],[[1028,1028],"mapped","є"],[[1029,1029],"mapped","ѕ"],[[1030,1030],"mapped","і"],[[1031,1031],"mapped","ї"],[[1032,1032],"mapped","ј"],[[1033,1033],"mapped","љ"],[[1034,1034],"mapped","њ"],[[1035,1035],"mapped","ћ"],[[1036,1036],"mapped","ќ"],[[1037,1037],"mapped","ѝ"],[[1038,1038],"mapped","ў"],[[1039,1039],"mapped","џ"],[[1040,1040],"mapped","а"],[[1041,1041],"mapped","б"],[[1042,1042],"mapped","в"],[[1043,1043],"mapped","г"],[[1044,1044],"mapped","д"],[[1045,1045],"mapped","е"],[[1046,1046],"mapped","ж"],[[1047,1047],"mapped","з"],[[1048,1048],"mapped","и"],[[1049,1049],"mapped","й"],[[1050,1050],"mapped","к"],[[1051,1051],"mapped","л"],[[1052,1052],"mapped","м"],[[1053,1053],"mapped","н"],[[1054,1054],"mapped","о"],[[1055,1055],"mapped","п"],[[1056,1056],"mapped","р"],[[1057,1057],"mapped","с"],[[1058,1058],"mapped","т"],[[1059,1059],"mapped","у"],[[1060,1060],"mapped","ф"],[[1061,1061],"mapped","х"],[[1062,1062],"mapped","ц"],[[1063,1063],"mapped","ч"],[[1064,1064],"mapped","ш"],[[1065,1065],"mapped","щ"],[[1066,1066],"mapped","ъ"],[[1067,1067],"mapped","ы"],[[1068,1068],"mapped","ь"],[[1069,1069],"mapped","э"],[[1070,1070],"mapped","ю"],[[1071,1071],"mapped","я"],[[1072,1103],"valid"],[[1104,1104],"valid"],[[1105,1116],"valid"],[[1117,1117],"valid"],[[1118,1119],"valid"],[[1120,1120],"mapped","ѡ"],[[1121,1121],"valid"],[[1122,1122],"mapped","ѣ"],[[1123,1123],"valid"],[[1124,1124],"mapped","ѥ"],[[1125,1125],"valid"],[[1126,1126],"mapped","ѧ"],[[1127,1127],"valid"],[[1128,1128],"mapped","ѩ"],[[1129,1129],"valid"],[[1130,1130],"mapped","ѫ"],[[1131,1131],"valid"],[[1132,1132],"mapped","ѭ"],[[1133,1133],"valid"],[[1134,1134],"mapped","ѯ"],[[1135,1135],"valid"],[[1136,1136],"mapped","ѱ"],[[1137,1137],"valid"],[[1138,1138],"mapped","ѳ"],[[1139,1139],"valid"],[[1140,1140],"mapped","ѵ"],[[1141,1141],"valid"],[[1142,1142],"mapped","ѷ"],[[1143,1143],"valid"],[[1144,1144],"mapped","ѹ"],[[1145,1145],"valid"],[[1146,1146],"mapped","ѻ"],[[1147,1147],"valid"],[[1148,1148],"mapped","ѽ"],[[1149,1149],"valid"],[[1150,1150],"mapped","ѿ"],[[1151,1151],"valid"],[[1152,1152],"mapped","ҁ"],[[1153,1153],"valid"],[[1154,1154],"valid","","NV8"],[[1155,1158],"valid"],[[1159,1159],"valid"],[[1160,1161],"valid","","NV8"],[[1162,1162],"mapped","ҋ"],[[1163,1163],"valid"],[[1164,1164],"mapped","ҍ"],[[1165,1165],"valid"],[[1166,1166],"mapped","ҏ"],[[1167,1167],"valid"],[[1168,1168],"mapped","ґ"],[[1169,1169],"valid"],[[1170,1170],"mapped","ғ"],[[1171,1171],"valid"],[[1172,1172],"mapped","ҕ"],[[1173,1173],"valid"],[[1174,1174],"mapped","җ"],[[1175,1175],"valid"],[[1176,1176],"mapped","ҙ"],[[1177,1177],"valid"],[[1178,1178],"mapped","қ"],[[1179,1179],"valid"],[[1180,1180],"mapped","ҝ"],[[1181,1181],"valid"],[[1182,1182],"mapped","ҟ"],[[1183,1183],"valid"],[[1184,1184],"mapped","ҡ"],[[1185,1185],"valid"],[[1186,1186],"mapped","ң"],[[1187,1187],"valid"],[[1188,1188],"mapped","ҥ"],[[1189,1189],"valid"],[[1190,1190],"mapped","ҧ"],[[1191,1191],"valid"],[[1192,1192],"mapped","ҩ"],[[1193,1193],"valid"],[[1194,1194],"mapped","ҫ"],[[1195,1195],"valid"],[[1196,1196],"mapped","ҭ"],[[1197,1197],"valid"],[[1198,1198],"mapped","ү"],[[1199,1199],"valid"],[[1200,1200],"mapped","ұ"],[[1201,1201],"valid"],[[1202,1202],"mapped","ҳ"],[[1203,1203],"valid"],[[1204,1204],"mapped","ҵ"],[[1205,1205],"valid"],[[1206,1206],"mapped","ҷ"],[[1207,1207],"valid"],[[1208,1208],"mapped","ҹ"],[[1209,1209],"valid"],[[1210,1210],"mapped","һ"],[[1211,1211],"valid"],[[1212,1212],"mapped","ҽ"],[[1213,1213],"valid"],[[1214,1214],"mapped","ҿ"],[[1215,1215],"valid"],[[1216,1216],"disallowed"],[[1217,1217],"mapped","ӂ"],[[1218,1218],"valid"],[[1219,1219],"mapped","ӄ"],[[1220,1220],"valid"],[[1221,1221],"mapped","ӆ"],[[1222,1222],"valid"],[[1223,1223],"mapped","ӈ"],[[1224,1224],"valid"],[[1225,1225],"mapped","ӊ"],[[1226,1226],"valid"],[[1227,1227],"mapped","ӌ"],[[1228,1228],"valid"],[[1229,1229],"mapped","ӎ"],[[1230,1230],"valid"],[[1231,1231],"valid"],[[1232,1232],"mapped","ӑ"],[[1233,1233],"valid"],[[1234,1234],"mapped","ӓ"],[[1235,1235],"valid"],[[1236,1236],"mapped","ӕ"],[[1237,1237],"valid"],[[1238,1238],"mapped","ӗ"],[[1239,1239],"valid"],[[1240,1240],"mapped","ә"],[[1241,1241],"valid"],[[1242,1242],"mapped","ӛ"],[[1243,1243],"valid"],[[1244,1244],"mapped","ӝ"],[[1245,1245],"valid"],[[1246,1246],"mapped","ӟ"],[[1247,1247],"valid"],[[1248,1248],"mapped","ӡ"],[[1249,1249],"valid"],[[1250,1250],"mapped","ӣ"],[[1251,1251],"valid"],[[1252,1252],"mapped","ӥ"],[[1253,1253],"valid"],[[1254,1254],"mapped","ӧ"],[[1255,1255],"valid"],[[1256,1256],"mapped","ө"],[[1257,1257],"valid"],[[1258,1258],"mapped","ӫ"],[[1259,1259],"valid"],[[1260,1260],"mapped","ӭ"],[[1261,1261],"valid"],[[1262,1262],"mapped","ӯ"],[[1263,1263],"valid"],[[1264,1264],"mapped","ӱ"],[[1265,1265],"valid"],[[1266,1266],"mapped","ӳ"],[[1267,1267],"valid"],[[1268,1268],"mapped","ӵ"],[[1269,1269],"valid"],[[1270,1270],"mapped","ӷ"],[[1271,1271],"valid"],[[1272,1272],"mapped","ӹ"],[[1273,1273],"valid"],[[1274,1274],"mapped","ӻ"],[[1275,1275],"valid"],[[1276,1276],"mapped","ӽ"],[[1277,1277],"valid"],[[1278,1278],"mapped","ӿ"],[[1279,1279],"valid"],[[1280,1280],"mapped","ԁ"],[[1281,1281],"valid"],[[1282,1282],"mapped","ԃ"],[[1283,1283],"valid"],[[1284,1284],"mapped","ԅ"],[[1285,1285],"valid"],[[1286,1286],"mapped","ԇ"],[[1287,1287],"valid"],[[1288,1288],"mapped","ԉ"],[[1289,1289],"valid"],[[1290,1290],"mapped","ԋ"],[[1291,1291],"valid"],[[1292,1292],"mapped","ԍ"],[[1293,1293],"valid"],[[1294,1294],"mapped","ԏ"],[[1295,1295],"valid"],[[1296,1296],"mapped","ԑ"],[[1297,1297],"valid"],[[1298,1298],"mapped","ԓ"],[[1299,1299],"valid"],[[1300,1300],"mapped","ԕ"],[[1301,1301],"valid"],[[1302,1302],"mapped","ԗ"],[[1303,1303],"valid"],[[1304,1304],"mapped","ԙ"],[[1305,1305],"valid"],[[1306,1306],"mapped","ԛ"],[[1307,1307],"valid"],[[1308,1308],"mapped","ԝ"],[[1309,1309],"valid"],[[1310,1310],"mapped","ԟ"],[[1311,1311],"valid"],[[1312,1312],"mapped","ԡ"],[[1313,1313],"valid"],[[1314,1314],"mapped","ԣ"],[[1315,1315],"valid"],[[1316,1316],"mapped","ԥ"],[[1317,1317],"valid"],[[1318,1318],"mapped","ԧ"],[[1319,1319],"valid"],[[1320,1320],"mapped","ԩ"],[[1321,1321],"valid"],[[1322,1322],"mapped","ԫ"],[[1323,1323],"valid"],[[1324,1324],"mapped","ԭ"],[[1325,1325],"valid"],[[1326,1326],"mapped","ԯ"],[[1327,1327],"valid"],[[1328,1328],"disallowed"],[[1329,1329],"mapped","ա"],[[1330,1330],"mapped","բ"],[[1331,1331],"mapped","գ"],[[1332,1332],"mapped","դ"],[[1333,1333],"mapped","ե"],[[1334,1334],"mapped","զ"],[[1335,1335],"mapped","է"],[[1336,1336],"mapped","ը"],[[1337,1337],"mapped","թ"],[[1338,1338],"mapped","ժ"],[[1339,1339],"mapped","ի"],[[1340,1340],"mapped","լ"],[[1341,1341],"mapped","խ"],[[1342,1342],"mapped","ծ"],[[1343,1343],"mapped","կ"],[[1344,1344],"mapped","հ"],[[1345,1345],"mapped","ձ"],[[1346,1346],"mapped","ղ"],[[1347,1347],"mapped","ճ"],[[1348,1348],"mapped","մ"],[[1349,1349],"mapped","յ"],[[1350,1350],"mapped","ն"],[[1351,1351],"mapped","շ"],[[1352,1352],"mapped","ո"],[[1353,1353],"mapped","չ"],[[1354,1354],"mapped","պ"],[[1355,1355],"mapped","ջ"],[[1356,1356],"mapped","ռ"],[[1357,1357],"mapped","ս"],[[1358,1358],"mapped","վ"],[[1359,1359],"mapped","տ"],[[1360,1360],"mapped","ր"],[[1361,1361],"mapped","ց"],[[1362,1362],"mapped","ւ"],[[1363,1363],"mapped","փ"],[[1364,1364],"mapped","ք"],[[1365,1365],"mapped","օ"],[[1366,1366],"mapped","ֆ"],[[1367,1368],"disallowed"],[[1369,1369],"valid"],[[1370,1375],"valid","","NV8"],[[1376,1376],"disallowed"],[[1377,1414],"valid"],[[1415,1415],"mapped","եւ"],[[1416,1416],"disallowed"],[[1417,1417],"valid","","NV8"],[[1418,1418],"valid","","NV8"],[[1419,1420],"disallowed"],[[1421,1422],"valid","","NV8"],[[1423,1423],"valid","","NV8"],[[1424,1424],"disallowed"],[[1425,1441],"valid"],[[1442,1442],"valid"],[[1443,1455],"valid"],[[1456,1465],"valid"],[[1466,1466],"valid"],[[1467,1469],"valid"],[[1470,1470],"valid","","NV8"],[[1471,1471],"valid"],[[1472,1472],"valid","","NV8"],[[1473,1474],"valid"],[[1475,1475],"valid","","NV8"],[[1476,1476],"valid"],[[1477,1477],"valid"],[[1478,1478],"valid","","NV8"],[[1479,1479],"valid"],[[1480,1487],"disallowed"],[[1488,1514],"valid"],[[1515,1519],"disallowed"],[[1520,1524],"valid"],[[1525,1535],"disallowed"],[[1536,1539],"disallowed"],[[1540,1540],"disallowed"],[[1541,1541],"disallowed"],[[1542,1546],"valid","","NV8"],[[1547,1547],"valid","","NV8"],[[1548,1548],"valid","","NV8"],[[1549,1551],"valid","","NV8"],[[1552,1557],"valid"],[[1558,1562],"valid"],[[1563,1563],"valid","","NV8"],[[1564,1564],"disallowed"],[[1565,1565],"disallowed"],[[1566,1566],"valid","","NV8"],[[1567,1567],"valid","","NV8"],[[1568,1568],"valid"],[[1569,1594],"valid"],[[1595,1599],"valid"],[[1600,1600],"valid","","NV8"],[[1601,1618],"valid"],[[1619,1621],"valid"],[[1622,1624],"valid"],[[1625,1630],"valid"],[[1631,1631],"valid"],[[1632,1641],"valid"],[[1642,1645],"valid","","NV8"],[[1646,1647],"valid"],[[1648,1652],"valid"],[[1653,1653],"mapped","اٴ"],[[1654,1654],"mapped","وٴ"],[[1655,1655],"mapped","ۇٴ"],[[1656,1656],"mapped","يٴ"],[[1657,1719],"valid"],[[1720,1721],"valid"],[[1722,1726],"valid"],[[1727,1727],"valid"],[[1728,1742],"valid"],[[1743,1743],"valid"],[[1744,1747],"valid"],[[1748,1748],"valid","","NV8"],[[1749,1756],"valid"],[[1757,1757],"disallowed"],[[1758,1758],"valid","","NV8"],[[1759,1768],"valid"],[[1769,1769],"valid","","NV8"],[[1770,1773],"valid"],[[1774,1775],"valid"],[[1776,1785],"valid"],[[1786,1790],"valid"],[[1791,1791],"valid"],[[1792,1805],"valid","","NV8"],[[1806,1806],"disallowed"],[[1807,1807],"disallowed"],[[1808,1836],"valid"],[[1837,1839],"valid"],[[1840,1866],"valid"],[[1867,1868],"disallowed"],[[1869,1871],"valid"],[[1872,1901],"valid"],[[1902,1919],"valid"],[[1920,1968],"valid"],[[1969,1969],"valid"],[[1970,1983],"disallowed"],[[1984,2037],"valid"],[[2038,2042],"valid","","NV8"],[[2043,2047],"disallowed"],[[2048,2093],"valid"],[[2094,2095],"disallowed"],[[2096,2110],"valid","","NV8"],[[2111,2111],"disallowed"],[[2112,2139],"valid"],[[2140,2141],"disallowed"],[[2142,2142],"valid","","NV8"],[[2143,2143],"disallowed"],[[2144,2154],"valid"],[[2155,2207],"disallowed"],[[2208,2208],"valid"],[[2209,2209],"valid"],[[2210,2220],"valid"],[[2221,2226],"valid"],[[2227,2228],"valid"],[[2229,2229],"disallowed"],[[2230,2237],"valid"],[[2238,2259],"disallowed"],[[2260,2273],"valid"],[[2274,2274],"disallowed"],[[2275,2275],"valid"],[[2276,2302],"valid"],[[2303,2303],"valid"],[[2304,2304],"valid"],[[2305,2307],"valid"],[[2308,2308],"valid"],[[2309,2361],"valid"],[[2362,2363],"valid"],[[2364,2381],"valid"],[[2382,2382],"valid"],[[2383,2383],"valid"],[[2384,2388],"valid"],[[2389,2389],"valid"],[[2390,2391],"valid"],[[2392,2392],"mapped","क़"],[[2393,2393],"mapped","ख़"],[[2394,2394],"mapped","ग़"],[[2395,2395],"mapped","ज़"],[[2396,2396],"mapped","ड़"],[[2397,2397],"mapped","ढ़"],[[2398,2398],"mapped","फ़"],[[2399,2399],"mapped","य़"],[[2400,2403],"valid"],[[2404,2405],"valid","","NV8"],[[2406,2415],"valid"],[[2416,2416],"valid","","NV8"],[[2417,2418],"valid"],[[2419,2423],"valid"],[[2424,2424],"valid"],[[2425,2426],"valid"],[[2427,2428],"valid"],[[2429,2429],"valid"],[[2430,2431],"valid"],[[2432,2432],"valid"],[[2433,2435],"valid"],[[2436,2436],"disallowed"],[[2437,2444],"valid"],[[2445,2446],"disallowed"],[[2447,2448],"valid"],[[2449,2450],"disallowed"],[[2451,2472],"valid"],[[2473,2473],"disallowed"],[[2474,2480],"valid"],[[2481,2481],"disallowed"],[[2482,2482],"valid"],[[2483,2485],"disallowed"],[[2486,2489],"valid"],[[2490,2491],"disallowed"],[[2492,2492],"valid"],[[2493,2493],"valid"],[[2494,2500],"valid"],[[2501,2502],"disallowed"],[[2503,2504],"valid"],[[2505,2506],"disallowed"],[[2507,2509],"valid"],[[2510,2510],"valid"],[[2511,2518],"disallowed"],[[2519,2519],"valid"],[[2520,2523],"disallowed"],[[2524,2524],"mapped","ড়"],[[2525,2525],"mapped","ঢ়"],[[2526,2526],"disallowed"],[[2527,2527],"mapped","য়"],[[2528,2531],"valid"],[[2532,2533],"disallowed"],[[2534,2545],"valid"],[[2546,2554],"valid","","NV8"],[[2555,2555],"valid","","NV8"],[[2556,2556],"valid"],[[2557,2557],"valid","","NV8"],[[2558,2560],"disallowed"],[[2561,2561],"valid"],[[2562,2562],"valid"],[[2563,2563],"valid"],[[2564,2564],"disallowed"],[[2565,2570],"valid"],[[2571,2574],"disallowed"],[[2575,2576],"valid"],[[2577,2578],"disallowed"],[[2579,2600],"valid"],[[2601,2601],"disallowed"],[[2602,2608],"valid"],[[2609,2609],"disallowed"],[[2610,2610],"valid"],[[2611,2611],"mapped","ਲ਼"],[[2612,2612],"disallowed"],[[2613,2613],"valid"],[[2614,2614],"mapped","ਸ਼"],[[2615,2615],"disallowed"],[[2616,2617],"valid"],[[2618,2619],"disallowed"],[[2620,2620],"valid"],[[2621,2621],"disallowed"],[[2622,2626],"valid"],[[2627,2630],"disallowed"],[[2631,2632],"valid"],[[2633,2634],"disallowed"],[[2635,2637],"valid"],[[2638,2640],"disallowed"],[[2641,2641],"valid"],[[2642,2648],"disallowed"],[[2649,2649],"mapped","ਖ਼"],[[2650,2650],"mapped","ਗ਼"],[[2651,2651],"mapped","ਜ਼"],[[2652,2652],"valid"],[[2653,2653],"disallowed"],[[2654,2654],"mapped","ਫ਼"],[[2655,2661],"disallowed"],[[2662,2676],"valid"],[[2677,2677],"valid"],[[2678,2688],"disallowed"],[[2689,2691],"valid"],[[2692,2692],"disallowed"],[[2693,2699],"valid"],[[2700,2700],"valid"],[[2701,2701],"valid"],[[2702,2702],"disallowed"],[[2703,2705],"valid"],[[2706,2706],"disallowed"],[[2707,2728],"valid"],[[2729,2729],"disallowed"],[[2730,2736],"valid"],[[2737,2737],"disallowed"],[[2738,2739],"valid"],[[2740,2740],"disallowed"],[[2741,2745],"valid"],[[2746,2747],"disallowed"],[[2748,2757],"valid"],[[2758,2758],"disallowed"],[[2759,2761],"valid"],[[2762,2762],"disallowed"],[[2763,2765],"valid"],[[2766,2767],"disallowed"],[[2768,2768],"valid"],[[2769,2783],"disallowed"],[[2784,2784],"valid"],[[2785,2787],"valid"],[[2788,2789],"disallowed"],[[2790,2799],"valid"],[[2800,2800],"valid","","NV8"],[[2801,2801],"valid","","NV8"],[[2802,2808],"disallowed"],[[2809,2809],"valid"],[[2810,2815],"valid"],[[2816,2816],"disallowed"],[[2817,2819],"valid"],[[2820,2820],"disallowed"],[[2821,2828],"valid"],[[2829,2830],"disallowed"],[[2831,2832],"valid"],[[2833,2834],"disallowed"],[[2835,2856],"valid"],[[2857,2857],"disallowed"],[[2858,2864],"valid"],[[2865,2865],"disallowed"],[[2866,2867],"valid"],[[2868,2868],"disallowed"],[[2869,2869],"valid"],[[2870,2873],"valid"],[[2874,2875],"disallowed"],[[2876,2883],"valid"],[[2884,2884],"valid"],[[2885,2886],"disallowed"],[[2887,2888],"valid"],[[2889,2890],"disallowed"],[[2891,2893],"valid"],[[2894,2901],"disallowed"],[[2902,2903],"valid"],[[2904,2907],"disallowed"],[[2908,2908],"mapped","ଡ଼"],[[2909,2909],"mapped","ଢ଼"],[[2910,2910],"disallowed"],[[2911,2913],"valid"],[[2914,2915],"valid"],[[2916,2917],"disallowed"],[[2918,2927],"valid"],[[2928,2928],"valid","","NV8"],[[2929,2929],"valid"],[[2930,2935],"valid","","NV8"],[[2936,2945],"disallowed"],[[2946,2947],"valid"],[[2948,2948],"disallowed"],[[2949,2954],"valid"],[[2955,2957],"disallowed"],[[2958,2960],"valid"],[[2961,2961],"disallowed"],[[2962,2965],"valid"],[[2966,2968],"disallowed"],[[2969,2970],"valid"],[[2971,2971],"disallowed"],[[2972,2972],"valid"],[[2973,2973],"disallowed"],[[2974,2975],"valid"],[[2976,2978],"disallowed"],[[2979,2980],"valid"],[[2981,2983],"disallowed"],[[2984,2986],"valid"],[[2987,2989],"disallowed"],[[2990,2997],"valid"],[[2998,2998],"valid"],[[2999,3001],"valid"],[[3002,3005],"disallowed"],[[3006,3010],"valid"],[[3011,3013],"disallowed"],[[3014,3016],"valid"],[[3017,3017],"disallowed"],[[3018,3021],"valid"],[[3022,3023],"disallowed"],[[3024,3024],"valid"],[[3025,3030],"disallowed"],[[3031,3031],"valid"],[[3032,3045],"disallowed"],[[3046,3046],"valid"],[[3047,3055],"valid"],[[3056,3058],"valid","","NV8"],[[3059,3066],"valid","","NV8"],[[3067,3071],"disallowed"],[[3072,3072],"valid"],[[3073,3075],"valid"],[[3076,3076],"disallowed"],[[3077,3084],"valid"],[[3085,3085],"disallowed"],[[3086,3088],"valid"],[[3089,3089],"disallowed"],[[3090,3112],"valid"],[[3113,3113],"disallowed"],[[3114,3123],"valid"],[[3124,3124],"valid"],[[3125,3129],"valid"],[[3130,3132],"disallowed"],[[3133,3133],"valid"],[[3134,3140],"valid"],[[3141,3141],"disallowed"],[[3142,3144],"valid"],[[3145,3145],"disallowed"],[[3146,3149],"valid"],[[3150,3156],"disallowed"],[[3157,3158],"valid"],[[3159,3159],"disallowed"],[[3160,3161],"valid"],[[3162,3162],"valid"],[[3163,3167],"disallowed"],[[3168,3169],"valid"],[[3170,3171],"valid"],[[3172,3173],"disallowed"],[[3174,3183],"valid"],[[3184,3191],"disallowed"],[[3192,3199],"valid","","NV8"],[[3200,3200],"valid"],[[3201,3201],"valid"],[[3202,3203],"valid"],[[3204,3204],"disallowed"],[[3205,3212],"valid"],[[3213,3213],"disallowed"],[[3214,3216],"valid"],[[3217,3217],"disallowed"],[[3218,3240],"valid"],[[3241,3241],"disallowed"],[[3242,3251],"valid"],[[3252,3252],"disallowed"],[[3253,3257],"valid"],[[3258,3259],"disallowed"],[[3260,3261],"valid"],[[3262,3268],"valid"],[[3269,3269],"disallowed"],[[3270,3272],"valid"],[[3273,3273],"disallowed"],[[3274,3277],"valid"],[[3278,3284],"disallowed"],[[3285,3286],"valid"],[[3287,3293],"disallowed"],[[3294,3294],"valid"],[[3295,3295],"disallowed"],[[3296,3297],"valid"],[[3298,3299],"valid"],[[3300,3301],"disallowed"],[[3302,3311],"valid"],[[3312,3312],"disallowed"],[[3313,3314],"valid"],[[3315,3327],"disallowed"],[[3328,3328],"valid"],[[3329,3329],"valid"],[[3330,3331],"valid"],[[3332,3332],"disallowed"],[[3333,3340],"valid"],[[3341,3341],"disallowed"],[[3342,3344],"valid"],[[3345,3345],"disallowed"],[[3346,3368],"valid"],[[3369,3369],"valid"],[[3370,3385],"valid"],[[3386,3386],"valid"],[[3387,3388],"valid"],[[3389,3389],"valid"],[[3390,3395],"valid"],[[3396,3396],"valid"],[[3397,3397],"disallowed"],[[3398,3400],"valid"],[[3401,3401],"disallowed"],[[3402,3405],"valid"],[[3406,3406],"valid"],[[3407,3407],"valid","","NV8"],[[3408,3411],"disallowed"],[[3412,3414],"valid"],[[3415,3415],"valid"],[[3416,3422],"valid","","NV8"],[[3423,3423],"valid"],[[3424,3425],"valid"],[[3426,3427],"valid"],[[3428,3429],"disallowed"],[[3430,3439],"valid"],[[3440,3445],"valid","","NV8"],[[3446,3448],"valid","","NV8"],[[3449,3449],"valid","","NV8"],[[3450,3455],"valid"],[[3456,3457],"disallowed"],[[3458,3459],"valid"],[[3460,3460],"disallowed"],[[3461,3478],"valid"],[[3479,3481],"disallowed"],[[3482,3505],"valid"],[[3506,3506],"disallowed"],[[3507,3515],"valid"],[[3516,3516],"disallowed"],[[3517,3517],"valid"],[[3518,3519],"disallowed"],[[3520,3526],"valid"],[[3527,3529],"disallowed"],[[3530,3530],"valid"],[[3531,3534],"disallowed"],[[3535,3540],"valid"],[[3541,3541],"disallowed"],[[3542,3542],"valid"],[[3543,3543],"disallowed"],[[3544,3551],"valid"],[[3552,3557],"disallowed"],[[3558,3567],"valid"],[[3568,3569],"disallowed"],[[3570,3571],"valid"],[[3572,3572],"valid","","NV8"],[[3573,3584],"disallowed"],[[3585,3634],"valid"],[[3635,3635],"mapped","ํา"],[[3636,3642],"valid"],[[3643,3646],"disallowed"],[[3647,3647],"valid","","NV8"],[[3648,3662],"valid"],[[3663,3663],"valid","","NV8"],[[3664,3673],"valid"],[[3674,3675],"valid","","NV8"],[[3676,3712],"disallowed"],[[3713,3714],"valid"],[[3715,3715],"disallowed"],[[3716,3716],"valid"],[[3717,3718],"disallowed"],[[3719,3720],"valid"],[[3721,3721],"disallowed"],[[3722,3722],"valid"],[[3723,3724],"disallowed"],[[3725,3725],"valid"],[[3726,3731],"disallowed"],[[3732,3735],"valid"],[[3736,3736],"disallowed"],[[3737,3743],"valid"],[[3744,3744],"disallowed"],[[3745,3747],"valid"],[[3748,3748],"disallowed"],[[3749,3749],"valid"],[[3750,3750],"disallowed"],[[3751,3751],"valid"],[[3752,3753],"disallowed"],[[3754,3755],"valid"],[[3756,3756],"disallowed"],[[3757,3762],"valid"],[[3763,3763],"mapped","ໍາ"],[[3764,3769],"valid"],[[3770,3770],"disallowed"],[[3771,3773],"valid"],[[3774,3775],"disallowed"],[[3776,3780],"valid"],[[3781,3781],"disallowed"],[[3782,3782],"valid"],[[3783,3783],"disallowed"],[[3784,3789],"valid"],[[3790,3791],"disallowed"],[[3792,3801],"valid"],[[3802,3803],"disallowed"],[[3804,3804],"mapped","ຫນ"],[[3805,3805],"mapped","ຫມ"],[[3806,3807],"valid"],[[3808,3839],"disallowed"],[[3840,3840],"valid"],[[3841,3850],"valid","","NV8"],[[3851,3851],"valid"],[[3852,3852],"mapped","་"],[[3853,3863],"valid","","NV8"],[[3864,3865],"valid"],[[3866,3871],"valid","","NV8"],[[3872,3881],"valid"],[[3882,3892],"valid","","NV8"],[[3893,3893],"valid"],[[3894,3894],"valid","","NV8"],[[3895,3895],"valid"],[[3896,3896],"valid","","NV8"],[[3897,3897],"valid"],[[3898,3901],"valid","","NV8"],[[3902,3906],"valid"],[[3907,3907],"mapped","གྷ"],[[3908,3911],"valid"],[[3912,3912],"disallowed"],[[3913,3916],"valid"],[[3917,3917],"mapped","ཌྷ"],[[3918,3921],"valid"],[[3922,3922],"mapped","དྷ"],[[3923,3926],"valid"],[[3927,3927],"mapped","བྷ"],[[3928,3931],"valid"],[[3932,3932],"mapped","ཛྷ"],[[3933,3944],"valid"],[[3945,3945],"mapped","ཀྵ"],[[3946,3946],"valid"],[[3947,3948],"valid"],[[3949,3952],"disallowed"],[[3953,3954],"valid"],[[3955,3955],"mapped","ཱི"],[[3956,3956],"valid"],[[3957,3957],"mapped","ཱུ"],[[3958,3958],"mapped","ྲྀ"],[[3959,3959],"mapped","ྲཱྀ"],[[3960,3960],"mapped","ླྀ"],[[3961,3961],"mapped","ླཱྀ"],[[3962,3968],"valid"],[[3969,3969],"mapped","ཱྀ"],[[3970,3972],"valid"],[[3973,3973],"valid","","NV8"],[[3974,3979],"valid"],[[3980,3983],"valid"],[[3984,3986],"valid"],[[3987,3987],"mapped","ྒྷ"],[[3988,3989],"valid"],[[3990,3990],"valid"],[[3991,3991],"valid"],[[3992,3992],"disallowed"],[[3993,3996],"valid"],[[3997,3997],"mapped","ྜྷ"],[[3998,4001],"valid"],[[4002,4002],"mapped","ྡྷ"],[[4003,4006],"valid"],[[4007,4007],"mapped","ྦྷ"],[[4008,4011],"valid"],[[4012,4012],"mapped","ྫྷ"],[[4013,4013],"valid"],[[4014,4016],"valid"],[[4017,4023],"valid"],[[4024,4024],"valid"],[[4025,4025],"mapped","ྐྵ"],[[4026,4028],"valid"],[[4029,4029],"disallowed"],[[4030,4037],"valid","","NV8"],[[4038,4038],"valid"],[[4039,4044],"valid","","NV8"],[[4045,4045],"disallowed"],[[4046,4046],"valid","","NV8"],[[4047,4047],"valid","","NV8"],[[4048,4049],"valid","","NV8"],[[4050,4052],"valid","","NV8"],[[4053,4056],"valid","","NV8"],[[4057,4058],"valid","","NV8"],[[4059,4095],"disallowed"],[[4096,4129],"valid"],[[4130,4130],"valid"],[[4131,4135],"valid"],[[4136,4136],"valid"],[[4137,4138],"valid"],[[4139,4139],"valid"],[[4140,4146],"valid"],[[4147,4149],"valid"],[[4150,4153],"valid"],[[4154,4159],"valid"],[[4160,4169],"valid"],[[4170,4175],"valid","","NV8"],[[4176,4185],"valid"],[[4186,4249],"valid"],[[4250,4253],"valid"],[[4254,4255],"valid","","NV8"],[[4256,4293],"disallowed"],[[4294,4294],"disallowed"],[[4295,4295],"mapped","ⴧ"],[[4296,4300],"disallowed"],[[4301,4301],"mapped","ⴭ"],[[4302,4303],"disallowed"],[[4304,4342],"valid"],[[4343,4344],"valid"],[[4345,4346],"valid"],[[4347,4347],"valid","","NV8"],[[4348,4348],"mapped","ნ"],[[4349,4351],"valid"],[[4352,4441],"valid","","NV8"],[[4442,4446],"valid","","NV8"],[[4447,4448],"disallowed"],[[4449,4514],"valid","","NV8"],[[4515,4519],"valid","","NV8"],[[4520,4601],"valid","","NV8"],[[4602,4607],"valid","","NV8"],[[4608,4614],"valid"],[[4615,4615],"valid"],[[4616,4678],"valid"],[[4679,4679],"valid"],[[4680,4680],"valid"],[[4681,4681],"disallowed"],[[4682,4685],"valid"],[[4686,4687],"disallowed"],[[4688,4694],"valid"],[[4695,4695],"disallowed"],[[4696,4696],"valid"],[[4697,4697],"disallowed"],[[4698,4701],"valid"],[[4702,4703],"disallowed"],[[4704,4742],"valid"],[[4743,4743],"valid"],[[4744,4744],"valid"],[[4745,4745],"disallowed"],[[4746,4749],"valid"],[[4750,4751],"disallowed"],[[4752,4782],"valid"],[[4783,4783],"valid"],[[4784,4784],"valid"],[[4785,4785],"disallowed"],[[4786,4789],"valid"],[[4790,4791],"disallowed"],[[4792,4798],"valid"],[[4799,4799],"disallowed"],[[4800,4800],"valid"],[[4801,4801],"disallowed"],[[4802,4805],"valid"],[[4806,4807],"disallowed"],[[4808,4814],"valid"],[[4815,4815],"valid"],[[4816,4822],"valid"],[[4823,4823],"disallowed"],[[4824,4846],"valid"],[[4847,4847],"valid"],[[4848,4878],"valid"],[[4879,4879],"valid"],[[4880,4880],"valid"],[[4881,4881],"disallowed"],[[4882,4885],"valid"],[[4886,4887],"disallowed"],[[4888,4894],"valid"],[[4895,4895],"valid"],[[4896,4934],"valid"],[[4935,4935],"valid"],[[4936,4954],"valid"],[[4955,4956],"disallowed"],[[4957,4958],"valid"],[[4959,4959],"valid"],[[4960,4960],"valid","","NV8"],[[4961,4988],"valid","","NV8"],[[4989,4991],"disallowed"],[[4992,5007],"valid"],[[5008,5017],"valid","","NV8"],[[5018,5023],"disallowed"],[[5024,5108],"valid"],[[5109,5109],"valid"],[[5110,5111],"disallowed"],[[5112,5112],"mapped","Ᏸ"],[[5113,5113],"mapped","Ᏹ"],[[5114,5114],"mapped","Ᏺ"],[[5115,5115],"mapped","Ᏻ"],[[5116,5116],"mapped","Ᏼ"],[[5117,5117],"mapped","Ᏽ"],[[5118,5119],"disallowed"],[[5120,5120],"valid","","NV8"],[[5121,5740],"valid"],[[5741,5742],"valid","","NV8"],[[5743,5750],"valid"],[[5751,5759],"valid"],[[5760,5760],"disallowed"],[[5761,5786],"valid"],[[5787,5788],"valid","","NV8"],[[5789,5791],"disallowed"],[[5792,5866],"valid"],[[5867,5872],"valid","","NV8"],[[5873,5880],"valid"],[[5881,5887],"disallowed"],[[5888,5900],"valid"],[[5901,5901],"disallowed"],[[5902,5908],"valid"],[[5909,5919],"disallowed"],[[5920,5940],"valid"],[[5941,5942],"valid","","NV8"],[[5943,5951],"disallowed"],[[5952,5971],"valid"],[[5972,5983],"disallowed"],[[5984,5996],"valid"],[[5997,5997],"disallowed"],[[5998,6000],"valid"],[[6001,6001],"disallowed"],[[6002,6003],"valid"],[[6004,6015],"disallowed"],[[6016,6067],"valid"],[[6068,6069],"disallowed"],[[6070,6099],"valid"],[[6100,6102],"valid","","NV8"],[[6103,6103],"valid"],[[6104,6107],"valid","","NV8"],[[6108,6108],"valid"],[[6109,6109],"valid"],[[6110,6111],"disallowed"],[[6112,6121],"valid"],[[6122,6127],"disallowed"],[[6128,6137],"valid","","NV8"],[[6138,6143],"disallowed"],[[6144,6149],"valid","","NV8"],[[6150,6150],"disallowed"],[[6151,6154],"valid","","NV8"],[[6155,6157],"ignored"],[[6158,6158],"disallowed"],[[6159,6159],"disallowed"],[[6160,6169],"valid"],[[6170,6175],"disallowed"],[[6176,6263],"valid"],[[6264,6271],"disallowed"],[[6272,6313],"valid"],[[6314,6314],"valid"],[[6315,6319],"disallowed"],[[6320,6389],"valid"],[[6390,6399],"disallowed"],[[6400,6428],"valid"],[[6429,6430],"valid"],[[6431,6431],"disallowed"],[[6432,6443],"valid"],[[6444,6447],"disallowed"],[[6448,6459],"valid"],[[6460,6463],"disallowed"],[[6464,6464],"valid","","NV8"],[[6465,6467],"disallowed"],[[6468,6469],"valid","","NV8"],[[6470,6509],"valid"],[[6510,6511],"disallowed"],[[6512,6516],"valid"],[[6517,6527],"disallowed"],[[6528,6569],"valid"],[[6570,6571],"valid"],[[6572,6575],"disallowed"],[[6576,6601],"valid"],[[6602,6607],"disallowed"],[[6608,6617],"valid"],[[6618,6618],"valid","","XV8"],[[6619,6621],"disallowed"],[[6622,6623],"valid","","NV8"],[[6624,6655],"valid","","NV8"],[[6656,6683],"valid"],[[6684,6685],"disallowed"],[[6686,6687],"valid","","NV8"],[[6688,6750],"valid"],[[6751,6751],"disallowed"],[[6752,6780],"valid"],[[6781,6782],"disallowed"],[[6783,6793],"valid"],[[6794,6799],"disallowed"],[[6800,6809],"valid"],[[6810,6815],"disallowed"],[[6816,6822],"valid","","NV8"],[[6823,6823],"valid"],[[6824,6829],"valid","","NV8"],[[6830,6831],"disallowed"],[[6832,6845],"valid"],[[6846,6846],"valid","","NV8"],[[6847,6911],"disallowed"],[[6912,6987],"valid"],[[6988,6991],"disallowed"],[[6992,7001],"valid"],[[7002,7018],"valid","","NV8"],[[7019,7027],"valid"],[[7028,7036],"valid","","NV8"],[[7037,7039],"disallowed"],[[7040,7082],"valid"],[[7083,7085],"valid"],[[7086,7097],"valid"],[[7098,7103],"valid"],[[7104,7155],"valid"],[[7156,7163],"disallowed"],[[7164,7167],"valid","","NV8"],[[7168,7223],"valid"],[[7224,7226],"disallowed"],[[7227,7231],"valid","","NV8"],[[7232,7241],"valid"],[[7242,7244],"disallowed"],[[7245,7293],"valid"],[[7294,7295],"valid","","NV8"],[[7296,7296],"mapped","в"],[[7297,7297],"mapped","д"],[[7298,7298],"mapped","о"],[[7299,7299],"mapped","с"],[[7300,7301],"mapped","т"],[[7302,7302],"mapped","ъ"],[[7303,7303],"mapped","ѣ"],[[7304,7304],"mapped","ꙋ"],[[7305,7359],"disallowed"],[[7360,7367],"valid","","NV8"],[[7368,7375],"disallowed"],[[7376,7378],"valid"],[[7379,7379],"valid","","NV8"],[[7380,7410],"valid"],[[7411,7414],"valid"],[[7415,7415],"valid"],[[7416,7417],"valid"],[[7418,7423],"disallowed"],[[7424,7467],"valid"],[[7468,7468],"mapped","a"],[[7469,7469],"mapped","æ"],[[7470,7470],"mapped","b"],[[7471,7471],"valid"],[[7472,7472],"mapped","d"],[[7473,7473],"mapped","e"],[[7474,7474],"mapped","ǝ"],[[7475,7475],"mapped","g"],[[7476,7476],"mapped","h"],[[7477,7477],"mapped","i"],[[7478,7478],"mapped","j"],[[7479,7479],"mapped","k"],[[7480,7480],"mapped","l"],[[7481,7481],"mapped","m"],[[7482,7482],"mapped","n"],[[7483,7483],"valid"],[[7484,7484],"mapped","o"],[[7485,7485],"mapped","ȣ"],[[7486,7486],"mapped","p"],[[7487,7487],"mapped","r"],[[7488,7488],"mapped","t"],[[7489,7489],"mapped","u"],[[7490,7490],"mapped","w"],[[7491,7491],"mapped","a"],[[7492,7492],"mapped","ɐ"],[[7493,7493],"mapped","ɑ"],[[7494,7494],"mapped","ᴂ"],[[7495,7495],"mapped","b"],[[7496,7496],"mapped","d"],[[7497,7497],"mapped","e"],[[7498,7498],"mapped","ə"],[[7499,7499],"mapped","ɛ"],[[7500,7500],"mapped","ɜ"],[[7501,7501],"mapped","g"],[[7502,7502],"valid"],[[7503,7503],"mapped","k"],[[7504,7504],"mapped","m"],[[7505,7505],"mapped","ŋ"],[[7506,7506],"mapped","o"],[[7507,7507],"mapped","ɔ"],[[7508,7508],"mapped","ᴖ"],[[7509,7509],"mapped","ᴗ"],[[7510,7510],"mapped","p"],[[7511,7511],"mapped","t"],[[7512,7512],"mapped","u"],[[7513,7513],"mapped","ᴝ"],[[7514,7514],"mapped","ɯ"],[[7515,7515],"mapped","v"],[[7516,7516],"mapped","ᴥ"],[[7517,7517],"mapped","β"],[[7518,7518],"mapped","γ"],[[7519,7519],"mapped","δ"],[[7520,7520],"mapped","φ"],[[7521,7521],"mapped","χ"],[[7522,7522],"mapped","i"],[[7523,7523],"mapped","r"],[[7524,7524],"mapped","u"],[[7525,7525],"mapped","v"],[[7526,7526],"mapped","β"],[[7527,7527],"mapped","γ"],[[7528,7528],"mapped","ρ"],[[7529,7529],"mapped","φ"],[[7530,7530],"mapped","χ"],[[7531,7531],"valid"],[[7532,7543],"valid"],[[7544,7544],"mapped","н"],[[7545,7578],"valid"],[[7579,7579],"mapped","ɒ"],[[7580,7580],"mapped","c"],[[7581,7581],"mapped","ɕ"],[[7582,7582],"mapped","ð"],[[7583,7583],"mapped","ɜ"],[[7584,7584],"mapped","f"],[[7585,7585],"mapped","ɟ"],[[7586,7586],"mapped","ɡ"],[[7587,7587],"mapped","ɥ"],[[7588,7588],"mapped","ɨ"],[[7589,7589],"mapped","ɩ"],[[7590,7590],"mapped","ɪ"],[[7591,7591],"mapped","ᵻ"],[[7592,7592],"mapped","ʝ"],[[7593,7593],"mapped","ɭ"],[[7594,7594],"mapped","ᶅ"],[[7595,7595],"mapped","ʟ"],[[7596,7596],"mapped","ɱ"],[[7597,7597],"mapped","ɰ"],[[7598,7598],"mapped","ɲ"],[[7599,7599],"mapped","ɳ"],[[7600,7600],"mapped","ɴ"],[[7601,7601],"mapped","ɵ"],[[7602,7602],"mapped","ɸ"],[[7603,7603],"mapped","ʂ"],[[7604,7604],"mapped","ʃ"],[[7605,7605],"mapped","ƫ"],[[7606,7606],"mapped","ʉ"],[[7607,7607],"mapped","ʊ"],[[7608,7608],"mapped","ᴜ"],[[7609,7609],"mapped","ʋ"],[[7610,7610],"mapped","ʌ"],[[7611,7611],"mapped","z"],[[7612,7612],"mapped","ʐ"],[[7613,7613],"mapped","ʑ"],[[7614,7614],"mapped","ʒ"],[[7615,7615],"mapped","θ"],[[7616,7619],"valid"],[[7620,7626],"valid"],[[7627,7654],"valid"],[[7655,7669],"valid"],[[7670,7673],"valid"],[[7674,7674],"disallowed"],[[7675,7675],"valid"],[[7676,7676],"valid"],[[7677,7677],"valid"],[[7678,7679],"valid"],[[7680,7680],"mapped","ḁ"],[[7681,7681],"valid"],[[7682,7682],"mapped","ḃ"],[[7683,7683],"valid"],[[7684,7684],"mapped","ḅ"],[[7685,7685],"valid"],[[7686,7686],"mapped","ḇ"],[[7687,7687],"valid"],[[7688,7688],"mapped","ḉ"],[[7689,7689],"valid"],[[7690,7690],"mapped","ḋ"],[[7691,7691],"valid"],[[7692,7692],"mapped","ḍ"],[[7693,7693],"valid"],[[7694,7694],"mapped","ḏ"],[[7695,7695],"valid"],[[7696,7696],"mapped","ḑ"],[[7697,7697],"valid"],[[7698,7698],"mapped","ḓ"],[[7699,7699],"valid"],[[7700,7700],"mapped","ḕ"],[[7701,7701],"valid"],[[7702,7702],"mapped","ḗ"],[[7703,7703],"valid"],[[7704,7704],"mapped","ḙ"],[[7705,7705],"valid"],[[7706,7706],"mapped","ḛ"],[[7707,7707],"valid"],[[7708,7708],"mapped","ḝ"],[[7709,7709],"valid"],[[7710,7710],"mapped","ḟ"],[[7711,7711],"valid"],[[7712,7712],"mapped","ḡ"],[[7713,7713],"valid"],[[7714,7714],"mapped","ḣ"],[[7715,7715],"valid"],[[7716,7716],"mapped","ḥ"],[[7717,7717],"valid"],[[7718,7718],"mapped","ḧ"],[[7719,7719],"valid"],[[7720,7720],"mapped","ḩ"],[[7721,7721],"valid"],[[7722,7722],"mapped","ḫ"],[[7723,7723],"valid"],[[7724,7724],"mapped","ḭ"],[[7725,7725],"valid"],[[7726,7726],"mapped","ḯ"],[[7727,7727],"valid"],[[7728,7728],"mapped","ḱ"],[[7729,7729],"valid"],[[7730,7730],"mapped","ḳ"],[[7731,7731],"valid"],[[7732,7732],"mapped","ḵ"],[[7733,7733],"valid"],[[7734,7734],"mapped","ḷ"],[[7735,7735],"valid"],[[7736,7736],"mapped","ḹ"],[[7737,7737],"valid"],[[7738,7738],"mapped","ḻ"],[[7739,7739],"valid"],[[7740,7740],"mapped","ḽ"],[[7741,7741],"valid"],[[7742,7742],"mapped","ḿ"],[[7743,7743],"valid"],[[7744,7744],"mapped","ṁ"],[[7745,7745],"valid"],[[7746,7746],"mapped","ṃ"],[[7747,7747],"valid"],[[7748,7748],"mapped","ṅ"],[[7749,7749],"valid"],[[7750,7750],"mapped","ṇ"],[[7751,7751],"valid"],[[7752,7752],"mapped","ṉ"],[[7753,7753],"valid"],[[7754,7754],"mapped","ṋ"],[[7755,7755],"valid"],[[7756,7756],"mapped","ṍ"],[[7757,7757],"valid"],[[7758,7758],"mapped","ṏ"],[[7759,7759],"valid"],[[7760,7760],"mapped","ṑ"],[[7761,7761],"valid"],[[7762,7762],"mapped","ṓ"],[[7763,7763],"valid"],[[7764,7764],"mapped","ṕ"],[[7765,7765],"valid"],[[7766,7766],"mapped","ṗ"],[[7767,7767],"valid"],[[7768,7768],"mapped","ṙ"],[[7769,7769],"valid"],[[7770,7770],"mapped","ṛ"],[[7771,7771],"valid"],[[7772,7772],"mapped","ṝ"],[[7773,7773],"valid"],[[7774,7774],"mapped","ṟ"],[[7775,7775],"valid"],[[7776,7776],"mapped","ṡ"],[[7777,7777],"valid"],[[7778,7778],"mapped","ṣ"],[[7779,7779],"valid"],[[7780,7780],"mapped","ṥ"],[[7781,7781],"valid"],[[7782,7782],"mapped","ṧ"],[[7783,7783],"valid"],[[7784,7784],"mapped","ṩ"],[[7785,7785],"valid"],[[7786,7786],"mapped","ṫ"],[[7787,7787],"valid"],[[7788,7788],"mapped","ṭ"],[[7789,7789],"valid"],[[7790,7790],"mapped","ṯ"],[[7791,7791],"valid"],[[7792,7792],"mapped","ṱ"],[[7793,7793],"valid"],[[7794,7794],"mapped","ṳ"],[[7795,7795],"valid"],[[7796,7796],"mapped","ṵ"],[[7797,7797],"valid"],[[7798,7798],"mapped","ṷ"],[[7799,7799],"valid"],[[7800,7800],"mapped","ṹ"],[[7801,7801],"valid"],[[7802,7802],"mapped","ṻ"],[[7803,7803],"valid"],[[7804,7804],"mapped","ṽ"],[[7805,7805],"valid"],[[7806,7806],"mapped","ṿ"],[[7807,7807],"valid"],[[7808,7808],"mapped","ẁ"],[[7809,7809],"valid"],[[7810,7810],"mapped","ẃ"],[[7811,7811],"valid"],[[7812,7812],"mapped","ẅ"],[[7813,7813],"valid"],[[7814,7814],"mapped","ẇ"],[[7815,7815],"valid"],[[7816,7816],"mapped","ẉ"],[[7817,7817],"valid"],[[7818,7818],"mapped","ẋ"],[[7819,7819],"valid"],[[7820,7820],"mapped","ẍ"],[[7821,7821],"valid"],[[7822,7822],"mapped","ẏ"],[[7823,7823],"valid"],[[7824,7824],"mapped","ẑ"],[[7825,7825],"valid"],[[7826,7826],"mapped","ẓ"],[[7827,7827],"valid"],[[7828,7828],"mapped","ẕ"],[[7829,7833],"valid"],[[7834,7834],"mapped","aʾ"],[[7835,7835],"mapped","ṡ"],[[7836,7837],"valid"],[[7838,7838],"mapped","ss"],[[7839,7839],"valid"],[[7840,7840],"mapped","ạ"],[[7841,7841],"valid"],[[7842,7842],"mapped","ả"],[[7843,7843],"valid"],[[7844,7844],"mapped","ấ"],[[7845,7845],"valid"],[[7846,7846],"mapped","ầ"],[[7847,7847],"valid"],[[7848,7848],"mapped","ẩ"],[[7849,7849],"valid"],[[7850,7850],"mapped","ẫ"],[[7851,7851],"valid"],[[7852,7852],"mapped","ậ"],[[7853,7853],"valid"],[[7854,7854],"mapped","ắ"],[[7855,7855],"valid"],[[7856,7856],"mapped","ằ"],[[7857,7857],"valid"],[[7858,7858],"mapped","ẳ"],[[7859,7859],"valid"],[[7860,7860],"mapped","ẵ"],[[7861,7861],"valid"],[[7862,7862],"mapped","ặ"],[[7863,7863],"valid"],[[7864,7864],"mapped","ẹ"],[[7865,7865],"valid"],[[7866,7866],"mapped","ẻ"],[[7867,7867],"valid"],[[7868,7868],"mapped","ẽ"],[[7869,7869],"valid"],[[7870,7870],"mapped","ế"],[[7871,7871],"valid"],[[7872,7872],"mapped","ề"],[[7873,7873],"valid"],[[7874,7874],"mapped","ể"],[[7875,7875],"valid"],[[7876,7876],"mapped","ễ"],[[7877,7877],"valid"],[[7878,7878],"mapped","ệ"],[[7879,7879],"valid"],[[7880,7880],"mapped","ỉ"],[[7881,7881],"valid"],[[7882,7882],"mapped","ị"],[[7883,7883],"valid"],[[7884,7884],"mapped","ọ"],[[7885,7885],"valid"],[[7886,7886],"mapped","ỏ"],[[7887,7887],"valid"],[[7888,7888],"mapped","ố"],[[7889,7889],"valid"],[[7890,7890],"mapped","ồ"],[[7891,7891],"valid"],[[7892,7892],"mapped","ổ"],[[7893,7893],"valid"],[[7894,7894],"mapped","ỗ"],[[7895,7895],"valid"],[[7896,7896],"mapped","ộ"],[[7897,7897],"valid"],[[7898,7898],"mapped","ớ"],[[7899,7899],"valid"],[[7900,7900],"mapped","ờ"],[[7901,7901],"valid"],[[7902,7902],"mapped","ở"],[[7903,7903],"valid"],[[7904,7904],"mapped","ỡ"],[[7905,7905],"valid"],[[7906,7906],"mapped","ợ"],[[7907,7907],"valid"],[[7908,7908],"mapped","ụ"],[[7909,7909],"valid"],[[7910,7910],"mapped","ủ"],[[7911,7911],"valid"],[[7912,7912],"mapped","ứ"],[[7913,7913],"valid"],[[7914,7914],"mapped","ừ"],[[7915,7915],"valid"],[[7916,7916],"mapped","ử"],[[7917,7917],"valid"],[[7918,7918],"mapped","ữ"],[[7919,7919],"valid"],[[7920,7920],"mapped","ự"],[[7921,7921],"valid"],[[7922,7922],"mapped","ỳ"],[[7923,7923],"valid"],[[7924,7924],"mapped","ỵ"],[[7925,7925],"valid"],[[7926,7926],"mapped","ỷ"],[[7927,7927],"valid"],[[7928,7928],"mapped","ỹ"],[[7929,7929],"valid"],[[7930,7930],"mapped","ỻ"],[[7931,7931],"valid"],[[7932,7932],"mapped","ỽ"],[[7933,7933],"valid"],[[7934,7934],"mapped","ỿ"],[[7935,7935],"valid"],[[7936,7943],"valid"],[[7944,7944],"mapped","ἀ"],[[7945,7945],"mapped","ἁ"],[[7946,7946],"mapped","ἂ"],[[7947,7947],"mapped","ἃ"],[[7948,7948],"mapped","ἄ"],[[7949,7949],"mapped","ἅ"],[[7950,7950],"mapped","ἆ"],[[7951,7951],"mapped","ἇ"],[[7952,7957],"valid"],[[7958,7959],"disallowed"],[[7960,7960],"mapped","ἐ"],[[7961,7961],"mapped","ἑ"],[[7962,7962],"mapped","ἒ"],[[7963,7963],"mapped","ἓ"],[[7964,7964],"mapped","ἔ"],[[7965,7965],"mapped","ἕ"],[[7966,7967],"disallowed"],[[7968,7975],"valid"],[[7976,7976],"mapped","ἠ"],[[7977,7977],"mapped","ἡ"],[[7978,7978],"mapped","ἢ"],[[7979,7979],"mapped","ἣ"],[[7980,7980],"mapped","ἤ"],[[7981,7981],"mapped","ἥ"],[[7982,7982],"mapped","ἦ"],[[7983,7983],"mapped","ἧ"],[[7984,7991],"valid"],[[7992,7992],"mapped","ἰ"],[[7993,7993],"mapped","ἱ"],[[7994,7994],"mapped","ἲ"],[[7995,7995],"mapped","ἳ"],[[7996,7996],"mapped","ἴ"],[[7997,7997],"mapped","ἵ"],[[7998,7998],"mapped","ἶ"],[[7999,7999],"mapped","ἷ"],[[8000,8005],"valid"],[[8006,8007],"disallowed"],[[8008,8008],"mapped","ὀ"],[[8009,8009],"mapped","ὁ"],[[8010,8010],"mapped","ὂ"],[[8011,8011],"mapped","ὃ"],[[8012,8012],"mapped","ὄ"],[[8013,8013],"mapped","ὅ"],[[8014,8015],"disallowed"],[[8016,8023],"valid"],[[8024,8024],"disallowed"],[[8025,8025],"mapped","ὑ"],[[8026,8026],"disallowed"],[[8027,8027],"mapped","ὓ"],[[8028,8028],"disallowed"],[[8029,8029],"mapped","ὕ"],[[8030,8030],"disallowed"],[[8031,8031],"mapped","ὗ"],[[8032,8039],"valid"],[[8040,8040],"mapped","ὠ"],[[8041,8041],"mapped","ὡ"],[[8042,8042],"mapped","ὢ"],[[8043,8043],"mapped","ὣ"],[[8044,8044],"mapped","ὤ"],[[8045,8045],"mapped","ὥ"],[[8046,8046],"mapped","ὦ"],[[8047,8047],"mapped","ὧ"],[[8048,8048],"valid"],[[8049,8049],"mapped","ά"],[[8050,8050],"valid"],[[8051,8051],"mapped","έ"],[[8052,8052],"valid"],[[8053,8053],"mapped","ή"],[[8054,8054],"valid"],[[8055,8055],"mapped","ί"],[[8056,8056],"valid"],[[8057,8057],"mapped","ό"],[[8058,8058],"valid"],[[8059,8059],"mapped","ύ"],[[8060,8060],"valid"],[[8061,8061],"mapped","ώ"],[[8062,8063],"disallowed"],[[8064,8064],"mapped","ἀι"],[[8065,8065],"mapped","ἁι"],[[8066,8066],"mapped","ἂι"],[[8067,8067],"mapped","ἃι"],[[8068,8068],"mapped","ἄι"],[[8069,8069],"mapped","ἅι"],[[8070,8070],"mapped","ἆι"],[[8071,8071],"mapped","ἇι"],[[8072,8072],"mapped","ἀι"],[[8073,8073],"mapped","ἁι"],[[8074,8074],"mapped","ἂι"],[[8075,8075],"mapped","ἃι"],[[8076,8076],"mapped","ἄι"],[[8077,8077],"mapped","ἅι"],[[8078,8078],"mapped","ἆι"],[[8079,8079],"mapped","ἇι"],[[8080,8080],"mapped","ἠι"],[[8081,8081],"mapped","ἡι"],[[8082,8082],"mapped","ἢι"],[[8083,8083],"mapped","ἣι"],[[8084,8084],"mapped","ἤι"],[[8085,8085],"mapped","ἥι"],[[8086,8086],"mapped","ἦι"],[[8087,8087],"mapped","ἧι"],[[8088,8088],"mapped","ἠι"],[[8089,8089],"mapped","ἡι"],[[8090,8090],"mapped","ἢι"],[[8091,8091],"mapped","ἣι"],[[8092,8092],"mapped","ἤι"],[[8093,8093],"mapped","ἥι"],[[8094,8094],"mapped","ἦι"],[[8095,8095],"mapped","ἧι"],[[8096,8096],"mapped","ὠι"],[[8097,8097],"mapped","ὡι"],[[8098,8098],"mapped","ὢι"],[[8099,8099],"mapped","ὣι"],[[8100,8100],"mapped","ὤι"],[[8101,8101],"mapped","ὥι"],[[8102,8102],"mapped","ὦι"],[[8103,8103],"mapped","ὧι"],[[8104,8104],"mapped","ὠι"],[[8105,8105],"mapped","ὡι"],[[8106,8106],"mapped","ὢι"],[[8107,8107],"mapped","ὣι"],[[8108,8108],"mapped","ὤι"],[[8109,8109],"mapped","ὥι"],[[8110,8110],"mapped","ὦι"],[[8111,8111],"mapped","ὧι"],[[8112,8113],"valid"],[[8114,8114],"mapped","ὰι"],[[8115,8115],"mapped","αι"],[[8116,8116],"mapped","άι"],[[8117,8117],"disallowed"],[[8118,8118],"valid"],[[8119,8119],"mapped","ᾶι"],[[8120,8120],"mapped","ᾰ"],[[8121,8121],"mapped","ᾱ"],[[8122,8122],"mapped","ὰ"],[[8123,8123],"mapped","ά"],[[8124,8124],"mapped","αι"],[[8125,8125],"disallowed_STD3_mapped"," ̓"],[[8126,8126],"mapped","ι"],[[8127,8127],"disallowed_STD3_mapped"," ̓"],[[8128,8128],"disallowed_STD3_mapped"," ͂"],[[8129,8129],"disallowed_STD3_mapped"," ̈͂"],[[8130,8130],"mapped","ὴι"],[[8131,8131],"mapped","ηι"],[[8132,8132],"mapped","ήι"],[[8133,8133],"disallowed"],[[8134,8134],"valid"],[[8135,8135],"mapped","ῆι"],[[8136,8136],"mapped","ὲ"],[[8137,8137],"mapped","έ"],[[8138,8138],"mapped","ὴ"],[[8139,8139],"mapped","ή"],[[8140,8140],"mapped","ηι"],[[8141,8141],"disallowed_STD3_mapped"," ̓̀"],[[8142,8142],"disallowed_STD3_mapped"," ̓́"],[[8143,8143],"disallowed_STD3_mapped"," ̓͂"],[[8144,8146],"valid"],[[8147,8147],"mapped","ΐ"],[[8148,8149],"disallowed"],[[8150,8151],"valid"],[[8152,8152],"mapped","ῐ"],[[8153,8153],"mapped","ῑ"],[[8154,8154],"mapped","ὶ"],[[8155,8155],"mapped","ί"],[[8156,8156],"disallowed"],[[8157,8157],"disallowed_STD3_mapped"," ̔̀"],[[8158,8158],"disallowed_STD3_mapped"," ̔́"],[[8159,8159],"disallowed_STD3_mapped"," ̔͂"],[[8160,8162],"valid"],[[8163,8163],"mapped","ΰ"],[[8164,8167],"valid"],[[8168,8168],"mapped","ῠ"],[[8169,8169],"mapped","ῡ"],[[8170,8170],"mapped","ὺ"],[[8171,8171],"mapped","ύ"],[[8172,8172],"mapped","ῥ"],[[8173,8173],"disallowed_STD3_mapped"," ̈̀"],[[8174,8174],"disallowed_STD3_mapped"," ̈́"],[[8175,8175],"disallowed_STD3_mapped","`"],[[8176,8177],"disallowed"],[[8178,8178],"mapped","ὼι"],[[8179,8179],"mapped","ωι"],[[8180,8180],"mapped","ώι"],[[8181,8181],"disallowed"],[[8182,8182],"valid"],[[8183,8183],"mapped","ῶι"],[[8184,8184],"mapped","ὸ"],[[8185,8185],"mapped","ό"],[[8186,8186],"mapped","ὼ"],[[8187,8187],"mapped","ώ"],[[8188,8188],"mapped","ωι"],[[8189,8189],"disallowed_STD3_mapped"," ́"],[[8190,8190],"disallowed_STD3_mapped"," ̔"],[[8191,8191],"disallowed"],[[8192,8202],"disallowed_STD3_mapped"," "],[[8203,8203],"ignored"],[[8204,8205],"deviation",""],[[8206,8207],"disallowed"],[[8208,8208],"valid","","NV8"],[[8209,8209],"mapped","‐"],[[8210,8214],"valid","","NV8"],[[8215,8215],"disallowed_STD3_mapped"," ̳"],[[8216,8227],"valid","","NV8"],[[8228,8230],"disallowed"],[[8231,8231],"valid","","NV8"],[[8232,8238],"disallowed"],[[8239,8239],"disallowed_STD3_mapped"," "],[[8240,8242],"valid","","NV8"],[[8243,8243],"mapped","′′"],[[8244,8244],"mapped","′′′"],[[8245,8245],"valid","","NV8"],[[8246,8246],"mapped","‵‵"],[[8247,8247],"mapped","‵‵‵"],[[8248,8251],"valid","","NV8"],[[8252,8252],"disallowed_STD3_mapped","!!"],[[8253,8253],"valid","","NV8"],[[8254,8254],"disallowed_STD3_mapped"," ̅"],[[8255,8262],"valid","","NV8"],[[8263,8263],"disallowed_STD3_mapped","??"],[[8264,8264],"disallowed_STD3_mapped","?!"],[[8265,8265],"disallowed_STD3_mapped","!?"],[[8266,8269],"valid","","NV8"],[[8270,8274],"valid","","NV8"],[[8275,8276],"valid","","NV8"],[[8277,8278],"valid","","NV8"],[[8279,8279],"mapped","′′′′"],[[8280,8286],"valid","","NV8"],[[8287,8287],"disallowed_STD3_mapped"," "],[[8288,8288],"ignored"],[[8289,8291],"disallowed"],[[8292,8292],"ignored"],[[8293,8293],"disallowed"],[[8294,8297],"disallowed"],[[8298,8303],"disallowed"],[[8304,8304],"mapped","0"],[[8305,8305],"mapped","i"],[[8306,8307],"disallowed"],[[8308,8308],"mapped","4"],[[8309,8309],"mapped","5"],[[8310,8310],"mapped","6"],[[8311,8311],"mapped","7"],[[8312,8312],"mapped","8"],[[8313,8313],"mapped","9"],[[8314,8314],"disallowed_STD3_mapped","+"],[[8315,8315],"mapped","−"],[[8316,8316],"disallowed_STD3_mapped","="],[[8317,8317],"disallowed_STD3_mapped","("],[[8318,8318],"disallowed_STD3_mapped",")"],[[8319,8319],"mapped","n"],[[8320,8320],"mapped","0"],[[8321,8321],"mapped","1"],[[8322,8322],"mapped","2"],[[8323,8323],"mapped","3"],[[8324,8324],"mapped","4"],[[8325,8325],"mapped","5"],[[8326,8326],"mapped","6"],[[8327,8327],"mapped","7"],[[8328,8328],"mapped","8"],[[8329,8329],"mapped","9"],[[8330,8330],"disallowed_STD3_mapped","+"],[[8331,8331],"mapped","−"],[[8332,8332],"disallowed_STD3_mapped","="],[[8333,8333],"disallowed_STD3_mapped","("],[[8334,8334],"disallowed_STD3_mapped",")"],[[8335,8335],"disallowed"],[[8336,8336],"mapped","a"],[[8337,8337],"mapped","e"],[[8338,8338],"mapped","o"],[[8339,8339],"mapped","x"],[[8340,8340],"mapped","ə"],[[8341,8341],"mapped","h"],[[8342,8342],"mapped","k"],[[8343,8343],"mapped","l"],[[8344,8344],"mapped","m"],[[8345,8345],"mapped","n"],[[8346,8346],"mapped","p"],[[8347,8347],"mapped","s"],[[8348,8348],"mapped","t"],[[8349,8351],"disallowed"],[[8352,8359],"valid","","NV8"],[[8360,8360],"mapped","rs"],[[8361,8362],"valid","","NV8"],[[8363,8363],"valid","","NV8"],[[8364,8364],"valid","","NV8"],[[8365,8367],"valid","","NV8"],[[8368,8369],"valid","","NV8"],[[8370,8373],"valid","","NV8"],[[8374,8376],"valid","","NV8"],[[8377,8377],"valid","","NV8"],[[8378,8378],"valid","","NV8"],[[8379,8381],"valid","","NV8"],[[8382,8382],"valid","","NV8"],[[8383,8383],"valid","","NV8"],[[8384,8399],"disallowed"],[[8400,8417],"valid","","NV8"],[[8418,8419],"valid","","NV8"],[[8420,8426],"valid","","NV8"],[[8427,8427],"valid","","NV8"],[[8428,8431],"valid","","NV8"],[[8432,8432],"valid","","NV8"],[[8433,8447],"disallowed"],[[8448,8448],"disallowed_STD3_mapped","a/c"],[[8449,8449],"disallowed_STD3_mapped","a/s"],[[8450,8450],"mapped","c"],[[8451,8451],"mapped","°c"],[[8452,8452],"valid","","NV8"],[[8453,8453],"disallowed_STD3_mapped","c/o"],[[8454,8454],"disallowed_STD3_mapped","c/u"],[[8455,8455],"mapped","ɛ"],[[8456,8456],"valid","","NV8"],[[8457,8457],"mapped","°f"],[[8458,8458],"mapped","g"],[[8459,8462],"mapped","h"],[[8463,8463],"mapped","ħ"],[[8464,8465],"mapped","i"],[[8466,8467],"mapped","l"],[[8468,8468],"valid","","NV8"],[[8469,8469],"mapped","n"],[[8470,8470],"mapped","no"],[[8471,8472],"valid","","NV8"],[[8473,8473],"mapped","p"],[[8474,8474],"mapped","q"],[[8475,8477],"mapped","r"],[[8478,8479],"valid","","NV8"],[[8480,8480],"mapped","sm"],[[8481,8481],"mapped","tel"],[[8482,8482],"mapped","tm"],[[8483,8483],"valid","","NV8"],[[8484,8484],"mapped","z"],[[8485,8485],"valid","","NV8"],[[8486,8486],"mapped","ω"],[[8487,8487],"valid","","NV8"],[[8488,8488],"mapped","z"],[[8489,8489],"valid","","NV8"],[[8490,8490],"mapped","k"],[[8491,8491],"mapped","å"],[[8492,8492],"mapped","b"],[[8493,8493],"mapped","c"],[[8494,8494],"valid","","NV8"],[[8495,8496],"mapped","e"],[[8497,8497],"mapped","f"],[[8498,8498],"disallowed"],[[8499,8499],"mapped","m"],[[8500,8500],"mapped","o"],[[8501,8501],"mapped","א"],[[8502,8502],"mapped","ב"],[[8503,8503],"mapped","ג"],[[8504,8504],"mapped","ד"],[[8505,8505],"mapped","i"],[[8506,8506],"valid","","NV8"],[[8507,8507],"mapped","fax"],[[8508,8508],"mapped","π"],[[8509,8510],"mapped","γ"],[[8511,8511],"mapped","π"],[[8512,8512],"mapped","∑"],[[8513,8516],"valid","","NV8"],[[8517,8518],"mapped","d"],[[8519,8519],"mapped","e"],[[8520,8520],"mapped","i"],[[8521,8521],"mapped","j"],[[8522,8523],"valid","","NV8"],[[8524,8524],"valid","","NV8"],[[8525,8525],"valid","","NV8"],[[8526,8526],"valid"],[[8527,8527],"valid","","NV8"],[[8528,8528],"mapped","1⁄7"],[[8529,8529],"mapped","1⁄9"],[[8530,8530],"mapped","1⁄10"],[[8531,8531],"mapped","1⁄3"],[[8532,8532],"mapped","2⁄3"],[[8533,8533],"mapped","1⁄5"],[[8534,8534],"mapped","2⁄5"],[[8535,8535],"mapped","3⁄5"],[[8536,8536],"mapped","4⁄5"],[[8537,8537],"mapped","1⁄6"],[[8538,8538],"mapped","5⁄6"],[[8539,8539],"mapped","1⁄8"],[[8540,8540],"mapped","3⁄8"],[[8541,8541],"mapped","5⁄8"],[[8542,8542],"mapped","7⁄8"],[[8543,8543],"mapped","1⁄"],[[8544,8544],"mapped","i"],[[8545,8545],"mapped","ii"],[[8546,8546],"mapped","iii"],[[8547,8547],"mapped","iv"],[[8548,8548],"mapped","v"],[[8549,8549],"mapped","vi"],[[8550,8550],"mapped","vii"],[[8551,8551],"mapped","viii"],[[8552,8552],"mapped","ix"],[[8553,8553],"mapped","x"],[[8554,8554],"mapped","xi"],[[8555,8555],"mapped","xii"],[[8556,8556],"mapped","l"],[[8557,8557],"mapped","c"],[[8558,8558],"mapped","d"],[[8559,8559],"mapped","m"],[[8560,8560],"mapped","i"],[[8561,8561],"mapped","ii"],[[8562,8562],"mapped","iii"],[[8563,8563],"mapped","iv"],[[8564,8564],"mapped","v"],[[8565,8565],"mapped","vi"],[[8566,8566],"mapped","vii"],[[8567,8567],"mapped","viii"],[[8568,8568],"mapped","ix"],[[8569,8569],"mapped","x"],[[8570,8570],"mapped","xi"],[[8571,8571],"mapped","xii"],[[8572,8572],"mapped","l"],[[8573,8573],"mapped","c"],[[8574,8574],"mapped","d"],[[8575,8575],"mapped","m"],[[8576,8578],"valid","","NV8"],[[8579,8579],"disallowed"],[[8580,8580],"valid"],[[8581,8584],"valid","","NV8"],[[8585,8585],"mapped","0⁄3"],[[8586,8587],"valid","","NV8"],[[8588,8591],"disallowed"],[[8592,8682],"valid","","NV8"],[[8683,8691],"valid","","NV8"],[[8692,8703],"valid","","NV8"],[[8704,8747],"valid","","NV8"],[[8748,8748],"mapped","∫∫"],[[8749,8749],"mapped","∫∫∫"],[[8750,8750],"valid","","NV8"],[[8751,8751],"mapped","∮∮"],[[8752,8752],"mapped","∮∮∮"],[[8753,8799],"valid","","NV8"],[[8800,8800],"disallowed_STD3_valid"],[[8801,8813],"valid","","NV8"],[[8814,8815],"disallowed_STD3_valid"],[[8816,8945],"valid","","NV8"],[[8946,8959],"valid","","NV8"],[[8960,8960],"valid","","NV8"],[[8961,8961],"valid","","NV8"],[[8962,9000],"valid","","NV8"],[[9001,9001],"mapped","〈"],[[9002,9002],"mapped","〉"],[[9003,9082],"valid","","NV8"],[[9083,9083],"valid","","NV8"],[[9084,9084],"valid","","NV8"],[[9085,9114],"valid","","NV8"],[[9115,9166],"valid","","NV8"],[[9167,9168],"valid","","NV8"],[[9169,9179],"valid","","NV8"],[[9180,9191],"valid","","NV8"],[[9192,9192],"valid","","NV8"],[[9193,9203],"valid","","NV8"],[[9204,9210],"valid","","NV8"],[[9211,9214],"valid","","NV8"],[[9215,9215],"valid","","NV8"],[[9216,9252],"valid","","NV8"],[[9253,9254],"valid","","NV8"],[[9255,9279],"disallowed"],[[9280,9290],"valid","","NV8"],[[9291,9311],"disallowed"],[[9312,9312],"mapped","1"],[[9313,9313],"mapped","2"],[[9314,9314],"mapped","3"],[[9315,9315],"mapped","4"],[[9316,9316],"mapped","5"],[[9317,9317],"mapped","6"],[[9318,9318],"mapped","7"],[[9319,9319],"mapped","8"],[[9320,9320],"mapped","9"],[[9321,9321],"mapped","10"],[[9322,9322],"mapped","11"],[[9323,9323],"mapped","12"],[[9324,9324],"mapped","13"],[[9325,9325],"mapped","14"],[[9326,9326],"mapped","15"],[[9327,9327],"mapped","16"],[[9328,9328],"mapped","17"],[[9329,9329],"mapped","18"],[[9330,9330],"mapped","19"],[[9331,9331],"mapped","20"],[[9332,9332],"disallowed_STD3_mapped","(1)"],[[9333,9333],"disallowed_STD3_mapped","(2)"],[[9334,9334],"disallowed_STD3_mapped","(3)"],[[9335,9335],"disallowed_STD3_mapped","(4)"],[[9336,9336],"disallowed_STD3_mapped","(5)"],[[9337,9337],"disallowed_STD3_mapped","(6)"],[[9338,9338],"disallowed_STD3_mapped","(7)"],[[9339,9339],"disallowed_STD3_mapped","(8)"],[[9340,9340],"disallowed_STD3_mapped","(9)"],[[9341,9341],"disallowed_STD3_mapped","(10)"],[[9342,9342],"disallowed_STD3_mapped","(11)"],[[9343,9343],"disallowed_STD3_mapped","(12)"],[[9344,9344],"disallowed_STD3_mapped","(13)"],[[9345,9345],"disallowed_STD3_mapped","(14)"],[[9346,9346],"disallowed_STD3_mapped","(15)"],[[9347,9347],"disallowed_STD3_mapped","(16)"],[[9348,9348],"disallowed_STD3_mapped","(17)"],[[9349,9349],"disallowed_STD3_mapped","(18)"],[[9350,9350],"disallowed_STD3_mapped","(19)"],[[9351,9351],"disallowed_STD3_mapped","(20)"],[[9352,9371],"disallowed"],[[9372,9372],"disallowed_STD3_mapped","(a)"],[[9373,9373],"disallowed_STD3_mapped","(b)"],[[9374,9374],"disallowed_STD3_mapped","(c)"],[[9375,9375],"disallowed_STD3_mapped","(d)"],[[9376,9376],"disallowed_STD3_mapped","(e)"],[[9377,9377],"disallowed_STD3_mapped","(f)"],[[9378,9378],"disallowed_STD3_mapped","(g)"],[[9379,9379],"disallowed_STD3_mapped","(h)"],[[9380,9380],"disallowed_STD3_mapped","(i)"],[[9381,9381],"disallowed_STD3_mapped","(j)"],[[9382,9382],"disallowed_STD3_mapped","(k)"],[[9383,9383],"disallowed_STD3_mapped","(l)"],[[9384,9384],"disallowed_STD3_mapped","(m)"],[[9385,9385],"disallowed_STD3_mapped","(n)"],[[9386,9386],"disallowed_STD3_mapped","(o)"],[[9387,9387],"disallowed_STD3_mapped","(p)"],[[9388,9388],"disallowed_STD3_mapped","(q)"],[[9389,9389],"disallowed_STD3_mapped","(r)"],[[9390,9390],"disallowed_STD3_mapped","(s)"],[[9391,9391],"disallowed_STD3_mapped","(t)"],[[9392,9392],"disallowed_STD3_mapped","(u)"],[[9393,9393],"disallowed_STD3_mapped","(v)"],[[9394,9394],"disallowed_STD3_mapped","(w)"],[[9395,9395],"disallowed_STD3_mapped","(x)"],[[9396,9396],"disallowed_STD3_mapped","(y)"],[[9397,9397],"disallowed_STD3_mapped","(z)"],[[9398,9398],"mapped","a"],[[9399,9399],"mapped","b"],[[9400,9400],"mapped","c"],[[9401,9401],"mapped","d"],[[9402,9402],"mapped","e"],[[9403,9403],"mapped","f"],[[9404,9404],"mapped","g"],[[9405,9405],"mapped","h"],[[9406,9406],"mapped","i"],[[9407,9407],"mapped","j"],[[9408,9408],"mapped","k"],[[9409,9409],"mapped","l"],[[9410,9410],"mapped","m"],[[9411,9411],"mapped","n"],[[9412,9412],"mapped","o"],[[9413,9413],"mapped","p"],[[9414,9414],"mapped","q"],[[9415,9415],"mapped","r"],[[9416,9416],"mapped","s"],[[9417,9417],"mapped","t"],[[9418,9418],"mapped","u"],[[9419,9419],"mapped","v"],[[9420,9420],"mapped","w"],[[9421,9421],"mapped","x"],[[9422,9422],"mapped","y"],[[9423,9423],"mapped","z"],[[9424,9424],"mapped","a"],[[9425,9425],"mapped","b"],[[9426,9426],"mapped","c"],[[9427,9427],"mapped","d"],[[9428,9428],"mapped","e"],[[9429,9429],"mapped","f"],[[9430,9430],"mapped","g"],[[9431,9431],"mapped","h"],[[9432,9432],"mapped","i"],[[9433,9433],"mapped","j"],[[9434,9434],"mapped","k"],[[9435,9435],"mapped","l"],[[9436,9436],"mapped","m"],[[9437,9437],"mapped","n"],[[9438,9438],"mapped","o"],[[9439,9439],"mapped","p"],[[9440,9440],"mapped","q"],[[9441,9441],"mapped","r"],[[9442,9442],"mapped","s"],[[9443,9443],"mapped","t"],[[9444,9444],"mapped","u"],[[9445,9445],"mapped","v"],[[9446,9446],"mapped","w"],[[9447,9447],"mapped","x"],[[9448,9448],"mapped","y"],[[9449,9449],"mapped","z"],[[9450,9450],"mapped","0"],[[9451,9470],"valid","","NV8"],[[9471,9471],"valid","","NV8"],[[9472,9621],"valid","","NV8"],[[9622,9631],"valid","","NV8"],[[9632,9711],"valid","","NV8"],[[9712,9719],"valid","","NV8"],[[9720,9727],"valid","","NV8"],[[9728,9747],"valid","","NV8"],[[9748,9749],"valid","","NV8"],[[9750,9751],"valid","","NV8"],[[9752,9752],"valid","","NV8"],[[9753,9753],"valid","","NV8"],[[9754,9839],"valid","","NV8"],[[9840,9841],"valid","","NV8"],[[9842,9853],"valid","","NV8"],[[9854,9855],"valid","","NV8"],[[9856,9865],"valid","","NV8"],[[9866,9873],"valid","","NV8"],[[9874,9884],"valid","","NV8"],[[9885,9885],"valid","","NV8"],[[9886,9887],"valid","","NV8"],[[9888,9889],"valid","","NV8"],[[9890,9905],"valid","","NV8"],[[9906,9906],"valid","","NV8"],[[9907,9916],"valid","","NV8"],[[9917,9919],"valid","","NV8"],[[9920,9923],"valid","","NV8"],[[9924,9933],"valid","","NV8"],[[9934,9934],"valid","","NV8"],[[9935,9953],"valid","","NV8"],[[9954,9954],"valid","","NV8"],[[9955,9955],"valid","","NV8"],[[9956,9959],"valid","","NV8"],[[9960,9983],"valid","","NV8"],[[9984,9984],"valid","","NV8"],[[9985,9988],"valid","","NV8"],[[9989,9989],"valid","","NV8"],[[9990,9993],"valid","","NV8"],[[9994,9995],"valid","","NV8"],[[9996,10023],"valid","","NV8"],[[10024,10024],"valid","","NV8"],[[10025,10059],"valid","","NV8"],[[10060,10060],"valid","","NV8"],[[10061,10061],"valid","","NV8"],[[10062,10062],"valid","","NV8"],[[10063,10066],"valid","","NV8"],[[10067,10069],"valid","","NV8"],[[10070,10070],"valid","","NV8"],[[10071,10071],"valid","","NV8"],[[10072,10078],"valid","","NV8"],[[10079,10080],"valid","","NV8"],[[10081,10087],"valid","","NV8"],[[10088,10101],"valid","","NV8"],[[10102,10132],"valid","","NV8"],[[10133,10135],"valid","","NV8"],[[10136,10159],"valid","","NV8"],[[10160,10160],"valid","","NV8"],[[10161,10174],"valid","","NV8"],[[10175,10175],"valid","","NV8"],[[10176,10182],"valid","","NV8"],[[10183,10186],"valid","","NV8"],[[10187,10187],"valid","","NV8"],[[10188,10188],"valid","","NV8"],[[10189,10189],"valid","","NV8"],[[10190,10191],"valid","","NV8"],[[10192,10219],"valid","","NV8"],[[10220,10223],"valid","","NV8"],[[10224,10239],"valid","","NV8"],[[10240,10495],"valid","","NV8"],[[10496,10763],"valid","","NV8"],[[10764,10764],"mapped","∫∫∫∫"],[[10765,10867],"valid","","NV8"],[[10868,10868],"disallowed_STD3_mapped","::="],[[10869,10869],"disallowed_STD3_mapped","=="],[[10870,10870],"disallowed_STD3_mapped","==="],[[10871,10971],"valid","","NV8"],[[10972,10972],"mapped","⫝̸"],[[10973,11007],"valid","","NV8"],[[11008,11021],"valid","","NV8"],[[11022,11027],"valid","","NV8"],[[11028,11034],"valid","","NV8"],[[11035,11039],"valid","","NV8"],[[11040,11043],"valid","","NV8"],[[11044,11084],"valid","","NV8"],[[11085,11087],"valid","","NV8"],[[11088,11092],"valid","","NV8"],[[11093,11097],"valid","","NV8"],[[11098,11123],"valid","","NV8"],[[11124,11125],"disallowed"],[[11126,11157],"valid","","NV8"],[[11158,11159],"disallowed"],[[11160,11193],"valid","","NV8"],[[11194,11196],"disallowed"],[[11197,11208],"valid","","NV8"],[[11209,11209],"disallowed"],[[11210,11217],"valid","","NV8"],[[11218,11218],"valid","","NV8"],[[11219,11243],"disallowed"],[[11244,11247],"valid","","NV8"],[[11248,11263],"disallowed"],[[11264,11264],"mapped","ⰰ"],[[11265,11265],"mapped","ⰱ"],[[11266,11266],"mapped","ⰲ"],[[11267,11267],"mapped","ⰳ"],[[11268,11268],"mapped","ⰴ"],[[11269,11269],"mapped","ⰵ"],[[11270,11270],"mapped","ⰶ"],[[11271,11271],"mapped","ⰷ"],[[11272,11272],"mapped","ⰸ"],[[11273,11273],"mapped","ⰹ"],[[11274,11274],"mapped","ⰺ"],[[11275,11275],"mapped","ⰻ"],[[11276,11276],"mapped","ⰼ"],[[11277,11277],"mapped","ⰽ"],[[11278,11278],"mapped","ⰾ"],[[11279,11279],"mapped","ⰿ"],[[11280,11280],"mapped","ⱀ"],[[11281,11281],"mapped","ⱁ"],[[11282,11282],"mapped","ⱂ"],[[11283,11283],"mapped","ⱃ"],[[11284,11284],"mapped","ⱄ"],[[11285,11285],"mapped","ⱅ"],[[11286,11286],"mapped","ⱆ"],[[11287,11287],"mapped","ⱇ"],[[11288,11288],"mapped","ⱈ"],[[11289,11289],"mapped","ⱉ"],[[11290,11290],"mapped","ⱊ"],[[11291,11291],"mapped","ⱋ"],[[11292,11292],"mapped","ⱌ"],[[11293,11293],"mapped","ⱍ"],[[11294,11294],"mapped","ⱎ"],[[11295,11295],"mapped","ⱏ"],[[11296,11296],"mapped","ⱐ"],[[11297,11297],"mapped","ⱑ"],[[11298,11298],"mapped","ⱒ"],[[11299,11299],"mapped","ⱓ"],[[11300,11300],"mapped","ⱔ"],[[11301,11301],"mapped","ⱕ"],[[11302,11302],"mapped","ⱖ"],[[11303,11303],"mapped","ⱗ"],[[11304,11304],"mapped","ⱘ"],[[11305,11305],"mapped","ⱙ"],[[11306,11306],"mapped","ⱚ"],[[11307,11307],"mapped","ⱛ"],[[11308,11308],"mapped","ⱜ"],[[11309,11309],"mapped","ⱝ"],[[11310,11310],"mapped","ⱞ"],[[11311,11311],"disallowed"],[[11312,11358],"valid"],[[11359,11359],"disallowed"],[[11360,11360],"mapped","ⱡ"],[[11361,11361],"valid"],[[11362,11362],"mapped","ɫ"],[[11363,11363],"mapped","ᵽ"],[[11364,11364],"mapped","ɽ"],[[11365,11366],"valid"],[[11367,11367],"mapped","ⱨ"],[[11368,11368],"valid"],[[11369,11369],"mapped","ⱪ"],[[11370,11370],"valid"],[[11371,11371],"mapped","ⱬ"],[[11372,11372],"valid"],[[11373,11373],"mapped","ɑ"],[[11374,11374],"mapped","ɱ"],[[11375,11375],"mapped","ɐ"],[[11376,11376],"mapped","ɒ"],[[11377,11377],"valid"],[[11378,11378],"mapped","ⱳ"],[[11379,11379],"valid"],[[11380,11380],"valid"],[[11381,11381],"mapped","ⱶ"],[[11382,11383],"valid"],[[11384,11387],"valid"],[[11388,11388],"mapped","j"],[[11389,11389],"mapped","v"],[[11390,11390],"mapped","ȿ"],[[11391,11391],"mapped","ɀ"],[[11392,11392],"mapped","ⲁ"],[[11393,11393],"valid"],[[11394,11394],"mapped","ⲃ"],[[11395,11395],"valid"],[[11396,11396],"mapped","ⲅ"],[[11397,11397],"valid"],[[11398,11398],"mapped","ⲇ"],[[11399,11399],"valid"],[[11400,11400],"mapped","ⲉ"],[[11401,11401],"valid"],[[11402,11402],"mapped","ⲋ"],[[11403,11403],"valid"],[[11404,11404],"mapped","ⲍ"],[[11405,11405],"valid"],[[11406,11406],"mapped","ⲏ"],[[11407,11407],"valid"],[[11408,11408],"mapped","ⲑ"],[[11409,11409],"valid"],[[11410,11410],"mapped","ⲓ"],[[11411,11411],"valid"],[[11412,11412],"mapped","ⲕ"],[[11413,11413],"valid"],[[11414,11414],"mapped","ⲗ"],[[11415,11415],"valid"],[[11416,11416],"mapped","ⲙ"],[[11417,11417],"valid"],[[11418,11418],"mapped","ⲛ"],[[11419,11419],"valid"],[[11420,11420],"mapped","ⲝ"],[[11421,11421],"valid"],[[11422,11422],"mapped","ⲟ"],[[11423,11423],"valid"],[[11424,11424],"mapped","ⲡ"],[[11425,11425],"valid"],[[11426,11426],"mapped","ⲣ"],[[11427,11427],"valid"],[[11428,11428],"mapped","ⲥ"],[[11429,11429],"valid"],[[11430,11430],"mapped","ⲧ"],[[11431,11431],"valid"],[[11432,11432],"mapped","ⲩ"],[[11433,11433],"valid"],[[11434,11434],"mapped","ⲫ"],[[11435,11435],"valid"],[[11436,11436],"mapped","ⲭ"],[[11437,11437],"valid"],[[11438,11438],"mapped","ⲯ"],[[11439,11439],"valid"],[[11440,11440],"mapped","ⲱ"],[[11441,11441],"valid"],[[11442,11442],"mapped","ⲳ"],[[11443,11443],"valid"],[[11444,11444],"mapped","ⲵ"],[[11445,11445],"valid"],[[11446,11446],"mapped","ⲷ"],[[11447,11447],"valid"],[[11448,11448],"mapped","ⲹ"],[[11449,11449],"valid"],[[11450,11450],"mapped","ⲻ"],[[11451,11451],"valid"],[[11452,11452],"mapped","ⲽ"],[[11453,11453],"valid"],[[11454,11454],"mapped","ⲿ"],[[11455,11455],"valid"],[[11456,11456],"mapped","ⳁ"],[[11457,11457],"valid"],[[11458,11458],"mapped","ⳃ"],[[11459,11459],"valid"],[[11460,11460],"mapped","ⳅ"],[[11461,11461],"valid"],[[11462,11462],"mapped","ⳇ"],[[11463,11463],"valid"],[[11464,11464],"mapped","ⳉ"],[[11465,11465],"valid"],[[11466,11466],"mapped","ⳋ"],[[11467,11467],"valid"],[[11468,11468],"mapped","ⳍ"],[[11469,11469],"valid"],[[11470,11470],"mapped","ⳏ"],[[11471,11471],"valid"],[[11472,11472],"mapped","ⳑ"],[[11473,11473],"valid"],[[11474,11474],"mapped","ⳓ"],[[11475,11475],"valid"],[[11476,11476],"mapped","ⳕ"],[[11477,11477],"valid"],[[11478,11478],"mapped","ⳗ"],[[11479,11479],"valid"],[[11480,11480],"mapped","ⳙ"],[[11481,11481],"valid"],[[11482,11482],"mapped","ⳛ"],[[11483,11483],"valid"],[[11484,11484],"mapped","ⳝ"],[[11485,11485],"valid"],[[11486,11486],"mapped","ⳟ"],[[11487,11487],"valid"],[[11488,11488],"mapped","ⳡ"],[[11489,11489],"valid"],[[11490,11490],"mapped","ⳣ"],[[11491,11492],"valid"],[[11493,11498],"valid","","NV8"],[[11499,11499],"mapped","ⳬ"],[[11500,11500],"valid"],[[11501,11501],"mapped","ⳮ"],[[11502,11505],"valid"],[[11506,11506],"mapped","ⳳ"],[[11507,11507],"valid"],[[11508,11512],"disallowed"],[[11513,11519],"valid","","NV8"],[[11520,11557],"valid"],[[11558,11558],"disallowed"],[[11559,11559],"valid"],[[11560,11564],"disallowed"],[[11565,11565],"valid"],[[11566,11567],"disallowed"],[[11568,11621],"valid"],[[11622,11623],"valid"],[[11624,11630],"disallowed"],[[11631,11631],"mapped","ⵡ"],[[11632,11632],"valid","","NV8"],[[11633,11646],"disallowed"],[[11647,11647],"valid"],[[11648,11670],"valid"],[[11671,11679],"disallowed"],[[11680,11686],"valid"],[[11687,11687],"disallowed"],[[11688,11694],"valid"],[[11695,11695],"disallowed"],[[11696,11702],"valid"],[[11703,11703],"disallowed"],[[11704,11710],"valid"],[[11711,11711],"disallowed"],[[11712,11718],"valid"],[[11719,11719],"disallowed"],[[11720,11726],"valid"],[[11727,11727],"disallowed"],[[11728,11734],"valid"],[[11735,11735],"disallowed"],[[11736,11742],"valid"],[[11743,11743],"disallowed"],[[11744,11775],"valid"],[[11776,11799],"valid","","NV8"],[[11800,11803],"valid","","NV8"],[[11804,11805],"valid","","NV8"],[[11806,11822],"valid","","NV8"],[[11823,11823],"valid"],[[11824,11824],"valid","","NV8"],[[11825,11825],"valid","","NV8"],[[11826,11835],"valid","","NV8"],[[11836,11842],"valid","","NV8"],[[11843,11844],"valid","","NV8"],[[11845,11849],"valid","","NV8"],[[11850,11903],"disallowed"],[[11904,11929],"valid","","NV8"],[[11930,11930],"disallowed"],[[11931,11934],"valid","","NV8"],[[11935,11935],"mapped","母"],[[11936,12018],"valid","","NV8"],[[12019,12019],"mapped","龟"],[[12020,12031],"disallowed"],[[12032,12032],"mapped","一"],[[12033,12033],"mapped","丨"],[[12034,12034],"mapped","丶"],[[12035,12035],"mapped","丿"],[[12036,12036],"mapped","乙"],[[12037,12037],"mapped","亅"],[[12038,12038],"mapped","二"],[[12039,12039],"mapped","亠"],[[12040,12040],"mapped","人"],[[12041,12041],"mapped","儿"],[[12042,12042],"mapped","入"],[[12043,12043],"mapped","八"],[[12044,12044],"mapped","冂"],[[12045,12045],"mapped","冖"],[[12046,12046],"mapped","冫"],[[12047,12047],"mapped","几"],[[12048,12048],"mapped","凵"],[[12049,12049],"mapped","刀"],[[12050,12050],"mapped","力"],[[12051,12051],"mapped","勹"],[[12052,12052],"mapped","匕"],[[12053,12053],"mapped","匚"],[[12054,12054],"mapped","匸"],[[12055,12055],"mapped","十"],[[12056,12056],"mapped","卜"],[[12057,12057],"mapped","卩"],[[12058,12058],"mapped","厂"],[[12059,12059],"mapped","厶"],[[12060,12060],"mapped","又"],[[12061,12061],"mapped","口"],[[12062,12062],"mapped","囗"],[[12063,12063],"mapped","土"],[[12064,12064],"mapped","士"],[[12065,12065],"mapped","夂"],[[12066,12066],"mapped","夊"],[[12067,12067],"mapped","夕"],[[12068,12068],"mapped","大"],[[12069,12069],"mapped","女"],[[12070,12070],"mapped","子"],[[12071,12071],"mapped","宀"],[[12072,12072],"mapped","寸"],[[12073,12073],"mapped","小"],[[12074,12074],"mapped","尢"],[[12075,12075],"mapped","尸"],[[12076,12076],"mapped","屮"],[[12077,12077],"mapped","山"],[[12078,12078],"mapped","巛"],[[12079,12079],"mapped","工"],[[12080,12080],"mapped","己"],[[12081,12081],"mapped","巾"],[[12082,12082],"mapped","干"],[[12083,12083],"mapped","幺"],[[12084,12084],"mapped","广"],[[12085,12085],"mapped","廴"],[[12086,12086],"mapped","廾"],[[12087,12087],"mapped","弋"],[[12088,12088],"mapped","弓"],[[12089,12089],"mapped","彐"],[[12090,12090],"mapped","彡"],[[12091,12091],"mapped","彳"],[[12092,12092],"mapped","心"],[[12093,12093],"mapped","戈"],[[12094,12094],"mapped","戶"],[[12095,12095],"mapped","手"],[[12096,12096],"mapped","支"],[[12097,12097],"mapped","攴"],[[12098,12098],"mapped","文"],[[12099,12099],"mapped","斗"],[[12100,12100],"mapped","斤"],[[12101,12101],"mapped","方"],[[12102,12102],"mapped","无"],[[12103,12103],"mapped","日"],[[12104,12104],"mapped","曰"],[[12105,12105],"mapped","月"],[[12106,12106],"mapped","木"],[[12107,12107],"mapped","欠"],[[12108,12108],"mapped","止"],[[12109,12109],"mapped","歹"],[[12110,12110],"mapped","殳"],[[12111,12111],"mapped","毋"],[[12112,12112],"mapped","比"],[[12113,12113],"mapped","毛"],[[12114,12114],"mapped","氏"],[[12115,12115],"mapped","气"],[[12116,12116],"mapped","水"],[[12117,12117],"mapped","火"],[[12118,12118],"mapped","爪"],[[12119,12119],"mapped","父"],[[12120,12120],"mapped","爻"],[[12121,12121],"mapped","爿"],[[12122,12122],"mapped","片"],[[12123,12123],"mapped","牙"],[[12124,12124],"mapped","牛"],[[12125,12125],"mapped","犬"],[[12126,12126],"mapped","玄"],[[12127,12127],"mapped","玉"],[[12128,12128],"mapped","瓜"],[[12129,12129],"mapped","瓦"],[[12130,12130],"mapped","甘"],[[12131,12131],"mapped","生"],[[12132,12132],"mapped","用"],[[12133,12133],"mapped","田"],[[12134,12134],"mapped","疋"],[[12135,12135],"mapped","疒"],[[12136,12136],"mapped","癶"],[[12137,12137],"mapped","白"],[[12138,12138],"mapped","皮"],[[12139,12139],"mapped","皿"],[[12140,12140],"mapped","目"],[[12141,12141],"mapped","矛"],[[12142,12142],"mapped","矢"],[[12143,12143],"mapped","石"],[[12144,12144],"mapped","示"],[[12145,12145],"mapped","禸"],[[12146,12146],"mapped","禾"],[[12147,12147],"mapped","穴"],[[12148,12148],"mapped","立"],[[12149,12149],"mapped","竹"],[[12150,12150],"mapped","米"],[[12151,12151],"mapped","糸"],[[12152,12152],"mapped","缶"],[[12153,12153],"mapped","网"],[[12154,12154],"mapped","羊"],[[12155,12155],"mapped","羽"],[[12156,12156],"mapped","老"],[[12157,12157],"mapped","而"],[[12158,12158],"mapped","耒"],[[12159,12159],"mapped","耳"],[[12160,12160],"mapped","聿"],[[12161,12161],"mapped","肉"],[[12162,12162],"mapped","臣"],[[12163,12163],"mapped","自"],[[12164,12164],"mapped","至"],[[12165,12165],"mapped","臼"],[[12166,12166],"mapped","舌"],[[12167,12167],"mapped","舛"],[[12168,12168],"mapped","舟"],[[12169,12169],"mapped","艮"],[[12170,12170],"mapped","色"],[[12171,12171],"mapped","艸"],[[12172,12172],"mapped","虍"],[[12173,12173],"mapped","虫"],[[12174,12174],"mapped","血"],[[12175,12175],"mapped","行"],[[12176,12176],"mapped","衣"],[[12177,12177],"mapped","襾"],[[12178,12178],"mapped","見"],[[12179,12179],"mapped","角"],[[12180,12180],"mapped","言"],[[12181,12181],"mapped","谷"],[[12182,12182],"mapped","豆"],[[12183,12183],"mapped","豕"],[[12184,12184],"mapped","豸"],[[12185,12185],"mapped","貝"],[[12186,12186],"mapped","赤"],[[12187,12187],"mapped","走"],[[12188,12188],"mapped","足"],[[12189,12189],"mapped","身"],[[12190,12190],"mapped","車"],[[12191,12191],"mapped","辛"],[[12192,12192],"mapped","辰"],[[12193,12193],"mapped","辵"],[[12194,12194],"mapped","邑"],[[12195,12195],"mapped","酉"],[[12196,12196],"mapped","釆"],[[12197,12197],"mapped","里"],[[12198,12198],"mapped","金"],[[12199,12199],"mapped","長"],[[12200,12200],"mapped","門"],[[12201,12201],"mapped","阜"],[[12202,12202],"mapped","隶"],[[12203,12203],"mapped","隹"],[[12204,12204],"mapped","雨"],[[12205,12205],"mapped","靑"],[[12206,12206],"mapped","非"],[[12207,12207],"mapped","面"],[[12208,12208],"mapped","革"],[[12209,12209],"mapped","韋"],[[12210,12210],"mapped","韭"],[[12211,12211],"mapped","音"],[[12212,12212],"mapped","頁"],[[12213,12213],"mapped","風"],[[12214,12214],"mapped","飛"],[[12215,12215],"mapped","食"],[[12216,12216],"mapped","首"],[[12217,12217],"mapped","香"],[[12218,12218],"mapped","馬"],[[12219,12219],"mapped","骨"],[[12220,12220],"mapped","高"],[[12221,12221],"mapped","髟"],[[12222,12222],"mapped","鬥"],[[12223,12223],"mapped","鬯"],[[12224,12224],"mapped","鬲"],[[12225,12225],"mapped","鬼"],[[12226,12226],"mapped","魚"],[[12227,12227],"mapped","鳥"],[[12228,12228],"mapped","鹵"],[[12229,12229],"mapped","鹿"],[[12230,12230],"mapped","麥"],[[12231,12231],"mapped","麻"],[[12232,12232],"mapped","黃"],[[12233,12233],"mapped","黍"],[[12234,12234],"mapped","黑"],[[12235,12235],"mapped","黹"],[[12236,12236],"mapped","黽"],[[12237,12237],"mapped","鼎"],[[12238,12238],"mapped","鼓"],[[12239,12239],"mapped","鼠"],[[12240,12240],"mapped","鼻"],[[12241,12241],"mapped","齊"],[[12242,12242],"mapped","齒"],[[12243,12243],"mapped","龍"],[[12244,12244],"mapped","龜"],[[12245,12245],"mapped","龠"],[[12246,12271],"disallowed"],[[12272,12283],"disallowed"],[[12284,12287],"disallowed"],[[12288,12288],"disallowed_STD3_mapped"," "],[[12289,12289],"valid","","NV8"],[[12290,12290],"mapped","."],[[12291,12292],"valid","","NV8"],[[12293,12295],"valid"],[[12296,12329],"valid","","NV8"],[[12330,12333],"valid"],[[12334,12341],"valid","","NV8"],[[12342,12342],"mapped","〒"],[[12343,12343],"valid","","NV8"],[[12344,12344],"mapped","十"],[[12345,12345],"mapped","卄"],[[12346,12346],"mapped","卅"],[[12347,12347],"valid","","NV8"],[[12348,12348],"valid"],[[12349,12349],"valid","","NV8"],[[12350,12350],"valid","","NV8"],[[12351,12351],"valid","","NV8"],[[12352,12352],"disallowed"],[[12353,12436],"valid"],[[12437,12438],"valid"],[[12439,12440],"disallowed"],[[12441,12442],"valid"],[[12443,12443],"disallowed_STD3_mapped"," ゙"],[[12444,12444],"disallowed_STD3_mapped"," ゚"],[[12445,12446],"valid"],[[12447,12447],"mapped","より"],[[12448,12448],"valid","","NV8"],[[12449,12542],"valid"],[[12543,12543],"mapped","コト"],[[12544,12548],"disallowed"],[[12549,12588],"valid"],[[12589,12589],"valid"],[[12590,12590],"valid"],[[12591,12592],"disallowed"],[[12593,12593],"mapped","ᄀ"],[[12594,12594],"mapped","ᄁ"],[[12595,12595],"mapped","ᆪ"],[[12596,12596],"mapped","ᄂ"],[[12597,12597],"mapped","ᆬ"],[[12598,12598],"mapped","ᆭ"],[[12599,12599],"mapped","ᄃ"],[[12600,12600],"mapped","ᄄ"],[[12601,12601],"mapped","ᄅ"],[[12602,12602],"mapped","ᆰ"],[[12603,12603],"mapped","ᆱ"],[[12604,12604],"mapped","ᆲ"],[[12605,12605],"mapped","ᆳ"],[[12606,12606],"mapped","ᆴ"],[[12607,12607],"mapped","ᆵ"],[[12608,12608],"mapped","ᄚ"],[[12609,12609],"mapped","ᄆ"],[[12610,12610],"mapped","ᄇ"],[[12611,12611],"mapped","ᄈ"],[[12612,12612],"mapped","ᄡ"],[[12613,12613],"mapped","ᄉ"],[[12614,12614],"mapped","ᄊ"],[[12615,12615],"mapped","ᄋ"],[[12616,12616],"mapped","ᄌ"],[[12617,12617],"mapped","ᄍ"],[[12618,12618],"mapped","ᄎ"],[[12619,12619],"mapped","ᄏ"],[[12620,12620],"mapped","ᄐ"],[[12621,12621],"mapped","ᄑ"],[[12622,12622],"mapped","ᄒ"],[[12623,12623],"mapped","ᅡ"],[[12624,12624],"mapped","ᅢ"],[[12625,12625],"mapped","ᅣ"],[[12626,12626],"mapped","ᅤ"],[[12627,12627],"mapped","ᅥ"],[[12628,12628],"mapped","ᅦ"],[[12629,12629],"mapped","ᅧ"],[[12630,12630],"mapped","ᅨ"],[[12631,12631],"mapped","ᅩ"],[[12632,12632],"mapped","ᅪ"],[[12633,12633],"mapped","ᅫ"],[[12634,12634],"mapped","ᅬ"],[[12635,12635],"mapped","ᅭ"],[[12636,12636],"mapped","ᅮ"],[[12637,12637],"mapped","ᅯ"],[[12638,12638],"mapped","ᅰ"],[[12639,12639],"mapped","ᅱ"],[[12640,12640],"mapped","ᅲ"],[[12641,12641],"mapped","ᅳ"],[[12642,12642],"mapped","ᅴ"],[[12643,12643],"mapped","ᅵ"],[[12644,12644],"disallowed"],[[12645,12645],"mapped","ᄔ"],[[12646,12646],"mapped","ᄕ"],[[12647,12647],"mapped","ᇇ"],[[12648,12648],"mapped","ᇈ"],[[12649,12649],"mapped","ᇌ"],[[12650,12650],"mapped","ᇎ"],[[12651,12651],"mapped","ᇓ"],[[12652,12652],"mapped","ᇗ"],[[12653,12653],"mapped","ᇙ"],[[12654,12654],"mapped","ᄜ"],[[12655,12655],"mapped","ᇝ"],[[12656,12656],"mapped","ᇟ"],[[12657,12657],"mapped","ᄝ"],[[12658,12658],"mapped","ᄞ"],[[12659,12659],"mapped","ᄠ"],[[12660,12660],"mapped","ᄢ"],[[12661,12661],"mapped","ᄣ"],[[12662,12662],"mapped","ᄧ"],[[12663,12663],"mapped","ᄩ"],[[12664,12664],"mapped","ᄫ"],[[12665,12665],"mapped","ᄬ"],[[12666,12666],"mapped","ᄭ"],[[12667,12667],"mapped","ᄮ"],[[12668,12668],"mapped","ᄯ"],[[12669,12669],"mapped","ᄲ"],[[12670,12670],"mapped","ᄶ"],[[12671,12671],"mapped","ᅀ"],[[12672,12672],"mapped","ᅇ"],[[12673,12673],"mapped","ᅌ"],[[12674,12674],"mapped","ᇱ"],[[12675,12675],"mapped","ᇲ"],[[12676,12676],"mapped","ᅗ"],[[12677,12677],"mapped","ᅘ"],[[12678,12678],"mapped","ᅙ"],[[12679,12679],"mapped","ᆄ"],[[12680,12680],"mapped","ᆅ"],[[12681,12681],"mapped","ᆈ"],[[12682,12682],"mapped","ᆑ"],[[12683,12683],"mapped","ᆒ"],[[12684,12684],"mapped","ᆔ"],[[12685,12685],"mapped","ᆞ"],[[12686,12686],"mapped","ᆡ"],[[12687,12687],"disallowed"],[[12688,12689],"valid","","NV8"],[[12690,12690],"mapped","一"],[[12691,12691],"mapped","二"],[[12692,12692],"mapped","三"],[[12693,12693],"mapped","四"],[[12694,12694],"mapped","上"],[[12695,12695],"mapped","中"],[[12696,12696],"mapped","下"],[[12697,12697],"mapped","甲"],[[12698,12698],"mapped","乙"],[[12699,12699],"mapped","丙"],[[12700,12700],"mapped","丁"],[[12701,12701],"mapped","天"],[[12702,12702],"mapped","地"],[[12703,12703],"mapped","人"],[[12704,12727],"valid"],[[12728,12730],"valid"],[[12731,12735],"disallowed"],[[12736,12751],"valid","","NV8"],[[12752,12771],"valid","","NV8"],[[12772,12783],"disallowed"],[[12784,12799],"valid"],[[12800,12800],"disallowed_STD3_mapped","(ᄀ)"],[[12801,12801],"disallowed_STD3_mapped","(ᄂ)"],[[12802,12802],"disallowed_STD3_mapped","(ᄃ)"],[[12803,12803],"disallowed_STD3_mapped","(ᄅ)"],[[12804,12804],"disallowed_STD3_mapped","(ᄆ)"],[[12805,12805],"disallowed_STD3_mapped","(ᄇ)"],[[12806,12806],"disallowed_STD3_mapped","(ᄉ)"],[[12807,12807],"disallowed_STD3_mapped","(ᄋ)"],[[12808,12808],"disallowed_STD3_mapped","(ᄌ)"],[[12809,12809],"disallowed_STD3_mapped","(ᄎ)"],[[12810,12810],"disallowed_STD3_mapped","(ᄏ)"],[[12811,12811],"disallowed_STD3_mapped","(ᄐ)"],[[12812,12812],"disallowed_STD3_mapped","(ᄑ)"],[[12813,12813],"disallowed_STD3_mapped","(ᄒ)"],[[12814,12814],"disallowed_STD3_mapped","(가)"],[[12815,12815],"disallowed_STD3_mapped","(나)"],[[12816,12816],"disallowed_STD3_mapped","(다)"],[[12817,12817],"disallowed_STD3_mapped","(라)"],[[12818,12818],"disallowed_STD3_mapped","(마)"],[[12819,12819],"disallowed_STD3_mapped","(바)"],[[12820,12820],"disallowed_STD3_mapped","(사)"],[[12821,12821],"disallowed_STD3_mapped","(아)"],[[12822,12822],"disallowed_STD3_mapped","(자)"],[[12823,12823],"disallowed_STD3_mapped","(차)"],[[12824,12824],"disallowed_STD3_mapped","(카)"],[[12825,12825],"disallowed_STD3_mapped","(타)"],[[12826,12826],"disallowed_STD3_mapped","(파)"],[[12827,12827],"disallowed_STD3_mapped","(하)"],[[12828,12828],"disallowed_STD3_mapped","(주)"],[[12829,12829],"disallowed_STD3_mapped","(오전)"],[[12830,12830],"disallowed_STD3_mapped","(오후)"],[[12831,12831],"disallowed"],[[12832,12832],"disallowed_STD3_mapped","(一)"],[[12833,12833],"disallowed_STD3_mapped","(二)"],[[12834,12834],"disallowed_STD3_mapped","(三)"],[[12835,12835],"disallowed_STD3_mapped","(四)"],[[12836,12836],"disallowed_STD3_mapped","(五)"],[[12837,12837],"disallowed_STD3_mapped","(六)"],[[12838,12838],"disallowed_STD3_mapped","(七)"],[[12839,12839],"disallowed_STD3_mapped","(八)"],[[12840,12840],"disallowed_STD3_mapped","(九)"],[[12841,12841],"disallowed_STD3_mapped","(十)"],[[12842,12842],"disallowed_STD3_mapped","(月)"],[[12843,12843],"disallowed_STD3_mapped","(火)"],[[12844,12844],"disallowed_STD3_mapped","(水)"],[[12845,12845],"disallowed_STD3_mapped","(木)"],[[12846,12846],"disallowed_STD3_mapped","(金)"],[[12847,12847],"disallowed_STD3_mapped","(土)"],[[12848,12848],"disallowed_STD3_mapped","(日)"],[[12849,12849],"disallowed_STD3_mapped","(株)"],[[12850,12850],"disallowed_STD3_mapped","(有)"],[[12851,12851],"disallowed_STD3_mapped","(社)"],[[12852,12852],"disallowed_STD3_mapped","(名)"],[[12853,12853],"disallowed_STD3_mapped","(特)"],[[12854,12854],"disallowed_STD3_mapped","(財)"],[[12855,12855],"disallowed_STD3_mapped","(祝)"],[[12856,12856],"disallowed_STD3_mapped","(労)"],[[12857,12857],"disallowed_STD3_mapped","(代)"],[[12858,12858],"disallowed_STD3_mapped","(呼)"],[[12859,12859],"disallowed_STD3_mapped","(学)"],[[12860,12860],"disallowed_STD3_mapped","(監)"],[[12861,12861],"disallowed_STD3_mapped","(企)"],[[12862,12862],"disallowed_STD3_mapped","(資)"],[[12863,12863],"disallowed_STD3_mapped","(協)"],[[12864,12864],"disallowed_STD3_mapped","(祭)"],[[12865,12865],"disallowed_STD3_mapped","(休)"],[[12866,12866],"disallowed_STD3_mapped","(自)"],[[12867,12867],"disallowed_STD3_mapped","(至)"],[[12868,12868],"mapped","問"],[[12869,12869],"mapped","幼"],[[12870,12870],"mapped","文"],[[12871,12871],"mapped","箏"],[[12872,12879],"valid","","NV8"],[[12880,12880],"mapped","pte"],[[12881,12881],"mapped","21"],[[12882,12882],"mapped","22"],[[12883,12883],"mapped","23"],[[12884,12884],"mapped","24"],[[12885,12885],"mapped","25"],[[12886,12886],"mapped","26"],[[12887,12887],"mapped","27"],[[12888,12888],"mapped","28"],[[12889,12889],"mapped","29"],[[12890,12890],"mapped","30"],[[12891,12891],"mapped","31"],[[12892,12892],"mapped","32"],[[12893,12893],"mapped","33"],[[12894,12894],"mapped","34"],[[12895,12895],"mapped","35"],[[12896,12896],"mapped","ᄀ"],[[12897,12897],"mapped","ᄂ"],[[12898,12898],"mapped","ᄃ"],[[12899,12899],"mapped","ᄅ"],[[12900,12900],"mapped","ᄆ"],[[12901,12901],"mapped","ᄇ"],[[12902,12902],"mapped","ᄉ"],[[12903,12903],"mapped","ᄋ"],[[12904,12904],"mapped","ᄌ"],[[12905,12905],"mapped","ᄎ"],[[12906,12906],"mapped","ᄏ"],[[12907,12907],"mapped","ᄐ"],[[12908,12908],"mapped","ᄑ"],[[12909,12909],"mapped","ᄒ"],[[12910,12910],"mapped","가"],[[12911,12911],"mapped","나"],[[12912,12912],"mapped","다"],[[12913,12913],"mapped","라"],[[12914,12914],"mapped","마"],[[12915,12915],"mapped","바"],[[12916,12916],"mapped","사"],[[12917,12917],"mapped","아"],[[12918,12918],"mapped","자"],[[12919,12919],"mapped","차"],[[12920,12920],"mapped","카"],[[12921,12921],"mapped","타"],[[12922,12922],"mapped","파"],[[12923,12923],"mapped","하"],[[12924,12924],"mapped","참고"],[[12925,12925],"mapped","주의"],[[12926,12926],"mapped","우"],[[12927,12927],"valid","","NV8"],[[12928,12928],"mapped","一"],[[12929,12929],"mapped","二"],[[12930,12930],"mapped","三"],[[12931,12931],"mapped","四"],[[12932,12932],"mapped","五"],[[12933,12933],"mapped","六"],[[12934,12934],"mapped","七"],[[12935,12935],"mapped","八"],[[12936,12936],"mapped","九"],[[12937,12937],"mapped","十"],[[12938,12938],"mapped","月"],[[12939,12939],"mapped","火"],[[12940,12940],"mapped","水"],[[12941,12941],"mapped","木"],[[12942,12942],"mapped","金"],[[12943,12943],"mapped","土"],[[12944,12944],"mapped","日"],[[12945,12945],"mapped","株"],[[12946,12946],"mapped","有"],[[12947,12947],"mapped","社"],[[12948,12948],"mapped","名"],[[12949,12949],"mapped","特"],[[12950,12950],"mapped","財"],[[12951,12951],"mapped","祝"],[[12952,12952],"mapped","労"],[[12953,12953],"mapped","秘"],[[12954,12954],"mapped","男"],[[12955,12955],"mapped","女"],[[12956,12956],"mapped","適"],[[12957,12957],"mapped","優"],[[12958,12958],"mapped","印"],[[12959,12959],"mapped","注"],[[12960,12960],"mapped","項"],[[12961,12961],"mapped","休"],[[12962,12962],"mapped","写"],[[12963,12963],"mapped","正"],[[12964,12964],"mapped","上"],[[12965,12965],"mapped","中"],[[12966,12966],"mapped","下"],[[12967,12967],"mapped","左"],[[12968,12968],"mapped","右"],[[12969,12969],"mapped","医"],[[12970,12970],"mapped","宗"],[[12971,12971],"mapped","学"],[[12972,12972],"mapped","監"],[[12973,12973],"mapped","企"],[[12974,12974],"mapped","資"],[[12975,12975],"mapped","協"],[[12976,12976],"mapped","夜"],[[12977,12977],"mapped","36"],[[12978,12978],"mapped","37"],[[12979,12979],"mapped","38"],[[12980,12980],"mapped","39"],[[12981,12981],"mapped","40"],[[12982,12982],"mapped","41"],[[12983,12983],"mapped","42"],[[12984,12984],"mapped","43"],[[12985,12985],"mapped","44"],[[12986,12986],"mapped","45"],[[12987,12987],"mapped","46"],[[12988,12988],"mapped","47"],[[12989,12989],"mapped","48"],[[12990,12990],"mapped","49"],[[12991,12991],"mapped","50"],[[12992,12992],"mapped","1月"],[[12993,12993],"mapped","2月"],[[12994,12994],"mapped","3月"],[[12995,12995],"mapped","4月"],[[12996,12996],"mapped","5月"],[[12997,12997],"mapped","6月"],[[12998,12998],"mapped","7月"],[[12999,12999],"mapped","8月"],[[13000,13000],"mapped","9月"],[[13001,13001],"mapped","10月"],[[13002,13002],"mapped","11月"],[[13003,13003],"mapped","12月"],[[13004,13004],"mapped","hg"],[[13005,13005],"mapped","erg"],[[13006,13006],"mapped","ev"],[[13007,13007],"mapped","ltd"],[[13008,13008],"mapped","ア"],[[13009,13009],"mapped","イ"],[[13010,13010],"mapped","ウ"],[[13011,13011],"mapped","エ"],[[13012,13012],"mapped","オ"],[[13013,13013],"mapped","カ"],[[13014,13014],"mapped","キ"],[[13015,13015],"mapped","ク"],[[13016,13016],"mapped","ケ"],[[13017,13017],"mapped","コ"],[[13018,13018],"mapped","サ"],[[13019,13019],"mapped","シ"],[[13020,13020],"mapped","ス"],[[13021,13021],"mapped","セ"],[[13022,13022],"mapped","ソ"],[[13023,13023],"mapped","タ"],[[13024,13024],"mapped","チ"],[[13025,13025],"mapped","ツ"],[[13026,13026],"mapped","テ"],[[13027,13027],"mapped","ト"],[[13028,13028],"mapped","ナ"],[[13029,13029],"mapped","ニ"],[[13030,13030],"mapped","ヌ"],[[13031,13031],"mapped","ネ"],[[13032,13032],"mapped","ノ"],[[13033,13033],"mapped","ハ"],[[13034,13034],"mapped","ヒ"],[[13035,13035],"mapped","フ"],[[13036,13036],"mapped","ヘ"],[[13037,13037],"mapped","ホ"],[[13038,13038],"mapped","マ"],[[13039,13039],"mapped","ミ"],[[13040,13040],"mapped","ム"],[[13041,13041],"mapped","メ"],[[13042,13042],"mapped","モ"],[[13043,13043],"mapped","ヤ"],[[13044,13044],"mapped","ユ"],[[13045,13045],"mapped","ヨ"],[[13046,13046],"mapped","ラ"],[[13047,13047],"mapped","リ"],[[13048,13048],"mapped","ル"],[[13049,13049],"mapped","レ"],[[13050,13050],"mapped","ロ"],[[13051,13051],"mapped","ワ"],[[13052,13052],"mapped","ヰ"],[[13053,13053],"mapped","ヱ"],[[13054,13054],"mapped","ヲ"],[[13055,13055],"disallowed"],[[13056,13056],"mapped","アパート"],[[13057,13057],"mapped","アルファ"],[[13058,13058],"mapped","アンペア"],[[13059,13059],"mapped","アール"],[[13060,13060],"mapped","イニング"],[[13061,13061],"mapped","インチ"],[[13062,13062],"mapped","ウォン"],[[13063,13063],"mapped","エスクード"],[[13064,13064],"mapped","エーカー"],[[13065,13065],"mapped","オンス"],[[13066,13066],"mapped","オーム"],[[13067,13067],"mapped","カイリ"],[[13068,13068],"mapped","カラット"],[[13069,13069],"mapped","カロリー"],[[13070,13070],"mapped","ガロン"],[[13071,13071],"mapped","ガンマ"],[[13072,13072],"mapped","ギガ"],[[13073,13073],"mapped","ギニー"],[[13074,13074],"mapped","キュリー"],[[13075,13075],"mapped","ギルダー"],[[13076,13076],"mapped","キロ"],[[13077,13077],"mapped","キログラム"],[[13078,13078],"mapped","キロメートル"],[[13079,13079],"mapped","キロワット"],[[13080,13080],"mapped","グラム"],[[13081,13081],"mapped","グラムトン"],[[13082,13082],"mapped","クルゼイロ"],[[13083,13083],"mapped","クローネ"],[[13084,13084],"mapped","ケース"],[[13085,13085],"mapped","コルナ"],[[13086,13086],"mapped","コーポ"],[[13087,13087],"mapped","サイクル"],[[13088,13088],"mapped","サンチーム"],[[13089,13089],"mapped","シリング"],[[13090,13090],"mapped","センチ"],[[13091,13091],"mapped","セント"],[[13092,13092],"mapped","ダース"],[[13093,13093],"mapped","デシ"],[[13094,13094],"mapped","ドル"],[[13095,13095],"mapped","トン"],[[13096,13096],"mapped","ナノ"],[[13097,13097],"mapped","ノット"],[[13098,13098],"mapped","ハイツ"],[[13099,13099],"mapped","パーセント"],[[13100,13100],"mapped","パーツ"],[[13101,13101],"mapped","バーレル"],[[13102,13102],"mapped","ピアストル"],[[13103,13103],"mapped","ピクル"],[[13104,13104],"mapped","ピコ"],[[13105,13105],"mapped","ビル"],[[13106,13106],"mapped","ファラッド"],[[13107,13107],"mapped","フィート"],[[13108,13108],"mapped","ブッシェル"],[[13109,13109],"mapped","フラン"],[[13110,13110],"mapped","ヘクタール"],[[13111,13111],"mapped","ペソ"],[[13112,13112],"mapped","ペニヒ"],[[13113,13113],"mapped","ヘルツ"],[[13114,13114],"mapped","ペンス"],[[13115,13115],"mapped","ページ"],[[13116,13116],"mapped","ベータ"],[[13117,13117],"mapped","ポイント"],[[13118,13118],"mapped","ボルト"],[[13119,13119],"mapped","ホン"],[[13120,13120],"mapped","ポンド"],[[13121,13121],"mapped","ホール"],[[13122,13122],"mapped","ホーン"],[[13123,13123],"mapped","マイクロ"],[[13124,13124],"mapped","マイル"],[[13125,13125],"mapped","マッハ"],[[13126,13126],"mapped","マルク"],[[13127,13127],"mapped","マンション"],[[13128,13128],"mapped","ミクロン"],[[13129,13129],"mapped","ミリ"],[[13130,13130],"mapped","ミリバール"],[[13131,13131],"mapped","メガ"],[[13132,13132],"mapped","メガトン"],[[13133,13133],"mapped","メートル"],[[13134,13134],"mapped","ヤード"],[[13135,13135],"mapped","ヤール"],[[13136,13136],"mapped","ユアン"],[[13137,13137],"mapped","リットル"],[[13138,13138],"mapped","リラ"],[[13139,13139],"mapped","ルピー"],[[13140,13140],"mapped","ルーブル"],[[13141,13141],"mapped","レム"],[[13142,13142],"mapped","レントゲン"],[[13143,13143],"mapped","ワット"],[[13144,13144],"mapped","0点"],[[13145,13145],"mapped","1点"],[[13146,13146],"mapped","2点"],[[13147,13147],"mapped","3点"],[[13148,13148],"mapped","4点"],[[13149,13149],"mapped","5点"],[[13150,13150],"mapped","6点"],[[13151,13151],"mapped","7点"],[[13152,13152],"mapped","8点"],[[13153,13153],"mapped","9点"],[[13154,13154],"mapped","10点"],[[13155,13155],"mapped","11点"],[[13156,13156],"mapped","12点"],[[13157,13157],"mapped","13点"],[[13158,13158],"mapped","14点"],[[13159,13159],"mapped","15点"],[[13160,13160],"mapped","16点"],[[13161,13161],"mapped","17点"],[[13162,13162],"mapped","18点"],[[13163,13163],"mapped","19点"],[[13164,13164],"mapped","20点"],[[13165,13165],"mapped","21点"],[[13166,13166],"mapped","22点"],[[13167,13167],"mapped","23点"],[[13168,13168],"mapped","24点"],[[13169,13169],"mapped","hpa"],[[13170,13170],"mapped","da"],[[13171,13171],"mapped","au"],[[13172,13172],"mapped","bar"],[[13173,13173],"mapped","ov"],[[13174,13174],"mapped","pc"],[[13175,13175],"mapped","dm"],[[13176,13176],"mapped","dm2"],[[13177,13177],"mapped","dm3"],[[13178,13178],"mapped","iu"],[[13179,13179],"mapped","平成"],[[13180,13180],"mapped","昭和"],[[13181,13181],"mapped","大正"],[[13182,13182],"mapped","明治"],[[13183,13183],"mapped","株式会社"],[[13184,13184],"mapped","pa"],[[13185,13185],"mapped","na"],[[13186,13186],"mapped","μa"],[[13187,13187],"mapped","ma"],[[13188,13188],"mapped","ka"],[[13189,13189],"mapped","kb"],[[13190,13190],"mapped","mb"],[[13191,13191],"mapped","gb"],[[13192,13192],"mapped","cal"],[[13193,13193],"mapped","kcal"],[[13194,13194],"mapped","pf"],[[13195,13195],"mapped","nf"],[[13196,13196],"mapped","μf"],[[13197,13197],"mapped","μg"],[[13198,13198],"mapped","mg"],[[13199,13199],"mapped","kg"],[[13200,13200],"mapped","hz"],[[13201,13201],"mapped","khz"],[[13202,13202],"mapped","mhz"],[[13203,13203],"mapped","ghz"],[[13204,13204],"mapped","thz"],[[13205,13205],"mapped","μl"],[[13206,13206],"mapped","ml"],[[13207,13207],"mapped","dl"],[[13208,13208],"mapped","kl"],[[13209,13209],"mapped","fm"],[[13210,13210],"mapped","nm"],[[13211,13211],"mapped","μm"],[[13212,13212],"mapped","mm"],[[13213,13213],"mapped","cm"],[[13214,13214],"mapped","km"],[[13215,13215],"mapped","mm2"],[[13216,13216],"mapped","cm2"],[[13217,13217],"mapped","m2"],[[13218,13218],"mapped","km2"],[[13219,13219],"mapped","mm3"],[[13220,13220],"mapped","cm3"],[[13221,13221],"mapped","m3"],[[13222,13222],"mapped","km3"],[[13223,13223],"mapped","m∕s"],[[13224,13224],"mapped","m∕s2"],[[13225,13225],"mapped","pa"],[[13226,13226],"mapped","kpa"],[[13227,13227],"mapped","mpa"],[[13228,13228],"mapped","gpa"],[[13229,13229],"mapped","rad"],[[13230,13230],"mapped","rad∕s"],[[13231,13231],"mapped","rad∕s2"],[[13232,13232],"mapped","ps"],[[13233,13233],"mapped","ns"],[[13234,13234],"mapped","μs"],[[13235,13235],"mapped","ms"],[[13236,13236],"mapped","pv"],[[13237,13237],"mapped","nv"],[[13238,13238],"mapped","μv"],[[13239,13239],"mapped","mv"],[[13240,13240],"mapped","kv"],[[13241,13241],"mapped","mv"],[[13242,13242],"mapped","pw"],[[13243,13243],"mapped","nw"],[[13244,13244],"mapped","μw"],[[13245,13245],"mapped","mw"],[[13246,13246],"mapped","kw"],[[13247,13247],"mapped","mw"],[[13248,13248],"mapped","kω"],[[13249,13249],"mapped","mω"],[[13250,13250],"disallowed"],[[13251,13251],"mapped","bq"],[[13252,13252],"mapped","cc"],[[13253,13253],"mapped","cd"],[[13254,13254],"mapped","c∕kg"],[[13255,13255],"disallowed"],[[13256,13256],"mapped","db"],[[13257,13257],"mapped","gy"],[[13258,13258],"mapped","ha"],[[13259,13259],"mapped","hp"],[[13260,13260],"mapped","in"],[[13261,13261],"mapped","kk"],[[13262,13262],"mapped","km"],[[13263,13263],"mapped","kt"],[[13264,13264],"mapped","lm"],[[13265,13265],"mapped","ln"],[[13266,13266],"mapped","log"],[[13267,13267],"mapped","lx"],[[13268,13268],"mapped","mb"],[[13269,13269],"mapped","mil"],[[13270,13270],"mapped","mol"],[[13271,13271],"mapped","ph"],[[13272,13272],"disallowed"],[[13273,13273],"mapped","ppm"],[[13274,13274],"mapped","pr"],[[13275,13275],"mapped","sr"],[[13276,13276],"mapped","sv"],[[13277,13277],"mapped","wb"],[[13278,13278],"mapped","v∕m"],[[13279,13279],"mapped","a∕m"],[[13280,13280],"mapped","1日"],[[13281,13281],"mapped","2日"],[[13282,13282],"mapped","3日"],[[13283,13283],"mapped","4日"],[[13284,13284],"mapped","5日"],[[13285,13285],"mapped","6日"],[[13286,13286],"mapped","7日"],[[13287,13287],"mapped","8日"],[[13288,13288],"mapped","9日"],[[13289,13289],"mapped","10日"],[[13290,13290],"mapped","11日"],[[13291,13291],"mapped","12日"],[[13292,13292],"mapped","13日"],[[13293,13293],"mapped","14日"],[[13294,13294],"mapped","15日"],[[13295,13295],"mapped","16日"],[[13296,13296],"mapped","17日"],[[13297,13297],"mapped","18日"],[[13298,13298],"mapped","19日"],[[13299,13299],"mapped","20日"],[[13300,13300],"mapped","21日"],[[13301,13301],"mapped","22日"],[[13302,13302],"mapped","23日"],[[13303,13303],"mapped","24日"],[[13304,13304],"mapped","25日"],[[13305,13305],"mapped","26日"],[[13306,13306],"mapped","27日"],[[13307,13307],"mapped","28日"],[[13308,13308],"mapped","29日"],[[13309,13309],"mapped","30日"],[[13310,13310],"mapped","31日"],[[13311,13311],"mapped","gal"],[[13312,19893],"valid"],[[19894,19903],"disallowed"],[[19904,19967],"valid","","NV8"],[[19968,40869],"valid"],[[40870,40891],"valid"],[[40892,40899],"valid"],[[40900,40907],"valid"],[[40908,40908],"valid"],[[40909,40917],"valid"],[[40918,40938],"valid"],[[40939,40959],"disallowed"],[[40960,42124],"valid"],[[42125,42127],"disallowed"],[[42128,42145],"valid","","NV8"],[[42146,42147],"valid","","NV8"],[[42148,42163],"valid","","NV8"],[[42164,42164],"valid","","NV8"],[[42165,42176],"valid","","NV8"],[[42177,42177],"valid","","NV8"],[[42178,42180],"valid","","NV8"],[[42181,42181],"valid","","NV8"],[[42182,42182],"valid","","NV8"],[[42183,42191],"disallowed"],[[42192,42237],"valid"],[[42238,42239],"valid","","NV8"],[[42240,42508],"valid"],[[42509,42511],"valid","","NV8"],[[42512,42539],"valid"],[[42540,42559],"disallowed"],[[42560,42560],"mapped","ꙁ"],[[42561,42561],"valid"],[[42562,42562],"mapped","ꙃ"],[[42563,42563],"valid"],[[42564,42564],"mapped","ꙅ"],[[42565,42565],"valid"],[[42566,42566],"mapped","ꙇ"],[[42567,42567],"valid"],[[42568,42568],"mapped","ꙉ"],[[42569,42569],"valid"],[[42570,42570],"mapped","ꙋ"],[[42571,42571],"valid"],[[42572,42572],"mapped","ꙍ"],[[42573,42573],"valid"],[[42574,42574],"mapped","ꙏ"],[[42575,42575],"valid"],[[42576,42576],"mapped","ꙑ"],[[42577,42577],"valid"],[[42578,42578],"mapped","ꙓ"],[[42579,42579],"valid"],[[42580,42580],"mapped","ꙕ"],[[42581,42581],"valid"],[[42582,42582],"mapped","ꙗ"],[[42583,42583],"valid"],[[42584,42584],"mapped","ꙙ"],[[42585,42585],"valid"],[[42586,42586],"mapped","ꙛ"],[[42587,42587],"valid"],[[42588,42588],"mapped","ꙝ"],[[42589,42589],"valid"],[[42590,42590],"mapped","ꙟ"],[[42591,42591],"valid"],[[42592,42592],"mapped","ꙡ"],[[42593,42593],"valid"],[[42594,42594],"mapped","ꙣ"],[[42595,42595],"valid"],[[42596,42596],"mapped","ꙥ"],[[42597,42597],"valid"],[[42598,42598],"mapped","ꙧ"],[[42599,42599],"valid"],[[42600,42600],"mapped","ꙩ"],[[42601,42601],"valid"],[[42602,42602],"mapped","ꙫ"],[[42603,42603],"valid"],[[42604,42604],"mapped","ꙭ"],[[42605,42607],"valid"],[[42608,42611],"valid","","NV8"],[[42612,42619],"valid"],[[42620,42621],"valid"],[[42622,42622],"valid","","NV8"],[[42623,42623],"valid"],[[42624,42624],"mapped","ꚁ"],[[42625,42625],"valid"],[[42626,42626],"mapped","ꚃ"],[[42627,42627],"valid"],[[42628,42628],"mapped","ꚅ"],[[42629,42629],"valid"],[[42630,42630],"mapped","ꚇ"],[[42631,42631],"valid"],[[42632,42632],"mapped","ꚉ"],[[42633,42633],"valid"],[[42634,42634],"mapped","ꚋ"],[[42635,42635],"valid"],[[42636,42636],"mapped","ꚍ"],[[42637,42637],"valid"],[[42638,42638],"mapped","ꚏ"],[[42639,42639],"valid"],[[42640,42640],"mapped","ꚑ"],[[42641,42641],"valid"],[[42642,42642],"mapped","ꚓ"],[[42643,42643],"valid"],[[42644,42644],"mapped","ꚕ"],[[42645,42645],"valid"],[[42646,42646],"mapped","ꚗ"],[[42647,42647],"valid"],[[42648,42648],"mapped","ꚙ"],[[42649,42649],"valid"],[[42650,42650],"mapped","ꚛ"],[[42651,42651],"valid"],[[42652,42652],"mapped","ъ"],[[42653,42653],"mapped","ь"],[[42654,42654],"valid"],[[42655,42655],"valid"],[[42656,42725],"valid"],[[42726,42735],"valid","","NV8"],[[42736,42737],"valid"],[[42738,42743],"valid","","NV8"],[[42744,42751],"disallowed"],[[42752,42774],"valid","","NV8"],[[42775,42778],"valid"],[[42779,42783],"valid"],[[42784,42785],"valid","","NV8"],[[42786,42786],"mapped","ꜣ"],[[42787,42787],"valid"],[[42788,42788],"mapped","ꜥ"],[[42789,42789],"valid"],[[42790,42790],"mapped","ꜧ"],[[42791,42791],"valid"],[[42792,42792],"mapped","ꜩ"],[[42793,42793],"valid"],[[42794,42794],"mapped","ꜫ"],[[42795,42795],"valid"],[[42796,42796],"mapped","ꜭ"],[[42797,42797],"valid"],[[42798,42798],"mapped","ꜯ"],[[42799,42801],"valid"],[[42802,42802],"mapped","ꜳ"],[[42803,42803],"valid"],[[42804,42804],"mapped","ꜵ"],[[42805,42805],"valid"],[[42806,42806],"mapped","ꜷ"],[[42807,42807],"valid"],[[42808,42808],"mapped","ꜹ"],[[42809,42809],"valid"],[[42810,42810],"mapped","ꜻ"],[[42811,42811],"valid"],[[42812,42812],"mapped","ꜽ"],[[42813,42813],"valid"],[[42814,42814],"mapped","ꜿ"],[[42815,42815],"valid"],[[42816,42816],"mapped","ꝁ"],[[42817,42817],"valid"],[[42818,42818],"mapped","ꝃ"],[[42819,42819],"valid"],[[42820,42820],"mapped","ꝅ"],[[42821,42821],"valid"],[[42822,42822],"mapped","ꝇ"],[[42823,42823],"valid"],[[42824,42824],"mapped","ꝉ"],[[42825,42825],"valid"],[[42826,42826],"mapped","ꝋ"],[[42827,42827],"valid"],[[42828,42828],"mapped","ꝍ"],[[42829,42829],"valid"],[[42830,42830],"mapped","ꝏ"],[[42831,42831],"valid"],[[42832,42832],"mapped","ꝑ"],[[42833,42833],"valid"],[[42834,42834],"mapped","ꝓ"],[[42835,42835],"valid"],[[42836,42836],"mapped","ꝕ"],[[42837,42837],"valid"],[[42838,42838],"mapped","ꝗ"],[[42839,42839],"valid"],[[42840,42840],"mapped","ꝙ"],[[42841,42841],"valid"],[[42842,42842],"mapped","ꝛ"],[[42843,42843],"valid"],[[42844,42844],"mapped","ꝝ"],[[42845,42845],"valid"],[[42846,42846],"mapped","ꝟ"],[[42847,42847],"valid"],[[42848,42848],"mapped","ꝡ"],[[42849,42849],"valid"],[[42850,42850],"mapped","ꝣ"],[[42851,42851],"valid"],[[42852,42852],"mapped","ꝥ"],[[42853,42853],"valid"],[[42854,42854],"mapped","ꝧ"],[[42855,42855],"valid"],[[42856,42856],"mapped","ꝩ"],[[42857,42857],"valid"],[[42858,42858],"mapped","ꝫ"],[[42859,42859],"valid"],[[42860,42860],"mapped","ꝭ"],[[42861,42861],"valid"],[[42862,42862],"mapped","ꝯ"],[[42863,42863],"valid"],[[42864,42864],"mapped","ꝯ"],[[42865,42872],"valid"],[[42873,42873],"mapped","ꝺ"],[[42874,42874],"valid"],[[42875,42875],"mapped","ꝼ"],[[42876,42876],"valid"],[[42877,42877],"mapped","ᵹ"],[[42878,42878],"mapped","ꝿ"],[[42879,42879],"valid"],[[42880,42880],"mapped","ꞁ"],[[42881,42881],"valid"],[[42882,42882],"mapped","ꞃ"],[[42883,42883],"valid"],[[42884,42884],"mapped","ꞅ"],[[42885,42885],"valid"],[[42886,42886],"mapped","ꞇ"],[[42887,42888],"valid"],[[42889,42890],"valid","","NV8"],[[42891,42891],"mapped","ꞌ"],[[42892,42892],"valid"],[[42893,42893],"mapped","ɥ"],[[42894,42894],"valid"],[[42895,42895],"valid"],[[42896,42896],"mapped","ꞑ"],[[42897,42897],"valid"],[[42898,42898],"mapped","ꞓ"],[[42899,42899],"valid"],[[42900,42901],"valid"],[[42902,42902],"mapped","ꞗ"],[[42903,42903],"valid"],[[42904,42904],"mapped","ꞙ"],[[42905,42905],"valid"],[[42906,42906],"mapped","ꞛ"],[[42907,42907],"valid"],[[42908,42908],"mapped","ꞝ"],[[42909,42909],"valid"],[[42910,42910],"mapped","ꞟ"],[[42911,42911],"valid"],[[42912,42912],"mapped","ꞡ"],[[42913,42913],"valid"],[[42914,42914],"mapped","ꞣ"],[[42915,42915],"valid"],[[42916,42916],"mapped","ꞥ"],[[42917,42917],"valid"],[[42918,42918],"mapped","ꞧ"],[[42919,42919],"valid"],[[42920,42920],"mapped","ꞩ"],[[42921,42921],"valid"],[[42922,42922],"mapped","ɦ"],[[42923,42923],"mapped","ɜ"],[[42924,42924],"mapped","ɡ"],[[42925,42925],"mapped","ɬ"],[[42926,42926],"mapped","ɪ"],[[42927,42927],"disallowed"],[[42928,42928],"mapped","ʞ"],[[42929,42929],"mapped","ʇ"],[[42930,42930],"mapped","ʝ"],[[42931,42931],"mapped","ꭓ"],[[42932,42932],"mapped","ꞵ"],[[42933,42933],"valid"],[[42934,42934],"mapped","ꞷ"],[[42935,42935],"valid"],[[42936,42998],"disallowed"],[[42999,42999],"valid"],[[43000,43000],"mapped","ħ"],[[43001,43001],"mapped","œ"],[[43002,43002],"valid"],[[43003,43007],"valid"],[[43008,43047],"valid"],[[43048,43051],"valid","","NV8"],[[43052,43055],"disallowed"],[[43056,43065],"valid","","NV8"],[[43066,43071],"disallowed"],[[43072,43123],"valid"],[[43124,43127],"valid","","NV8"],[[43128,43135],"disallowed"],[[43136,43204],"valid"],[[43205,43205],"valid"],[[43206,43213],"disallowed"],[[43214,43215],"valid","","NV8"],[[43216,43225],"valid"],[[43226,43231],"disallowed"],[[43232,43255],"valid"],[[43256,43258],"valid","","NV8"],[[43259,43259],"valid"],[[43260,43260],"valid","","NV8"],[[43261,43261],"valid"],[[43262,43263],"disallowed"],[[43264,43309],"valid"],[[43310,43311],"valid","","NV8"],[[43312,43347],"valid"],[[43348,43358],"disallowed"],[[43359,43359],"valid","","NV8"],[[43360,43388],"valid","","NV8"],[[43389,43391],"disallowed"],[[43392,43456],"valid"],[[43457,43469],"valid","","NV8"],[[43470,43470],"disallowed"],[[43471,43481],"valid"],[[43482,43485],"disallowed"],[[43486,43487],"valid","","NV8"],[[43488,43518],"valid"],[[43519,43519],"disallowed"],[[43520,43574],"valid"],[[43575,43583],"disallowed"],[[43584,43597],"valid"],[[43598,43599],"disallowed"],[[43600,43609],"valid"],[[43610,43611],"disallowed"],[[43612,43615],"valid","","NV8"],[[43616,43638],"valid"],[[43639,43641],"valid","","NV8"],[[43642,43643],"valid"],[[43644,43647],"valid"],[[43648,43714],"valid"],[[43715,43738],"disallowed"],[[43739,43741],"valid"],[[43742,43743],"valid","","NV8"],[[43744,43759],"valid"],[[43760,43761],"valid","","NV8"],[[43762,43766],"valid"],[[43767,43776],"disallowed"],[[43777,43782],"valid"],[[43783,43784],"disallowed"],[[43785,43790],"valid"],[[43791,43792],"disallowed"],[[43793,43798],"valid"],[[43799,43807],"disallowed"],[[43808,43814],"valid"],[[43815,43815],"disallowed"],[[43816,43822],"valid"],[[43823,43823],"disallowed"],[[43824,43866],"valid"],[[43867,43867],"valid","","NV8"],[[43868,43868],"mapped","ꜧ"],[[43869,43869],"mapped","ꬷ"],[[43870,43870],"mapped","ɫ"],[[43871,43871],"mapped","ꭒ"],[[43872,43875],"valid"],[[43876,43877],"valid"],[[43878,43887],"disallowed"],[[43888,43888],"mapped","Ꭰ"],[[43889,43889],"mapped","Ꭱ"],[[43890,43890],"mapped","Ꭲ"],[[43891,43891],"mapped","Ꭳ"],[[43892,43892],"mapped","Ꭴ"],[[43893,43893],"mapped","Ꭵ"],[[43894,43894],"mapped","Ꭶ"],[[43895,43895],"mapped","Ꭷ"],[[43896,43896],"mapped","Ꭸ"],[[43897,43897],"mapped","Ꭹ"],[[43898,43898],"mapped","Ꭺ"],[[43899,43899],"mapped","Ꭻ"],[[43900,43900],"mapped","Ꭼ"],[[43901,43901],"mapped","Ꭽ"],[[43902,43902],"mapped","Ꭾ"],[[43903,43903],"mapped","Ꭿ"],[[43904,43904],"mapped","Ꮀ"],[[43905,43905],"mapped","Ꮁ"],[[43906,43906],"mapped","Ꮂ"],[[43907,43907],"mapped","Ꮃ"],[[43908,43908],"mapped","Ꮄ"],[[43909,43909],"mapped","Ꮅ"],[[43910,43910],"mapped","Ꮆ"],[[43911,43911],"mapped","Ꮇ"],[[43912,43912],"mapped","Ꮈ"],[[43913,43913],"mapped","Ꮉ"],[[43914,43914],"mapped","Ꮊ"],[[43915,43915],"mapped","Ꮋ"],[[43916,43916],"mapped","Ꮌ"],[[43917,43917],"mapped","Ꮍ"],[[43918,43918],"mapped","Ꮎ"],[[43919,43919],"mapped","Ꮏ"],[[43920,43920],"mapped","Ꮐ"],[[43921,43921],"mapped","Ꮑ"],[[43922,43922],"mapped","Ꮒ"],[[43923,43923],"mapped","Ꮓ"],[[43924,43924],"mapped","Ꮔ"],[[43925,43925],"mapped","Ꮕ"],[[43926,43926],"mapped","Ꮖ"],[[43927,43927],"mapped","Ꮗ"],[[43928,43928],"mapped","Ꮘ"],[[43929,43929],"mapped","Ꮙ"],[[43930,43930],"mapped","Ꮚ"],[[43931,43931],"mapped","Ꮛ"],[[43932,43932],"mapped","Ꮜ"],[[43933,43933],"mapped","Ꮝ"],[[43934,43934],"mapped","Ꮞ"],[[43935,43935],"mapped","Ꮟ"],[[43936,43936],"mapped","Ꮠ"],[[43937,43937],"mapped","Ꮡ"],[[43938,43938],"mapped","Ꮢ"],[[43939,43939],"mapped","Ꮣ"],[[43940,43940],"mapped","Ꮤ"],[[43941,43941],"mapped","Ꮥ"],[[43942,43942],"mapped","Ꮦ"],[[43943,43943],"mapped","Ꮧ"],[[43944,43944],"mapped","Ꮨ"],[[43945,43945],"mapped","Ꮩ"],[[43946,43946],"mapped","Ꮪ"],[[43947,43947],"mapped","Ꮫ"],[[43948,43948],"mapped","Ꮬ"],[[43949,43949],"mapped","Ꮭ"],[[43950,43950],"mapped","Ꮮ"],[[43951,43951],"mapped","Ꮯ"],[[43952,43952],"mapped","Ꮰ"],[[43953,43953],"mapped","Ꮱ"],[[43954,43954],"mapped","Ꮲ"],[[43955,43955],"mapped","Ꮳ"],[[43956,43956],"mapped","Ꮴ"],[[43957,43957],"mapped","Ꮵ"],[[43958,43958],"mapped","Ꮶ"],[[43959,43959],"mapped","Ꮷ"],[[43960,43960],"mapped","Ꮸ"],[[43961,43961],"mapped","Ꮹ"],[[43962,43962],"mapped","Ꮺ"],[[43963,43963],"mapped","Ꮻ"],[[43964,43964],"mapped","Ꮼ"],[[43965,43965],"mapped","Ꮽ"],[[43966,43966],"mapped","Ꮾ"],[[43967,43967],"mapped","Ꮿ"],[[43968,44010],"valid"],[[44011,44011],"valid","","NV8"],[[44012,44013],"valid"],[[44014,44015],"disallowed"],[[44016,44025],"valid"],[[44026,44031],"disallowed"],[[44032,55203],"valid"],[[55204,55215],"disallowed"],[[55216,55238],"valid","","NV8"],[[55239,55242],"disallowed"],[[55243,55291],"valid","","NV8"],[[55292,55295],"disallowed"],[[55296,57343],"disallowed"],[[57344,63743],"disallowed"],[[63744,63744],"mapped","豈"],[[63745,63745],"mapped","更"],[[63746,63746],"mapped","車"],[[63747,63747],"mapped","賈"],[[63748,63748],"mapped","滑"],[[63749,63749],"mapped","串"],[[63750,63750],"mapped","句"],[[63751,63752],"mapped","龜"],[[63753,63753],"mapped","契"],[[63754,63754],"mapped","金"],[[63755,63755],"mapped","喇"],[[63756,63756],"mapped","奈"],[[63757,63757],"mapped","懶"],[[63758,63758],"mapped","癩"],[[63759,63759],"mapped","羅"],[[63760,63760],"mapped","蘿"],[[63761,63761],"mapped","螺"],[[63762,63762],"mapped","裸"],[[63763,63763],"mapped","邏"],[[63764,63764],"mapped","樂"],[[63765,63765],"mapped","洛"],[[63766,63766],"mapped","烙"],[[63767,63767],"mapped","珞"],[[63768,63768],"mapped","落"],[[63769,63769],"mapped","酪"],[[63770,63770],"mapped","駱"],[[63771,63771],"mapped","亂"],[[63772,63772],"mapped","卵"],[[63773,63773],"mapped","欄"],[[63774,63774],"mapped","爛"],[[63775,63775],"mapped","蘭"],[[63776,63776],"mapped","鸞"],[[63777,63777],"mapped","嵐"],[[63778,63778],"mapped","濫"],[[63779,63779],"mapped","藍"],[[63780,63780],"mapped","襤"],[[63781,63781],"mapped","拉"],[[63782,63782],"mapped","臘"],[[63783,63783],"mapped","蠟"],[[63784,63784],"mapped","廊"],[[63785,63785],"mapped","朗"],[[63786,63786],"mapped","浪"],[[63787,63787],"mapped","狼"],[[63788,63788],"mapped","郎"],[[63789,63789],"mapped","來"],[[63790,63790],"mapped","冷"],[[63791,63791],"mapped","勞"],[[63792,63792],"mapped","擄"],[[63793,63793],"mapped","櫓"],[[63794,63794],"mapped","爐"],[[63795,63795],"mapped","盧"],[[63796,63796],"mapped","老"],[[63797,63797],"mapped","蘆"],[[63798,63798],"mapped","虜"],[[63799,63799],"mapped","路"],[[63800,63800],"mapped","露"],[[63801,63801],"mapped","魯"],[[63802,63802],"mapped","鷺"],[[63803,63803],"mapped","碌"],[[63804,63804],"mapped","祿"],[[63805,63805],"mapped","綠"],[[63806,63806],"mapped","菉"],[[63807,63807],"mapped","錄"],[[63808,63808],"mapped","鹿"],[[63809,63809],"mapped","論"],[[63810,63810],"mapped","壟"],[[63811,63811],"mapped","弄"],[[63812,63812],"mapped","籠"],[[63813,63813],"mapped","聾"],[[63814,63814],"mapped","牢"],[[63815,63815],"mapped","磊"],[[63816,63816],"mapped","賂"],[[63817,63817],"mapped","雷"],[[63818,63818],"mapped","壘"],[[63819,63819],"mapped","屢"],[[63820,63820],"mapped","樓"],[[63821,63821],"mapped","淚"],[[63822,63822],"mapped","漏"],[[63823,63823],"mapped","累"],[[63824,63824],"mapped","縷"],[[63825,63825],"mapped","陋"],[[63826,63826],"mapped","勒"],[[63827,63827],"mapped","肋"],[[63828,63828],"mapped","凜"],[[63829,63829],"mapped","凌"],[[63830,63830],"mapped","稜"],[[63831,63831],"mapped","綾"],[[63832,63832],"mapped","菱"],[[63833,63833],"mapped","陵"],[[63834,63834],"mapped","讀"],[[63835,63835],"mapped","拏"],[[63836,63836],"mapped","樂"],[[63837,63837],"mapped","諾"],[[63838,63838],"mapped","丹"],[[63839,63839],"mapped","寧"],[[63840,63840],"mapped","怒"],[[63841,63841],"mapped","率"],[[63842,63842],"mapped","異"],[[63843,63843],"mapped","北"],[[63844,63844],"mapped","磻"],[[63845,63845],"mapped","便"],[[63846,63846],"mapped","復"],[[63847,63847],"mapped","不"],[[63848,63848],"mapped","泌"],[[63849,63849],"mapped","數"],[[63850,63850],"mapped","索"],[[63851,63851],"mapped","參"],[[63852,63852],"mapped","塞"],[[63853,63853],"mapped","省"],[[63854,63854],"mapped","葉"],[[63855,63855],"mapped","說"],[[63856,63856],"mapped","殺"],[[63857,63857],"mapped","辰"],[[63858,63858],"mapped","沈"],[[63859,63859],"mapped","拾"],[[63860,63860],"mapped","若"],[[63861,63861],"mapped","掠"],[[63862,63862],"mapped","略"],[[63863,63863],"mapped","亮"],[[63864,63864],"mapped","兩"],[[63865,63865],"mapped","凉"],[[63866,63866],"mapped","梁"],[[63867,63867],"mapped","糧"],[[63868,63868],"mapped","良"],[[63869,63869],"mapped","諒"],[[63870,63870],"mapped","量"],[[63871,63871],"mapped","勵"],[[63872,63872],"mapped","呂"],[[63873,63873],"mapped","女"],[[63874,63874],"mapped","廬"],[[63875,63875],"mapped","旅"],[[63876,63876],"mapped","濾"],[[63877,63877],"mapped","礪"],[[63878,63878],"mapped","閭"],[[63879,63879],"mapped","驪"],[[63880,63880],"mapped","麗"],[[63881,63881],"mapped","黎"],[[63882,63882],"mapped","力"],[[63883,63883],"mapped","曆"],[[63884,63884],"mapped","歷"],[[63885,63885],"mapped","轢"],[[63886,63886],"mapped","年"],[[63887,63887],"mapped","憐"],[[63888,63888],"mapped","戀"],[[63889,63889],"mapped","撚"],[[63890,63890],"mapped","漣"],[[63891,63891],"mapped","煉"],[[63892,63892],"mapped","璉"],[[63893,63893],"mapped","秊"],[[63894,63894],"mapped","練"],[[63895,63895],"mapped","聯"],[[63896,63896],"mapped","輦"],[[63897,63897],"mapped","蓮"],[[63898,63898],"mapped","連"],[[63899,63899],"mapped","鍊"],[[63900,63900],"mapped","列"],[[63901,63901],"mapped","劣"],[[63902,63902],"mapped","咽"],[[63903,63903],"mapped","烈"],[[63904,63904],"mapped","裂"],[[63905,63905],"mapped","說"],[[63906,63906],"mapped","廉"],[[63907,63907],"mapped","念"],[[63908,63908],"mapped","捻"],[[63909,63909],"mapped","殮"],[[63910,63910],"mapped","簾"],[[63911,63911],"mapped","獵"],[[63912,63912],"mapped","令"],[[63913,63913],"mapped","囹"],[[63914,63914],"mapped","寧"],[[63915,63915],"mapped","嶺"],[[63916,63916],"mapped","怜"],[[63917,63917],"mapped","玲"],[[63918,63918],"mapped","瑩"],[[63919,63919],"mapped","羚"],[[63920,63920],"mapped","聆"],[[63921,63921],"mapped","鈴"],[[63922,63922],"mapped","零"],[[63923,63923],"mapped","靈"],[[63924,63924],"mapped","領"],[[63925,63925],"mapped","例"],[[63926,63926],"mapped","禮"],[[63927,63927],"mapped","醴"],[[63928,63928],"mapped","隸"],[[63929,63929],"mapped","惡"],[[63930,63930],"mapped","了"],[[63931,63931],"mapped","僚"],[[63932,63932],"mapped","寮"],[[63933,63933],"mapped","尿"],[[63934,63934],"mapped","料"],[[63935,63935],"mapped","樂"],[[63936,63936],"mapped","燎"],[[63937,63937],"mapped","療"],[[63938,63938],"mapped","蓼"],[[63939,63939],"mapped","遼"],[[63940,63940],"mapped","龍"],[[63941,63941],"mapped","暈"],[[63942,63942],"mapped","阮"],[[63943,63943],"mapped","劉"],[[63944,63944],"mapped","杻"],[[63945,63945],"mapped","柳"],[[63946,63946],"mapped","流"],[[63947,63947],"mapped","溜"],[[63948,63948],"mapped","琉"],[[63949,63949],"mapped","留"],[[63950,63950],"mapped","硫"],[[63951,63951],"mapped","紐"],[[63952,63952],"mapped","類"],[[63953,63953],"mapped","六"],[[63954,63954],"mapped","戮"],[[63955,63955],"mapped","陸"],[[63956,63956],"mapped","倫"],[[63957,63957],"mapped","崙"],[[63958,63958],"mapped","淪"],[[63959,63959],"mapped","輪"],[[63960,63960],"mapped","律"],[[63961,63961],"mapped","慄"],[[63962,63962],"mapped","栗"],[[63963,63963],"mapped","率"],[[63964,63964],"mapped","隆"],[[63965,63965],"mapped","利"],[[63966,63966],"mapped","吏"],[[63967,63967],"mapped","履"],[[63968,63968],"mapped","易"],[[63969,63969],"mapped","李"],[[63970,63970],"mapped","梨"],[[63971,63971],"mapped","泥"],[[63972,63972],"mapped","理"],[[63973,63973],"mapped","痢"],[[63974,63974],"mapped","罹"],[[63975,63975],"mapped","裏"],[[63976,63976],"mapped","裡"],[[63977,63977],"mapped","里"],[[63978,63978],"mapped","離"],[[63979,63979],"mapped","匿"],[[63980,63980],"mapped","溺"],[[63981,63981],"mapped","吝"],[[63982,63982],"mapped","燐"],[[63983,63983],"mapped","璘"],[[63984,63984],"mapped","藺"],[[63985,63985],"mapped","隣"],[[63986,63986],"mapped","鱗"],[[63987,63987],"mapped","麟"],[[63988,63988],"mapped","林"],[[63989,63989],"mapped","淋"],[[63990,63990],"mapped","臨"],[[63991,63991],"mapped","立"],[[63992,63992],"mapped","笠"],[[63993,63993],"mapped","粒"],[[63994,63994],"mapped","狀"],[[63995,63995],"mapped","炙"],[[63996,63996],"mapped","識"],[[63997,63997],"mapped","什"],[[63998,63998],"mapped","茶"],[[63999,63999],"mapped","刺"],[[64000,64000],"mapped","切"],[[64001,64001],"mapped","度"],[[64002,64002],"mapped","拓"],[[64003,64003],"mapped","糖"],[[64004,64004],"mapped","宅"],[[64005,64005],"mapped","洞"],[[64006,64006],"mapped","暴"],[[64007,64007],"mapped","輻"],[[64008,64008],"mapped","行"],[[64009,64009],"mapped","降"],[[64010,64010],"mapped","見"],[[64011,64011],"mapped","廓"],[[64012,64012],"mapped","兀"],[[64013,64013],"mapped","嗀"],[[64014,64015],"valid"],[[64016,64016],"mapped","塚"],[[64017,64017],"valid"],[[64018,64018],"mapped","晴"],[[64019,64020],"valid"],[[64021,64021],"mapped","凞"],[[64022,64022],"mapped","猪"],[[64023,64023],"mapped","益"],[[64024,64024],"mapped","礼"],[[64025,64025],"mapped","神"],[[64026,64026],"mapped","祥"],[[64027,64027],"mapped","福"],[[64028,64028],"mapped","靖"],[[64029,64029],"mapped","精"],[[64030,64030],"mapped","羽"],[[64031,64031],"valid"],[[64032,64032],"mapped","蘒"],[[64033,64033],"valid"],[[64034,64034],"mapped","諸"],[[64035,64036],"valid"],[[64037,64037],"mapped","逸"],[[64038,64038],"mapped","都"],[[64039,64041],"valid"],[[64042,64042],"mapped","飯"],[[64043,64043],"mapped","飼"],[[64044,64044],"mapped","館"],[[64045,64045],"mapped","鶴"],[[64046,64046],"mapped","郞"],[[64047,64047],"mapped","隷"],[[64048,64048],"mapped","侮"],[[64049,64049],"mapped","僧"],[[64050,64050],"mapped","免"],[[64051,64051],"mapped","勉"],[[64052,64052],"mapped","勤"],[[64053,64053],"mapped","卑"],[[64054,64054],"mapped","喝"],[[64055,64055],"mapped","嘆"],[[64056,64056],"mapped","器"],[[64057,64057],"mapped","塀"],[[64058,64058],"mapped","墨"],[[64059,64059],"mapped","層"],[[64060,64060],"mapped","屮"],[[64061,64061],"mapped","悔"],[[64062,64062],"mapped","慨"],[[64063,64063],"mapped","憎"],[[64064,64064],"mapped","懲"],[[64065,64065],"mapped","敏"],[[64066,64066],"mapped","既"],[[64067,64067],"mapped","暑"],[[64068,64068],"mapped","梅"],[[64069,64069],"mapped","海"],[[64070,64070],"mapped","渚"],[[64071,64071],"mapped","漢"],[[64072,64072],"mapped","煮"],[[64073,64073],"mapped","爫"],[[64074,64074],"mapped","琢"],[[64075,64075],"mapped","碑"],[[64076,64076],"mapped","社"],[[64077,64077],"mapped","祉"],[[64078,64078],"mapped","祈"],[[64079,64079],"mapped","祐"],[[64080,64080],"mapped","祖"],[[64081,64081],"mapped","祝"],[[64082,64082],"mapped","禍"],[[64083,64083],"mapped","禎"],[[64084,64084],"mapped","穀"],[[64085,64085],"mapped","突"],[[64086,64086],"mapped","節"],[[64087,64087],"mapped","練"],[[64088,64088],"mapped","縉"],[[64089,64089],"mapped","繁"],[[64090,64090],"mapped","署"],[[64091,64091],"mapped","者"],[[64092,64092],"mapped","臭"],[[64093,64094],"mapped","艹"],[[64095,64095],"mapped","著"],[[64096,64096],"mapped","褐"],[[64097,64097],"mapped","視"],[[64098,64098],"mapped","謁"],[[64099,64099],"mapped","謹"],[[64100,64100],"mapped","賓"],[[64101,64101],"mapped","贈"],[[64102,64102],"mapped","辶"],[[64103,64103],"mapped","逸"],[[64104,64104],"mapped","難"],[[64105,64105],"mapped","響"],[[64106,64106],"mapped","頻"],[[64107,64107],"mapped","恵"],[[64108,64108],"mapped","𤋮"],[[64109,64109],"mapped","舘"],[[64110,64111],"disallowed"],[[64112,64112],"mapped","並"],[[64113,64113],"mapped","况"],[[64114,64114],"mapped","全"],[[64115,64115],"mapped","侀"],[[64116,64116],"mapped","充"],[[64117,64117],"mapped","冀"],[[64118,64118],"mapped","勇"],[[64119,64119],"mapped","勺"],[[64120,64120],"mapped","喝"],[[64121,64121],"mapped","啕"],[[64122,64122],"mapped","喙"],[[64123,64123],"mapped","嗢"],[[64124,64124],"mapped","塚"],[[64125,64125],"mapped","墳"],[[64126,64126],"mapped","奄"],[[64127,64127],"mapped","奔"],[[64128,64128],"mapped","婢"],[[64129,64129],"mapped","嬨"],[[64130,64130],"mapped","廒"],[[64131,64131],"mapped","廙"],[[64132,64132],"mapped","彩"],[[64133,64133],"mapped","徭"],[[64134,64134],"mapped","惘"],[[64135,64135],"mapped","慎"],[[64136,64136],"mapped","愈"],[[64137,64137],"mapped","憎"],[[64138,64138],"mapped","慠"],[[64139,64139],"mapped","懲"],[[64140,64140],"mapped","戴"],[[64141,64141],"mapped","揄"],[[64142,64142],"mapped","搜"],[[64143,64143],"mapped","摒"],[[64144,64144],"mapped","敖"],[[64145,64145],"mapped","晴"],[[64146,64146],"mapped","朗"],[[64147,64147],"mapped","望"],[[64148,64148],"mapped","杖"],[[64149,64149],"mapped","歹"],[[64150,64150],"mapped","殺"],[[64151,64151],"mapped","流"],[[64152,64152],"mapped","滛"],[[64153,64153],"mapped","滋"],[[64154,64154],"mapped","漢"],[[64155,64155],"mapped","瀞"],[[64156,64156],"mapped","煮"],[[64157,64157],"mapped","瞧"],[[64158,64158],"mapped","爵"],[[64159,64159],"mapped","犯"],[[64160,64160],"mapped","猪"],[[64161,64161],"mapped","瑱"],[[64162,64162],"mapped","甆"],[[64163,64163],"mapped","画"],[[64164,64164],"mapped","瘝"],[[64165,64165],"mapped","瘟"],[[64166,64166],"mapped","益"],[[64167,64167],"mapped","盛"],[[64168,64168],"mapped","直"],[[64169,64169],"mapped","睊"],[[64170,64170],"mapped","着"],[[64171,64171],"mapped","磌"],[[64172,64172],"mapped","窱"],[[64173,64173],"mapped","節"],[[64174,64174],"mapped","类"],[[64175,64175],"mapped","絛"],[[64176,64176],"mapped","練"],[[64177,64177],"mapped","缾"],[[64178,64178],"mapped","者"],[[64179,64179],"mapped","荒"],[[64180,64180],"mapped","華"],[[64181,64181],"mapped","蝹"],[[64182,64182],"mapped","襁"],[[64183,64183],"mapped","覆"],[[64184,64184],"mapped","視"],[[64185,64185],"mapped","調"],[[64186,64186],"mapped","諸"],[[64187,64187],"mapped","請"],[[64188,64188],"mapped","謁"],[[64189,64189],"mapped","諾"],[[64190,64190],"mapped","諭"],[[64191,64191],"mapped","謹"],[[64192,64192],"mapped","變"],[[64193,64193],"mapped","贈"],[[64194,64194],"mapped","輸"],[[64195,64195],"mapped","遲"],[[64196,64196],"mapped","醙"],[[64197,64197],"mapped","鉶"],[[64198,64198],"mapped","陼"],[[64199,64199],"mapped","難"],[[64200,64200],"mapped","靖"],[[64201,64201],"mapped","韛"],[[64202,64202],"mapped","響"],[[64203,64203],"mapped","頋"],[[64204,64204],"mapped","頻"],[[64205,64205],"mapped","鬒"],[[64206,64206],"mapped","龜"],[[64207,64207],"mapped","𢡊"],[[64208,64208],"mapped","𢡄"],[[64209,64209],"mapped","𣏕"],[[64210,64210],"mapped","㮝"],[[64211,64211],"mapped","䀘"],[[64212,64212],"mapped","䀹"],[[64213,64213],"mapped","𥉉"],[[64214,64214],"mapped","𥳐"],[[64215,64215],"mapped","𧻓"],[[64216,64216],"mapped","齃"],[[64217,64217],"mapped","龎"],[[64218,64255],"disallowed"],[[64256,64256],"mapped","ff"],[[64257,64257],"mapped","fi"],[[64258,64258],"mapped","fl"],[[64259,64259],"mapped","ffi"],[[64260,64260],"mapped","ffl"],[[64261,64262],"mapped","st"],[[64263,64274],"disallowed"],[[64275,64275],"mapped","մն"],[[64276,64276],"mapped","մե"],[[64277,64277],"mapped","մի"],[[64278,64278],"mapped","վն"],[[64279,64279],"mapped","մխ"],[[64280,64284],"disallowed"],[[64285,64285],"mapped","יִ"],[[64286,64286],"valid"],[[64287,64287],"mapped","ײַ"],[[64288,64288],"mapped","ע"],[[64289,64289],"mapped","א"],[[64290,64290],"mapped","ד"],[[64291,64291],"mapped","ה"],[[64292,64292],"mapped","כ"],[[64293,64293],"mapped","ל"],[[64294,64294],"mapped","ם"],[[64295,64295],"mapped","ר"],[[64296,64296],"mapped","ת"],[[64297,64297],"disallowed_STD3_mapped","+"],[[64298,64298],"mapped","שׁ"],[[64299,64299],"mapped","שׂ"],[[64300,64300],"mapped","שּׁ"],[[64301,64301],"mapped","שּׂ"],[[64302,64302],"mapped","אַ"],[[64303,64303],"mapped","אָ"],[[64304,64304],"mapped","אּ"],[[64305,64305],"mapped","בּ"],[[64306,64306],"mapped","גּ"],[[64307,64307],"mapped","דּ"],[[64308,64308],"mapped","הּ"],[[64309,64309],"mapped","וּ"],[[64310,64310],"mapped","זּ"],[[64311,64311],"disallowed"],[[64312,64312],"mapped","טּ"],[[64313,64313],"mapped","יּ"],[[64314,64314],"mapped","ךּ"],[[64315,64315],"mapped","כּ"],[[64316,64316],"mapped","לּ"],[[64317,64317],"disallowed"],[[64318,64318],"mapped","מּ"],[[64319,64319],"disallowed"],[[64320,64320],"mapped","נּ"],[[64321,64321],"mapped","סּ"],[[64322,64322],"disallowed"],[[64323,64323],"mapped","ףּ"],[[64324,64324],"mapped","פּ"],[[64325,64325],"disallowed"],[[64326,64326],"mapped","צּ"],[[64327,64327],"mapped","קּ"],[[64328,64328],"mapped","רּ"],[[64329,64329],"mapped","שּ"],[[64330,64330],"mapped","תּ"],[[64331,64331],"mapped","וֹ"],[[64332,64332],"mapped","בֿ"],[[64333,64333],"mapped","כֿ"],[[64334,64334],"mapped","פֿ"],[[64335,64335],"mapped","אל"],[[64336,64337],"mapped","ٱ"],[[64338,64341],"mapped","ٻ"],[[64342,64345],"mapped","پ"],[[64346,64349],"mapped","ڀ"],[[64350,64353],"mapped","ٺ"],[[64354,64357],"mapped","ٿ"],[[64358,64361],"mapped","ٹ"],[[64362,64365],"mapped","ڤ"],[[64366,64369],"mapped","ڦ"],[[64370,64373],"mapped","ڄ"],[[64374,64377],"mapped","ڃ"],[[64378,64381],"mapped","چ"],[[64382,64385],"mapped","ڇ"],[[64386,64387],"mapped","ڍ"],[[64388,64389],"mapped","ڌ"],[[64390,64391],"mapped","ڎ"],[[64392,64393],"mapped","ڈ"],[[64394,64395],"mapped","ژ"],[[64396,64397],"mapped","ڑ"],[[64398,64401],"mapped","ک"],[[64402,64405],"mapped","گ"],[[64406,64409],"mapped","ڳ"],[[64410,64413],"mapped","ڱ"],[[64414,64415],"mapped","ں"],[[64416,64419],"mapped","ڻ"],[[64420,64421],"mapped","ۀ"],[[64422,64425],"mapped","ہ"],[[64426,64429],"mapped","ھ"],[[64430,64431],"mapped","ے"],[[64432,64433],"mapped","ۓ"],[[64434,64449],"valid","","NV8"],[[64450,64466],"disallowed"],[[64467,64470],"mapped","ڭ"],[[64471,64472],"mapped","ۇ"],[[64473,64474],"mapped","ۆ"],[[64475,64476],"mapped","ۈ"],[[64477,64477],"mapped","ۇٴ"],[[64478,64479],"mapped","ۋ"],[[64480,64481],"mapped","ۅ"],[[64482,64483],"mapped","ۉ"],[[64484,64487],"mapped","ې"],[[64488,64489],"mapped","ى"],[[64490,64491],"mapped","ئا"],[[64492,64493],"mapped","ئە"],[[64494,64495],"mapped","ئو"],[[64496,64497],"mapped","ئۇ"],[[64498,64499],"mapped","ئۆ"],[[64500,64501],"mapped","ئۈ"],[[64502,64504],"mapped","ئې"],[[64505,64507],"mapped","ئى"],[[64508,64511],"mapped","ی"],[[64512,64512],"mapped","ئج"],[[64513,64513],"mapped","ئح"],[[64514,64514],"mapped","ئم"],[[64515,64515],"mapped","ئى"],[[64516,64516],"mapped","ئي"],[[64517,64517],"mapped","بج"],[[64518,64518],"mapped","بح"],[[64519,64519],"mapped","بخ"],[[64520,64520],"mapped","بم"],[[64521,64521],"mapped","بى"],[[64522,64522],"mapped","بي"],[[64523,64523],"mapped","تج"],[[64524,64524],"mapped","تح"],[[64525,64525],"mapped","تخ"],[[64526,64526],"mapped","تم"],[[64527,64527],"mapped","تى"],[[64528,64528],"mapped","تي"],[[64529,64529],"mapped","ثج"],[[64530,64530],"mapped","ثم"],[[64531,64531],"mapped","ثى"],[[64532,64532],"mapped","ثي"],[[64533,64533],"mapped","جح"],[[64534,64534],"mapped","جم"],[[64535,64535],"mapped","حج"],[[64536,64536],"mapped","حم"],[[64537,64537],"mapped","خج"],[[64538,64538],"mapped","خح"],[[64539,64539],"mapped","خم"],[[64540,64540],"mapped","سج"],[[64541,64541],"mapped","سح"],[[64542,64542],"mapped","سخ"],[[64543,64543],"mapped","سم"],[[64544,64544],"mapped","صح"],[[64545,64545],"mapped","صم"],[[64546,64546],"mapped","ضج"],[[64547,64547],"mapped","ضح"],[[64548,64548],"mapped","ضخ"],[[64549,64549],"mapped","ضم"],[[64550,64550],"mapped","طح"],[[64551,64551],"mapped","طم"],[[64552,64552],"mapped","ظم"],[[64553,64553],"mapped","عج"],[[64554,64554],"mapped","عم"],[[64555,64555],"mapped","غج"],[[64556,64556],"mapped","غم"],[[64557,64557],"mapped","فج"],[[64558,64558],"mapped","فح"],[[64559,64559],"mapped","فخ"],[[64560,64560],"mapped","فم"],[[64561,64561],"mapped","فى"],[[64562,64562],"mapped","في"],[[64563,64563],"mapped","قح"],[[64564,64564],"mapped","قم"],[[64565,64565],"mapped","قى"],[[64566,64566],"mapped","قي"],[[64567,64567],"mapped","كا"],[[64568,64568],"mapped","كج"],[[64569,64569],"mapped","كح"],[[64570,64570],"mapped","كخ"],[[64571,64571],"mapped","كل"],[[64572,64572],"mapped","كم"],[[64573,64573],"mapped","كى"],[[64574,64574],"mapped","كي"],[[64575,64575],"mapped","لج"],[[64576,64576],"mapped","لح"],[[64577,64577],"mapped","لخ"],[[64578,64578],"mapped","لم"],[[64579,64579],"mapped","لى"],[[64580,64580],"mapped","لي"],[[64581,64581],"mapped","مج"],[[64582,64582],"mapped","مح"],[[64583,64583],"mapped","مخ"],[[64584,64584],"mapped","مم"],[[64585,64585],"mapped","مى"],[[64586,64586],"mapped","مي"],[[64587,64587],"mapped","نج"],[[64588,64588],"mapped","نح"],[[64589,64589],"mapped","نخ"],[[64590,64590],"mapped","نم"],[[64591,64591],"mapped","نى"],[[64592,64592],"mapped","ني"],[[64593,64593],"mapped","هج"],[[64594,64594],"mapped","هم"],[[64595,64595],"mapped","هى"],[[64596,64596],"mapped","هي"],[[64597,64597],"mapped","يج"],[[64598,64598],"mapped","يح"],[[64599,64599],"mapped","يخ"],[[64600,64600],"mapped","يم"],[[64601,64601],"mapped","يى"],[[64602,64602],"mapped","يي"],[[64603,64603],"mapped","ذٰ"],[[64604,64604],"mapped","رٰ"],[[64605,64605],"mapped","ىٰ"],[[64606,64606],"disallowed_STD3_mapped"," ٌّ"],[[64607,64607],"disallowed_STD3_mapped"," ٍّ"],[[64608,64608],"disallowed_STD3_mapped"," َّ"],[[64609,64609],"disallowed_STD3_mapped"," ُّ"],[[64610,64610],"disallowed_STD3_mapped"," ِّ"],[[64611,64611],"disallowed_STD3_mapped"," ّٰ"],[[64612,64612],"mapped","ئر"],[[64613,64613],"mapped","ئز"],[[64614,64614],"mapped","ئم"],[[64615,64615],"mapped","ئن"],[[64616,64616],"mapped","ئى"],[[64617,64617],"mapped","ئي"],[[64618,64618],"mapped","بر"],[[64619,64619],"mapped","بز"],[[64620,64620],"mapped","بم"],[[64621,64621],"mapped","بن"],[[64622,64622],"mapped","بى"],[[64623,64623],"mapped","بي"],[[64624,64624],"mapped","تر"],[[64625,64625],"mapped","تز"],[[64626,64626],"mapped","تم"],[[64627,64627],"mapped","تن"],[[64628,64628],"mapped","تى"],[[64629,64629],"mapped","تي"],[[64630,64630],"mapped","ثر"],[[64631,64631],"mapped","ثز"],[[64632,64632],"mapped","ثم"],[[64633,64633],"mapped","ثن"],[[64634,64634],"mapped","ثى"],[[64635,64635],"mapped","ثي"],[[64636,64636],"mapped","فى"],[[64637,64637],"mapped","في"],[[64638,64638],"mapped","قى"],[[64639,64639],"mapped","قي"],[[64640,64640],"mapped","كا"],[[64641,64641],"mapped","كل"],[[64642,64642],"mapped","كم"],[[64643,64643],"mapped","كى"],[[64644,64644],"mapped","كي"],[[64645,64645],"mapped","لم"],[[64646,64646],"mapped","لى"],[[64647,64647],"mapped","لي"],[[64648,64648],"mapped","ما"],[[64649,64649],"mapped","مم"],[[64650,64650],"mapped","نر"],[[64651,64651],"mapped","نز"],[[64652,64652],"mapped","نم"],[[64653,64653],"mapped","نن"],[[64654,64654],"mapped","نى"],[[64655,64655],"mapped","ني"],[[64656,64656],"mapped","ىٰ"],[[64657,64657],"mapped","ير"],[[64658,64658],"mapped","يز"],[[64659,64659],"mapped","يم"],[[64660,64660],"mapped","ين"],[[64661,64661],"mapped","يى"],[[64662,64662],"mapped","يي"],[[64663,64663],"mapped","ئج"],[[64664,64664],"mapped","ئح"],[[64665,64665],"mapped","ئخ"],[[64666,64666],"mapped","ئم"],[[64667,64667],"mapped","ئه"],[[64668,64668],"mapped","بج"],[[64669,64669],"mapped","بح"],[[64670,64670],"mapped","بخ"],[[64671,64671],"mapped","بم"],[[64672,64672],"mapped","به"],[[64673,64673],"mapped","تج"],[[64674,64674],"mapped","تح"],[[64675,64675],"mapped","تخ"],[[64676,64676],"mapped","تم"],[[64677,64677],"mapped","ته"],[[64678,64678],"mapped","ثم"],[[64679,64679],"mapped","جح"],[[64680,64680],"mapped","جم"],[[64681,64681],"mapped","حج"],[[64682,64682],"mapped","حم"],[[64683,64683],"mapped","خج"],[[64684,64684],"mapped","خم"],[[64685,64685],"mapped","سج"],[[64686,64686],"mapped","سح"],[[64687,64687],"mapped","سخ"],[[64688,64688],"mapped","سم"],[[64689,64689],"mapped","صح"],[[64690,64690],"mapped","صخ"],[[64691,64691],"mapped","صم"],[[64692,64692],"mapped","ضج"],[[64693,64693],"mapped","ضح"],[[64694,64694],"mapped","ضخ"],[[64695,64695],"mapped","ضم"],[[64696,64696],"mapped","طح"],[[64697,64697],"mapped","ظم"],[[64698,64698],"mapped","عج"],[[64699,64699],"mapped","عم"],[[64700,64700],"mapped","غج"],[[64701,64701],"mapped","غم"],[[64702,64702],"mapped","فج"],[[64703,64703],"mapped","فح"],[[64704,64704],"mapped","فخ"],[[64705,64705],"mapped","فم"],[[64706,64706],"mapped","قح"],[[64707,64707],"mapped","قم"],[[64708,64708],"mapped","كج"],[[64709,64709],"mapped","كح"],[[64710,64710],"mapped","كخ"],[[64711,64711],"mapped","كل"],[[64712,64712],"mapped","كم"],[[64713,64713],"mapped","لج"],[[64714,64714],"mapped","لح"],[[64715,64715],"mapped","لخ"],[[64716,64716],"mapped","لم"],[[64717,64717],"mapped","له"],[[64718,64718],"mapped","مج"],[[64719,64719],"mapped","مح"],[[64720,64720],"mapped","مخ"],[[64721,64721],"mapped","مم"],[[64722,64722],"mapped","نج"],[[64723,64723],"mapped","نح"],[[64724,64724],"mapped","نخ"],[[64725,64725],"mapped","نم"],[[64726,64726],"mapped","نه"],[[64727,64727],"mapped","هج"],[[64728,64728],"mapped","هم"],[[64729,64729],"mapped","هٰ"],[[64730,64730],"mapped","يج"],[[64731,64731],"mapped","يح"],[[64732,64732],"mapped","يخ"],[[64733,64733],"mapped","يم"],[[64734,64734],"mapped","يه"],[[64735,64735],"mapped","ئم"],[[64736,64736],"mapped","ئه"],[[64737,64737],"mapped","بم"],[[64738,64738],"mapped","به"],[[64739,64739],"mapped","تم"],[[64740,64740],"mapped","ته"],[[64741,64741],"mapped","ثم"],[[64742,64742],"mapped","ثه"],[[64743,64743],"mapped","سم"],[[64744,64744],"mapped","سه"],[[64745,64745],"mapped","شم"],[[64746,64746],"mapped","شه"],[[64747,64747],"mapped","كل"],[[64748,64748],"mapped","كم"],[[64749,64749],"mapped","لم"],[[64750,64750],"mapped","نم"],[[64751,64751],"mapped","نه"],[[64752,64752],"mapped","يم"],[[64753,64753],"mapped","يه"],[[64754,64754],"mapped","ـَّ"],[[64755,64755],"mapped","ـُّ"],[[64756,64756],"mapped","ـِّ"],[[64757,64757],"mapped","طى"],[[64758,64758],"mapped","طي"],[[64759,64759],"mapped","عى"],[[64760,64760],"mapped","عي"],[[64761,64761],"mapped","غى"],[[64762,64762],"mapped","غي"],[[64763,64763],"mapped","سى"],[[64764,64764],"mapped","سي"],[[64765,64765],"mapped","شى"],[[64766,64766],"mapped","شي"],[[64767,64767],"mapped","حى"],[[64768,64768],"mapped","حي"],[[64769,64769],"mapped","جى"],[[64770,64770],"mapped","جي"],[[64771,64771],"mapped","خى"],[[64772,64772],"mapped","خي"],[[64773,64773],"mapped","صى"],[[64774,64774],"mapped","صي"],[[64775,64775],"mapped","ضى"],[[64776,64776],"mapped","ضي"],[[64777,64777],"mapped","شج"],[[64778,64778],"mapped","شح"],[[64779,64779],"mapped","شخ"],[[64780,64780],"mapped","شم"],[[64781,64781],"mapped","شر"],[[64782,64782],"mapped","سر"],[[64783,64783],"mapped","صر"],[[64784,64784],"mapped","ضر"],[[64785,64785],"mapped","طى"],[[64786,64786],"mapped","طي"],[[64787,64787],"mapped","عى"],[[64788,64788],"mapped","عي"],[[64789,64789],"mapped","غى"],[[64790,64790],"mapped","غي"],[[64791,64791],"mapped","سى"],[[64792,64792],"mapped","سي"],[[64793,64793],"mapped","شى"],[[64794,64794],"mapped","شي"],[[64795,64795],"mapped","حى"],[[64796,64796],"mapped","حي"],[[64797,64797],"mapped","جى"],[[64798,64798],"mapped","جي"],[[64799,64799],"mapped","خى"],[[64800,64800],"mapped","خي"],[[64801,64801],"mapped","صى"],[[64802,64802],"mapped","صي"],[[64803,64803],"mapped","ضى"],[[64804,64804],"mapped","ضي"],[[64805,64805],"mapped","شج"],[[64806,64806],"mapped","شح"],[[64807,64807],"mapped","شخ"],[[64808,64808],"mapped","شم"],[[64809,64809],"mapped","شر"],[[64810,64810],"mapped","سر"],[[64811,64811],"mapped","صر"],[[64812,64812],"mapped","ضر"],[[64813,64813],"mapped","شج"],[[64814,64814],"mapped","شح"],[[64815,64815],"mapped","شخ"],[[64816,64816],"mapped","شم"],[[64817,64817],"mapped","سه"],[[64818,64818],"mapped","شه"],[[64819,64819],"mapped","طم"],[[64820,64820],"mapped","سج"],[[64821,64821],"mapped","سح"],[[64822,64822],"mapped","سخ"],[[64823,64823],"mapped","شج"],[[64824,64824],"mapped","شح"],[[64825,64825],"mapped","شخ"],[[64826,64826],"mapped","طم"],[[64827,64827],"mapped","ظم"],[[64828,64829],"mapped","اً"],[[64830,64831],"valid","","NV8"],[[64832,64847],"disallowed"],[[64848,64848],"mapped","تجم"],[[64849,64850],"mapped","تحج"],[[64851,64851],"mapped","تحم"],[[64852,64852],"mapped","تخم"],[[64853,64853],"mapped","تمج"],[[64854,64854],"mapped","تمح"],[[64855,64855],"mapped","تمخ"],[[64856,64857],"mapped","جمح"],[[64858,64858],"mapped","حمي"],[[64859,64859],"mapped","حمى"],[[64860,64860],"mapped","سحج"],[[64861,64861],"mapped","سجح"],[[64862,64862],"mapped","سجى"],[[64863,64864],"mapped","سمح"],[[64865,64865],"mapped","سمج"],[[64866,64867],"mapped","سمم"],[[64868,64869],"mapped","صحح"],[[64870,64870],"mapped","صمم"],[[64871,64872],"mapped","شحم"],[[64873,64873],"mapped","شجي"],[[64874,64875],"mapped","شمخ"],[[64876,64877],"mapped","شمم"],[[64878,64878],"mapped","ضحى"],[[64879,64880],"mapped","ضخم"],[[64881,64882],"mapped","طمح"],[[64883,64883],"mapped","طمم"],[[64884,64884],"mapped","طمي"],[[64885,64885],"mapped","عجم"],[[64886,64887],"mapped","عمم"],[[64888,64888],"mapped","عمى"],[[64889,64889],"mapped","غمم"],[[64890,64890],"mapped","غمي"],[[64891,64891],"mapped","غمى"],[[64892,64893],"mapped","فخم"],[[64894,64894],"mapped","قمح"],[[64895,64895],"mapped","قمم"],[[64896,64896],"mapped","لحم"],[[64897,64897],"mapped","لحي"],[[64898,64898],"mapped","لحى"],[[64899,64900],"mapped","لجج"],[[64901,64902],"mapped","لخم"],[[64903,64904],"mapped","لمح"],[[64905,64905],"mapped","محج"],[[64906,64906],"mapped","محم"],[[64907,64907],"mapped","محي"],[[64908,64908],"mapped","مجح"],[[64909,64909],"mapped","مجم"],[[64910,64910],"mapped","مخج"],[[64911,64911],"mapped","مخم"],[[64912,64913],"disallowed"],[[64914,64914],"mapped","مجخ"],[[64915,64915],"mapped","همج"],[[64916,64916],"mapped","همم"],[[64917,64917],"mapped","نحم"],[[64918,64918],"mapped","نحى"],[[64919,64920],"mapped","نجم"],[[64921,64921],"mapped","نجى"],[[64922,64922],"mapped","نمي"],[[64923,64923],"mapped","نمى"],[[64924,64925],"mapped","يمم"],[[64926,64926],"mapped","بخي"],[[64927,64927],"mapped","تجي"],[[64928,64928],"mapped","تجى"],[[64929,64929],"mapped","تخي"],[[64930,64930],"mapped","تخى"],[[64931,64931],"mapped","تمي"],[[64932,64932],"mapped","تمى"],[[64933,64933],"mapped","جمي"],[[64934,64934],"mapped","جحى"],[[64935,64935],"mapped","جمى"],[[64936,64936],"mapped","سخى"],[[64937,64937],"mapped","صحي"],[[64938,64938],"mapped","شحي"],[[64939,64939],"mapped","ضحي"],[[64940,64940],"mapped","لجي"],[[64941,64941],"mapped","لمي"],[[64942,64942],"mapped","يحي"],[[64943,64943],"mapped","يجي"],[[64944,64944],"mapped","يمي"],[[64945,64945],"mapped","ممي"],[[64946,64946],"mapped","قمي"],[[64947,64947],"mapped","نحي"],[[64948,64948],"mapped","قمح"],[[64949,64949],"mapped","لحم"],[[64950,64950],"mapped","عمي"],[[64951,64951],"mapped","كمي"],[[64952,64952],"mapped","نجح"],[[64953,64953],"mapped","مخي"],[[64954,64954],"mapped","لجم"],[[64955,64955],"mapped","كمم"],[[64956,64956],"mapped","لجم"],[[64957,64957],"mapped","نجح"],[[64958,64958],"mapped","جحي"],[[64959,64959],"mapped","حجي"],[[64960,64960],"mapped","مجي"],[[64961,64961],"mapped","فمي"],[[64962,64962],"mapped","بحي"],[[64963,64963],"mapped","كمم"],[[64964,64964],"mapped","عجم"],[[64965,64965],"mapped","صمم"],[[64966,64966],"mapped","سخي"],[[64967,64967],"mapped","نجي"],[[64968,64975],"disallowed"],[[64976,65007],"disallowed"],[[65008,65008],"mapped","صلے"],[[65009,65009],"mapped","قلے"],[[65010,65010],"mapped","الله"],[[65011,65011],"mapped","اكبر"],[[65012,65012],"mapped","محمد"],[[65013,65013],"mapped","صلعم"],[[65014,65014],"mapped","رسول"],[[65015,65015],"mapped","عليه"],[[65016,65016],"mapped","وسلم"],[[65017,65017],"mapped","صلى"],[[65018,65018],"disallowed_STD3_mapped","صلى الله عليه وسلم"],[[65019,65019],"disallowed_STD3_mapped","جل جلاله"],[[65020,65020],"mapped","ریال"],[[65021,65021],"valid","","NV8"],[[65022,65023],"disallowed"],[[65024,65039],"ignored"],[[65040,65040],"disallowed_STD3_mapped",","],[[65041,65041],"mapped","、"],[[65042,65042],"disallowed"],[[65043,65043],"disallowed_STD3_mapped",":"],[[65044,65044],"disallowed_STD3_mapped",";"],[[65045,65045],"disallowed_STD3_mapped","!"],[[65046,65046],"disallowed_STD3_mapped","?"],[[65047,65047],"mapped","〖"],[[65048,65048],"mapped","〗"],[[65049,65049],"disallowed"],[[65050,65055],"disallowed"],[[65056,65059],"valid"],[[65060,65062],"valid"],[[65063,65069],"valid"],[[65070,65071],"valid"],[[65072,65072],"disallowed"],[[65073,65073],"mapped","—"],[[65074,65074],"mapped","–"],[[65075,65076],"disallowed_STD3_mapped","_"],[[65077,65077],"disallowed_STD3_mapped","("],[[65078,65078],"disallowed_STD3_mapped",")"],[[65079,65079],"disallowed_STD3_mapped","{"],[[65080,65080],"disallowed_STD3_mapped","}"],[[65081,65081],"mapped","〔"],[[65082,65082],"mapped","〕"],[[65083,65083],"mapped","【"],[[65084,65084],"mapped","】"],[[65085,65085],"mapped","《"],[[65086,65086],"mapped","》"],[[65087,65087],"mapped","〈"],[[65088,65088],"mapped","〉"],[[65089,65089],"mapped","「"],[[65090,65090],"mapped","」"],[[65091,65091],"mapped","『"],[[65092,65092],"mapped","』"],[[65093,65094],"valid","","NV8"],[[65095,65095],"disallowed_STD3_mapped","["],[[65096,65096],"disallowed_STD3_mapped","]"],[[65097,65100],"disallowed_STD3_mapped"," ̅"],[[65101,65103],"disallowed_STD3_mapped","_"],[[65104,65104],"disallowed_STD3_mapped",","],[[65105,65105],"mapped","、"],[[65106,65106],"disallowed"],[[65107,65107],"disallowed"],[[65108,65108],"disallowed_STD3_mapped",";"],[[65109,65109],"disallowed_STD3_mapped",":"],[[65110,65110],"disallowed_STD3_mapped","?"],[[65111,65111],"disallowed_STD3_mapped","!"],[[65112,65112],"mapped","—"],[[65113,65113],"disallowed_STD3_mapped","("],[[65114,65114],"disallowed_STD3_mapped",")"],[[65115,65115],"disallowed_STD3_mapped","{"],[[65116,65116],"disallowed_STD3_mapped","}"],[[65117,65117],"mapped","〔"],[[65118,65118],"mapped","〕"],[[65119,65119],"disallowed_STD3_mapped","#"],[[65120,65120],"disallowed_STD3_mapped","&"],[[65121,65121],"disallowed_STD3_mapped","*"],[[65122,65122],"disallowed_STD3_mapped","+"],[[65123,65123],"mapped","-"],[[65124,65124],"disallowed_STD3_mapped","<"],[[65125,65125],"disallowed_STD3_mapped",">"],[[65126,65126],"disallowed_STD3_mapped","="],[[65127,65127],"disallowed"],[[65128,65128],"disallowed_STD3_mapped","\\\\"],[[65129,65129],"disallowed_STD3_mapped","$"],[[65130,65130],"disallowed_STD3_mapped","%"],[[65131,65131],"disallowed_STD3_mapped","@"],[[65132,65135],"disallowed"],[[65136,65136],"disallowed_STD3_mapped"," ً"],[[65137,65137],"mapped","ـً"],[[65138,65138],"disallowed_STD3_mapped"," ٌ"],[[65139,65139],"valid"],[[65140,65140],"disallowed_STD3_mapped"," ٍ"],[[65141,65141],"disallowed"],[[65142,65142],"disallowed_STD3_mapped"," َ"],[[65143,65143],"mapped","ـَ"],[[65144,65144],"disallowed_STD3_mapped"," ُ"],[[65145,65145],"mapped","ـُ"],[[65146,65146],"disallowed_STD3_mapped"," ِ"],[[65147,65147],"mapped","ـِ"],[[65148,65148],"disallowed_STD3_mapped"," ّ"],[[65149,65149],"mapped","ـّ"],[[65150,65150],"disallowed_STD3_mapped"," ْ"],[[65151,65151],"mapped","ـْ"],[[65152,65152],"mapped","ء"],[[65153,65154],"mapped","آ"],[[65155,65156],"mapped","أ"],[[65157,65158],"mapped","ؤ"],[[65159,65160],"mapped","إ"],[[65161,65164],"mapped","ئ"],[[65165,65166],"mapped","ا"],[[65167,65170],"mapped","ب"],[[65171,65172],"mapped","ة"],[[65173,65176],"mapped","ت"],[[65177,65180],"mapped","ث"],[[65181,65184],"mapped","ج"],[[65185,65188],"mapped","ح"],[[65189,65192],"mapped","خ"],[[65193,65194],"mapped","د"],[[65195,65196],"mapped","ذ"],[[65197,65198],"mapped","ر"],[[65199,65200],"mapped","ز"],[[65201,65204],"mapped","س"],[[65205,65208],"mapped","ش"],[[65209,65212],"mapped","ص"],[[65213,65216],"mapped","ض"],[[65217,65220],"mapped","ط"],[[65221,65224],"mapped","ظ"],[[65225,65228],"mapped","ع"],[[65229,65232],"mapped","غ"],[[65233,65236],"mapped","ف"],[[65237,65240],"mapped","ق"],[[65241,65244],"mapped","ك"],[[65245,65248],"mapped","ل"],[[65249,65252],"mapped","م"],[[65253,65256],"mapped","ن"],[[65257,65260],"mapped","ه"],[[65261,65262],"mapped","و"],[[65263,65264],"mapped","ى"],[[65265,65268],"mapped","ي"],[[65269,65270],"mapped","لآ"],[[65271,65272],"mapped","لأ"],[[65273,65274],"mapped","لإ"],[[65275,65276],"mapped","لا"],[[65277,65278],"disallowed"],[[65279,65279],"ignored"],[[65280,65280],"disallowed"],[[65281,65281],"disallowed_STD3_mapped","!"],[[65282,65282],"disallowed_STD3_mapped","\\""],[[65283,65283],"disallowed_STD3_mapped","#"],[[65284,65284],"disallowed_STD3_mapped","$"],[[65285,65285],"disallowed_STD3_mapped","%"],[[65286,65286],"disallowed_STD3_mapped","&"],[[65287,65287],"disallowed_STD3_mapped","\'"],[[65288,65288],"disallowed_STD3_mapped","("],[[65289,65289],"disallowed_STD3_mapped",")"],[[65290,65290],"disallowed_STD3_mapped","*"],[[65291,65291],"disallowed_STD3_mapped","+"],[[65292,65292],"disallowed_STD3_mapped",","],[[65293,65293],"mapped","-"],[[65294,65294],"mapped","."],[[65295,65295],"disallowed_STD3_mapped","/"],[[65296,65296],"mapped","0"],[[65297,65297],"mapped","1"],[[65298,65298],"mapped","2"],[[65299,65299],"mapped","3"],[[65300,65300],"mapped","4"],[[65301,65301],"mapped","5"],[[65302,65302],"mapped","6"],[[65303,65303],"mapped","7"],[[65304,65304],"mapped","8"],[[65305,65305],"mapped","9"],[[65306,65306],"disallowed_STD3_mapped",":"],[[65307,65307],"disallowed_STD3_mapped",";"],[[65308,65308],"disallowed_STD3_mapped","<"],[[65309,65309],"disallowed_STD3_mapped","="],[[65310,65310],"disallowed_STD3_mapped",">"],[[65311,65311],"disallowed_STD3_mapped","?"],[[65312,65312],"disallowed_STD3_mapped","@"],[[65313,65313],"mapped","a"],[[65314,65314],"mapped","b"],[[65315,65315],"mapped","c"],[[65316,65316],"mapped","d"],[[65317,65317],"mapped","e"],[[65318,65318],"mapped","f"],[[65319,65319],"mapped","g"],[[65320,65320],"mapped","h"],[[65321,65321],"mapped","i"],[[65322,65322],"mapped","j"],[[65323,65323],"mapped","k"],[[65324,65324],"mapped","l"],[[65325,65325],"mapped","m"],[[65326,65326],"mapped","n"],[[65327,65327],"mapped","o"],[[65328,65328],"mapped","p"],[[65329,65329],"mapped","q"],[[65330,65330],"mapped","r"],[[65331,65331],"mapped","s"],[[65332,65332],"mapped","t"],[[65333,65333],"mapped","u"],[[65334,65334],"mapped","v"],[[65335,65335],"mapped","w"],[[65336,65336],"mapped","x"],[[65337,65337],"mapped","y"],[[65338,65338],"mapped","z"],[[65339,65339],"disallowed_STD3_mapped","["],[[65340,65340],"disallowed_STD3_mapped","\\\\"],[[65341,65341],"disallowed_STD3_mapped","]"],[[65342,65342],"disallowed_STD3_mapped","^"],[[65343,65343],"disallowed_STD3_mapped","_"],[[65344,65344],"disallowed_STD3_mapped","`"],[[65345,65345],"mapped","a"],[[65346,65346],"mapped","b"],[[65347,65347],"mapped","c"],[[65348,65348],"mapped","d"],[[65349,65349],"mapped","e"],[[65350,65350],"mapped","f"],[[65351,65351],"mapped","g"],[[65352,65352],"mapped","h"],[[65353,65353],"mapped","i"],[[65354,65354],"mapped","j"],[[65355,65355],"mapped","k"],[[65356,65356],"mapped","l"],[[65357,65357],"mapped","m"],[[65358,65358],"mapped","n"],[[65359,65359],"mapped","o"],[[65360,65360],"mapped","p"],[[65361,65361],"mapped","q"],[[65362,65362],"mapped","r"],[[65363,65363],"mapped","s"],[[65364,65364],"mapped","t"],[[65365,65365],"mapped","u"],[[65366,65366],"mapped","v"],[[65367,65367],"mapped","w"],[[65368,65368],"mapped","x"],[[65369,65369],"mapped","y"],[[65370,65370],"mapped","z"],[[65371,65371],"disallowed_STD3_mapped","{"],[[65372,65372],"disallowed_STD3_mapped","|"],[[65373,65373],"disallowed_STD3_mapped","}"],[[65374,65374],"disallowed_STD3_mapped","~"],[[65375,65375],"mapped","⦅"],[[65376,65376],"mapped","⦆"],[[65377,65377],"mapped","."],[[65378,65378],"mapped","「"],[[65379,65379],"mapped","」"],[[65380,65380],"mapped","、"],[[65381,65381],"mapped","・"],[[65382,65382],"mapped","ヲ"],[[65383,65383],"mapped","ァ"],[[65384,65384],"mapped","ィ"],[[65385,65385],"mapped","ゥ"],[[65386,65386],"mapped","ェ"],[[65387,65387],"mapped","ォ"],[[65388,65388],"mapped","ャ"],[[65389,65389],"mapped","ュ"],[[65390,65390],"mapped","ョ"],[[65391,65391],"mapped","ッ"],[[65392,65392],"mapped","ー"],[[65393,65393],"mapped","ア"],[[65394,65394],"mapped","イ"],[[65395,65395],"mapped","ウ"],[[65396,65396],"mapped","エ"],[[65397,65397],"mapped","オ"],[[65398,65398],"mapped","カ"],[[65399,65399],"mapped","キ"],[[65400,65400],"mapped","ク"],[[65401,65401],"mapped","ケ"],[[65402,65402],"mapped","コ"],[[65403,65403],"mapped","サ"],[[65404,65404],"mapped","シ"],[[65405,65405],"mapped","ス"],[[65406,65406],"mapped","セ"],[[65407,65407],"mapped","ソ"],[[65408,65408],"mapped","タ"],[[65409,65409],"mapped","チ"],[[65410,65410],"mapped","ツ"],[[65411,65411],"mapped","テ"],[[65412,65412],"mapped","ト"],[[65413,65413],"mapped","ナ"],[[65414,65414],"mapped","ニ"],[[65415,65415],"mapped","ヌ"],[[65416,65416],"mapped","ネ"],[[65417,65417],"mapped","ノ"],[[65418,65418],"mapped","ハ"],[[65419,65419],"mapped","ヒ"],[[65420,65420],"mapped","フ"],[[65421,65421],"mapped","ヘ"],[[65422,65422],"mapped","ホ"],[[65423,65423],"mapped","マ"],[[65424,65424],"mapped","ミ"],[[65425,65425],"mapped","ム"],[[65426,65426],"mapped","メ"],[[65427,65427],"mapped","モ"],[[65428,65428],"mapped","ヤ"],[[65429,65429],"mapped","ユ"],[[65430,65430],"mapped","ヨ"],[[65431,65431],"mapped","ラ"],[[65432,65432],"mapped","リ"],[[65433,65433],"mapped","ル"],[[65434,65434],"mapped","レ"],[[65435,65435],"mapped","ロ"],[[65436,65436],"mapped","ワ"],[[65437,65437],"mapped","ン"],[[65438,65438],"mapped","゙"],[[65439,65439],"mapped","゚"],[[65440,65440],"disallowed"],[[65441,65441],"mapped","ᄀ"],[[65442,65442],"mapped","ᄁ"],[[65443,65443],"mapped","ᆪ"],[[65444,65444],"mapped","ᄂ"],[[65445,65445],"mapped","ᆬ"],[[65446,65446],"mapped","ᆭ"],[[65447,65447],"mapped","ᄃ"],[[65448,65448],"mapped","ᄄ"],[[65449,65449],"mapped","ᄅ"],[[65450,65450],"mapped","ᆰ"],[[65451,65451],"mapped","ᆱ"],[[65452,65452],"mapped","ᆲ"],[[65453,65453],"mapped","ᆳ"],[[65454,65454],"mapped","ᆴ"],[[65455,65455],"mapped","ᆵ"],[[65456,65456],"mapped","ᄚ"],[[65457,65457],"mapped","ᄆ"],[[65458,65458],"mapped","ᄇ"],[[65459,65459],"mapped","ᄈ"],[[65460,65460],"mapped","ᄡ"],[[65461,65461],"mapped","ᄉ"],[[65462,65462],"mapped","ᄊ"],[[65463,65463],"mapped","ᄋ"],[[65464,65464],"mapped","ᄌ"],[[65465,65465],"mapped","ᄍ"],[[65466,65466],"mapped","ᄎ"],[[65467,65467],"mapped","ᄏ"],[[65468,65468],"mapped","ᄐ"],[[65469,65469],"mapped","ᄑ"],[[65470,65470],"mapped","ᄒ"],[[65471,65473],"disallowed"],[[65474,65474],"mapped","ᅡ"],[[65475,65475],"mapped","ᅢ"],[[65476,65476],"mapped","ᅣ"],[[65477,65477],"mapped","ᅤ"],[[65478,65478],"mapped","ᅥ"],[[65479,65479],"mapped","ᅦ"],[[65480,65481],"disallowed"],[[65482,65482],"mapped","ᅧ"],[[65483,65483],"mapped","ᅨ"],[[65484,65484],"mapped","ᅩ"],[[65485,65485],"mapped","ᅪ"],[[65486,65486],"mapped","ᅫ"],[[65487,65487],"mapped","ᅬ"],[[65488,65489],"disallowed"],[[65490,65490],"mapped","ᅭ"],[[65491,65491],"mapped","ᅮ"],[[65492,65492],"mapped","ᅯ"],[[65493,65493],"mapped","ᅰ"],[[65494,65494],"mapped","ᅱ"],[[65495,65495],"mapped","ᅲ"],[[65496,65497],"disallowed"],[[65498,65498],"mapped","ᅳ"],[[65499,65499],"mapped","ᅴ"],[[65500,65500],"mapped","ᅵ"],[[65501,65503],"disallowed"],[[65504,65504],"mapped","¢"],[[65505,65505],"mapped","£"],[[65506,65506],"mapped","¬"],[[65507,65507],"disallowed_STD3_mapped"," ̄"],[[65508,65508],"mapped","¦"],[[65509,65509],"mapped","¥"],[[65510,65510],"mapped","₩"],[[65511,65511],"disallowed"],[[65512,65512],"mapped","│"],[[65513,65513],"mapped","←"],[[65514,65514],"mapped","↑"],[[65515,65515],"mapped","→"],[[65516,65516],"mapped","↓"],[[65517,65517],"mapped","■"],[[65518,65518],"mapped","○"],[[65519,65528],"disallowed"],[[65529,65531],"disallowed"],[[65532,65532],"disallowed"],[[65533,65533],"disallowed"],[[65534,65535],"disallowed"],[[65536,65547],"valid"],[[65548,65548],"disallowed"],[[65549,65574],"valid"],[[65575,65575],"disallowed"],[[65576,65594],"valid"],[[65595,65595],"disallowed"],[[65596,65597],"valid"],[[65598,65598],"disallowed"],[[65599,65613],"valid"],[[65614,65615],"disallowed"],[[65616,65629],"valid"],[[65630,65663],"disallowed"],[[65664,65786],"valid"],[[65787,65791],"disallowed"],[[65792,65794],"valid","","NV8"],[[65795,65798],"disallowed"],[[65799,65843],"valid","","NV8"],[[65844,65846],"disallowed"],[[65847,65855],"valid","","NV8"],[[65856,65930],"valid","","NV8"],[[65931,65932],"valid","","NV8"],[[65933,65934],"valid","","NV8"],[[65935,65935],"disallowed"],[[65936,65947],"valid","","NV8"],[[65948,65951],"disallowed"],[[65952,65952],"valid","","NV8"],[[65953,65999],"disallowed"],[[66000,66044],"valid","","NV8"],[[66045,66045],"valid"],[[66046,66175],"disallowed"],[[66176,66204],"valid"],[[66205,66207],"disallowed"],[[66208,66256],"valid"],[[66257,66271],"disallowed"],[[66272,66272],"valid"],[[66273,66299],"valid","","NV8"],[[66300,66303],"disallowed"],[[66304,66334],"valid"],[[66335,66335],"valid"],[[66336,66339],"valid","","NV8"],[[66340,66348],"disallowed"],[[66349,66351],"valid"],[[66352,66368],"valid"],[[66369,66369],"valid","","NV8"],[[66370,66377],"valid"],[[66378,66378],"valid","","NV8"],[[66379,66383],"disallowed"],[[66384,66426],"valid"],[[66427,66431],"disallowed"],[[66432,66461],"valid"],[[66462,66462],"disallowed"],[[66463,66463],"valid","","NV8"],[[66464,66499],"valid"],[[66500,66503],"disallowed"],[[66504,66511],"valid"],[[66512,66517],"valid","","NV8"],[[66518,66559],"disallowed"],[[66560,66560],"mapped","𐐨"],[[66561,66561],"mapped","𐐩"],[[66562,66562],"mapped","𐐪"],[[66563,66563],"mapped","𐐫"],[[66564,66564],"mapped","𐐬"],[[66565,66565],"mapped","𐐭"],[[66566,66566],"mapped","𐐮"],[[66567,66567],"mapped","𐐯"],[[66568,66568],"mapped","𐐰"],[[66569,66569],"mapped","𐐱"],[[66570,66570],"mapped","𐐲"],[[66571,66571],"mapped","𐐳"],[[66572,66572],"mapped","𐐴"],[[66573,66573],"mapped","𐐵"],[[66574,66574],"mapped","𐐶"],[[66575,66575],"mapped","𐐷"],[[66576,66576],"mapped","𐐸"],[[66577,66577],"mapped","𐐹"],[[66578,66578],"mapped","𐐺"],[[66579,66579],"mapped","𐐻"],[[66580,66580],"mapped","𐐼"],[[66581,66581],"mapped","𐐽"],[[66582,66582],"mapped","𐐾"],[[66583,66583],"mapped","𐐿"],[[66584,66584],"mapped","𐑀"],[[66585,66585],"mapped","𐑁"],[[66586,66586],"mapped","𐑂"],[[66587,66587],"mapped","𐑃"],[[66588,66588],"mapped","𐑄"],[[66589,66589],"mapped","𐑅"],[[66590,66590],"mapped","𐑆"],[[66591,66591],"mapped","𐑇"],[[66592,66592],"mapped","𐑈"],[[66593,66593],"mapped","𐑉"],[[66594,66594],"mapped","𐑊"],[[66595,66595],"mapped","𐑋"],[[66596,66596],"mapped","𐑌"],[[66597,66597],"mapped","𐑍"],[[66598,66598],"mapped","𐑎"],[[66599,66599],"mapped","𐑏"],[[66600,66637],"valid"],[[66638,66717],"valid"],[[66718,66719],"disallowed"],[[66720,66729],"valid"],[[66730,66735],"disallowed"],[[66736,66736],"mapped","𐓘"],[[66737,66737],"mapped","𐓙"],[[66738,66738],"mapped","𐓚"],[[66739,66739],"mapped","𐓛"],[[66740,66740],"mapped","𐓜"],[[66741,66741],"mapped","𐓝"],[[66742,66742],"mapped","𐓞"],[[66743,66743],"mapped","𐓟"],[[66744,66744],"mapped","𐓠"],[[66745,66745],"mapped","𐓡"],[[66746,66746],"mapped","𐓢"],[[66747,66747],"mapped","𐓣"],[[66748,66748],"mapped","𐓤"],[[66749,66749],"mapped","𐓥"],[[66750,66750],"mapped","𐓦"],[[66751,66751],"mapped","𐓧"],[[66752,66752],"mapped","𐓨"],[[66753,66753],"mapped","𐓩"],[[66754,66754],"mapped","𐓪"],[[66755,66755],"mapped","𐓫"],[[66756,66756],"mapped","𐓬"],[[66757,66757],"mapped","𐓭"],[[66758,66758],"mapped","𐓮"],[[66759,66759],"mapped","𐓯"],[[66760,66760],"mapped","𐓰"],[[66761,66761],"mapped","𐓱"],[[66762,66762],"mapped","𐓲"],[[66763,66763],"mapped","𐓳"],[[66764,66764],"mapped","𐓴"],[[66765,66765],"mapped","𐓵"],[[66766,66766],"mapped","𐓶"],[[66767,66767],"mapped","𐓷"],[[66768,66768],"mapped","𐓸"],[[66769,66769],"mapped","𐓹"],[[66770,66770],"mapped","𐓺"],[[66771,66771],"mapped","𐓻"],[[66772,66775],"disallowed"],[[66776,66811],"valid"],[[66812,66815],"disallowed"],[[66816,66855],"valid"],[[66856,66863],"disallowed"],[[66864,66915],"valid"],[[66916,66926],"disallowed"],[[66927,66927],"valid","","NV8"],[[66928,67071],"disallowed"],[[67072,67382],"valid"],[[67383,67391],"disallowed"],[[67392,67413],"valid"],[[67414,67423],"disallowed"],[[67424,67431],"valid"],[[67432,67583],"disallowed"],[[67584,67589],"valid"],[[67590,67591],"disallowed"],[[67592,67592],"valid"],[[67593,67593],"disallowed"],[[67594,67637],"valid"],[[67638,67638],"disallowed"],[[67639,67640],"valid"],[[67641,67643],"disallowed"],[[67644,67644],"valid"],[[67645,67646],"disallowed"],[[67647,67647],"valid"],[[67648,67669],"valid"],[[67670,67670],"disallowed"],[[67671,67679],"valid","","NV8"],[[67680,67702],"valid"],[[67703,67711],"valid","","NV8"],[[67712,67742],"valid"],[[67743,67750],"disallowed"],[[67751,67759],"valid","","NV8"],[[67760,67807],"disallowed"],[[67808,67826],"valid"],[[67827,67827],"disallowed"],[[67828,67829],"valid"],[[67830,67834],"disallowed"],[[67835,67839],"valid","","NV8"],[[67840,67861],"valid"],[[67862,67865],"valid","","NV8"],[[67866,67867],"valid","","NV8"],[[67868,67870],"disallowed"],[[67871,67871],"valid","","NV8"],[[67872,67897],"valid"],[[67898,67902],"disallowed"],[[67903,67903],"valid","","NV8"],[[67904,67967],"disallowed"],[[67968,68023],"valid"],[[68024,68027],"disallowed"],[[68028,68029],"valid","","NV8"],[[68030,68031],"valid"],[[68032,68047],"valid","","NV8"],[[68048,68049],"disallowed"],[[68050,68095],"valid","","NV8"],[[68096,68099],"valid"],[[68100,68100],"disallowed"],[[68101,68102],"valid"],[[68103,68107],"disallowed"],[[68108,68115],"valid"],[[68116,68116],"disallowed"],[[68117,68119],"valid"],[[68120,68120],"disallowed"],[[68121,68147],"valid"],[[68148,68151],"disallowed"],[[68152,68154],"valid"],[[68155,68158],"disallowed"],[[68159,68159],"valid"],[[68160,68167],"valid","","NV8"],[[68168,68175],"disallowed"],[[68176,68184],"valid","","NV8"],[[68185,68191],"disallowed"],[[68192,68220],"valid"],[[68221,68223],"valid","","NV8"],[[68224,68252],"valid"],[[68253,68255],"valid","","NV8"],[[68256,68287],"disallowed"],[[68288,68295],"valid"],[[68296,68296],"valid","","NV8"],[[68297,68326],"valid"],[[68327,68330],"disallowed"],[[68331,68342],"valid","","NV8"],[[68343,68351],"disallowed"],[[68352,68405],"valid"],[[68406,68408],"disallowed"],[[68409,68415],"valid","","NV8"],[[68416,68437],"valid"],[[68438,68439],"disallowed"],[[68440,68447],"valid","","NV8"],[[68448,68466],"valid"],[[68467,68471],"disallowed"],[[68472,68479],"valid","","NV8"],[[68480,68497],"valid"],[[68498,68504],"disallowed"],[[68505,68508],"valid","","NV8"],[[68509,68520],"disallowed"],[[68521,68527],"valid","","NV8"],[[68528,68607],"disallowed"],[[68608,68680],"valid"],[[68681,68735],"disallowed"],[[68736,68736],"mapped","𐳀"],[[68737,68737],"mapped","𐳁"],[[68738,68738],"mapped","𐳂"],[[68739,68739],"mapped","𐳃"],[[68740,68740],"mapped","𐳄"],[[68741,68741],"mapped","𐳅"],[[68742,68742],"mapped","𐳆"],[[68743,68743],"mapped","𐳇"],[[68744,68744],"mapped","𐳈"],[[68745,68745],"mapped","𐳉"],[[68746,68746],"mapped","𐳊"],[[68747,68747],"mapped","𐳋"],[[68748,68748],"mapped","𐳌"],[[68749,68749],"mapped","𐳍"],[[68750,68750],"mapped","𐳎"],[[68751,68751],"mapped","𐳏"],[[68752,68752],"mapped","𐳐"],[[68753,68753],"mapped","𐳑"],[[68754,68754],"mapped","𐳒"],[[68755,68755],"mapped","𐳓"],[[68756,68756],"mapped","𐳔"],[[68757,68757],"mapped","𐳕"],[[68758,68758],"mapped","𐳖"],[[68759,68759],"mapped","𐳗"],[[68760,68760],"mapped","𐳘"],[[68761,68761],"mapped","𐳙"],[[68762,68762],"mapped","𐳚"],[[68763,68763],"mapped","𐳛"],[[68764,68764],"mapped","𐳜"],[[68765,68765],"mapped","𐳝"],[[68766,68766],"mapped","𐳞"],[[68767,68767],"mapped","𐳟"],[[68768,68768],"mapped","𐳠"],[[68769,68769],"mapped","𐳡"],[[68770,68770],"mapped","𐳢"],[[68771,68771],"mapped","𐳣"],[[68772,68772],"mapped","𐳤"],[[68773,68773],"mapped","𐳥"],[[68774,68774],"mapped","𐳦"],[[68775,68775],"mapped","𐳧"],[[68776,68776],"mapped","𐳨"],[[68777,68777],"mapped","𐳩"],[[68778,68778],"mapped","𐳪"],[[68779,68779],"mapped","𐳫"],[[68780,68780],"mapped","𐳬"],[[68781,68781],"mapped","𐳭"],[[68782,68782],"mapped","𐳮"],[[68783,68783],"mapped","𐳯"],[[68784,68784],"mapped","𐳰"],[[68785,68785],"mapped","𐳱"],[[68786,68786],"mapped","𐳲"],[[68787,68799],"disallowed"],[[68800,68850],"valid"],[[68851,68857],"disallowed"],[[68858,68863],"valid","","NV8"],[[68864,69215],"disallowed"],[[69216,69246],"valid","","NV8"],[[69247,69631],"disallowed"],[[69632,69702],"valid"],[[69703,69709],"valid","","NV8"],[[69710,69713],"disallowed"],[[69714,69733],"valid","","NV8"],[[69734,69743],"valid"],[[69744,69758],"disallowed"],[[69759,69759],"valid"],[[69760,69818],"valid"],[[69819,69820],"valid","","NV8"],[[69821,69821],"disallowed"],[[69822,69825],"valid","","NV8"],[[69826,69839],"disallowed"],[[69840,69864],"valid"],[[69865,69871],"disallowed"],[[69872,69881],"valid"],[[69882,69887],"disallowed"],[[69888,69940],"valid"],[[69941,69941],"disallowed"],[[69942,69951],"valid"],[[69952,69955],"valid","","NV8"],[[69956,69967],"disallowed"],[[69968,70003],"valid"],[[70004,70005],"valid","","NV8"],[[70006,70006],"valid"],[[70007,70015],"disallowed"],[[70016,70084],"valid"],[[70085,70088],"valid","","NV8"],[[70089,70089],"valid","","NV8"],[[70090,70092],"valid"],[[70093,70093],"valid","","NV8"],[[70094,70095],"disallowed"],[[70096,70105],"valid"],[[70106,70106],"valid"],[[70107,70107],"valid","","NV8"],[[70108,70108],"valid"],[[70109,70111],"valid","","NV8"],[[70112,70112],"disallowed"],[[70113,70132],"valid","","NV8"],[[70133,70143],"disallowed"],[[70144,70161],"valid"],[[70162,70162],"disallowed"],[[70163,70199],"valid"],[[70200,70205],"valid","","NV8"],[[70206,70206],"valid"],[[70207,70271],"disallowed"],[[70272,70278],"valid"],[[70279,70279],"disallowed"],[[70280,70280],"valid"],[[70281,70281],"disallowed"],[[70282,70285],"valid"],[[70286,70286],"disallowed"],[[70287,70301],"valid"],[[70302,70302],"disallowed"],[[70303,70312],"valid"],[[70313,70313],"valid","","NV8"],[[70314,70319],"disallowed"],[[70320,70378],"valid"],[[70379,70383],"disallowed"],[[70384,70393],"valid"],[[70394,70399],"disallowed"],[[70400,70400],"valid"],[[70401,70403],"valid"],[[70404,70404],"disallowed"],[[70405,70412],"valid"],[[70413,70414],"disallowed"],[[70415,70416],"valid"],[[70417,70418],"disallowed"],[[70419,70440],"valid"],[[70441,70441],"disallowed"],[[70442,70448],"valid"],[[70449,70449],"disallowed"],[[70450,70451],"valid"],[[70452,70452],"disallowed"],[[70453,70457],"valid"],[[70458,70459],"disallowed"],[[70460,70468],"valid"],[[70469,70470],"disallowed"],[[70471,70472],"valid"],[[70473,70474],"disallowed"],[[70475,70477],"valid"],[[70478,70479],"disallowed"],[[70480,70480],"valid"],[[70481,70486],"disallowed"],[[70487,70487],"valid"],[[70488,70492],"disallowed"],[[70493,70499],"valid"],[[70500,70501],"disallowed"],[[70502,70508],"valid"],[[70509,70511],"disallowed"],[[70512,70516],"valid"],[[70517,70655],"disallowed"],[[70656,70730],"valid"],[[70731,70735],"valid","","NV8"],[[70736,70745],"valid"],[[70746,70746],"disallowed"],[[70747,70747],"valid","","NV8"],[[70748,70748],"disallowed"],[[70749,70749],"valid","","NV8"],[[70750,70783],"disallowed"],[[70784,70853],"valid"],[[70854,70854],"valid","","NV8"],[[70855,70855],"valid"],[[70856,70863],"disallowed"],[[70864,70873],"valid"],[[70874,71039],"disallowed"],[[71040,71093],"valid"],[[71094,71095],"disallowed"],[[71096,71104],"valid"],[[71105,71113],"valid","","NV8"],[[71114,71127],"valid","","NV8"],[[71128,71133],"valid"],[[71134,71167],"disallowed"],[[71168,71232],"valid"],[[71233,71235],"valid","","NV8"],[[71236,71236],"valid"],[[71237,71247],"disallowed"],[[71248,71257],"valid"],[[71258,71263],"disallowed"],[[71264,71276],"valid","","NV8"],[[71277,71295],"disallowed"],[[71296,71351],"valid"],[[71352,71359],"disallowed"],[[71360,71369],"valid"],[[71370,71423],"disallowed"],[[71424,71449],"valid"],[[71450,71452],"disallowed"],[[71453,71467],"valid"],[[71468,71471],"disallowed"],[[71472,71481],"valid"],[[71482,71487],"valid","","NV8"],[[71488,71839],"disallowed"],[[71840,71840],"mapped","𑣀"],[[71841,71841],"mapped","𑣁"],[[71842,71842],"mapped","𑣂"],[[71843,71843],"mapped","𑣃"],[[71844,71844],"mapped","𑣄"],[[71845,71845],"mapped","𑣅"],[[71846,71846],"mapped","𑣆"],[[71847,71847],"mapped","𑣇"],[[71848,71848],"mapped","𑣈"],[[71849,71849],"mapped","𑣉"],[[71850,71850],"mapped","𑣊"],[[71851,71851],"mapped","𑣋"],[[71852,71852],"mapped","𑣌"],[[71853,71853],"mapped","𑣍"],[[71854,71854],"mapped","𑣎"],[[71855,71855],"mapped","𑣏"],[[71856,71856],"mapped","𑣐"],[[71857,71857],"mapped","𑣑"],[[71858,71858],"mapped","𑣒"],[[71859,71859],"mapped","𑣓"],[[71860,71860],"mapped","𑣔"],[[71861,71861],"mapped","𑣕"],[[71862,71862],"mapped","𑣖"],[[71863,71863],"mapped","𑣗"],[[71864,71864],"mapped","𑣘"],[[71865,71865],"mapped","𑣙"],[[71866,71866],"mapped","𑣚"],[[71867,71867],"mapped","𑣛"],[[71868,71868],"mapped","𑣜"],[[71869,71869],"mapped","𑣝"],[[71870,71870],"mapped","𑣞"],[[71871,71871],"mapped","𑣟"],[[71872,71913],"valid"],[[71914,71922],"valid","","NV8"],[[71923,71934],"disallowed"],[[71935,71935],"valid"],[[71936,72191],"disallowed"],[[72192,72254],"valid"],[[72255,72262],"valid","","NV8"],[[72263,72263],"valid"],[[72264,72271],"disallowed"],[[72272,72323],"valid"],[[72324,72325],"disallowed"],[[72326,72345],"valid"],[[72346,72348],"valid","","NV8"],[[72349,72349],"disallowed"],[[72350,72354],"valid","","NV8"],[[72355,72383],"disallowed"],[[72384,72440],"valid"],[[72441,72703],"disallowed"],[[72704,72712],"valid"],[[72713,72713],"disallowed"],[[72714,72758],"valid"],[[72759,72759],"disallowed"],[[72760,72768],"valid"],[[72769,72773],"valid","","NV8"],[[72774,72783],"disallowed"],[[72784,72793],"valid"],[[72794,72812],"valid","","NV8"],[[72813,72815],"disallowed"],[[72816,72817],"valid","","NV8"],[[72818,72847],"valid"],[[72848,72849],"disallowed"],[[72850,72871],"valid"],[[72872,72872],"disallowed"],[[72873,72886],"valid"],[[72887,72959],"disallowed"],[[72960,72966],"valid"],[[72967,72967],"disallowed"],[[72968,72969],"valid"],[[72970,72970],"disallowed"],[[72971,73014],"valid"],[[73015,73017],"disallowed"],[[73018,73018],"valid"],[[73019,73019],"disallowed"],[[73020,73021],"valid"],[[73022,73022],"disallowed"],[[73023,73031],"valid"],[[73032,73039],"disallowed"],[[73040,73049],"valid"],[[73050,73727],"disallowed"],[[73728,74606],"valid"],[[74607,74648],"valid"],[[74649,74649],"valid"],[[74650,74751],"disallowed"],[[74752,74850],"valid","","NV8"],[[74851,74862],"valid","","NV8"],[[74863,74863],"disallowed"],[[74864,74867],"valid","","NV8"],[[74868,74868],"valid","","NV8"],[[74869,74879],"disallowed"],[[74880,75075],"valid"],[[75076,77823],"disallowed"],[[77824,78894],"valid"],[[78895,82943],"disallowed"],[[82944,83526],"valid"],[[83527,92159],"disallowed"],[[92160,92728],"valid"],[[92729,92735],"disallowed"],[[92736,92766],"valid"],[[92767,92767],"disallowed"],[[92768,92777],"valid"],[[92778,92781],"disallowed"],[[92782,92783],"valid","","NV8"],[[92784,92879],"disallowed"],[[92880,92909],"valid"],[[92910,92911],"disallowed"],[[92912,92916],"valid"],[[92917,92917],"valid","","NV8"],[[92918,92927],"disallowed"],[[92928,92982],"valid"],[[92983,92991],"valid","","NV8"],[[92992,92995],"valid"],[[92996,92997],"valid","","NV8"],[[92998,93007],"disallowed"],[[93008,93017],"valid"],[[93018,93018],"disallowed"],[[93019,93025],"valid","","NV8"],[[93026,93026],"disallowed"],[[93027,93047],"valid"],[[93048,93052],"disallowed"],[[93053,93071],"valid"],[[93072,93951],"disallowed"],[[93952,94020],"valid"],[[94021,94031],"disallowed"],[[94032,94078],"valid"],[[94079,94094],"disallowed"],[[94095,94111],"valid"],[[94112,94175],"disallowed"],[[94176,94176],"valid"],[[94177,94177],"valid"],[[94178,94207],"disallowed"],[[94208,100332],"valid"],[[100333,100351],"disallowed"],[[100352,101106],"valid"],[[101107,110591],"disallowed"],[[110592,110593],"valid"],[[110594,110878],"valid"],[[110879,110959],"disallowed"],[[110960,111355],"valid"],[[111356,113663],"disallowed"],[[113664,113770],"valid"],[[113771,113775],"disallowed"],[[113776,113788],"valid"],[[113789,113791],"disallowed"],[[113792,113800],"valid"],[[113801,113807],"disallowed"],[[113808,113817],"valid"],[[113818,113819],"disallowed"],[[113820,113820],"valid","","NV8"],[[113821,113822],"valid"],[[113823,113823],"valid","","NV8"],[[113824,113827],"ignored"],[[113828,118783],"disallowed"],[[118784,119029],"valid","","NV8"],[[119030,119039],"disallowed"],[[119040,119078],"valid","","NV8"],[[119079,119080],"disallowed"],[[119081,119081],"valid","","NV8"],[[119082,119133],"valid","","NV8"],[[119134,119134],"mapped","𝅗𝅥"],[[119135,119135],"mapped","𝅘𝅥"],[[119136,119136],"mapped","𝅘𝅥𝅮"],[[119137,119137],"mapped","𝅘𝅥𝅯"],[[119138,119138],"mapped","𝅘𝅥𝅰"],[[119139,119139],"mapped","𝅘𝅥𝅱"],[[119140,119140],"mapped","𝅘𝅥𝅲"],[[119141,119154],"valid","","NV8"],[[119155,119162],"disallowed"],[[119163,119226],"valid","","NV8"],[[119227,119227],"mapped","𝆹𝅥"],[[119228,119228],"mapped","𝆺𝅥"],[[119229,119229],"mapped","𝆹𝅥𝅮"],[[119230,119230],"mapped","𝆺𝅥𝅮"],[[119231,119231],"mapped","𝆹𝅥𝅯"],[[119232,119232],"mapped","𝆺𝅥𝅯"],[[119233,119261],"valid","","NV8"],[[119262,119272],"valid","","NV8"],[[119273,119295],"disallowed"],[[119296,119365],"valid","","NV8"],[[119366,119551],"disallowed"],[[119552,119638],"valid","","NV8"],[[119639,119647],"disallowed"],[[119648,119665],"valid","","NV8"],[[119666,119807],"disallowed"],[[119808,119808],"mapped","a"],[[119809,119809],"mapped","b"],[[119810,119810],"mapped","c"],[[119811,119811],"mapped","d"],[[119812,119812],"mapped","e"],[[119813,119813],"mapped","f"],[[119814,119814],"mapped","g"],[[119815,119815],"mapped","h"],[[119816,119816],"mapped","i"],[[119817,119817],"mapped","j"],[[119818,119818],"mapped","k"],[[119819,119819],"mapped","l"],[[119820,119820],"mapped","m"],[[119821,119821],"mapped","n"],[[119822,119822],"mapped","o"],[[119823,119823],"mapped","p"],[[119824,119824],"mapped","q"],[[119825,119825],"mapped","r"],[[119826,119826],"mapped","s"],[[119827,119827],"mapped","t"],[[119828,119828],"mapped","u"],[[119829,119829],"mapped","v"],[[119830,119830],"mapped","w"],[[119831,119831],"mapped","x"],[[119832,119832],"mapped","y"],[[119833,119833],"mapped","z"],[[119834,119834],"mapped","a"],[[119835,119835],"mapped","b"],[[119836,119836],"mapped","c"],[[119837,119837],"mapped","d"],[[119838,119838],"mapped","e"],[[119839,119839],"mapped","f"],[[119840,119840],"mapped","g"],[[119841,119841],"mapped","h"],[[119842,119842],"mapped","i"],[[119843,119843],"mapped","j"],[[119844,119844],"mapped","k"],[[119845,119845],"mapped","l"],[[119846,119846],"mapped","m"],[[119847,119847],"mapped","n"],[[119848,119848],"mapped","o"],[[119849,119849],"mapped","p"],[[119850,119850],"mapped","q"],[[119851,119851],"mapped","r"],[[119852,119852],"mapped","s"],[[119853,119853],"mapped","t"],[[119854,119854],"mapped","u"],[[119855,119855],"mapped","v"],[[119856,119856],"mapped","w"],[[119857,119857],"mapped","x"],[[119858,119858],"mapped","y"],[[119859,119859],"mapped","z"],[[119860,119860],"mapped","a"],[[119861,119861],"mapped","b"],[[119862,119862],"mapped","c"],[[119863,119863],"mapped","d"],[[119864,119864],"mapped","e"],[[119865,119865],"mapped","f"],[[119866,119866],"mapped","g"],[[119867,119867],"mapped","h"],[[119868,119868],"mapped","i"],[[119869,119869],"mapped","j"],[[119870,119870],"mapped","k"],[[119871,119871],"mapped","l"],[[119872,119872],"mapped","m"],[[119873,119873],"mapped","n"],[[119874,119874],"mapped","o"],[[119875,119875],"mapped","p"],[[119876,119876],"mapped","q"],[[119877,119877],"mapped","r"],[[119878,119878],"mapped","s"],[[119879,119879],"mapped","t"],[[119880,119880],"mapped","u"],[[119881,119881],"mapped","v"],[[119882,119882],"mapped","w"],[[119883,119883],"mapped","x"],[[119884,119884],"mapped","y"],[[119885,119885],"mapped","z"],[[119886,119886],"mapped","a"],[[119887,119887],"mapped","b"],[[119888,119888],"mapped","c"],[[119889,119889],"mapped","d"],[[119890,119890],"mapped","e"],[[119891,119891],"mapped","f"],[[119892,119892],"mapped","g"],[[119893,119893],"disallowed"],[[119894,119894],"mapped","i"],[[119895,119895],"mapped","j"],[[119896,119896],"mapped","k"],[[119897,119897],"mapped","l"],[[119898,119898],"mapped","m"],[[119899,119899],"mapped","n"],[[119900,119900],"mapped","o"],[[119901,119901],"mapped","p"],[[119902,119902],"mapped","q"],[[119903,119903],"mapped","r"],[[119904,119904],"mapped","s"],[[119905,119905],"mapped","t"],[[119906,119906],"mapped","u"],[[119907,119907],"mapped","v"],[[119908,119908],"mapped","w"],[[119909,119909],"mapped","x"],[[119910,119910],"mapped","y"],[[119911,119911],"mapped","z"],[[119912,119912],"mapped","a"],[[119913,119913],"mapped","b"],[[119914,119914],"mapped","c"],[[119915,119915],"mapped","d"],[[119916,119916],"mapped","e"],[[119917,119917],"mapped","f"],[[119918,119918],"mapped","g"],[[119919,119919],"mapped","h"],[[119920,119920],"mapped","i"],[[119921,119921],"mapped","j"],[[119922,119922],"mapped","k"],[[119923,119923],"mapped","l"],[[119924,119924],"mapped","m"],[[119925,119925],"mapped","n"],[[119926,119926],"mapped","o"],[[119927,119927],"mapped","p"],[[119928,119928],"mapped","q"],[[119929,119929],"mapped","r"],[[119930,119930],"mapped","s"],[[119931,119931],"mapped","t"],[[119932,119932],"mapped","u"],[[119933,119933],"mapped","v"],[[119934,119934],"mapped","w"],[[119935,119935],"mapped","x"],[[119936,119936],"mapped","y"],[[119937,119937],"mapped","z"],[[119938,119938],"mapped","a"],[[119939,119939],"mapped","b"],[[119940,119940],"mapped","c"],[[119941,119941],"mapped","d"],[[119942,119942],"mapped","e"],[[119943,119943],"mapped","f"],[[119944,119944],"mapped","g"],[[119945,119945],"mapped","h"],[[119946,119946],"mapped","i"],[[119947,119947],"mapped","j"],[[119948,119948],"mapped","k"],[[119949,119949],"mapped","l"],[[119950,119950],"mapped","m"],[[119951,119951],"mapped","n"],[[119952,119952],"mapped","o"],[[119953,119953],"mapped","p"],[[119954,119954],"mapped","q"],[[119955,119955],"mapped","r"],[[119956,119956],"mapped","s"],[[119957,119957],"mapped","t"],[[119958,119958],"mapped","u"],[[119959,119959],"mapped","v"],[[119960,119960],"mapped","w"],[[119961,119961],"mapped","x"],[[119962,119962],"mapped","y"],[[119963,119963],"mapped","z"],[[119964,119964],"mapped","a"],[[119965,119965],"disallowed"],[[119966,119966],"mapped","c"],[[119967,119967],"mapped","d"],[[119968,119969],"disallowed"],[[119970,119970],"mapped","g"],[[119971,119972],"disallowed"],[[119973,119973],"mapped","j"],[[119974,119974],"mapped","k"],[[119975,119976],"disallowed"],[[119977,119977],"mapped","n"],[[119978,119978],"mapped","o"],[[119979,119979],"mapped","p"],[[119980,119980],"mapped","q"],[[119981,119981],"disallowed"],[[119982,119982],"mapped","s"],[[119983,119983],"mapped","t"],[[119984,119984],"mapped","u"],[[119985,119985],"mapped","v"],[[119986,119986],"mapped","w"],[[119987,119987],"mapped","x"],[[119988,119988],"mapped","y"],[[119989,119989],"mapped","z"],[[119990,119990],"mapped","a"],[[119991,119991],"mapped","b"],[[119992,119992],"mapped","c"],[[119993,119993],"mapped","d"],[[119994,119994],"disallowed"],[[119995,119995],"mapped","f"],[[119996,119996],"disallowed"],[[119997,119997],"mapped","h"],[[119998,119998],"mapped","i"],[[119999,119999],"mapped","j"],[[120000,120000],"mapped","k"],[[120001,120001],"mapped","l"],[[120002,120002],"mapped","m"],[[120003,120003],"mapped","n"],[[120004,120004],"disallowed"],[[120005,120005],"mapped","p"],[[120006,120006],"mapped","q"],[[120007,120007],"mapped","r"],[[120008,120008],"mapped","s"],[[120009,120009],"mapped","t"],[[120010,120010],"mapped","u"],[[120011,120011],"mapped","v"],[[120012,120012],"mapped","w"],[[120013,120013],"mapped","x"],[[120014,120014],"mapped","y"],[[120015,120015],"mapped","z"],[[120016,120016],"mapped","a"],[[120017,120017],"mapped","b"],[[120018,120018],"mapped","c"],[[120019,120019],"mapped","d"],[[120020,120020],"mapped","e"],[[120021,120021],"mapped","f"],[[120022,120022],"mapped","g"],[[120023,120023],"mapped","h"],[[120024,120024],"mapped","i"],[[120025,120025],"mapped","j"],[[120026,120026],"mapped","k"],[[120027,120027],"mapped","l"],[[120028,120028],"mapped","m"],[[120029,120029],"mapped","n"],[[120030,120030],"mapped","o"],[[120031,120031],"mapped","p"],[[120032,120032],"mapped","q"],[[120033,120033],"mapped","r"],[[120034,120034],"mapped","s"],[[120035,120035],"mapped","t"],[[120036,120036],"mapped","u"],[[120037,120037],"mapped","v"],[[120038,120038],"mapped","w"],[[120039,120039],"mapped","x"],[[120040,120040],"mapped","y"],[[120041,120041],"mapped","z"],[[120042,120042],"mapped","a"],[[120043,120043],"mapped","b"],[[120044,120044],"mapped","c"],[[120045,120045],"mapped","d"],[[120046,120046],"mapped","e"],[[120047,120047],"mapped","f"],[[120048,120048],"mapped","g"],[[120049,120049],"mapped","h"],[[120050,120050],"mapped","i"],[[120051,120051],"mapped","j"],[[120052,120052],"mapped","k"],[[120053,120053],"mapped","l"],[[120054,120054],"mapped","m"],[[120055,120055],"mapped","n"],[[120056,120056],"mapped","o"],[[120057,120057],"mapped","p"],[[120058,120058],"mapped","q"],[[120059,120059],"mapped","r"],[[120060,120060],"mapped","s"],[[120061,120061],"mapped","t"],[[120062,120062],"mapped","u"],[[120063,120063],"mapped","v"],[[120064,120064],"mapped","w"],[[120065,120065],"mapped","x"],[[120066,120066],"mapped","y"],[[120067,120067],"mapped","z"],[[120068,120068],"mapped","a"],[[120069,120069],"mapped","b"],[[120070,120070],"disallowed"],[[120071,120071],"mapped","d"],[[120072,120072],"mapped","e"],[[120073,120073],"mapped","f"],[[120074,120074],"mapped","g"],[[120075,120076],"disallowed"],[[120077,120077],"mapped","j"],[[120078,120078],"mapped","k"],[[120079,120079],"mapped","l"],[[120080,120080],"mapped","m"],[[120081,120081],"mapped","n"],[[120082,120082],"mapped","o"],[[120083,120083],"mapped","p"],[[120084,120084],"mapped","q"],[[120085,120085],"disallowed"],[[120086,120086],"mapped","s"],[[120087,120087],"mapped","t"],[[120088,120088],"mapped","u"],[[120089,120089],"mapped","v"],[[120090,120090],"mapped","w"],[[120091,120091],"mapped","x"],[[120092,120092],"mapped","y"],[[120093,120093],"disallowed"],[[120094,120094],"mapped","a"],[[120095,120095],"mapped","b"],[[120096,120096],"mapped","c"],[[120097,120097],"mapped","d"],[[120098,120098],"mapped","e"],[[120099,120099],"mapped","f"],[[120100,120100],"mapped","g"],[[120101,120101],"mapped","h"],[[120102,120102],"mapped","i"],[[120103,120103],"mapped","j"],[[120104,120104],"mapped","k"],[[120105,120105],"mapped","l"],[[120106,120106],"mapped","m"],[[120107,120107],"mapped","n"],[[120108,120108],"mapped","o"],[[120109,120109],"mapped","p"],[[120110,120110],"mapped","q"],[[120111,120111],"mapped","r"],[[120112,120112],"mapped","s"],[[120113,120113],"mapped","t"],[[120114,120114],"mapped","u"],[[120115,120115],"mapped","v"],[[120116,120116],"mapped","w"],[[120117,120117],"mapped","x"],[[120118,120118],"mapped","y"],[[120119,120119],"mapped","z"],[[120120,120120],"mapped","a"],[[120121,120121],"mapped","b"],[[120122,120122],"disallowed"],[[120123,120123],"mapped","d"],[[120124,120124],"mapped","e"],[[120125,120125],"mapped","f"],[[120126,120126],"mapped","g"],[[120127,120127],"disallowed"],[[120128,120128],"mapped","i"],[[120129,120129],"mapped","j"],[[120130,120130],"mapped","k"],[[120131,120131],"mapped","l"],[[120132,120132],"mapped","m"],[[120133,120133],"disallowed"],[[120134,120134],"mapped","o"],[[120135,120137],"disallowed"],[[120138,120138],"mapped","s"],[[120139,120139],"mapped","t"],[[120140,120140],"mapped","u"],[[120141,120141],"mapped","v"],[[120142,120142],"mapped","w"],[[120143,120143],"mapped","x"],[[120144,120144],"mapped","y"],[[120145,120145],"disallowed"],[[120146,120146],"mapped","a"],[[120147,120147],"mapped","b"],[[120148,120148],"mapped","c"],[[120149,120149],"mapped","d"],[[120150,120150],"mapped","e"],[[120151,120151],"mapped","f"],[[120152,120152],"mapped","g"],[[120153,120153],"mapped","h"],[[120154,120154],"mapped","i"],[[120155,120155],"mapped","j"],[[120156,120156],"mapped","k"],[[120157,120157],"mapped","l"],[[120158,120158],"mapped","m"],[[120159,120159],"mapped","n"],[[120160,120160],"mapped","o"],[[120161,120161],"mapped","p"],[[120162,120162],"mapped","q"],[[120163,120163],"mapped","r"],[[120164,120164],"mapped","s"],[[120165,120165],"mapped","t"],[[120166,120166],"mapped","u"],[[120167,120167],"mapped","v"],[[120168,120168],"mapped","w"],[[120169,120169],"mapped","x"],[[120170,120170],"mapped","y"],[[120171,120171],"mapped","z"],[[120172,120172],"mapped","a"],[[120173,120173],"mapped","b"],[[120174,120174],"mapped","c"],[[120175,120175],"mapped","d"],[[120176,120176],"mapped","e"],[[120177,120177],"mapped","f"],[[120178,120178],"mapped","g"],[[120179,120179],"mapped","h"],[[120180,120180],"mapped","i"],[[120181,120181],"mapped","j"],[[120182,120182],"mapped","k"],[[120183,120183],"mapped","l"],[[120184,120184],"mapped","m"],[[120185,120185],"mapped","n"],[[120186,120186],"mapped","o"],[[120187,120187],"mapped","p"],[[120188,120188],"mapped","q"],[[120189,120189],"mapped","r"],[[120190,120190],"mapped","s"],[[120191,120191],"mapped","t"],[[120192,120192],"mapped","u"],[[120193,120193],"mapped","v"],[[120194,120194],"mapped","w"],[[120195,120195],"mapped","x"],[[120196,120196],"mapped","y"],[[120197,120197],"mapped","z"],[[120198,120198],"mapped","a"],[[120199,120199],"mapped","b"],[[120200,120200],"mapped","c"],[[120201,120201],"mapped","d"],[[120202,120202],"mapped","e"],[[120203,120203],"mapped","f"],[[120204,120204],"mapped","g"],[[120205,120205],"mapped","h"],[[120206,120206],"mapped","i"],[[120207,120207],"mapped","j"],[[120208,120208],"mapped","k"],[[120209,120209],"mapped","l"],[[120210,120210],"mapped","m"],[[120211,120211],"mapped","n"],[[120212,120212],"mapped","o"],[[120213,120213],"mapped","p"],[[120214,120214],"mapped","q"],[[120215,120215],"mapped","r"],[[120216,120216],"mapped","s"],[[120217,120217],"mapped","t"],[[120218,120218],"mapped","u"],[[120219,120219],"mapped","v"],[[120220,120220],"mapped","w"],[[120221,120221],"mapped","x"],[[120222,120222],"mapped","y"],[[120223,120223],"mapped","z"],[[120224,120224],"mapped","a"],[[120225,120225],"mapped","b"],[[120226,120226],"mapped","c"],[[120227,120227],"mapped","d"],[[120228,120228],"mapped","e"],[[120229,120229],"mapped","f"],[[120230,120230],"mapped","g"],[[120231,120231],"mapped","h"],[[120232,120232],"mapped","i"],[[120233,120233],"mapped","j"],[[120234,120234],"mapped","k"],[[120235,120235],"mapped","l"],[[120236,120236],"mapped","m"],[[120237,120237],"mapped","n"],[[120238,120238],"mapped","o"],[[120239,120239],"mapped","p"],[[120240,120240],"mapped","q"],[[120241,120241],"mapped","r"],[[120242,120242],"mapped","s"],[[120243,120243],"mapped","t"],[[120244,120244],"mapped","u"],[[120245,120245],"mapped","v"],[[120246,120246],"mapped","w"],[[120247,120247],"mapped","x"],[[120248,120248],"mapped","y"],[[120249,120249],"mapped","z"],[[120250,120250],"mapped","a"],[[120251,120251],"mapped","b"],[[120252,120252],"mapped","c"],[[120253,120253],"mapped","d"],[[120254,120254],"mapped","e"],[[120255,120255],"mapped","f"],[[120256,120256],"mapped","g"],[[120257,120257],"mapped","h"],[[120258,120258],"mapped","i"],[[120259,120259],"mapped","j"],[[120260,120260],"mapped","k"],[[120261,120261],"mapped","l"],[[120262,120262],"mapped","m"],[[120263,120263],"mapped","n"],[[120264,120264],"mapped","o"],[[120265,120265],"mapped","p"],[[120266,120266],"mapped","q"],[[120267,120267],"mapped","r"],[[120268,120268],"mapped","s"],[[120269,120269],"mapped","t"],[[120270,120270],"mapped","u"],[[120271,120271],"mapped","v"],[[120272,120272],"mapped","w"],[[120273,120273],"mapped","x"],[[120274,120274],"mapped","y"],[[120275,120275],"mapped","z"],[[120276,120276],"mapped","a"],[[120277,120277],"mapped","b"],[[120278,120278],"mapped","c"],[[120279,120279],"mapped","d"],[[120280,120280],"mapped","e"],[[120281,120281],"mapped","f"],[[120282,120282],"mapped","g"],[[120283,120283],"mapped","h"],[[120284,120284],"mapped","i"],[[120285,120285],"mapped","j"],[[120286,120286],"mapped","k"],[[120287,120287],"mapped","l"],[[120288,120288],"mapped","m"],[[120289,120289],"mapped","n"],[[120290,120290],"mapped","o"],[[120291,120291],"mapped","p"],[[120292,120292],"mapped","q"],[[120293,120293],"mapped","r"],[[120294,120294],"mapped","s"],[[120295,120295],"mapped","t"],[[120296,120296],"mapped","u"],[[120297,120297],"mapped","v"],[[120298,120298],"mapped","w"],[[120299,120299],"mapped","x"],[[120300,120300],"mapped","y"],[[120301,120301],"mapped","z"],[[120302,120302],"mapped","a"],[[120303,120303],"mapped","b"],[[120304,120304],"mapped","c"],[[120305,120305],"mapped","d"],[[120306,120306],"mapped","e"],[[120307,120307],"mapped","f"],[[120308,120308],"mapped","g"],[[120309,120309],"mapped","h"],[[120310,120310],"mapped","i"],[[120311,120311],"mapped","j"],[[120312,120312],"mapped","k"],[[120313,120313],"mapped","l"],[[120314,120314],"mapped","m"],[[120315,120315],"mapped","n"],[[120316,120316],"mapped","o"],[[120317,120317],"mapped","p"],[[120318,120318],"mapped","q"],[[120319,120319],"mapped","r"],[[120320,120320],"mapped","s"],[[120321,120321],"mapped","t"],[[120322,120322],"mapped","u"],[[120323,120323],"mapped","v"],[[120324,120324],"mapped","w"],[[120325,120325],"mapped","x"],[[120326,120326],"mapped","y"],[[120327,120327],"mapped","z"],[[120328,120328],"mapped","a"],[[120329,120329],"mapped","b"],[[120330,120330],"mapped","c"],[[120331,120331],"mapped","d"],[[120332,120332],"mapped","e"],[[120333,120333],"mapped","f"],[[120334,120334],"mapped","g"],[[120335,120335],"mapped","h"],[[120336,120336],"mapped","i"],[[120337,120337],"mapped","j"],[[120338,120338],"mapped","k"],[[120339,120339],"mapped","l"],[[120340,120340],"mapped","m"],[[120341,120341],"mapped","n"],[[120342,120342],"mapped","o"],[[120343,120343],"mapped","p"],[[120344,120344],"mapped","q"],[[120345,120345],"mapped","r"],[[120346,120346],"mapped","s"],[[120347,120347],"mapped","t"],[[120348,120348],"mapped","u"],[[120349,120349],"mapped","v"],[[120350,120350],"mapped","w"],[[120351,120351],"mapped","x"],[[120352,120352],"mapped","y"],[[120353,120353],"mapped","z"],[[120354,120354],"mapped","a"],[[120355,120355],"mapped","b"],[[120356,120356],"mapped","c"],[[120357,120357],"mapped","d"],[[120358,120358],"mapped","e"],[[120359,120359],"mapped","f"],[[120360,120360],"mapped","g"],[[120361,120361],"mapped","h"],[[120362,120362],"mapped","i"],[[120363,120363],"mapped","j"],[[120364,120364],"mapped","k"],[[120365,120365],"mapped","l"],[[120366,120366],"mapped","m"],[[120367,120367],"mapped","n"],[[120368,120368],"mapped","o"],[[120369,120369],"mapped","p"],[[120370,120370],"mapped","q"],[[120371,120371],"mapped","r"],[[120372,120372],"mapped","s"],[[120373,120373],"mapped","t"],[[120374,120374],"mapped","u"],[[120375,120375],"mapped","v"],[[120376,120376],"mapped","w"],[[120377,120377],"mapped","x"],[[120378,120378],"mapped","y"],[[120379,120379],"mapped","z"],[[120380,120380],"mapped","a"],[[120381,120381],"mapped","b"],[[120382,120382],"mapped","c"],[[120383,120383],"mapped","d"],[[120384,120384],"mapped","e"],[[120385,120385],"mapped","f"],[[120386,120386],"mapped","g"],[[120387,120387],"mapped","h"],[[120388,120388],"mapped","i"],[[120389,120389],"mapped","j"],[[120390,120390],"mapped","k"],[[120391,120391],"mapped","l"],[[120392,120392],"mapped","m"],[[120393,120393],"mapped","n"],[[120394,120394],"mapped","o"],[[120395,120395],"mapped","p"],[[120396,120396],"mapped","q"],[[120397,120397],"mapped","r"],[[120398,120398],"mapped","s"],[[120399,120399],"mapped","t"],[[120400,120400],"mapped","u"],[[120401,120401],"mapped","v"],[[120402,120402],"mapped","w"],[[120403,120403],"mapped","x"],[[120404,120404],"mapped","y"],[[120405,120405],"mapped","z"],[[120406,120406],"mapped","a"],[[120407,120407],"mapped","b"],[[120408,120408],"mapped","c"],[[120409,120409],"mapped","d"],[[120410,120410],"mapped","e"],[[120411,120411],"mapped","f"],[[120412,120412],"mapped","g"],[[120413,120413],"mapped","h"],[[120414,120414],"mapped","i"],[[120415,120415],"mapped","j"],[[120416,120416],"mapped","k"],[[120417,120417],"mapped","l"],[[120418,120418],"mapped","m"],[[120419,120419],"mapped","n"],[[120420,120420],"mapped","o"],[[120421,120421],"mapped","p"],[[120422,120422],"mapped","q"],[[120423,120423],"mapped","r"],[[120424,120424],"mapped","s"],[[120425,120425],"mapped","t"],[[120426,120426],"mapped","u"],[[120427,120427],"mapped","v"],[[120428,120428],"mapped","w"],[[120429,120429],"mapped","x"],[[120430,120430],"mapped","y"],[[120431,120431],"mapped","z"],[[120432,120432],"mapped","a"],[[120433,120433],"mapped","b"],[[120434,120434],"mapped","c"],[[120435,120435],"mapped","d"],[[120436,120436],"mapped","e"],[[120437,120437],"mapped","f"],[[120438,120438],"mapped","g"],[[120439,120439],"mapped","h"],[[120440,120440],"mapped","i"],[[120441,120441],"mapped","j"],[[120442,120442],"mapped","k"],[[120443,120443],"mapped","l"],[[120444,120444],"mapped","m"],[[120445,120445],"mapped","n"],[[120446,120446],"mapped","o"],[[120447,120447],"mapped","p"],[[120448,120448],"mapped","q"],[[120449,120449],"mapped","r"],[[120450,120450],"mapped","s"],[[120451,120451],"mapped","t"],[[120452,120452],"mapped","u"],[[120453,120453],"mapped","v"],[[120454,120454],"mapped","w"],[[120455,120455],"mapped","x"],[[120456,120456],"mapped","y"],[[120457,120457],"mapped","z"],[[120458,120458],"mapped","a"],[[120459,120459],"mapped","b"],[[120460,120460],"mapped","c"],[[120461,120461],"mapped","d"],[[120462,120462],"mapped","e"],[[120463,120463],"mapped","f"],[[120464,120464],"mapped","g"],[[120465,120465],"mapped","h"],[[120466,120466],"mapped","i"],[[120467,120467],"mapped","j"],[[120468,120468],"mapped","k"],[[120469,120469],"mapped","l"],[[120470,120470],"mapped","m"],[[120471,120471],"mapped","n"],[[120472,120472],"mapped","o"],[[120473,120473],"mapped","p"],[[120474,120474],"mapped","q"],[[120475,120475],"mapped","r"],[[120476,120476],"mapped","s"],[[120477,120477],"mapped","t"],[[120478,120478],"mapped","u"],[[120479,120479],"mapped","v"],[[120480,120480],"mapped","w"],[[120481,120481],"mapped","x"],[[120482,120482],"mapped","y"],[[120483,120483],"mapped","z"],[[120484,120484],"mapped","ı"],[[120485,120485],"mapped","ȷ"],[[120486,120487],"disallowed"],[[120488,120488],"mapped","α"],[[120489,120489],"mapped","β"],[[120490,120490],"mapped","γ"],[[120491,120491],"mapped","δ"],[[120492,120492],"mapped","ε"],[[120493,120493],"mapped","ζ"],[[120494,120494],"mapped","η"],[[120495,120495],"mapped","θ"],[[120496,120496],"mapped","ι"],[[120497,120497],"mapped","κ"],[[120498,120498],"mapped","λ"],[[120499,120499],"mapped","μ"],[[120500,120500],"mapped","ν"],[[120501,120501],"mapped","ξ"],[[120502,120502],"mapped","ο"],[[120503,120503],"mapped","π"],[[120504,120504],"mapped","ρ"],[[120505,120505],"mapped","θ"],[[120506,120506],"mapped","σ"],[[120507,120507],"mapped","τ"],[[120508,120508],"mapped","υ"],[[120509,120509],"mapped","φ"],[[120510,120510],"mapped","χ"],[[120511,120511],"mapped","ψ"],[[120512,120512],"mapped","ω"],[[120513,120513],"mapped","∇"],[[120514,120514],"mapped","α"],[[120515,120515],"mapped","β"],[[120516,120516],"mapped","γ"],[[120517,120517],"mapped","δ"],[[120518,120518],"mapped","ε"],[[120519,120519],"mapped","ζ"],[[120520,120520],"mapped","η"],[[120521,120521],"mapped","θ"],[[120522,120522],"mapped","ι"],[[120523,120523],"mapped","κ"],[[120524,120524],"mapped","λ"],[[120525,120525],"mapped","μ"],[[120526,120526],"mapped","ν"],[[120527,120527],"mapped","ξ"],[[120528,120528],"mapped","ο"],[[120529,120529],"mapped","π"],[[120530,120530],"mapped","ρ"],[[120531,120532],"mapped","σ"],[[120533,120533],"mapped","τ"],[[120534,120534],"mapped","υ"],[[120535,120535],"mapped","φ"],[[120536,120536],"mapped","χ"],[[120537,120537],"mapped","ψ"],[[120538,120538],"mapped","ω"],[[120539,120539],"mapped","∂"],[[120540,120540],"mapped","ε"],[[120541,120541],"mapped","θ"],[[120542,120542],"mapped","κ"],[[120543,120543],"mapped","φ"],[[120544,120544],"mapped","ρ"],[[120545,120545],"mapped","π"],[[120546,120546],"mapped","α"],[[120547,120547],"mapped","β"],[[120548,120548],"mapped","γ"],[[120549,120549],"mapped","δ"],[[120550,120550],"mapped","ε"],[[120551,120551],"mapped","ζ"],[[120552,120552],"mapped","η"],[[120553,120553],"mapped","θ"],[[120554,120554],"mapped","ι"],[[120555,120555],"mapped","κ"],[[120556,120556],"mapped","λ"],[[120557,120557],"mapped","μ"],[[120558,120558],"mapped","ν"],[[120559,120559],"mapped","ξ"],[[120560,120560],"mapped","ο"],[[120561,120561],"mapped","π"],[[120562,120562],"mapped","ρ"],[[120563,120563],"mapped","θ"],[[120564,120564],"mapped","σ"],[[120565,120565],"mapped","τ"],[[120566,120566],"mapped","υ"],[[120567,120567],"mapped","φ"],[[120568,120568],"mapped","χ"],[[120569,120569],"mapped","ψ"],[[120570,120570],"mapped","ω"],[[120571,120571],"mapped","∇"],[[120572,120572],"mapped","α"],[[120573,120573],"mapped","β"],[[120574,120574],"mapped","γ"],[[120575,120575],"mapped","δ"],[[120576,120576],"mapped","ε"],[[120577,120577],"mapped","ζ"],[[120578,120578],"mapped","η"],[[120579,120579],"mapped","θ"],[[120580,120580],"mapped","ι"],[[120581,120581],"mapped","κ"],[[120582,120582],"mapped","λ"],[[120583,120583],"mapped","μ"],[[120584,120584],"mapped","ν"],[[120585,120585],"mapped","ξ"],[[120586,120586],"mapped","ο"],[[120587,120587],"mapped","π"],[[120588,120588],"mapped","ρ"],[[120589,120590],"mapped","σ"],[[120591,120591],"mapped","τ"],[[120592,120592],"mapped","υ"],[[120593,120593],"mapped","φ"],[[120594,120594],"mapped","χ"],[[120595,120595],"mapped","ψ"],[[120596,120596],"mapped","ω"],[[120597,120597],"mapped","∂"],[[120598,120598],"mapped","ε"],[[120599,120599],"mapped","θ"],[[120600,120600],"mapped","κ"],[[120601,120601],"mapped","φ"],[[120602,120602],"mapped","ρ"],[[120603,120603],"mapped","π"],[[120604,120604],"mapped","α"],[[120605,120605],"mapped","β"],[[120606,120606],"mapped","γ"],[[120607,120607],"mapped","δ"],[[120608,120608],"mapped","ε"],[[120609,120609],"mapped","ζ"],[[120610,120610],"mapped","η"],[[120611,120611],"mapped","θ"],[[120612,120612],"mapped","ι"],[[120613,120613],"mapped","κ"],[[120614,120614],"mapped","λ"],[[120615,120615],"mapped","μ"],[[120616,120616],"mapped","ν"],[[120617,120617],"mapped","ξ"],[[120618,120618],"mapped","ο"],[[120619,120619],"mapped","π"],[[120620,120620],"mapped","ρ"],[[120621,120621],"mapped","θ"],[[120622,120622],"mapped","σ"],[[120623,120623],"mapped","τ"],[[120624,120624],"mapped","υ"],[[120625,120625],"mapped","φ"],[[120626,120626],"mapped","χ"],[[120627,120627],"mapped","ψ"],[[120628,120628],"mapped","ω"],[[120629,120629],"mapped","∇"],[[120630,120630],"mapped","α"],[[120631,120631],"mapped","β"],[[120632,120632],"mapped","γ"],[[120633,120633],"mapped","δ"],[[120634,120634],"mapped","ε"],[[120635,120635],"mapped","ζ"],[[120636,120636],"mapped","η"],[[120637,120637],"mapped","θ"],[[120638,120638],"mapped","ι"],[[120639,120639],"mapped","κ"],[[120640,120640],"mapped","λ"],[[120641,120641],"mapped","μ"],[[120642,120642],"mapped","ν"],[[120643,120643],"mapped","ξ"],[[120644,120644],"mapped","ο"],[[120645,120645],"mapped","π"],[[120646,120646],"mapped","ρ"],[[120647,120648],"mapped","σ"],[[120649,120649],"mapped","τ"],[[120650,120650],"mapped","υ"],[[120651,120651],"mapped","φ"],[[120652,120652],"mapped","χ"],[[120653,120653],"mapped","ψ"],[[120654,120654],"mapped","ω"],[[120655,120655],"mapped","∂"],[[120656,120656],"mapped","ε"],[[120657,120657],"mapped","θ"],[[120658,120658],"mapped","κ"],[[120659,120659],"mapped","φ"],[[120660,120660],"mapped","ρ"],[[120661,120661],"mapped","π"],[[120662,120662],"mapped","α"],[[120663,120663],"mapped","β"],[[120664,120664],"mapped","γ"],[[120665,120665],"mapped","δ"],[[120666,120666],"mapped","ε"],[[120667,120667],"mapped","ζ"],[[120668,120668],"mapped","η"],[[120669,120669],"mapped","θ"],[[120670,120670],"mapped","ι"],[[120671,120671],"mapped","κ"],[[120672,120672],"mapped","λ"],[[120673,120673],"mapped","μ"],[[120674,120674],"mapped","ν"],[[120675,120675],"mapped","ξ"],[[120676,120676],"mapped","ο"],[[120677,120677],"mapped","π"],[[120678,120678],"mapped","ρ"],[[120679,120679],"mapped","θ"],[[120680,120680],"mapped","σ"],[[120681,120681],"mapped","τ"],[[120682,120682],"mapped","υ"],[[120683,120683],"mapped","φ"],[[120684,120684],"mapped","χ"],[[120685,120685],"mapped","ψ"],[[120686,120686],"mapped","ω"],[[120687,120687],"mapped","∇"],[[120688,120688],"mapped","α"],[[120689,120689],"mapped","β"],[[120690,120690],"mapped","γ"],[[120691,120691],"mapped","δ"],[[120692,120692],"mapped","ε"],[[120693,120693],"mapped","ζ"],[[120694,120694],"mapped","η"],[[120695,120695],"mapped","θ"],[[120696,120696],"mapped","ι"],[[120697,120697],"mapped","κ"],[[120698,120698],"mapped","λ"],[[120699,120699],"mapped","μ"],[[120700,120700],"mapped","ν"],[[120701,120701],"mapped","ξ"],[[120702,120702],"mapped","ο"],[[120703,120703],"mapped","π"],[[120704,120704],"mapped","ρ"],[[120705,120706],"mapped","σ"],[[120707,120707],"mapped","τ"],[[120708,120708],"mapped","υ"],[[120709,120709],"mapped","φ"],[[120710,120710],"mapped","χ"],[[120711,120711],"mapped","ψ"],[[120712,120712],"mapped","ω"],[[120713,120713],"mapped","∂"],[[120714,120714],"mapped","ε"],[[120715,120715],"mapped","θ"],[[120716,120716],"mapped","κ"],[[120717,120717],"mapped","φ"],[[120718,120718],"mapped","ρ"],[[120719,120719],"mapped","π"],[[120720,120720],"mapped","α"],[[120721,120721],"mapped","β"],[[120722,120722],"mapped","γ"],[[120723,120723],"mapped","δ"],[[120724,120724],"mapped","ε"],[[120725,120725],"mapped","ζ"],[[120726,120726],"mapped","η"],[[120727,120727],"mapped","θ"],[[120728,120728],"mapped","ι"],[[120729,120729],"mapped","κ"],[[120730,120730],"mapped","λ"],[[120731,120731],"mapped","μ"],[[120732,120732],"mapped","ν"],[[120733,120733],"mapped","ξ"],[[120734,120734],"mapped","ο"],[[120735,120735],"mapped","π"],[[120736,120736],"mapped","ρ"],[[120737,120737],"mapped","θ"],[[120738,120738],"mapped","σ"],[[120739,120739],"mapped","τ"],[[120740,120740],"mapped","υ"],[[120741,120741],"mapped","φ"],[[120742,120742],"mapped","χ"],[[120743,120743],"mapped","ψ"],[[120744,120744],"mapped","ω"],[[120745,120745],"mapped","∇"],[[120746,120746],"mapped","α"],[[120747,120747],"mapped","β"],[[120748,120748],"mapped","γ"],[[120749,120749],"mapped","δ"],[[120750,120750],"mapped","ε"],[[120751,120751],"mapped","ζ"],[[120752,120752],"mapped","η"],[[120753,120753],"mapped","θ"],[[120754,120754],"mapped","ι"],[[120755,120755],"mapped","κ"],[[120756,120756],"mapped","λ"],[[120757,120757],"mapped","μ"],[[120758,120758],"mapped","ν"],[[120759,120759],"mapped","ξ"],[[120760,120760],"mapped","ο"],[[120761,120761],"mapped","π"],[[120762,120762],"mapped","ρ"],[[120763,120764],"mapped","σ"],[[120765,120765],"mapped","τ"],[[120766,120766],"mapped","υ"],[[120767,120767],"mapped","φ"],[[120768,120768],"mapped","χ"],[[120769,120769],"mapped","ψ"],[[120770,120770],"mapped","ω"],[[120771,120771],"mapped","∂"],[[120772,120772],"mapped","ε"],[[120773,120773],"mapped","θ"],[[120774,120774],"mapped","κ"],[[120775,120775],"mapped","φ"],[[120776,120776],"mapped","ρ"],[[120777,120777],"mapped","π"],[[120778,120779],"mapped","ϝ"],[[120780,120781],"disallowed"],[[120782,120782],"mapped","0"],[[120783,120783],"mapped","1"],[[120784,120784],"mapped","2"],[[120785,120785],"mapped","3"],[[120786,120786],"mapped","4"],[[120787,120787],"mapped","5"],[[120788,120788],"mapped","6"],[[120789,120789],"mapped","7"],[[120790,120790],"mapped","8"],[[120791,120791],"mapped","9"],[[120792,120792],"mapped","0"],[[120793,120793],"mapped","1"],[[120794,120794],"mapped","2"],[[120795,120795],"mapped","3"],[[120796,120796],"mapped","4"],[[120797,120797],"mapped","5"],[[120798,120798],"mapped","6"],[[120799,120799],"mapped","7"],[[120800,120800],"mapped","8"],[[120801,120801],"mapped","9"],[[120802,120802],"mapped","0"],[[120803,120803],"mapped","1"],[[120804,120804],"mapped","2"],[[120805,120805],"mapped","3"],[[120806,120806],"mapped","4"],[[120807,120807],"mapped","5"],[[120808,120808],"mapped","6"],[[120809,120809],"mapped","7"],[[120810,120810],"mapped","8"],[[120811,120811],"mapped","9"],[[120812,120812],"mapped","0"],[[120813,120813],"mapped","1"],[[120814,120814],"mapped","2"],[[120815,120815],"mapped","3"],[[120816,120816],"mapped","4"],[[120817,120817],"mapped","5"],[[120818,120818],"mapped","6"],[[120819,120819],"mapped","7"],[[120820,120820],"mapped","8"],[[120821,120821],"mapped","9"],[[120822,120822],"mapped","0"],[[120823,120823],"mapped","1"],[[120824,120824],"mapped","2"],[[120825,120825],"mapped","3"],[[120826,120826],"mapped","4"],[[120827,120827],"mapped","5"],[[120828,120828],"mapped","6"],[[120829,120829],"mapped","7"],[[120830,120830],"mapped","8"],[[120831,120831],"mapped","9"],[[120832,121343],"valid","","NV8"],[[121344,121398],"valid"],[[121399,121402],"valid","","NV8"],[[121403,121452],"valid"],[[121453,121460],"valid","","NV8"],[[121461,121461],"valid"],[[121462,121475],"valid","","NV8"],[[121476,121476],"valid"],[[121477,121483],"valid","","NV8"],[[121484,121498],"disallowed"],[[121499,121503],"valid"],[[121504,121504],"disallowed"],[[121505,121519],"valid"],[[121520,122879],"disallowed"],[[122880,122886],"valid"],[[122887,122887],"disallowed"],[[122888,122904],"valid"],[[122905,122906],"disallowed"],[[122907,122913],"valid"],[[122914,122914],"disallowed"],[[122915,122916],"valid"],[[122917,122917],"disallowed"],[[122918,122922],"valid"],[[122923,124927],"disallowed"],[[124928,125124],"valid"],[[125125,125126],"disallowed"],[[125127,125135],"valid","","NV8"],[[125136,125142],"valid"],[[125143,125183],"disallowed"],[[125184,125184],"mapped","𞤢"],[[125185,125185],"mapped","𞤣"],[[125186,125186],"mapped","𞤤"],[[125187,125187],"mapped","𞤥"],[[125188,125188],"mapped","𞤦"],[[125189,125189],"mapped","𞤧"],[[125190,125190],"mapped","𞤨"],[[125191,125191],"mapped","𞤩"],[[125192,125192],"mapped","𞤪"],[[125193,125193],"mapped","𞤫"],[[125194,125194],"mapped","𞤬"],[[125195,125195],"mapped","𞤭"],[[125196,125196],"mapped","𞤮"],[[125197,125197],"mapped","𞤯"],[[125198,125198],"mapped","𞤰"],[[125199,125199],"mapped","𞤱"],[[125200,125200],"mapped","𞤲"],[[125201,125201],"mapped","𞤳"],[[125202,125202],"mapped","𞤴"],[[125203,125203],"mapped","𞤵"],[[125204,125204],"mapped","𞤶"],[[125205,125205],"mapped","𞤷"],[[125206,125206],"mapped","𞤸"],[[125207,125207],"mapped","𞤹"],[[125208,125208],"mapped","𞤺"],[[125209,125209],"mapped","𞤻"],[[125210,125210],"mapped","𞤼"],[[125211,125211],"mapped","𞤽"],[[125212,125212],"mapped","𞤾"],[[125213,125213],"mapped","𞤿"],[[125214,125214],"mapped","𞥀"],[[125215,125215],"mapped","𞥁"],[[125216,125216],"mapped","𞥂"],[[125217,125217],"mapped","𞥃"],[[125218,125258],"valid"],[[125259,125263],"disallowed"],[[125264,125273],"valid"],[[125274,125277],"disallowed"],[[125278,125279],"valid","","NV8"],[[125280,126463],"disallowed"],[[126464,126464],"mapped","ا"],[[126465,126465],"mapped","ب"],[[126466,126466],"mapped","ج"],[[126467,126467],"mapped","د"],[[126468,126468],"disallowed"],[[126469,126469],"mapped","و"],[[126470,126470],"mapped","ز"],[[126471,126471],"mapped","ح"],[[126472,126472],"mapped","ط"],[[126473,126473],"mapped","ي"],[[126474,126474],"mapped","ك"],[[126475,126475],"mapped","ل"],[[126476,126476],"mapped","م"],[[126477,126477],"mapped","ن"],[[126478,126478],"mapped","س"],[[126479,126479],"mapped","ع"],[[126480,126480],"mapped","ف"],[[126481,126481],"mapped","ص"],[[126482,126482],"mapped","ق"],[[126483,126483],"mapped","ر"],[[126484,126484],"mapped","ش"],[[126485,126485],"mapped","ت"],[[126486,126486],"mapped","ث"],[[126487,126487],"mapped","خ"],[[126488,126488],"mapped","ذ"],[[126489,126489],"mapped","ض"],[[126490,126490],"mapped","ظ"],[[126491,126491],"mapped","غ"],[[126492,126492],"mapped","ٮ"],[[126493,126493],"mapped","ں"],[[126494,126494],"mapped","ڡ"],[[126495,126495],"mapped","ٯ"],[[126496,126496],"disallowed"],[[126497,126497],"mapped","ب"],[[126498,126498],"mapped","ج"],[[126499,126499],"disallowed"],[[126500,126500],"mapped","ه"],[[126501,126502],"disallowed"],[[126503,126503],"mapped","ح"],[[126504,126504],"disallowed"],[[126505,126505],"mapped","ي"],[[126506,126506],"mapped","ك"],[[126507,126507],"mapped","ل"],[[126508,126508],"mapped","م"],[[126509,126509],"mapped","ن"],[[126510,126510],"mapped","س"],[[126511,126511],"mapped","ع"],[[126512,126512],"mapped","ف"],[[126513,126513],"mapped","ص"],[[126514,126514],"mapped","ق"],[[126515,126515],"disallowed"],[[126516,126516],"mapped","ش"],[[126517,126517],"mapped","ت"],[[126518,126518],"mapped","ث"],[[126519,126519],"mapped","خ"],[[126520,126520],"disallowed"],[[126521,126521],"mapped","ض"],[[126522,126522],"disallowed"],[[126523,126523],"mapped","غ"],[[126524,126529],"disallowed"],[[126530,126530],"mapped","ج"],[[126531,126534],"disallowed"],[[126535,126535],"mapped","ح"],[[126536,126536],"disallowed"],[[126537,126537],"mapped","ي"],[[126538,126538],"disallowed"],[[126539,126539],"mapped","ل"],[[126540,126540],"disallowed"],[[126541,126541],"mapped","ن"],[[126542,126542],"mapped","س"],[[126543,126543],"mapped","ع"],[[126544,126544],"disallowed"],[[126545,126545],"mapped","ص"],[[126546,126546],"mapped","ق"],[[126547,126547],"disallowed"],[[126548,126548],"mapped","ش"],[[126549,126550],"disallowed"],[[126551,126551],"mapped","خ"],[[126552,126552],"disallowed"],[[126553,126553],"mapped","ض"],[[126554,126554],"disallowed"],[[126555,126555],"mapped","غ"],[[126556,126556],"disallowed"],[[126557,126557],"mapped","ں"],[[126558,126558],"disallowed"],[[126559,126559],"mapped","ٯ"],[[126560,126560],"disallowed"],[[126561,126561],"mapped","ب"],[[126562,126562],"mapped","ج"],[[126563,126563],"disallowed"],[[126564,126564],"mapped","ه"],[[126565,126566],"disallowed"],[[126567,126567],"mapped","ح"],[[126568,126568],"mapped","ط"],[[126569,126569],"mapped","ي"],[[126570,126570],"mapped","ك"],[[126571,126571],"disallowed"],[[126572,126572],"mapped","م"],[[126573,126573],"mapped","ن"],[[126574,126574],"mapped","س"],[[126575,126575],"mapped","ع"],[[126576,126576],"mapped","ف"],[[126577,126577],"mapped","ص"],[[126578,126578],"mapped","ق"],[[126579,126579],"disallowed"],[[126580,126580],"mapped","ش"],[[126581,126581],"mapped","ت"],[[126582,126582],"mapped","ث"],[[126583,126583],"mapped","خ"],[[126584,126584],"disallowed"],[[126585,126585],"mapped","ض"],[[126586,126586],"mapped","ظ"],[[126587,126587],"mapped","غ"],[[126588,126588],"mapped","ٮ"],[[126589,126589],"disallowed"],[[126590,126590],"mapped","ڡ"],[[126591,126591],"disallowed"],[[126592,126592],"mapped","ا"],[[126593,126593],"mapped","ب"],[[126594,126594],"mapped","ج"],[[126595,126595],"mapped","د"],[[126596,126596],"mapped","ه"],[[126597,126597],"mapped","و"],[[126598,126598],"mapped","ز"],[[126599,126599],"mapped","ح"],[[126600,126600],"mapped","ط"],[[126601,126601],"mapped","ي"],[[126602,126602],"disallowed"],[[126603,126603],"mapped","ل"],[[126604,126604],"mapped","م"],[[126605,126605],"mapped","ن"],[[126606,126606],"mapped","س"],[[126607,126607],"mapped","ع"],[[126608,126608],"mapped","ف"],[[126609,126609],"mapped","ص"],[[126610,126610],"mapped","ق"],[[126611,126611],"mapped","ر"],[[126612,126612],"mapped","ش"],[[126613,126613],"mapped","ت"],[[126614,126614],"mapped","ث"],[[126615,126615],"mapped","خ"],[[126616,126616],"mapped","ذ"],[[126617,126617],"mapped","ض"],[[126618,126618],"mapped","ظ"],[[126619,126619],"mapped","غ"],[[126620,126624],"disallowed"],[[126625,126625],"mapped","ب"],[[126626,126626],"mapped","ج"],[[126627,126627],"mapped","د"],[[126628,126628],"disallowed"],[[126629,126629],"mapped","و"],[[126630,126630],"mapped","ز"],[[126631,126631],"mapped","ح"],[[126632,126632],"mapped","ط"],[[126633,126633],"mapped","ي"],[[126634,126634],"disallowed"],[[126635,126635],"mapped","ل"],[[126636,126636],"mapped","م"],[[126637,126637],"mapped","ن"],[[126638,126638],"mapped","س"],[[126639,126639],"mapped","ع"],[[126640,126640],"mapped","ف"],[[126641,126641],"mapped","ص"],[[126642,126642],"mapped","ق"],[[126643,126643],"mapped","ر"],[[126644,126644],"mapped","ش"],[[126645,126645],"mapped","ت"],[[126646,126646],"mapped","ث"],[[126647,126647],"mapped","خ"],[[126648,126648],"mapped","ذ"],[[126649,126649],"mapped","ض"],[[126650,126650],"mapped","ظ"],[[126651,126651],"mapped","غ"],[[126652,126703],"disallowed"],[[126704,126705],"valid","","NV8"],[[126706,126975],"disallowed"],[[126976,127019],"valid","","NV8"],[[127020,127023],"disallowed"],[[127024,127123],"valid","","NV8"],[[127124,127135],"disallowed"],[[127136,127150],"valid","","NV8"],[[127151,127152],"disallowed"],[[127153,127166],"valid","","NV8"],[[127167,127167],"valid","","NV8"],[[127168,127168],"disallowed"],[[127169,127183],"valid","","NV8"],[[127184,127184],"disallowed"],[[127185,127199],"valid","","NV8"],[[127200,127221],"valid","","NV8"],[[127222,127231],"disallowed"],[[127232,127232],"disallowed"],[[127233,127233],"disallowed_STD3_mapped","0,"],[[127234,127234],"disallowed_STD3_mapped","1,"],[[127235,127235],"disallowed_STD3_mapped","2,"],[[127236,127236],"disallowed_STD3_mapped","3,"],[[127237,127237],"disallowed_STD3_mapped","4,"],[[127238,127238],"disallowed_STD3_mapped","5,"],[[127239,127239],"disallowed_STD3_mapped","6,"],[[127240,127240],"disallowed_STD3_mapped","7,"],[[127241,127241],"disallowed_STD3_mapped","8,"],[[127242,127242],"disallowed_STD3_mapped","9,"],[[127243,127244],"valid","","NV8"],[[127245,127247],"disallowed"],[[127248,127248],"disallowed_STD3_mapped","(a)"],[[127249,127249],"disallowed_STD3_mapped","(b)"],[[127250,127250],"disallowed_STD3_mapped","(c)"],[[127251,127251],"disallowed_STD3_mapped","(d)"],[[127252,127252],"disallowed_STD3_mapped","(e)"],[[127253,127253],"disallowed_STD3_mapped","(f)"],[[127254,127254],"disallowed_STD3_mapped","(g)"],[[127255,127255],"disallowed_STD3_mapped","(h)"],[[127256,127256],"disallowed_STD3_mapped","(i)"],[[127257,127257],"disallowed_STD3_mapped","(j)"],[[127258,127258],"disallowed_STD3_mapped","(k)"],[[127259,127259],"disallowed_STD3_mapped","(l)"],[[127260,127260],"disallowed_STD3_mapped","(m)"],[[127261,127261],"disallowed_STD3_mapped","(n)"],[[127262,127262],"disallowed_STD3_mapped","(o)"],[[127263,127263],"disallowed_STD3_mapped","(p)"],[[127264,127264],"disallowed_STD3_mapped","(q)"],[[127265,127265],"disallowed_STD3_mapped","(r)"],[[127266,127266],"disallowed_STD3_mapped","(s)"],[[127267,127267],"disallowed_STD3_mapped","(t)"],[[127268,127268],"disallowed_STD3_mapped","(u)"],[[127269,127269],"disallowed_STD3_mapped","(v)"],[[127270,127270],"disallowed_STD3_mapped","(w)"],[[127271,127271],"disallowed_STD3_mapped","(x)"],[[127272,127272],"disallowed_STD3_mapped","(y)"],[[127273,127273],"disallowed_STD3_mapped","(z)"],[[127274,127274],"mapped","〔s〕"],[[127275,127275],"mapped","c"],[[127276,127276],"mapped","r"],[[127277,127277],"mapped","cd"],[[127278,127278],"mapped","wz"],[[127279,127279],"disallowed"],[[127280,127280],"mapped","a"],[[127281,127281],"mapped","b"],[[127282,127282],"mapped","c"],[[127283,127283],"mapped","d"],[[127284,127284],"mapped","e"],[[127285,127285],"mapped","f"],[[127286,127286],"mapped","g"],[[127287,127287],"mapped","h"],[[127288,127288],"mapped","i"],[[127289,127289],"mapped","j"],[[127290,127290],"mapped","k"],[[127291,127291],"mapped","l"],[[127292,127292],"mapped","m"],[[127293,127293],"mapped","n"],[[127294,127294],"mapped","o"],[[127295,127295],"mapped","p"],[[127296,127296],"mapped","q"],[[127297,127297],"mapped","r"],[[127298,127298],"mapped","s"],[[127299,127299],"mapped","t"],[[127300,127300],"mapped","u"],[[127301,127301],"mapped","v"],[[127302,127302],"mapped","w"],[[127303,127303],"mapped","x"],[[127304,127304],"mapped","y"],[[127305,127305],"mapped","z"],[[127306,127306],"mapped","hv"],[[127307,127307],"mapped","mv"],[[127308,127308],"mapped","sd"],[[127309,127309],"mapped","ss"],[[127310,127310],"mapped","ppv"],[[127311,127311],"mapped","wc"],[[127312,127318],"valid","","NV8"],[[127319,127319],"valid","","NV8"],[[127320,127326],"valid","","NV8"],[[127327,127327],"valid","","NV8"],[[127328,127337],"valid","","NV8"],[[127338,127338],"mapped","mc"],[[127339,127339],"mapped","md"],[[127340,127343],"disallowed"],[[127344,127352],"valid","","NV8"],[[127353,127353],"valid","","NV8"],[[127354,127354],"valid","","NV8"],[[127355,127356],"valid","","NV8"],[[127357,127358],"valid","","NV8"],[[127359,127359],"valid","","NV8"],[[127360,127369],"valid","","NV8"],[[127370,127373],"valid","","NV8"],[[127374,127375],"valid","","NV8"],[[127376,127376],"mapped","dj"],[[127377,127386],"valid","","NV8"],[[127387,127404],"valid","","NV8"],[[127405,127461],"disallowed"],[[127462,127487],"valid","","NV8"],[[127488,127488],"mapped","ほか"],[[127489,127489],"mapped","ココ"],[[127490,127490],"mapped","サ"],[[127491,127503],"disallowed"],[[127504,127504],"mapped","手"],[[127505,127505],"mapped","字"],[[127506,127506],"mapped","双"],[[127507,127507],"mapped","デ"],[[127508,127508],"mapped","二"],[[127509,127509],"mapped","多"],[[127510,127510],"mapped","解"],[[127511,127511],"mapped","天"],[[127512,127512],"mapped","交"],[[127513,127513],"mapped","映"],[[127514,127514],"mapped","無"],[[127515,127515],"mapped","料"],[[127516,127516],"mapped","前"],[[127517,127517],"mapped","後"],[[127518,127518],"mapped","再"],[[127519,127519],"mapped","新"],[[127520,127520],"mapped","初"],[[127521,127521],"mapped","終"],[[127522,127522],"mapped","生"],[[127523,127523],"mapped","販"],[[127524,127524],"mapped","声"],[[127525,127525],"mapped","吹"],[[127526,127526],"mapped","演"],[[127527,127527],"mapped","投"],[[127528,127528],"mapped","捕"],[[127529,127529],"mapped","一"],[[127530,127530],"mapped","三"],[[127531,127531],"mapped","遊"],[[127532,127532],"mapped","左"],[[127533,127533],"mapped","中"],[[127534,127534],"mapped","右"],[[127535,127535],"mapped","指"],[[127536,127536],"mapped","走"],[[127537,127537],"mapped","打"],[[127538,127538],"mapped","禁"],[[127539,127539],"mapped","空"],[[127540,127540],"mapped","合"],[[127541,127541],"mapped","満"],[[127542,127542],"mapped","有"],[[127543,127543],"mapped","月"],[[127544,127544],"mapped","申"],[[127545,127545],"mapped","割"],[[127546,127546],"mapped","営"],[[127547,127547],"mapped","配"],[[127548,127551],"disallowed"],[[127552,127552],"mapped","〔本〕"],[[127553,127553],"mapped","〔三〕"],[[127554,127554],"mapped","〔二〕"],[[127555,127555],"mapped","〔安〕"],[[127556,127556],"mapped","〔点〕"],[[127557,127557],"mapped","〔打〕"],[[127558,127558],"mapped","〔盗〕"],[[127559,127559],"mapped","〔勝〕"],[[127560,127560],"mapped","〔敗〕"],[[127561,127567],"disallowed"],[[127568,127568],"mapped","得"],[[127569,127569],"mapped","可"],[[127570,127583],"disallowed"],[[127584,127589],"valid","","NV8"],[[127590,127743],"disallowed"],[[127744,127776],"valid","","NV8"],[[127777,127788],"valid","","NV8"],[[127789,127791],"valid","","NV8"],[[127792,127797],"valid","","NV8"],[[127798,127798],"valid","","NV8"],[[127799,127868],"valid","","NV8"],[[127869,127869],"valid","","NV8"],[[127870,127871],"valid","","NV8"],[[127872,127891],"valid","","NV8"],[[127892,127903],"valid","","NV8"],[[127904,127940],"valid","","NV8"],[[127941,127941],"valid","","NV8"],[[127942,127946],"valid","","NV8"],[[127947,127950],"valid","","NV8"],[[127951,127955],"valid","","NV8"],[[127956,127967],"valid","","NV8"],[[127968,127984],"valid","","NV8"],[[127985,127991],"valid","","NV8"],[[127992,127999],"valid","","NV8"],[[128000,128062],"valid","","NV8"],[[128063,128063],"valid","","NV8"],[[128064,128064],"valid","","NV8"],[[128065,128065],"valid","","NV8"],[[128066,128247],"valid","","NV8"],[[128248,128248],"valid","","NV8"],[[128249,128252],"valid","","NV8"],[[128253,128254],"valid","","NV8"],[[128255,128255],"valid","","NV8"],[[128256,128317],"valid","","NV8"],[[128318,128319],"valid","","NV8"],[[128320,128323],"valid","","NV8"],[[128324,128330],"valid","","NV8"],[[128331,128335],"valid","","NV8"],[[128336,128359],"valid","","NV8"],[[128360,128377],"valid","","NV8"],[[128378,128378],"valid","","NV8"],[[128379,128419],"valid","","NV8"],[[128420,128420],"valid","","NV8"],[[128421,128506],"valid","","NV8"],[[128507,128511],"valid","","NV8"],[[128512,128512],"valid","","NV8"],[[128513,128528],"valid","","NV8"],[[128529,128529],"valid","","NV8"],[[128530,128532],"valid","","NV8"],[[128533,128533],"valid","","NV8"],[[128534,128534],"valid","","NV8"],[[128535,128535],"valid","","NV8"],[[128536,128536],"valid","","NV8"],[[128537,128537],"valid","","NV8"],[[128538,128538],"valid","","NV8"],[[128539,128539],"valid","","NV8"],[[128540,128542],"valid","","NV8"],[[128543,128543],"valid","","NV8"],[[128544,128549],"valid","","NV8"],[[128550,128551],"valid","","NV8"],[[128552,128555],"valid","","NV8"],[[128556,128556],"valid","","NV8"],[[128557,128557],"valid","","NV8"],[[128558,128559],"valid","","NV8"],[[128560,128563],"valid","","NV8"],[[128564,128564],"valid","","NV8"],[[128565,128576],"valid","","NV8"],[[128577,128578],"valid","","NV8"],[[128579,128580],"valid","","NV8"],[[128581,128591],"valid","","NV8"],[[128592,128639],"valid","","NV8"],[[128640,128709],"valid","","NV8"],[[128710,128719],"valid","","NV8"],[[128720,128720],"valid","","NV8"],[[128721,128722],"valid","","NV8"],[[128723,128724],"valid","","NV8"],[[128725,128735],"disallowed"],[[128736,128748],"valid","","NV8"],[[128749,128751],"disallowed"],[[128752,128755],"valid","","NV8"],[[128756,128758],"valid","","NV8"],[[128759,128760],"valid","","NV8"],[[128761,128767],"disallowed"],[[128768,128883],"valid","","NV8"],[[128884,128895],"disallowed"],[[128896,128980],"valid","","NV8"],[[128981,129023],"disallowed"],[[129024,129035],"valid","","NV8"],[[129036,129039],"disallowed"],[[129040,129095],"valid","","NV8"],[[129096,129103],"disallowed"],[[129104,129113],"valid","","NV8"],[[129114,129119],"disallowed"],[[129120,129159],"valid","","NV8"],[[129160,129167],"disallowed"],[[129168,129197],"valid","","NV8"],[[129198,129279],"disallowed"],[[129280,129291],"valid","","NV8"],[[129292,129295],"disallowed"],[[129296,129304],"valid","","NV8"],[[129305,129310],"valid","","NV8"],[[129311,129311],"valid","","NV8"],[[129312,129319],"valid","","NV8"],[[129320,129327],"valid","","NV8"],[[129328,129328],"valid","","NV8"],[[129329,129330],"valid","","NV8"],[[129331,129342],"valid","","NV8"],[[129343,129343],"disallowed"],[[129344,129355],"valid","","NV8"],[[129356,129356],"valid","","NV8"],[[129357,129359],"disallowed"],[[129360,129374],"valid","","NV8"],[[129375,129387],"valid","","NV8"],[[129388,129407],"disallowed"],[[129408,129412],"valid","","NV8"],[[129413,129425],"valid","","NV8"],[[129426,129431],"valid","","NV8"],[[129432,129471],"disallowed"],[[129472,129472],"valid","","NV8"],[[129473,129487],"disallowed"],[[129488,129510],"valid","","NV8"],[[129511,131069],"disallowed"],[[131070,131071],"disallowed"],[[131072,173782],"valid"],[[173783,173823],"disallowed"],[[173824,177972],"valid"],[[177973,177983],"disallowed"],[[177984,178205],"valid"],[[178206,178207],"disallowed"],[[178208,183969],"valid"],[[183970,183983],"disallowed"],[[183984,191456],"valid"],[[191457,194559],"disallowed"],[[194560,194560],"mapped","丽"],[[194561,194561],"mapped","丸"],[[194562,194562],"mapped","乁"],[[194563,194563],"mapped","𠄢"],[[194564,194564],"mapped","你"],[[194565,194565],"mapped","侮"],[[194566,194566],"mapped","侻"],[[194567,194567],"mapped","倂"],[[194568,194568],"mapped","偺"],[[194569,194569],"mapped","備"],[[194570,194570],"mapped","僧"],[[194571,194571],"mapped","像"],[[194572,194572],"mapped","㒞"],[[194573,194573],"mapped","𠘺"],[[194574,194574],"mapped","免"],[[194575,194575],"mapped","兔"],[[194576,194576],"mapped","兤"],[[194577,194577],"mapped","具"],[[194578,194578],"mapped","𠔜"],[[194579,194579],"mapped","㒹"],[[194580,194580],"mapped","內"],[[194581,194581],"mapped","再"],[[194582,194582],"mapped","𠕋"],[[194583,194583],"mapped","冗"],[[194584,194584],"mapped","冤"],[[194585,194585],"mapped","仌"],[[194586,194586],"mapped","冬"],[[194587,194587],"mapped","况"],[[194588,194588],"mapped","𩇟"],[[194589,194589],"mapped","凵"],[[194590,194590],"mapped","刃"],[[194591,194591],"mapped","㓟"],[[194592,194592],"mapped","刻"],[[194593,194593],"mapped","剆"],[[194594,194594],"mapped","割"],[[194595,194595],"mapped","剷"],[[194596,194596],"mapped","㔕"],[[194597,194597],"mapped","勇"],[[194598,194598],"mapped","勉"],[[194599,194599],"mapped","勤"],[[194600,194600],"mapped","勺"],[[194601,194601],"mapped","包"],[[194602,194602],"mapped","匆"],[[194603,194603],"mapped","北"],[[194604,194604],"mapped","卉"],[[194605,194605],"mapped","卑"],[[194606,194606],"mapped","博"],[[194607,194607],"mapped","即"],[[194608,194608],"mapped","卽"],[[194609,194611],"mapped","卿"],[[194612,194612],"mapped","𠨬"],[[194613,194613],"mapped","灰"],[[194614,194614],"mapped","及"],[[194615,194615],"mapped","叟"],[[194616,194616],"mapped","𠭣"],[[194617,194617],"mapped","叫"],[[194618,194618],"mapped","叱"],[[194619,194619],"mapped","吆"],[[194620,194620],"mapped","咞"],[[194621,194621],"mapped","吸"],[[194622,194622],"mapped","呈"],[[194623,194623],"mapped","周"],[[194624,194624],"mapped","咢"],[[194625,194625],"mapped","哶"],[[194626,194626],"mapped","唐"],[[194627,194627],"mapped","啓"],[[194628,194628],"mapped","啣"],[[194629,194630],"mapped","善"],[[194631,194631],"mapped","喙"],[[194632,194632],"mapped","喫"],[[194633,194633],"mapped","喳"],[[194634,194634],"mapped","嗂"],[[194635,194635],"mapped","圖"],[[194636,194636],"mapped","嘆"],[[194637,194637],"mapped","圗"],[[194638,194638],"mapped","噑"],[[194639,194639],"mapped","噴"],[[194640,194640],"mapped","切"],[[194641,194641],"mapped","壮"],[[194642,194642],"mapped","城"],[[194643,194643],"mapped","埴"],[[194644,194644],"mapped","堍"],[[194645,194645],"mapped","型"],[[194646,194646],"mapped","堲"],[[194647,194647],"mapped","報"],[[194648,194648],"mapped","墬"],[[194649,194649],"mapped","𡓤"],[[194650,194650],"mapped","売"],[[194651,194651],"mapped","壷"],[[194652,194652],"mapped","夆"],[[194653,194653],"mapped","多"],[[194654,194654],"mapped","夢"],[[194655,194655],"mapped","奢"],[[194656,194656],"mapped","𡚨"],[[194657,194657],"mapped","𡛪"],[[194658,194658],"mapped","姬"],[[194659,194659],"mapped","娛"],[[194660,194660],"mapped","娧"],[[194661,194661],"mapped","姘"],[[194662,194662],"mapped","婦"],[[194663,194663],"mapped","㛮"],[[194664,194664],"disallowed"],[[194665,194665],"mapped","嬈"],[[194666,194667],"mapped","嬾"],[[194668,194668],"mapped","𡧈"],[[194669,194669],"mapped","寃"],[[194670,194670],"mapped","寘"],[[194671,194671],"mapped","寧"],[[194672,194672],"mapped","寳"],[[194673,194673],"mapped","𡬘"],[[194674,194674],"mapped","寿"],[[194675,194675],"mapped","将"],[[194676,194676],"disallowed"],[[194677,194677],"mapped","尢"],[[194678,194678],"mapped","㞁"],[[194679,194679],"mapped","屠"],[[194680,194680],"mapped","屮"],[[194681,194681],"mapped","峀"],[[194682,194682],"mapped","岍"],[[194683,194683],"mapped","𡷤"],[[194684,194684],"mapped","嵃"],[[194685,194685],"mapped","𡷦"],[[194686,194686],"mapped","嵮"],[[194687,194687],"mapped","嵫"],[[194688,194688],"mapped","嵼"],[[194689,194689],"mapped","巡"],[[194690,194690],"mapped","巢"],[[194691,194691],"mapped","㠯"],[[194692,194692],"mapped","巽"],[[194693,194693],"mapped","帨"],[[194694,194694],"mapped","帽"],[[194695,194695],"mapped","幩"],[[194696,194696],"mapped","㡢"],[[194697,194697],"mapped","𢆃"],[[194698,194698],"mapped","㡼"],[[194699,194699],"mapped","庰"],[[194700,194700],"mapped","庳"],[[194701,194701],"mapped","庶"],[[194702,194702],"mapped","廊"],[[194703,194703],"mapped","𪎒"],[[194704,194704],"mapped","廾"],[[194705,194706],"mapped","𢌱"],[[194707,194707],"mapped","舁"],[[194708,194709],"mapped","弢"],[[194710,194710],"mapped","㣇"],[[194711,194711],"mapped","𣊸"],[[194712,194712],"mapped","𦇚"],[[194713,194713],"mapped","形"],[[194714,194714],"mapped","彫"],[[194715,194715],"mapped","㣣"],[[194716,194716],"mapped","徚"],[[194717,194717],"mapped","忍"],[[194718,194718],"mapped","志"],[[194719,194719],"mapped","忹"],[[194720,194720],"mapped","悁"],[[194721,194721],"mapped","㤺"],[[194722,194722],"mapped","㤜"],[[194723,194723],"mapped","悔"],[[194724,194724],"mapped","𢛔"],[[194725,194725],"mapped","惇"],[[194726,194726],"mapped","慈"],[[194727,194727],"mapped","慌"],[[194728,194728],"mapped","慎"],[[194729,194729],"mapped","慌"],[[194730,194730],"mapped","慺"],[[194731,194731],"mapped","憎"],[[194732,194732],"mapped","憲"],[[194733,194733],"mapped","憤"],[[194734,194734],"mapped","憯"],[[194735,194735],"mapped","懞"],[[194736,194736],"mapped","懲"],[[194737,194737],"mapped","懶"],[[194738,194738],"mapped","成"],[[194739,194739],"mapped","戛"],[[194740,194740],"mapped","扝"],[[194741,194741],"mapped","抱"],[[194742,194742],"mapped","拔"],[[194743,194743],"mapped","捐"],[[194744,194744],"mapped","𢬌"],[[194745,194745],"mapped","挽"],[[194746,194746],"mapped","拼"],[[194747,194747],"mapped","捨"],[[194748,194748],"mapped","掃"],[[194749,194749],"mapped","揤"],[[194750,194750],"mapped","𢯱"],[[194751,194751],"mapped","搢"],[[194752,194752],"mapped","揅"],[[194753,194753],"mapped","掩"],[[194754,194754],"mapped","㨮"],[[194755,194755],"mapped","摩"],[[194756,194756],"mapped","摾"],[[194757,194757],"mapped","撝"],[[194758,194758],"mapped","摷"],[[194759,194759],"mapped","㩬"],[[194760,194760],"mapped","敏"],[[194761,194761],"mapped","敬"],[[194762,194762],"mapped","𣀊"],[[194763,194763],"mapped","旣"],[[194764,194764],"mapped","書"],[[194765,194765],"mapped","晉"],[[194766,194766],"mapped","㬙"],[[194767,194767],"mapped","暑"],[[194768,194768],"mapped","㬈"],[[194769,194769],"mapped","㫤"],[[194770,194770],"mapped","冒"],[[194771,194771],"mapped","冕"],[[194772,194772],"mapped","最"],[[194773,194773],"mapped","暜"],[[194774,194774],"mapped","肭"],[[194775,194775],"mapped","䏙"],[[194776,194776],"mapped","朗"],[[194777,194777],"mapped","望"],[[194778,194778],"mapped","朡"],[[194779,194779],"mapped","杞"],[[194780,194780],"mapped","杓"],[[194781,194781],"mapped","𣏃"],[[194782,194782],"mapped","㭉"],[[194783,194783],"mapped","柺"],[[194784,194784],"mapped","枅"],[[194785,194785],"mapped","桒"],[[194786,194786],"mapped","梅"],[[194787,194787],"mapped","𣑭"],[[194788,194788],"mapped","梎"],[[194789,194789],"mapped","栟"],[[194790,194790],"mapped","椔"],[[194791,194791],"mapped","㮝"],[[194792,194792],"mapped","楂"],[[194793,194793],"mapped","榣"],[[194794,194794],"mapped","槪"],[[194795,194795],"mapped","檨"],[[194796,194796],"mapped","𣚣"],[[194797,194797],"mapped","櫛"],[[194798,194798],"mapped","㰘"],[[194799,194799],"mapped","次"],[[194800,194800],"mapped","𣢧"],[[194801,194801],"mapped","歔"],[[194802,194802],"mapped","㱎"],[[194803,194803],"mapped","歲"],[[194804,194804],"mapped","殟"],[[194805,194805],"mapped","殺"],[[194806,194806],"mapped","殻"],[[194807,194807],"mapped","𣪍"],[[194808,194808],"mapped","𡴋"],[[194809,194809],"mapped","𣫺"],[[194810,194810],"mapped","汎"],[[194811,194811],"mapped","𣲼"],[[194812,194812],"mapped","沿"],[[194813,194813],"mapped","泍"],[[194814,194814],"mapped","汧"],[[194815,194815],"mapped","洖"],[[194816,194816],"mapped","派"],[[194817,194817],"mapped","海"],[[194818,194818],"mapped","流"],[[194819,194819],"mapped","浩"],[[194820,194820],"mapped","浸"],[[194821,194821],"mapped","涅"],[[194822,194822],"mapped","𣴞"],[[194823,194823],"mapped","洴"],[[194824,194824],"mapped","港"],[[194825,194825],"mapped","湮"],[[194826,194826],"mapped","㴳"],[[194827,194827],"mapped","滋"],[[194828,194828],"mapped","滇"],[[194829,194829],"mapped","𣻑"],[[194830,194830],"mapped","淹"],[[194831,194831],"mapped","潮"],[[194832,194832],"mapped","𣽞"],[[194833,194833],"mapped","𣾎"],[[194834,194834],"mapped","濆"],[[194835,194835],"mapped","瀹"],[[194836,194836],"mapped","瀞"],[[194837,194837],"mapped","瀛"],[[194838,194838],"mapped","㶖"],[[194839,194839],"mapped","灊"],[[194840,194840],"mapped","災"],[[194841,194841],"mapped","灷"],[[194842,194842],"mapped","炭"],[[194843,194843],"mapped","𠔥"],[[194844,194844],"mapped","煅"],[[194845,194845],"mapped","𤉣"],[[194846,194846],"mapped","熜"],[[194847,194847],"disallowed"],[[194848,194848],"mapped","爨"],[[194849,194849],"mapped","爵"],[[194850,194850],"mapped","牐"],[[194851,194851],"mapped","𤘈"],[[194852,194852],"mapped","犀"],[[194853,194853],"mapped","犕"],[[194854,194854],"mapped","𤜵"],[[194855,194855],"mapped","𤠔"],[[194856,194856],"mapped","獺"],[[194857,194857],"mapped","王"],[[194858,194858],"mapped","㺬"],[[194859,194859],"mapped","玥"],[[194860,194861],"mapped","㺸"],[[194862,194862],"mapped","瑇"],[[194863,194863],"mapped","瑜"],[[194864,194864],"mapped","瑱"],[[194865,194865],"mapped","璅"],[[194866,194866],"mapped","瓊"],[[194867,194867],"mapped","㼛"],[[194868,194868],"mapped","甤"],[[194869,194869],"mapped","𤰶"],[[194870,194870],"mapped","甾"],[[194871,194871],"mapped","𤲒"],[[194872,194872],"mapped","異"],[[194873,194873],"mapped","𢆟"],[[194874,194874],"mapped","瘐"],[[194875,194875],"mapped","𤾡"],[[194876,194876],"mapped","𤾸"],[[194877,194877],"mapped","𥁄"],[[194878,194878],"mapped","㿼"],[[194879,194879],"mapped","䀈"],[[194880,194880],"mapped","直"],[[194881,194881],"mapped","𥃳"],[[194882,194882],"mapped","𥃲"],[[194883,194883],"mapped","𥄙"],[[194884,194884],"mapped","𥄳"],[[194885,194885],"mapped","眞"],[[194886,194887],"mapped","真"],[[194888,194888],"mapped","睊"],[[194889,194889],"mapped","䀹"],[[194890,194890],"mapped","瞋"],[[194891,194891],"mapped","䁆"],[[194892,194892],"mapped","䂖"],[[194893,194893],"mapped","𥐝"],[[194894,194894],"mapped","硎"],[[194895,194895],"mapped","碌"],[[194896,194896],"mapped","磌"],[[194897,194897],"mapped","䃣"],[[194898,194898],"mapped","𥘦"],[[194899,194899],"mapped","祖"],[[194900,194900],"mapped","𥚚"],[[194901,194901],"mapped","𥛅"],[[194902,194902],"mapped","福"],[[194903,194903],"mapped","秫"],[[194904,194904],"mapped","䄯"],[[194905,194905],"mapped","穀"],[[194906,194906],"mapped","穊"],[[194907,194907],"mapped","穏"],[[194908,194908],"mapped","𥥼"],[[194909,194910],"mapped","𥪧"],[[194911,194911],"disallowed"],[[194912,194912],"mapped","䈂"],[[194913,194913],"mapped","𥮫"],[[194914,194914],"mapped","篆"],[[194915,194915],"mapped","築"],[[194916,194916],"mapped","䈧"],[[194917,194917],"mapped","𥲀"],[[194918,194918],"mapped","糒"],[[194919,194919],"mapped","䊠"],[[194920,194920],"mapped","糨"],[[194921,194921],"mapped","糣"],[[194922,194922],"mapped","紀"],[[194923,194923],"mapped","𥾆"],[[194924,194924],"mapped","絣"],[[194925,194925],"mapped","䌁"],[[194926,194926],"mapped","緇"],[[194927,194927],"mapped","縂"],[[194928,194928],"mapped","繅"],[[194929,194929],"mapped","䌴"],[[194930,194930],"mapped","𦈨"],[[194931,194931],"mapped","𦉇"],[[194932,194932],"mapped","䍙"],[[194933,194933],"mapped","𦋙"],[[194934,194934],"mapped","罺"],[[194935,194935],"mapped","𦌾"],[[194936,194936],"mapped","羕"],[[194937,194937],"mapped","翺"],[[194938,194938],"mapped","者"],[[194939,194939],"mapped","𦓚"],[[194940,194940],"mapped","𦔣"],[[194941,194941],"mapped","聠"],[[194942,194942],"mapped","𦖨"],[[194943,194943],"mapped","聰"],[[194944,194944],"mapped","𣍟"],[[194945,194945],"mapped","䏕"],[[194946,194946],"mapped","育"],[[194947,194947],"mapped","脃"],[[194948,194948],"mapped","䐋"],[[194949,194949],"mapped","脾"],[[194950,194950],"mapped","媵"],[[194951,194951],"mapped","𦞧"],[[194952,194952],"mapped","𦞵"],[[194953,194953],"mapped","𣎓"],[[194954,194954],"mapped","𣎜"],[[194955,194955],"mapped","舁"],[[194956,194956],"mapped","舄"],[[194957,194957],"mapped","辞"],[[194958,194958],"mapped","䑫"],[[194959,194959],"mapped","芑"],[[194960,194960],"mapped","芋"],[[194961,194961],"mapped","芝"],[[194962,194962],"mapped","劳"],[[194963,194963],"mapped","花"],[[194964,194964],"mapped","芳"],[[194965,194965],"mapped","芽"],[[194966,194966],"mapped","苦"],[[194967,194967],"mapped","𦬼"],[[194968,194968],"mapped","若"],[[194969,194969],"mapped","茝"],[[194970,194970],"mapped","荣"],[[194971,194971],"mapped","莭"],[[194972,194972],"mapped","茣"],[[194973,194973],"mapped","莽"],[[194974,194974],"mapped","菧"],[[194975,194975],"mapped","著"],[[194976,194976],"mapped","荓"],[[194977,194977],"mapped","菊"],[[194978,194978],"mapped","菌"],[[194979,194979],"mapped","菜"],[[194980,194980],"mapped","𦰶"],[[194981,194981],"mapped","𦵫"],[[194982,194982],"mapped","𦳕"],[[194983,194983],"mapped","䔫"],[[194984,194984],"mapped","蓱"],[[194985,194985],"mapped","蓳"],[[194986,194986],"mapped","蔖"],[[194987,194987],"mapped","𧏊"],[[194988,194988],"mapped","蕤"],[[194989,194989],"mapped","𦼬"],[[194990,194990],"mapped","䕝"],[[194991,194991],"mapped","䕡"],[[194992,194992],"mapped","𦾱"],[[194993,194993],"mapped","𧃒"],[[194994,194994],"mapped","䕫"],[[194995,194995],"mapped","虐"],[[194996,194996],"mapped","虜"],[[194997,194997],"mapped","虧"],[[194998,194998],"mapped","虩"],[[194999,194999],"mapped","蚩"],[[195000,195000],"mapped","蚈"],[[195001,195001],"mapped","蜎"],[[195002,195002],"mapped","蛢"],[[195003,195003],"mapped","蝹"],[[195004,195004],"mapped","蜨"],[[195005,195005],"mapped","蝫"],[[195006,195006],"mapped","螆"],[[195007,195007],"disallowed"],[[195008,195008],"mapped","蟡"],[[195009,195009],"mapped","蠁"],[[195010,195010],"mapped","䗹"],[[195011,195011],"mapped","衠"],[[195012,195012],"mapped","衣"],[[195013,195013],"mapped","𧙧"],[[195014,195014],"mapped","裗"],[[195015,195015],"mapped","裞"],[[195016,195016],"mapped","䘵"],[[195017,195017],"mapped","裺"],[[195018,195018],"mapped","㒻"],[[195019,195019],"mapped","𧢮"],[[195020,195020],"mapped","𧥦"],[[195021,195021],"mapped","䚾"],[[195022,195022],"mapped","䛇"],[[195023,195023],"mapped","誠"],[[195024,195024],"mapped","諭"],[[195025,195025],"mapped","變"],[[195026,195026],"mapped","豕"],[[195027,195027],"mapped","𧲨"],[[195028,195028],"mapped","貫"],[[195029,195029],"mapped","賁"],[[195030,195030],"mapped","贛"],[[195031,195031],"mapped","起"],[[195032,195032],"mapped","𧼯"],[[195033,195033],"mapped","𠠄"],[[195034,195034],"mapped","跋"],[[195035,195035],"mapped","趼"],[[195036,195036],"mapped","跰"],[[195037,195037],"mapped","𠣞"],[[195038,195038],"mapped","軔"],[[195039,195039],"mapped","輸"],[[195040,195040],"mapped","𨗒"],[[195041,195041],"mapped","𨗭"],[[195042,195042],"mapped","邔"],[[195043,195043],"mapped","郱"],[[195044,195044],"mapped","鄑"],[[195045,195045],"mapped","𨜮"],[[195046,195046],"mapped","鄛"],[[195047,195047],"mapped","鈸"],[[195048,195048],"mapped","鋗"],[[195049,195049],"mapped","鋘"],[[195050,195050],"mapped","鉼"],[[195051,195051],"mapped","鏹"],[[195052,195052],"mapped","鐕"],[[195053,195053],"mapped","𨯺"],[[195054,195054],"mapped","開"],[[195055,195055],"mapped","䦕"],[[195056,195056],"mapped","閷"],[[195057,195057],"mapped","𨵷"],[[195058,195058],"mapped","䧦"],[[195059,195059],"mapped","雃"],[[195060,195060],"mapped","嶲"],[[195061,195061],"mapped","霣"],[[195062,195062],"mapped","𩅅"],[[195063,195063],"mapped","𩈚"],[[195064,195064],"mapped","䩮"],[[195065,195065],"mapped","䩶"],[[195066,195066],"mapped","韠"],[[195067,195067],"mapped","𩐊"],[[195068,195068],"mapped","䪲"],[[195069,195069],"mapped","𩒖"],[[195070,195071],"mapped","頋"],[[195072,195072],"mapped","頩"],[[195073,195073],"mapped","𩖶"],[[195074,195074],"mapped","飢"],[[195075,195075],"mapped","䬳"],[[195076,195076],"mapped","餩"],[[195077,195077],"mapped","馧"],[[195078,195078],"mapped","駂"],[[195079,195079],"mapped","駾"],[[195080,195080],"mapped","䯎"],[[195081,195081],"mapped","𩬰"],[[195082,195082],"mapped","鬒"],[[195083,195083],"mapped","鱀"],[[195084,195084],"mapped","鳽"],[[195085,195085],"mapped","䳎"],[[195086,195086],"mapped","䳭"],[[195087,195087],"mapped","鵧"],[[195088,195088],"mapped","𪃎"],[[195089,195089],"mapped","䳸"],[[195090,195090],"mapped","𪄅"],[[195091,195091],"mapped","𪈎"],[[195092,195092],"mapped","𪊑"],[[195093,195093],"mapped","麻"],[[195094,195094],"mapped","䵖"],[[195095,195095],"mapped","黹"],[[195096,195096],"mapped","黾"],[[195097,195097],"mapped","鼅"],[[195098,195098],"mapped","鼏"],[[195099,195099],"mapped","鼖"],[[195100,195100],"mapped","鼻"],[[195101,195101],"mapped","𪘀"],[[195102,196605],"disallowed"],[[196606,196607],"disallowed"],[[196608,262141],"disallowed"],[[262142,262143],"disallowed"],[[262144,327677],"disallowed"],[[327678,327679],"disallowed"],[[327680,393213],"disallowed"],[[393214,393215],"disallowed"],[[393216,458749],"disallowed"],[[458750,458751],"disallowed"],[[458752,524285],"disallowed"],[[524286,524287],"disallowed"],[[524288,589821],"disallowed"],[[589822,589823],"disallowed"],[[589824,655357],"disallowed"],[[655358,655359],"disallowed"],[[655360,720893],"disallowed"],[[720894,720895],"disallowed"],[[720896,786429],"disallowed"],[[786430,786431],"disallowed"],[[786432,851965],"disallowed"],[[851966,851967],"disallowed"],[[851968,917501],"disallowed"],[[917502,917503],"disallowed"],[[917504,917504],"disallowed"],[[917505,917505],"disallowed"],[[917506,917535],"disallowed"],[[917536,917631],"disallowed"],[[917632,917759],"disallowed"],[[917760,917999],"ignored"],[[918000,983037],"disallowed"],[[983038,983039],"disallowed"],[[983040,1048573],"disallowed"],[[1048574,1048575],"disallowed"],[[1048576,1114109],"disallowed"],[[1114110,1114111],"disallowed"]]');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./test/browser-index.js ***!
  \*******************************/
/**
 * Entry Point for WebPack to build test series to be run in browser
 */
//mocha.setup({ ignoreLeaks: true });

__webpack_require__(/*! ./utils.test.js */ "./test/utils.test.js");
__webpack_require__(/*! ./Connection.test.js */ "./test/Connection.test.js");
__webpack_require__(/*! ./Service.test.js */ "./test/Service.test.js");
__webpack_require__(/*! ./ServiceAssets.test.js */ "./test/ServiceAssets.test.js");
__webpack_require__(/*! ./Browser.test.js */ "./test/Browser.test.js");
__webpack_require__(/*! ./Browser.AuthController.test.js */ "./test/Browser.AuthController.test.js");
})();

browserTest = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=browser-tests.js.map