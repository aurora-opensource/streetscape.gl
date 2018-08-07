const fs = require('fs');
const path = require('path');

const {packGLB} = require('../parsers/common');

export class XVIZWriter {
  // xvizMetadata is the object returned
  // from a Builder.
  writeMetadata(xvizDirectory, xvizMetadata) {
    const xvizMetadataFilename = path.join(xvizDirectory, '1-frame');
    packGLB(xvizMetadataFilename, xvizMetadata);
    fs.writeFileSync(`${xvizMetadataFilename}.json`, JSON.stringify(xvizMetadata, null, 2), {
      flag: 'w'
    });
  }

  writeFrame(xvizDirectory, frame_number, xvizFrame) {
    // +2 is because 1 is metadata, so we start with 2
    const frameFilePath = path.join(xvizDirectory, `${frame_number + 2}-frame`);
    packGLB(frameFilePath, xvizFrame);

    // fs.writeFileSync(`${frameFilePath}.json`, JSON.stringify(xvizFrame, null, 2), {flag: 'w'});
  }
}
