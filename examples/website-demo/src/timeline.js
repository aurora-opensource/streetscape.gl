/* global document */
import React, {PureComponent} from 'react';
import {PlaybackControl} from 'streetscape.gl';

import {PLAYBACK_CONTROL_STYLE} from './custom-styles';

const formatTimestamp = x => new Date(x * 1000).toUTCString();

export default class Timeline extends PureComponent {
  state = {
    isPlaying: false
  };

  componentDidMount() {
    document.addEventListener('keydown', this._onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _seek(delta) {
    const {log} = this.props;
    const startTime = log.getLogStartTime();
    const endTime = log.getLogEndTime();
    let timestamp = log.getCurrentTime();

    if (Number.isFinite(timestamp)) {
      timestamp += delta;
      if (timestamp < startTime) {
        timestamp = startTime;
      }
      if (timestamp > endTime) {
        timestamp = endTime;
      }
      log.seek(timestamp);
    }
  }

  _onPlay = () => this.setState({isPlaying: true});
  _onPause = () => this.setState({isPlaying: false});

  _onKeyDown = evt => {
    switch (evt.keyCode) {
      case 32: // space
        if (this.state.isPlaying) {
          this._onPause();
        } else {
          this._onPlay();
        }
        break;

      case 37: // left
        this._seek(-100);
        break;

      case 39: // right
        this._seek(100);
        break;

      default:
    }
  };

  render() {
    const {log} = this.props;
    const {isPlaying} = this.state;

    return (
      <div id="timeline">
        <PlaybackControl
          compact={true}
          style={PLAYBACK_CONTROL_STYLE}
          isPlaying={isPlaying}
          onPlay={this._onPlay}
          onPause={this._onPause}
          onSeek={this._onSeek}
          width="100%"
          log={log}
          formatTimestamp={formatTimestamp}
        />
      </div>
    );
  }
}
