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
import {MetricCard, MetricChart} from 'monochrome-ui';

import {DEFAULT_COLOR_SERIES} from './constants';
import connectToLog from '../connect';

class XvizMetricComponent extends PureComponent {
  static defaultProps = {
    timeSeries: {},
    timeDomain: [],
    height: 160,
    margin: {left: 45, right: 10, top: 10, bottom: 20},
    getColor: DEFAULT_COLOR_SERIES
  };

  _onClick = x => {
    this.props.log.seek(x);
  };

  _extractDataProps() {
    const {streams, timeSeries} = this.props;

    const data = {};
    let sampleSeries = null;
    streams.forEach((streamName, i) => {
      const dataSeries = timeSeries[streamName];
      if (dataSeries) {
        sampleSeries = dataSeries;
        data[streamName] = dataSeries.valueSeries;
      }
    });

    return sampleSeries
      ? {
          getX: sampleSeries.getX,
          getY: sampleSeries.getY,
          unit: sampleSeries.unit,
          data
        }
      : {
          isLoading: true
        };
  }

  render() {
    const {title, description, timeDomain, currentTime, height, margin, getColor} = this.props;

    return (
      <MetricCard title={title} description={description}>
        <MetricChart
          {...this._extractDataProps()}
          getColor={getColor}
          highlightX={currentTime}
          height={height}
          margin={margin}
          xTicks={0}
          yTicks={3}
          xDomain={timeDomain}
          onClick={this._onClick}
          horizontalGridLines={3}
          verticalGridLines={0}
        />
      </MetricCard>
    );
  }
}

const getLogState = log => ({
  currentTime: log.getCurrentTime(),
  timeSeries: log.getTimeSeries(),
  timeDomain: log.getTimeDomain()
});

export default connectToLog({getLogState, Component: XvizMetricComponent});
