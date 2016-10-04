FROM postgres:9.5.2

ENV TALLYO_TIMEZONE UTC

COPY preentry.sh /
RUN chmod +x ./preentry.sh
RUN  apt-get update \
  && apt-get -y install openssh-client

# add support to postgres using built-in initdb.d
ADD *.sql /docker-entrypoint-initdb.d/

ENTRYPOINT ["/preentry.sh"]
CMD ["postgres"]