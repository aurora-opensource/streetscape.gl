#!/usr/bin/env bash
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
# Usage
# ./git-copyright-files.sh file1.sh file2.js
#
# For each file in git it will determine the prefix necessary to insert
# a copyright header and then update the git index after adding the copyright
# to the files
#
# Only .sh and .js files are supported

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
COPYRIGHT_PREFIXER="${DIR}/add-copyright.sh"

for i in "$@"; do
  PREFIX="#"

  # Determine the extension and output
  filepath="$i"
  filename=$(basename -- "$filepath")
  extension="${filename##*.}"

  case "$extension" in
    sh)
      PREFIX="#"
      ;;
    js)
      PREFIX="//"
      ;;
    *)
      echo "File with extension \"${extension}\" is not supported"
      exit 1
  esac

  # 10* means operate on files
  git ls-files --stage "${i}" | while read MODE OBJECT STAGE FILE_PATH; do
    case ${MODE} in
    10*)
      # Copy file to temporary
      STAGED_FILE=$(mktemp)
      git show ${OBJECT} > "${STAGED_FILE}"

      # Do change copyright year
      FORMATTED_FILE=$(mktemp)
      cp "${STAGED_FILE}" "${FORMATTED_FILE}"

      "${COPYRIGHT_PREFIXER}" "${PREFIX}" "${FORMATTED_FILE}"

      # Write new file blob to object database
      FORMATTED_HASH=`git hash-object -w "${FORMATTED_FILE}"`

      # Register new written file to working tree index
      git update-index --cacheinfo ${MODE} ${FORMATTED_HASH} "${FILE_PATH}"
      # Patch file in workspace, make it seems changed too
      diff "${STAGED_FILE}" "${FORMATTED_FILE}" | patch "${FILE_PATH}"
      rm "${FORMATTED_FILE}"
      rm "${STAGED_FILE}"
      ;;
    esac
  done
done
