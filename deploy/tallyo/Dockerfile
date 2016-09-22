FROM alpine:3.3

RUN echo "bust cache 1"

RUN apk update && apk upgrade

RUN apk add nodejs git

RUN npm install -g bower db-migrate db-migrate-pg

RUN echo "flush cache1"

RUN mkdir -p /opt/tallyo
ADD . /opt/tallyo
WORKDIR /opt/tallyo

RUN npm install --production && bower install --allow-root \
 && cp -a template_database.json database.json

CMD /bin/ash
