#!/bin/bash
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
trap exit_script SIGINT SIGERM

# Run KITTI XVIZ conversion
# check for both json & glb files
if [ "$force_xviz_conversion" = "true" ] || ([ ! -f "${SCRIPT_DIR}/../data/generated/kitti/2011_09_26/2011_09_26_drive_0005_sync/1-frame.json" ] && [ ! -f "${SCRIPT_DIR}/../data/generated/kitti/2011_09_26/2011_09_26_drive_0005_sync/1-frame.glb" ]) ; then
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
