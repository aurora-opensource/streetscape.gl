import React, {PureComponent} from 'react';
import {Tooltip, Popover} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE} from './custom-styles';

export default class Toolbar extends PureComponent {
  _gotoViewMode = viewMode => {
    this.props.onSettingsChange({viewMode});
    // this._viewModePopover._hidePopover();
  };

  _resetView = () => {
    this.props.onSettingsChange({viewOffset: {x: 0, y: 0, bearing: 0}});
  };

  _toggleTooltip = showTooltip => {
    this.props.onSettingsChange({showTooltip});
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

  render() {
    const {settings} = this.props;

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
          <Tooltip content="View" position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
            <div className="btn">
              <i className="icon-camera_alt" />
            </div>
          </Tooltip>
        </Popover>
        <Tooltip content="Reset Camera" position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
          <div className="btn" onClick={this._resetView}>
            <i className="icon-recenter" />
          </div>
        </Tooltip>
        <Tooltip content="Get Info" position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
          <div
            className={`btn ${settings.showTooltip ? 'active' : ''}`}
            onClick={() => this._toggleTooltip(!settings.showTooltip)}
          >
            <i className="icon-cursor" />
          </div>
        </Tooltip>
      </div>
    );
  }
}
