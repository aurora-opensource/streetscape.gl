import React, {PureComponent} from 'react';
import {MetricCard, MetricChart} from 'monochrome-ui';

import {DEFAULT_COLOR_SERIES} from './constants';
import connectToLog from '../connect';

class XVIZMetricComponent extends PureComponent {
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

export default connectToLog({getLogState, Component: XVIZMetricComponent});
