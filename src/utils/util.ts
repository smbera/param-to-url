export function isObject(value) {
    return (Object.prototype.toString.call(value)) == "[object Object]";
}

export function isArray(value) {
    return Object.prototype.toString.call(value) == "[object Array]";
}

export function isString(value) {
    return Object.prototype.toString.call(value) == "[object String]";
}

export function isFunction(value) {
    return Object.prototype.toString.call(value) == "[object Function]";
}

export function pick(object, keys: string[]) {
    return filter(object, function (acc, cur, obj) {
        return keys.indexOf(cur) != -1;
    });
}

export function filter(obj, handler?) {
    if (!isObject(obj)) {
        console.error(`Param ${obj} is not a object`);
        return {};
    }
    return Object.keys(obj).reduce((acc, cur) => {
        if (typeof handler != 'function') {
            handler = notNull;
        }
        if (handler(acc, cur, obj)) {
            return {
                ...acc,
                [cur]: obj[cur],
            };
        } else {
            return acc;
        }
    }, {});
}

function notNull(tarket, key, obj) {
    return obj[key] != null;
}

function exist(tarket, key, obj) {
    return obj[key] != null;
}

export function filterExist(obj: Object) {
    return filter(obj, exist);
}

export function map(obj, func) {
    if (!isObject(obj)) {
        console.error(`Param ${obj} is not a object`);
        return {};
    }
    return Object.keys(obj).reduce((acc, key) => {
        acc[key] = func(obj[key], key);
        return acc;
    }, {});
}

export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(
            function () {
                func.apply(context, args)
            },
            wait
        )
    }
}

export function formatUrl(url, query) {
    let protocol
    const index = url.indexOf('://')
    if (index !== -1) {
        protocol = url.substring(0, index)
        url = url.substring(index + 3)
    } else if (url.startsWith('//')) {
        url = url.substring(2)
    }

    let parts = url.split('/')
    let result = (protocol ? protocol + '://' : '//') + parts.shift()

    let path = parts.filter(Boolean).join('/')
    let hash
    parts = path.split('#')
    if (parts.length === 2) {
        [path, hash] = parts
    }

    result += path ? '/' + path : ''

    if (query && JSON.stringify(query) !== '{}') {
        result += (url.split('?').length === 2 ? '&' : '?') + formatQuery(query)
    }
    result += hash ? '#' + hash : ''

    return result
}

export function formatQuery(query) {
    return Object.keys(query).sort().map((key) => {
        const val = query[key]
        if (val == null) {
            return ''
        }
        if (Array.isArray(val)) {
            return val.slice().map(val2 => [key, '=', val2].join('')).join('&')
        }
        return key + '=' + val
    }).filter(Boolean).join('&')
}

export const parseQuery = (queryString, handler = decodeURIComponent) => {
    const query = {}
    const pairs = queryString.split('&')
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=')
        query[handler(pair[0])] = handler(pair[1] || '')
    }
    return query
}

const entries = (obj) => {
    var ownProps = Object.keys(obj),
        i = ownProps.length,
        resArray = new Array(i); // preallocate the Array
    while (i--)
        resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
};

export const encodeQuery = (queryObject, handler: Function = encodeURIComponent) => {
    return entries(queryObject)
        .filter(([key, value]) => typeof value !== 'undefined')
        .map(
            ([key, value]) =>
                handler(key) + (value != null ? '=' + handler(value as any) : '')
        )
        .join('&')
}

export const filterQuery = (
    queryString: string,
    handler: (key: string, value: string) => Boolean
) => {
    if (!isString(queryString)) {
        return '';
    }
    if (queryString.length === 0) {
        return '';
    }
    return queryString
        .split('&')
        .reduce(
            (acc, cur) => {
                const [key, value] = cur.split('=')
                if (handler(key, value)) {
                    acc.push(cur);
                }
                return acc;
            },
            []
        )
        .join('&');
}

export function parseParam(value) {
    let parsed;
    try {
        parsed = JSON.parse(value);
    } catch (error) {
        console.error(`parseParam error: ${value} can't be JSON.parse. Error: ${error}. Type: ${typeof value}. `);
    }
    return parsed;
}

export type IQueryParser = {
    [key: string]: (string) => any
};

export function queryToState(query: string, stateList?: string[], parser?: IQueryParser) {
    if (!isString(query) || query.length === 0) {
        return {};
    }
    const origin = parseQuery(query);
    return Object.keys(origin)
        .filter((value) => (
            stateList == null ? true : stateList.indexOf(value)) > -1
        )
        .reduce((obj, key) => {
            const parseParamFunc = isObject(parser) && isFunction(parser[key]) && parser[key] || parseParam;
            const parsedVal = parseParamFunc(origin[key]);
            parsedVal != null && (obj[key] = parsedVal);
            return obj;
        }, {});
}

function stringifyParam(value) {
    return JSON.stringify(value);
}

export type IQueryStringify = {
    [key: string]: (any) => any,
}

export function stateToQuery(state: Object, stringify?: IQueryStringify) {
    if (!isObject(state)) {
        return '';
    }
    const filterState = filterExist(state);
    const query = encodeQuery(
        map(
            filterState,
            (value, key) => {
                const stringifyParamFunc =
                    isObject(stringify) && isFunction(stringify[key]) && stringify[key] || stringifyParam;
                return stringifyParamFunc(value);
            }
        )
    );
    return query;
}
