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

/* global document, window,*/
/* eslint-disable no-console */
import './xviz-config-kitty';

import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {openLogStream, LogPlayer, VIEW_MODES} from 'streetscape.gl';
import {PlaybackControl, Form, AutoSizer} from 'monochrome-ui';

import {SETTINGS, MAP_STYLE, XVIZ_STYLES, CAR} from './constants';

import './main.scss';

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false,
      metadata: null,
      log: null,
      timestamp: null,
      lastUpdate: 0,
      settings: {
        viewMode: 'PERSPECTIVE'
      }
    };

    openLogStream({
      serverConfig: {
        serverUrl: 'ws://localhost:8081',
        worker: require.resolve('./stream-data-worker'),
        maxConcurrency: 4
      },
      onMetadata: metadata => {
        this.setState({
          metadata,
          timestamp: metadata.start_time,
          startTime: metadata.start_time,
          endTime: metadata.end_time
        });
      },
      onUpdate: logSynchronizer => {
        this.setState({log: logSynchronizer});
      }
    });
  }

  _animate = () => {
    if (this.state.isPlaying) {
      const now = Date.now();
      const {timestamp, lastUpdate, startTime, endTime} = this.state;
      const delta = now - lastUpdate;

      if (delta > 80) {
        let newTimestamp = timestamp + 100;
        if (newTimestamp > endTime) {
          newTimestamp = startTime;
        }
        this.setState({timestamp: newTimestamp, lastUpdate: now});
      }

      window.requestAnimationFrame(this._animate);
    }
  };

  _onPlay = () => {
    this.setState({isPlaying: true, lastUpdate: Date.now()});
    window.requestAnimationFrame(this._animate);
  };

  _onPause = () => {
    this.setState({isPlaying: false});
  };

  _onSeek = timestamp => {
    if (this.state.isPlaying) {
      this.setState({isPlaying: false});
    }
    this.setState({timestamp});
  };

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  render() {
    const {isPlaying, metadata, log, timestamp, startTime, endTime, settings} = this.state;

    if (timestamp === null) {
      return null;
    }

    return (
      <div id="container">
        <div id="map-view">
          <LogPlayer
            log={log}
            metadata={metadata}
            timestamp={timestamp}
            mapStyle={MAP_STYLE}
            xvizStyle={XVIZ_STYLES}
            car={CAR}
            viewMode={VIEW_MODES[settings.viewMode]}
          />
        </div>
        <div id="timeline">
          <AutoSizer disableHeight={true}>
            {({width}) => (
              <PlaybackControl
                width={width}
                currentTime={timestamp}
                startTime={startTime}
                endTime={endTime}
                step={100}
                isPlaying={isPlaying}
                formatTick={x =>
                  PlaybackControl.formatTimeCode((x - startTime) / 1000, '{mm}:{ss}')
                }
                formatTimestamp={x => new Date(x).toUTCString()}
                onSeek={this._onSeek}
                onPlay={this._onPlay}
                onPause={this._onPause}
              />
            )}
          </AutoSizer>
        </div>
        <div id="control-panel">
          <Form data={SETTINGS} values={this.state.settings} onChange={this._onSettingsChange} />
        </div>
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
