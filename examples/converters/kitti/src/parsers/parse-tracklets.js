/**
 * Parse tracklets objects (stored in tracklet_labels.xml),
 */
const parser = require('xml2json');
const uuid = require('uuid').v4;

function loadTracklets(trackletsContents) {
  const rawData = JSON.parse(parser.toJson(trackletsContents));
  const tracklets = rawData.boost_serialization.tracklets;

  const objects = parseObjectMetadata(tracklets);

  return {objects, tracklets};
}

function parseObjectMetadata(tracklets) {
  return tracklets.item.map(item => {
    const properties = {
      id: uuid(),
      objectType: item.objectType,
      width: Number(item.w),
      height: Number(item.h),
      length: Number(item.l)
    };

    const bounds = [
      [-item.l / 2, -item.w / 2, 0],
      [-item.l / 2, item.w / 2, 0],
      [item.l / 2, item.w / 2, 0],
      [item.l / 2, -item.w / 2, 0],
      [-item.l / 2, -item.w / 2, 0]
    ];

    const firstFrame = Number(item.firstFrame);
    const count = Number(item.poses.count);
    const lastFrame = firstFrame + count;
    return {
      data: item,
      firstFrame,
      lastFrame,
      count,
      properties,
      bounds
    };
  });
}

module.exports = {
  loadTracklets
};
