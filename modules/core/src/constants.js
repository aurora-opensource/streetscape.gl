export const COORDINATE = {
  GEOGRAPHIC: 'GEOGRAPHIC',
  VEHICLE_RELATIVE: 'VEHICLE_RELATIVE',
  IDENTITY: 'IDENTITY',
  DYNAMIC: 'DYNAMIC'
};

export const VIEW_MODE = {
  TOP_DOWN: {
    name: 'map',
    initialProps: {
      minZoom: 12,
      maxZoom: 24,
      minPitch: 0,
      maxPitch: 0,
      pitch: 0,
      zoom: 20
    },
    orthographic: true
  },
  PERSPECTIVE: {
    name: 'map',
    initialProps: {
      minZoom: 12,
      maxZoom: 24,
      minPitch: 0,
      maxPitch: 85,
      pitch: 60,
      zoom: 20
    }
  },
  DRIVER: {
    name: 'driver',
    initialProps: {
      minPitch: 0,
      maxPitch: 0,
      pitch: 0
    },
    firstPerson: {
      position: [0, 0, 1.5]
    },
    mapInteraction: {
      dragPan: false,
      scrollZoom: false
    },
    tracked: true
  }
};
