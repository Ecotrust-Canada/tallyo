#!/bin/sh


# set timezone of container
echo "Setting timezone to: "$TALLYO_TIMEZONE
echo $TALLYO_TIMEZONE > /etc/timezone
#export TZ=$TALLYO_TIMEZONE

dpkg-reconfigure -f noninteractive tzdata


exec postgrest postgres://${POSTGREST_DBUSER}:${POSTGREST_DBPASS}@${POSTGREST_DBHOST}:${POSTGREST_DBPORT}/${POSTGREST_DBNAME} --port 3000 --schema public --anonymous postgres --pool 200
