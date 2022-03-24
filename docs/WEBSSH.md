# Connecting to devices in the topology through WebSSH

## Pre-release information

WebSSH capability is a new feature that is not yet included in the main Graphite build. The easiest way to use WebSSH is by running Graphite as a docker container. Please see [DOCKER.md](docs/DOCKER.md) for instructions. Note the container image to use is `netreplica/graphite:webssh2`.

## Limitations

### Only statically defined IP addresses are supported by Graphite docker image natively

Currently, Graphite relies on a custom build of CONTAINERlab binary to export topology data for visualization. This custom build is packaged inside the Graphite Docker image, and can natively generate topology data in so called ["offline" mode](https://containerlab.dev/cmd/graph/#online-vs-offline-graphing). Unless CONTAINERlab topology YAML file has statically defined management IP addresses of all the nodes, the offline graph generation mode can not provide IP addresses to WebSSH module to access.

WORKAROUND 1. Define management IP addresses statically in your topology YAML file. Here is an example, or a complete [`2host.yaml`](/examples/2host.yaml) file:

```Yaml
name: 2host

mgmt:
  network: mgmt
  ipv4_subnet: 172.22.0.0/24

topology:
  kinds:
    linux:
      image: netreplica/ubuntu-host:1.1
  nodes:
    host1:
      kind: linux
      mgmt_ipv4: 172.22.0.6
    host2:
      kind: linux
      mgmt_ipv4: 172.22.0.7
````

WORKAROUND 2. Use custom build of CONTAINERlab to export full topology data with dynamically assigned management IP addresses, see [CONTAINERLAB.md](/docs/CONTAINERLAB.md#pre-requisites), sections 2 and 3. Once you have the custom `clabg` binary, use it to export topology data:

```Shell
clabg graph --json --topo ${CLAB_TOPO}.yaml
````
