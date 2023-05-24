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
    sudo docker run -d -t --rm \
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
  sudo docker run -d -t --rm \
    -v "$(pwd)":/htdocs/lab:ro \
    -p 8080:80 \
    --name graphite \
    netreplica/graphite:latest
  ```

3. To view a specific topology, use the URL in the following format, replacing `topology_type` and `topology_name` according to the rules below.

```
http://localhost:8080/graphite/?type=topology_type&topo=topology_name
```

## Topology types and names

* `topology_type`: tells where Graphite should look for the topology files
* `topology_name`: determines name of the topology file, depending on the `topology_type`

To find a location of the topology data file in the mounted directory, Graphite understands the following topology types:

* Graphite `graphite`: `TOPOLOGY_NAME.graphite.json` file in the mounted directory
* Containerlab `clabdata`: `topology-data.json` under `clab-TOPOLOGY_NAME` subfolders in the mounted directory

## Environmental variables

You can use the following environmental variables with Graphite docker container:

```Shell
GRAPHITE_DEFAULT_TYPE # Default type of topology data to visualize.
GRAPHITE_DEFAULT_TOPO # Default topology to visualize when no specific topology is provided via the URL.
HOST_CONNECTION       # Pass value of env:SSH_CONNECTION from the host, and run graphite_motd.sh script
                      # to see an URL you can open from your computer to connect to Graphite.
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
