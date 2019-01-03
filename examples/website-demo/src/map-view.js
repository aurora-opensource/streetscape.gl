/* global document */
import React, {PureComponent} from 'react';

import {LogViewer, PlaybackControl, VIEW_MODE} from 'streetscape.gl';

import {MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR} from './constants';
import {PLAYBACK_CONTROL_STYLE, LOG_VIEWER_STYLE} from './custom-styles';

const formatTimestamp = x => new Date(x).toUTCString();
const renderObjectLabel = ({id, object, isSelected}) => {
  const {classes} = object.base;

  if (!isSelected) {
    let type = 'car';
    if (classes.includes('Pedestrian')) {
      type = 'pedestrian';
    } else if (classes.includes('Cyclist')) {
      type = 'bike';
    }
    return (
      <div>
        <i className={`icon-${type}`} />
      </div>
    );
  }

  return (
    <div>
      <div>
        <b>id: {id.slice(-12)}</b>
      </div>
      <div>{classes.join(' ')}</div>
    </div>
  );
};

export default class MapView extends PureComponent {
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
    const {log, settings} = this.props;
    const {isPlaying} = this.state;

    return (
      <div id="map">
        <LogViewer
          log={log}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          car={CAR}
          xvizStyles={XVIZ_STYLE}
          style={LOG_VIEWER_STYLE}
          showTooltip={settings.showTooltip}
          viewMode={VIEW_MODE[settings.viewMode]}
          viewOffset={settings.viewOffset}
          onViewStateChange={this.props.onViewStateChange}
          renderObjectLabel={renderObjectLabel}
        />

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
      </div>
    );
  }
}
