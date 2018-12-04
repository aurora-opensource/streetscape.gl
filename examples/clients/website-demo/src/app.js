/* global document */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import {LogViewer, PlaybackControl, VIEW_MODE} from 'streetscape.gl';
import ControlPanel from './control-panel';
import CameraPanel from './camera-panel';
import Toolbar from './toolbar';

import {MAPBOX_TOKEN, MAP_STYLE, XVIZ_STYLE, CAR} from './constants';
import {getLogLoader, setLogConfig, getCustomLayers} from './utils';

import './stylesheets/main.scss';

const DEFAULT_LOG = {
  namespace: 'kitti',
  logName: '0005'
};

class Example extends PureComponent {
  state = {
    customLayers: getCustomLayers(DEFAULT_LOG.namespace),
    selectedLog: DEFAULT_LOG,
    log: getLogLoader(DEFAULT_LOG.namespace, DEFAULT_LOG.logName),

    settings: {
      viewMode: 'PERSPECTIVE'
    }
  };

  componentWillMount() {
    setLogConfig(DEFAULT_LOG.namespace);
  }

  componentDidMount() {
    this.state.log.connect();
  }

  _onLogChange = selectedLog => {
    if (selectedLog.namespace !== this.state.selectedLog.namespace) {
      setLogConfig(selectedLog.namespace);
    }

    this.setState(
      {
        customLayers: getCustomLayers(selectedLog.namespace),
        selectedLog,
        log: getLogLoader(selectedLog.namespace, selectedLog.logName)
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
          customLayers={this.state.customLayers || []}
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
