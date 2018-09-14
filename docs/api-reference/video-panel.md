# VideoPanel

*Uber Confidential Information*


Renders a video frome image streams.

```jsx
import {VideoPanel} from 'streetscape.gl';

<VideoPanel log={log} width={480} />

```

## Properties

##### `log` (`XVIZLoader`)

The log to render - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### `width` (Number|String)

The width of each video. Can be a number (pixels) or a CSS string.

##### `streamFilter` (Array|String|Object|Function)

Specify which streams to render.

 - String: a single stream name to be allowed.
 - Array: multiple stream names to be allowed.
 - Object: keys are stream names. A stream is rendered if its value is truthy.
 - Function: custom callback that receives a stream name as argument and returns truthy if the stream should be rendered.
 