#!/bin/sh
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
# Script to bootstrap repo for development
# NOTE: the 'yarn --check-files' is to force yarn to install dependencies
#       that my not be present.  This is to handle changes in @xviz package
#       installations come from yarn link in dev-link-dependencies.sh.

echo 'Bootstrapping streetscape.gl, installing in all directories'

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# setup XVIZ first!
(cd "${SCRIPT_DIR}/../../xviz" && yarn bootstrap)

# install dependencies
yarn --check-files

ROOT_NODE_MODULES_DIR=`pwd`/node_modules

cd modules
for D in *; do (
  [ -d $D ]
  cd $D

  # create symlink to dev dependencies at root
  # this is a bug of yarn: https://github.com/yarnpkg/yarn/issues/4964
  # TODO - remove when fixed
  mkdir -p node_modules
  rm -rf ./node_modules/.bin
  ln -sf $ROOT_NODE_MODULES_DIR/.bin ./node_modules
); done

# build the submodules
npm run build

# Setup XVIZ-VIEWER JS dependencies
(cd "${SCRIPT_DIR}/../examples/xviz-viewer" && yarn --check-files)

echo "Done"
