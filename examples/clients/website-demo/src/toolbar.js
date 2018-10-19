import React, {PureComponent} from 'react';
import {Tooltip, Popover} from 'monochrome-ui';

export default class Toolbar extends PureComponent {
  render() {
    return (
      <div id="toolbar">
        <Tooltip content="Video" position={Popover.BOTTOM}>
          <div className="btn">
            <i className="material-icons">videocam</i>
          </div>
        </Tooltip>
        <Tooltip content="Reset Camera" position={Popover.BOTTOM}>
          <div className="btn">
            <i className="material-icons">navigation</i>
          </div>
        </Tooltip>
        <Tooltip content="Select" position={Popover.BOTTOM}>
          <div className="btn">
            <i className="material-icons">center_focus_strong</i>
          </div>
        </Tooltip>
      </div>
    );
  }
}
