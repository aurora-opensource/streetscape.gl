import {parseJsonFile, toMap, quaternionToEulerAngle} from '../common';

export default class GPSConverter {
  constructor(rootDir, streamFile) {
    this.rootDir = rootDir;
    this.streamFile = streamFile;
    this.poseByFrames = {};
    this.timestamps = [];

    this.VEHICLE_POSE = '/vehicle_pose';
  }

  _loadPoses() {
    const poses = parseJsonFile(this.rootDir, this.streamFile);
    return toMap(poses, 'token');
  }

  load({frames}) {
    const poses = this._loadPoses();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const poseToken = frame.ego_pose_token;
      const pose = poses[poseToken];
      const {roll, pitch, yaw} = quaternionToEulerAngle(...pose.rotation);
      const [x, y, z] = pose.translation;
      const timestamp = pose.timestamp / 1000;

      this.timestamps.push(timestamp);

      this.poseByFrames[frame.token] = {
        timestamp,
        x,
        y,
        z,
        roll,
        pitch,
        yaw,
        rawData: pose
      };
    }
  }

  convertFrame(frameToken, xvizBuilder) {
    const pose = this.poseByFrames[frameToken];
    xvizBuilder
      .pose(this.VEHICLE_POSE)
      .timestamp(pose.timestamp)
      .mapOrigin(0, 0, 0)
      .position(pose.x, pose.y, pose.z)
      .orientation(pose.roll, pose.pitch, pose.yaw);
  }

  getMetadata(xvizMetaBuilder) {
    const xb = xvizMetaBuilder;
    xb.stream(this.VEHICLE_POSE).category('pose');
  }

  getPoses() {
    return this.poseByFrames;
  }
}
