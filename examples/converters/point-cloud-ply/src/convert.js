/* eslint-disable no-console */
/* global console,process */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import Stream from 'stream';
import {
  GLBContainer,
  GLBBufferPacker,
  GLBBufferUnpacker,
  addglTFBufferDescriptors
} from '@xviz/builder';

import {getRange, toArrayBuffer, toBuffer} from './utils';

const MAX_POINTS = 42000000;
const bufferPacker = new GLBBufferPacker();
const bufferUnpacker = new GLBBufferUnpacker();

function runPacker(data) {
  const posRange = [
    {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    },
    {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    },
    {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    }
  ];

  getRange(data.positions, 3, posRange);

  console.log('====== pos range ======');
  console.log(JSON.stringify(posRange, null, 2));

  const buffers = [new Float32Array(data.positions), new Uint8Array(data.colors)];

  const {json, arrayBuffer} = bufferPacker.packBuffers(buffers, addglTFBufferDescriptors);
  return {json, arrayBuffer};
}

function writeToFile(dstDir, filename, json, arrayBuffer, writeAsComponents = false) {
  json.xviz = json.xviz || [];
  json.xviz.push({
    type: 'points3d',
    // TODO - replace. This is based owe know the address of the arrays
    positions: '$$$0',
    colors: '$$$1'
  });

  const resultFile = path.resolve(dstDir, `${filename}.glb`);
  const glbFileBuffer = GLBContainer.createGlbBuffer(json, arrayBuffer);

  fs.writeFileSync(resultFile, toBuffer(glbFileBuffer));
  console.log(`Wrote ${glbFileBuffer.byteLength} bytes to ${filename}.glb`);

  /*
  const resultFile = path.resolve(dstDir, `${filename}`);
  console.log(`Write ${buffer.byteLength} to file.`);
  fs.writeFileSync(resultFile, buffer);
  const metadataFile = path.resolve(dstDir, `${filename}-metadata.json`);
  fs.writeFileSync(metadataFile, JSON.stringify(json, null, 2));
  */
}

function clearData(data) {
  data.positions = [];
  data.colors = [];
}

function unpackData(metadata, data) {
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

export function packData(srcDataFile, dstDirPath) {
  const data = {
    positions: [],
    colors: []
  };
  const header = [];
  let isHeader = true;

  const instream = fs.createReadStream(path.resolve(srcDataFile));
  const outstream = new Stream();
  const rl = readline.createInterface(instream, outstream);

  const startTime = Date.now();
  let i = 0;
  let points = 0;
  rl.on('line', line => {
    // process line here
    ++i;

    // process header
    if (isHeader) {
      header.push(line);
      if (line.indexOf('element vertex') !== -1) {
        points = Number(line.split(' ')[2]);
      }
      if (line === 'end_header') {
        isHeader = false;
      }
    } else {
      const items = line
        .split(' ')
        .filter(Boolean)
        .map(n => Number(n));

      data.positions.push(items[0]);
      data.positions.push(items[1]);
      data.positions.push(items[2]);

      data.colors.push(items[3]);
      data.colors.push(items[4]);
      data.colors.push(items[5]);
    }

    // clear data before out of memory
    if (data.colors.length === MAX_POINTS) {
      runPacker(data);
      clearData(data);
      console.log(`${((100 * i) / points).toFixed(2)}% is processed`);
    }
  });

  rl.on('close', () => {
    const {json, arrayBuffer} = runPacker(data);
    json.header = {points};
    writeToFile(dstDirPath, '0', json, arrayBuffer);
    const sec = Date.now() - startTime;
    console.log(`Process total ${i} lines in ${sec} seconds.`);
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const argMap = {};
  if (args && args.length) {
    for (let i = 0; i < args.length; i++) {
      const match = args[i].match(/--(\w+)=(.*)/);
      if (match) {
        argMap[match[1]] = match[2];
      }
    }
  }
  return argMap;
}

function pack() {
  const {src, dst} = parseArgs();
  let srcDataFile = src;
  if (!srcDataFile) {
    console.warn('should provide `srcDataFile`, using `test-data/test.ply`');
    srcDataFile = path.join(__dirname, '../test-data/test.ply');
  }
  let dstDir = dst;
  if (!dstDir) {
    console.warn('should provide `dstDir`, using `data`');
    dstDir = path.join(__dirname, '../../../../data/generated');
  }

  console.log(`Packing data from ${srcDataFile} to ${dstDir}...`);
  packData(srcDataFile, dstDir);
  console.log('...done');
}

pack();
