FROM alpine:3.3

ENV DB_RUNMIGRATIONS false
ENV TALLYO_TIMEZONE UTC

RUN apk update && apk upgrade

RUN apk add nodejs git tzdata



RUN npm install -g bower db-migrate db-migrate-pg

RUN mkdir -p /opt/tallyo
ADD . /opt/tallyo
WORKDIR /opt/tallyo

COPY deploy/tallyo/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

RUN npm install --production && bower install --allow-root \
 && cp -a template_database.json database.json


ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/bin/sh"]
