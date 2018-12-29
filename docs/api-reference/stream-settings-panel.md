# StreamSettingsPanel (React Component)

Renders a stream settings editor.

```jsx
import {StreamSettingsPanel} from 'streetscape.gl';

<StreamSettingsPanel log={log} />;
```

## Properties

##### log (XVIZLoader)

The log to edit - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### style (Object, optional)

Custom CSS overrides of the control. Supports all
[Form styling](https://github.com/uber-web/monochrome/blob/master/src/form/README.md#styling)
options, plus the following:

- `badge` (Object|Function) the badge to render next to a stream label. A callback function will
  receive the following arguments:
  - `theme` (Object) - the current theme
  - `type` (String) - the XVIZ primitive type of the current stream

##### onSettingsChange (Function, optional)

Callback when the user changes the stream settings. Will receive the following parameters:

- `settings` (Object)

If the callback returns `true`, the event is considered "handled" and prevents the default behavior
(log frame update)
