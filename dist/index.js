(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.syncQueryHOC = exports.SyncQueryFactory = void 0;
const util_1 = __webpack_require__(1);
const deepEqual_1 = __webpack_require__(2);
function SyncQueryFactory(stateList, config) {
    return function (WrappedComponent) {
        return syncQueryHOC(WrappedComponent, stateList, config);
    };
}
exports.SyncQueryFactory = SyncQueryFactory;
function syncQueryHOC(WrappedComponent, stateList, config) {
    if (!util_1.isObject(config)) {
        config = {
            wait: 300,
        };
    }
    else {
        config = Object.assign({ wait: 300 }, config);
    }
    return class Enhancer extends WrappedComponent {
        constructor(props) {
            super(props);
            this.prevStateCache = {};
            this.state = Object.assign(Object.assign({}, this.state), this.getStateFromURL(stateList));
            this.prevStateCache = this.state;
            if (config.disableAutoSync === true) {
                this.triggerSync = () => {
                    this.stateDiffEffect(this.state);
                };
            }
            this.stateDiffEffect = util_1.debounce(this.stateDiffEffect, config.wait).bind(this);
        }
        getStateFromURL(stateList) {
            const query = location.href.split('?')[1];
            if (query == null) {
                return;
            }
            return util_1.queryToState(query, stateList, config.parser);
        }
        syncStateToURL(state) {
            const [locationAddress, oldQuery] = location.href.split('?');
            const restQuery = util_1.filterQuery(oldQuery, (key, value) => (stateList.indexOf(key) === -1));
            const query = util_1.stateToQuery(state, config.stringify);
            const href = `${locationAddress}?${query}&${restQuery}`;
            location.href = href;
        }
        componentDidUpdate(prevProps, prevState) {
            if (config.disableAutoSync !== true) {
                this.stateDiffEffect(this.state);
            }
            return (super.componentDidUpdate &&
                super.componentDidUpdate(prevProps, prevState));
        }
        stateDiffEffect(state) {
            const prevState = this.prevStateCache;
            const pickedPrevState = util_1.pick(prevState, stateList);
            const pickedState = util_1.pick(state, stateList);
            const isDiff = !deepEqual_1.deepEqual(pickedPrevState, pickedState);
            if (isDiff) {
                this.syncStateToURL(pickedState);
            }
            this.prevStateCache = state;
        }
    };
}
exports.syncQueryHOC = syncQueryHOC;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.stateToQuery = exports.queryToState = exports.parseParam = exports.filterQuery = exports.encodeQuery = exports.parseQuery = exports.formatQuery = exports.formatUrl = exports.debounce = exports.map = exports.filterExist = exports.filter = exports.pick = exports.isFunction = exports.isString = exports.isArray = exports.isObject = void 0;
function isObject(value) {
    return (Object.prototype.toString.call(value)) == "[object Object]";
}
exports.isObject = isObject;
function isArray(value) {
    return Object.prototype.toString.call(value) == "[object Array]";
}
exports.isArray = isArray;
function isString(value) {
    return Object.prototype.toString.call(value) == "[object String]";
}
exports.isString = isString;
function isFunction(value) {
    return Object.prototype.toString.call(value) == "[object Function]";
}
exports.isFunction = isFunction;
function pick(object, keys) {
    return filter(object, function (acc, cur, obj) {
        return keys.indexOf(cur) != -1;
    });
}
exports.pick = pick;
function filter(obj, handler) {
    if (!isObject(obj)) {
        console.error(`Param ${obj} is not a object`);
        return {};
    }
    return Object.keys(obj).reduce((acc, cur) => {
        if (typeof handler != 'function') {
            handler = notNull;
        }
        if (handler(acc, cur, obj)) {
            return Object.assign(Object.assign({}, acc), { [cur]: obj[cur] });
        }
        else {
            return acc;
        }
    }, {});
}
exports.filter = filter;
function notNull(tarket, key, obj) {
    return obj[key] != null;
}
function exist(tarket, key, obj) {
    return obj[key] != null;
}
function filterExist(obj) {
    return filter(obj, exist);
}
exports.filterExist = filterExist;
function map(obj, func) {
    if (!isObject(obj)) {
        console.error(`Param ${obj} is not a object`);
        return {};
    }
    return Object.keys(obj).reduce((acc, key) => {
        acc[key] = func(obj[key], key);
        return acc;
    }, {});
}
exports.map = map;
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}
exports.debounce = debounce;
function formatUrl(url, query) {
    let protocol;
    const index = url.indexOf('://');
    if (index !== -1) {
        protocol = url.substring(0, index);
        url = url.substring(index + 3);
    }
    else if (url.startsWith('//')) {
        url = url.substring(2);
    }
    let parts = url.split('/');
    let result = (protocol ? protocol + '://' : '//') + parts.shift();
    let path = parts.filter(Boolean).join('/');
    let hash;
    parts = path.split('#');
    if (parts.length === 2) {
        [path, hash] = parts;
    }
    result += path ? '/' + path : '';
    if (query && JSON.stringify(query) !== '{}') {
        result += (url.split('?').length === 2 ? '&' : '?') + formatQuery(query);
    }
    result += hash ? '#' + hash : '';
    return result;
}
exports.formatUrl = formatUrl;
function formatQuery(query) {
    return Object.keys(query).sort().map((key) => {
        const val = query[key];
        if (val == null) {
            return '';
        }
        if (Array.isArray(val)) {
            return val.slice().map(val2 => [key, '=', val2].join('')).join('&');
        }
        return key + '=' + val;
    }).filter(Boolean).join('&');
}
exports.formatQuery = formatQuery;
exports.parseQuery = (queryString, handler = decodeURIComponent) => {
    const query = {};
    const pairs = queryString.split('&');
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        query[handler(pair[0])] = handler(pair[1] || '');
    }
    return query;
};
const entries = (obj) => {
    var ownProps = Object.keys(obj), i = ownProps.length, resArray = new Array(i); // preallocate the Array
    while (i--)
        resArray[i] = [ownProps[i], obj[ownProps[i]]];
    return resArray;
};
exports.encodeQuery = (queryObject, handler = encodeURIComponent) => {
    return entries(queryObject)
        .filter(([key, value]) => typeof value !== 'undefined')
        .map(([key, value]) => handler(key) + (value != null ? '=' + handler(value) : ''))
        .join('&');
};
exports.filterQuery = (queryString, handler) => {
    if (!isString(queryString)) {
        return '';
    }
    if (queryString.length === 0) {
        return '';
    }
    return queryString
        .split('&')
        .reduce((acc, cur) => {
        const [key, value] = cur.split('=');
        if (handler(key, value)) {
            acc.push(cur);
        }
        return acc;
    }, [])
        .join('&');
};
function parseParam(value) {
    let parsed;
    try {
        parsed = JSON.parse(value);
    }
    catch (error) {
        console.error(`parseParam error: ${value} can't be JSON.parse. Error: ${error}. Type: ${typeof value}. `);
    }
    return parsed;
}
exports.parseParam = parseParam;
function queryToState(query, stateList, parser) {
    if (!isString(query) || query.length === 0) {
        return {};
    }
    const origin = exports.parseQuery(query);
    return Object.keys(origin)
        .filter((value) => (stateList == null ? true : stateList.indexOf(value)) > -1)
        .reduce((obj, key) => {
        const parseParamFunc = isObject(parser) && isFunction(parser[key]) && parser[key] || parseParam;
        const parsedVal = parseParamFunc(origin[key]);
        parsedVal != null && (obj[key] = parsedVal);
        return obj;
    }, {});
}
exports.queryToState = queryToState;
function stringifyParam(value) {
    return JSON.stringify(value);
}
function stateToQuery(state, stringify) {
    if (!isObject(state)) {
        return '';
    }
    const filterState = filterExist(state);
    const query = exports.encodeQuery(map(filterState, (value, key) => {
        const stringifyParamFunc = isObject(stringify) && isFunction(stringify[key]) && stringify[key] || stringifyParam;
        return stringifyParamFunc(value);
    }));
    return query;
}
exports.stateToQuery = stateToQuery;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.deepEqual = void 0;
// Ref: https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
function deepEqual(...rest) {
    var i, l, leftChain, rightChain;
    function compare2Objects(x, y) {
        var p;
        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }
        // Compare primitives and functions.     
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }
        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }
        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }
        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }
        if (x.constructor !== y.constructor) {
            return false;
        }
        if (x.prototype !== y.prototype) {
            return false;
        }
        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }
        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }
        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
            switch (typeof (x[p])) {
                case 'object':
                case 'function':
                    leftChain.push(x);
                    rightChain.push(y);
                    if (!compare2Objects(x[p], y[p])) {
                        return false;
                    }
                    leftChain.pop();
                    rightChain.pop();
                    break;
                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }
        return true;
    }
    if (rest.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more rest to compare";
    }
    for (i = 1, l = rest.length; i < l; i++) {
        leftChain = []; //Todo: this can be cached
        rightChain = [];
        if (!compare2Objects(rest[0], rest[i])) {
            return false;
        }
    }
    return true;
}
exports.deepEqual = deepEqual;


/***/ })
/******/ ]);
});
//# sourceMappingURL=index.js.map