import React, {PureComponent} from 'react';
import {StreamSettingsPanel, XVIZPanel} from 'streetscape.gl';
import {Tooltip, Popover} from '@streetscape.gl/monochrome';

import {TOOLTIP_STYLE, PANEL_STYLE, STREAM_SETTINGS_STYLE} from './styles';
import MetadataPanel from './metadata-panel';

export default class ControlPanel extends PureComponent {
  state = {
    tab: 'streams'
  };

  _gotoTab(tab) {
    this.setState({tab});
  }

  _renderTabContent() {
    const {log} = this.props;

    switch (this.state.tab) {
      case 'streams':
        return <StreamSettingsPanel log={log} style={STREAM_SETTINGS_STYLE} />;

      case 'charts':
        return <XVIZPanel log={log} name="Metrics" style={PANEL_STYLE} />;

      case 'metadata':
        return <MetadataPanel log={log} />;

      default:
        return null;
    }
  }

  _renderTab({id, displayName, icon}) {
    const {tab} = this.state;

    return (
      <Tooltip content={displayName} position={Popover.BOTTOM} style={TOOLTIP_STYLE}>
        <div className={`btn ${id === tab ? 'active' : ''}`} onClick={() => this._gotoTab(id)}>
          <i className="material-icons">{icon}</i>
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
            {this._renderTab({id: 'metadata', displayName: 'Log Info', icon: 'info'})}
            {this._renderTab({id: 'streams', displayName: 'Stream Settings', icon: 'toc'})}
            {this._renderTab({id: 'charts', displayName: 'Charts', icon: 'show_chart'})}
          </div>
        </header>

        <main>{this._renderTabContent()}</main>
        <footer>
          <Tooltip content="Help" style={TOOLTIP_STYLE}>
            <div className="btn">
              <i className="material-icons">help_outline</i>
            </div>
          </Tooltip>
        </footer>
      </div>
    );
  }
}
