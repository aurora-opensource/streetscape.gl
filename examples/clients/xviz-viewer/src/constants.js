export const MAP_STYLE = 'mapbox://styles/mapbox/satellite-v9';
export const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// OBJ model width 2073mm, length 4946mm
// Volkswagen Passat: width 1820mm, length 4780mm
export const CAR = {
  mesh: 'assets/car.obj',
  origin: [1.08, -0.32, 0],
  scale: 0.0009
};

export const SETTINGS = {
  viewMode: {
    type: 'select',
    title: 'View Mode',
    data: {TOP_DOWN: 'Top Down', PERSPECTIVE: 'Perspective', DRIVER: 'Driver'}
  }
};

export const FRAMES = 155;
export const FRAME_SUFFIX = '-frame.glb';
