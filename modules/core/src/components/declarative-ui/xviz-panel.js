// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
    // Normalize 'type' to lowercase where XVIZ spec defines it as uppercase
    const type = item.type.toLowerCase();
    const XVIZComponent = components[type] || DEFAULT_COMPONENTS[type];
    const customProps = componentProps[type];

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
  const panel = metadata && metadata.ui_config && metadata.ui_config[ownProps.name];
  // If we have a panel we want to use the 'config', else we just return the panel
  // which is either the 'beta' structure for UI or undefined
  return {
    uiConfig: (panel && panel.config) || panel
  };
};

export default connectToLog({getLogState, Component: XVIZPanelComponent});
