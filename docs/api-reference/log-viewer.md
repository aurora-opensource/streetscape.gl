# LogViewer (React Component)

_Uber Confidential Information_

Renders a 3D view of a XVIZ log.

```jsx
import {LogViewer, VIEW_MODE} from 'streetscape.gl';

<LogViewer log={log} viewMode={VIEW_MODE.TOP_DOWN} />;
```

## Properties

##### log (XVIZLoader)

The log to render - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### mapboxApiAccessToken (String, optional)

A [Mapbox API access token](https://www.mapbox.com).

##### mapStyle (Object|String, optional)

A [Mapbox style](https://www.mapbox.com/mapbox-gl-js/api/#map) to render the base map with.

##### xvizStyles (Object, optional)

Override the XVIZ styles. If supplied, will be deep-merged with the styles in the log metadata.

For more information, see
[XVIZ styling specification](https://github.com/uber/xviz/blob/master/docs/protocol-schema/style-specification.md).

##### car (Object, optional)

Defines the car asset. May contain the following fields:

- `mesh` (String) - path to a .OBJ file that is the car model
- `texture` (String) - path to an image file that is the texture for the model
- `scale` (Number) - size scale of the car
- `origin` ([Number, Number, Number]) - offset of the model origin

##### streamFilter (Array|String|Object|Function, optional)

Specify which streams to render.

- String: a single stream name to be allowed.
- Array: multiple stream names to be allowed.
- Object: keys are stream names. A stream is rendered if its value is truthy.
- Function: custom callback that receives a stream name as argument and returns truthy if the stream
  should be rendered.

##### customLayers (Array, optional)

A list of additional layers to render.

```jsx
import {LogViewer} from 'streetscape.gl';
import {ScatterplotLayer} from 'deck.gl';

const customLayers = [
  new ScatterplotLayer({
    id: 'custom-scatterplot',

    // Scatterplot layer render options
    getPosition: d => d.position,
    getRadius: 1,
    getColor: [255, 0, 0],

    // log-related options
    streamName: '/tracklets/label',
    coordinate: 'vehicle_relative'
  })
];

<LogViewer log={log} customLayers={customLayers} />;
```

Each layer must be a deck.gl `Layer` instance. In addition to deck.gl's layer properties, you may
add the following props:

- `streamName` (String) - if supplied, the layer will receive the primitives from the current frame
  as `data`, and will use the stream's coordinate system as defined in the log metadata.

If `streamName` is not supplied, a custom layer is expected to bring its own data. In this case, you
may still supply these props in order to use a specific coordinate system from the current frame:

- `coordinate` (String)
- `pose` (Object)

See XVIZ's stream metadata spec for details.

##### viewMode (Enum, optional)

A value of the `VIEW_MODE` enum.

```
import {VIEW_MODE} from 'streetscape.gl';
```

- `VIEW_MODE.TOP_DOWN` - orthographic view at the car from the top.
- `VIEW_MODE.PERSPECTIVE` - perspective view at the car. Users can freely pan and rotate.
- `VIEW_MODE.DRIVER` - perspective view from the car.

##### viewState (Object, optional)

##### viewOffset (Object, optional)

Override the internal view state and view offset. By default, `LogViewer` is a stateful component
which stores the latest camera state internally. Supply these props if you wish to use it as a
stateless component. See `onViewStateChange` for more information.

##### onViewStateChange (Function, optional)

Callback when the view state changes.

To use `LogViewer` as a stateless component:

```jsx
import {LogViewer, VIEW_MODE} from 'streetscape.gl';

<LogViewer
  log={log}
  viewMode={VIEW_MODE.TOP_DOWN}
  viewState={this.state.viewState}
  viewOffset={this.state.viewOffset}
  onViewStateChange={({viewState, viewOffset}) => this.setState({viewState, viewOffset})}
/>;
```

<<<<<<< HEAD
##### `onSelectObject` (Function, optional)

Callback when an object is left clicked on.

##### `onContextMenu` (Function, optional)

Callback when an object is right clicked on.

##### `objectStates` (Object, optional)
=======
##### objectStates (Object, optional)
>>>>>>> 80465de... consistent formatting documentations

Override the internal object states. By default, `LogViewer` is a stateful component which stores
the latest object states internally. Supply this prop if you wish to use it as a stateless
component. See `onObjectStateChange` for more information.

##### onObjectStateChange (Function, optional)

Callback when some object state (e.g. whether they are selected) changes.

To use `LogViewer` as a stateless component:

```jsx
import {LogViewer} from 'streetscape.gl';

<LogViewer
  log={log}
  objectStates={this.state.objectStates}
  onViewStateChange={objectStates => this.setState({objectStates})}
/>;
```

##### getTransformMatrix (Function, optional)

A custom function that is called if a stream's `coordinate` is `DYNAMIC`. Will receive the following
props:

- `key` (String) - key of the transform, as specified in the stream's metadata
- `context` (Object) - the current frame

Default: `() => null`

##### renderObjectLabel (Function, optional)

A custom function / React component to render the content of the popup for selected objects. Will
receive the following props:

- `id` (String) - object id
- `object` (Object) - selected object
- `metadata` (Object) - log metadata
- `frame` (Object) - current log frame

Popups will be disabled if this prop is set to `false`.

Default: `(props) => <div>{props.id}</div>`

##### objectLabelColor (String, optional)

Color of the object label.

##### style (Object, optional)

Custom CSS overrides. May contain the following fields:

- `objectLabelColor` (String) - color of the object labels
- `objectLabelTipSize` (Number) - size of the object labels
- `objectLabelTip` (Object|Function) - the pointer on the object
- `objectLabelLine` (Object|Function) - the line connecting the object and its label
- `objectLabelBody` (Object|Function) - the body of the object label.
- `tooltip` (Object|Function) - the hover tooltip.

A custom style callback function will receive the following arguments:

- `props` (Object)
  - `theme` (Object) - the current theme
  - `position` (String) - position of the label relative to the object

##### `showMap` (Boolean, Optional)

Render base map. Default is `true`.

##### `showTooltip` (Boolean, optional)

Render hover tooltip. Default is `false`.
