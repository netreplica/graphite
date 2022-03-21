# Running Graphite as a Docker container

## Pre-requisites

1. Docker
2. Containerlab topology definition files as a source for visualization

## Running

1. In a shell terminal, navigate to a directory with Containerlab topology definition files you'd like to visualize.

2. Launch Graphite as a Docker container

```Shell
CLABDIR=`pwd`
docker run -d \
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

4. At this point you should be able to view Containerlab topologies in Graphite via the following URL: [`http://localhost:8080/graphite/index.html?type=clab&topo=<topology_name>`](http://localhost:8080/graphite/index.html?type=clab&topo=<topology_name>). Make sure to replace <topology_name> with a your topology name, and `localhost` with appropriate IP or FQDN in case you are not running the browser on the same host as Graphite container.

## Lanching Graphite as part of CONTAINERlab deployment

You can also launch Graphite automatically whenever you deploy a topology with `clab deploy` command. Here is an example of how to create a topology file with Graphite node as part of it. With this method the visualization is avaliable only while the topology is running.

1. First, let's create a topology file. If you have one already, you can use it instead.

```Shell
mkdir -p $HOME/netreplica/clab
cd $HOME/netreplica/clab
CLAB_TOPO="clos-2tier"
clab generate --name ${CLAB_TOPO} --nodes 2,1 > ${CLAB_TOPO}.yaml
````
  
2. Open the topology file in text editor (`vi ${CLAB_TOPO}.yaml`), and insert the following snippet right before the line `links:`. Make sure to replace the name of the topology in `GRAPHITE_DEFAULT_TOPO` variable to the topology name you are using.

```Yaml
    graphite:
      kind: linux
      image: netreplica/graphite
      env:
        GRAPHITE_DEFAULT_TYPE: clab
        GRAPHITE_DEFAULT_TOPO: clos-2tier
        CLAB_SSH_CONNECTION: ${SSH_CONNECTION}
      binds:
        - .:/var/www/localhost/htdocs/clab
      ports:
        - 8080:80
      exec:
        - sh -c 'generate_offline_graph.sh'
        - sh -c 'graphite_motd.sh 8080'
      labels:
        graph-hide: yes
````

3. Deploy the topolology. NOTE: `sudo -E` helps Graphite receive `SSH_CONNECTION` env variable to display working URL for you to connect to.

```Shell
sudo -E clab deploy -t ${CLAB_TOPO}.yaml
````

4. Look for `Graphite visualization URL: http://<ip_address>:8080/graphite` output as Containerlab deploys the topology. If you are running Containerlab on a VM via an SSH session, the `<ip_address>` in the URL should be the one reachable by a browser on you computer. If not, you might need to replace `<ip_address>` with proper one to connect to Graphite.

## Docker Image Build Instructions

Follow this guide [DOCKER-BUILD.md](DOCKER-BUILD.md)
