#!/bin/sh
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

# Setup KITTI converter JS dependencies
(cd "${SCRIPT_DIR}/../examples/converters/kitti" && yarn --check-files)

# Setup XVIZ server JS dependencies
(cd "${SCRIPT_DIR}/../examples/server" && yarn --check-files)

# Setup XVIZ-VIEWER JS dependencies
(cd "${SCRIPT_DIR}/../examples/clients/xviz-viewer" && yarn --check-files)

echo "Done"
