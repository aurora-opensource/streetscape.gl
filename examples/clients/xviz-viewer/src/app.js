/* global document */
/* eslint-disable no-console */
import 'xviz-config';

import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {XVIZStreamLoader, LogViewer, PlaybackControl, FloatingMetrics, VIEW_MODES} from 'streetscape.gl';
import {Form} from 'monochrome-ui';

import {SETTINGS, MAP_STYLE, CAR} from './constants';

import './main.scss';

class Example extends PureComponent {
  state = {
    log: new XVIZStreamLoader({
      logGuid: 'mock',
      serverConfig: {
        defaultLogLength: 30000,
        serverUrl: 'ws://localhost:8081',
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
            mapStyle={MAP_STYLE}
            car={CAR}
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
        <div id="control-panel">
          <Form data={SETTINGS} values={this.state.settings} onChange={this._onSettingsChange} />
        </div>
        <FloatingMetrics log={log} formatDate={timeDiff => timeDiff / 1000} />
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
