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

if sh -c 'curl --silent --connect-timeout 1 http://169.254.169.254/ >/dev/null'; then
  # looks like we are running in a public cloud environment
  GHOST=`curl --silent --connect-timeout 3 ifconfig.me`
fi

echo "http://${GHOST}:${GPORT}/graphite"
