# Building Graphite as a Docker container

## Pre-requisites

1. Docker
2. Patched [version](https://github.com/netreplica/containerlab/tree/graph-json) of [Containerlab](https://github.com/srl-labs/containerlab) with capabilities to export topology data as a JSON object. Follow steps 1-3 from [CONTAINERLAB.md](CONTAINERLAB.md) to build this patched binary.

## Building a Docker image from source

1. Clone [lighttpd 1.4](https://git.lighttpd.net/lighttpd/lighttpd1.4) sources and build configuration files from copies provided

  ```Shell
  mkdir -p src
  git clone https://git.lighttpd.net/lighttpd/lighttpd1.4.git src/lighttpd1.4
  mkdir -p graphite/docker/etc/lighttpd/conf.d

  cp src/lighttpd1.4/doc/config/conf.d/mime.conf graphite/docker/etc/lighttpd/conf.d
  cp src/lighttpd1.4/doc/config/conf.d/dirlisting.conf graphite/docker/etc/lighttpd/conf.d

  cat src/lighttpd1.4/doc/config/lighttpd.conf | \
  sed "s/^var.server_root.*$/var.server_root = \"\/var\/www\/localhost\"/" | \
  sed "s/^server.errorlog.*$/server.errorlog = \"\/dev\/stderr\"/" | \
  grep -v "server.use-ipv6" | \
  grep -v "debug.conf" \
  > graphite/docker/etc/lighttpd/lighttpd.conf
  
  wget -O src/bootstrap-3.4.1-dist.zip https://github.com/twbs/bootstrap/releases/download/v3.4.1/bootstrap-3.4.1-dist.zip
  unzip src/bootstrap-3.4.1-dist.zip -d src/
  cp -R src/bootstrap-3.4.1-dist graphite/docker

  mkdir -p graphite/docker/default
  cp graphite/examples/3-nodes.clab.json graphite/docker/default/default.json
  ````
  
2. Clone [webssh2](https://github.com/billchurch/WebSSH2)

  ```Shell
  mkdir -p src
  git clone https://github.com/billchurch/webssh2.git src/webssh2
  mkdir -p graphite/docker/webssh2

  rm -rf graphite/docker/webssh2
  cp -R src/webssh2/app graphite/docker/webssh2/
  ````

3. Build custom containerlab binary – this step was tested on Linux Ubuntu 20.04 LTS

  ```Shell
  mkdir -p src
  git clone --single-branch -b graph-json https://github.com/netreplica/containerlab.git src/clabg
  cd src/clabg
  go build
  cp containerlab ../../graphite/docker/bin/clabg
  cd ../..
  ````

4. Build

  ```Shell
  cd graphite
  # Current envsubst version in alpine has bugs, use a go implementation instead
  curl -L https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-Linux-x86_64 -o docker/bin/envsubst
  chmod +x docker/bin/envsubst
  docker image build --no-cache=true -t netreplica/graphite:webssh2 .
  # docker tag netreplica/graphite:latest netreplica/graphite:0.09
  ````

## Publish the image to the repository

  ```Shell
  docker push netreplica/graphite:latest
  docker push netreplica/graphite:0.08
  ````
