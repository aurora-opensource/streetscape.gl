import assert from 'assert';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import stream from 'stream';
import {GLBBufferPacker, GLBBufferUnpacker, addglTFBufferDescriptors} from '@uber/xviz';

import {getRange, toArrayBuffer, toBuffer} from '../utils';

const MAX_POINTS = 42000000;
const bufferPacker = new GLBBufferPacker();
const bufferUnpacker = new GLBBufferUnpacker();

const args = process.argv.slice(2);
function parseArgs() {
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

function writeToFile(dstDir, filename, json, arrayBuffer) {
  const buffer = toBuffer(arrayBuffer);

  const resultFile = path.resolve(dstDir, `${filename}`);
  console.log(`Write ${buffer.byteLength} to file.`);
  fs.writeFileSync(resultFile, buffer);

  const metadataFile = path.resolve(dstDir, `${filename}-metadata.json`);
  fs.writeFileSync(metadataFile, JSON.stringify(json, null, 2));
}

function clearData(data) {
  data.positions = [];
  data.colors = [];
}

function unpackData(metadata, data) {
  return bufferUnpacker.unpackBuffers(metadata, data);
}

function unpack(dataDir) {
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

function packData(srcDataFile, dstDirPath) {
  const data = {
    positions: [],
    colors: []
  };
  const header = [];
  let isHeader = true;

  const instream = fs.createReadStream(path.resolve(srcDataFile));
  const outstream = new stream();
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

  rl.on('close', function() {
    const {json, arrayBuffer} = runPacker(data);
    json.header = {points};
    writeToFile(dstDirPath, '0', json, arrayBuffer);
    const sec = Date.now() - startTime;
    console.log(`Process total ${i} lines in ${sec} seconds.`);
  });
}

function pack() {
  const {src: srcDataFile, dst: dstDir} = parseArgs();
  assert(srcDataFile, 'should provide `srcDataFile`');
  assert(dstDir, 'should provide `dstDir`');

  console.log(`start packing data from ${srcDataFile} to ${dstDir}`);
  packData(srcDataFile, dstDir);
}

pack();
