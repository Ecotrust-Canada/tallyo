#!/bin/sh

echo "Setting timezone to :"$DB_TIMEZONE

cp /usr/share/zoneinfo/$DB_TIMEZONE /etc/localtime
echo $DB_TIMEZONE > /etc/timezone

if [ $DB_RUNMIGRATIONS = true ] ; then
	echo "Running database migrations"
	db-migrate up -e env
fi

exec node "$@" 
