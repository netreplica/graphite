[![Discord](https://img.shields.io/discord/1075106069862416525?label=discord)](https://discord.gg/M2SkgSdKht)

---
# Netreplica Graphite
Visualization for Network Topologies

## Supported software

### NetBox

Support for [NetBox](https://netbox.dev/) DCIM system includes:

* Visualization of network topologies exported by [netreplica/nrx](https://github.com/netreplica/nrx) command-line tool
* Does not require installation of a plugin on a NexBox instance
* Filtering based on Device `role`, `site` and/or `tag` information to select devices for visualization
* User-customizable topology data definitions via Jinja2 [templates](https://github.com/netreplica/templates/tree/main/graphite)

To export a topology for visualization from NetBox run `nrx` with the following parameters. See more in `nrx` [documentation](https://github.com/netreplica/nrx/tree/main#topology-visualization-with-graphite).

```Shell
nrx.py --config netbox.conf --input netbox --output graphite --site SITE --tag TAG
```

Once the data is exported, run Graphite using of the methods [described here](docs/DOCKER.md) to see the topology via a browser.

### Containerlab

Support for [Containerlab](https://containerlab.dev/) network emulation software includes:

* Visualization of live topologies, including dynamic information about network nodes – for example, management IP addresses.
* WebSSH access to running Containerlab nodes from the topology visualization.
* Launching Graphite as part of Containerlab topology by including it as a node in the topology YAML file.

The easiest way to use Graphite with Containerlab is to add the following code to a topology YAML file under the `nodes:` section. For a full topology example see [examples/2host.yaml](examples/2host.yaml).

```Yaml
    graphite:
      kind: linux
      image: netreplica/graphite
      env:
        HOST_CONNECTION: ${SSH_CONNECTION}
      binds:
        - __clabDir__/topology-data.json:/htdocs/default/default.json:ro
        - __clabDir__/ansible-inventory.yml:/htdocs/lab/default/ansible-inventory.yml:ro
      ports:
        - 8080:80
      exec:
        - sh -c 'graphite_motd.sh 8080'
      labels:
        graph-hide: yes
```

Once added, deploy the topology with `sudo -E containerlab deploy -t <topology.yaml>`. Note `-E` parameter for `sudo` – it is needed to pass `SSH_CONNECTION` variable.

Look for `Graphite visualization 🎨 http://<ip_address>:8080/graphite` Containerlab output. If you are running Containerlab on a VM via an SSH session, the `<ip_address>` in the URL should be the one you are using to connect to the VM, so there is a good chance the link will just work. If not, you might need to replace `<ip_address>` with proper address to connect to Graphite.

![Graphite visualization 🎨 link](images/clab-deploy-graphite-url-2host.png)

## Detailed instructions on using Graphite with Containerlab

Follow [step-by-step reference](docs/CONTAINERLAB.md) to learn how to use Graphite with ContainerLab.

## Running Graphite as a standalone Docker container

To be able to visualize multiple Containerlab topologies, including those that are not currently running, you can launch Graphite as a standalone container. Follow [the guide](docs/DOCKER.md) to learn how.

## Copyright notice

Copyright 2022-2023 Netreplica Team

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
