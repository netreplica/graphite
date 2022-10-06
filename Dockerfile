##########################################
# BUILD-IMAGE
##########################################

FROM alpine:3.15 AS build-image
# Install packages
RUN apk add --no-cache \
  curl \
  build-base \
  python3 \
  python3-dev \
  && rm -rf /var/cache/apk/* \
  && curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py \
  && python3 get-pip.py \
  && pip3 install virtualenv

# Node-data
ENV NODEDATA="/usr/local/nodedata"
ENV VIRTUAL_ENV="${NODEDATA}/venv"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
RUN mkdir -p ${NODEDATA}/node-data && mkdir -p ${NODEDATA}/venv && mkdir -p ${NODEDATA}/instance
COPY docker/node-data/ ${NODEDATA}/node-data/
COPY docker/node-data.cfg.template ${NODEDATA}/node-data.cfg.template
WORKDIR ${NODEDATA}
RUN python3 -m venv $VIRTUAL_ENV && pip3 install --no-cache-dir -r node-data/requirements.txt

##########################################
# RELEASE-IMAGE
##########################################

FROM alpine:3.15 AS release-image

ENV LIGHTTPD_VERSION=1.4.64-r0

# Install packages
# gcompat - required by clabg
RUN apk add --no-cache \
  gcompat \
  lighttpd=${LIGHTTPD_VERSION} \
  git \
  npm \
  curl \
  openssh-client \
  python3 \
  && rm -rf /var/cache/apk/*

# Clone Graphite dependencies
ENV WWW_HOME=/htdocs
RUN git clone --single-branch https://github.com/netreplica/next-bower.git ${WWW_HOME}/next-bower

# HTTPd configuration and assets
RUN mkdir -p $WWW_HOME/lab/default && mkdir -p $WWW_HOME/bootstrap-3.4.1-dist
COPY docker/etc/lighttpd/ /etc/lighttpd/
COPY docker/bootstrap-3.4.1-dist/ $WWW_HOME/bootstrap-3.4.1-dist/

# Node-data
ENV NODEDATA=/usr/local/nodedata
COPY --from=build-image /usr/local/nodedata /usr/local/nodedata
#RUN chown -R uwsgi:uwsgi ${NODEDATA}
WORKDIR ${NODEDATA}
ENV VIRTUAL_ENV=${NODEDATA}/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# webssh2
ENV WEBSSH2=/usr/local/webssh2
RUN mkdir -p ${WEBSSH2} 
WORKDIR ${WEBSSH2}
COPY docker/webssh2/ ${WEBSSH2}/
COPY docker/webssh2.config.template ${WEBSSH2}/config.template
# Add webssh2 user to run node.js
RUN addgroup --system webssh2 \
  && adduser -S -G webssh2 -H -s /bin/sh -h ${WEBSSH2} webssh2 \
  && chown webssh2:webssh2 ${WEBSSH2} \
  && npm install --production

# Default data
COPY docker/default/ $WWW_HOME/lab/default/

# Scripts and binaries
COPY docker/bin/ /usr/local/bin/

# Graphite app
COPY app/ ${WWW_HOME}/graphite/

# Ports to listen
EXPOSE 80/tcp

# Volume with configuration
#VOLUME /etc/lighttpd

# Volume with lab topology assets
VOLUME ${WWW_HOME}/lab

# Run lighttpd webserver
CMD ["start.sh"]

