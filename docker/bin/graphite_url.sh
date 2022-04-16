#!/bin/sh
# This script will display an URL to connect to for topology visualization

if [ "$#" -lt 1 ]; then
  echo Error: provide HTTP port as a parameter
  exit 2
else
  GPORT="$1"
fi

if [ -n "$CLAB_SSH_CONNECTION" ]; then
  GHOST=`echo $CLAB_SSH_CONNECTION | awk '{print $3}'`
else
  GHOST=$HOSTNAME
fi

echo "http://${GHOST}:${GPORT}/graphite"
