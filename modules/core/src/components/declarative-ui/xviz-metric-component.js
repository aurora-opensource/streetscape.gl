import React, {PureComponent} from 'react';
import {MetricCard, MetricChart} from 'monochrome-ui';

import connectToLog from '../connect';

const DEFAULT_HEIGHT = 200;
const DEFAULT_MARGIN = {left: 45, right: 10, top: 10, bottom: 20};
const DEFAULT_COLORS = ['#12939A', '#DDB27C', '#88572C', '#FF991F', '#F15C17', '#223F9A'];

class XvizMetricComponent extends PureComponent {
  static defaultProps = {
    timeSeries: {},
    timeDomain: []
  };

  _onClick = x => {
    this.props.log.seek(x);
  };

  _extractDataProps() {
    const {streams, timeSeries} = this.props;

    const data = {};
    const getColor = {};
    let sampleSeries = null;
    streams.forEach((streamName, i) => {
      const dataSeries = timeSeries[streamName];
      if (dataSeries) {
        sampleSeries = dataSeries;
        data[streamName] = dataSeries.valueSeries;
        getColor[streamName] = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      }
    });

    return sampleSeries
      ? {
          getX: sampleSeries.getX,
          getY: sampleSeries.getY,
          unit: sampleSeries.unit,
          getColor,
          data
        }
      : {
          isLoading: true
        };
  }

  render() {
    const {title, description, timeDomain, currentTime} = this.props;

    return (
      <MetricCard title={title} description={description}>
        <MetricChart
          {...this._extractDataProps()}
          highlightX={currentTime}
          height={DEFAULT_HEIGHT}
          margin={DEFAULT_MARGIN}
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
