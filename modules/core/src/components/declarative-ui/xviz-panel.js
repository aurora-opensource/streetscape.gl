import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import XVIZContainer from './xviz-container';
import XVIZMetricComponent from './xviz-metric-component';
import XVIZPlotComponent from './xviz-plot-component';
import XVIZTableComponent from './xviz-table-component';
import XVIZVideoComponent from './xviz-video-component';

import connectToLog from '../connect';

// xviz type to component map
const DEFAULT_COMPONENTS = {
  container: XVIZContainer,
  // table
  // tree_table
  metric: XVIZMetricComponent,
  plot: XVIZPlotComponent,
  video: XVIZVideoComponent,
  table: XVIZTableComponent,
  treetable: XVIZTableComponent
};

class XVIZPanel extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    components: PropTypes.object,
    style: PropTypes.object
  };

  static defaultProps = {
    components: DEFAULT_COMPONENTS
  };

  _renderItem = (item, i) => {
    const {components, log} = this.props;
    const XVIZComponent = components[item.type] || DEFAULT_COMPONENTS[item.type];

    if (!XVIZComponent) {
      return null;
    }

    return (
      <XVIZComponent key={i} {...item} log={log}>
        {item.children && item.children.map(this._renderItem)}
      </XVIZComponent>
    );
  };

  render() {
    const {metadata, id, style} = this.props;

    const data = metadata && metadata.ui_config && metadata.ui_config[id];

    return data ? (
      <div className="xviz-panel" style={style}>
        {data.children && data.children.map(this._renderItem)}
      </div>
    ) : null;
  }
}

const getLogState = log => ({
  metadata: log.getMetadata()
});

export default connectToLog({getLogState, Component: XVIZPanel});
