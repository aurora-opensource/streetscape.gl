import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {MetricCard, MetricChart} from 'monochrome-ui';

import {DEFAULT_COLOR_SERIES} from './constants';
import connectToLog from '../connect';

export class XVIZMetricComponent extends PureComponent {
  static propTypes = {
    // User configuration
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    margin: PropTypes.shape({
      left: PropTypes.number,
      right: PropTypes.number,
      top: PropTypes.number,
      bottom: PropTypes.number
    }),
    getColor: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    xTicks: PropTypes.number,
    yTicks: PropTypes.number,
    formatXTick: PropTypes.Function,
    formatYTick: PropTypes.Function,
    horizontalGridLines: PropTypes.number,
    verticalGridLines: PropTypes.number,
    onClick: PropTypes.func,

    // From declarative UI metric component
    streams: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string,
    description: PropTypes.string,

    // From connected log
    currentTime: PropTypes.number,
    timeSeries: PropTypes.objectOf(
      PropTypes.shape({
        data: PropTypes.array,
        getX: PropTypes.func,
        getY: PropTypes.func,
        unit: PropTypes.string
      })
    ),
    timeDomain: PropTypes.arrayOf(PropTypes.number)
  };

  static defaultProps = {
    timeSeries: {},
    width: '100%',
    height: 160,
    xTicks: 0,
    yTicks: 3,
    horizontalGridLines: 3,
    verticalGridLines: 0,
    margin: {left: 45, right: 10, top: 10, bottom: 20},
    getColor: DEFAULT_COLOR_SERIES
  };

  _onClick = x => {
    const {onClick, log} = this.props;
    if (onClick) {
      onClick(x);
    } else if (log) {
      log.seek(x);
    }
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
    const {
      title,
      description,
      timeDomain,
      currentTime,
      width,
      height,
      margin,
      xTicks,
      yTicks,
      formatXTick,
      formatYTick,
      horizontalGridLines,
      verticalGridLines,
      getColor
    } = this.props;
    const isLoading = currentTime === null;

    return (
      <MetricCard title={title} description={description} isLoading={isLoading}>
        {!isLoading && (
          <MetricChart
            {...this._extractDataProps()}
            getColor={getColor}
            highlightX={currentTime}
            width={width}
            height={height}
            margin={margin}
            xTicks={xTicks}
            yTicks={yTicks}
            formatXTick={formatXTick}
            formatYTick={formatYTick}
            xDomain={timeDomain}
            onClick={this._onClick}
            horizontalGridLines={horizontalGridLines}
            verticalGridLines={verticalGridLines}
          />
        )}
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
