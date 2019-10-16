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
/* eslint-disable no-console, no-unused-vars, no-undef, camelcase */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {BitmapLayer} from '@deck.gl/layers';

import {Background} from './background';

import {setXVIZConfig, getXVIZConfig} from '@xviz/parser';
import {LogViewer, VIEW_MODE} from 'streetscape.gl';
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
import {SimpleLoader} from './simple-loader';
import {StudioLoader} from './studio-loader';

setXVIZConfig(XVIZ_CONFIG);

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;

/**
 * Pass through path & parameters to loaders
 * @return {
 *  logGuid: 'live',
 *  serverConfig: {
 *    serverUrl: '...',
 *    [queryParams],
 *    [retryAttempts],
 *  },
 *  ...,
 *  [logProfile],
 *  [WebSocketClass]
 * }
 */
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
    // These will be passed through to server request
    log = 'live',
    ...passthroughOptions
  } = params;

  const options = {
    // Any options not handled directly will just pass through
    ...passthroughOptions,

    logGuid: log,
    serverConfig: {
      serverUrl: `${server}${url.pathname}`
    }
  };

  return options;
}

// const exampleLog = new StudioLoader(buildLoaderOptions());
const exampleLog = new SimpleLoader(buildLoaderOptions());

class Example extends PureComponent {
  state = {
    log: exampleLog,
    settings: {
      viewMode: 'PERSPECTIVE', // 'DRIVER', Camera-Overlay
      showTooltip: false,
      showDebug: true
    },
    panels: [],
    // LogViewer perf stats
    statsSnapshot: {},
    // XVIZ Parser perf stats
    backlog: 'NA',
    dropped: 'NA',
    workers: {},
    bg: null
  };

  componentDidMount() {
    const {log} = this.state;
    log.connect();
    log.on('update', () => {
      this._customLayers();
    });
  }

  _customLayers() {
    const {log, settings, panels} = this.state;

    const frame = log.getCurrentFrame();
    const customLayers = [];
    let bg = null;
    if (frame) {
      const imageStreams = Object.keys(frame.streams).filter(name => {
        const streamData = frame.streams[name];
        return streamData.images && streamData.images.length > 0;
      });

      const layerMakers = [];
      imageStreams.forEach(name => {
        frame.streams[name].images.forEach(imgData => {
          // data, position[], height_px, width_px
          const {height_px, width_px, data, imageData} = imgData;

          const newUint = new Uint8Array(data || imageData, 0);
          const myImg = new Blob([newUint.buffer], {type: 'image/png'});
          // For webGL this flip is needed (due to how bitmapLayer expects data?
          // { imageOrientation: 'flipY' }
          layerMakers.push(
            createImageBitmap(myImg, {})
              .then(image => {
                // Kitti specific
                if (name === '/camera/image_00') {
                  bg = image;
                }

                const n = customLayers.length;
                const h = n * 5;
                // useable by kitti dat
                // const h = parseInt(name.slice(-2), 10) * 5;
                customLayers.push(
                  new BitmapLayer({
                    id: `image-layer-${n}`,
                    // bl, tl, tr, br
                    // bounds: [[5, -5, 0 + h], [5, -5, 5 + h], [5, 5, 5 + h], [5, 5, 0 + h]],
                    //
                    // tr, br, bl, tl
                    bounds: [[5, 5, 5 + h], [5, 5, 0 + h], [5, -5, 0 + h], [5, -5, 5 + h]],
                    coordinate: 'VEHICLE_RELATIVE',
                    image
                  })
                );
              })
              .catch(err => {
                console.error(err);
              })
          );
        });
      });

      Promise.all(layerMakers).then(layer => {
        // Sets in-scene images
        this.setState({customLayers, bg});

        // Camera-Overlay
        // Just the background
        // this.setState({bg});
      });
    }
  }

  render() {
    const {bg, log, settings, panels, customLayers} = this.state;

    const style = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1
    };

    // Camera-Overlay
    // <Background src={bg} />
    return (
      <div id="container">
        <div id="log-panel">
          <div id="map-view" style={style}>
            <LogViewer
              log={log}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              mapStyle={MAP_STYLE}
              car={CAR}
              xvizStyles={XVIZ_STYLE}
              viewMode={VIEW_MODE[settings.viewMode]}
              customLayers={customLayers}
            />
          </div>
        </div>
      </div>
    );
  }
}

render(<Example />, document.getElementById('app'));
