/* eslint-disable camelcase */
export const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// export const MAP_STYLE = 'mapbox://styles/uberdata/cj04kmyzw003t2rml6zf8pe59';
export const MAP_STYLE = 'mapbox://styles/mapbox/dark-v9';

// OBJ model width 2073mm, length 4946mm
// Volkswagen Passat: width 1820mm, length 4780mm
export const CAR = {
  mesh: 'assets/car.obj',
  origin: [1.08, -0.32, 0],
  scale: 0.0009,
  wireframe: true
};

export const SETTINGS = {
  viewMode: {
    type: 'select',
    title: 'View Mode',
    data: {TOP_DOWN: 'Top Down', PERSPECTIVE: 'Perspective', DRIVER: 'Driver'}
  }
};

export const XVIZ_STYLE = {
  '/tracklets/objects': [{name: 'selected', style: {fill_color: '#ff8000aa'}}]
};

// LOG_DIR is defined in webpack.config.js
/* eslint-disable no-undef */
export const LOGS = [
  {
    name: 'KITTI-0005',
    path: `${LOG_DIR}/kitti/2011_09_26/2011_09_26_drive_0005_sync`,
    xvizConfig: {
      OBJECT_STREAM: '/tracklets/objects'
    }
  }
];
