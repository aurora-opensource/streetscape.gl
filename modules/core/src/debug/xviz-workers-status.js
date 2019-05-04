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
import React from 'react';
import {STYLES} from './constants';
import {XVIZWorkersMonitor} from './xviz-workers-monitor';

const ActivityTag = ({isActive}) =>
  isActive ? (
    <div style={{...STYLES.TAG, ...STYLES.POSITIVE}}>ACTIVE</div>
  ) : (
    <div style={{...STYLES.TAG, ...STYLES.NEGATIVE}}>INACTIVE</div>
  );

const _formatLastUpdated = lastUpdated =>
  `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`;

const Workers = ({workers}) =>
  Object.entries(workers).map(([workerId, {lastUpdated, isActive}]) => (
    <div style={STYLES.WORKERS.SECTION} key={workerId}>
      <div style={STYLES.WORKERS.TITLE}>
        <div style={STYLES.WORKERS.NAME}>Worker {workerId}</div>
        <ActivityTag isActive={isActive} />
      </div>
      <div style={STYLES.WORKERS.ENTRY}>
        {lastUpdated
          ? `Last active at ${_formatLastUpdated(lastUpdated)}`
          : 'This worker has never been active.'}
      </div>
    </div>
  ));

const Backlog = ({backlog, dropped}) => (
  <div style={STYLES.WORKERS.SECTION}>
    <div style={STYLES.WORKERS.TITLE}>XVIZ Worker Farm</div>
    <div style={STYLES.WORKERS.ENTRY}>{`Queue backlog: ${backlog}`}</div>
    <div style={STYLES.WORKERS.ENTRY}>{`Dropped: ${dropped}`}</div>
  </div>
);

export class XVIZWorkersStatus extends React.Component {
  state = {backlog: 'NA', dropped: 'NA', workers: {}};

  componentWillMount() {
    const {log} = this.props;
    this.xvizWorkerMonitor = new XVIZWorkersMonitor({
      numWorkers: log.options.maxConcurrency,
      reportCallback: ({backlog, dropped, workers}) => {
        this.setState({backlog, dropped, workers});
      }
    });
    log._debug = (event, payload) => {
      if (event === 'parse_message') {
        this.xvizWorkerMonitor.update(payload);
      }
    };
    this.xvizWorkerMonitor.start();
  }

  componentWillUnmount() {
    if (this.xvizWorkerMonitor) {
      this.xvizWorkerMonitor.stop();
    }
  }

  render() {
    const {backlog, dropped, workers} = this.state;
    return (
      <div style={STYLES.WORKERS.CONTENT}>
        <Backlog backlog={backlog} dropped={dropped} />
        <Workers workers={workers} />
      </div>
    );
  }
}
