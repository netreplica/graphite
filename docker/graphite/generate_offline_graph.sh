#!/bin/sh
# This script will generate offline graphs in JSON format from specified Containerlab YAML topology file

if [ -d $WWW_HOME/clab ]; then
  cd $WWW_HOME/clab
fi

if [ "$#" -lt 1 ]; then
  if [ -n "$GRAPHITE_DEFAULT_TOPO" ]; then
    topo="${GRAPHITE_DEFAULT_TOPO}.yaml"
  else
    echo Error: define topology name to visualize via GRAPHITE_DEFAULT_TOPO or as a parameter
    exit 2
  fi
else
  topo="$1"
fi

if [ -f "$topo" ] ; then
  echo Visualizing topology: "$topo"
  clabg graph --json --topo "$topo" --offline
else
  echo Error: no such file "$topo"
  exit 2
fi
