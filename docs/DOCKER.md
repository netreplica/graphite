# Running Graphite as a Docker container

## Pre-requisites

1. Docker
2. Containerlab topology definition files as a source for visualization

## Running

1. In a shell terminal, navigate to a directory with Containerlab topology definition files you'd like to visualize.

2. Launch Graphite as a Docker container

```Shell
CLABDIR=$(pwd)
docker run -d -t \
  -v "${CLABDIR}":/htdocs/clab \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite
````

3. At this point you should be able to view Containerlab topologies in Graphite via the following URL: [`http://localhost:8080/graphite/index.html?type=clab&topo=<topology_name>`](http://localhost:8080/graphite/index.html?type=clab&topo=<topology_name>). Make sure to replace <topology_name> with a your topology name, and `localhost` with appropriate IP or FQDN in case you are not running the browser on the same host as Graphite container.

## Environmental variables

You can use the following environmental variables with Graphite docker container:

```Shell
GRAPHITE_DEFAULT_TYPE # Default type of topology data to visualize: clab
GRAPHITE_DEFAULT_TOPO # Default topology to visualize when no specific topology is provided via the URL
CLAB_SSH_CONNECTION   # Pass value of SSH_CONNECTION env var on the host when launching Graphite container
                      # and use graphite_motd.sh script to see an URL you can open from your computer to connect to Graphite
```

## Generating offline graphs

1. If you never exported Containerlab topology graphs into JSON, you can do that for all topologies in the folder at once with the following command:

```Shell
docker exec -t graphite generate_all_offline_graphs.sh
````

  Alternatively, to export graph data for a specific topology, use

```Shell
docker exec -t graphite generate_offline_graph.sh <topology_name>.yaml
````

## Docker Image Build Instructions

Follow this guide [DOCKER-BUILD.md](DOCKER-BUILD.md)
