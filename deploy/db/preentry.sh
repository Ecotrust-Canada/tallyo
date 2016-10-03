#!/bin/bash

SECONDARY_ENTRYPOINT=/docker-entrypoint.sh

# set timezone of container
echo "Setting timezone to: "$TALLYO_TIMEZONE
echo $TALLYO_TIMEZONE > /etc/timezone
export PGTZ=$TALLYO_TIMEZONE
#override database timezone 
#(this is hacky since we just append a timezone everytime this script runs really we should edit the line but)

echo "timezone = '$TALLYO_TIMEZONE'" >> /var/lib/postgresql/data/postgresql.conf

dpkg-reconfigure -f noninteractive tzdata

exec "$SECONDARY_ENTRYPOINT" "$@"