/* global document */
import 'xviz-config';

import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {LogViewer, PlaybackControl, VIEW_MODE} from 'streetscape.gl';
import {ThemeProvider} from '@streetscape.gl/monochrome';

import ControlPanel from './control-panel';
import CameraPanel from './camera-panel';
import Toolbar from './toolbar';
import BuildingLayer from './layers/building-layer/building-layer';

import {MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR} from './constants';
import {UI_THEME, PLAYBACK_CONTROL_STYLE} from './styles';
import {getLogLoader} from './utils';

import './stylesheets/main.scss';

const DEFAULT_LOG = {
  namespace: 'kitti',
  logName: '0005'
};

class Example extends PureComponent {
  state = {
    selectedLog: DEFAULT_LOG,
    log: getLogLoader(DEFAULT_LOG.namespace, DEFAULT_LOG.logName),

    settings: {
      viewMode: 'PERSPECTIVE'
    }
  };

  componentDidMount() {
    this.state.log.connect();
  }

  _onLogChange = selectedLog => {
    const logState = {
      ...this.state.selectedLog,
      ...selectedLog
    };

    this.setState(
      {
        selectedLog: logState,
        log: getLogLoader(logState.namespace, logState.logName)
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
            compact={true}
            style={PLAYBACK_CONTROL_STYLE}
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

render(
  <ThemeProvider theme={UI_THEME}>
    <Example />
  </ThemeProvider>,
  root
);
