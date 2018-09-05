import {v4 as uuid} from 'uuid';
import {loadProcessedLidarData} from '~/parsers/parse-lidar-points';

/**
 * This just does a very basic random downsampling based on the ratio of
 * maxPointsCount and actual points in the point cloud. As such, it is not guaranteed
 * to exactly cap at maxPointsCount.
 */
function downSamplePoints(points, maxPointsCount) {
  if (points.length <= maxPointsCount) {
    return points;
  }

  const chunkSize = 3;
  const sampleRate = maxPointsCount / points.length;
  const ret = [];
  for (let i = 0; i < points.length/chunkSize; i++) {
    if (Math.random() < sampleRate) {
      for (let j = 0; j < chunkSize; j++) {
        ret.push(points[i*chunkSize + j]);
      }
    }
  }

  return Float32Array.from(ret);
}

// load file
export default class LidarConverter {
  constructor() {
    this.LIDAR_POINTS = '/lidar/points';
    this.previousData = {};
  }

  convertFrame(frame, xvizBuilder) {
    this._buildPoints(frame, xvizBuilder, {
      topic: '/commander/points_back',
      color: [0, 0, 0, 255]
    });
    this._buildPoints(frame, xvizBuilder, {
      topic: '/commander/points_fore',
      color: [0, 255, 0, 255]
    });
  }

  _buildPoints(frame, xvizBuilder, {color, topic}) {
    let data = frame[topic];
    if (!data) {
      data = this.previousData[topic];
      if (!data) {
        return;
      }
    }
    this.previousData[topic] = data;

    for (const {timestamp, message} of data) {
      const pointsSize = message.data.length / (message.height * message.width);
      const {positions} = loadProcessedLidarData(message.data, pointsSize);

      xvizBuilder
        .stream(this.LIDAR_POINTS)
        .points(downSamplePoints(positions, 50000))
        .timestamp(timestamp.toDate().getTime())
        .id(uuid())
        .color(color);
    }
  }

  getMetadata(xvizMetaBuilder, frameIdToPoseMap) {
    const streamMetadata = xvizMetaBuilder.stream(this.LIDAR_POINTS)
      .category('primitive')
      .type('point')
      .styleClassDefault({
        fillColor: '#00a',
        radiusPixels: 2
      });

    const pose = (frameIdToPoseMap || {}).velodyne;
    if (pose) {
      streamMetadata.pose(pose);
    }
  }
}
