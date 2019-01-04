import loadOBJMesh from './utils/load-obj-mesh';

/* eslint-disable camelcase */
export const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const MAP_STYLE = 'mapbox://styles/uberdata/cjfxhlikmaj1b2soyzevnywgs';

// OBJ model width 2073mm, length 4946mm
// Volkswagen Passat: width 1820mm, length 4780mm
export const CAR = {
  mesh: loadOBJMesh('assets/car.obj'),
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

// LOG_DIR is defined in webpack.config.js
/* eslint-disable no-undef */
export const LOGS = [
  {
    name: 'KITTI-0005',
    path: `${LOG_DIR}/kitti/2011_09_26_drive_0005_sync`,
    xvizConfig: {
      TIME_WINDOW: 0.4
    },
    videoAspectRatio: 10 / 3
  },
  {
    name: 'nuTonomy-0006',
    path: `${LOG_DIR}/nutonomy/scene-0006`,
    xvizConfig: {
      TIME_WINDOW: 0.6
    },
    videoAspectRatio: 16 / 9
  }
];
