import fs from 'fs';
import path from 'path';
import tape from 'tape-catch';
import {packData, unpack} from '../src/utils';

const srcDataFile = './test/data/sample.ply';
const dstDir = './test/data/packed';

function getCorrectData(srcDataFile) {
  const file = fs.readFileSync(path.resolve(srcDataFile), 'utf8');
  const contents = file.split('\n');
  const headerIdx = contents.findIndex(item => item === 'end_header');
  const dataLines = contents.slice(headerIdx + 1).filter(Boolean);
  return dataLines.map(line => line.split(' ').map(d => Number(d)));
}

// 2D array, each row contains 6 columns
// first 3 is ENU, last 3 is RGB
const correctData = getCorrectData(srcDataFile);

tape('pack', t => {
  packData(srcDataFile, dstDir);

  const unpacked = unpack(dstDir);

  const positions = unpacked[0][0];
  const colors = unpacked[0][1];

  let notEqual = positions.reduce((res, p, i) => {
    const rowIdx = Math.floor(i / 3);
    const colIdx = i % 3;

    return res || p !== correctData[rowIdx][colIdx];
  }, false);

  t.notOk(notEqual, true, 'positions data should match');

  notEqual = colors.reduce((res, p, i) => {
    const rowIdx = Math.floor(i / 3);
    const colIdx = (i % 3) + 3;

    return res || p !== correctData[rowIdx][colIdx];
  }, false);

  t.notOk(notEqual, true, 'colors data should match');

  t.end();
});
