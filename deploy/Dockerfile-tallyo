FROM alpine:3.3

RUN apk update && apk upgrade 

RUN apk add nodejs git

RUN npm install -g bower db-migrate db-migrate-pg

RUN mkdir /opt && mkdir /opt/tallyo && cd /opt/tallyo
RUN echo "flush cache1"

#ADD . /opt/tallyo/scanthis
RUN mkdir -p /opt/tallyo/scanthis
WORKDIR /opt/tallyo/scanthis

#RUN npm install --production && bower install --allow-root \
#  && cp -a template_database.json database.json

CMD /bin/ash
