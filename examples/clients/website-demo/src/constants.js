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
  // '/tracklets/objects': [{name: 'selected', style: {fill_color: '#ff8000aa'}}]
};

export const LOGS = {
  kitti: {
    logs: [
      '0001',
      '0002',
      '0005',
      '0009',
      '0011',
      '0013',
      '0014',
      '0017',
      '0018',
      '0048',
      '0051',
      '0056',
      '0057',
      '0059',
      '0060',
      '0091',
      '0093'
    ]
  },
  nutonomy: {
    logs: ['0001', '0002', '0004', '0005', '0006', '0007', '0008']
  }
};
