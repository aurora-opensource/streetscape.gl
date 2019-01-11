# TrafficLightLayer

The TrafficLightLayer renders traffic faces.

```js
import {LogViewer} from 'streetscape.gl';
import {TrafficLightLayer} from '@streetscape.gl/layers';

/**
 * Data format:
 * [
 *   {
 *     position: [-122.45, 37.7, 3],
 *     angle: 0,
 *     color: 'green'
 *     shape: 'left_arrow'
 *     on: 0
 *   },
 *   {
 *     position: [-122.45, 37.7, 3.5],
 *     angle: Math.PI / 2,
 *     color: 'green',
 *     shape: 'circular'
 *     on: 1
 *   },
 *   ...
 * ]
 */
const layer = new TrafficLightLayer({
  id: 'traffic-light-layer',
  data,
  getPosition: d => d.position,
  getColor: d => d.color,
  getShape: d => d.shape,
  getAngle: d => d.angle,
  getState: d => d.on
});

return (<LogViewer ... customLayers={[layer]} />);
```

## Properties

### Render Options

##### `sizeScale` (Number, optional)

- Default `1`.

Multiplier to scale each geometry by.


##### `fp64` (Boolean, optional)

- Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode


##### `lightSettings` (Object, optional)

**EXPERIMENTAL**

This is an object that contains light settings for extruded polygons.
Be aware that this prop will likely be changed in a future version of deck.gl.


### Data Accessors

##### `getPosition` (Function, optional)

- Default: `object => object.position`

The accessor used to retrieve the center position corresponding to an object in the `data` stream.


##### `getAngle` (Function|Number, optional)

- Default: `0`

The accessor used to retrieve the rotation in radians for each light. `0` faces east.

* If a number is provided, it is used as the angle for all objects.
* If a function is provided, it is called on each object to retrieve its angle.


##### `getColor` (Function, optional)

- Default: `object => 'green'`

The accessor used to retrieve the color for each light. One of `red`, `yellow`, `green`.


##### `getShape` (Function, optional)

- Default: `object => 'circular'`

The accessor used to retrieve the shape for each light. One of `circular`, `left_arrow`, `right_arrow`.


##### `getState` (Function|Number, optional)

- Default: `1`

The accessor used to retrieve the state for each light. Return `1` for "on" and `0` for "off".

* If a number is provided, it is used as the state for all objects.
* If a function is provided, it is called on each object to retrieve its state.
