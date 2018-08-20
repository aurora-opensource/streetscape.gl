# XVIZFileLoader

Loads a XVIZ log from static files. Implements [XVIZLoaderInterface](/docs/api-reference/xviz-loader-interface.md).

## Constructor

```js
import {XVIZFileLoader} from 'streetscape.gl';

const MAX_FRAMES = 100;
const DATA_DIR = './data';

const log = new XVIZFileLoader({
  getFileInfo: (frame) => {
    if (frame < MAX_FRAMES) {
      return {
        filePath: `${DATA_DIR}/${frame}-frame.glb`,
        fileFormat: 'glb'
      }
    }
    return null;
  },
  logGuid: 'mock'
});
```

**Options**
- `getFileInfo` (Function, required)
  + Given required frame sequence, return filePath and fileFormat of that frame.
  + Supported fileFormats are `glb` and `json`
- `serverConfig` (Object)
  +  `serverConfig.defaultLogLength` (Number, optional) - fallback value if the `duration` option is not specified.
  +  `serverConfig.worker` (String|Function, optional) - the worker script to use for message processing. (more documentation needed)
  +  `serverConfig.maxConcurrency` (Number, optional) - the maximum number of worker threads to spawn. Default `3`.
