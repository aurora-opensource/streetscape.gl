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

/* global document */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';

import {setXVIZConfig} from '@xviz/parser';
import {XVIZFileLoader} from 'streetscape.gl';
import {ThemeProvider} from '@streetscape.gl/monochrome';

import ControlPanel from './control-panel';
import CameraPanel from './camera-panel';
import MapView from './map-view';
import Timeline from './timeline';
import Toolbar from './toolbar';
import HUD from './hud';
import NotificationPanel from './notification-panel';
import isMobile from './is-mobile';

import {LOGS, MOBILE_NOTIFICATION} from './constants';
import {UI_THEME} from './custom-styles';

import './stylesheets/main.scss';

class Example extends PureComponent {
  state = {
    ...(!isMobile && this._loadLog(LOGS[0])),
    settings: {
      viewMode: 'PERSPECTIVE',
      showTooltip: false
    }
  };

  _loadLog(logSettings) {
    if (logSettings.xvizConfig) {
      setXVIZConfig(logSettings.xvizConfig);
    }

    const loader = new XVIZFileLoader({
      timingsFilePath: `${logSettings.path}/0-frame.json`,
      getFilePath: index => `${logSettings.path}/${index + 1}-frame.glb`,
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
    this.state.log.close();
    this.setState(this._loadLog(selectedLog));
  };

  _onSettingsChange = changedSettings => {
    this.setState({
      settings: {...this.state.settings, ...changedSettings}
    });
  };

  render() {
    if (isMobile) {
      return <NotificationPanel notification={MOBILE_NOTIFICATION} />;
    }

    const {log, selectedLog, settings} = this.state;

    return (
      <div id="container">
        <MapView log={log} settings={settings} onSettingsChange={this._onSettingsChange} />

        <ControlPanel selectedLog={selectedLog} onLogChange={this._onLogChange} log={log} />

        <HUD log={log} />

        <Timeline log={log} />

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
