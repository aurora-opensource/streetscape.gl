# streetscape.gl Starter Kit

This is a minimal example that uses the components from streetscape.gl to display a XVIZ log.

[Instructions for running this application](../../docs/get-started/starter-kit.md)

## Application mode overview

The default mode for this application, ie `yarn start`, is to fetch packages from the public
repository and access data from S3.

There are other modes of running that can be useful and all modes are described below.

- `yarn start` -- fetch public packages and access data from S3
- `yarn start-live` -- fetch public packages, access data from localhost
- `yarn start-streaming` -- fetch public packages and access data from localhost
- `yarn start-local` -- use local source code and access data from S3
- `yarn start-live-local` -- use local source code, access data from localhost
- `yarn start-streaming-local` -- fetch public packages and access data from localhost

### _local_ mode

**local** mode is used to test the local source code rather than the published packages. This is
extremely useful for local development.

This is achieved by using webpack to resolve to the local source code rather than the node_modules
packages.

### _streaming_ mode

XVIZ data can be loaded from multiple sources. The default for this application is to load from S3.

When using the **streaming** mode the application will look for a local XVIZ Server. See
[log-from-stream.js](./src/log-from-stream.js) for the implementation details and options available.

### _live_ mode

**live** mode is for connecting to an online system and visualizing only the current state.

The application will change the following characteristics in **live** mode:

- Limit the XVIZ data size stored to ensure consistent playback performance
- Automatically show the latest state of the system and remove the playback control

See [log-from-live.js](./src/log-from-live.js) for the implementation details and options available.
