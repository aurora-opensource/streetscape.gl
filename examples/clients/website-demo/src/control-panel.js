import React, {PureComponent} from 'react';
import {StreamSettingsPanel} from 'streetscape.gl';
import {Tooltip} from 'monochrome-ui';

export default class ControlPanel extends PureComponent {
  render() {
    const {log} = this.props;

    return (
      <div id="control-panel">
        <header>Streetscape.gl</header>
        <main>
          <StreamSettingsPanel log={log} />
        </main>
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
