import {COORDINATE_SYSTEM} from 'deck.gl';
import {_Pose as Pose, Matrix4} from 'math.gl';
import {addMetersToLngLat} from 'viewport-mercator-project';

import {COORDINATE} from '../constants';

const DEFAULT_ORIGIN = [0, 0, 0];

export function resolveCoordinateTransform(frame, streamMetadata = {}, getTransformMatrix) {
  const {origin, transforms = {}, vehicleRelativeTransform} = frame;
  const {coordinate, transform, pose} = streamMetadata;

  let coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS;
  let modelMatrix = null;
  let streamTransform = transform;

  switch (coordinate) {
    case COORDINATE.GEOGRAPHIC:
      coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
      break;

    case COORDINATE.IDENTITY:
      break;

    case COORDINATE.DYNAMIC:
      // cache calculated transform matrix for each frame
      transforms[transform] = transforms[transform] || getTransformMatrix(transform, frame);
      modelMatrix = transforms[transform];
      frame.transforms = transforms;
      streamTransform = null;
      break;

    case COORDINATE.VEHICLE_RELATIVE:
    default:
      modelMatrix = vehicleRelativeTransform;
  }

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
    coordinateOrigin: origin || DEFAULT_ORIGIN,
    modelMatrix
  };
}

export function positionToLngLat([x, y, z], {coordinateSystem, coordinateOrigin, modelMatrix}) {
  if (modelMatrix) {
    [x, y, z] = new Matrix4(modelMatrix).transformVector([x, y, z, 1]);
  }

  switch (coordinateSystem) {
    case COORDINATE_SYSTEM.METER_OFFSETS:
      return addMetersToLngLat(coordinateOrigin, [x, y, z]);

    case COORDINATE_SYSTEM.LNGLAT:
    default:
      return [x, y, z];
  }
}
