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
  sed "s/^server.errorlog.*$/server.errorlog = \"\/dev\/pts\/0\"/" | \
  grep -v "server.use-ipv6" | \
  grep -v "debug.conf" \
  > graphite/docker/graphite/etc/lighttpd/lighttpd.conf
  ````

2. Build

```Shell
cd graphite/docker/graphite
cp ../../../containerlab/containerlab clabg
docker image build --no-cache=true -t netreplica/graphite:latest .
docker tag netreplica/graphite:latest netreplica/graphite:0.05
````

## Publish the image to the repository

```Shell
docker push netreplica/graphite:latest
docker push netreplica/graphite:0.05
````
