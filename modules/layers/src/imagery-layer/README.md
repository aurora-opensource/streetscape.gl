# ImageryLayer

The ImageryLayer renders a ground imagery.

```js
import {LogViewer} from 'streetscape.gl';
import {ImageryLayer} from '@streetscape.gl/layers';

const layer = new ImageryLayer({
  id: 'ground-imagery-layer',
  heightMap: 'assets/height-map.gif',
  heightMapBounds: [-50, -50, 50, 50],
  heightRange: [10, 200],
  imagery: 'assets/satellite-imagery.jpg',
  imageryBounds: [-50, -50, 50, 50],
  desaturate: 0,
  transparentColor: [0, 0, 0, 0],
  tintColor: [255, 255, 255]
});

return (<LogViewer ... customLayers={[layer]} />);
```

## Properties

### Data

##### `imagery` (String|Texture2D)

- Default `null`.

The camera image of the terrain.

##### `imageryBounds` (Array)

The `[west, south, east, north]` coordinates that is the bounding box of the camera image.


##### `heightMap` (String|Texture2D, optional)

- Default `null`.

An image that maps the height of the terrain to pixel brightness. If not specified, the terrain will be rendered as flat.

##### `heightMapBounds` (Array, optional)

The `[west, south, east, north]` coordinates that is the bounding box of the height map image. Must be specified if using `heightMap`.

##### `heightRange` (Array, optional)

The `[minZ, maxZ]` range of the heightMap. `minZ` maps to a black pixel and `maxZ` maps to a white pixel. Must be specified if using `heightMap`.


### Render Options

##### `uCount` (Integer)

- Default `1`

The west-east resolution of the terrain.

##### `vCount` (Integer)

- Default `1`

The south-north resolution of the terrain.

##### `desaturate` (Number)

- Default `0`

The desaturation of the camera image. Between `[0, 1]`. `0` being the original color and `1` being grayscale.


##### `transparentColor` (Array)

- Default `[0, 0, 0, 0]`

The color to use for transparent pixels, in `[r, g, b, a]`. Each component is in the `[0, 255]` range.

##### `tintColor` (Array)

- Default `[255, 255, 255]`

The color to tint the image by, in `[r, g, b]`. Each component is in the `[0, 255]` range.

