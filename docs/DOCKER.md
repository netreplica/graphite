# Building and running Graphite as a Docker container

## Pre-requisites

1. Docker
2. Patched [version](https://github.com/netreplica/containerlab/tree/graph-json) of [Containerlab](https://github.com/srl-labs/containerlab) with capabilities to export topology data as a JSON object. Follow steps 1-3 from [CONTAINERLAB.md](docs/CONTAINERLAB.md) to build this patched binary.

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
docker image build -t netreplica/graphite:latest .
docker tag netreplica/graphite:latest netreplica/graphite:0.03
````

3. Publish the image to the repository

```Shell
docker push netreplica/graphite:latest
docker push netreplica/graphite:0.03
````

## Running

1. Navigate to the directory with assets for Graphite visualization. Graphite will use the following assets:

    * Containterlab JSON data: `./clab-<topology_name>/graph/<topology_name>.json`. Map this folder to `/var/www/localhost/htdocs/clab` image volume

2. Launch Graphite as a Docker container

```Shell
CLABDIR=`pwd`
docker run -d -t \
  -v $CLABDIR:/var/www/localhost/htdocs/clab \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite
````

3. (Optional) If you never exported Containerlab topology graphs in JSON, you can do that for all topologies with the following command:

```Shell
docker exec -t graphite generate_all_offline_graphs.sh
````

4. At this point you should be able to view Containerlab topologies in Graphite via the following URL: [`http://localhost:8080/graphite/main.html?type=clab&topo=<topology_name>`](http://localhost:8080/graphite/main.html?type=clab&topo=<topology_name>). Make sure to replace <topology_name> with a your topology name, and `localhost` with appropriate IP or FQDN in case you are not running the browser on the same host as Graphite container.

