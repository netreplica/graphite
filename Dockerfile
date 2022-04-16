FROM alpine:latest

ENV LIGHTTPD_VERSION=1.4.64-r0
ENV WWW_HOME=/var/www/localhost/htdocs
ENV WEBSSH2=/usr/local/webssh2

# Install packages
RUN apk add --no-cache \
  gcompat # required by clabg \
  lighttpd=${LIGHTTPD_VERSION} \
  git \
  npm \
  && rm -rf /var/cache/apk/*

# Default configuration
COPY docker/etc/lighttpd/ /etc/lighttpd/
RUN mkdir -p $WWW_HOME/default
COPY docker/default/ $WWW_HOME/default/
# Bootstrap
RUN mkdir -p $WWW_HOME/bootstrap-3.4.1-dist
COPY docker/bootstrap-3.4.1-dist/ $WWW_HOME/bootstrap-3.4.1-dist/
# webssh2
RUN mkdir -p ${WEBSSH2} 
WORKDIR ${WEBSSH2}
COPY docker/webssh2/app/ ${WEBSSH2}/
COPY docker/webssh2.config.template ${WEBSSH2}/config.template
RUN npm install --production

# Scripts and binaries
COPY docker/bin/ /usr/local/bin/

# Ports to listen
EXPOSE 80/tcp

# Volume with configuration
#VOLUME /etc/lighttpd

# Volume with Containerlab topology assets
VOLUME ${WWW_HOME}/clab

# Clone Graphite repo and dependencies
RUN git clone --single-branch https://github.com/netreplica/next-bower.git ${WWW_HOME}/next-bower
# TODO remove -b before merging into main
RUN git clone --single-branch -b webssh2 https://github.com/netreplica/graphite.git ${WWW_HOME}/graphite

# Add webssh2 user to run node.js
RUN addgroup --system webssh2
RUN adduser -S -G webssh2 -H -s /bin/sh -h ${WEBSSH2} webssh2
RUN chown webssh2:webssh2 ${WEBSSH2}

# Run lighttpd webserver
CMD ["start.sh"]

