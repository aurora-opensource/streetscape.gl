#!/bin/bash
#
# Copyright (c) 2019 Uber Technologies, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
#
# Runs KITTI converter if generated output is not found
# Runs server & client in background
# Terminates background process if signal is triggered

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

show_help() {
  echo " -h display help information"
  echo " -f force KITTI xviz conversion"
}

# Handle options
force_xviz_conversion=false

while getopts "hf" opt; do
    case "$opt" in
    h|\?)
        show_help
        exit 0
        ;;
    f)  force_xviz_conversion=true
        ;;
    esac
done

# Terminate background pids
exit_script() {
  echo "Terminating XVIZ server & client!"
  trap - SIGINT SIGTERM
  for pid in ${pids[*]}; do
    echo "Terminating ${pid}"
    kill ${pid}
  done
}
trap exit_script SIGINT SIGTERM

# Run KITTI XVIZ conversion
if [ "$force_xviz_conversion" = "true" ] || [ ! -f "${SCRIPT_DIR}/../data/generated/kitti/2011_09_26/2011_09_26_drive_0005_sync/1-frame.glb" ]; then
  echo "Generating default KITTI XVIZ data"
  (cd "${SCRIPT_DIR}/../examples/converters/kitti" && yarn start -d 2011_09_26/2011_09_26_drive_0005_sync)
fi

# Start server & web app
cd "${SCRIPT_DIR}/../examples/server" && node ./index.js  -d "${SCRIPT_DIR}/../data/generated/kitti/2011_09_26/2011_09_26_drive_0005_sync/" &
pids[1]=$!

cd "${SCRIPT_DIR}/../examples/clients/xviz-viewer" && yarn start-local &
pids[2]=$!

echo "##"
echo "## XVIZ Server and Client started."
echo "## Ctrl-c to terminate."
echo "##"

for pid in ${pids[*]}; do
    wait $pid
done
