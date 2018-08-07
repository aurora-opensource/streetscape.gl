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
