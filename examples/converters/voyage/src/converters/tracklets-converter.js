export class TrackletsDataSource {
  constructor() {
    this.TRACKLETS = '/tracklets/objects';
    this.TRACKLETS_TRAJECTORY = '/tracklets/trajectory';
  }

  convertFrame(frame, xvizBuilder) {
    const trackMessages = frame['/commander/perception_dct/track_list'];
    if (!trackMessages) {
      return;
    }

    for (const {message} of trackMessages) {
      const tracks = message.confirmed_tracks;
      for (const track of tracks) {
        xvizBuilder
          .stream(this.TRACKLETS)
          .polygon(track.shape_points.map(p => [p.x, p.y, p.z]))
          .classes(['Car'])
          .id(track.track_id);
      }
    }
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.TRACKLETS)
      .coordinate('map_relative')
      .category('primitive')
      .type('polygon')
      .styleClassDefault({
        extruded: true,
        wireframe: true,
        // TODO - use dynamic height
        height: 1.5,
        fillColor: '#00000080'
      })
      .styleClass('Car', {
        fillColor: '#7DDDD780',
        strokeColor: '#7DDDD7'
      })
      .styleClass('Cyclist', {
        fillColor: '#DA70BF80',
        strokeColor: '#DA70BF'
      })
      .styleClass('Pedestrian', {
        fillColor: '#FEC56480',
        strokeColor: '#FEC564'
      })
      .styleClass('Van', {
        fillColor: '#267E6380',
        strokeColor: '#267E63'
      })
      .styleClass('Unknown', {
        fillColor: '#D6A00080',
        strokeColor: '#D6A000'
      });

    // .stream(this.TRACKLETS_TRAJECTORY)
    // .category('primitive')
    // .type('polyline')
    // .styleClassDefault({
    //   strokeColor: '#FEC557',
    //   strokeWidth: 0.3,
    //   strokeWidthMinPixels: 1
    // });
  }
}
