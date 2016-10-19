#!/bin/sh

echo "Setting timezone to: "$TALLYO_TIMEZONE

cp /usr/share/zoneinfo/$TALLYO_TIMEZONE /etc/localtime
echo $TALLYO_TIMEZONE > /etc/timezone

if [ -n "$POSTGREST_HOSTNAME" ] ; then
	echo "waiting for Postgrest..."
	/wait-for-it.sh -t 0 $POSTGREST_HOSTNAME:3000
else
    echo "POSTGREST_HOSTNAME environment variable not found!"
fi

if [ $DB_RUNMIGRATIONS = true ] ; then
	echo "Running database migrations"
	db-migrate up -e env
fi

if [ "$1" = "/bin/bash" ]; then
    echo "Executing $1 instead of node based on first argument..."
    exec "$1"
elif [ "$1" = "app" ]; then
    echo "Starting Node Server"
    exec node "$@"
else
    echo "No valid arguments found. Exiting..."
fi


