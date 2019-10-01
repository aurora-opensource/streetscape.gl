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

import {withTheme} from '../shared/theme';
import {ExpandedIcon, CollapsedIcon, CheckAltIcon} from '../shared/icons';
import MetricChart from './metric-chart';
import {FilterContainer, FilterToggle, FilterItem, FilterLegend} from './styled-components';
import memoize from '../utils/memoize';

import {scaleOrdinal} from 'd3-scale';
import {extent} from 'd3-array';

const DEFAULT_COLORS = scaleOrdinal().range([
  '#12939A',
  '#DDB27C',
  '#88572C',
  '#FF991F',
  '#F15C17',
  '#223F9A',
  '#DA70BF',
  '#125C77',
  '#4DC19C',
  '#776E57',
  '#17B8BE',
  '#F6D18A',
  '#B7885E',
  '#FFCB99',
  '#F89570',
  '#829AE3',
  '#E79FD5',
  '#1E96BE',
  '#89DAC1',
  '#B3AD9E'
]);

/**
 * A component that visualizes the multiple data series. Features:
 * Each data series is shown as a line series
 * Clicking on the legend toggles the visibility of that data series
 * Legends are sorted by prominence (maximum value in the look ahead window)
 * A show all/show less button to toggle only showing the top 5 data series by value
 */
class MetricChartWithLegends extends PureComponent {
  static propTypes = Object.assign({}, MetricChart.propTypes, {
    topSeriesCount: PropTypes.number
  });

  static defaultProps = Object.assign({}, MetricChart.defaultProps, {
    topSeriesCount: 5,
    getColor: DEFAULT_COLORS
  });

  constructor(props) {
    super(props);
    this.state = {
      dataVisibility: {},
      showTopSeriesOnly: true,
      hoveredSeriesName: null
    };
    this.extractDataSeries = memoize(this._extractDataSeries);
  }

  _getColor(key) {
    const {getColor} = this.props;

    switch (typeof getColor) {
      case 'object':
        return getColor[key];

      case 'function':
        return getColor(key);

      default:
        return getColor;
    }
  }

  // Extract subset of streams from all variable streams
  // Format stream data for render
  _extractDataSeries = data => {
    const {formatTitle, getY} = this.props;
    const series = [];

    for (const key in data) {
      const value = data[key];
      if (Array.isArray(value)) {
        const displayName = formatTitle(key);
        const yExtent = extent(value, getY);
        series.push({
          key,
          displayName,
          color: this._getColor(key),
          data: value,
          extent: yExtent,
          max: Math.max(Math.abs(yExtent[0]), Math.abs(yExtent[1]))
        });
      }
    }

    // Sort data series by max value
    series.sort((s1, s2) => s2.max - s1.max);

    return series;
  };

  // Check if a certain data series is turned on by user settings
  _isDataVisible = key => {
    const {showTopSeriesOnly, dataVisibility} = this.state;
    const dataSeries = this.extractDataSeries(this.props.data);

    if (dataVisibility[key] === false) {
      // turned of by the user
      return false;
    }
    if (showTopSeriesOnly) {
      const {topSeriesCount} = this.props;
      return dataSeries.findIndex(s => s.key === key) < topSeriesCount;
    }
    return true;
  };

  _setHoveredDataName = key => {
    this.setState({hoveredSeriesName: key});
  };

  _toggleDataVisibility = key => {
    const {dataVisibility} = this.state;

    this.setState({
      dataVisibility: {
        ...dataVisibility,
        // at start, all streams have undefined which is treated as visible
        [key]: dataVisibility[key] === false
      }
    });
  };

  // Legends (also as visibility toggle) of the data streams
  _renderDataFilters() {
    const {showTopSeriesOnly, hoveredSeriesName} = this.state;
    const {theme, style, topSeriesCount} = this.props;
    const dataSeries = this.extractDataSeries(this.props.data);

    const series = showTopSeriesOnly ? dataSeries.slice(0, topSeriesCount) : dataSeries;

    return (
      <FilterContainer theme={theme} userStyle={style.filter} isExpanded={!showTopSeriesOnly}>
        {dataSeries.length > topSeriesCount && (
          <FilterToggle
            theme={theme}
            userStyle={style.filterToggle}
            isExpanded={!showTopSeriesOnly}
            onClick={() => this.setState({showTopSeriesOnly: !showTopSeriesOnly})}
          >
            {showTopSeriesOnly
              ? style.iconCollapsed || <CollapsedIcon />
              : style.iconExpanded || <ExpandedIcon />}
          </FilterToggle>
        )}

        {series.map(s => {
          const styleProps = {
            theme,
            name: s.key,
            displayName: s.displayName,
            color: s.color,
            isHovered: hoveredSeriesName === s.key,
            isActive: this._isDataVisible(s.key)
          };

          return (
            <FilterItem
              userStyle={style.filterItem}
              {...styleProps}
              key={`multiplot-${s.key}`}
              onMouseOver={() => this._setHoveredDataName(s.key)}
              onMouseOut={() => this._setHoveredDataName(null)}
              onClick={() => this._toggleDataVisibility(s.key)}
            >
              <FilterLegend {...styleProps} userStyle={style.filterLegend}>
                {styleProps.isActive ? style.iconOn || <CheckAltIcon /> : style.iconOff}
              </FilterLegend>
              <span>{s.displayName}</span>
            </FilterItem>
          );
        })}
      </FilterContainer>
    );
  }

  render() {
    return (
      <div>
        <MetricChart
          {...this.props}
          highlightSeries={this.state.hoveredSeriesName}
          onSeriesMouseOver={key => this._setHoveredDataName(key)}
          onMouseLeave={() => this._setHoveredDataName(null)}
          dataFilter={this._isDataVisible}
        />
        {this._renderDataFilters()}
      </div>
    );
  }
}

export default withTheme(MetricChartWithLegends);
