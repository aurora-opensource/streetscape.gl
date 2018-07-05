import {packData} from './utils';
import assert from 'assert';

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

function pack() {
  const {src: srcDataFile, dst: dstDir} = parseArgs();
  assert(srcDataFile, 'should provide `srcDataFile`');
  assert(dstDir, 'should provide `dstDir`');

  console.log(`start packing data from ${srcDataFile} to ${dstDir}`);
  packData(srcDataFile, dstDir);
}

pack();
