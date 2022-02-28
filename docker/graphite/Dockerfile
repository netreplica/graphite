FROM alpine:latest

ENV LIGHTTPD_VERSION=1.4.64-r0
ENV WWW_HOME=/var/www/localhost/htdocs

# Install lighttpd and git

RUN apk add --no-cache \
  lighttpd=${LIGHTTPD_VERSION} \
  git \
  && rm -rf /var/cache/apk/*

# Default configuration
COPY etc/lighttpd/ /etc/lighttpd/
COPY start.sh /usr/local/bin/

# Ports to listen
EXPOSE 80/tcp

# Volume with configuration
#VOLUME /etc/lighttpd

# Volume with files to serve
VOLUME ${WWW_HOME}/data

# Clone Graphite repo and dependencies
RUN git clone --single-branch https://github.com/netreplica/next-bower.git ${WWW_HOME}/next-bower
# TODO remove -b before merging into main
RUN git clone -b docker --single-branch https://github.com/netreplica/graphite.git ${WWW_HOME}/graphite

# Run lighttpd webserver

CMD ["start.sh"]

