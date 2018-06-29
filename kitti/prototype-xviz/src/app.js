/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {XvizStreamBuffer, StreamSynchronizer} from '@uber/xviz';

import MapComponent from './map';
import {openLogStream} from './utils/data-loader';

class Example extends PureComponent {
  constructor(props) {
    super(props);

    const streamBuffer = new XvizStreamBuffer();

    this.state = {
      isPlaying: false,
      metadata: {},
      streamBuffer,
      synchronizer: null,
      timestamp: null,
      frame: null
    };

    this._togglePlay = this._togglePlay.bind(this);
    this._onTimeSliderChange = this._onTimeSliderChange.bind(this);
    this._animate = this._animate.bind(this);
    this._lastTimestamp = null;

    openLogStream({
      onMetadata: metadata => {
        this.setState({
          metadata,
          // Convert Ms to seconds
          // Add a small number to enable look back for the first frame
          // TODO - remove when time window in xviz is customizable
          timestamp: metadata.start_time / 1000 + 0.3,
          startTime: metadata.start_time / 1000 + 0.3,
          endTime: metadata.end_time / 1000,
          synchronizer: new StreamSynchronizer(metadata.start_time / 1000, streamBuffer)
        });
      },
      onUpdate: timeslice => {
        timeslice.timestamp /= 1000;
        streamBuffer.insert(timeslice);
        if (!this.state.frame) {
          this._updateFrame(this.state.timestamp);
        }
      }
    });
  }

  _animate() {
    if (this.state.isPlaying) {
      const now = Date.now();
      const delta = Math.min(0.1, (now - this._lastUpdateTime) / 1000);

      const {timestamp, startTime, endTime} = this.state;
      let newTimestamp = timestamp + delta;
      if (newTimestamp > endTime) {
        newTimestamp = startTime;
      }
      this._updateFrame(newTimestamp);
      this._lastTimestamp = now;

      window.requestAnimationFrame(this._animate);
    }
  }

  _updateFrame(timestamp) {
    const {synchronizer, metadata} = this.state;
    synchronizer.setTime(timestamp);
    const frame = synchronizer.getCurrentFrame(metadata.streams);
    this.setState({timestamp, frame});
  }

  _togglePlay() {
    const isPlaying = !this.state.isPlaying;
    this._lastUpdateTime = Date.now();
    this.setState({isPlaying});
    window.requestAnimationFrame(this._animate);
  }

  _onTimeSliderChange(evt) {
    if (this.state.isPlaying) {
      this.setState({isPlaying: false});
    }
    this._updateFrame(+evt.target.value);
  }

  render() {
    const {isPlaying, frame, timestamp, startTime, endTime} = this.state;

    if (timestamp === null) {
      return null;
    }

    return (
      <div id="container">

        <MapComponent {...frame} />

        <div id="timeline">
          <input type="range"
            value={timestamp}
            onChange={this._onTimeSliderChange}
            step={0.1}
            min={startTime}
            max={endTime} />
          <div>
            <span className="play-btn" onClick={this._togglePlay}>{isPlaying ? '❙❙' : '▶'}</span>
            <span>{new Date(timestamp).toUTCString()}</span>
          </div>
        </div>
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example/>, root);

