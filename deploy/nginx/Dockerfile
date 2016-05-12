FROM tutum/nginx

RUN echo "cache bust 6" \
  && rm /etc/nginx/sites-enabled/default && mkdir /static
  ADD sites-enabled/ /etc/nginx/sites-enabled
