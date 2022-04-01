#!/bin/sh

chmod a+w /dev/stderr

if [ "${GRAPHITE_DEFAULT_TYPE}" == "clab" ]; then
  # check if topology-data.json is directly mounted under clab directory
  TOPO="${WWW_HOME}/clab/topology-data.json"
  if ! [ -e "${TOPO}" ] && [ -n "${GRAPHITE_DEFAULT_TOPO}" ]; then
    # check if topology-data.json is in the mounted clab-<topo> directory
    TOPO="${WWW_HOME}/clab/clab-${GRAPHITE_DEFAULT_TOPO}/topology-data.json"
    if ! [ -e "${TOPO}" ]; then
      # there is no topology-data.json in the mounted clab-<topo>, last resource is legacy implementation with generating clab-<topo>/graph/<topo>.json
      TOPO="${WWW_HOME}/clab/clab-${GRAPHITE_DEFAULT_TOPO}/graph/${GRAPHITE_DEFAULT_TOPO}.json"
      if ! [ -e "${TOPO}" ]; then
        generate_offline_graph.sh
      fi
    fi
  fi

  if [ -e "${TOPO}" ]; then
    # link topology data as a default source for visualization
    mkdir -p ${WWW_HOME}/default
    rm ${WWW_HOME}/default/default.json
    ln -s ${TOPO} ${WWW_HOME}/default/default.json
  fi
fi

if ! [ -f ${WEBSSH2}/config.json ]; then
  export WEBSSH2_SESSION_NAME="graphite-webssh2"
  export WEBSSH2_SESSION_SECRET=`cat /dev/urandom | tr -dc '[:alnum:]' | fold -w ${1:-24} | head -n 1`
  cat ${WEBSSH2}/config.template | envsubst > ${WEBSSH2}/config.json
fi


su webssh2 -c "nohup /usr/bin/node index.js 1>&2 &"
exec lighttpd -D -f /etc/lighttpd/lighttpd.conf