FROM alpine:latest

# Patched Containerlab version with useful scripts
COPY clabg /usr/local/bin/
COPY generate_all_offline_graphs.sh /usr/local/bin/
COPY generate_offline_graph.sh /usr/local/bin/

ENV LIGHTTPD_VERSION=1.4.64-r0
ENV WWW_HOME=/var/www/localhost/htdocs
ENV WEBSSH2=/usr/local/webssh2

# Install packages
RUN apk add --no-cache \
  lighttpd=${LIGHTTPD_VERSION} \
  git \
  npm \
  && rm -rf /var/cache/apk/*

# Default configuration
COPY etc/lighttpd/ /etc/lighttpd/
RUN mkdir -p $WWW_HOME/default
COPY default/ $WWW_HOME/default/
# webssh2
RUN mkdir -p ${WEBSSH2} 
WORKDIR ${WEBSSH2}
COPY webssh2/app/ ${WEBSSH2}/
COPY webssh2.config.json ${WEBSSH2}/config.json
RUN npm install --production

# Startup script
COPY start.sh /usr/local/bin/

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

# Run lighttpd webserver

CMD ["start.sh"]

