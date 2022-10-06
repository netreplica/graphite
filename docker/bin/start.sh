#!/bin/sh

chmod a+w /dev/stderr

if [ "${GRAPHITE_DEFAULT_TYPE}" == "clab" ]; then
  # check if topology-data.json is directly mounted under lab directory
  TOPO="${WWW_HOME}/lab/topology-data.json"
  if ! [ -e "${TOPO}" ] && [ -n "${GRAPHITE_DEFAULT_TOPO}" ]; then
    # check if topology-data.json is in the mounted clab-<topo> directory
    TOPO="${WWW_HOME}/lab/clab-${GRAPHITE_DEFAULT_TOPO}/topology-data.json"
    if ! [ -e "${TOPO}" ]; then
      # there is no topology-data.json in the mounted clab-<topo>, last resource is legacy implementation with generating clab-<topo>/graph/<topo>.json
      TOPO="${WWW_HOME}/lab/clab-${GRAPHITE_DEFAULT_TOPO}/graph/${GRAPHITE_DEFAULT_TOPO}.json"
      if ! [ -e "${TOPO}" ]; then
        generate_offline_graph.sh
      fi
    fi
  fi

  if [ -e "${TOPO}" ]; then
    # link topology data as a default source for visualization
    mkdir -p ${WWW_HOME}/lab/default
    rm ${WWW_HOME}/lab/default/topology-data.json
    ln -s ${TOPO} ${WWW_HOME}/lab/default/topology-data.json
  fi
fi

if ! [ -f ${NODEDATA}/instance/node-data.cfg ]; then
  export NODEDATA_ROOT="${WWW_HOME}/lab"
  export NODEDATA_SECRETS="instance/secrets.json"
  cat ${NODEDATA}/node-data.cfg.template | envsubst > ${NODEDATA}/instance/node-data.cfg
fi
cd ${NODEDATA} && nohup flask --app=node-data run 1>&2 &

if ! [ -f ${WEBSSH2}/config.json ]; then
  export WEBSSH2_SESSION_NAME="graphite-webssh2"
  export WEBSSH2_SESSION_SECRET=`cat /dev/urandom | tr -dc '[:alnum:]' | fold -w ${1:-24} | head -n 1`
  cat ${WEBSSH2}/config.template | envsubst > ${WEBSSH2}/config.json
fi

cd ${WEBSSH2} && su webssh2 -c "nohup /usr/bin/node index.js 1>&2 &"
exec lighttpd -D -f /etc/lighttpd/lighttpd.conf