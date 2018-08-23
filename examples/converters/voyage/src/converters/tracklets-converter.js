import {TRACKS_LIST} from '~/topics';

export default class TrackletsConverter {
  constructor() {
    this.TRACKLETS = '/tracklets/objects';
  }

  convertFrame(frame, xvizBuilder) {
    const trackMessages = frame[TRACKS_LIST];
    if (!trackMessages) {
      return;
    }

    for (const {message} of trackMessages) {
      const tracks = message.confirmed_tracks;
      for (const track of tracks) {
        xvizBuilder
          .stream(this.TRACKLETS)
          .polygon(track.shape_bottom.points.map(p => [p.x, p.y, 0]))
          .classes([this._getClass(track)])
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
        height: 1.2,
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
  }

  _getClass(track) {
    // Order has significance
    const CLASSES = [
      'Car',
      'Pedestrian'
    ];

    const {index} = track.class_probabilities.reduce((currentMax, probability, i) => {
      if (probability > currentMax.probability) {
        return {probability, index: i}
      }
      return currentMax
    }, {index: -1, probability: -1});

    return CLASSES[index];
  }
}
