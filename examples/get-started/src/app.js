/* global document, console */
/* eslint-disable no-console, no-unused-vars, no-undef */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {setXVIZConfig, setXVIZSettings} from '@xviz/parser';
import {LogViewer, PlaybackControl, XVIZPanel, VIEW_MODE} from 'streetscape.gl';
import {Form} from '@streetscape.gl/monochrome';

import {
  XVIZ_CONFIG,
  XVIZ_SETTINGS,
  APP_SETTINGS,
  MAPBOX_TOKEN,
  MAP_STYLE,
  XVIZ_STYLE,
  CAR
} from './constants';

setXVIZConfig(XVIZ_CONFIG);
setXVIZSettings(XVIZ_SETTINGS);

// __IS_STREAMING__ is defined in webpack.config.js
const exampleLog = require(__IS_STREAMING__ ? './log-from-stream' : './log-from-file').default;

class Example extends PureComponent {
  state = {
    log: exampleLog.on('error', console.error),
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
        <div id="control-panel">
          <XVIZPanel log={log} name="Camera" />
          <hr />
          <XVIZPanel log={log} name="Metrics" />
          <hr />
          <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
        </div>
        <div id="log-panel">
          <div id="map-view">
            <LogViewer
              log={log}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              mapStyle={MAP_STYLE}
              car={CAR}
              xvizStyles={XVIZ_STYLE}
              viewMode={VIEW_MODE[settings.viewMode]}
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
      </div>
    );
  }
}

render(<Example />, document.getElementById('app'));
