#!/bin/sh
# This script will generate offline graphs in JSON format from specified Containerlab YAML topology file

if [ -d "${WWW_HOME}/lab" ]; then
  cd "${WWW_HOME}/lab"
fi

if [ "$#" -lt 1 ]; then
  if [ -n "${GRAPHITE_DEFAULT_TOPO}" ]; then
    if [ -f "${GRAPHITE_DEFAULT_TOPO}.yaml" ] ; then
      topo="${GRAPHITE_DEFAULT_TOPO}.yaml"
    elif [ -f "${GRAPHITE_DEFAULT_TOPO}.yml" ] ; then
      topo="${GRAPHITE_DEFAULT_TOPO}.yml"
    else
      echo "Error: cannot find topology definitions file for \"${GRAPHITE_DEFAULT_TOPO}\", please specify the file name as a parameter for ${0}"
      exit 2
    fi
  else
    echo "Error: define topology name to visualize via GRAPHITE_DEFAULT_TOPO environmental variable, or pass the topology file name as a parameter for ${0}"
    exit 2
  fi
else
  topo="$1"
fi

if [ -f "${topo}" ] ; then
  echo "Visualizing topology: ${topo}"
  clabg graph --json --topo "${topo}" --offline
else
  echo Error: no such file "${topo}"
  exit 2
fi
