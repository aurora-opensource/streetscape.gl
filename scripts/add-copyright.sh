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
# Usage:
# ./add-copyright <prefix> <filepath>
#
# Ex: ./add-copyright "//" path/to/main.js
#
# Checks for an existing Uber copyright string and if it is not detected, then
# it adds the contents of the file "copyright-header.txt" in the same directory
# as this script to the 'filepath' specified.
#
# The copyright message is prefixed with the first argument which the caller
# must determine.
#
# Exit codes:
# 1 - missing argument
# 2 - file is not found

# Get directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function checkForCopyright() {
  pattern="$1"
  filepath="$2"

  # returns 0 if a match found
  head "${filepath}" | grep -iq -E "${pattern}"
}

# https://stackoverflow.com/questions/10929453/read-a-file-line-by-line-assigning-the-value-to-a-variable
# Explanation
# - IFS='' (or IFS=) prevents leading/trailing whitespace from being trimmed.
# - -r prevents backslash escapes from being interpreted.
# - || [[ -n $line ]] prevents the last line from being ignored if it doesn't end with a \n (since  read returns a non-zero exit code when it encounters EOF).
function outputCopyright() {
  prefix="$1"

  while IFS='' read -r line || [[ -n "$line" ]]; do
        echo "${prefix}${line}"
      done < "${DIR}/copyright-header.txt"
}

# Determine the extension and output
function addCopyrightHeader() {
  prefix="$1"
  filepath="$2"

  tmpfile=$(mktemp)
  # Handle shell script headers
  if $(head -n 1 "$filepath" | grep -q -E '^#!') ; then
    ( head -n 1 "$filepath" ; outputCopyright "$prefix"; tail -n +2 "$filepath" ) > "$tmpfile"
  else
    ( outputCopyright "$prefix"; cat "$filepath" ) > "$tmpfile"
  fi
  mv "$tmpfile" "$filepath"
}

# Check arguments
if [[ $# -ne 2 ]] ; then
  echo "Must provide the a prefix and target filename"
  exit 1
fi

if [[ ! -f "$2" ]]; then
  echo "File \"${2}\" was not found."
  exit 2
fi

checkForCopyright 'copyright.*uber' "$2"
ecode=$?
if [[ $ecode -eq '1' ]]; then
  addCopyrightHeader "$1" "$2"
fi
