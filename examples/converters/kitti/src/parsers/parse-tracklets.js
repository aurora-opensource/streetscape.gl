/**
 * Parse tracklets objects (stored in tracklet_labels.xml),
 */
const parser = require('xml2json');
const uuid = require('uuid').v4;

function loadTracklets(tracklets_contents) {
  const raw_data = JSON.parse(parser.toJson(tracklets_contents));
  const tracklets = raw_data.boost_serialization.tracklets;

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

    const first_frame = Number(item.first_frame);
    const count = Number(item.poses.count);
    const last_frame = first_frame + count;
    return {
      data: item,
      first_frame,
      last_frame,
      count,
      properties,
      bounds
    };
  });
}

module.exports = {
  loadTracklets
};
