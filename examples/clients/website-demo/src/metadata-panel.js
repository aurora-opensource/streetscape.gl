import React, {PureComponent} from 'react';
import {connectToLog} from 'streetscape.gl';

class MetadataPanel extends PureComponent {
  render() {
    const {metadata} = this.props;

    if (!metadata) {
      return null;
    }

    return (
      <div>
        <h5>Version</h5>
        <p>{metadata.version}</p>
        <h5>Log Start Time</h5>
        <p>{new Date(metadata.start_time).toJSON()}</p>
        <h5>Log End Time</h5>
        <p>{new Date(metadata.end_time).toJSON()}</p>
      </div>
    );
  }
}

const getLogState = log => ({
  metadata: log.getMetadata()
});

export default connectToLog({getLogState, Component: MetadataPanel});
