#!/usr/bin/env bash

set -e

DEMO_DIR=../examples/website-demo
DEMO_PACKAGE_DIR=${DEMO_DIR}/dist
DEMO_DESTINATION=./dist/demo

# install dependencies
yarn

rm -rf ./dist && mkdir dist

# build website
NODE_ENV=production webpack --env.prod=true

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

