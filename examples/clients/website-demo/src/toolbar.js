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
import {Tooltip, Popover, Dropdown} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE} from './custom-styles';
import {LOGS} from './constants';

export default class Toolbar extends PureComponent {
  _gotoViewMode = viewMode => {
    this.props.onSettingsChange({viewMode});
    // this._viewModePopover._hidePopover();
  };

  _resetView = () => {
    this.props.onSettingsChange({viewOffset: {x: 0, y: 0, bearing: 0}});
  };

  _renderViewModeSelector = () => {
    return (
      <div className="menu">
        <div className="menu--item" onClick={() => this._gotoViewMode('TOP_DOWN')}>
          Top-down
        </div>
        <div className="menu--item" onClick={() => this._gotoViewMode('PERSPECTIVE')}>
          Perspective
        </div>
        <div className="menu--item" onClick={() => this._gotoViewMode('DRIVER')}>
          Driver
        </div>
      </div>
    );
  };

  _renderLogSelector() {
    const {selectedLog} = this.props;

    // only support kitti logs for now
    const namespaces = Object.keys(LOGS).reduce((resMap, namespace) => {
      resMap[namespace] = namespace;
      return resMap;
    }, {});

    const logs = LOGS[selectedLog.namespace].logs.reduce((resMap, log) => {
      resMap[log] = log;
      return resMap;
    }, {});

    return (
      <div id="log-selector">
        <Dropdown
          value={selectedLog.namespace}
          data={namespaces}
          onChange={namespace =>
            this.props.onLogChange({
              namespace,
              logName: LOGS[namespace].logs[0]
            })
          }
        />
        <Dropdown
          value={selectedLog.logName}
          data={logs}
          onChange={logName => this.props.onLogChange({logName})}
        />
      </div>
    );
  }

  render() {
    return (
      <div id="toolbar">
        <Tooltip content="Select a log" position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
          {this._renderLogSelector()}
        </Tooltip>
        <Popover
          content={this._renderViewModeSelector}
          trigger={Popover.CLICK}
          arrowSize={0}
          ref={ref => {
            this._viewModePopover = ref;
          }}
        >
          <Tooltip content="View" position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
            <div className="btn">
              <i className="material-icons">videocam</i>
            </div>
          </Tooltip>
        </Popover>
        <Tooltip content="Reset Camera" position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
          <div className="btn" onClick={this._resetView}>
            <i className="material-icons">center_focus_strong</i>
          </div>
        </Tooltip>
        <Tooltip content="Select" position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
          <div className="btn">
            <i className="material-icons">near_me</i>
          </div>
        </Tooltip>
      </div>
    );
  }
}
