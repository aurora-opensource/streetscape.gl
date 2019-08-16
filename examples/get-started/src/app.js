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
import {GeoJsonLayer} from '@deck.gl/layers';
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

const geojson = 
 {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [
            8.420505523681639,
            49.01299163695282,
            112
          ],
          [
            8.424475193023682,
            49.01282275074038,
            112
          ],
          [
            8.424324989318848,
            49.01172497639439,
            112
          ],
          [
            8.420140743255615,
            49.01218942234111,
            112
          ],
          [
            8.420076370239258,
            49.01102126215874,
            112
          ],
          [
            8.424303531646729,
            49.01083829482822,
            112
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              8.425226211547852,
              49.01121830314735,
              112
            ],
            [
              8.425140380859375,
              49.01028938880215,
              112
            ],
            [
              8.427286148071289,
              49.01030346339125,
              112
            ],
            [
              8.427286148071289,
              49.01110570839222,
              112
            ],
            [
              8.426942825317383,
              49.01195016284906,
              112
            ],
            [
              8.425590991973877,
              49.01169682801593,
              112
            ],
            [
              8.425226211547852,
              49.01121830314735,
              112
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              8.425569534301758,
              49.012879046208184,
              112
            ],
            [
              8.425569534301758,
              49.012879046208184,
              112
            ],
            [
              8.425569534301758,
              49.012879046208184,
              112
            ],
            [
              8.425569534301758,
              49.012879046208184,
              112
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              8.42350959777832,
              49.01275238131608,
              112
            ],
            [
              8.425376415252686,
              49.01275238131608,
              112
            ],
            [
              8.425376415252686,
              49.01396272155595,
              112
            ],
            [
              8.42350959777832,
              49.01396272155595,
              112
            ],
            [
              8.42350959777832,
              49.01275238131608,
              112
            ]
          ]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": [
          8.423101902008057,
          49.011429417626935,
          112
        ]
      }
    }
  ]
};
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
    const frame = log.getCurrentFrame();
    const customLayers = [
      new GeoJsonLayer({
        id: 'map-geojson-layer',
        // The layer is only re-generated if this URL changes
        data: geojson,
        stroked: true,
        filled: true,
        extruded: false,
        getFillColor: f => f && f.properties && f.properties.fill || [255, 0, 0],
        getLineColor: f => f && f.properties && f.properties.stroke || [0, 255, 0],
        getLineWidth: 0.5
      })
    ];

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
              customLayers={customLayers}
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
