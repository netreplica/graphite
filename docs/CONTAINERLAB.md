# Visualizing Containelab topologies

## Adding Graphite to a topology definition file


1. Create a topology definition file for ContainerLab. You could start with one of the examples [published](https://containerlab.dev/lab-examples/lab-examples/) on ContainerLab website, or use your own topology. Here, we will use ContainerLab capability to generate Clos topologies.

    ```Shell
    CLAB_TOPO="clos-3tier"
    clab generate --name ${CLAB_TOPO} --nodes 4,2,1 > ${CLAB_TOPO}.yaml
    ```

    For this topology to be valid, we also we need to provide an image to use for all the nodes. Add the following lines to the topology YAML file right after `topology`:

    ```Yaml
      kinds:
        srl:
          image: ghcr.io/nokia/srlinux
    ```

    Alternatively, if you have an existing topology in a yaml file, you can skip this step and make a note of the caveats in the next step.

2. Now that you have a topology file, let's add `graphite` node to the file by adding the following lines under the `nodes:` section.  For a full topology example see [examples/2host.yaml](../examples/2host.yaml).

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

3. Once added, deploy the topology. Note `-E` parameter for `sudo` – it is needed to pass `SSH_CONNECTION` variable.

    ```Shell
    sudo -E containerlab deploy -t ${CLAB_TOPO}.yaml
    ```

    Look for `Graphite visualization 🎨 http://<ip_address>:8080/graphite` Containerlab output. If you are running Containerlab on a VM via an SSH session, the `<ip_address>` in the URL should be the one you are using to connect to the VM, so there is a good chance the link will just work. If not, you might need to replace `<ip_address>` with proper address to connect to Graphite.

    Here is an example of what you could see (rendering is unique with every page refresh):

    ![clos-3tier Graphite Topology Visualization](../images/clos-3tier.clab.png)

## Improve visualization via custom labels in a ContainerLab YAML file

The visualization we got on the previous step lacks hierarchy. Let's fix that by assigning nodes in the ContainerLab topology YAML file to different levels, using custom labels that Graphite understands. Read [LABELS.md](LABELS.md) for a full list of labels supported by Graphite.

1. Open the topology YAML file in the text editor and append the following lines to each `node1-*` definition.

    ```Yaml
          labels:
            graph-level: 3
    ```

    For example, `node1-1` definition should now look the following way:

    ```Yaml
    topology:
      nodes:
        node1-1:
          kind: srl
          group: tier-1
          type: ixrd2
          labels:
            graph-level: 3
    ```

2. Now assign `graph-level: 2` to every `node2-*` definition.

    ```Yaml
          labels:
            graph-level: 2
    ```

3. And, finally, assign `graph-level: 1` to every `node3-*` definition.

    ```Yaml
          labels:
            graph-level: 1
    ```

4. Redeploy the topology

    ```Shell
    sudo -E containerlab deploy -t ${CLAB_TOPO}.yaml --reconfigure
    ```

5. Now refresh the web page in the browser, and click "Horizontal Layout". You should see a topology arranged in 3 Clos tiers. `node3-1` is on the top since it has `graph-level` value of 1.

![clos-3tier Graphite Topology Visualization arranged in tiers](../images/clos-3tier.clab.levels.png)

## Changing visualization icons

All the nodes in our visualization so far represented by the same "router" icon. Let's assume that nodes at tier-1 in our Clos topology can act as L2 switches, and we want to reflect that in the visualization. To achieve that, we can use custom label again, with a name `graph-icon`.  See possible `graph-icon` values [here](LABELS.md#node-icons).


1. Open the topology YAML file in the text editor and append the following line to each `node1-*` definition.

    ```Yaml
            graph-icon: switch
    ```

    For example, `node1-1` definition should now look the following way:

    ```Yaml
    topology:
      nodes:
        node1-1:
          kind: srl
          group: tier-1
          type: ixrd2
          labels:
            graph-level: 3
            graph-icon: switch
    ```

4. Redeploy the topology

    ```Shell
    sudo -E containerlab deploy -t ${CLAB_TOPO}.yaml --reconfigure
    ```

3. Now refresh the web page in the browser, and click "Horizontal Layout". Now the bottom row of nodes uses "switch" icons.

    ![clos-3tier Graphite Topology Visualization with switch icons](../images/clos-3tier.clab.icons.png)
