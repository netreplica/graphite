# Running Graphite as a Docker container

## Pre-requisites

1. Docker
2. Topology data file(s) as a source for visualization, in one of supported formats

## Running with a single data file to visualize

1. In a shell terminal, initialize `env:TOPOLOGY` variable with a full path of the data file for visualization. For example, for the file `topology.json` in the current directory:

    ```Shell
    TOPOLOGY="$(pwd)/topology.json"
    ```

2. Launch Graphite as a Docker container with the data file mounted as `/htdocs/default/default.json`:

    ```Shell
    docker run -d -t --rm \
        --mount type=bind,source="${TOPOLOGY}",target=/htdocs/default/default.json,readonly \
        -p 8080:80 \
        --name graphite \
        netreplica/graphite:latest
    ```

3. You should be able to see the visualization on [`http://localhost:8080/graphite/`](http://localhost:8080/graphite/)

## Running with ability to visualize multiple data files

1. In a shell terminal, navigate to a directory with the data files for visualization.

2. Launch Graphite as a Docker container with the current directory mounted as `/htdocs/lab`:

  ```Shell
  docker run -d -t --rm \
    -v "$(pwd)":/htdocs/lab:ro \
    -p 8080:80 \
    --name graphite \
    netreplica/graphite:latest
  ```

3. To view a specific topology, use the URL in the following format, replacing `TOPOLOGY_TYPE` and `TOPOLOGY_NAME` according to the rules below.

```
http://localhost:8080/graphite/?type=TOPOLOGY_TYPE&topo=TOPOLOGY_NAME
```

## Topology types and names

* `TOPOLOGY_TYPE`: tells where Graphite should look for the topology files
* `TOPOLOGY_NAME`: determines the name of the topology file, depending on the `TOPOLOGY_TYPE`

To find a location of the topology data file in the mounted directory, Graphite understands the following topology types:

* Graphite `graphite`: `TOPOLOGY_NAME.graphite.json` file in the mounted directory
* Containerlab `clab`: `topology-data.json` under `clab-TOPOLOGY_NAME` subfolders in the mounted directory

If you launched Graphite with a directory mounted to visualize multiple data files and open the URL [`http://localhost:8080/graphite/`](http://localhost:8080/graphite/) without parameters, there is no topology shown – since Graphite doesn't know which one would you like to see. You can change that behavior via use of environmental variables:

```Shell
GRAPHITE_DEFAULT_TYPE=graphite # Default topology type
GRAPHITE_DEFAULT_TOPO=wan      # Default topology name
docker run -d -t --rm \
  -v "$(pwd)":/htdocs/lab:ro \
  -e GRAPHITE_DEFAULT_TYPE="${GRAPHITE_DEFAULT_TYPE}" \
  -e GRAPHITE_DEFAULT_TOPO="${GRAPHITE_DEFAULT_TOPO}" \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite:latest
```

## Displaying a working URL
If you're running Graphite on a remote host, or inside a VM, use this helper to show a working URL. In this example we assumed you've mapped Graphite TCP port 80 to host port 8080. Change the port if needed.

  ```Shell
  sudo docker exec -t -e HOST_CONNECTION="${SSH_CONNECTION}" graphite graphite_motd.sh 8080
  ```


## Generating offline graphs - DEPRECATED

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
