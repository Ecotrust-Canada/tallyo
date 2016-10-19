FROM alpine:3.3

ENV DB_RUNMIGRATIONS false
ENV TALLYO_TIMEZONE UTC

RUN apk update && \
    apk upgrade && \
    apk add nodejs git tzdata bash

RUN npm install -g bower db-migrate db-migrate-pg

RUN mkdir -p /opt/tallyo
ADD . /opt/tallyo
WORKDIR /opt/tallyo

COPY deploy/tallyo/docker-entrypoint.sh /
COPY deploy/tallyo/wait-for-it.sh /
RUN chmod +x /docker-entrypoint.sh /wait-for-it.sh

RUN npm install --production && bower install --allow-root \
 && cp -a template_database.json database.json

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["/bin/bash"]
