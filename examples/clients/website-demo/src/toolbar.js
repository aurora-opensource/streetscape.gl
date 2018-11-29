import React, {PureComponent} from 'react';
import {Tooltip, Popover, Dropdown} from 'monochrome-ui';

import {LOGS} from './constants';

export default class Toolbar extends PureComponent {
  _gotoViewMode = viewMode => {
    this.props.onChange({viewMode});
    this._viewModePopover._hidePopover();
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

    const data = {};
    // only support kitti logs for now
    LOGS.kitti.logs.forEach(log => {
      // TODO - use display name from metadata
      data[log] = log;
    });

    return <Dropdown value={selectedLog} data={data} onChange={this.props.onLogChange} />;
  }

  render() {
    return (
      <div id="toolbar">
        <Popover
          content={this._renderViewModeSelector}
          trigger={Popover.CLICK}
          arrowSize={0}
          ref={ref => {
            this._viewModePopover = ref;
          }}
        >
          <Tooltip content="View" position={Popover.BOTTOM}>
            <div className="btn">
              <i className="material-icons">videocam</i>
            </div>
          </Tooltip>
        </Popover>
        <Tooltip content="Reset Camera" position={Popover.BOTTOM}>
          <div className="btn" onClick={this._resetView}>
            <i className="material-icons">center_focus_strong</i>
          </div>
        </Tooltip>
        <Tooltip content="Select" position={Popover.BOTTOM}>
          <div className="btn">
            <i className="material-icons">near_me</i>
          </div>
        </Tooltip>
        <Tooltip content="Select a log" position={Popover.BOTTOM}>
          {this._renderLogSelector()}
        </Tooltip>
      </div>
    );
  }
}
