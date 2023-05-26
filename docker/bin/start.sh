#!/bin/sh

chmod a+w /dev/stderr

 # Topology location used by the web app by default, can be mounted this way directly from the host
TOPO="${WWW_HOME}/default/default.json"

# Default topology from the lab/default folder:
# – in case the folder was mounted from the host, or
# - the lab folder was not mounted, in which case we can use the default topology provided by the image
DEFAULT_TOPO="${WWW_HOME}/lab/default/topology-data.json"
if ! [ -e "${TOPO}" ] && [ -e "${DEFAULT_TOPO}" ] ; then
  mkdir -p "${WWW_HOME}/default"
  ln -s "${DEFAULT_TOPO}" "${TOPO}"
fi

# Topology location via environment variables – overrides default topology location
if [ -n "${GRAPHITE_DEFAULT_TOPO}" ]; then
  case "${GRAPHITE_DEFAULT_TYPE}" in
    clab)
      DEFAULT_TOPO="${WWW_HOME}/lab/clab-${GRAPHITE_DEFAULT_TOPO}/topology-data.json"
      ;;
    graphite)
      DEFAULT_TOPO="${WWW_HOME}/lab/${GRAPHITE_DEFAULT_TOPO}.graphite.json"
      ;;
    *)
      DEFAULT_TOPO="${WWW_HOME}/lab/${GRAPHITE_DEFAULT_TOPO}"
      ;;
  esac

  # check if DEFAULT_TOPO exists
  if [ -e "${DEFAULT_TOPO}" ]; then
    # create a symlink to the default topology
    mkdir -p "${WWW_HOME}/default"
    ln -s "${DEFAULT_TOPO}" "${TOPO}"
  fi
fi

if ! [ -f ${NODEDATA}/instance/nodedata.cfg ]; then
  export NODEDATA_ROOT="${WWW_HOME}/lab"
  export NODEDATA_SECRETS="instance/secrets.json"
  cat ${NODEDATA}/nodedata.cfg.template | envsubst > ${NODEDATA}/instance/nodedata.cfg
fi
cd ${NODEDATA} && su uwsgi -c "nohup uwsgi --socket 127.0.0.1:5000 --protocol=http -w wsgi:app --master -p 4 1>&2 &"

if ! [ -f ${WEBSSH2}/config.json ]; then
  export WEBSSH2_SESSION_NAME="graphite-webssh2"
  export WEBSSH2_SESSION_SECRET=`cat /dev/urandom | tr -dc '[:alnum:]' | fold -w ${1:-24} | head -n 1`
  cat ${WEBSSH2}/config.template | envsubst > ${WEBSSH2}/config.json
fi

cd ${WEBSSH2} && su webssh2 -c "nohup /usr/bin/node index.js 1>&2 &"
exec lighttpd -D -f /etc/lighttpd/lighttpd.conf