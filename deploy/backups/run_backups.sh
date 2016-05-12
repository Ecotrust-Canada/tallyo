#!/bin/sh

# Back up the database once per hour, to the /bak/folder with filename showing the current datetime.

mkdir -p /bak

export PGPASSWORD=postgres

FILENAME=/bak/tallyo-$(date +%Y%m%d-%H%M%S).sql

echo "Backing up..."

pg_dump -h db -U tuna_processor postgres > $FILENAME

echo "A backup was saved in $FILENAME"

# remove anything that's not the first of a month, and is at least a month old
rm `find /bak/* -mtime "+30" | grep -v "01\-"` 2> /dev/null

# remove files older than 2 days that aren't at 8 o'clock
rm `find /bak/* -mtime "+2" | grep -v "\-22"` 2> /dev/null

KEY=/code/id_rsa

if [ -f $KEY ];
then
   echo "Backup key $KEY exists, backing up remotely."
   scp -i $KEY -o "StrictHostKeyChecking no" test 192.168.1.11:/bak/
else
   echo "No backup key found, not backing up remotely."
fi

sleep 5

