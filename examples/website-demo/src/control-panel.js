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
import {Tooltip, Popover} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE, XVIZ_PANEL_STYLE, STREAM_SETTINGS_STYLE} from './custom-styles';
import MetadataPanel from './metadata-panel';

export default class ControlPanel extends PureComponent {
  state = {
    tab: 'streams'
  };

  _gotoTab(tab) {
    this.setState({tab});
  }

  _renderTabContent() {
    const {log, selectedLog, onLogChange} = this.props;

    switch (this.state.tab) {
      case 'streams':
        return <StreamSettingsPanel log={log} style={STREAM_SETTINGS_STYLE} />;

      case 'charts':
        return <XVIZPanel log={log} name="Metrics" style={XVIZ_PANEL_STYLE} />;

      case 'metadata':
        return <MetadataPanel log={log} selectedLog={selectedLog} onLogChange={onLogChange} />;

      default:
        return null;
    }
  }

  _renderTab({id, displayName, icon}) {
    const {tab} = this.state;

    return (
      <Tooltip content={displayName} position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
        <div className={`btn ${id === tab ? 'active' : ''}`} onClick={() => this._gotoTab(id)}>
          <i className={`icon-${icon}`} />
        </div>
      </Tooltip>
    );
  }

  render() {
    return (
      <div id="control-panel">
        <header>
          <div>
            <img src="assets/logo.png" />
          </div>
          <div>
            {this._renderTab({id: 'metadata', displayName: 'Log Info', icon: 'content'})}
            {this._renderTab({id: 'streams', displayName: 'Stream Settings', icon: 'streams'})}
            {this._renderTab({id: 'charts', displayName: 'Charts', icon: 'car'})}
          </div>
        </header>

        <main>{this._renderTabContent()}</main>
        <footer>
          <Tooltip content="Help" style={TOOLTIP_STYLE}>
            <div className="btn">
              <i className="icon-info" />
            </div>
          </Tooltip>
        </footer>
      </div>
    );
  }
}
