/* global document */
import 'xviz-config';

import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {XVIZFileLoader, LogViewer, PlaybackControl, VIEW_MODE} from 'streetscape.gl';
import ControlPanel from './control-panel';
import CameraPanel from './camera-panel';
import Toolbar from './toolbar';
import BuildingLayer from './layers/building-layer/building-layer';

import {MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR} from './constants';
import {getLogPath} from './utils';

import './stylesheets/main.scss';

class Example extends PureComponent {
  /* eslint-disable no-console */
  state = {
    selectedLog: '0005',
    log: new XVIZFileLoader({
      timingsFilePath: `${getLogPath('kitti', '0005')}/0-frame.json`,
      getFilePath: index => `${getLogPath('kitti', '0005')}/${index + 1}-frame.glb`,
      worker: true,
      maxConcurrency: 4
    }).on('error', console.error), // eslint-disable-line

    settings: {
      viewMode: 'PERSPECTIVE'
    }
  };
  /* eslint-enable no-console */

  componentDidMount() {
    this.state.log.connect();
  }

  _onLogChange = selectedLog => {
    if (this.state.log) {
      this.state.log.close();
    }

    // const {dataPath, numberOfFrames} = log;
    this.setState(
      {
        selectedLog,
        log: new XVIZFileLoader({
          timingsFilePath: `${getLogPath('kitti', selectedLog)}/0-frame.json`,
          getFilePath: index => `${getLogPath('kitti', selectedLog)}/${index + 1}-frame.glb`,
          worker: true,
          maxConcurrency: 4
        }).on('error', console.error) // eslint-disable-line
      },
      () => this.state.log.connect()
    );
  };

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
    const {log, selectedLog, settings} = this.state;

    return (
      <div id="container">
        <LogViewer
          log={log}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle={MAP_STYLE}
          car={CAR}
          xvizStyles={XVIZ_STYLE}
          customLayers={[new BuildingLayer()]}
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

        <Toolbar
          selectedLog={selectedLog}
          onLogChange={this._onLogChange}
          onSettingsChange={this._onSettingsChange}
        />

        <CameraPanel log={log} />
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
