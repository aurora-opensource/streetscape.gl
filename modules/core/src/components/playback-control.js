/* global window */
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {PlaybackControl as BasePlaybackControl} from 'monochrome-ui';
import {getXvizSettings} from '@xviz/parser';

import connectToLog from './connect';

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

  _onPlay = () => {
    this.setState({isPlaying: true, lastUpdate: Date.now()});
    window.requestAnimationFrame(this._animate);
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

      window.requestAnimationFrame(this._animate);
    }
  };

  _formatTick = x => {
    const {startTime, timeScale} = this.props;
    const deltaTimeS = (x - startTime) / timeScale / 1000;
    return BasePlaybackControl.formatTimeCode(deltaTimeS, '{mm}:{ss}');
  };

  render() {
    const {startTime, endTime, timestamp, ...otherProps} = this.props;

    if (!Number.isFinite(timestamp)) {
      return null;
    }

    return (
      <BasePlaybackControl
        formatTick={this._formatTick}
        {...otherProps}
        currentTime={timestamp}
        startTime={startTime}
        endTime={endTime}
        isPlaying={this.state.isPlaying}
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
  endTime: log.getLogEndTime()
});

export default connectToLog({getLogState, Component: PlaybackControl});
