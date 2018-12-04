# PlaybackControl (React Component)

_Uber Confidential Information_

Renders a playback control for a XVIZ log.

```jsx
import {PlaybackControl} from 'streetscape.gl';

<PlaybackControl log={log} />;
```

## Properties

##### `log` (`XVIZLoader`)

The log to render - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### `width` (`String`|`Number`, optional)

Width of the control. Default `100%`.

##### `compact` (`Boolean`, optional)

Use compact layout. Default `false`.

##### `tickSpacing` (`Number`, optional)

Spacing between ticks in pixels, default `100`.

##### `formatTick` (`Function`, optional)

Format of ticks. Receives parameters:

- `t` (`Number`) - the timestamp to format
- `startTime` (`Number`) - the start time of the log.

Default formats the time since start into `mm:ss`.

##### `formatTimestamp` (`Function`, optional)

Format of the current time label. Receives parameters:

- `t` (`Number`) - the timestamp to format
- `startTime` (`Number`) - the start time of the log.

Default formats the time since start into `mm:ss`.

##### `formatLookAhead` (`Function`, optional)

Format of the current look ahead offset label. Receives parameters:

- `t` (`Number`) - the look ahead value

Default formats the value into `ss.S`.

##### `maxLookAhead` (`Number`, optional)

Max value of the look ahead offset. If `0`, the look ahead slider will be hidden.

Default `10000`.

##### `className` (`String`, optional)

Additional class name.

##### `style` (`Object`, optional)

Custom CSS overrides of the control. Supports all [PlaybackControl styling](https://github.com/uber-web/monochrome/blob/master/docs/api-reference/playback-control.md#styling) options, plus the following:

* `lookAheadMarker` **(`Object`|`Function`)** - the marker that indicates the 
* `lookAhead` **(`Object`|`Function`)** - the container around the look ahead control.
* `lookAheadSlider` **(`Object`)** - the look ahead slider. See [styling a slider](https://github.com/uber-web/monochrome/blob/master/docs/api-reference/slider.md#styling).
* `lookAheadTimestamp` **(`Object`|`Function`)** - the timestamp showing the value of the look ahead slider.
