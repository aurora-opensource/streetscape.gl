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

import AutoSizer from '../shared/autosizer';
import memoize from '../utils/memoize';

import {HeaderContainer, HeaderCell, SortIcon} from './styled-components';

const SORT = {
  NONE: 0,
  ASCEND: 1,
  DESCEND: 2
};

export default class TableHeader extends PureComponent {
  static propTypes = {
    columns: PropTypes.arrayOf(PropTypes.object),
    renderHeader: PropTypes.func,
    onSort: PropTypes.func,
    onResize: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.formatColumns = memoize(this._formatColumns);
    this._cells = [];
  }

  _formatColumns(columns) {
    let totalWeight = 0;
    const weights = [];

    columns.forEach((col, colIndex) => {
      let weight = 1;
      if (colIndex === 0) {
        weight++;
      }
      if (col.type === 'string') {
        weight++;
      }
      weights[colIndex] = weight;
      totalWeight += weight;
    });

    return columns.map((col, colIndex) => ({
      srcObject: col,
      name: col.name,
      type: col.type,
      sort: SORT.NONE,
      defaultWidth: `${(100 / totalWeight) * weights[colIndex]}%`
    }));
  }

  _onResize = () => {
    const columns = this.formatColumns(this.props.columns);

    columns.map((col, colIndex) => {
      const ref = this._cells[colIndex];
      if (ref) {
        col.width = ref.clientWidth;
      }
    });

    this.props.onResize(columns);
  };

  _sortColumn = index => {
    const columns = this.formatColumns(this.props.columns);
    const sortType = columns[index].sort === SORT.ASCEND ? SORT.DESCEND : SORT.ASCEND;

    columns.forEach((col, colIndex) => {
      col.sort = colIndex === index ? sortType : SORT.NONE;
    });

    const multiplier = sortType === SORT.ASCEND ? 1 : -1;

    const sortFunc = (row1, row2) => {
      return row1.data[index] <= row2.data[index] ? -multiplier : multiplier;
    };
    this.props.onSort(sortFunc);

    // Trigger rerender
    this.forceUpdate();
  };

  _renderColumn = (column, colIndex) => {
    const {renderHeader, theme, userStyle} = this.props;

    const styleProps = {
      theme,
      isAscending: column.sort === SORT.ASCEND,
      isDescending: column.sort === SORT.DESCEND
    };

    let icon = null;
    if (styleProps.isAscending) {
      icon = userStyle.iconAscending || '↑';
    } else if (styleProps.isDescending) {
      icon = userStyle.iconDescending || '↓';
    }

    return (
      <HeaderCell
        {...styleProps}
        userStyle={userStyle.headerCell}
        style={{width: column.defaultWidth}}
        key={colIndex}
        index={colIndex}
        ref={cell => {
          this._cells[colIndex] = cell;
        }}
        onClick={() => this._sortColumn(colIndex)}
      >
        {renderHeader({column: column.srcObject, columnIndex: colIndex})}
        {icon && (
          <SortIcon {...styleProps} userStyle={userStyle.sort}>
            {icon}
          </SortIcon>
        )}
      </HeaderCell>
    );
  };

  render() {
    const {theme, userStyle} = this.props;
    const columns = this.formatColumns(this.props.columns);

    return (
      <HeaderContainer theme={theme} userStyle={userStyle.header}>
        {columns.map(this._renderColumn)}
        <AutoSizer onResize={this._onResize} debounceTime={200} />
      </HeaderContainer>
    );
  }
}
