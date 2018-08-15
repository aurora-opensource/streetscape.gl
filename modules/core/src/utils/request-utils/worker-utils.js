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

/* global Worker, URL */
import createWorker from 'webworkify';

// Cache result of webworkify
const cache = new Map();

function getWorkerURL(processor) {
  let workerURL = cache.get(processor);

  if (!workerURL) {
    const blob = createWorker(processor, {bare: true});
    workerURL = URL.createObjectURL(blob);
    cache.set(processor, workerURL);
  }

  return workerURL;
}

/**
 * Process binary data in a worker
 * @param processor {function | string} - worker function.
 * @returns a Promise creator
 */
export function processWithWorker(processor) {
  const workerURL = getWorkerURL(processor);

  return arrayBuffer =>
    new Promise((resolve, reject) => {
      const worker = new Worker(workerURL);
      worker.onmessage = message => resolve(message.data);
      worker.onerror = error => reject(error);
      worker.postMessage(arrayBuffer, [arrayBuffer]);
    });
}

function getTransferList(object, recursive = true, transfers = []) {
  if (!object) {
    // ignore
  } else if (object instanceof ArrayBuffer) {
    transfers.push(object);
  } else if (object.buffer && object.buffer instanceof ArrayBuffer) {
    // Typed array
    transfers.push(object.buffer);
  } else if (recursive && typeof object === 'object') {
    for (const key in object) {
      // Avoid perf hit - only go one level deep
      getTransferList(object[key], false, transfers);
    }
  }
  return transfers;
}

/**
 * A worker in the WorkerFarm
 */
class WorkerThread {
  constructor({url, metadata}) {
    this.worker = new Worker(url);
    this.isBusy = false;
    this.metadata = metadata;
  }

  process(data) {
    const {worker} = this;

    return new Promise((resolve, reject) => {
      worker.onmessage = e => {
        this.isBusy = false;
        resolve(e.data);
      };

      worker.onerror = err => {
        this.isBusy = false;
        reject(err);
      };

      this.isBusy = true;
      worker.postMessage(data, getTransferList(data));
    });
  }

  terminate() {
    this.worker.terminate();
    this.worker = null;
  }
}

/**
 * Process multiple data messages with a fleet of workers
 */
export class WorkerFarm {
  /**
   * @param processor {function | string} - worker function
   * @param maxConcurrency {number} - max count of workers
   */
  constructor({processor, maxConcurrency = 1, debug = () => {}}) {
    this.workerURL = getWorkerURL(processor);
    this.workers = [];
    this.queue = [];
    this.debug = debug;

    for (let i = 0; i < maxConcurrency; i++) {
      this.workers[i] = new WorkerThread({
        url: this.workerURL,
        metadata: {name: `${i}/${maxConcurrency}`}
      });
    }
  }

  destroy() {
    this.workers.forEach(worker => worker.terminate());
  }

  getAvailableWorker() {
    return this.workers.find(worker => !worker.isBusy);
  }

  next() {
    const {queue} = this;

    while (queue.length) {
      const worker = this.getAvailableWorker();
      if (!worker) {
        break;
      }
      const job = queue.shift();

      this.debug({
        message: 'processing',
        worker: worker.metadata.name,
        backlog: queue.length
      });

      worker
        .process(job.data)
        .then(job.onResult)
        .catch(job.onError)
        .then(() => this.next());
    }
  }

  process(data, onResult, onError) {
    this.queue.push({data, onResult, onError});
    this.next();
  }
}
