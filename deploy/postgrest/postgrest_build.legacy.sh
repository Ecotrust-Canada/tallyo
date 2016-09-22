#!/bin/sh

docker build -f Dockerfile-postgrest -t postgrest-ec:0.3.2.0 .

# run -d -v /mnt/mirror0/owncloud/data:/var/www/html/data -v /mnt/mirror0/owncloud/config:/var/www/html/config  --name owncloud-test -p 82:80 owncloud-smb

# docker run --name <name of servie e.g. postgrest_alex_am2> -p <port you want service to run on>:3000 -e POSTGREST_VERSION=0.3.0.3 -e POSTGREST_DBHOST=10.10.40.30 -e POSTGREST_DBPORT=5432 -e POSTGREST_DBNAME=<name of database> -e POSTGREST_DBUSER=tuna_processor -e POSTGREST_DBPASS=salmon -d postgrest-ec
