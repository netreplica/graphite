#!/bin/sh
# This script will display an invitation to connect to Graphite URL for topology visualization

if [ "$#" -lt 1 ]; then
  echo Error: provide HTTP port as a parameter
  exit 2
else
  GPORT="$1"
fi

echo "Graphite visualization URL: `graphite_url.sh ${GPORT}`"