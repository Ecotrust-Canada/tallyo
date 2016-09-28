#!/bin/bash

SECONDARY_ENTRYPOINT=/docker-entrypoint.sh

# set timezone of container
echo $DB_TIMEZONE > /etc/timezone

dpkg-reconfigure -f noninteractive tzdata

exec "$SECONDARY_ENTRYPOINT" "$@"