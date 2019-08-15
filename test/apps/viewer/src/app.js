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

/* global document, console, window */
/* eslint-disable no-console, no-unused-vars, no-undef */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {setXVIZConfig, getXVIZConfig} from '@xviz/parser';
import {
  LogViewer,
  PlaybackControl,
  StreamSettingsPanel,
  MeterWidget,
  TrafficLightWidget,
  TurnSignalWidget,
  XVIZPanel,
  VIEW_MODE,
  LogViewerStats,
  XVIZWorkerFarmStatus,
  XVIZWorkersMonitor,
  XVIZWorkersStatus
} from 'streetscape.gl';
import {Form} from '@streetscape.gl/monochrome';
import {
  XVIZ_CONFIG,
  APP_SETTINGS,
  MAPBOX_TOKEN,
  MAP_STYLE,
  XVIZ_STYLE,
  CAR,
  STYLES
} from './constants';
import {default as XVIZLoaderFactory} from './log-from-factory';

setXVIZConfig(XVIZ_CONFIG);

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;

// Pass through path & parameters to loaders
function buildLoaderOptions() {
  const url = new URL(window.location);

  // I prefer to work with an object
  const params = {};
  for (const [k, v] of url.searchParams.entries()) {
    if (Number.isNaN(Number.parseFloat(v))) {
      params[k] = v;
    } else {
      params[k] = Number.parseFloat(v);
    }
  }

  const {
    // These will not be passed through to server request
    server = 'ws://localhost:3000',
    worker = true,
    // These will be passed through to server request
    log = 'mock',
    profile,
    timestamp,
    duration,
    ...passthroughOptions
  } = params;

  const options = {
    // Any options not handled directly will just pass through
    ...passthroughOptions,

    logGuid: log,
    serverConfig: {
      defaultLogLength: 30,
      serverUrl: `${server}${url.pathname}`
    },
    worker: worker !== 'false',
    maxConcurrency: 4
  };

  if (profile) {
    options.logProfile = profile;
  }
  if (timestamp) {
    options.timestamp = timestamp;
  }
  if (duration) {
    options.duration = duration;
  }
  if (__IS_LIVE__) {
    options.bufferLength = params.bufferLength || 10;
  }

  return options;
}

// __IS_STREAMING__ and __IS_LIVE__ are defined in webpack.config.js
const exampleLog = XVIZLoaderFactory.load(__IS_STREAMING__, __IS_LIVE__, buildLoaderOptions());

class Example extends PureComponent {
  state = {
    log: exampleLog,
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false,
      showDebug: true
    },
    panels: [],
    // LogViewer perf stats
    statsSnapshot: {},
    // XVIZ Parser perf stats
    backlog: 'NA',
    dropped: 'NA',
    workers: {}
  };

  componentDidMount() {
    const {log} = this.state;
    log
      .on('ready', () => {
        const metadata = log.getMetadata();
        this.setState({
          panels: Object.keys((metadata && metadata.ui_config) || {})
        });
      })
      .on('error', console.error)
      .connect();

    // Monitor the log
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
  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  _renderPerf = () => {
    const {statsSnapshot, backlog, dropped, workers} = this.state;
    return this.state.settings.showDebug ? (
      <div style={STYLES.PERF}>
        <hr />
        <XVIZWorkerFarmStatus backlog={backlog} dropped={dropped} />
        <XVIZWorkersStatus workers={workers} />
        <hr />
        <LogViewerStats statsSnapshot={statsSnapshot} />
      </div>
    ) : null;
  };

  render() {
    const {log, settings, panels} = this.state;

    return (
      <div id="container">
        <div id="control-panel" style={{minWidth: 400}}>
          {panels.map(panelName => [
            <XVIZPanel key={panelName} log={log} name={panelName} />,
            <hr key={`${panelName}-divider`} />
          ])}
          <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
          <StreamSettingsPanel log={log} />
          {this._renderPerf()}
        </div>
        <div id="log-panel">
          <div id="map-view">
            <LogViewer
              log={log}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              mapStyle={MAP_STYLE}
              car={CAR}
              xvizStyles={XVIZ_STYLE}
              showTooltip={settings.showTooltip}
              viewMode={VIEW_MODE[settings.viewMode]}
              debug={payload => this.setState({statsSnapshot: payload})}
            />
            <div id="hud">
              <TurnSignalWidget log={log} streamName="/vehicle/turn_signal" />
              <hr />
              <TrafficLightWidget log={log} streamName="/vehicle/traffic_light" />
              <hr />
              <MeterWidget
                log={log}
                streamName="/vehicle/acceleration"
                label="Acceleration"
                min={-4}
                max={4}
              />
              <hr />
              <MeterWidget
                log={log}
                streamName="/vehicle/velocity"
                label="Speed"
                getWarning={x => (x > 6 ? 'FAST' : '')}
                min={0}
                max={20}
              />
            </div>
          </div>
          <div id="timeline">
            <PlaybackControl
              width="100%"
              log={log}
              formatTimestamp={x => new Date(x * TIMEFORMAT_SCALE).toUTCString()}
            />
          </div>
        </div>
      </div>
    );
  }
}

render(<Example />, document.getElementById('app'));
