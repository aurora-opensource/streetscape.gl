import fs from 'fs';
import path from 'path';
import assert from 'assert';
import readline from 'readline';
import stream from 'stream';

import {GLBBufferPacker, GLBBufferUnpacker, addglTFBufferDescriptors} from '@uber/xviz';

const MAX_POINTS = 6000000;

const bufferPacker = new GLBBufferPacker();
const bufferUnpacker = new GLBBufferUnpacker();

function toBuffer(ab) {
  const buf = new Buffer(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}

function toArrayBuffer(buf) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

function writeToFile(dstDir, fileName, data) {
  const buffers = [
    new Float32Array(data.positions),
    new Int8Array(data.colors)
  ];

  const {json, arrayBuffer} = bufferPacker.packBuffers(buffers, addglTFBufferDescriptors);

  const buffer = toBuffer(arrayBuffer);

  const resultFile = path.resolve(dstDir, `${fileName}`);
  fs.writeFileSync(resultFile, buffer);

  const metadataFile = path.resolve(dstDir, `${fileName}-metadata.json`);
  fs.writeFileSync(metadataFile, JSON.stringify(json, null, 2));
  console.log(`Write to file chunk ${fileName}`);
}

function clearData(data) {
  data.positions = [];
  data.colors = [];
}

export function unpackData(metadata, data) {
  return bufferUnpacker.unpackBuffers(metadata, data);
}

export function unpack(dataDir) {
  const files = fs.readdirSync(dataDir);
  assert(files.length % 2 === 0);

  const resMap = {};
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const content = fs.readFileSync(path.resolve(dataDir, filename));

    const subs = filename.split('-');
    const chunkIdx = subs[0];

    if (!resMap[chunkIdx]) {
      resMap[chunkIdx] = {};
    }

    if (subs.length > 1) {
      resMap[chunkIdx].metadata = JSON.parse(content);
    } else {
      resMap[chunkIdx].data = toArrayBuffer(content);
    }

  }

  const sortedKeys = Object.keys(resMap).sort((key1, key2) => Number(key1) - Number(key2));
  const unpacked = sortedKeys.map(key => unpackData(resMap[key].metadata, resMap[key].data));

  return unpacked;
}

export function processHeader(chunkItems) {
  const header = [];
  for (let i = 0; i < chunkItems.length; i++) {
    // process header
    header.push(chunkItems[i]);
    if (chunkItems[i] === 'end_header') {
      return {
        header,
        headerIdx: i
      };
    }
  }
}

export function packData(srcDataFile, dstDirPath) {

  const data = {
    positions: [],
    colors: []
  };
  const header = [];
  let isHeader = true;
  let fileIdx = 0;

  const instream = fs.createReadStream(path.resolve(srcDataFile));
  const outstream = new stream;
  const rl = readline.createInterface(instream, outstream);

  let i = 0;
  rl.on('line', line => {
    // process line here

    // process header
    if (isHeader) {
      header.push(line);
      if (line === 'end_header') {
        isHeader = false;
      }
    } else {
      const items = line.split(' ')
        .filter(Boolean)
        .map(n => Number(n));

      data.positions.push(items[0]);
      data.positions.push(items[1]);
      data.positions.push(items[2]);

      data.colors.push(items[3]);
      data.colors.push(items[4]);
      data.colors.push(items[5]);
    }

    // write chunks to file before out of memory
    if (data.colors.length === MAX_POINTS) {
      writeToFile(dstDirPath, fileIdx, data);
      fileIdx++;
      clearData(data);
    }

  });

  rl.on('close', function () {
    if (data.colors.length) {
      writeToFile(dstDirPath, fileIdx, data);
    }
    console.log(`Total ${i} lines.`);
  });

}
