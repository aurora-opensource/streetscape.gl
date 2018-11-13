# XVIZFileLoader

Loads a XVIZ log from static files. Implements [XVIZLoaderInterface](/docs/api-reference/xviz-loader-interface.md).

## Constructor

```js
import {XVIZFileLoader} from 'streetscape.gl';

const MAX_FRAMES = 100;
const DATA_DIR = './data';

const log = new XVIZFileLoader({
  numberOfFrames: 100,
  getFilePath: (frameIndex) => `${DATA_DIR}/${frameIndex}-frame.glb`
});
```

**Options**
- `numberOfFrames` (Number, required) - number of frames to load
- `getFilePath` (Function, required) - Given a frame index, return the url to the file of that frame. Supported fileFormats are `glb` and `json`
- `worker` (String|Boolean, optional) - Use a worker for message processing. Default `true`.
  + Type `Boolean`: enable/disable default worker
  + Type `String`: the worker URL to use
- `maxConcurrency` (Number, optional) - the maximum number of worker threads to spawn. Default `3`.
