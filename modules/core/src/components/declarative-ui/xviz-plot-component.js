import React, {PureComponent} from 'react';
import {MetricCard, MetricChart} from 'monochrome-ui';

import {DEFAULT_COLOR_SERIES} from './constants';
import connectToLog from '../connect';

const GET_X = d => d[0];
const GET_Y = d => d[1];
const DATA_LOADING = {isLoading: true};

class XVIZPlotComponent extends PureComponent {
  static defaultProps = {
    variables: {},
    height: 300,
    margin: {left: 45, right: 10, top: 10, bottom: 45},
    getColor: DEFAULT_COLOR_SERIES
  };

  state = {
    independentVariable: null,
    dependentVariable: {}
  };

  componentWillReceiveProps(nextProps) {
    if (!nextProps.variables) {
      this.setState({independentVariable: null});
      return;
    }

    const independentVariable = nextProps.variables[nextProps.independentVariable];
    let independentVariableChanged = false;
    let dependentVariableChanged = false;
    const updatedDependentVariable = {};

    if (independentVariable !== this.state.independentVariable) {
      independentVariableChanged = true;
    }
    for (const streamName of nextProps.dependentVariable) {
      const variable = nextProps.variables[streamName];
      if (
        independentVariableChanged ||
        !this.props.variables ||
        this.props.variables[streamName] !== variable
      ) {
        updatedDependentVariable[streamName] = this._formatDependentVariable(
          independentVariable,
          variable
        );
        dependentVariableChanged = true;
      }
    }

    if (independentVariableChanged || dependentVariableChanged) {
      this.setState({
        independentVariable,
        dependentVariable: {...this.state.dependentVariable, ...updatedDependentVariable}
      });
    }
  }

  _onClick = x => {
    // TODO - set look ahead
    // this.props.log.seek(x);
  };

  _formatTitle = streamName => {
    // TODO - use information from metadata
    // const {metadata} = this.props;
    // const streamInfo = metadata && metadata.streams[streamName];
    return streamName;
  };

  _formatDependentVariable(independentVariable, variable) {
    if (!variable || !independentVariable || independentVariable.length === 0) {
      return null;
    }
    const x = independentVariable[0].values;

    return variable.map(({id, values}) => {
      return {
        id,
        values: values.map((v, k) => [x[k], v])
      };
    });
  }

  _extractDataProps() {
    const {independentVariable, dependentVariable} = this.state;

    if (!independentVariable) {
      return DATA_LOADING;
    }

    const x = independentVariable[0].values;
    const data = {};
    for (const streamName in dependentVariable) {
      const variable = dependentVariable[streamName];
      if (variable) {
        variable.forEach(({id, values}, i) => {
          data[`${streamName}-${id || i}`] = values;
        });
      }
    }

    return {
      getX: GET_X,
      getY: GET_Y,
      xDomain: [x[0], x[x.length - 1]],
      data
    };
  }

  render() {
    const {title, description, height, margin, getColor} = this.props;

    return (
      <MetricCard title={title} description={description}>
        <MetricChart
          {...this._extractDataProps()}
          getColor={getColor}
          highlightX={0}
          height={height}
          margin={margin}
          xTicks={4}
          yTicks={3}
          onClick={this._onClick}
          formatTitle={this._formatTitle}
          horizontalGridLines={3}
          verticalGridLines={0}
        />
      </MetricCard>
    );
  }
}

const getLogState = log => {
  const frame = log.getCurrentFrame();
  return {
    metadata: log.getMetadata(),
    variables: frame && frame.variables
  };
};

export default connectToLog({getLogState, Component: XVIZPlotComponent});
