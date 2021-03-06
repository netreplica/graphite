# Running Graphite as a Docker container

## Pre-requisites

1. Docker
2. Containerlab topology definition files as a source for visualization

## Running

1. In a shell terminal, navigate to a directory with Containerlab topology definition files you'd like to visualize.

2. Launch Graphite as a Docker container

```Shell
CLABDIR=`pwd`
docker run -d -t \
  -v "${CLABDIR}":/htdocs/clab \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite
````

3. If you never exported Containerlab topology graphs into JSON, you can do that for all topologies in the folder at once with the following command:

```Shell
docker exec -t graphite generate_all_offline_graphs.sh
````

  Alternatively, to export graph data for a specific topology, use
  
```Shell
docker exec -t graphite generate_offline_graph.sh <topology_name>.yaml
````

4. At this point you should be able to view Containerlab topologies in Graphite via the following URL: [`http://localhost:8080/graphite/index.html?type=clab&topo=<topology_name>`](http://localhost:8080/graphite/index.html?type=clab&topo=<topology_name>). Make sure to replace <topology_name> with a your topology name, and `localhost` with appropriate IP or FQDN in case you are not running the browser on the same host as Graphite container.

## Docker Image Build Instructions

Follow this guide [DOCKER-BUILD.md](DOCKER-BUILD.md)
