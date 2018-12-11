import React, {PureComponent} from 'react';
import {StreamSettingsPanel, XVIZPanel} from 'streetscape.gl';
import {Tooltip, Popover} from '@streetscape.gl/monochrome';

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
        return <XVIZPanel log={log} name="Metrics" style={XVIZ_PANEL_STYLE} />;

      case 'metadata':
        return <MetadataPanel log={log} selectedLog={selectedLog} onLogChange={onLogChange} />;

      default:
        return null;
    }
  }

  _renderTab({id, displayName, icon}) {
    const {tab} = this.state;

    return (
      <Tooltip content={displayName} position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
        <div className={`btn ${id === tab ? 'active' : ''}`} onClick={() => this._gotoTab(id)}>
          <i className={`icon-${icon}`} />
        </div>
      </Tooltip>
    );
  }

  render() {
    return (
      <div id="control-panel">
        <header>
          <div>
            <img src="images/logo.png" />
          </div>
          <div>
            {this._renderTab({id: 'metadata', displayName: 'Log Info', icon: 'content'})}
            {this._renderTab({id: 'streams', displayName: 'Stream Settings', icon: 'streams'})}
            {this._renderTab({id: 'charts', displayName: 'Charts', icon: 'car'})}
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
