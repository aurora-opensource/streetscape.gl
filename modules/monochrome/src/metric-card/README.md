# Plot

Components that render a plot of multiple data series.

**Features**

- Multiple series
- Legends and toggles
- Fully stylable
- Hover tooltip

## Usage

```js
import {MetricCard, MetricChart, RichMetricChart} from '@streetscape.gl/monochrome';

const View = () => {
  return (
    <MetricCard title="Speed" description="This chart shows measured speed">
      <MetricChart
        data={{
          car: [{x: 0, y: 0}, {x: 1, y: 0.5}, {x: 2, y: 1}],
          train: [{x: 0, y: 0}, {x: 1, y: 0.2}, {x: 2, y: 2}]
        }}
        unit="m/s"
        highlightX={0}
      />
    </MetricCard>
  );
};
```

## API Reference

## MetricCard

`MetricCard` is a wrapper component that renders the title and status of a metric.

### Props

- `className` **(string, optional)** - additional class name for the container
- `style` **(object, optional)** - custom CSS styles. See "styling" section below.
- `title` **(string|Element)** - title of the chart. If empty, the title bar will be hidden.
- `description` **(string|Element)** - description of the chart. It is shown when the title is
  hovered.
- `isLoading` **(bool)** - show a loading spinner
- `error` **(string)** - show a message if loading the chart encounters an error.

### Styling

The `style` prop expects an object that may contain the following keys:

- `wrapper` - the container of the card.
- `title` - the title of the card.
- `spinner` - the spinner that is shown when the card is loading.
- `error` - the error message.
- `tooltip` - the title tooltip. This value will be passed to the
  [Tooltip](../shared/popover/README.md) component.

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `hasError` **(boolean)**
  - `isLoading` **(boolean)**

## MetricChart

`MetricChart` renders a collection of line charts into a single x-y plot. Legends are only shown as
tooltip when the chart is hovered over. If you have a large number of line series, see
`RichMetricChart`.

### Data Props

- `data` **(object)** - data to render, as a map from series name to an array of points.
- `highlightX` **(number)** - x position of the crosshair when the chart is not hovered.
- `unit` **(string, optional)** - unit of the y axis.
- `getX` **(function, optional)** - accessor of the `x` value from each data point. Default
  `d => d.x`.
- `getY` **(function, optional)** - accessor of the `y` value from each data point. Default
  `d => d.y`.
- `getY0` **(function, optional)** - accessor of the `y0` value from each data point. Default
  `d => null`. If `y0` is not null, the series is rendered as an area filled from `y0` (bottom) to
  `y` (top).

### Styling Props

- `width` **(number|string, optional)** - width of the chart. Default `100%`.
- `height` **(number|string, optional)** - height of the chart. Default `300`.
- `style` **(object, optional)** - custom CSS styles. See "styling" section below.
- `xDomain` **([number, number], optional)** - [min, max] of the x axis.
- `yDomain` **([number, number], optional)** - [min, max] of the y axis.
- `xTicks` **(number, optional)** - number of ticks to show on the x axis. Default `4`.
- `yTicks` **(number, optional)** - number of ticks to show on the y axis. Default `4`.
- `horizontalGridLines` **(number, optional)** - number of horizontal grid lines. Default `4`.
- `verticalGridLines` **(number, optional)** - number of vertical grid lines. Default `4`.
- `formatXTick` **(function, optional)** - format the label along the x axis.
- `formatYTick` **(function, optional)** - format the label along the y axis.
- `formatTitle` **(function, optional)** - format a series name for display in the tooltip.
- `formatValue` **(function, optional)** - format a data value for display in the tooltip.
- `getColor` **(object|function|string, optional)** - the color accessor of a series. Default
  `#000`.
  - Type `string`: a CSS color string.
  - Type `object`: a map from series name to its CSS color.
  - Type `function`: a callback that receives a series name and returns its CSS color.

### Event Callback Props

- `onClick` **(function, optional)** - Called when the chart is clicked. Parameters:
  - `x` (number) - x value at the pointer position.
- `onMouseEnter` **(function, optional)** - Called when the pointer enters the chart area.
- `onMouseMove` **(function, optional)** - Called when the pointer moves inside the chart area.
- `onMouseLeave` **(function, optional)** - Called when the pointer leaves the chart area.
- `onSeriesMouseOver` **(function, optional)** - Called when the pointer enters a line series.
  Parameters:
  - `key` (string) - name of the series.
- `onNearestX` **(function, optional)** - Called when the pointer moves relative to a line series.
  Parameters:
  - `key` (string) - name of the series.
  - `value` (object) - datum that is closest to the pointer.
- `onSeriesMouseOut` **(function, optional)** - Called when the pointer leaves a line series.
  Parameters:
  - `key` (string) - name of the series.

### Styling

The `style` prop expects an object that may contain the following keys:

- `margin` **(object)** - margin of the plot. Default `{left: 32, top: 20, right: 20, bottom: 32}`.
- `chart` - the chart component
- `crosshair` - the info box shown on hover
- `crosshairTitle` - the series names in the tooltip
- `crosshairValue` - the value texts in the tooltip
- `crosshairLegend` - the color legends in the tooltip

The values define the styling overrides for the respective child components. Unless noted otherwise,
each value is an object, or a callback function.

A custom style callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme

The `tooltipTitle`, `tooltipValue` and `tooltipLegend` callbacks will receive the following
arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `name` **(string)** - key of the series
  - `displayName` **(string)** - dispay name of the series
  - `color` **(string)** - color of the series
  - `isFirst` **(boolean)** - if this is the first item in the list
  - `isLast` **(boolean)** - if this is the last item in the list

## RichMetricChart

`RichMetricChart` renders a collection of line charts into a single x-y plot, and a list of legends
to filter the data.

### Props

Every prop supported by `MetricChart`, plus the following:

- `topSeriesCount` **(number)** - Number of series to display by default. The data series are sorted
  by their peak value.

### Styling

The `style` prop expects an object that may contain any of the stylable components of the
`MetricChart`, plus the following:

- `filter` - the filter container
- `filterToggle` - the toggle to show/hide additional filters
- `iconExpanded` **(element)** - the icon when filters are expanded.
- `iconCollapsed` **(element)** - the icon when filters are collapsed.
- `iconOn` **(element)** - the icon for a filter that is on.
- `iconOff` **(element)** - the icon for a filter that is off.
- `filterItem` - the name of a series in the filters
- `filterLegend` - the color legend of a series in the filters

The `filter` callback function will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme

The `filterItem` and `filterLegend` callbacks will receive the following arguments:

- `props` **(object)**
  - `theme` **(object)** - the current theme
  - `name` **(string)** - key of the series
  - `displayName` **(string)** - dispay name of the series
  - `color` **(string)** - color of the series
  - `isActive` **(boolean)** - if the series is turned on
  - `isHovered` **(boolean)** - if the pointer is hovering over this series
