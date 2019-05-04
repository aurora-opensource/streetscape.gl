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
/* global setInterval */
/* global clearInterval */

/**
 * Keep track of the status of the XVIZ parser worker farm.
 * Decouple workers status update frequency from status report frequency.
 */
import {XVIZ_WORKERS_MONITOR_INTERVAL} from './constants';

export class XVIZWorkersMonitor {
  /**
   * constructor
   * @param options {Object} - Monitor options.
   * @param options.numWorkers {number} - The number of workers.
   * @param options.reportCallback {function} - Callback called on each monitor report.
   */
  constructor(options) {
    const {numWorkers, reportCallback} = options;
    this.numWorkers = numWorkers;
    this.reportCallback = reportCallback;
    this.interval = null;
    this.reset();
  }

  /**
   * Update worker farm status.
   *
   * @param payload {Object} - Payload of @xviz/parser "parseStreamMessage" debug
   * callback. See https://github.com/uber/xviz/blob/master/docs/api-reference/parse-xviz.md
   */
  update = payload => {
    const {worker, backlog, dropped} = payload;
    this.status.backlog = backlog;
    this.status.dropped = dropped;
    const now = new Date(Date.now());
    for (const workerId of Object.keys(this.status.workers)) {
      if (worker === workerId) {
        this.status.workers[workerId] = {lastUpdated: now, isActive: true};
      }
    }
  };

  /**
   * If a worker hasn't been active for more than a couple of update intervals,
   * let's clean up its status and considered it inactive.
   */
  cleanup = () => {
    const now = new Date(Date.now());
    for (const [workerId, workerStatus] of Object.entries(this.status.workers)) {
      if (workerStatus.isActive && workerStatus.lastUpdated) {
        const timeDelta = now.getTime() - workerStatus.lastUpdated.getTime();
        if (timeDelta > +2 * XVIZ_WORKERS_MONITOR_INTERVAL) {
          this.status.workers[workerId] = {lastUpdated: now, isActive: false};
        }
      }
    }
  };

  /**
   * Reset workers status.
   */
  reset = () => {
    const workers = {};
    for (let i = 0; i < this.numWorkers; i++) {
      const workerId = `${i}/${this.numWorkers}`;
      workers[workerId] = {lastUpdated: null, isActive: false};
    }
    this.status = {backlog: 'NA', dropped: 'NA', workers};
  };

  /**
   * Start reporting worker farm status.
   */
  start = () => {
    this.stop();
    this.interval = setInterval(() => {
      this.cleanup();
      this.reportCallback(this.status);
    }, XVIZ_WORKERS_MONITOR_INTERVAL);
  };

  /**
   * Stop reporting worker status.
   */
  stop = () => {
    this.reset();
    if (this.interval) {
      clearInterval(this.interval);
    }
  };
}
