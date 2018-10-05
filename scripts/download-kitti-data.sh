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
# Script for fetching kitti datasets

set -e

echo 'Fetching kitti dataset'

KITTI_DATA_SET="${1:-2011_09_26_drive_0005}"
echo "Fetching kitti dataset: ${KITTI_DATA_SET}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KITTI_PATH="${SCRIPT_DIR}"/../data/kitti
GENERATED_KITTI_PATH="${SCRIPT_DIR}"/../data/generated/kitti

if [ -d "${KITTI_PATH}" ]; then
  echo "Target directory ${KITTI_PATH} already exists. Remove in order to run this setup script."
  exit 0
fi

# Make kitti directories
mkdir -p "${KITTI_PATH}" "${GENERATED_KITTI_PATH}"

# Download files
unpack_kitti_file() {
  wget https://s3.eu-central-1.amazonaws.com/avg-kitti/raw_data/"$1"/"$2" && unzip "$2"  -d "$3" && rm "$2"
}

files=( _tracklets.zip _sync.zip )
for i in "${files[@]}"
do
	unpack_kitti_file "${KITTI_DATA_SET}" "${KITTI_DATA_SET}${i}" "${KITTI_PATH}" &
done
