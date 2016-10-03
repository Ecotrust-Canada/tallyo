#!/bin/sh

echo "Setting timezone to: "$TALLYO_TIMEZONE

cp /usr/share/zoneinfo/$TALLYO_TIMEZONE /etc/localtime
echo $TALLYO_TIMEZONE > /etc/timezone

if [ $DB_RUNMIGRATIONS = true ] ; then
	echo "Running database migrations"
	db-migrate up -e env
fi

exec node "$@" 
