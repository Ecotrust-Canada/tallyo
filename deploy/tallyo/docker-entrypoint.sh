#!/bin/sh

echo "Setting timezone to: "$TALLYO_TIMEZONE

cp /usr/share/zoneinfo/$TALLYO_TIMEZONE /etc/localtime
echo $TALLYO_TIMEZONE > /etc/timezone

/wait-for-it.sh -t 0 $POSTGREST_HOSTNAME:3000

if [ $DB_RUNMIGRATIONS = true ] ; then
	echo "Running database migrations"
	db-migrate up -e env
fi

echo "Starting Node Server"

exec node "$@" 
