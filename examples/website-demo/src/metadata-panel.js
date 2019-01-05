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

function extractLink(html) {
  const match = html.match(/href="(.*?)"/);
  return match && match[1];
}

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

    const hasLicenseInfo = metadata.log_info.source;

    return (
      <div id="log-info">
        <h4>Select Demo Log</h4>
        {this._renderLogSelector()}

        <h4>XVIZ Version</h4>
        <div>{metadata.version}</div>

        <h4>Log Start Time</h4>
        <div>{new Date(metadata.start_time * 1000).toJSON()}</div>

        <h4>Log End Time</h4>
        <div>{new Date(metadata.end_time * 1000).toJSON()}</div>

        {hasLicenseInfo && (
          <div>
            <h4>Demo Description</h4>
            <div>
              <p>{metadata.log_info.description}</p>
              <p>
                <a href={extractLink(metadata.log_info['license link'])}>
                  {metadata.log_info.license}
                </a>
              </p>
            </div>

            <h4>Data Source</h4>
            <div>
              <p>
                <a href={extractLink(metadata.log_info.source.link)}>
                  {metadata.log_info.source.title}
                </a>
              </p>
              <p>{metadata.log_info.source.author}</p>
              <p dangerouslySetInnerHTML={{__html: metadata.log_info.source.copyright}} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

const getLogState = log => ({
  metadata: log.getMetadata()
});

export default connectToLog({getLogState, Component: MetadataPanel});
