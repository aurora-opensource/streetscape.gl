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
