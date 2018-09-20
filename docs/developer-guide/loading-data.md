# Loading Data


## Loading XVIZ

Provides a set of classes to help applications load data, simplifying synchronization, random seek operations etc.


### Connecting to an XVIZ stream server

Normally XVIZ data is saved as timestamped binary frames, and by running an XVIZ streaming server you can make this data accessible to the streetscape.gl application (via a WebSocket).

The `XVIZStreamLoader` class is provided to load XVIZ data from a streaming server. Through the constructor parameters you choose which server to connect to, which log to load, the time stamp from which to start streaming, etc.

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


### Loading XVIZ data from files

It is possible to load multiple frames of XVIZ data from a single file. There are practical limits (browser memory etc) that typically restricts the practical length to less than a minute of data, but for small time ranges it can be the most convenient way to work with XVIZ data.

The `XVIZFileLoader` class is provided to load XVIZ data from files.


## Loading Complementary Data

An important use case of streetscape.gl is to load static data, such as point clouds, lane graphs. 

If you need to load 3D or geospatial file formats, like point clouds, meshes or lane graphs, take a look at the [loaders.gl](https://uber-web.github.org/loaders.gl) framework (also part of the vis.gl suite). It provides a suite of standardized loaders that were designed to work out-of-the box with streetscape.gl.

> For larger logs, loading of such contextual geospatial data should ideally be tiled, and loaded (and released) on an as-needed basis as the XVIZ visualization moves across the geography. This is a roadmap item, the current version of XVIZ does not include support for such loading.


## Loading Base Map Data

streetscape.gl renders on top of an integrated mapboxgl base map via the [react-map-gl](https://uber-web.github.org/react-map-gl) framework.


## Loading Assets

Meshes for robots and actors can be loaded using loaders.gl and visualized using e.g. the deck.gl `MeshLayer`.