# XVIZPlotComponent (React Component)

The base component for rendering a Declarative UI [plot](https://github.com/uber/xviz/blob/master/docs/protocol-schema/declarative-ui.md#plot) component.

> Do not use this component directly unless implementing your own UI component. See [XVIZPanel](/docs/api-reference/xviz-panel) for how to render generic Declarative UI configurations.


## Properties

### UI Configuration

##### width (Number|String, optional)

The width of the chart. Default `100%`.

##### height (Number|String, optional)

The height of the chart. Default `300`.

##### margin (Object, optional)

The margin of the chart in pixles, must have the following fields:
- `left`
- `right`
- `top`
- `bottom`

Default: `{left: 45, right: 10, top: 10, bottom: 20}`

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

The following props are automatically populated when this component is rendered via `XVIZPanel`. See Declarative UI specification for details.

##### title (String)

##### description (String)

##### independentVariable (String)

##### dependentVariable (Array)


### Log Info

The following props are automatically populated when this component is rendered via `XVIZPanel`. Supply these props manually if the component is used without a `XVIZLoader` instance, e.g. connected with a Redux store.

##### metadata (Object)

The metadata of the current log.

##### variables (Object)

An object mapping from stream names to the variable values in the current frame.
