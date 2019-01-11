# SignLayer

The SignLayer renders traffic signs.

```js
import {LogViewer} from 'streetscape.gl';
import {SignLayer} from '@streetscape.gl/layers';

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
const layer = new SignLayer({
  id: 'sign-layer',
  data,
  iconAtlas: SIGN_ATLAS_IMAGE,
  iconMapping: SIGN_MAPPING_JSON,

});

return (<LogViewer ... customLayers={[layer]} />);
```

## Properties

Inherits from all [Base Layer](/docs/api-reference/layer.md) properties.

### Render Options

##### `iconAtlas` (Texture2D | String, required)

Atlas image url or texture

##### `iconMapping` (Object | String, required)

Sign names mapped to sign definitions. Each sign is defined with the following values:

* `x`: x position of sign on the atlas image
* `y`: y position of sign on the atlas image
* `width`: width of sign on the atlas image
* `height`: height of sign on the atlas image
* `anchorX`: horizontal position of sign anchor. Default: half width.
* `anchorY`: vertical position of sign anchor. Default: half height.

##### `sizeScale` (Number, optional)

* Default: `1`

Size multiplier.

##### `render3D` (Boolean, optional)

* Default: `false`

If `true`, the sign is rendered as a vertical surface, at the altitude specified by `getPosition` and facing the direction specified by `getAngle`.

If `false`, the sign is rendered as a horizontal surface, at the ground level facing up. This is useful in top-down view mode.


##### `fp64` (Boolean, optional)

* Default: `false`

Whether the layer should be rendered in high-precision 64-bit mode. Note that since deck.gl v6.1, the default 32-bit projection uses a hybrid mode that matches 64-bit precision with significantly better performance.

### Data Accessors

##### `getPosition` (Function, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `d => d.position`

Method called to retrieve the position of each object, returns `[lng, lat, z]`.

##### `getIcon` (Function, optional)

* Default: `d => d.icon`

Method called to retrieve the sign name of each object, returns string.

##### `getSize` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `1`

The height of each object, in pixels.

* If a number is provided, it is used as the size for all objects.
* If a function is provided, it is called on each object to retrieve its size.


##### `getAngle` (Function|Number, optional) ![transition-enabled](https://img.shields.io/badge/transition-enabled-green.svg?style=flat-square")

* Default: `0`

The rotating angle of each object, in radians.

* If a number is provided, it is used as the angle for all objects.
* If a function is provided, it is called on each object to retrieve its angle.

