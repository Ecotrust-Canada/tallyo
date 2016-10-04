#!/bin/bash

SECONDARY_ENTRYPOINT=/docker-entrypoint.sh
POSTGRESQL_CONFIG=$PGDATA"/postgresql.conf"

# set timezone of container
echo "Setting timezone to: "$TALLYO_TIMEZONE
echo $TALLYO_TIMEZONE > /etc/timezone
dpkg-reconfigure -f noninteractive tzdata
export TZ=$TALLYO_TIMEZONE
export PGTZ=$TALLYO_TIMEZONE

#override database timezone (does not run on initial )
#(this is hacky since we just append a timezone everytime this script runs really we should edit the line)
if [ -e $POSTGRESQL_CONFIG ] ; then
  echo "Overriding database timezone"
  sed -i -e "\%timezone =% s%= .*%= '$TALLYO_TIMEZONE'%" $POSTGRESQL_CONFIG
fi


exec "$SECONDARY_ENTRYPOINT" "$@"