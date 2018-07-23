#!/usr/bin/env bash

while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | sed 's/^[^=]*=//g'`
    case $PARAM in
        -s | --src)
            SRC=$VALUE
            ;;
        -d | --dst)
            DST=$VALUE
            ;;
        *)
            echo "ERROR: unknown parameter \"$PARAM\""
            usage
            exit 1
            ;;
    esac
    shift
done


echo "SRC is $SRC";
echo "DST is $DST";

node --max-old-space-size=4096 dist/es5/server/process.js --src=$SRC --dst=$DST
