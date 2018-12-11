import React, {PureComponent} from 'react';
import {connectToLog} from 'streetscape.gl';
import {Dropdown} from '@streetscape.gl/monochrome';
import {LOGS} from './constants';

class MetadataPanel extends PureComponent {
  _renderLogSelector() {
    const {selectedLog} = this.props;

    const logs = LOGS.reduce((resMap, log) => {
      resMap[log.name] = log.name;
      return resMap;
    }, {});

    return (
      <div>
        <Dropdown
          value={selectedLog.name}
          data={logs}
          onChange={value => this.props.onLogChange(LOGS.find(log => log.name === value))}
        />
      </div>
    );
  }

  render() {
    const {metadata} = this.props;

    if (!metadata) {
      return null;
    }

    return (
      <div>
        <h4>Select a Log</h4>
        {this._renderLogSelector()}

        <h4>XVIZ Version</h4>
        <div>{metadata.version}</div>

        <h4>Log Start Time</h4>
        <div>{new Date(metadata.start_time).toJSON()}</div>

        <h4>Log End Time</h4>
        <div>{new Date(metadata.end_time).toJSON()}</div>
      </div>
    );
  }
}

const getLogState = log => ({
  metadata: log.getMetadata()
});

export default connectToLog({getLogState, Component: MetadataPanel});
