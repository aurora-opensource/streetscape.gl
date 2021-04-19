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
import {PathStyleExtension} from '@deck.gl/extensions';
import {setXVIZConfig, getXVIZConfig} from '@xviz/parser';
import {
  LaneLayer,
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
const exampleLog = require(__IS_STREAMING__
  ? './log-from-stream'
  : __IS_LIVE__
    ? './log-from-live'
    : './log-from-file').default;

class Example extends PureComponent {
  state = {
    log: exampleLog,
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false
    }
  };

  componentDidMount() {
    this.state.log.on('error', console.error).connect();
  }

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  render() {
    const {log, settings} = this.state;

    return (
      <div id="container">
        <div id="control-panel">
          <XVIZPanel log={log} name="Metrics" />
          <hr />
          <XVIZPanel log={log} name="Camera" />
          <hr />
          <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
          <StreamSettingsPanel log={log} />
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
              customXVIZLayers={[
                {
                  // {string} id - passed into layer
                  id: 'dual',
                  // {string} primitive - defines what xviz primitive renderer you want to extend
                  primitive: 'polyline',
                  // {Deckgl Layer Class} layerClass - defines what deck.gl layer you would like to use in rendering
                  layerClass: LaneLayer,
                  /* 
                  * Determines whether the layer handler should be used for a specific stream
                  * @param {string} streamName
                  * @param {Object} streamMetadata
                  */

                  streamMatch: (_, streamMetadata) => {
                    //
                    return streamMetadata.primitive_type === 'polyline';
                  },
                  /* 
                  * Defines props to spread into `this.getSublayerProps` in the XVIZLayer
                  * @param {Object} xvizLayerProps - all props passed into XVIZLayer
                  * @param {Object} primitiveLayerProps - all layer-type props that are used for the primitive layer
                  * @param {Object} state - the XVIZLayer state
                  */
                  getSubProps: ({xvizLayerProps, primitiveLayerProps, state}) => {
                    return {
                      id: 'path-dual',
                      getWidth: [0.1, 0.1, 0.1],
                      getPath: f => f.vertices,
                      getDashArray: () => [1, 2],
                      getDashArray2: () => [2, 4],
                      // shows how you can use existing layer accessors to extend functionality
                      getColor2: state.layerProps.getColor,
                      extensions: [new PathStyleExtension({dash: true})]
                    };
                  }
                }
              ]}
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
