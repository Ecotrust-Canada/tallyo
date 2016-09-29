#!/bin/sh

if [ $DB_RUNMIGRATIONS = true ] ; then
	echo "Running database migrations"
	db-migrate up -e env
fi

exec node "$@" 