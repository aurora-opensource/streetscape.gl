import React, {PureComponent} from 'react';
import {XVIZPanel} from 'streetscape.gl';
import {FloatPanel} from 'monochrome-ui';

export default class CameraPanel extends PureComponent {
  state = {
    panelState: {
      x: 400,
      y: 50,
      width: 400,
      height: 121,
      minimized: false
    }
  };

  _onUpdate = panelState => {
    this.setState({panelState});
  };

  render() {
    const {log} = this.props;
    const {panelState} = this.state;

    return (
      <FloatPanel
        {...panelState}
        className="camera-panel"
        movable={true}
        minimizable={false}
        resizable={true}
        onUpdate={this._onUpdate}
      >
        <XVIZPanel log={log} name="Camera" />
      </FloatPanel>
    );
  }
}
