# XVIZPlot (React Component) (experimental)

The base component for rendering a Declarative UI
[plot](https://github.com/uber/xviz/blob/master/docs/declarative-ui/components.md#Plot) component.

> Do not use this component directly unless implementing your own UI component. See
> [XVIZPanel](/docs/api-reference/xviz-panel.md) for how to render generic Declarative UI
> configurations.

> Warning: this component is experimental and may change between minor versions. Refer to the
> CHANGELOG if you encounter any issues.

```js
import {_XVIZPlot as XVIZPlot} from 'streetscape.gl';
```

## Properties

### UI Configuration

##### width (Number|String, optional)

The width of the chart. Default `100%`.

##### height (Number|String, optional)

The height of the chart. Default `300`.

##### style (Object, optional)

Custom CSS overrides. Supports all
[MetricCard](https://github.com/uber-web/monochrome/blob/master/src/metric-card/README.md#styling),
[MetricChart](https://github.com/uber-web/monochrome/blob/master/src/metric-card/README.md#styling-1)
and
[RichMetricChart](https://github.com/uber-web/monochrome/blob/master/src/metric-card/README.md#styling-2)
options. Supports `missingData` option as an override to `MissingDataCard` component.

##### getColor (Object|Function|String, optional)

The color accessor of a the line/area series.

- Type `string`: a CSS color string.
- Type `object`: a map from stream name to its CSS color.
- Type `function`: a callback that receives a stream name and returns its CSS color.

##### xTicks (Number, optional)

Number of ticks to show on the x axis. Default `0`.

##### yTicks (Number, optional)

Number of ticks to show on the y axis. Default `5`.

##### formatXTick (Function, optional)

Format the label along the x axis.

Default: `x => String(x)``

##### formatYTick (Function, optional)

Format the label along the y axis.

Default: `y => String(y)``

##### horizontalGridLines (Number, optional)

Number of horizontal grid lines. Default `5`.

##### verticalGridLines (Number, optional)

Number of vertical grid lines. Default `0`.

##### onClick (Function, optional)

Called when the chart is clicked.

Parameters:

- `x` (number) - x value at the pointer position.

### Declarative UI Component Descriptor

The following props are automatically populated when this component is rendered via `XVIZPanel`. See
Declarative UI specification for details.

##### title (String)

##### description (String)

##### independentVariable (String)

##### dependentVariables (Array)

### Log Info

> Advanced warning: this section is for developing customized components only.

The following props are automatically populated when the `log` prop is provided. Supply these props
manually if the component is used without a `XVIZLoader` instance, e.g. connected with a Redux
store:

##### streamsMetadata (Object)

A map from stream names to their metadata.

##### variables (Object)

An object mapping from stream names to the variable values in the current frame.
