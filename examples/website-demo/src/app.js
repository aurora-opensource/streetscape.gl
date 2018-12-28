/* global document */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {setXVIZConfig} from '@xviz/parser';
import {XVIZFileLoader, LogViewer, PlaybackControl, VIEW_MODE} from 'streetscape.gl';
import {ThemeProvider} from '@streetscape.gl/monochrome';

import ControlPanel from './control-panel';
import CameraPanel from './camera-panel';
import Toolbar from './toolbar';

import {MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR, LOGS} from './constants';
import {UI_THEME, PLAYBACK_CONTROL_STYLE, LOG_VIEWER_STYLE} from './custom-styles';

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
      timingsFilePath: `${logSettings.path}/0-frame.json`,
      getFilePath: index => `${logSettings.path}/${index + 1}-frame.glb`,
      worker: true,
      maxConcurrency: 4
    }).on('error', console.error); // eslint-disable-line

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

  _renderObjectLabel = ({id, object, isSelected}) => {
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
          style={LOG_VIEWER_STYLE}
          showTooltip={settings.showTooltip}
          viewMode={VIEW_MODE[settings.viewMode]}
          viewOffset={settings.viewOffset}
          onViewStateChange={this._onViewStateChange}
          renderObjectLabel={this._renderObjectLabel}
        />

        <div id="timeline">
          <PlaybackControl
            compact={true}
            style={PLAYBACK_CONTROL_STYLE}
            width="100%"
            log={log}
            formatTimestamp={x => new Date(x).toUTCString()}
          />
        </div>

        <ControlPanel selectedLog={selectedLog} onLogChange={this._onLogChange} log={log} />

        <Toolbar settings={settings} onSettingsChange={this._onSettingsChange} />

        <CameraPanel log={log} />
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
