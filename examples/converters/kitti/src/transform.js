// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable camelcase */
import {KittiConverter} from './converters';
import {XVIZWriter} from '@xviz/client';

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
