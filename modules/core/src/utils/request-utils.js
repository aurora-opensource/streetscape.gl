// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/**
 * Utilities for issuing requests
 * <p>Promise based API with consistent error handling
 * <p>Works in browser and node.
 */
/* eslint-disable no-try-catch */
/* global XMLHttpRequest */
import HttpStatusCodes from 'http-status-codes';
import PromiseRetry from 'promise-retry';
import PromiseTracker from './promise-tracker';

let defaultRequestFunction;
// TODO comments contains `uber-xhr`
if (module.require) {
  // xhr / uber-xhr is great but it doesn't work under Node.js (e.g. for unit tests),
  // So, under Node.js, we use the (reasonably) API-compatible npm "request" module instead.
  // Note: We dynamically load the request module for ~500KB bundle size savings
  // In contrast to "require", "module.require" is not processed by bundlers (browserify/webpack)
  // and will avoid adding module + dependencies to the bundle
  // instead resolving run-time by lookup in node_modules (only works under Node.js but that's OK)
  defaultRequestFunction = module.require('request');
} else {
  // In the browser, use the smaller "xhr" module (public, without uber-specific support)
  // TODO/ib - Would be nice to use uber-xhr by default here, however:
  // 1. uber-xhr has been causing severe problems with yarn installs
  // 2. With uber-xhr the Access-Control-Allow-Credentials cannot be set (still an issue?)
  // defaultRequestFunction = require('uber-xhr');
  defaultRequestFunction = require('xhr');
}

// The request cache contains a map of urls to promises returned by request
const requestCache = {};

let defaultPromiseTracker = new PromiseTracker();

/**
 * Register a default promise tracker instance
 * @param {PromiseTracker} promiseTracker
 */
export function setDefaultPromiseTracker(promiseTracker) {
  defaultPromiseTracker = promiseTracker;
}

/**
 * Return the default promise tracker instance
 * @param {PromiseTracker} promiseTracker
 */
export function getDefaultPromiseTracker() {
  return defaultPromiseTracker;
}

/**
 * Promisified request
 *
 * Uses UberXHR module on the browser to get CSRF and Origin handling
 * Uses request module on Node.js
 *
 * @param {object} uriOptions - {uri} - A `request` options object
 * @param {object} opts - Secondary options object
 * @param {Boolean} opts.useLocalCache=false - Saves the request promise
 *  removes promise from cache on second request, useful if you want to preload a resource
 * @param {Boolean} opts.defeatBrowserCache=false - Add "random" url option to defeat browser cache
 * @param {number} opts.retries=0 - Number of times to attempt a request with exponential backoff
 *  before returning an error
 *
 * @return {Promise} - Resolves to object w. response/body fields
 */
export function request(
  uriOptions,
  {
    useLocalCache = false,
    defeatBrowserCache = false,
    promiseTracker = null,
    id = null,
    requestFunction = defaultRequestFunction,
    retries = 0
  } = {}
) {
  uriOptions = {...uriOptions};

  const cacheUrl = uriOptions.uri;
  if (defeatBrowserCache) {
    uriOptions.uri = addParametersToUrl(uriOptions.uri, `noCache=${Date.now()}`);
  }

  // If this resource has already been requested, just return the same promise
  let promise = requestCache[cacheUrl];
  if (promise) {
    // console.log(`request serving promise from cache ${cacheUrl}`); // eslint-disable-line
    // Remove promise from cache to enable response to be garbage collected
    requestCache[cacheUrl] = null;
    return promise;
  }

  promise = PromiseRetry(
    retry => {
      return promisifiedRequest(requestFunction, uriOptions, retries).catch(retry);
    },
    {
      retries,
      minTimeout: 200,
      randomize: true
    }
  );

  // Add the new promise to the request cache (if requested)
  if (useLocalCache) {
    // console.log(`request saving promise in cache ${cacheUrl}`); // eslint-disable-line
    requestCache[cacheUrl] = requestCache[cacheUrl] || promise;
  }

  // If a promiseTracker is provided, start tracking the promise
  promiseTracker = promiseTracker || defaultPromiseTracker;
  if (promiseTracker) {
    id = id || uriOptions.uri;
    promiseTracker.add({promise, id});
  }

  return promise;
}

/**
 * Promisified request that returns clear text
 * @param {string|object} url - Either an url or an options object
 * @return {Promise}          - Resolves to parsed json
 */
export function requestText(url, opts = {}) {
  const params = getRequestParams(url, opts);
  return request(params, opts).then(result => {
    const text = result.body;
    if (typeof text !== 'string') {
      throw new Error(`Failed to get text response from ${url}`);
    }
    return text;
  });
}

