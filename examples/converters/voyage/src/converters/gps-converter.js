import LocalCartesian from '~/lib/local-cartesian';

function quaternionToEuler({w, x, y, z}) {
  const ysqr = y * y;
  const t0 = -2.0 * (ysqr + z * z) + 1.0;
  const t1 = +2.0 * (x * y + w * z);
  let t2 = -2.0 * (x * z - w * y);
  const t3 = +2.0 * (y * z + w * x);
  const t4 = -2.0 * (x * x + ysqr) + 1.0;

  t2 = t2 > 1.0 ? 1.0 : t2;
  t2 = t2 < -1.0 ? -1.0 : t2;

  const ans = {};
  ans.pitch = Math.asin(t2);
  ans.roll = Math.atan2(t3, t4);
  ans.yaw = Math.atan2(t1, t0);

  return ans;
}

export default class GPSConverter {
  constructor(origin) {
    // XVIZ stream names produced by this converter
    this.VEHICLE_POSE = 'vehicle-pose';
    this.VEHICLE_TRAJECTORY = '/vehicle/trajectory';
    this.localCartesian = new LocalCartesian(origin.latitude, origin.longitude, origin.altitude);
    this.origin = origin;
  }

  async convertFrame(frame, xvizBuilder) {
    await this._buildPose(frame, xvizBuilder);
    this._buildTrajectory(frame, xvizBuilder);
  }

  // The current xviz-viewer application expects to have
  // pose in lat, lng.  Manually convert here from reference point
  async poseToLatLng(position) {
    const [latitude, longitude, altitude] = await this.localCartesian.reverse(
      position.x,
      position.y,
      position.z
    );
    return {latitude, longitude, altitude};
  }

  async _buildPose(frame, xvizBuilder) {
    const {timestamp, message} = frame.keyTopic;

    // Every frame *MUST* have a pose. The pose can be considered
    // the core reference point for other data and usually drives the timing
    // of the system.

    // Position, decimal degrees
    const rotation = quaternionToEuler(message.pose.orientation);

    xvizBuilder.pose(this.VEHICLE_POSE, {
      time: timestamp.toDate().getTime(),
      ...this.origin,
      ...rotation,
      /* This pose is in x, y, z local cartesian coordinates */
      ...message.pose.position,
      z: 0
    });
  }

  _buildTrajectory(frame, xvizBuilder) {
    const data = frame['/planner/path'];
    if (!data) {
      return;
    }

    for (const d of data) {
      const polyline = d.message.poses.map(p => {
        const {position} = p.pose;
        return [position.x, position.y, position.z];
      });

      xvizBuilder
        .stream(this.VEHICLE_TRAJECTORY)
        .timestamp(d.timestamp.toDate().getTime())
        .polyline(polyline)
        .id('vehicle-path');
    }
  }

  getMetadata(xvizMetaBuilder) {
    // You can see the type of metadata we allow to define.
    // This helps validate data consistency and has automatic
    // behavior tied to the viewer.
    xvizMetaBuilder
      .stream('vehicle-pose')
      .category('vehicle-pose')

      .stream(this.VEHICLE_TRAJECTORY)
      .coordinate('map_relative')
      .category('primitive')
      .type('polyline')

      // This styling information is applied to *all* objects for this stream.
      // It is possible to apply inline styling on individual objects.
      .styleClassDefault({
        strokeColor: '#57AD57AA',
        strokeWidth: 1.4,
        strokeWidthMinPixels: 1
      });
  }
}
