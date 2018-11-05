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
import {StreamSettingsPanel, XvizPanel} from 'streetscape.gl';
import {Tooltip, Popover} from 'monochrome-ui';

import MetadataPanel from './metadata-panel';

export default class ControlPanel extends PureComponent {
  state = {
    tab: 'streams'
  };

  _gotoTab(tab) {
    this.setState({tab});
  }

  _renderTabContent() {
    const {log} = this.props;

    switch (this.state.tab) {
      case 'streams':
        return <StreamSettingsPanel log={log} />;

      case 'charts':
        return <XvizPanel log={log} id="Metrics" />;

      case 'metadata':
        return <MetadataPanel log={log} />;

      default:
        return null;
    }
  }

  _renderTab({id, displayName, icon}) {
    const {tab} = this.state;

    return (
      <Tooltip content={displayName} position={Popover.BOTTOM}>
        <div className={`btn ${id === tab ? 'active' : ''}`} onClick={() => this._gotoTab(id)}>
          <i className="material-icons">{icon}</i>
        </div>
      </Tooltip>
    );
  }

  render() {
    return (
      <div id="control-panel">
        <header>
          <div>Streetscape.gl</div>
          <div>
            {this._renderTab({id: 'metadata', displayName: 'Log Info', icon: 'info'})}
            {this._renderTab({id: 'streams', displayName: 'Stream Settings', icon: 'toc'})}
            {this._renderTab({id: 'charts', displayName: 'Charts', icon: 'show_chart'})}
          </div>
        </header>

        <main>{this._renderTabContent()}</main>
        <footer>
          <Tooltip content="Help">
            <div className="btn">
              <i className="material-icons">help_outline</i>
            </div>
          </Tooltip>
        </footer>
      </div>
    );
  }
}
