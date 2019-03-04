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

/* global document */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {setXVIZConfig} from '@xviz/parser';
import {LogViewer, PlaybackControl} from 'streetscape.gl';

import XVIZJsonLoader from './xviz-json-loader';
import Editor from './editor';

import {XVIZ_CONFIG, CAR, MAPBOX_TOKEN, MAP_STYLE} from './constants';

setXVIZConfig(XVIZ_CONFIG);

class Example extends PureComponent {
  _log = new XVIZJsonLoader();

  render() {
    const log = this._log;

    return (
      <div id="container">
        <Editor log={log} />
        <div id="map-view">
          <LogViewer
            log={log}
            car={CAR}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            mapStyle={MAP_STYLE}
            showTooltip={true}
          />
          <div id="timeline">
            <PlaybackControl width="100%" log={log} formatTimestamp={x => x.toFixed(2)} />
          </div>
        </div>
      </div>
    );
  }
}

render(<Example />, document.getElementById('app'));
