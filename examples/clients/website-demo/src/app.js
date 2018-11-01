/* global document */
/* eslint-disable no-console */
import 'xviz-config';

import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {XVIZFileLoader, LogViewer, PlaybackControl, VIEW_MODES} from 'streetscape.gl';

import ControlPanel from './control-panel';
import CameraPanel from './camera-panel';
import Toolbar from './toolbar';

import {MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR} from './constants';

import './stylesheets/main.scss';

class Example extends PureComponent {
  state = {
    log: new XVIZFileLoader({
      numberOfFrames: 155,
      getFilePath: index => `/kitti/2011_09_26/2011_09_26_drive_0005_sync/${index + 1}-frame.glb`,
      worker: require.resolve('./stream-data-worker'),
      maxConcurrency: 4
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

  _onViewStateChange = ({viewOffset}) => {
    this._onSettingsChange({viewOffset});
  };

  _renderObjectLabel = ({id, object}) => {
    return (
      <div>
        <div>
          <b>id: {id.slice(-12)}</b>
        </div>
        <div>{object.base.classes.join(' ')}</div>
      </div>
    );
  };

  render() {
    const {log, settings} = this.state;

    return (
      <div id="container">
        <LogViewer
          log={log}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          car={CAR}
          xvizStyles={XVIZ_STYLE}
          viewMode={VIEW_MODE[settings.viewMode]}
          viewOffset={settings.viewOffset}
          onViewStateChange={this._onViewStateChange}
          renderObjectLabel={this._renderObjectLabel}
          objectLabelColor="#fff"
        />

        <div id="timeline">
          <PlaybackControl
            padding={{top: 12, bottom: 12, left: 48, right: 24}}
            width="100%"
            log={log}
            formatTimestamp={x => new Date(x).toUTCString()}
          />
        </div>

        <ControlPanel log={log} />

        <Toolbar onChange={this._onSettingsChange} />

        <CameraPanel log={log} />
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
