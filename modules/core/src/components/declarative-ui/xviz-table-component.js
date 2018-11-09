import React, {PureComponent} from 'react';
import {Table, TreeTable, Tooltip} from 'monochrome-ui';
import PropTypes from 'prop-types';

import connectToLog from '../connect';

class XVIZTableComponent extends PureComponent {
  static propTypes = {
    columns: PropTypes.array,
    nodes: PropTypes.array
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

    const {title, description, type} = this.props;
    const Component = type === 'table' ? Table : TreeTable;

    return (
      <div>
        <Tooltip content={description}>
          <h4>{title}</h4>
        </Tooltip>
        <Component columns={columns} rows={rows} />
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
