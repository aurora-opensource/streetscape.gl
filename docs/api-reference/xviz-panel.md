# XVIZPanel (React Component)

Renders a XVIZ panel from a Declarative UI
[Panel](https://github.com/uber/xviz/blob/master/docs/declarative-ui/layout-elements.md#Panels)
definition.

```jsx
import {XVIZPanel} from 'streetscape.gl';

<XVIZPanel log={log} name="Metrics" />;
```

## Properties

##### log (XVIZLoader)

The log to render - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### name (String)

The identifier of the panel to render. The definition for this panel must be supplied via the
metadata of the log.

##### style (Object, optional)

Custom CSS overrides. May contain the following keys:

- `metric`: passed to [XvizMetric](/docs/api-reference/xviz-metric.md)'s `style` prop
- `plot`: passed to [XvizPlot](/docs/api-reference/xviz-plot.md)'s `style` prop
- `table` and `treetable`: passed to [XvizTable](/docs/api-reference/xviz-table.md)'s `style` prop
- `video`: passed to [XvizVideo](/docs/api-reference/xviz-video.md)'s `style` prop

##### components (Object, optional)

Supply custom renderers for XVIZ Declarative UI components. Key is declarative UI component types
and value is a `React.Component`.

```jsx
// Support an additional component type `text`
const myCustomComponents = {
  text: props => <div style={{color: props.color}}>{props.text}</div>
};

<XVIZPanel log={log} name="Metrics" components={myCustomComponents} />;
```

- Default: `{}`

##### componentProps (Object, optional)

Supply custom props for each XVIZ Declarative UI components. Key is declarative UI component types
and value is an object of custom props.

For a list of customizable props, see the documentation for each component:

- `metric`: [XvizMetric](/docs/api-reference/xviz-metric.md)
- `plot`: [XvizPlot](/docs/api-reference/xviz-plot.md)
- `table` and `treetable`: [XvizTable](/docs/api-reference/xviz-table.md)
- `video`: [XvizVideo](/docs/api-reference/xviz-video.md)

```jsx
// Support an additional component type `text`
const myComponentProps = {
  metric: {
    height: 200,
    margin: {left: 20, top: 10, right: 10, bottom: 20}
  }
};

<XVIZPanel log={log} name="Metrics" componentProps={myComponentProps} />;
```

- Default: `{}`

### Log Info

> Advanced warning: this section is for developing customized components only.

The following props are automatically populated when the `log` prop is provided. Supply these props
manually if the component is used without a `XVIZLoader` instance, e.g. connected with a Redux
store:

##### UIConfig (Object)

A Declarative UI
[Panel](https://github.com/uber/xviz/blob/master/docs/declarative-ui/layout-elements.md#Panels)
descriptor.
