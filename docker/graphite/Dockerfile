FROM alpine:latest

# lighttpd version to use
ENV LIGHTTPD_VERSION=1.4.64-r0

# Install lighttpd

RUN apk add --no-cache lighttpd=${LIGHTTPD_VERSION} \
  && rm -rf /var/cache/apk/*

# Default configuration
COPY etc/lighttpd/ /etc/lighttpd/
COPY start.sh /usr/local/bin/

# Ports to listen
EXPOSE 80/tcp

# Volume with configuration
#VOLUME /etc/lighttpd

# Volume with files to serve
VOLUME /var/www/localhost/htdocs

# Run lighttpd webserver

CMD ["start.sh"]

