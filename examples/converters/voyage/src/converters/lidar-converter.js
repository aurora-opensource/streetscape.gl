import {v4 as uuid} from 'uuid';
import {encodeBinaryXVIZ, parseBinaryXVIZ} from '@xviz/client';
import {loadProcessedLidarData} from '../parsers/parse-lidar-points';

// load file
export class LidarDataSource {
  constructor() {
    this.LIDAR_POINTS = '/lidar/points';
  }

  convertFrame(frame, xvizBuilder) {
    this._buildPoints(frame['/commander/points_back'], xvizBuilder, {
      color: [0, 0, 0, 255]
    });
    this._buildPoints(frame['/commander/points_fore'], xvizBuilder, {
      color: [0, 255, 0, 255]
    });
  }

  _buildPoints(data, xvizBuilder, {color}) {
    if (!data) {
      return;
    }

    for (const {timestamp, message} of data) {
      const pointsSize = message.data.length / (message.height * message.width);
      const {positions} = loadProcessedLidarData(message.data, pointsSize);
      const tmp_obj = {vertices: positions};
      const bin_tmp_obj = encodeBinaryXVIZ(tmp_obj, {flattenArrays: true});
      const bin_xviz_lidar = parseBinaryXVIZ(bin_tmp_obj);

      xvizBuilder
        .stream(this.LIDAR_POINTS)
        .points(bin_xviz_lidar.vertices)
        .timestamp(timestamp.toDate().getTime())
        .id(uuid())
        .color(color);
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
