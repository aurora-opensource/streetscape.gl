// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
