/* global document, wdwindow,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {Matrix4} from 'math.gl';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, MapView, MapController} from 'deck.gl';
import * as d3 from 'd3-fetch';
import {GLBBufferUnpacker} from '@uber/xviz';

import {loadBinary} from './ply-loader';
import {DATA_DIR, MAP_STYLE} from './constants';

const NUM_CHUNKS = 13;

const bufferUnpacker = new GLBBufferUnpacker();

const ORIGIN = {
  latitude: 37.7902527553,
  longitude: -122.400509006,
  altitude: -10.7342260228
};

const INITIAL_VIEW_STATE = {
  latitude: 37.789624956789275,
  longitude: -122.400724064268,
  zoom: 20,
  pitch: 59.99,
  bearing: 89.17
};

function getRange(positions, resMap) {
  const size = positions.length / 3;

  for (let i = 0; i < size; i = i + 3) {
    resMap.xMin = Math.min(resMap.xMin, positions[i * 3]);
    resMap.yMin = Math.min(resMap.yMin, positions[i * 3 + 1]);
    resMap.zMin = Math.min(resMap.zMin, positions[i * 3 + 2]);
    resMap.xMax = Math.max(resMap.xMax, positions[i * 3]);
    resMap.yMax = Math.max(resMap.yMax, positions[i * 3 + 1]);
    resMap.zMax = Math.max(resMap.zMax, positions[i * 3 + 2]);
  }

  return resMap;
}

function unpackData(metadata, data) {
  return bufferUnpacker.unpackBuffers(metadata, data);
}

function format(metadata, data) {
  const unpacked = unpackData(metadata, data);
  const positions = unpacked[0];
  const size = positions.length / 3;

  const normals = new Float32Array(size * 3);
  const colors = new Uint8ClampedArray(size * 4);

  for (let i = 0; i < size; i++) {
    normals[i * 3 + 2] = 1;

    colors[i * 4 + 0] = unpacked[1][i * 3 + 0];
    colors[i * 4 + 1] = unpacked[1][i * 3 + 1];
    colors[i * 4 + 2] = unpacked[1][i * 3 + 2];
    colors[i * 4 + 3] = 255;
  }

  return {
    size,
    positions,
    normals,
    colors
  };
}

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE
    };

    this._onViewportChange = this._onViewportChange.bind(this);
    this._loadData = this._loadData.bind(this);
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    const resMap = {
      xMin: Number.POSITIVE_INFINITY,
      xMax: Number.NEGATIVE_INFINITY,
      yMin: Number.POSITIVE_INFINITY,
      yMax: Number.NEGATIVE_INFINITY,
      zMin: Number.POSITIVE_INFINITY,
      zMax: Number.NEGATIVE_INFINITY
    };


    for (let i = 0; i < NUM_CHUNKS; i++) {
      loadBinary(`${DATA_DIR}/${i}`).then(data => {
        d3.json(`${DATA_DIR}/${i}-metadata.json`)
          .then(metadata => {
            const newData = format(metadata, data);
            getRange(newData.positions, resMap);
            this.setState({
              [`data${i}`]: newData
            });
          });
      });
    }

    console.log(' range  ', resMap)
  }

  _onViewportChange(viewState) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  _getLayers() {
    const coordinateProps = {
      coordinateOrigin: [ORIGIN.longitude, ORIGIN.latitude, ORIGIN.altitude],
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
    };

    const layers = [];

    for (let i = 0; i < NUM_CHUNKS; i++) {
      const layerData = this.state[`data${i}`];
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
    const {viewState, data0} = this.state;

    if (!data0 || !data0.size) {
      return null;
    }

    return (
      <div id="container">

        <DeckGL
          width="100%"
          height="100%"
          views={new MapView({id: 'map'})}
          viewState={viewState}
          controller={MapController}
          onViewportChange={this._onViewportChange}
          layers={this._getLayers()} >

          <StaticMap {...viewState}
            viewId="map"
            mapStyle={MAP_STYLE} />

        </DeckGL>

      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example/>, root);

