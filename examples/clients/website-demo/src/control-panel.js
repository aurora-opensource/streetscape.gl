import React, {PureComponent} from 'react';
import {StreamSettingsPanel, XvizPanel} from 'streetscape.gl';
import {Tooltip, Popover} from 'monochrome-ui';

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
        return <StreamSettingsPanel log={log} />;

      case 'charts':
        return <XvizPanel log={log} id="Metrics" />;

      case 'metadata':
        return <MetadataPanel log={log} />;

      default:
        return null;
    }
  }

  _renderTab({id, displayName, icon}) {
    const {tab} = this.state;

    return (
      <Tooltip content={displayName} position={Popover.BOTTOM}>
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
          <div>Streetscape.gl</div>
          <div>
            {this._renderTab({id: 'metadata', displayName: 'Log Info', icon: 'info'})}
            {this._renderTab({id: 'streams', displayName: 'Stream Settings', icon: 'toc'})}
            {this._renderTab({id: 'charts', displayName: 'Charts', icon: 'show_chart'})}
          </div>
        </header>

        <main>{this._renderTabContent()}</main>
        <footer>
          <Tooltip content="Help">
            <div className="btn">
              <i className="material-icons">help_outline</i>
            </div>
          </Tooltip>
        </footer>
      </div>
    );
  }
}
