import React, {PureComponent} from 'react';
import {connectToLog, VideoPanel} from 'streetscape.gl';
import {FloatPanel} from 'monochrome-ui';

class CameraPanel extends PureComponent {
  state = {
    stream: '/camera/image_02',
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
    const {panelState, stream} = this.state;

    return (
      <FloatPanel
        {...panelState}
        title="Camera"
        movable={true}
        minimizable={true}
        resizable={true}
        onUpdate={this._onUpdate}
      >
        <VideoPanel log={log} streamFilter={stream} width={panelState.width} timeTolerance={100} />
      </FloatPanel>
    );
  }
}

const getLogState = log => ({
  imageStreamNames: log.getImageStreamNames()
});

export default connectToLog({getLogState, Component: CameraPanel});
