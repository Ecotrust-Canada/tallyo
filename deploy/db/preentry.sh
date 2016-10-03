#!/bin/bash

SECONDARY_ENTRYPOINT=/docker-entrypoint.sh

# set timezone of container
echo $DB_TIMEZONE > /etc/timezone
export TZ=$DB_TIMEZONE

dpkg-reconfigure -f noninteractive tzdata

exec "$SECONDARY_ENTRYPOINT" "$@"