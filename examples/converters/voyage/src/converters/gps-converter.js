export class GPSDataSource {
  constructor() {
    // XVIZ stream names produced by this converter
    this.VEHICLE_POSE = 'vehicle-pose';
  }

  convertFrame(frame, xvizBuilder) {
    const {timestamp, message} = frame.keyTopic;

    // Every frame *MUST* have a pose. The pose can be considered
    // the core reference point for other data and usually drives the timing
    // of the system.
    xvizBuilder.pose(this.VEHICLE_POSE, {
      time: timestamp.toDate().getTime(),
      /* This pose is in x, y, z local cartesian coordinates */
      ...message.pose
    });
  }

  getMetadata(xvizMetaBuilder) {
    // You can see the type of metadata we allow to define.
    // This helps validate data consistency and has automatic
    // behavior tied to the viewer.
    xvizMetaBuilder
      .stream('vehicle-pose')
      .category('vehicle-pose')

      // This styling information is applied to *all* objects for this stream.
      // It is possible to apply inline styling on individual objects.
      .styleClassDefault({
        strokeColor: '#57AD57AA',
        strokeWidth: 1.4,
        strokeWidthMinPixels: 1
      });
  }
}
