# Building Graphite as a Docker container

## Pre-requisites

1. Docker
2. Patched [version](https://github.com/netreplica/containerlab/tree/graph-json) of [Containerlab](https://github.com/srl-labs/containerlab) with capabilities to export topology data as a JSON object. Follow steps 1-3 from [CONTAINERLAB.md](CONTAINERLAB.md) to build this patched binary.

## Building a Docker image from source

1. Clone [lighttpd 1.4](https://git.lighttpd.net/lighttpd/lighttpd1.4) sources and build configuration files from copies provided

  ```Shell
  mkdir -p src
  git clone https://git.lighttpd.net/lighttpd/lighttpd1.4.git src/lighttpd1.4
  mkdir -p graphite/docker/graphite/etc/lighttpd/conf.d

  cp src/lighttpd1.4/doc/config/conf.d/mime.conf graphite/docker/graphite/etc/lighttpd/conf.d
  cp src/lighttpd1.4/doc/config/conf.d/dirlisting.conf graphite/docker/graphite/etc/lighttpd/conf.d

  cat src/lighttpd1.4/doc/config/lighttpd.conf | \
  sed "s/^var.server_root.*$/var.server_root = \"\/var\/www\/localhost\"/" | \
  sed "s/^server.errorlog.*$/server.errorlog = \"\/dev\/stderr\"/" | \
  grep -v "server.use-ipv6" | \
  grep -v "debug.conf" \
  > graphite/docker/graphite/etc/lighttpd/lighttpd.conf
  
  wget -O src/bootstrap-3.4.1-dist.zip https://github.com/twbs/bootstrap/releases/download/v3.4.1/bootstrap-3.4.1-dist.zip
  unzip src/bootstrap-3.4.1-dist.zip -d src/
  cp -R src/bootstrap-3.4.1-dist graphite/docker/graphite

  mkdir -p graphite/docker/graphite/default
  cp graphite/examples/3-nodes.clab.json graphite/docker/graphite/default/default.json
  ````
  
2. Clone [webssh2](https://github.com/billchurch/WebSSH2)

  ```Shell
  mkdir -p src
  git clone https://github.com/billchurch/webssh2.git src/webssh2
  mkdir -p graphite/docker/graphite/webssh2

  cp -R src/webssh2/app graphite/docker/graphite/webssh2
  ````

2. Build

  ```Shell
  cd graphite/docker/graphite
  cp ../../../containerlab/containerlab clabg
  docker image build --no-cache=true -t netreplica/graphite:webssh2 .
  # docker tag netreplica/graphite:latest netreplica/graphite:0.08
  ````

## Publish the image to the repository

  ```Shell
  docker push netreplica/graphite:latest
  docker push netreplica/graphite:0.08
  ````
