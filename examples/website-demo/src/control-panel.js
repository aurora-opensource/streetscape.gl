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
import {StreamSettingsPanel, XVIZPanel} from 'streetscape.gl';

import {XVIZ_PANEL_STYLE, STREAM_SETTINGS_STYLE} from './custom-styles';
import MetadataPanel from './metadata-panel';
import HelpPanel from './help-panel';

export default class ControlPanel extends PureComponent {
  state = {
    tab: 'streams'
  };

  _gotoTab(tab) {
    this.setState({tab, lastTab: this.state.tab});
  }

  _renderTabContent() {
    const {log, selectedLog, onLogChange} = this.props;

    switch (this.state.tab) {
      case 'streams':
        return <StreamSettingsPanel log={log} style={STREAM_SETTINGS_STYLE} />;

      case 'charts':
        return (
          <XVIZPanel
            log={log}
            name="Metrics"
            style={XVIZ_PANEL_STYLE}
            componentProps={{
              metric: {getColor: '#ccc'}
            }}
          />
        );

      case 'info':
        return <MetadataPanel log={log} selectedLog={selectedLog} onLogChange={onLogChange} />;

      case 'help':
        return <HelpPanel />;

      default:
        return null;
    }
  }

  _renderTab({id, description}) {
    const {tab} = this.state;

    return (
      <div className={`tab ${id === tab ? 'active' : ''}`} onClick={() => this._gotoTab(id)}>
        {id}
      </div>
    );
  }

  render() {
    const {tab} = this.state;

    const isHelpOpen = tab === 'help';

    return (
      <div id="control-panel">
        <header>
          <div id="logo">
            <a href="../index.html">
              <img src="assets/logo.png" />
            </a>
          </div>
          <div id="help-btn">
            {HelpPanel.renderButton({
              isOpen: isHelpOpen,
              onClick: () => this._gotoTab(isHelpOpen ? this.state.lastTab : 'help')
            })}
          </div>
          {!isHelpOpen && (
            <div id="tabs">
              {this._renderTab({id: 'info', description: 'Log Info'})}
              {this._renderTab({id: 'streams', description: 'Stream Settings'})}
              {this._renderTab({id: 'charts', description: 'Charts'})}
            </div>
          )}
        </header>

        <main>{this._renderTabContent()}</main>
      </div>
    );
  }
}
