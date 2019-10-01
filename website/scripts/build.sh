#!/usr/bin/env bash
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

set -e

DEMO_DIR=../examples/website-demo
DEMO_PACKAGE_DIR=${DEMO_DIR}/dist
DEMO_DESTINATION=./dist/demo

PLAYGROUND_DIR=../examples/xviz-playground
PLAYGROUND_PACKAGE_DIR=${PLAYGROUND_DIR}/dist
PLAYGROUND_DESTINATION=./dist/playground

STORYBOOK_DIR=../modules/monochrome
STORYBOOK_PACKAGE_DIR=${STORYBOOK_DIR}/storybook-static
STORYBOOK_DESTINATION=./dist/monochrome

# install dependencies
yarn

rm -rf ./dist && mkdir dist

# build website
NODE_ENV=production webpack -p

# copy static files
cp -r ./src/static/* dist/
cp coming-soon.html dist/

# build demo app
(cd ${DEMO_DIR} && rm -rf node_modules && yarn && yarn build)

# copy demo bundle
echo "Copy from ${DEMO_PACKAGE_DIR} to ${DEMO_DESTINATION}"

if [ -e ${DEMO_DESTINATION} ]; then
  rm -rf ${DEMO_DESTINATION}
  mkdir ${DEMO_DESTINATION}
fi

cp -r ${DEMO_PACKAGE_DIR} ${DEMO_DESTINATION}

# replace style.css path
(cd ${DEMO_DESTINATION} && sed -i '' -E 's/href="style.css"/href="..\/style.css"/' index.html)


# build playground app
(cd ${PLAYGROUND_DIR} && rm -rf node_modules && yarn && yarn build)

# copy playground bundle
echo "Copy from ${PLAYGROUND_PACKAGE_DIR} to ${PLAYGROUND_DESTINATION}"

if [ -e ${PLAYGROUND_DESTINATION} ]; then
  rm -rf ${PLAYGROUND_DESTINATION}
  mkdir ${PLAYGROUND_DESTINATION}
fi

cp -r ${PLAYGROUND_PACKAGE_DIR} ${PLAYGROUND_DESTINATION}
cp -r ${PLAYGROUND_DIR}/index.html ${PLAYGROUND_DESTINATION}


# build storybook
(cd $STORYBOOK_DIR && yarn build:storybook)

# copy storybook assets
echo "Copy from ${STORYBOOK_PACKAGE_DIR} to ${STORYBOOK_DESTINATION}"

if [ -e ${STORYBOOK_DESTINATION} ]; then
  rm -rf ${STORYBOOK_DESTINATION}
  mkdir ${STORYBOOK_DESTINATION}
fi

cp -r ${STORYBOOK_PACKAGE_DIR} ${STORYBOOK_DESTINATION}
