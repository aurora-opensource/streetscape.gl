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
# Script to bootstrap repo for development

echo 'Setup XVIZ using yarn link for local development'

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

XVIZ_MODULES="${SCRIPT_DIR}/../../xviz/modules/*"
STREETSCAPE_MODULES="${SCRIPT_DIR}/../modules/*"

function handle_streetscape() {
  # setup XVIZ first!
  for D in $STREETSCAPE_MODULES; do
    if [ -d $D ] ; then
      (cd $D && yarn ${ACTION})
    fi
  done
}

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
    echo "Testing ${D} for @xviz and streetscape.gl package dependencies"

    dir=$(dirname $D)
    xviz_packages=$(cd $dir && cat package.json | grep @xviz | awk -F: '{gsub(/ |\"/, "", $0); print $1}')
    streetscape_packages=$(cd $dir && cat package.json | grep '"streetscape.gl":' | awk -F: '{gsub(/ |\"/, "", $0); print $1}')
    echo $streetscape_packages
   
    for pkg in $xviz_packages; do
      (cd $dir && yarn $ACTION $pkg)
    done

    for pkg in $streetscape_packages; do
      (cd $dir && yarn $ACTION $pkg)
    done

  done
}

case $1 in
  link)
      ACTION=link
      handle_xviz
      handle_streetscape
      handle_deps
      ;;
  unlink)
      ACTION=unlink
      handle_deps
      handle_streetscape
      handle_xviz
      ;;
  *)
      echo 'Error: Must specify argument "link" or "unlink"'
      exit 1
      ;;
esac
echo "Done"
