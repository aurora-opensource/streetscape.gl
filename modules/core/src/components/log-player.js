import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import {clamp} from 'math.gl';
import {getXvizSettings} from '@xviz/client';

import Core3DViewer from './core-3d-viewer';
import VIEW_MODES from '../constants/view-modes';

export default class LogPlayer extends PureComponent {
  static propTypes = {
    log: PropTypes.object,
    metadata: PropTypes.object,
    timestamp: PropTypes.number
  };

  render() {
    const {log, metadata, mapStyle, xvizStyle, car, viewMode = VIEW_MODES.PERSPECTIVE} = this.props;
    const timeWindow = getXvizSettings().TIME_WINDOW;

    if (!log || !metadata) {
      return null;
    }

    const timestamp = clamp(
      this.props.timestamp,
      metadata.start_time + timeWindow,
      metadata.end_time
    );
    log.setTime(timestamp);
    const frame = log.getCurrentFrame(metadata.streams);

    return (
      <Core3DViewer
        frame={frame}
        mapStyle={mapStyle}
        xvizStyle={xvizStyle}
        car={car}
        viewMode={viewMode}
      />
    );
  }
}
