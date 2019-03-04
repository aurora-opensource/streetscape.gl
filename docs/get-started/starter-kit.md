# Starter Kit

The [starter kit](https://github.com/uber/streetscape.gl/tree/master/examples/get-started) is a
minimal example that uses the components from streetscape.gl to display a XVIZ log. The application
demonstrates how to connect to an XVIZ source and pipe the data to the streetscape.gl components.

## Running the Example

```bash
# clone the repo
git clone https://github.com/uber/streetscape.gl.git
cd streetscape.gl/examples/get-started
# install dependencies
yarn
# start the app
yarn start
```

### Display the Base Map

You may need a Mapbox access token to display the base map. See your
[options](/docs/get-started/mapbox-tokens.md) regarding Mapbox tokens.

### Load Data from a Different Source

This example loads an XVIZ log extracted from the [KITTI](http://www.cvlibs.net/datasets/kitti/)
dataset. By default, the data is loaded from a remote URL using the
[XVIZFileLoader](/docs/api-reference/xviz-file-loader.md). You can change the URL to point to your
own files by tweaking the options in
[log-from-file.js](https://github.com/uber/streetscape.gl/tree/master/examples/get-started/log-from-file.js).

You can also use this application to stream XVIZ data from a server. To do this:

- Follow these
  [instructions](https://avs.auto/#/xviz/getting-started/converting-to-xviz/viewing-the-generated-xviz)
  to start a local XVIZ stream server
- In the get-started example directory, run `yarn start-streaming`.

You can change the streaming options in
[log-from-stream.js](https://github.com/uber/streetscape.gl/tree/master/examples/get-started/src/log-from-stream.js).

## Application Controls

- Mouse controls

  - shift + drag => rotate
  - drag => pan
  - wheel/pinch => zoom

- Object interactions
  - click on charts to jump to time
  - click on objects in the 3D view to select and show context info

## Application Walk-through

This section will cover some of the key parts in the main application source code in
[app.js](https://github.com/uber/streetscape.gl/tree/master/examples/get-started/src/app.js).

### XVIZ Configuration

```js
setXVIZConfig(XVIZ_CONFIG);
setXVIZSettings(XVIZ_SETTINGS);
```

This call to
[setXVIZConfig and setXVIZSettings](https://github.com/uber/xviz/blob/master/docs/api-reference/xviz-configuration.md)
sets the configuration for log parsing and synchronization in XVIZ. The config is used by XVIZ
libraries to collect and associated information across streams, as well as generating proper frames
for the playback.

### Connecting to XVIZ Server

```js
componentDidMount() {
  this.state.log.connect();
}
```

The application uses either the [XVIZFileLoader](/docs/api-reference/xviz-file-loader.md) or the
[XVIZStreamLoader](/docs/api-reference/xviz-stream-loader.md) to obtain XVIZ data. The default
connection parameters are defined in in
[constants.js](https://github.com/uber/streetscape.gl/tree/master/examples/get-started/src/constants.js).

### Log Playback Components

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

### Declarative UI Components

```jsx
<div id="control-panel">
  <XVIZPanel log={log} name="Camera" />
  <hr />
  <XVIZPanel log={log} name="Metrics" />
</div>
```

An important part of XVIZ is the
[Declarative UI](https://github.com/uber/xviz/blob/master/docs/declarative-ui/overview.md) which
allows UI elements to be data-driven with bindings to XVIZ streams. This enables engineers to create
controls that are defined at the source of the data generation without the need to know the
specifics of the client implementation.

The [XVIZPanel](/docs/api-reference/xviz-panel.md) component in streetscape.gl renders any valid
panel definition that is compliant with the XVIZ declarative UI spec.
