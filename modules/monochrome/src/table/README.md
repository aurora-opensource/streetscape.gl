# Table

A collection of React components that render very large tables.

## Usage

```js
import {Table} from '@streetscape.gl/monochrome';

const View = () => {
  return (
    <Table columns={columns} rows={rows} renderHeader={renderHeader} renderCell={renderCell} />
  );
};
```

## Table

Renders a table.

```js
import {Table} from '@streetscape.gl/monochrome';
```

### Props

- `width` **(string|number)** - width of the table. Default `100%`.
- `height` **(string|number)** - height of the table. Default `400`.
- `style` **(object)** - custom CSS overrides. See "Styling" section below.
- `columns` **(array)** - list of column definitions. Each column definition may contain the
  following fields:
  - `name` **(string)** - display name of the column.
  - `type` **(string)** - `string`, `boolean`, etc.
- `rows` **(array)** - list of rows to render. Each row object must contain the following fields:
  - `data` **(array)** - value for each column, e.g. `[val1, val2, ...]`
- `renderHeader` **(function, optional)** - custom renderer for each column's header. Receives one
  argument with the following fields:
  - `column` **(object)** - the column definition
  - `columnIndex` **(number)** - the column index
- `renderCell` **(function, optional)** - custom renderer for each cell. Receives one argument with
  the following fields:
  - `value` **(object)** - the cell value
  - `column` **(object)** - the column definition
  - `columnIndex` **(number)** - the column index
  - `row` **(object)** - the row definition
  - `rowId` **(string)** - the row identifier

## TreeTable

Renders a table with nested hierarchy.

```js
import {TreeTable} from '@streetscape.gl/monochrome';
```

### Props

Inherits all `Table`'s props, and the following:

- `rows` **(array)** - list of rows to render. Each row object must contain the following fields:
  - `data` **(array)** - value for each column, e.g. `[val1, val2, ...]`
  - `children` **(array)** - child rows
- `indentSize` **(number, optional)** - Default `12`.

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - the wrapper component for the entire table
- `header` - the header
- `headerCell` - a cell in the header
- `sort` - the container around the icon that shows the sorting order of a column
- `iconAscending` **(element)** - the icon for sorting a-z
- `iconDescending` **(element)** - the icon for sorting z-a
- `body` - the body
- `row` - a row
- `cell` - a cell in a row
- `expander` - (TreeTable only) the expand/collapse button of a row
- `iconExpanded` **(element)** - (TreeTable only) the icon for expanded rows
- `iconCollapsed` **(element)** - (TreeTable only) the icon for collapsed rows

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme

The `row`, `cell` and `headerCell` callbacks will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `index` **(number)** - the index of the current element
