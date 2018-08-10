import {VoyageConverter} from './converters';
import {XVIZWriter} from './xviz-writer';
import {createDir, deleteDirRecursive} from './parsers/common';
import {XVIZMetadataBuilder} from './xviz-writer';
import Bag from './lib/bag';

module.exports = async function main(args) {
  const {bag: bagPath, outputDir, disableStreams} = args;

  deleteDirRecursive(outputDir);
  createDir(outputDir);
  const converter = new VoyageConverter(disableStreams);
  const bag = new Bag({
    bagPath,
    keyTopic: '/current_pose',
    topics: [
      '/current_pose',
      '/planner/path',
      '/commander/points_fore',
      '/commander/perception_dct/track_list'
    ]
  });

  console.log(`Converting data at ${bagPath}`); // eslint-disable-line
  console.log(`Saving to ${outputDir}`); // eslint-disable-line

  // This abstracts the details of the filenames expected by our server
  const xvizWriter = new XVIZWriter();

  const profileStart = Date.now();
  let frameNum = 0;
  let startTime = null;
  let frameTime = null;
  await bag.readFrames(frame => {
    frameTime = frame.keyTopic.timestamp.toDate();
    if (!startTime) {
      startTime = frameTime;
    }
    const xvizFrame = converter.convertFrame(frame);
    xvizWriter.writeFrame(outputDir, frameNum, xvizFrame);
    frameNum++;
  });

  // Write metadata file
  const xb = new XVIZMetadataBuilder();
  xb.startTime(startTime.getTime()).endTime(frameTime.getTime());
  converter.buildMetadata(xb);
  xvizWriter.writeMetadata(outputDir, xb.getMetadata());

  const profileEnd = Date.now();
  console.log(`Generate ${frameNum} frames in ${profileEnd - profileStart}s`); // eslint-disable-line
};
