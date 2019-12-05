import React, {PureComponent} from 'react';

// TODO(twojtasz): Add these as hideable panels
// import {
//   StreamSettingsPanel,
// } from 'streetscape.gl';

import {setXVIZConfig, getXVIZConfig} from '@xviz/parser';
import {
  LogViewer,
  PlaybackControl,
  XVIZPanel,
  VIEW_MODE
} from 'streetscape.gl';

import {Form} from '@streetscape.gl/monochrome';
import {
  XVIZ_CONFIG,
  APP_SETTINGS,
  MAPBOX_TOKEN,
  MAP_STYLE,
  XVIZ_STYLE,
  CAR,
  STYLES
} from './constants';

setXVIZConfig(XVIZ_CONFIG);

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;

function buildLoaderOptions() {
  const server = 'ws://localhost:3000';
  const worker = false;
  const pathname = ''; // '/scenario-circle';

  const options = {
    logGuid: 'mock',
    serverConfig: {
      defaultLogLength: 30,
      serverUrl: `${server}${pathname}`
    },
    worker: worker !== 'false',
    maxConcurrency: 4
  };

  return options;
}
import {XVIZStreamLoader} from 'streetscape.gl';

export class StreetscapeJupyter extends PureComponent {
  state = {
    log: new XVIZStreamLoader(buildLoaderOptions()),
    settings: {
      viewMode: 'TOP_DOWN',
      showTooltip: false
    },
    panels: [],
    // LogViewer perf stats
    statsSnapshot: {},
    // XVIZ Parser perf stats
    backlog: 'NA',
    dropped: 'NA',
    workers: {}
  };

  componentDidMount() {
    const {log} = this.state;
    log
      .on('ready', () => {
        const metadata = log.getMetadata();
        this.setState({
          panels: Object.keys((metadata && metadata.ui_config) || {})
        });
      })
      .on('error', console.error)
      .connect();
  }

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  render() {
    const {log, settings, panels} = this.state;
    const style = {
      container: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'rgb(250, 250, 250)'
      },
      controlPanel: {
        position: 'relative',
        zIndex: '1',
        width: 200,
        padding: 10,
        height: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'auto'
      },
      logPanel: { 
        flexGrow: '1',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      },
      timeline: {
        position: 'absolute',
        zIndex: '2',
        width: '100%',
        bottom: 0,
        left: 0
      }
    };

    return (
      <div id="container" style={style['container']}>
        <div id="control-panel" style={style['controlPanel']}>
          {panels.map(panelName => [
            <XVIZPanel key={panelName} log={log} name={panelName} />,
            <hr key={`${panelName}-divider`} />
          ])}
          <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
        </div>
        <div id="log-panel" style={style['logPanel']}>
          <div id="map-view">
            <LogViewer
              log={log}
              mapboxApiAccessToken={this.props.mapbox}
              mapStyle={MAP_STYLE}
              car={CAR}
              xvizStyles={XVIZ_STYLE}
              showTooltip={settings.showTooltip}
              viewMode={VIEW_MODE[settings.viewMode]}
              debug={payload => this.setState({statsSnapshot: payload})}
            />
          </div>
        </div>
        <div id="timeline" style={style['timeline']}>
          <PlaybackControl
            width="100%"
            log={log}
            formatTimestamp={x => new Date(x * TIMEFORMAT_SCALE).toUTCString()}
          />
        </div>
      </div>
    );
  }
}