/**
 * Promisified request that parses response as Json
 * @param {string|object} url - Either an url or an options object
 * @return {Promise}          - Resolves to parsed json
 */
export function requestJson(url, opts = {}) {
  const params = getRequestParams(url, opts);
  return request(params, opts).then(result => {
    const json = _safeParseJson(result.body);
    if (!json) {
      throw new Error(`Failed to parse json response from ${url}`);
    }
    return json;
  });
}

/**
 * Promisified request that requests binary data as an arraybuffer
 * TODO/ib - What should be returned in Node.js?
 * @param {string|object} url - Either an url or an options object
 * @return {Promise}          - Resolves to parsed json
 */
export function requestBinary(url, opts = {}) {
  const params = getRequestParams(url, opts);
  return request({...params, responseType: 'arraybuffer'}, opts).then(result => {
    const binary = result.body;
    if (!binary) {
      throw getError('Binary data request returned null data');
    }
    return binary;
  });
}

/*
 * Loads images asynchronously
 * image.crossOrigin can be set via opts.crossOrigin, default to 'anonymous'
 * returns a promise tracking the load
 * NOTE: This duplicates luma.gl's loadImage to avoid requiring all of luma.gl here
 */
export function requestImage(url, opts = {}) {
  return new Promise((resolve, reject) => {
    try {
      /* global Image */
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load image ${url}.`));
      image.crossOrigin = (opts && opts.crossOrigin) || 'anonymous';
      image.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

// normalizes string|object -> object {uri}
function getRequestParams(uri, opts) {
  const params = typeof uri === 'string' ? {uri} : uri;
  return params;
}

// normalizes string|object -> string representing url
function getUriFromRequestParams(url) {
  const uri = typeof url === 'string' ? url : url.uri;
  return uri;
}

// Concatenate a string parameter to a string URL
function addParametersToUrl(url, params) {
  params = Array.isArray(params) ? params : [params];
  url += `${url.search(/\?/) >= 0 ? '&' : '?'}${params.join('&')}`;
  return url;
}

// Parse JSON without generating the dreaded SyntaxError exception for invalid text
function _safeParseJson(text) {
  try {
    return typeof text === 'string' ? JSON.parse(text) : null;
  } catch (error) {
    return null;
  }
}

// Calls request function and returns a Promise
function promisifiedRequest(requestFunction, uriOptions) {
  return new Promise((resolve, reject) => {
    try {
      requestFunction(uriOptions, (error, response, body) => {
        if (error) {
          reject(getError(error, uriOptions));
        } else if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(getApplicationError(response, uriOptions));
        } else {
          resolve({response, body});
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get error information from error information of unknown type
 * Extracts as much human readable information as possible
 * Ensure result is an Error object suitable for throw or promise rejection
 * @private
 * @param {Error}  err - Unknown error
 * @param {string} url - Failed uri
 * @return {Error}     - Error instance with extracted message
 */
function getError(err, url) {
  const uri = getUriFromRequestParams(url);

  if (err instanceof Error) {
    return err;
  }
  if (typeof XMLHttpRequest !== 'undefined' && err instanceof XMLHttpRequest) {
    return getXHRError(err, uri);
  }
  if (typeof err === 'string') {
    return new Error(`${err}\n${uri}`);
  }
  return new Error(`Unknown error\n${uri}`);
}

/**
 * @private
 * Extracts as much human readable information as possible from response object
 * Speculatively checks if the response is JSON encoded and in that case
 * tries a number of subfields that correspond to common error reporting
 * conventions.
 * Ensures result is an Error object suitable for throw or promise rejection
 * @param {object} response  - See https://github.com/Raynos/xhr
 * @param {string} url       - Failed uri
 * @return {Error}           - Error instance with extracted message
 */
function getApplicationError(response, url) {
  const uri = getUriFromRequestParams(url);
  const httpStatus =
    `${response.statusCode} ` + `${HttpStatusCodes.getStatusText(response.statusCode)}`;

  let message = '';
  const json = _safeParseJson(response.body);
  if (json) {
    message = json.message || json.error || json.err || response.body;
    message += json.details ? `\n${json.details}` : '';
    message.slice(80);
    message += '\n';
  }

  return new Error(`${message}${httpStatus}\n${uri}`);
}

function getXHRError(req, uri) {
  const httpStatus = `${req.statusCode} ` + `${HttpStatusCodes.getStatusText(req.statusCode)}`;
  return new Error(`${httpStatus}\n${uri}`);
}
