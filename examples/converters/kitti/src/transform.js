/* eslint-disable camelcase */
import {KittiConverter} from './converters';
import {XVIZWriter} from './xviz-writer';

module.exports = function main(args) {
  const {inputDir, outputDir, disableStreams, frame_limit} = args;

  // This object orchestrates any data dependencies between the data sources
  // and delegates to the individual converters
  const converter = new KittiConverter(inputDir, outputDir, disableStreams);

  console.log(`Converting KITTI data at ${inputDir}`); // eslint-disable-line
  console.log(`Saving to ${outputDir}`); // eslint-disable-line

  converter.initialize();

  // This abstracts the details of the filenames expected by our server
  const xvizWriter = new XVIZWriter();

  // Write metadata file
  const xvizMetadata = converter.getMetadata();
  xvizWriter.writeMetadata(outputDir, xvizMetadata);

  const start = Date.now();

  const limit = Math.min(frame_limit, converter.frameCount());
  // Convert each frame and write it to a file
  //
  // A *frame* is a point in time, where each frame will contain
  // a *pose* and any number of XVIZ data sets.
  //
  // In the KITTI data set we are able to iterate directly by *frame* number
  // since the data has been synchronized. However, another approach
  // would be to iterate over data sets by time.  Since dealing with synchronized
  // data is easier, we have choosen this path for the initial example to avoid
  // any unnecessary complications
  for (let i = 0; i < limit; i++) {
    const xvizFrame = converter.convertFrame(i);
    xvizWriter.writeFrame(outputDir, i, xvizFrame);
  }

  const end = Date.now();
  console.log(`Generate ${limit} frames in ${end - start}s`); // eslint-disable-line
};
