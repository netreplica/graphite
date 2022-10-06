#!/bin/sh
# This script will generate offline graphs in JSON format for all Containerlab YAML topology files found in $WWW_HOME/clab directory

if [ -d "$WWW_HOME/lab" ]; then
  cd "$WWW_HOME/lab"
fi

for topo in *.yaml
do
  clabg graph --json --topo "$topo" --offline
done

for topo in *.yml
do
  clabg graph --json --topo "$topo" --offline
done
