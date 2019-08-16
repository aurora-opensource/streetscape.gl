# Use Custom 3D Layers

Applications can add custom [deck.gl](deck.gl) layers to enrich the log with additional graphics.
This allows applications to inject content into the 3D scene.

## Render Custom Map Layers

This example shows how to render a custom map layer that is not part of the XVIZ log.

Suppose our team has an internal map service that hosts the lane geometries data, which our
autonomous vehicle software uses, in GeoJSON format. The map is partitioned geospatially into
chunks. During the playback, we will query the service to acquire the relevant chunks to the current
viewport, and then render it with a deck.gl
[GeoJsonLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/geojson-layer).

```js
import React from 'react';
import {GeoJsonLayer} from '@deck.gl/layers';
import {LogViewer} from 'streetscape.gl';

class MapView extends React.PureComponent {
  state = {
    mapGeoJsonUrl: null
  };

  componentDidMount() {
    // Attach event listener when new log data arrives
    this.props.log.on('update', this._onDataUpdate);
  }

  componentWillUnmount() {
    // Remove event listener
    this.props.log.off('update', this._onDataUpdate);
  }

  _onDataUpdate() {
    const frame = this.props.log.getCurrentFrame();
    // `getChunkIdFromLngLat` is a utility that returns the internal map id from [longitude, latitude]
    const chunkId = getChunkIdFromLngLat(frame.trackPosition);
    this.setState({mapGeoJsonUrl: `http://our.map.service/?chunk=${chunkId}`});
  }

  render() {
    const customLayers = [
      new GeoJsonLayer({
        id: 'map-geojson-layer',
        // The layer is only re-generated if this URL changes
        data: this.state.mapGeoJsonUrl,
        stroked: true,
        filled: true,
        extruded: false,
        getFillColor: f => (f && f.properties && f.properties.fill) || [255, 0, 0],
        getLineColor: f => (f && f.properties && f.properties.stroke) || [0, 255, 0],
        getLineWidth: 0.5
      })
    ];

    return <LogViewer log={this.props.log} customLayers={customLayers} />;
  }
}
```

## Custom Rendering of a XVIZ Stream

This example replaces the default rendering of a XVIZ stream.

The hypothetical stream `/trajectory/markers` contains geometries of the primitive type
[circle](https://github.com/uber/xviz/blob/master/docs/protocol-schema/geometry-primitives.md#circle-primitive).
By default, `circle` streams are rendered with a deck.gl
[ScatterplotLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/scatterplot-layer). We
will replace it with a custon
[IconLayer](http://deck.gl/#/documentation/deckgl-api-reference/layers/icon-layer).

```js
import React from 'react';
import {IconLayer} from '@deck.gl/layers';
import {LogViewer} from 'streetscape.gl';

class MapView extends React.Component {
  streamFilter(streamName) {
    // This prevents LogViewer from generating the default layer (ScatterplotLayer) for this stream
    return streamName !== '/trajectory/markers';
  }

  render() {
    const customLayers = [
      new IconLayer({
        id: 'trajectory-makers-layer',
        iconAtlas: 'http://deck.gl/images/icon-atlas.png',

        iconMapping: {
          marker: {
            x: 0,
            y: 0,
            width: 128,
            height: 128,
            anchorY: 128,
            mask: true
          }
        },
        sizeScale: 10,
        getPosition: d => d.center,
        getIcon: d => 'marker',
        getSize: d => d.radius_m,
        getColor: [255, 140, 0],
        onHover: ({object, x, y}) => console.log(object),

        // this prop lets LogViewer know that we want to use the data and coordinate system of the specified stream
        streamName: '/trajectory/markers'
      })
    ];

    return (
      <LogViewer
        log={this.props.log}
        streamFilter={this.streamFilter}
        customLayers={customLayers}
      />
    );
  }
}
```
