/* global window */
import React, {PureComponent} from 'react';
import {XVIZPanel} from 'streetscape.gl';
import {FloatPanel} from '@streetscape.gl/monochrome';

import {XVIZ_PANEL_STYLE, FLOAT_PANEL_STYLE} from './custom-styles';

const TITLE_HEIGHT = 28;

export default class CameraPanel extends PureComponent {
  state = {
    panelState: {
      x: window.innerWidth - 420,
      y: 20,
      width: 400,
      height: 148,
      minimized: false
    }
  };

  componentWillReceiveProps(nextProps) {
    const {panelState} = this.state;
    if (this.props.videoAspectRatio !== nextProps.videoAspectRatio) {
      this.setState({
        panelState: {
          ...panelState,
          height: panelState.width / nextProps.videoAspectRatio + TITLE_HEIGHT
        }
      });
    }
  }

  _onUpdate = panelState => {
    const {videoAspectRatio} = this.props;
    this.setState({
      panelState: {
        ...panelState,
        height: panelState.width / videoAspectRatio + TITLE_HEIGHT
      }
    });
  };

  render() {
    const {log} = this.props;
    const {panelState} = this.state;

    return (
      <FloatPanel
        {...panelState}
        movable={true}
        minimizable={false}
        resizable={true}
        onUpdate={this._onUpdate}
        style={FLOAT_PANEL_STYLE}
      >
        <XVIZPanel log={log} name="Camera" style={XVIZ_PANEL_STYLE} />
      </FloatPanel>
    );
  }
}
