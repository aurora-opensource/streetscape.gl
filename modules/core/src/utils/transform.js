import {COORDINATE_SYSTEM} from 'deck.gl';
import {Matrix4} from 'math.gl';

import {COORDINATES} from '../constants';

export function resolveCoordinateTransform(vehiclePose, streamMetadata = {}) {
  const {origin, transforms = {}, vehicleRelativeTransform} = vehiclePose;
  const {coordinate, transform} = streamMetadata;

  let coordinateSystem = COORDINATE_SYSTEM.METER_OFFSETS;
  let modelMatrix = vehicleRelativeTransform;

  switch (coordinate) {
    case COORDINATES.GEOGRAPHIC:
      coordinateSystem = COORDINATE_SYSTEM.LNGLAT;
      break;

    case COORDINATES.VEHICLE_RELATIVE:
      modelMatrix = vehicleRelativeTransform;
      break;

    default:
      if (coordinate) {
        modelMatrix = transforms[coordinate];
      }
  }

  if (transform) {
    modelMatrix = new Matrix4(modelMatrix).multiplyRight(transform);
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
