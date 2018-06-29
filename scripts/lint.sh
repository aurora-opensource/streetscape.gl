#!/bin/bash
# Script to check code styles

set -e

prettier-check "{modules,examples,test}/**/*.js" || \
  echo "Running prettier." && \
  prettier --write "{modules,examples,test}/**/*.js" --loglevel warn

eslint src

# check if yarn.lock contains private registry information
# comment out for now to unblock
# [ -n "`grep unpm.u yarn.lock`" ] && \
#   echo 'Please rebuild yarn file using public npmrc' && \
#   exit 1 || \
#   echo 'Lockfile valid.'
