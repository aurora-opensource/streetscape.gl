# XVIZStreamLoader

*Uber Confidential Information*


Loads a streamed XVIZ log using WebSocket. Implements [XVIZLoaderInterface](/docs/api-reference/xviz-loader-interface.md).

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
  +  `serverConfig.serverUrl` (String) - url of the WebSocket server
  +  `serverConfig.queryParams` (Object, optional) - additional query parameters to use when connecting to the server
  +  `serverConfig.defaultLogLength` (Number, optional) - fallback value if the `duration` option is not specified.
  +  `serverConfig.retryAttempts` (Number, optional) - number of retries if a connection error is encountered. Default `3`.
  +  `serverConfig.worker` (String|Function, optional) - the worker script to use for message processing. (more documentation needed)
  +  `serverConfig.maxConcurrency` (Number, optional) - the maximum number of worker threads to spawn. Default `3`.
- `logGuid` (String) - Id of the log to load
- `logProfile` (String, optional) - Name of the profile to load the log with
- `duration` (Number, optional) - Length of the log
- `timestamp` (Number, optional) - the timestamp to start loading at

