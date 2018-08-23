import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import XvizContainer from './xviz-container';
import XvizMetricComponent from './xviz-metric-component';

// xviz type to component map
const DEFAULT_COMPONENTS = {
  container: XvizContainer
  // table
  // tree_table
  metric: XvizMetricComponent
  // plot
  // video
};

export default class XvizPanel extends PureComponent {
  static propTypes = {
    log: PropTypes.object,
    components: PropTypes.object
  };

  static defaultProps = {
    components: DEFAULT_COMPONENTS
  };

  _renderItem = (item, components) => {
    const {components, log} = this.props;
    const XvizComponent = components[item.type];

    if (!XvizComponent) {
      return null;
    }

    return (
      <XvizComponent key={item.id} {...item} log={log}>
        {item.children && item.children.map(this._renderItem)}
      </XvizComponent>
    );
  };

  render() {
    const {data, style} = this.props;

    return (
      <div className="xviz-panel" style={style}>
        {data.children && data.children.map(this._renderItem)}
      </div>
    );
  }
}
