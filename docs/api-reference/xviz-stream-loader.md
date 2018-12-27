# XVIZStreamLoader

Loads a streamed XVIZ log using WebSocket. Implements
[XVIZLoaderInterface](/docs/api-reference/xviz-loader-interface.md).

## Constructor

```js
import {XVIZStreamLoader} from 'streetscape.gl';

new XVIZStreamLoader({
  logGuid: 'da8b1c9c-cbfb-4ddd-c14c-4692b36456ef',
  timestamp: 1194278450,
  duration: 30000,
  serverConfig: {
    serverUrl: 'ws://localhost:8081'
  }
});
```

**Options**

- `serverConfig` (Object)
  - `serverConfig.serverUrl` (String) - url of the WebSocket server
  - `serverConfig.queryParams` (Object, optional) - additional query parameters to use when
    connecting to the server
  - `serverConfig.defaultLogLength` (Number, optional) - fallback value if the `duration` option is
    not specified.
  - `serverConfig.retryAttempts` (Number, optional) - number of retries if a connection error is
    encountered. Default `3`.
- `logGuid` (String) - Id of the log to load
- `logProfile` (String, optional) - Name of the profile to load the log with
- `duration` (Number, optional) - Length of the log
- `timestamp` (Number, optional) - the timestamp to start loading at
- `bufferLength` (Number, optional) - the length of the buffer to keep in memory. Uses the same unit
  as timestamp. If specified, older frames may be discarded during playback, to avoid crashes due to
  excessive memory usage. Default 30 seconds.
- `worker` (String|Boolean, optional) - Use a worker for message processing. Default `true`.
  - Type `Boolean`: enable/disable default worker
  - Type `String`: the worker URL to use
- `maxConcurrency` (Number, optional) - the maximum number of worker threads to spawn. Default `3`.
