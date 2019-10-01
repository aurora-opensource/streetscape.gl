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

import {findNearestValue} from './utils';
import Chart from './chart';
import memoize from '../utils/memoize';

/**
 * A metric chart draws a chart with optional percentiles and lags
 */
export default class MetricChart extends PureComponent {
  static propTypes = Object.assign(
    {
      highlightX: PropTypes.number
    },
    Chart.propTypes
  );

  static defaultProps = Chart.defaultProps;

  constructor(props) {
    super(props);

    this.state = {
      isHovered: false,
      hoveredX: null,
      // The nearest data point to the cursor in each series
      hoveredValues: {}
    };

    this.getCurrentValues = memoize(this._getCurrentValues);
  }

  // Find the closest data point in each series to the current time
  _getCurrentValues = (highlightX, data) => {
    if (!Number.isFinite(highlightX) || !data) {
      return null;
    }

    const {getX} = this.props;

    const result = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        result[key] = findNearestValue(data[key], highlightX, getX);
      }
    }
    return result;
  };

  _onClick = evt => {
    this.props.onClick(this.state.hoveredX, evt);
  };

  _onNearestX = (key, value, evt) => {
    const {hoveredValues} = this.state;
    hoveredValues[key] = value;

    this.setState({
      isHovered: true,
      hoveredX: this.props.getX(value),
      hoveredValues: {...hoveredValues}
    });

    this.props.onNearestX(key, value, evt);
  };

  _onMouseLeave = evt => {
    this.setState({isHovered: false, hoveredX: null});
    this.props.onMouseLeave(evt);
  };

  render() {
    const {highlightX, data} = this.props;
    const {isHovered, hoveredValues} = this.state;
    const currentValues = this.getCurrentValues(highlightX, data);

    return (
      <Chart
        {...this.props}
        onClick={this._onClick}
        onNearestX={this._onNearestX}
        onMouseLeave={this._onMouseLeave}
        highlightValues={isHovered ? hoveredValues : currentValues}
      />
    );
  }
}
