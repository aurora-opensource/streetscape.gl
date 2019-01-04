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
