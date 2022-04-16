#!/bin/sh
# This script will generate offline graphs in JSON format for all Containerlab YAML topology files found in $WWW_HOME/clab directory

if [ -d $WWW_HOME/clab ]; then
  cd $WWW_HOME/clab
fi

for topo in *.yaml
do
  clabg graph --json --topo "$topo" --offline
done