/* global document */
import React, {PureComponent} from 'react';
import {Tooltip, Popover, Button} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE, TOOLBAR_MENU_STYLE, TOOLBAR_BUTTON_STYLE} from './custom-styles';

const VIEW_MODE = {
  TOP_DOWN: {desc: 'Top down (T)', icon: 'top'},
  PERSPECTIVE: {desc: 'Perspective (P)', icon: 'perspective'},
  DRIVER: {desc: 'Driver (D)', icon: 'driver'}
};

const noop = () => {};

export default class Toolbar extends PureComponent {
  componentDidMount() {
    document.addEventListener('keydown', this._onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  _onKeyDown = evt => {
    const key = String.fromCharCode(evt.keyCode);

    switch (key) {
      case 'T':
        this._gotoViewMode('TOP_DOWN');
        break;

      case 'P':
        this._gotoViewMode('PERSPECTIVE');
        break;

      case 'D':
        this._gotoViewMode('DRIVER');
        break;

      case 'R':
        this._resetView();
        break;

      case 'I':
        this._toggleTooltip(!this.props.settings.showTooltip);
        break;

      default:
    }
  };

  _gotoViewMode = viewMode => {
    this.props.onSettingsChange({viewMode});
  };

  _resetView = () => {
    this.props.onSettingsChange({viewOffset: {x: 0, y: 0, bearing: 0}});
  };

  _toggleTooltip = showTooltip => {
    this.props.onSettingsChange({showTooltip});
  };

  _renderViewButton(mode, opts = {}) {
    const {
      tooltip = VIEW_MODE[mode].desc,
      position = Popover.TOP,
      onClick = () => this._gotoViewMode(mode)
    } = opts;
    const isSelected = mode === this.props.settings.viewMode;

    return (
      <Tooltip key={mode} content={tooltip} position={position} style={TOOLTIP_STYLE}>
        <Button type={Button.MUTED} style={TOOLBAR_BUTTON_STYLE} onClick={onClick}>
          <i className={`icon-camera_${VIEW_MODE[mode].icon} ${isSelected ? 'selected' : ''}`}>
            <span className="path1" />
            <span className="path2" />
            <span className="path3" />
          </i>
        </Button>
      </Tooltip>
    );
  }

  _renderViewModeSelector = () => {
    return (
      <div className="menu">{Object.keys(VIEW_MODE).map(item => this._renderViewButton(item))}</div>
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
          style={TOOLBAR_MENU_STYLE}
        >
          {this._renderViewButton(settings.viewMode, {
            tooltip: 'Camera',
            position: Popover.LEFT,
            onClick: noop
          })}
        </Popover>
        <Tooltip content="Recenter Camera (R)" position={Popover.LEFT} style={TOOLTIP_STYLE}>
          <Button type={Button.MUTED} style={TOOLBAR_BUTTON_STYLE} onClick={this._resetView}>
            <i className="icon-recenter" />
          </Button>
        </Tooltip>
        <Tooltip content="Get Info (I)" position={Popover.LEFT} style={TOOLTIP_STYLE}>
          <Button
            type={Button.MUTED}
            style={TOOLBAR_BUTTON_STYLE}
            className={settings.showTooltip ? 'active' : ''}
            onClick={() => this._toggleTooltip(!settings.showTooltip)}
          >
            <i className="icon-select" />
          </Button>
        </Tooltip>
      </div>
    );
  }
}
