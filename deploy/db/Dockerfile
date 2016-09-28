FROM postgres:9.5.2

ENV DB_TIMEZONE UTC

COPY preentry.sh /
RUN  apt-get update \
  && apt-get -y install openssh-client

ENTRYPOINT ["/preentry.sh"]
CMD ["postgres"]