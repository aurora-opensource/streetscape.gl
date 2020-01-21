// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';

import {StreamSettingsPanel} from 'streetscape.gl';

import {setXVIZConfig, getXVIZConfig} from '@xviz/parser';
import {LogViewer, PlaybackControl, XVIZPanel, VIEW_MODE} from 'streetscape.gl';

import {Form, Button} from '@streetscape.gl/monochrome';
import {XVIZ_CONFIG, APP_SETTINGS, MAP_STYLE, XVIZ_STYLE, CAR, STYLES} from './constants';

setXVIZConfig(XVIZ_CONFIG);

const TIMEFORMAT_SCALE = getXVIZConfig().TIMESTAMP_FORMAT === 'seconds' ? 1000 : 1;

import {XVIZStreamLoader} from 'streetscape.gl';

class StreetscapeJupyterComponent extends PureComponent {
  state = {
    log: null,
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
    this._loadLog();
  }

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  _setupStream() {
    const {port, log} = this.props;
    const server = `ws://localhost:${port}`;
    const worker = false;

    return {
      logGuid: log,
      serverConfig: {
        defaultLogLength: 30,
        serverUrl: `${server}`
      },
      worker: worker !== 'false',
      maxConcurrency: 4
    };
  }

  _loadLog = () => {
    let {log} = this.state;
    if (log) {
      log.close();
    }

    log = new XVIZStreamLoader(this._setupStream());
    log
      .on('ready', () => {
        const metadata = log.getMetadata();
        this.setState({
          panels: Object.keys((metadata && metadata.ui_config) || {})
        });
      })
      .on('error', console.error)
      .connect();

    this.setState({log});
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
          <Button onClick={this._loadLog}>Reload</Button>
          {panels.map(panelName => [
            <XVIZPanel key={panelName} log={log} name={panelName} />,
            <hr key={`${panelName}-divider`} />
          ])}
          <Form
            data={APP_SETTINGS}
            values={this.state.settings}
            onChange={this._onSettingsChange}
          />
          <StreamSettingsPanel log={log} />
        </div>
        <div id="log-panel" style={style['logPanel']}>
          <div id="map-view">
            <LogViewer
              log={log}
              mapboxApiAccessToken={this.props.mapboxAccessToken}
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

const mapStateToProps = (state /*, ownProps*/) => {
  return {
    log: state.log,
    port: state.port,
    mapboxAccessToken: state.mapboxAccessToken
  };
};

export const StreetscapeJupyter = connect(mapStateToProps)(StreetscapeJupyterComponent);
