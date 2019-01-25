# CarMesh

Utility to generate simple, nondescript cars for use with
[LogViewer](/docs/api-reference/log-viewer.md).

```js
import {LogViewer, CarMesh} from 'streetscape.gl';

const CAR = CarMesh.sedan({width: 2.2, length: 4.5, height: 1.5, color: [200, 128, 128]});

<LogViewer log={log} car={CAR} />;
```

Each car type accepts the following options:

- `length` (Number) - length of the car, in meters.
- `width` (Number) - width of the car, in meters.
- `height` (Number) - height of the car, in meters.
- `color` (Array) - RGBA color of the car, default `[128, 128, 128, 255]`.
- `origin` (Array) - `[x, y, z]` offset of the center, in meters. Without an offset, the center of
  the car is at the midpoint of both width and length, on the ground level.

## Static Methods

##### sedan(options)

![Sedan](../images/car-mesh-sedan.png)

Returns a car descriptor object that can be supplied to `LogViewer`'s `car` prop.
