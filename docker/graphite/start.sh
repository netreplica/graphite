#!/bin/sh

chmod a+w /dev/stderr

if [ "${GRAPHITE_DEFAULT_TYPE}" == "clab" ] && [ -n "${GRAPHITE_DEFAULT_TOPO}" ]; then
  TOPO="${WWW_HOME}/${GRAPHITE_DEFAULT_TYPE}/clab-${GRAPHITE_DEFAULT_TOPO}/graph/${GRAPHITE_DEFAULT_TOPO}.json"
  if ! [ -e "${TOPO}" ]; then
    generate_offline_graph.sh
  fi
  
  if [ -e "${TOPO}" ]; then
    mkdir -p ${WWW_HOME}/default
    rm ${WWW_HOME}/default/default.json
    ln -s ${WWW_HOME}/${GRAPHITE_DEFAULT_TYPE}/clab-${GRAPHITE_DEFAULT_TOPO}/graph/${GRAPHITE_DEFAULT_TOPO}.json ${WWW_HOME}/default/default.json
  fi
fi

if ! [ -f ${WEBSSH2}/config.json ]; then
  export WEBSSH2_SESSION_NAME="graphite-webssh2"
  export WEBSSH2_SESSION_SECRET=`cat /dev/urandom | tr -dc '[:alnum:]' | fold -w ${1:-24} | head -n 1`
  cat ${WEBSSH2}/config.template | envsubst > ${WEBSSH2}/config.json
fi


su webssh2 -c "nohup /usr/bin/node index.js 1>&2 &"
exec lighttpd -D -f /etc/lighttpd/lighttpd.conf