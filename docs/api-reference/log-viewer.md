# LogViewer (React Component)

Renders a 3D view of a XVIZ log.

```jsx
import {LogViewer, VIEW_MODES} from 'streetscape.gl';

<LogViewer log={log} xvizStyle={xvizStyle} viewMode={VIEW_MODES.TOP_DOWN} />

```

## Properties

##### `log` (`XVIZLoader`)

The log to render - an [XVIZLoader](/docs/api-reference/xviz-loader-interface.md) object.

##### `xvizStyle` (Object, optional)

An XVIZ stylesheet that defines the visual properties of each stream. See XVIZ documentation for specifications.

##### `mapStyle` (Object|String, optional)

A [Mapbox style](https://www.mapbox.com/mapbox-gl-js/api/#map) to render the base map with.

##### `car` (Object, optional)

Defines the car asset. May contain the following fields:

- `mesh` (String) - path to a .OBJ file that is the car model
- `texture` (String) - path to an image file that is the texture for the model
- `scale` (Number) - size scale of the car
- `origin` ([Number, Number, Number]) - offset of the model origin

##### `viewMode` (Enum, optional)

A value of the `VIEW_MODES` enum.

```
import {VIEW_MODES} from 'streetscape.gl';
```

- `VIEW_MODES.TOP_DOWN` - orthographic view at the car from the top.
- `VIEW_MODES.PERSPECTIVE` - perspective view at the car. Users can freely pan and rotate.
- `VIEW_MODES.DRIVER` - perspective view from the car.

