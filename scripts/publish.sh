#!/bin/bash
# Script to publish the module

set -e

# beta or prod
PUBLISH_DIRECTORY=dist
MODE=$1

copy_package_json() (
  cat package.json | jq 'del(.devDependencies) | del(.scripts) | del(.private)' > dist/package.json
);

# transpile module
npm run build

NODE_ENV=test node test/start dist

case $MODE in
  "beta")
    # npm-tag argument: npm publish --tag <beta>
    npm version prerelease -m "v%s"
    copy_package_json
    cd $PUBLISH_DIRECTORY && npm publish --tag beta #beta
    break;;

  "prod")
    npm version patch -m "v%s"
    copy_package_json
    cd $PUBLISH_DIRECTORY && npm publish #prod
    break;;

  *) ;;
esac
