/* global document, wdwindow,*/
/* eslint-disable no-console */
import * as d3 from 'd3-fetch';
import DeckGL from 'deck.gl';
import React, {PureComponent} from 'react';
import {COORDINATE_SYSTEM, MapView} from '@deck.gl/core';
import {GLBBufferUnpacker} from '@uber/xviz';
import {Matrix4} from 'math.gl';
import {PointCloudLayer} from '@deck.gl/layers'
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';

import {DATA_DIR, MAP_STYLE} from './constants';
import {loadBinary} from './ply-loader';

// Set mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const bufferUnpacker = new GLBBufferUnpacker();

const ORIGIN = {
  latitude: 37.7902527553,
  longitude: -122.400509006,
  altitude: -10.7342260228
};

const INITIAL_VIEW_STATE = {
  latitude: 37.789624956789275,
  longitude: -122.400724064268,
  zoom: 17,
  maxZoom: 100,
  pitch: 59.99,
  bearing: 89.17
};

function unpackData(metadata, data) {
  return bufferUnpacker.unpackBuffers(metadata, data);
}

function format(posBuffer, colorBuffer) {
  const positions = posBuffer;
  const size = positions.length / 3;

  const normals = new Float32Array(size * 3);
  const colors = new Uint8ClampedArray(size * 4);

  for (let i = 0; i < size; i++) {
    normals[i * 3 + 2] = 1;

    colors[i * 4 + 0] = colorBuffer[i * 3 + 0];
    colors[i * 4 + 1] = colorBuffer[i * 3 + 1];
    colors[i * 4 + 2] = colorBuffer[i * 3 + 2];
    colors[i * 4 + 3] = 255;
  }

  return {
    size,
    positions,
    normals,
    colors
  };
}

class Demo extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE,
      data: []
    };

    this._onViewportChange = this._onViewportChange.bind(this);
    this._loadData = this._loadData.bind(this);
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    loadBinary(`${DATA_DIR}/0`).then(data => {
      d3.json(`${DATA_DIR}/0-metadata.json`)
        .then(metadata => {
          const unpacked = unpackData(metadata, data);
          const size = unpacked.length / 2;
          for (let i = 0; i < size; i++) {
            // array of buffers
            // [posBuffer, colorBuffer, posBuffer, colorBuffer, ...]
            const formatted = format(unpacked[i * 2], unpacked[i * 2 + 1]);
            this.setState({
              data: [...this.state.data, formatted]
            });
          }
        });
    });
  }

  _onViewportChange(viewState) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  _getLayers() {
    const {data} = this.state;
    const coordinateProps = {
      coordinateOrigin: [ORIGIN.longitude, ORIGIN.latitude, ORIGIN.altitude],
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
    };

    const layers = [];

    for (let i = 0; i < data.length; i++) {
      const layerData = this.state.data[i];
      if (layerData) {
        layers.push(
          new PointCloudLayer({
            id: `point-cloud-layer-${i}`,
            ...coordinateProps,
            modelMatrix: new Matrix4().translate([0, 0, ORIGIN.altitude]),
            numInstances: layerData.size,
            instancePositions: layerData.positions,
            instanceNormals: layerData.normals,
            instanceColors: layerData.colors,
            radiusPixels: 2,
            lightSettings: {}
          })
        );

      }
    }

    return layers;
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;
    const {data} = this.state;

    if (!data || !data.length) {
      return null;
    }

    return (
      <div id='container'>

        <DeckGL
          width='100%'
          height='100%'
          views={new MapView({id: 'map'})}
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          controller={controller}
          onViewportChange={this._onViewportChange}
          layers={this._getLayers()}>

          {baseMap && (
            <StaticMap
              reuseMaps
              mapStyle={MAP_STYLE}
              preventStyleDiffing={true}
              mapboxApiAccessToken={MAPBOX_TOKEN}
            />
          )}

        </DeckGL>

      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Demo/>, root);

