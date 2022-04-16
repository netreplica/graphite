FROM alpine:latest

ENV LIGHTTPD_VERSION=1.4.64-r0

# Install packages
# gcompat - required by clabg
RUN apk add --no-cache \
  gcompat \
  lighttpd=${LIGHTTPD_VERSION} \
  git \
  npm \
  && rm -rf /var/cache/apk/*

# Clone Graphite dependencies
ENV WWW_HOME=/htdocs
RUN git clone --single-branch https://github.com/netreplica/next-bower.git ${WWW_HOME}/next-bower

# Default configuration
COPY docker/etc/lighttpd/ /etc/lighttpd/
RUN mkdir -p $WWW_HOME/default
COPY docker/default/ $WWW_HOME/default/
# Bootstrap
RUN mkdir -p $WWW_HOME/bootstrap-3.4.1-dist
COPY docker/bootstrap-3.4.1-dist/ $WWW_HOME/bootstrap-3.4.1-dist/

# webssh2
ENV WEBSSH2=/usr/local/webssh2
RUN mkdir -p ${WEBSSH2} 
WORKDIR ${WEBSSH2}
# Add webssh2 user to run node.js
RUN addgroup --system webssh2
RUN adduser -S -G webssh2 -H -s /bin/sh -h ${WEBSSH2} webssh2
RUN chown webssh2:webssh2 ${WEBSSH2}
COPY docker/webssh2/ ${WEBSSH2}/
COPY docker/webssh2.config.template ${WEBSSH2}/config.template
RUN npm install --production

# Scripts and binaries
COPY docker/bin/ /usr/local/bin/

# Graphite app
COPY app/ ${WWW_HOME}/graphite/

# Ports to listen
EXPOSE 80/tcp

# Volume with configuration
#VOLUME /etc/lighttpd

# Volume with Containerlab topology assets
VOLUME ${WWW_HOME}/clab

# Run lighttpd webserver
CMD ["start.sh"]

