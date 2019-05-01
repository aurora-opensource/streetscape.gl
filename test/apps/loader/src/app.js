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

/* global document, console */
/* eslint-disable no-console, consistent-this */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {Stats} from 'probe.gl';

import loader from './log-from-stream';

const workerState = {
  workers: [],
  backlog: 0,
  dropped: 0
};
let appInstance;
let workerFarm;

const stats = new Stats({id: 'xviz'});
const metadataStat = stats.get('metadata');
const messageStat = stats.get('message');
const timesliceStat = stats.get('timeslice');
const errorStat = stats.get('error');

function getWorkerFarmSummary(jobInfo = {}) {
  return workerFarm.workers.map(w => ({
    name: w.metadata.name,
    isBusy: jobInfo.worker === w.metadata.name || w.isBusy
  }));
}

function updateStats(event) {
  switch (event) {
    case 'websocket_message':
      messageStat.timeEnd();
      messageStat.timeStart();
      break;

    case 'ready':
      metadataStat.timeEnd();
      timesliceStat.timeStart();
      break;

    case 'update':
      if (workerFarm) {
        workerState.workers = getWorkerFarmSummary();
      }
      timesliceStat.timeEnd();
      timesliceStat.timeStart();
      break;

    case 'error':
      errorStat.incrementCount();
      break;

    case 'finish':
      if (workerFarm) {
        workerState.workers = getWorkerFarmSummary();
      }
      timesliceStat.timeEnd();
      break;

    default:
      return;
  }
  appInstance.forceUpdate();
}

function initWorkerFarm() {
  const originalProcess = workerFarm.process.bind(workerFarm);
  workerFarm.process = (...args) => {
    originalProcess(...args);
  };
}

function initLoader() {
  metadataStat.timeStart();
  messageStat.timeStart();

  // eslint-disable-next-line
  loader._debug = function(info) {
    if (!info.worker) {
      return;
    }

    if (!workerFarm) {
      workerFarm = this;
      initWorkerFarm();
    }

    workerState.workers = getWorkerFarmSummary(info);
    workerState.backlog = info.backlog;
    workerState.dropped = info.dropped;
    appInstance.forceUpdate();
  };

  loader
    .on('ready', () => updateStats('ready'))
    .on('websocket_message', () => updateStats('websocket_message'))
    .on('update', () => updateStats('update'))
    .on('finish', () => updateStats('finish'))
    .on('error', err => {
      console.error(err);
      updateStats('error');
    })
    .connect();
}

class App extends PureComponent {
  componentDidMount() {
    appInstance = this;
    initLoader();
  }

  _inspectTimeslice = () => {
    if (this._timesliceInput) {
      console.log(loader.streamBuffer.timeslices[this._timesliceInput.value]);
    }
  };

  render() {
    const timesliceCount = loader.streamBuffer.timeslices.length;

    return (
      <div id="container">
        <div className="entry">
          <label>Received Messages</label>
          <div>
            <i>{messageStat.count}</i> at <i>{messageStat.getHz().toFixed(3)}</i> fps
          </div>
        </div>

        <div className="entry">
          <label>Metadata</label>
          {metadataStat.count ? (
            <div>
              Loaded in <i>{metadataStat.time.toFixed(1)}</i> ms
            </div>
          ) : null}
        </div>

        <div className="entry">
          <label>Parsed Messages</label>
          <div>
            <i>{timesliceStat.count}</i> at <i>{timesliceStat.getHz().toFixed(3)}</i> fps
          </div>
        </div>

        <div className="entry">
          <label>Dropped Messages</label>
          <div>
            <i>{workerState.dropped}</i>
          </div>
        </div>

        <div className="entry">
          <label>Parser Backlog</label>
          <div>
            <i>{workerState.backlog}</i>
          </div>
        </div>

        <div className="entry">
          <label>Errors</label>
          <div>
            <i>{errorStat.count}</i>
          </div>
        </div>

        <div className="entry">
          <label>Workers</label>
          {workerState.workers.map((worker, i) => (
            <div className={`worker-state ${worker.isBusy ? 'busy' : ''}`} key={i}>
              {worker.name}
            </div>
          ))}
        </div>

        <div className="entry">
          <label>Time Slices</label>
          <div>
            <input
              type="text"
              ref={ref => {
                this._timesliceInput = ref;
              }}
              placeholder={timesliceCount > 1 ? `1-${timesliceCount}` : ''}
            />
            <button onClick={this._inspectTimeslice}>Inspect</button>
          </div>
        </div>
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));
