# XVIZLiveLoader

Connects to a live XVIZ system using a WebSocket. Implements
[XVIZLoaderInterface](/docs/api-reference/xviz-loader-interface.md).

A **live** XVIZ system describes a running system does not have a start and end time available in
the metadata and will send XVIZ data immediately upon connection.

The XVIZLiveLoader will also immediately update the scene to the timestamp of the latest received
XVIZ message.

## Constructor

```js
import {XVIZLiveLoader} from 'streetscape.gl';

new XVIZLiveLoader({
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
- `logProfile` (String, optional) - Name of the profile to load the log with
- `bufferLength` (Number, optional) - the length of the buffer to keep in memory. Uses the same unit
  as timestamp. If specified, older frames may be discarded during playback, to avoid crashes due to
  excessive memory usage. Default 30 seconds.
- `worker` (String|Boolean, optional) - Use a worker for message processing. Default `true`.
  - Type `Boolean`: enable/disable default worker
  - Type `String`: the worker URL to use
- `maxConcurrency` (Number, optional) - the maximum number of worker threads to spawn. Default `3`.
