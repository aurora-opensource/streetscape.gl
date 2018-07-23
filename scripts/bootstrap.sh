#!/bin/sh
# Script to bootstrap repo for development

echo 'Bootstrapping streetscape.gl, installing in all directories'

set -e

# install dependencies
yarn

ROOT_NODE_MODULES_DIR=`pwd`/node_modules

# create symlink to dev dependencies at root
# this is a bug of yarn: https://github.com/yarnpkg/yarn/issues/4964
# TODO - remove when fixed
link_node_modules () {
  mkdir -p node_modules
  rm -rf ./node_modules/.bin
  ln -sf $ROOT_NODE_MODULES_DIR/.bin ./node_modules
}

# link_node_modules Not called
# this will break if we don't use workspace, as it assumes that all devDependencies are installed at root.

(cd colorado && link_node_modules)
