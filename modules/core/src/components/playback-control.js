/* global window */
import React, {PureComponent} from 'react';
// import PropTypes from 'prop-types';

import {PlaybackControl as MonochromePlaybackControl} from 'monochrome-ui';
import {getXVIZConfig, getXVIZSettings} from '@xviz/parser';

import connectToLog from './connect';

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

  _animate = () => {
    if (this.state.isPlaying) {
      const now = Date.now();
      const {startTime, endTime, log, timestamp} = this.props;
      const {lastUpdate, timeScale} = this.state;
      const {PLAYBACK_FRAME_RATE} = getXVIZSettings();

      // avoid skipping frames - cap delta at resolution
      let timeDeltaMs = lastUpdate > 0 ? now - lastUpdate : 0;
      timeDeltaMs = Math.min(timeDeltaMs, 1000 / PLAYBACK_FRAME_RATE);

      // TODO: check buffer

      let newTimestamp = timestamp + timeDeltaMs * timeScale;
      if (newTimestamp > endTime) {
        newTimestamp = startTime;
      }
      log.seek(newTimestamp);

      this.setState({lastUpdate: now});

      this._animationFrame = window.requestAnimationFrame(this._animate);
    }
  };

  _formatTime = (x, formatter) => {
    const {startTime} = this.props;
    const {timeScale} = this.state;

    if (formatter) {
      return formatter(x, startTime);
    }

    const deltaTimeS = (x - startTime) / timeScale / 1000;
    return MonochromePlaybackControl.formatTimeCode(deltaTimeS, '{mm}:{ss}');
  };

  render() {
    const {
      startTime,
      endTime,
      timestamp,
      formatTick,
      formatTimestamp,
      bufferRange,
      ...otherProps
    } = this.props;

    if (!Number.isFinite(timestamp)) {
      return null;
    }

    const buffers = bufferRange.map(r => ({
      startTime: Math.max(r[0], startTime),
      endTime: Math.min(r[1], endTime)
    }));

    return (
      <MonochromePlaybackControl
        {...otherProps}
        bufferRange={buffers}
        currentTime={timestamp}
        startTime={startTime}
        endTime={endTime}
        isPlaying={this.state.isPlaying}
        formatTick={x => this._formatTime(x, formatTick)}
        formatTimestamp={x => this._formatTime(x, formatTimestamp)}
        onSeek={this._onSeek}
        onPlay={this._onPlay}
        onPause={this._onPause}
      />
    );
  }
}

const getLogState = log => ({
  timestamp: log.getCurrentTime(),
  startTime: log.getLogStartTime(),
  endTime: log.getLogEndTime(),
  bufferRange: log.getBufferRange()
});

export default connectToLog({getLogState, Component: PlaybackControl});
