import React, {PureComponent} from 'react';
import {XVIZPanel} from 'streetscape.gl';
import {FloatPanel} from '@streetscape.gl/monochrome';

import {XVIZ_PANEL_STYLE, FLOAT_PANEL_STYLE} from './custom-styles';

const ASPECT_RATIO = 10 / 3;
const TITLE_HEIGHT = 26;

export default class CameraPanel extends PureComponent {
  state = {
    panelState: {
      x: 400,
      y: 20,
      width: 400,
      height: 400 / ASPECT_RATIO + TITLE_HEIGHT,
      minimized: false
    }
  };

  _onUpdate = panelState => {
    this.setState({
      panelState: {...panelState, height: panelState.width / ASPECT_RATIO + TITLE_HEIGHT}
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
