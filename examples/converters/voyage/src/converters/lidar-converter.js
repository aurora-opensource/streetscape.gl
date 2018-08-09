const uuid = require('uuid').v4;

const {encodeBinaryXVIZ, parseBinaryXVIZ} = require('@xviz/client');
import {loadLidarData} from '../parsers/parse-lidar-points';

// load file
export class LidarDataSource {
  constructor() {
    this.LIDAR_POINTS = '/lidar/points';
  }

  convertFrame(frame, xvizBuilder) {
    const data = frame['/points_raw'];
    if (!data) {
      return;
    }
    // This encode/parse is a temporary workaround until we get fine-grain
    // control of which streams should be packed in the binary.
    // By doing this we are able to have the points converted to the appropriate
    // TypedArray, and by unpacking them, they are in a JSON structure that
    // works better with the rest of the conversion.
    for (const {timestamp, message} of data) {
      const pointsSize = message.data.length / (message.height * message.width);
      const {positions} = loadLidarData(message.data, pointsSize);
      const tmp_obj = {vertices: positions};
      const bin_tmp_obj = encodeBinaryXVIZ(tmp_obj, {flattenArrays: true});
      const bin_xviz_lidar = parseBinaryXVIZ(bin_tmp_obj);

      xvizBuilder
        .stream(this.LIDAR_POINTS)
        .points(bin_xviz_lidar.vertices)
        .timestamp(timestamp.toDate().getTime())
        .id(uuid())
        .color([0, 0, 0, 255]);
    }
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.LIDAR_POINTS)
      .category('primitive')
      .type('point')
      .styleClassDefault({
        fillColor: '#00a',
        radiusPixels: 2
      });
  }
}
