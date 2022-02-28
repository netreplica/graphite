# Building and running Graphite as a Docker container

## Pre-requisites

1. Docker

## Building a Docker image from source

1. Clone lighttpd 1.4 sources and build configuration files from copies provided with the sources

  ```Shell
  mkdir -p src
  git clone https://git.lighttpd.net/lighttpd/lighttpd1.4.git src/lighttpd1.4
  mkdir -p graphite/docker/graphite/etc/lighttpd/conf.d

  cp src/lighttpd1.4/doc/config/conf.d/mime.conf graphite/docker/graphite/etc/lighttpd/conf.d
  cp src/lighttpd1.4/doc/config/conf.d/dirlisting.conf graphite/docker/graphite/etc/lighttpd/conf.d

  cat src/lighttpd1.4/doc/config/lighttpd.conf | \
  sed "s/^var.server_root.*$/var.server_root = \"\/var\/www\/localhost\"/" | \
  sed "s/^server.errorlog.*$/server.errorlog = \"\/dev\/pts\/0\"/" | \
  grep -v "server.use-ipv6" | \
  grep -v "debug.conf" \
  > graphite/docker/graphite/etc/lighttpd/lighttpd.conf
  
  echo '' >> graphite/docker/graphite/etc/lighttpd/lighttpd.conf
  ````

2. Build

```Shell
cd graphite/docker/graphite
docker image build -t netreplica/graphite:latest .
docker tag netreplica/graphite:latest netreplica/graphite:0.02
````

## Running

1. Navigate to the directory with assets for Graphite visualization and launch the container

```Shell
WWWDIR=`pwdr`
docker run --rm -t \
  -v $WWWDIR:/var/www/localhost/htdocs/data \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite
````
