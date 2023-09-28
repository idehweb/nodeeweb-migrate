#!/bin/bash

# $1 = absolute service path, etc: /var/nodeeweb

set -e

args=($@)
len=${#args[@]}

if [ $len -eq 0 ]
 then
 echo "path need"
 exit 1
 fi  


if [ ! -e $1 ]
 then
 echo "$1 not exist"
 exit 1
 fi  

# shared
rm -rf $1/shared/*

# front
mv $1/public/theme $1/public/front
ln -s $1/public/front $1/public/theme

# files
mv $1/public/public_media $1/public/files
ln -s $1/public/files $1/public/public_media

echo "successfully migrate dirs"

