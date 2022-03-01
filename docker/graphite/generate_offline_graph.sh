#!/bin/sh
# This script will generate offline graphs in JSON format from specified Containerlab YAML topology file

cd $WWW_HOME/clab

topo=$1

if [ -f $topo ] ; then
  clabg graph --json --topo "$topo" --offline
else
  echo Error: no such file $topo
fi
