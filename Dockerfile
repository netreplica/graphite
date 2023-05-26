##########################################
# NODEDATA-IMAGE
##########################################

FROM alpine:3.15 AS nodedata-image
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
ENV NODEDATA="/usr/local/node-data"
ENV VIRTUAL_ENV="${NODEDATA}/venv"
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
RUN mkdir -p ${NODEDATA}/instance && mkdir -p ${NODEDATA}/venv
COPY docker/node-data/ ${NODEDATA}/
COPY docker/nodedata.cfg.template ${NODEDATA}/nodedata.cfg.template
WORKDIR ${NODEDATA}
RUN python3 -m venv $VIRTUAL_ENV \
  && pip3 install --no-cache-dir -r requirements.txt -r requirements_prod.txt \
  && pip install -e .

##########################################
# WEBSSH-IMAGE
##########################################

FROM alpine:3.15 AS webssh-image

RUN apk add --no-cache \
  npm \
  && rm -rf /var/cache/apk/*

# webssh2
ENV WEBSSH2=/usr/local/webssh2
RUN mkdir -p ${WEBSSH2}
WORKDIR ${WEBSSH2}
COPY docker/webssh2/app/ ${WEBSSH2}/
COPY docker/webssh2.config.template ${WEBSSH2}/config.template
# Add webssh2 user to run node.js
RUN addgroup --system webssh2 \
  && adduser -S -G webssh2 -H -s /bin/sh -h ${WEBSSH2} webssh2 \
  && chown webssh2:webssh2 ${WEBSSH2} \
  && npm install --production \
  && npm audit fix

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
ENV NODEDATA=/usr/local/node-data
ENV VIRTUAL_ENV=${NODEDATA}/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
COPY --from=nodedata-image /usr/local/node-data /usr/local/node-data
RUN addgroup --system uwsgi \
  && adduser -S -G uwsgi -H -s /bin/sh -h ${NODEDATA} uwsgi \
  && chown uwsgi:uwsgi ${NODEDATA}

# webssh2
ENV WEBSSH2=/usr/local/webssh2
COPY --from=webssh-image ${WEBSSH2} ${WEBSSH2}
RUN addgroup --system webssh2 \
  && adduser -S -G webssh2 -H -s /bin/sh -h ${WEBSSH2} webssh2 \
  && chown webssh2:webssh2 ${WEBSSH2}

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

