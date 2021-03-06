<p align=center><img src=https://github.com/netreplica/graphite/blob/bd4cdec84048b6c4762a929ec37b7a21841c453d/images/netreplica.png  width="500px"/></p>

---
# Netreplica Graphite
Network Visualization for Emulated Topologies

## Supported software

### CONTAINERlab

[Containerlab](https://containerlab.dev/) is an open-source network emulation software that provides a CLI for orchestrating and managing container-based networking labs. It starts the containers, builds a virtual wiring between them to create lab topologies of users choice and manages labs lifecycle.

Graphite support for Containerlab includes:

* Visualization of live topologies, including dynamic information about network nodes – for example, management IP addresses.
* Offline visualization of static topology YAML files.
* WebSSH access to running Containerlab nodes from the topology visualization.
* Launching Graphite as part of Containerlab topology by including it as a node in the topology YAML file.

The easiest way to use Graphite with Containerlab is to add the following code to a topology YAML file under the `nodes:` section. For a full topology example see [examples/2host.yaml](examples/2host.yaml).

```Yaml
    graphite:
      kind: linux
      image: netreplica/graphite
      env:
        CLAB_SSH_CONNECTION: ${SSH_CONNECTION}
      binds:
        - __clabDir__/topology-data.json:/htdocs/default/default.json:ro
      ports:
        - 8080:80
      exec:
        - sh -c 'graphite_motd.sh 8080'
      labels:
        graph-hide: yes
````

Once added, deploy the topology with `sudo -E containerlab deploy -t <topology.yaml>`. Note `-E` parameter for `sudo` – it is needed to pass `SSH_CONNECTION` variable.

Look for `Graphite visualization 🎨 http://<ip_address>:8080/graphite` Containerlab output. If you are running Containerlab on a VM via an SSH session, the `<ip_address>` in the URL should be the one you are using to connect to the VM, so there is a good chance the link will just work. If not, you might need to replace `<ip_address>` with proper address to connect to Graphite.

![Graphite visualization 🎨 link](images/clab-deploy-graphite-url-2host.png)

## Running Graphite as a standalone Docker container

To be able to visualize multiple Containerlab topologies, including those that are not currently running, you can launch Graphite as a standalone container. Follow [the guide](docs/DOCKER.md) to learn how.

## Detailed instructions on installing and using Graphite from source code.

Follow [step-by-step reference](docs/CONTAINERLAB.md) to learn how to use Graphite with ContainerLab from source code.

## NANOG-84 Hackathon

Graphite was conceived as part of [NANOG-84 Hackathon](https://www.nanog.org/events/nanog-84-hackathon/). Here is an original idea:

![NANOG-84 Hackathon Idea](images/clab-graphite.png)

## Copyright notice

Copyright 2022 Netreplica Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
