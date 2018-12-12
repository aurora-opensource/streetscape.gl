import {XVIZFileLoader} from 'streetscape.gl';

export default new XVIZFileLoader({
  timingsFilePath: 'https://uber.github.io/xviz-data/kitti/2011_09_26_drive_0005_sync/0-frame.json',
  getFilePath: index =>
    `https://uber.github.io/xviz-data/kitti/2011_09_26_drive_0005_sync/${index + 1}-frame.glb`,
  worker: true,
  maxConcurrency: 4
});
