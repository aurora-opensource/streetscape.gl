import React, {PureComponent} from 'react';
import {XvizPanel} from 'streetscape.gl';
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
        title="Camera"
        className="camera-panel"
        movable={true}
        minimizable={true}
        resizable={true}
        onUpdate={this._onUpdate}
      >
        <XvizPanel log={log} id="Camera" />
      </FloatPanel>
    );
  }
}
