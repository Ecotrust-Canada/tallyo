#!/bin/bash

docker commit tallyo_nginx_1 tallyo_nginx
docker commit tallyo_amanda1_1 tallyo
docker commit tallyo_db_1 tallyo_db
docker commit tallyo_postgrest_1 tallyo_postgrest

mkdir -p images

docker save tallyo_nginx > images/tallyo_nginx.tar
docker save tallyo > images/tallyo.tar
docker save tallyo_db > images/tallyo_db.tar
docker save tallyo_postgrest > images/tallyo_postgrest.tar

