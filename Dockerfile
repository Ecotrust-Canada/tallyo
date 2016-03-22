FROM alpine:3.3

RUN apk update && apk upgrade

RUN apk add nodejs git

RUN npm install -g bower nodemon forever db-migrate db-migrate-pg

RUN mkdir /opt && mkdir /opt/tallyo && cd /opt/tallyo && git clone https://github.com/Ecotrust-Canada/scanthis.git
RUN cd /opt/tallyo/scanthis && npm install --production && bower install --allow-root option
CMD /bin/ash
