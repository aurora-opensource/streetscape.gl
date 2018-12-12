/* global document */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {setXVIZConfig} from '@xviz/parser';
import {XVIZFileLoader} from 'streetscape.gl';
import {ThemeProvider} from '@streetscape.gl/monochrome';

import ControlPanel from './control-panel';
import CameraPanel from './camera-panel';
import MapView from './map-view';
import Toolbar from './toolbar';
import HUD from './hud';

import {LOGS} from './constants';
import {UI_THEME} from './custom-styles';

import './stylesheets/main.scss';

class Example extends PureComponent {
  state = {
    ...this._loadLog(LOGS[0]),
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false
    }
  };

  componentDidMount() {
    this.state.log.connect();
  }

  _loadLog(logSettings) {
    setXVIZConfig(logSettings.xvizConfig);

    const loader = new XVIZFileLoader({
      timingsFilePath: `${path}/0-frame.json`,
      getFilePath: index => `${path}/${index + 1}-frame.glb`,
      worker: true,
      maxConcurrency: 4
    })
      .on('ready', () =>
        loader.updateStreamSettings({
          '/tracklets/label': false
        })
      )
      .on('error', console.error); // eslint-disable-line

    loader.connect();

    return {selectedLog: logSettings, log: loader};
  }

  _onLogChange = selectedLog => {
    this.setState(this._loadLog(selectedLog));
  };

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  _onViewStateChange = ({viewOffset}) => {
    this._onSettingsChange({viewOffset});
  };

  render() {
    const {log, selectedLog, settings} = this.state;

    return (
      <div id="container">
        <ControlPanel selectedLog={selectedLog} onLogChange={this._onLogChange} log={log} />

        <HUD log={log} />

        <MapView log={log} settings={settings} onViewStateChange={this._onViewStateChange} />

        <Toolbar settings={settings} onSettingsChange={this._onSettingsChange} />

        <CameraPanel log={log} videoAspectRatio={selectedLog.videoAspectRatio} />
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(
  <ThemeProvider theme={UI_THEME}>
    <Example />
  </ThemeProvider>,
  root
);
