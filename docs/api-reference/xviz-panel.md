# XVIZPanel (React Component)

_Uber Confidential Information_

Renders a XVIZ panel from a Declarative UI
[Panel](https://github.com/uber/xviz/blob/master/docs/declarative-ui/layout-elements.md#Panels)
definition.

```jsx
import {XVIZPanel} from 'streetscape.gl';

<XVIZPanel log={log} name="Metrics" />;
```

## Properties

##### `log` (`XVIZLoader`)

The log to render - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### `name` (String)

The identifier of the panel to render. The definition for this panel must be supplied via the
metadata of the log.

##### `style` (Object, optional)

Custom CSS overrides. May contain the following keys:

- `metric`: passed to [XvizMetricComponent](/docs/api-reference/xviz-metric-component)'s `style`
  prop
- `plot`: passed to [XvizPlotComponent](/docs/api-reference/xviz-plot-component)'s `style` prop
- `table` and `treetable`: passed to
  [XvizTableComponent](/docs/api-reference/xviz-table-component)'s `style` prop
- `video`: passed to [XvizVideoComponent](/docs/api-reference/xviz-video-component)'s `style` prop

#### `components` (Object, optional)

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

#### `componentProps` (Object, optional)

Supply custom props for each XVIZ Declarative UI components. Key is declarative UI component types
and value is an object of custom props.

For a list of customizable props, see the documentation for each component:

- `metric`: [XvizMetricComponent](/docs/api-reference/xviz-metric-component)
- `plot`: [XvizPlotComponent](/docs/api-reference/xviz-plot-component)
- `table` and `treetable`: [XvizTableComponent](/docs/api-reference/xviz-table-component)
- `video`: [XvizVideoComponent](/docs/api-reference/xviz-video-component)

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
