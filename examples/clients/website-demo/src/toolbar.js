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
        <Tooltip content="Select a log" position={Popover.BOTTOM}>
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
      </div>
    );
  }
}
