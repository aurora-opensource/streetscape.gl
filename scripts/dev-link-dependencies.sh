#!/bin/sh
# Script to bootstrap repo for development

echo 'Setup XVIZ using yarn link for local development'

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

XVIZ_MODULES="${SCRIPT_DIR}/../../xviz/modules/*"

function handle_xviz() {
  # setup XVIZ first!
  for D in $XVIZ_MODULES; do
    if [ -d $D ] ; then
      (cd $D && yarn ${ACTION})
    fi
  done
}

function handle_deps() {
  for D in $(find . -name package.json -not -path "*node_modules*" -maxdepth 4); do
    echo "Testing ${D} for @xviz package dependencies"

    dir=$(dirname $D)
    packages=$(cd $dir && cat package.json | grep @xviz | awk -F: '{gsub(/ |\"/, "", $0); print $1}')
   
    for pkg in $packages; do
      (cd $dir && yarn $ACTION $pkg)
    done
  done
}



case $1 in
  link)
      ACTION=link
      handle_xviz
      handle_deps
      ;;
  unlink)
      ACTION=unlink
      handle_deps
      handle_xviz
      ;;
  *)
      echo 'Error: Must specify argument "link" or "unlink"'
      exit 1
      ;;
esac
echo "Done"
