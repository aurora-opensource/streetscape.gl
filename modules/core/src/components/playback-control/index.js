/* global window */
import React, {PureComponent} from 'react';
// import PropTypes from 'prop-types';

import {getXVIZConfig, getXVIZSettings} from '@xviz/parser';
import DualPlaybackControl from './dual-playback-control';

import connectToLog from '../connect';

const TIME_SCALES = {
  seconds: 0.001,
  milliseconds: 1
};

class PlaybackControl extends PureComponent {
  static propTypes = {};

  static defaultProps = {};

  state = {
    isPlaying: false,
    lastUpdate: -1,
    timeScale: TIME_SCALES[getXVIZConfig().TIMESTAMP_FORMAT] || 1
  };

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animationFrame = null;

  _onPlay = () => {
    this.setState({isPlaying: true, lastUpdate: Date.now()});
    this._animationFrame = window.requestAnimationFrame(this._animate);
  };

  _onPause = () => {
    this.setState({isPlaying: false, lastUpdate: -1});
  };

  _onSeek = timestamp => {
    this.props.log.seek(timestamp);
    if (this.state.isPlaying) {
      this.setState({isPlaying: false});
    }
  };

  _onLookAheadChange = lookAhead => {
    this.props.log.setLookAhead(lookAhead);
  };

  _animate = () => {
    if (this.state.isPlaying) {
      const now = Date.now();
      const {startTime, endTime, bufferRange, log, timestamp} = this.props;
      const {lastUpdate, timeScale} = this.state;
      const {PLAYBACK_FRAME_RATE} = getXVIZSettings();

      // avoid skipping frames - cap delta at resolution
      let timeDeltaMs = lastUpdate > 0 ? now - lastUpdate : 0;
      timeDeltaMs = Math.min(timeDeltaMs, 1000 / PLAYBACK_FRAME_RATE);

      let newTimestamp = timestamp + timeDeltaMs * timeScale;
      if (newTimestamp > endTime) {
        newTimestamp = startTime;
      }

      // check buffer availability
      if (bufferRange.some(r => newTimestamp >= r[0] && newTimestamp <= r[1])) {
        log.seek(newTimestamp);
      } else {
        // buffer not yet loaded, pause and wait for the buffer to be loaded
      }

      this.setState({lastUpdate: now});
      this._animationFrame = window.requestAnimationFrame(this._animate);
    }
  };

  _formatTime = (x, formatter = null) => {
    const {startTime} = this.props;
    const {timeScale} = this.state;

    if (formatter) {
      return formatter(x, startTime);
    }

    const deltaTimeS = (x - startTime) / timeScale / 1000;
    return DualPlaybackControl.formatTimeCode(deltaTimeS, '{mm}:{ss}');
  };

  _formatTick = x => {
    return this._formatTime(x, this.props.formatTick);
  };

  _formatTimestamp = x => {
    return this._formatTime(x, this.props.formatTimestamp);
  };

  _formatLookAhead = x => {
    const {formatLookAhead} = this.props;
    const {timeScale} = this.state;

    if (formatLookAhead) {
      return formatLookAhead(x);
    }

    const deltaTimeS = x / timeScale / 1000;
    return DualPlaybackControl.formatTimeCode(deltaTimeS, '{s}.{S}s');
  };

  render() {
    const {startTime, endTime, timestamp, lookAhead, bufferRange, ...otherProps} = this.props;

    if (!Number.isFinite(timestamp)) {
      return null;
    }

    const buffers = bufferRange.map(r => ({
      startTime: Math.max(r[0], startTime),
      endTime: Math.min(r[1], endTime)
    }));

    return (
      <DualPlaybackControl
        {...otherProps}
        bufferRange={buffers}
        currentTime={timestamp}
        lookAhead={lookAhead}
        startTime={startTime}
        endTime={endTime}
        isPlaying={this.state.isPlaying}
        formatTick={this._formatTick}
        formatTimestamp={this._formatTimestamp}
        formatLookAhead={this._formatLookAhead}
        onSeek={this._onSeek}
        onPlay={this._onPlay}
        onPause={this._onPause}
        onLookAheadChange={this._onLookAheadChange}
      />
    );
  }
}

const getLogState = log => ({
  timestamp: log.getCurrentTime(),
  lookAhead: log.getLookAhead(),
  startTime: log.getLogStartTime(),
  endTime: log.getLogEndTime(),
  bufferRange: log.getBufferRange()
});

export default connectToLog({getLogState, Component: PlaybackControl});
