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

import XvizContainer from './xviz-container';
import XvizMetricComponent from './xviz-metric-component';

import connectToLog from '../connect';

// xviz type to component map
const DEFAULT_COMPONENTS = {
  container: XvizContainer,
  // table
  // tree_table
  metric: XvizMetricComponent
  // plot
  // video
};

class XvizPanel extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    components: PropTypes.object,
    style: PropTypes.object
  };

  static defaultProps = {
    components: {}
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
