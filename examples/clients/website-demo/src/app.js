/* global document */
/* eslint-disable no-console */
import 'xviz-config';

import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {
  XVIZFileLoader,
  LogViewer,
  PlaybackControl,
  // XvizPanel,
  // VideoPanel,
  VIEW_MODES
} from 'streetscape.gl';
// import {Form} from 'monochrome-ui';

import {MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR} from './constants';

import './main.scss';

class Example extends PureComponent {
  state = {
    log: new XVIZFileLoader({
      logGuid: 'mock',
      serverConfig: {
        numberOfFrames: 155,
        getFilePath: index => `/kitti/2011_09_26/2011_09_26_drive_0005_sync/${index + 1}-frame.glb`,
        worker: require.resolve('./stream-data-worker'),
        maxConcurrency: 4
      }
    }).on('error', console.error), // eslint-disable-line

    settings: {
      viewMode: 'PERSPECTIVE'
    }
  };

  componentDidMount() {
    this.state.log.connect();
  }

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  render() {
    const {log, settings} = this.state;

    return (
      <div id="container">
        <div id="map-view">
          <LogViewer
            log={log}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            mapStyle={MAP_STYLE}
            car={CAR}
            xvizStyles={XVIZ_STYLE}
            viewMode={VIEW_MODES[settings.viewMode]}
          />
        </div>
        <div id="timeline">
          <PlaybackControl
            width="100%"
            log={log}
            formatTimestamp={x => new Date(x).toUTCString()}
          />
        </div>
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
