/* global document */
import React, {PureComponent} from 'react';
import {Tooltip, Popover, Button} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE, TOOLBAR_BUTTON_STYLE} from './custom-styles';

export default class Toolbar extends PureComponent {
  componentDidMount() {
    document.addEventListener('keydown', this._onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown = evt => {
    switch (evt.keyCode) {
      case 86: {
        // V
        let {viewMode} = this.props.settings;
        if (viewMode === 'TOP_DOWN') {
          viewMode = 'PERSPECTIVE';
        } else if (viewMode === 'PERSPECTIVE') {
          viewMode = 'DRIVER';
        } else {
          viewMode = 'TOP_DOWN';
        }
        this._gotoViewMode(viewMode);
        break;
      }

      case 82: // R
        this._resetView();
        break;

      case 73: // I
        this._toggleTooltip(!this.props.settings.showTooltip);
        break;

      default:
    }
  };

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
          <Tooltip content="View" position={Popover.LEFT} style={TOOLTIP_STYLE}>
            <Button type={Button.MUTED} style={TOOLBAR_BUTTON_STYLE}>
              <i className="icon-camera_alt" />
            </Button>
          </Tooltip>
        </Popover>
        <Tooltip content="Reset Camera" position={Popover.LEFT} style={TOOLTIP_STYLE}>
          <Button type={Button.MUTED} style={TOOLBAR_BUTTON_STYLE} onClick={this._resetView}>
            <i className="icon-recenter" />
          </Button>
        </Tooltip>
        <Tooltip content="Get Info" position={Popover.LEFT} style={TOOLTIP_STYLE}>
          <Button
            type={Button.MUTED}
            style={TOOLBAR_BUTTON_STYLE}
            className={settings.showTooltip ? 'active' : ''}
            onClick={() => this._toggleTooltip(!settings.showTooltip)}
          >
            <i className="icon-cursor" />
          </Button>
        </Tooltip>
      </div>
    );
  }
}
