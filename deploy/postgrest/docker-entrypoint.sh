#!/bin/sh


# set timezone of container
echo "Setting timezone to: "$TALLYO_TIMEZONE
echo $TALLYO_TIMEZONE > /etc/timezone
#export TZ=$TALLYO_TIMEZONE

dpkg-reconfigure -f noninteractive tzdata

/wait-for-it.sh -t 0 $DB_HOSTNAME:$POSTGREST_DBPORT

echo "Starting Postgrest server"

exec postgrest postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOSTNAME}:${POSTGREST_DBPORT}/${POSTGRES_DB} --port 3000 --schema public --anonymous postgres --pool 200
