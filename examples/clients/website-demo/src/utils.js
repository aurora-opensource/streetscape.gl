export function getLogPath(namespace, log) {
  switch (namespace) {
    case 'kitti':
      return `kitti/2011_09_26/2011_09_26_drive_${log}_sync`;
    default:
      return null;
  }
}
