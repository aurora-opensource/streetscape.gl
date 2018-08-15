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
 * Logs the state change of an asynchronous operation
 * @params promise {Promise} - the asynchronous operation to trace
 * @callback log
 * @params status {String} - start, success or failure
 * @params time {Number} - the time it took to complete the operation, in seconds.
 *   Available if the promise resolves.
 * @params error {Error} - the error message if the promise is rejected.
 * Extra arguments are included as-is for the callback function.
 */
export function tracePromise({log, promise, ...extraParams}) {
  log({...extraParams, status: 'start'});
  const startTime = Date.now();
  return promise.then(
    result => {
      const time = (Date.now() - startTime) / 1000;
      log({...extraParams, status: 'success', time});
      return result;
    },
    error => {
      log({...extraParams, status: 'failure', error});
      throw error;
    }
  );
}
