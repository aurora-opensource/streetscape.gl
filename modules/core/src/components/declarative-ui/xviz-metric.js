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
import {MetricCard, MetricChart, Spinner} from '@streetscape.gl/monochrome';

import {DEFAULT_COLOR_SERIES} from './constants';
import connectToLog from '../connect';
import {getTimeSeries} from '../../utils/metrics-helper';
import {MissingDataCard} from './missing-data-card';

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
    streams: PropTypes.arrayOf(PropTypes.string).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,

    // From connected log
    currentTime: PropTypes.number,
    streamsMetadata: PropTypes.object,
    logStreams: PropTypes.objectOf(PropTypes.array),
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

  constructor(props) {
    super(props);
    this.state = {
      timeSeries: this._getTimeSeries(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.streams !== nextProps.streams ||
      this.props.streamsMetadata !== nextProps.streamsMetadata ||
      this.props.logStreams !== nextProps.logStreams
    ) {
      this.setState({
        timeSeries: this._getTimeSeries(nextProps)
      });
    }
  }

  _getTimeSeries(props) {
    return getTimeSeries({
      streamNames: props.streams,
      streamsMetadata: props.streamsMetadata,
      streams: props.logStreams
    });
  }

  _onClick = x => {
    const {onClick, log} = this.props;
    if (onClick) {
      onClick(x);
    } else if (log) {
      log.seek(x);
    }
  };

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
    const isLoading = currentTime == null; /* eslint-disable-line no-eq-null, eqeqeq */
    const timeDomain = Number.isFinite(startTime) ? [startTime, endTime] : null;
    const {missingStreams} = this.state.timeSeries;

    return (
      <MetricCard title={title} description={description} isLoading={false} style={style}>
        <>
          {missingStreams.length > 0 && (
            <MissingDataCard style={style} missingData={missingStreams} />
          )}
          {isLoading ? (
            <Spinner />
          ) : (
            <MetricChart
              {...this.state.timeSeries}
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
        </>
      </MetricCard>
    );
  }
}

const getLogState = log => ({
  currentTime: log.getCurrentTime(),
  streamsMetadata: log.getStreamsMetadata(),
  logStreams: log.getStreams(),
  startTime: log.getBufferStartTime(),
  endTime: log.getBufferEndTime()
});

export default connectToLog({getLogState, Component: XVIZMetricComponent});
