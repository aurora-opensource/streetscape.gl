# TurnSignalWidget (React Component)

Renders a widget that shows the current state of the turn signals.

![TurnSignalWidget](../images/turn-signal-widget.png)

```jsx
import {TurnSignalWidget} from 'streetscape.gl';

<TurnSignalWidget log={log} streamName="/vehicle/turn_signal" />;
```

## Properties

##### log (XVIZLoader)

The log to edit - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### streamName (String)

The name of the variable stream that supplies the current state of the turn signals. To show one or
both turn signals as on, the value is expeceted to be one of `left`, `right` or `both`. Use
`transformValue` if the stream is in a different scheme.

##### transformValue (Function, optional)

Callback to convert a value to the expected format.

##### style (Object, optional)

Custom CSS overrides of the control. Supports the following fields:

- `wrapper` (Object|Function) - the container of the widget.
- `arrow` (Object|Function) - each arrow component. This is a SVG element.

If a function is supplied, will receive the following parameters:

- `props` (Object)
  - `theme` (Object) - the current theme.
  - `isOn` (Boolean) - if the target light is on.
