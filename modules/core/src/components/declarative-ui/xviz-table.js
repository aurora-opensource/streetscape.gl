import React, {PureComponent} from 'react';
import {Table, TreeTable, Tooltip} from 'monochrome-ui';
import PropTypes from 'prop-types';

import connectToLog from '../connect';

export class XVIZTableComponent extends PureComponent {
  static propTypes = {
    // UI configuration
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    renderHeader: PropTypes.Function,
    renderCell: PropTypes.Function,
    indentSize: PropTypes.number,

    // From declarative UI table component
    stream: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    displayObjectId: PropTypes.bool,

    // From connected log
    columns: PropTypes.array,
    nodes: PropTypes.array
  };

  static defaultProps = {
    width: '100%',
    height: 400,
    indentSize: 12,
    renderHeader: ({column}) => column.name,
    renderCell: ({value}) => (value === null ? null : String(value))
  };

  constructor(props) {
    super(props);

    this.state = {
      ...this._formatData(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.columns !== this.props.columns || nextProps.nodes !== this.props.nodes) {
      this.setState(this._formatData(nextProps));
    }
  }

  _formatData({columns, nodes, displayObjectId}) {
    if (!columns || !nodes) {
      return {columns: null};
    }

    columns = columns.map(col => ({
      name: col.display_text,
      type: col.type
    }));

    const rowIds = {};
    const rows = [];

    nodes.forEach(node => {
      const row = {
        data: node.column_values || [],
        children: []
      };
      rowIds[node.id] = row;

      if (node.parent === undefined) {
        rows.push(row);
      } else {
        const parentRow = rowIds[node.parent];
        if (parentRow) {
          parentRow.children.push(row);
        }
      }
    });

    return {columns, rows};
  }

  render() {
    const {columns, rows} = this.state;

    if (!columns) {
      // TODO - show loading message
      return null;
    }

    const {
      title,
      description,
      width,
      height,
      renderHeader,
      renderCell,
      indentSize,
      type
    } = this.props;
    const Component = type === 'table' ? Table : TreeTable;

    return (
      <div style={{width, height}}>
        <Tooltip content={description}>
          <h4>{title}</h4>
        </Tooltip>
        <Component
          width="100%"
          height="100%"
          renderHeader={renderHeader}
          renderCell={renderCell}
          indentSize={indentSize}
          columns={columns}
          rows={rows}
        />
      </div>
    );
  }
}

const getLogState = (log, ownProps) => {
  const frame = log.getCurrentFrame();
  const data = frame && frame.streams[ownProps.stream];
  return data && data.treetable;
};

export default connectToLog({getLogState, Component: XVIZTableComponent});
