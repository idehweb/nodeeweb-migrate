#!/bin/bash

# $1 = service name
# $2 = new image
# example: ./service.sh nwi-nodeeweb nodeeweb-shop:semi-1.0.1

set -e

args=($@)
len=${#args[@]}

if [ $len -eq 0 ]
then
echo "we need service name arg"
exit 1
fi;

envs=(`docker service inspect --pretty nodeeweb_nodeeweb-server | grep "Env"`)

MONGO_URL="mongodb://mongomaster:27017"
DB_NAME="Nodeeweb"
AUTH_SECRET=`openssl rand -hex 24`
APP_NAME="Nodeeweb"
BASE_URL="https://$1.com"
PORT="3000"

for env in ${envs[@]}
do
    kv=(${env/=/ })
    if [ $kv == "BASE_URL" ]; then BASE_URL=${kv[1]} ;fi;
    if [ $kv == "mongodbConnectionUrl" ]; then MONGO_URL=${kv[1]} ;fi;
    if [ $kv == "dbName" ]; then DB_NAME=${kv[1]} ;fi;
    if [ $kv == "SITE_NAME" ]; then APP_NAME=${kv[1]} ;fi;
    if [ $kv == "PORT" ]; then PORT=${kv[1]} ;fi;
done

new_image=${2:-"idehweb/nodeeweb-shop:semi-1.0.1"}

docker service update --image $new_image --env-add MONGO_URL=$MONGO_URL --env-add DB_NAME=$DB_NAME --env-add APP_NAME=$APP_NAME --env-add BASE_URL=$BASE_URL --env-add AUTH_SECRET=$AUTH_SECRET $1 