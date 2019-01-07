# BaseWidget (React Component) (experimental)

Renders a widget that updates with the data in specified streams.

> Warning: this component is experimental and may change between minor versions. Refer to the
> CHANGELOG if you encounter any issues.

```jsx
import {_BaseWidget as BaseWidget} from 'streetscape.gl';

<BaseWidget log={log}
  streamNames={{a: '/vehicle/acceleration', v: '/vehicle/velocity'}} />
  {({streams}) => (
    <div>
      <div><b>Acceleration:</b> {stream.a.data}</div>
      <div><b>Velocity:</b> {stream.v.data}</div>
    </div>
  )}
</BaseWidget>
```

## Properties

##### log (XVIZLoader)

The log to edit - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### children (Function)

A callback function to render the content of the widget. Will receive the following parameters:

- `opts` (Object)
  - `theme` (Object) - the current theme
  - `streams` (Object) - map from the keys used in `streamNames` to the states of each stream in the
    current frame.

##### streamNames (Object)

Key to stream name mapping.

##### style (Object, optional)

Custom CSS overrides of the control. Supports the following fields:

- `wrapper` (Object|Function) - the container of the widget.

If a function is supplied, will receive the following parameters:

- `props` (Object)
  - `theme` (Object) - the current theme.
