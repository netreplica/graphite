# Running Graphite as a Docker container

## Pre-requisites

1. Docker
2. Containerlab topology definition files as a source for visualization

## Running

1. In shell terminal, navigate to a directory with Containerlab topology definition files you'd like to visualize.

2. Launch Graphite as a Docker container

```Shell
CLABDIR=`pwd`
docker run -d -t \
  -v "${CLABDIR}":/var/www/localhost/htdocs/clab \
  -p 8080:80 \
  --name graphite \
  netreplica/graphite
````

3. If you never exported Containerlab topology graphs in JSON, you can do that for all topologies in the folder at once with the following command:

```Shell
docker exec -t graphite generate_all_offline_graphs.sh
````

  Alternatively, to export graph data for a speficic topology, use
  
```Shell
docker exec -t graphite generate_offline_graph.sh <topology_name>.yaml
````

4. At this point you should be able to view Containerlab topologies in Graphite via the following URL: [`http://localhost:8080/graphite/main.html?type=clab&topo=<topology_name>`](http://localhost:8080/graphite/main.html?type=clab&topo=<topology_name>). Make sure to replace <topology_name> with a your topology name, and `localhost` with appropriate IP or FQDN in case you are not running the browser on the same host as Graphite container.

## Lanching Graphite as part of CONTAINERlab deployment

1. You can also launch Graphite automatically whenever you deploy a topology with `clab deploy` command. Here is an example of how to create a topology file with Graphite node as part of it. Note, with this method the visualization won't be available after you destroy the topology.

  ```Shell
  mkdir -p $HOME/netreplica/clab
  cd $HOME/netreplica/clab
  CLAB_TOPO="clos-2tier"
  clab generate --name ${CLAB_TOPO} --nodes 2,1 > ${CLAB_TOPO}.yaml

  vi ${CLAB_TOPO}.yaml
  # +++
    graphite:
      kind: linux
      image: netreplica/graphite
      env:
        GRAPHITE_DEFAULT_TYPE: clab
        GRAPHITE_DEFAULT_TOPO: clos-2tier
      binds:
        - .:/var/www/localhost/htdocs/clab
      ports:
        - 8080:80
  # ---

2. Deploy the topolology and generate the graph.

  ```Shell
  sudo clab deploy -t ${CLAB_TOPO}.yaml
  docker exec -t clab-${CLAB_TOPO}-graphite generate_offline_graph.sh ${CLAB_TOPO}.yaml
  ````

3. Now you can open the visualization via URL: [`http://localhost:8080/graphite/main.html`](http://localhost:8080/graphite/main.html). If you are using this method, there is no need to specify any parameters with topology name in the URL. You might need to replace `localhost` with proper FQDN or IP address.

## Docker Image Build Instructions

Follow this guide [DOCKER-BUILD.md](DOCKER-BUILD.md)
