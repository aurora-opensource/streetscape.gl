const NANOSEC_TO_MILLISEC = 1e-6;
const SEC_TO_MILLISEC = 1e3;

export default class GPSConverter {
  constructor() {}

  convertFrame(frameNumber, data, xvizBuilder) {
    const entry = this._convertPoseEntry(data, frameNumber);

    const {pose} = entry;
    console.log(`processing gps data frame ${frameNumber}`); // eslint-disable-line

    // Every frame *MUST* have a pose. The pose can be considered
    // the core reference point for other data and usually drives the timing
    // of the system.
    xvizBuilder.pose(pose);
  }

  getMetadata(xvizMetaBuilder) {
    // You can see the type of metadata we allow to define.
    // This helps validate data consistency and has automatic
    // behavior tied to the viewer.
    const xb = xvizMetaBuilder;
    xb.stream('vehicle-pose')
      .category('vehicle-pose')

      .styleClassDefault({
        strokeColor: '#57AD57AA',
        strokeWidth: 1.4,
        strokeWidthMinPixels: 1
      });
  }

  _convertPoseEntry(data, frameNumber) {
    const result = {pose: {}};
    if (data['/vehicle/gps/fix']) {
      const {
        longitude,
        latitude,
        altitude,
        header: {stamp}
      } = data['/vehicle/gps/fix'].message;

      const timeInMillesec =
        stamp.sec * SEC_TO_MILLISEC + Math.round(stamp.nsec * NANOSEC_TO_MILLISEC);

      result.pose = {
        time: timeInMillesec,
        latitude: Number(latitude),
        longitude: Number(longitude),
        altitude: Number(altitude)
      };
    }

    if (data['/imu/data']) {
      const {
        orientation: {x: roll, y: pitch, z: yaw}
      } = data['/imu/data'].message;
      Object.assign(result.pose, {
        roll: Number(roll),
        pitch: Number(pitch),
        yaw: Number(yaw)
      });
    }

    return result;
  }
}
