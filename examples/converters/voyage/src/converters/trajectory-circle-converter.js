import {TRAJECTORY_CIRCLE_MARKER} from '~/topics';
import MarkerConverter from './base/marker-converter';

export default class TrajectoryCircleConverter extends MarkerConverter {
  constructor(xvizNamespace) {
    super({
      topic: TRAJECTORY_CIRCLE_MARKER,
      xvizNamespace
    })
  }
}
