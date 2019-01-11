import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {MetricCard, MetricChart} from '@streetscape.gl/monochrome';

import {DEFAULT_COLOR_SERIES} from './constants';
import connectToLog from '../connect';

const defaultFormatValue = x => (Number.isFinite(x) ? x.toFixed(3) : String(x));

class XVIZMetricComponent extends PureComponent {
  static propTypes = {
    // User configuration
    style: PropTypes.object,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    getColor: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
    xTicks: PropTypes.number,
    yTicks: PropTypes.number,
    formatXTick: PropTypes.func,
    formatYTick: PropTypes.func,
    formatValue: PropTypes.func,
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
    startTime: PropTypes.number,
    endTime: PropTypes.number
  };

  static defaultProps = {
    timeSeries: {},
    width: '100%',
    height: 160,
    style: {
      margin: {left: 45, right: 10, top: 10, bottom: 20}
    },
    xTicks: 0,
    yTicks: 3,
    formatValue: defaultFormatValue,
    horizontalGridLines: 3,
    verticalGridLines: 0,
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
      startTime,
      endTime,
      currentTime,
      width,
      height,
      style,
      xTicks,
      yTicks,
      formatXTick,
      formatYTick,
      formatValue,
      horizontalGridLines,
      verticalGridLines,
      getColor
    } = this.props;
    const isLoading = currentTime === null;
    const timeDomain = Number.isFinite(startTime) ? [startTime, endTime] : null;

    return (
      <MetricCard title={title} description={description} isLoading={isLoading} style={style}>
        {!isLoading && (
          <MetricChart
            {...this._extractDataProps()}
            getColor={getColor}
            highlightX={currentTime}
            width={width}
            height={height}
            style={style}
            xTicks={xTicks}
            yTicks={yTicks}
            formatXTick={formatXTick}
            formatYTick={formatYTick}
            formatValue={formatValue}
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
  startTime: log.getBufferStart(),
  endTime: log.getBufferEnd()
});

export default connectToLog({getLogState, Component: XVIZMetricComponent});
