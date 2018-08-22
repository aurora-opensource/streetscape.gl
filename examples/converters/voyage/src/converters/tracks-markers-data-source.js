import {TRACKS_MARKERS} from '~/topics';

export default class TracksMarkersDataSource {
  constructor() {
    this.TRACKS_MARKERS = '/tracklets/markers';
  }

  convertFrame(frame, xvizBuilder) {
    const tracksMarkers = frame[TRACKS_MARKERS];
    if (!tracksMarkers) {
      return;
    }

    for (const {message} of tracksMarkers) {
      const {markers} = message;
      for (const marker of markers) {
        xvizBuilder
          .stream(this.TRACKS_MARKERS)
          .polygon(marker.points.map(p => [p.x, p.y, p.z]))
          .id(marker.id);
      }
    }
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.TRACKS_MARKERS)
      .coordinate('vehicle_relative')
      .category('primitive')
      .type('polygon')
      .styleClassDefault({
        extruded: true,
        wireframe: true,
        // TODO - use dynamic height
        height: 1.5,
        fillColor: '#00000080'
      });
  }
}
