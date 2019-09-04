# LaneLayer

The LaneLayer renders enhanced paths that can be used as lane markers.

```js
import {LogViewer} from 'streetscape.gl';
import {LaneLayer} from '@streetscape.gl/layers';

/**
 * Data format:
 * [
 *   {
 *     path: [[-122.450, 37.789, 0], [-122,451, 37.792, 0], ...],
 *     color: ['yellow', 'white'],
 *     dashed: [false, true]
 *   },
 *   {
 *     path: [[-122.450, 37.789, 0], [-122,451, 37.792, 0], ...],
 *     color: ['white'],
 *     dashed: [true]
 *   }
 *   ...
 * ]
 */
const COLORS = {
  yellow: [255, 255, 0],
  white: [255, 255, 255],
  none: [0, 0, 0, 0]
};

const layer = new LaneLayer({
  id: 'lane-layer',
  data,
  getPath: d => d.path,
  getWidth: d => d.color.length > 1 ? [0.05, 0.08, 0.05] : [0.05],
  getColor: d => COLORS[d.color[0]],
  getColor2: d => COLORS[d.color[1]] || COLORS.NONE,
  getDashArray: d => d.dashed[0] ? [4, 2] : [0, 0]
  getDashArray2: d => d.dashed[1] ? [4, 2] : [0, 0]
});

return (<LogViewer ... customLayers={[layer]} />);
```

## Properties

Inherits from all
[PathLayer](https://deck.gl/#/documentation/deckgl-api-reference/layers/path-layer) properties.

### Render Options

##### `highPrecisionDash` (Boolean, optional)

- Default: `false`

If `true`, generate more consistent dashes by stacking them from the beginning of the path. If
`false`, dashes are stacked from the beginning of the segment. Has an one-time performance overhead
when processing path data on the CPU.

### Data Accessors

##### `getWidth` (Function|Array, optional)

- Default: `[1]`

Returns the width of the path in an array: `[leftStroke, gap, rightStroke]`, in units specified by
`widthUnits` (default meters). `gap` and `rightStroke` default to `0` if omitted.

For example, drawing a 1m wide path using double lines with a 20% gap: `[0.4, 0.2, 0.4]`. Offsetting
a 1m wide path to the left by 1m: `[1, 2]`.

##### `getColor` (Function|Array, optional)

- Default: `[0, 0, 0, 255]`

The rgba color of the left stroke, in `r, g, b, [a]`. Each component is in the 0-255 range.

##### `getColor2` (Function|Array, optional)

- Default: `[0, 0, 0, 255]`

The rgba color of the right stroke, in `r, g, b, [a]`. Each component is in the 0-255 range.

##### `getDashArray` (Function|Array, optional)

- Default: `null`

The dash array to draw the left stroke with: `[dashSize, gapSize, dashSize, gapSize]` relative to
the width of the path.

##### `getDashArray2` (Function|Array, optional)

- Default: `null`

The dash array to draw the right stroke with: `[dashSize, gapSize, dashSize, gapSize]` relative to
the width of the path.
