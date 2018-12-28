import React, {PureComponent} from 'react';
import {StreamSettingsPanel, XVIZPanel} from 'streetscape.gl';
import {Tooltip} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE, XVIZ_PANEL_STYLE, STREAM_SETTINGS_STYLE} from './custom-styles';
import MetadataPanel from './metadata-panel';

export default class ControlPanel extends PureComponent {
  state = {
    tab: 'streams'
  };

  _gotoTab(tab) {
    this.setState({tab});
  }

  _renderTabContent() {
    const {log, selectedLog, onLogChange} = this.props;

    switch (this.state.tab) {
      case 'streams':
        return <StreamSettingsPanel log={log} style={STREAM_SETTINGS_STYLE} />;

      case 'charts':
        return (
          <XVIZPanel
            log={log}
            name="Metrics"
            style={XVIZ_PANEL_STYLE}
            componentProps={{
              metric: {getColor: '#ccc'}
            }}
          />
        );

      case 'info':
        return <MetadataPanel log={log} selectedLog={selectedLog} onLogChange={onLogChange} />;

      default:
        return null;
    }
  }

  _renderTab({id, description}) {
    const {tab} = this.state;

    return (
      <div className={`tab ${id === tab ? 'active' : ''}`} onClick={() => this._gotoTab(id)}>
        {id}
      </div>
    );
  }

  render() {
    return (
      <div id="control-panel">
        <header>
          <div id="logo">
            <img src="assets/logo.png" />
          </div>
          <div id="tabs">
            {this._renderTab({id: 'info', description: 'Log Info'})}
            {this._renderTab({id: 'streams', description: 'Stream Settings'})}
            {this._renderTab({id: 'charts', description: 'Charts'})}
          </div>
        </header>

        <main>{this._renderTabContent()}</main>
        <footer>
          <Tooltip content="Help" style={TOOLTIP_STYLE}>
            <div className="btn">
              <i className="icon-info" />
            </div>
          </Tooltip>
        </footer>
      </div>
    );
  }
}
