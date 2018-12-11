import React, {PureComponent} from 'react';
import {XVIZPanel} from 'streetscape.gl';
import {FloatPanel} from '@streetscape.gl/monochrome';

import {XVIZ_PANEL_STYLE, FLOAT_PANEL_STYLE} from './custom-styles';

const ASPECT_RATIO = 10 / 3;

export default class CameraPanel extends PureComponent {
  state = {
    panelState: {
      x: 800,
      y: 50,
      width: 400,
      height: 120,
      minimized: false
    }
  };

  _onUpdate = panelState => {
    this.setState({panelState: {...panelState, width: panelState.height * ASPECT_RATIO}});
  };

  render() {
    const {log} = this.props;
    const {panelState} = this.state;

    return (
      <FloatPanel
        {...panelState}
        title="Camera"
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
