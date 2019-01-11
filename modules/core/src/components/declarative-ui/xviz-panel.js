import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import XVIZContainer from './xviz-container';
import XVIZMetric from './xviz-metric';
import XVIZPlot from './xviz-plot';
import XVIZTable from './xviz-table';
import XVIZVideo from './xviz-video';

import connectToLog from '../connect';

// xviz type to component map
const DEFAULT_COMPONENTS = {
  container: XVIZContainer,
  metric: XVIZMetric,
  plot: XVIZPlot,
  video: XVIZVideo,
  table: XVIZTable,
  treetable: XVIZTable
};

class XVIZPanelComponent extends PureComponent {
  static propTypes = {
    // User configuration
    name: PropTypes.string.isRequired,
    components: PropTypes.object,
    componentProps: PropTypes.object,
    style: PropTypes.object,

    // From connected log
    uiConfig: PropTypes.object
  };

  static defaultProps = {
    style: {},
    components: {},
    componentProps: {}
  };

  _renderItem = (item, i) => {
    const {components, componentProps, log, style} = this.props;
    const XVIZComponent = components[item.type] || DEFAULT_COMPONENTS[item.type];
    const customProps = componentProps[item.type];

    if (!XVIZComponent) {
      return null;
    }

    return (
      <XVIZComponent key={i} {...customProps} {...item} log={log} style={style[item.type]}>
        {item.children && item.children.map(this._renderItem)}
      </XVIZComponent>
    );
  };

  render() {
    const {uiConfig} = this.props;

    return uiConfig ? (
      <div>{uiConfig.children && uiConfig.children.map(this._renderItem)}</div>
    ) : null;
  }
}

const getLogState = (log, ownProps) => {
  const metadata = log.getMetadata();
  return {
    uiConfig: metadata && metadata.ui_config && metadata.ui_config[ownProps.name]
  };
};

export default connectToLog({getLogState, Component: XVIZPanelComponent});
