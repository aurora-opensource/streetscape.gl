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

    const logs = LOGS.reduce((resMap, log) => {
      resMap[log.name] = log.name;
      return resMap;
    }, {});

    return (
      <div id="log-selector">
        <Dropdown
          value={selectedLog.name}
          data={logs}
          onChange={value => this.props.onLogChange(LOGS.find(log => log.name === value))}
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
