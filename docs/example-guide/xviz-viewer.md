# XVIZ Viewer

# Overview

The XVIZ viewer is a React application that uses the components from streetscape.gl. The application
demonstrates how to connect to an XVIZ source and pipe the data to the streetscape.gl components.

# Application Walk-through

## XVIZ Configuration

Lets cover the key lines in the main application source code.

[XVIZ-Viewer app.js](https://github.com/uber/streetscape.gl/tree/master/examples/clients/xviz-viewer/app.js)

```js
import 'xviz-config';
```

This import is handled by webpack and resolves to
[Example XVIZ Config](https://github.com/uber/streetscape.gl/tree/master/examples/clients/config/xviz-config-kitti.js)

This import calls [setXVIZConfig](TODO) which sets a configuration setting for the primary object
stream in XVIZ. This setting is used by XVIZ libraries to set the primary object stream which will
collect ID's of objects and associated information across streams. This information is made
accessible through the [XVIZObjectCollection](TODO) instance.

### Connecting to XVIZ Server

```js
    log: new XVIZStreamLoader({
      logGuid: 'mock',
      // bufferLength: 15000,
      serverConfig: {
        defaultLogLength: 30000,
        serverUrl: 'ws://localhost:8081'
      },
      worker: true,
      maxConcurrency: 4
    }).on('error', console.error), // eslint-disable-line
```

The application uses the [XVIZStreamLoader](/docs/api-reference/xviz-stream-loader.md) to obtain
XVIZ data.

This example is configured to connect to the
[Example XVIZ Server](/docs/example-guide/xviz-server.md) which currently ignores the _logGuid_
property.

### streetscape.gl Components

```jsx
        <div id="map-view">
          <LogViewer
            log={log}
            mapboxApiAccessToken={MAPBOX_TOKEN}
            mapStyle={MAP_STYLE}
            car={CAR}
            xvizStyles={XVIZ_STYLE}
            viewMode={VIEW_MODE[settings.viewMode]}
          />
        </div>
        <div id="timeline">
          <PlaybackControl
            width="100%"
            log={log}
            formatTimestamp={x => new Date(x).toUTCString()}
          />
        </div>
```

Here we can see how the _log_ from the _XVIZStreamLoader_ is passed to the
[LogViewer](/docs/api-reference/log-viewer.md) and controls
[PlaybackControl](/docs/api-reference/playback-control.md). The same log is passed into the
[PlaybackControl](/docs/api-reference/playback-control.md).

Each component will use the [XVIZLoaderInterface](/docs/api-reference/xviz-loader-interface.md) to
access the necessary data from the log.

### XVIZ Panels

```jsx
        <div id="control-panel">
          /// ...
          <XVIZPanel log={log} name="Metrics" />
        </div>
        <div id="video-panel">
          <XVIZPanel log={log} name="Camera" />
        </div>
```

An important part of XVIZ is the [Declarative UI](TODO) which allows UI elements to be data-driven
with bindings to XVIZ streams. This enables engineers to create controls that are defined at the
source of the data generation without the need to know the specifics of the client implementation.

We can see in this example from the KITTI converter
[Declarative UI](examples/converters/kitti/src/converters/declarative-ui.js) that shows how the
_name_ of the [XVIZPanel](/docs/api-reference/xviz-panel.md) is used to connect the XVIZ data and UI
components.

## Application Controls

- Mouse controls

  - shift + click => rotate
  - option + click => rotate
  - command + click => rotate
  - click => pan
  - wheel/pinch => zoom

- Object interactions
  - click on charts to jump to time
  - click on rectangles to select and show context info
