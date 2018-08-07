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

/* global process */
/*
 * Generic Utilities
 */
const {spawnSync} = require('child_process');

// return object with status , errors, stdout, stderr
function create_zip_from_folder(folder, dst) {
  return spawnSync('tar', ['-czf', dst, folder], {timeout: 30000});
}

// return object with status , errors, stdout, stderr
function extract_zip_from_file(file) {
  return spawnSync('tar', ['-xzf', file], {timeout: 30000});
}

const startTime = process.hrtime();
const NS_PER_SEC = 1e9;

// Return time in milliseconds since
// argument or startTime of process.
function delta_time_ms(start_t) {
  const diff = process.hrtime(start_t || startTime);
  return ((diff[0] * NS_PER_SEC + diff[1]) / 1e6).toFixed(3);
}

module.exports = {
  create_zip_from_folder,
  extract_zip_from_file,
  delta_time_ms
};
