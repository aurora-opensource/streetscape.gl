import _ from 'lodash';
import MarkerArrayConverter from './marker-array-converter';

/**
 * Handles converting Marker messages
 */
export default class MarkerConverter extends MarkerArrayConverter {
  constructor(...args) {
    super(...args);
  }

  convertFrame(frame, xvizBuilder) {
    const messages = frame[this.topic];
    if (messages) {
      const markers = _.map(messages, 'message')
      markers.forEach(this._processMarker);
    }

    this.writeMarkers(xvizBuilder);
  }
}
