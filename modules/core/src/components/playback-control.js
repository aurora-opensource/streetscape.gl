/* global window */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {PlaybackControl as MonochromePlaybackControl} from 'monochrome-ui';
import {getXvizSettings} from '@xviz/parser';

import connectToLog from './connect';

const MARKER_STYLE = {
  height: 3,
  background: '#ccc'
};

class PlaybackControl extends PureComponent {
  static propTypes = {
    timeScale: PropTypes.number
  };

  static defaultProps = {
    timeScale: 1
  };

  state = {
    isPlaying: false,
    lastUpdate: -1
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
    const {hiTimeResolution} = getXvizSettings();

    if (this.state.isPlaying) {
      const now = Date.now();
      const {startTime, endTime, timeScale, log, timestamp} = this.props;
      const {lastUpdate} = this.state;

      // avoid skipping frames - cap delta at resolution
      let timeDeltaMs = lastUpdate > 0 ? now - lastUpdate : 0;
      timeDeltaMs = Math.min(timeDeltaMs, hiTimeResolution * 1000);

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
    const {startTime, timeScale} = this.props;

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

    const markers = bufferRange && [
      {
        startTime: Math.max(bufferRange.start, startTime),
        endTime: Math.min(bufferRange.end, endTime),
        style: MARKER_STYLE
      }
    ];

    return (
      <MonochromePlaybackControl
        {...otherProps}
        markers={markers}
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
