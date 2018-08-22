// TODO fix style
import React, {PureComponent} from 'react';
import {MetricCard, MetricChart, FloatPanel} from 'monochrome-ui';

import connectToLog from './connect';

const CHART_MARGIN = {left: 45, right: 45, top: 45, bottom: 20};

const DEFAULT_PROPS = {
  metrics: {},
  formatDate: x => `${Number(x).toFixed(1)}s`,
  height: '100%',
  width: 600,
  timeDomain: []
};

class FloatingMetrics extends PureComponent {
  static get defaultProps() {
    return DEFAULT_PROPS;
  }

  _formatDate = time => {
    return this.props.formatDate(time - this.props.timeDomain[0]);
  };

  render() {
    if (!this.props.timeSeries || !this.props.timeSeries.length) {
      return null;
    }

    const {title, width, height, timeDomain} = this.props;

    return (
      <FloatPanel id={'floating-metrics'} title={title} width={width} height={height}>
        {this.props.timeSeries.map((metric, i) => {
          return (
            <MetricCard
              key={metric.id || i}
              title={metric.title}
              height={400}
              description={metric.description}
            >
              <MetricChart
                data={{[metric.id]: metric.valueSeries}}
                margin={CHART_MARGIN}
                getX={metric.getX}
                getY={metric.getY}
                width={400}
                xTicks={4}
                yTicks={3}
                xDomain={timeDomain}
                formatXTick={this._formatDate}
                horizontalGridLines={3}
                verticalGridLines={0}
              />
            </MetricCard>
          );
        })}
      </FloatPanel>
    );
  }
}

const getLogState = log => ({
  timeSeries: log.getTimeSeries(),
  timeDomain: log.getTimeDomain()
});

export default connectToLog({getLogState, Component: FloatingMetrics});
