#!/bin/sh

chmod a+w /dev/pts/0

if [ "${GRAPHITE_DEFAULT_TYPE}" == "clab" ] && [ -n "${GRAPHITE_DEFAULT_TOPO}" ]; then
  TOPO="${WWW_HOME}/${GRAPHITE_DEFAULT_TYPE}/clab-${GRAPHITE_DEFAULT_TOPO}/graph/${GRAPHITE_DEFAULT_TOPO}.json"
  if [ -e "${TOPO}" ]; then
    mkdir -p ${WWW_HOME}/default
    ln -s ${WWW_HOME}/${GRAPHITE_DEFAULT_TYPE}/clab-${GRAPHITE_DEFAULT_TOPO}/graph/${GRAPHITE_DEFAULT_TOPO}.json ${WWW_HOME}/default/default.json
  fi
fi

exec lighttpd -D -f /etc/lighttpd/lighttpd.conf