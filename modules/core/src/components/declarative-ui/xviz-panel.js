import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import XvizContainer from './xviz-container';
import XvizMetricComponent from './xviz-metric-component';
import XvizPlotComponent from './xviz-plot-component';
import XvizTableComponent from './xviz-table-component';
import XvizVideoComponent from './xviz-video-component';

import connectToLog from '../connect';

// xviz type to component map
const DEFAULT_COMPONENTS = {
  container: XvizContainer,
  // table
  // tree_table
  metric: XvizMetricComponent,
  plot: XvizPlotComponent,
  video: XvizVideoComponent,
  table: XvizTableComponent,
  treetable: XvizTableComponent
};

class XvizPanel extends PureComponent {
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
    const XvizComponent = components[item.type] || DEFAULT_COMPONENTS[item.type];

    if (!XvizComponent) {
      return null;
    }

    return (
      <XvizComponent key={i} {...item} log={log}>
        {item.children && item.children.map(this._renderItem)}
      </XvizComponent>
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

export default connectToLog({getLogState, Component: XvizPanel});
