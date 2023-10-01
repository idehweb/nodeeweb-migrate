#!/bin/bash

# $1 = service name
# $2 = new image
# $3 = service path
# set env:
# MONGO_URL=
# DB_NAME=
# AUTH_SECRET=
# APP_NAME=
# BASE_URL=
# PORT=
# example: ./service.sh nwi-nodeeweb nodeeweb-shop:semi-1.0.1

set -e

args=($@)
len=${#args[@]}

if [ $len -eq 0 ]
then
echo "we need service name arg"
exit 1
fi;


MONGO_URL=${MONGO_URL:-"mongodb://mongomaster:27017"}
DB_NAME=${DB_NAME:-"Nodeeweb"}
AUTH_SECRET=${AUTH_SECRET:-`openssl rand -hex 24`}
APP_NAME=${APP_NAME:-"Nodeeweb"}
BASE_URL=${BASE_URL:-"https://$1.com"}
PORT=${PORT:-"3000"}

envs=(`docker service inspect --pretty $1 | grep "Env"`)


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
service_path=${3:-"/var/instances/$1"}

logs_path="$service_path/logs"
plugins_path="$service_path/plugins"

# create mount path
mkdir -p $logs_path
mkdir -p $plugins_path

# image pull
echo "Start Image Pull"
docker image pull $new_image

# rm mounts
echo "Try to remove old mounts"
docker service update --mount-rm "/app/theme/" --mount-rm "/app/public_media/" --mount-rm "/app/plugins/" $1

echo "Try to update new configs"
docker service update --image $new_image --env-add MONGO_URL=$MONGO_URL --env-add DB_NAME=$DB_NAME --env-add APP_NAME=$APP_NAME --env-add BASE_URL=$BASE_URL --env-add AUTH_SECRET=$AUTH_SECRET  --mount-add "type=bind,source=$logs_path,destination=/app/logs/" --mount-add "type=bind,source=$plugins_path,destination=/app/plugins/" --restart-condition any $1 