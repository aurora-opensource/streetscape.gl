## One frame data from kitti dataset

  - `3-frame.json` - all the data in 3rd frame (except lidar-points)
  - `lidar-points.glb` - lidar data points in 3rd frame


### How to parse .glb file

```
import {unpackGLB} from './src/parsers/common';

unpackGLB('lidar-points.glb');
```
