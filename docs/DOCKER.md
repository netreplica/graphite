# Running Graphite as a Docker container

## Pre-requisites

1. Docker
2. Topology data file(s) as a source for visualization, in one of supported formats

## Running in basic mode

In this mode you'll manually upload topology data file(s) for visualization via the browser.

1. Launch Graphite as a Docker container:

    ```Shell
    docker run -d -t --rm \
        -p 8080:80 \
        --name graphite \
        netreplica/graphite:latest
    ```

2. Open Graphite web page on [`http://localhost:8080/graphite/`](http://localhost:8080/graphite/) and upload a topology data file in one of the supported formats.

3. When finished, stop the container:

    ```Shell
    docker stop graphite
    ```

## Graphite URL helper

If you're running Graphite on a remote host, or inside a VM, use this helper to show an URL with a proper IP address instead of `localhost`. In this example we assumed you've mapped Graphite TCP port 80 to host port 8080. Change the port if needed.

  ```Shell
  docker exec -t -e HOST_CONNECTION="${SSH_CONNECTION}" graphite graphite_motd.sh 8080
  ```

## Running with a single data file to visualize

It is possible to provide a default topology data file for visualization as a startup parameter for the container. This way, anyone who connects to the Graphite web page will see the default topology.

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

## Selecting topology via Graphite URL

Graphite is capable of opening topology data files from the filesystem of a host where it is running based on parameters provided via the URL.

1. In a shell terminal, navigate to a directory with data files for visualization.

2. Launch Graphite as a Docker container with the current directory mounted as `/htdocs/lab`:

  ```Shell
  docker run -d -t --rm \
    -v "$(pwd)":/htdocs/lab:ro \
    -p 8080:80 \
    --name graphite \
    netreplica/graphite:latest
  ```

3. To view a specific topology, use an URL in the following format, replacing `TOPOLOGY_TYPE` and `TOPOLOGY_NAME` according to the rules below.

```
http://localhost:8080/graphite/?type=TOPOLOGY_TYPE&topo=TOPOLOGY_NAME
```

## Topology types and names

* `TOPOLOGY_TYPE`: tells where Graphite should look for the topology files
* `TOPOLOGY_NAME`: determines the name of the topology file, depending on the `TOPOLOGY_TYPE`

To find a location of the topology data file in the mounted directory, Graphite understands the following topology types:

* Graphite `graphite`: `TOPOLOGY_NAME.graphite.json` file in the mounted directory
* Containerlab `clab`: `topology-data.json` under `clab-TOPOLOGY_NAME` subfolders in the mounted directory
* No type: `TOPOLOGY_NAME` file in the mounted directory

## Default topology type and name

If you launched Graphite with a directory mounted to visualize multiple data files and open the URL [`http://localhost:8080/graphite/`](http://localhost:8080/graphite/) without parameters, there is no topology shown – since Graphite doesn't know which one would you like to see. You can change that behavior via the use of environmental variables:

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
