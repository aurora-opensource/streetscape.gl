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
  VIEW_MODE
} from 'streetscape.gl';
import {Form} from '@streetscape.gl/monochrome';

import {XVIZ_CONFIG, APP_SETTINGS, MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR} from './constants';

setXVIZConfig(XVIZ_CONFIG);

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;

// __IS_STREAMING__ and __IS_LIVE__ are defined in webpack.config.js
const exampleLogA = require(__IS_STREAMING__
  ? './log-from-stream'
  : __IS_LIVE__
    ? './log-from-live'
    : './log-from-file').default;

const exampleLogB = require(__IS_STREAMING__
  ? './log-from-stream'
  : __IS_LIVE__
    ? './log-from-live'
    : './log-from-file').default;


class Example extends PureComponent {
  state = {
    logA: exampleLogA,
    logB: exampleLogB,
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false
    },
    viewState: null,
    viewOffset: null
  };

  _onViewStateChange = ({viewState, viewOffset}) => {
    this.setState({viewState, viewOffset});
  };

  _onSeek(timestamp) {
    const {logA, logB} = this.state;
    logA.seek(timestamp);
    logB.seek(timestamp);
  }

  _onLookAheadChange(lookAhead) {
    const {logA, logB} = this.state;
    logA.setLookAhead(lookAhead);
    logB.setLookAhead(lookAhead);
  }

  _onSettingsChange(settings) {
    const {logA, logB} = this.state;
    logA.updateStreamSettings(settings);
    logB.updateStreamSettings(settings);
  }

  componentDidMount() {
    this.state.logA.on('error', console.error).connect();
    this.state.logB.on('error', console.error).connect();
  }

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  render() {
    const {logA, logB, settings} = this.state;

    return (
      <div id="container">
        <div id="control-panel">
          <XVIZPanel log={logA} name="Metrics" />
          <hr />
          <XVIZPanel log={logB} name="Camera" />
          <hr />
          <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
          <StreamSettingsPanel log={logA} />
        </div>
        <div id="log-panel">
          <div id="map-view1" style={{position: 'relative', height: "50%"}}>
            <LogViewer
              log={logA}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              mapStyle={MAP_STYLE}
              car={CAR}
              xvizStyles={XVIZ_STYLE}
              showTooltip={settings.showTooltip}
              viewMode={VIEW_MODE[settings.viewMode]}
              viewState={this.state.viewState}
              viewOffset={this.state.viewOffset}
              onViewStateChange={this._onViewStateChange}
            />
          </div>
          <div id="map-view2" style={{position: 'relative', height: "50%"}}>
            <LogViewer
              log={logB}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              mapStyle={MAP_STYLE}
              car={CAR}
              xvizStyles={XVIZ_STYLE}
              showTooltip={settings.showTooltip}
              viewMode={VIEW_MODE[settings.viewMode]}
              viewState={this.state.viewState}
              viewOffset={this.state.viewOffset}
              onViewStateChange={this._onViewStateChange}
            />
            <div id="hud">
              <TurnSignalWidget log={logA} streamName="/vehicle/turn_signal" />
              <hr />
              <TrafficLightWidget log={logA} streamName="/vehicle/traffic_light" />
              <hr />
              <MeterWidget
                log={logA}
                streamName="/vehicle/acceleration"
                label="Acceleration"
                min={-4}
                max={4}
              />
              <hr />
              <MeterWidget
                log={logA}
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
              log={logA}
              onLookAheadChange={this._onLookAheadChange}
              formatTimestamp={x => new Date(x * TIMEFORMAT_SCALE).toUTCString()}
            />
          </div>
        </div>
      </div>
    );
  }
}

render(<Example />, document.getElementById('app'));
