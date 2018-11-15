/* global fetch */
import {TileLayer} from '@deck.gl/experimental-layers';
import {CompositeLayer} from 'deck.gl';
import {decodeTile} from './utils/decode';

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

function getTileData({x, y, z}) {
  const mapSource = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=${MAPBOX_TOKEN}`;
  return fetch(mapSource)
    .then(response => {
      return response.arrayBuffer();
    })
    .then(buffer => {
      return decodeTile(x, y, z, buffer);
    });
}

export default class BuildingLayer extends CompositeLayer {
  renderLayers() {
    return new TileLayer({
      id: 'base-3d-building-layer',
      filled: false,
      extruded: true,
      wireframe: true,
      getElevation: f => f.properties.height || 0,
      getLineColor: [255, 255, 255],
      getTileData
    });
  }
}
