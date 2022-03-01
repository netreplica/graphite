#!/bin/sh
# This script will generate offline graphs in JSON format for all Containerlab YAML topology files found in $WWW_HOME/clab directory

cd $WWW_HOME/clab

for topo in *.yaml
do
  clabg graph --json --topo "$topo" --offline
done