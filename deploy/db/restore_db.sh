#!/bin/bash

# Check needed envs
if [ -z "$POSTGRES_DB" ] ; then
  echo "Error: POSTGRES_DB not set"
  exit 1
fi

if [ -z "$POSTGRES_USER" ] ; then
  echo "Error: POSTGRES_USER not set"
  exit 1
fi

echo "Removing current db from docker deployment"

dropdb $POSTGRES_DB

if [ $? -ne 0 ]; then
	echo "Database drop failed, exiting" && \
	exit 1
else
	echo "Database drop succeeded"
fi

echo "Creating empty db in docker deployment"

createdb -O $POSTGRES_USER $POSTGRES_DB

if [ $? -ne 0 ]; then
	echo "Failed to create database, exiting" && \
	exit 1
else
	echo "Database creation succeeded"
fi

echo "Restoring db from docker backup"

# pg_restore -d $POSTGRES_DB /code/backups/st.dump
pg_restore -d $POSTGRES_DB <&0

if [ $? -ne 0 ]; then
	echo "Database restore failed" && \
	exit 1
else
	echo "Database restore succeeded" && \
	exit
fi
