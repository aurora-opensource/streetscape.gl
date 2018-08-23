import {TRACKS_MARKERS} from '~/topics';
import MarkerArrayConverter from './base/marker-array-converter';

export default class PerceptionMarkersConverter extends MarkerArrayConverter {
  constructor(xvizNamespace) {
    super({
      topic: TRACKS_MARKERS,
      xvizNamespace,
      acceptMarker: (marker) => ['velocity_arrow'].includes(marker.ns)
    })
  }
}
