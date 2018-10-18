import {COORDINATE_SYSTEM} from 'deck.gl';
import {_Pose as Pose, Matrix4} from 'math.gl';

import {COORDINATES} from '../constants';

export function resolveCoordinateTransform(
  frame,
  streamMetadata = {},
  streamName,
  getTransformMatrix
) {
  const {origin, vehicleRelativeTransform} = frame;
  const {coordinate, transform, pose} = streamMetadata;

  let coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS;
  let modelMatrix = null;

  switch (coordinate) {
    case COORDINATES.GEOGRAPHIC:
      coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
      break;

    case COORDINATES.IDENTITY:
      break;

    case COORDINATES.DYNAMIC:
      modelMatrix = getTransformMatrix(streamName, frame);
      break;

    default:
      modelMatrix = vehicleRelativeTransform;
  }

  let streamTransform = transform;
  if (pose) {
    // TODO - remove when builder updates
    streamTransform = new Pose(pose).getTransformationMatrix();
  }
  if (streamTransform) {
    modelMatrix = modelMatrix
      ? new Matrix4(modelMatrix).multiplyRight(streamTransform)
      : streamTransform;
  }

  return {
    coordinateSystem,
    coordinateOrigin: origin,
    modelMatrix
  };
}

export function positionToLngLat(
  [x, y, z],
  viewport,
  {coordinateSystem, coordinateOrigin, modelMatrix}
) {
  if (modelMatrix) {
    [x, y, z] = new Matrix4(modelMatrix).transformVector([x, y, z, 1]);
  }

  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.METER_OFFSETS:
      return viewport.addMetersToLngLat(coordinateOrigin, [x, y, z]);

    case COORDINATE_SYSTEM.LNGLAT:
    default:
      return [x, y, z];
  }
}
