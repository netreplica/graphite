# Labels

When you click on a node in the topology diagram, a view pops up with node details:

![Node details](../images/labels.clab.png)

The table belows shows where the values of each field in the popup come from, depending on the type of the topology.

| Label     | NetBox              | Containerlab        | Live Data
| -----     | ------------------- | ------------------- | --------
| Name      | `nodes: {name}`     | `nodes: {name}`     | N/A
| Full name | N/A                 | `longname`          | Ansible inventory
| Hostname  | N/A                 | N/A                 | `hostname`
| Kind      | N/A                 | `kind`              | N/A
| Image     | N/A                 | `image`             | N/A
| Group     | `labels: group`     | `labels: group`     | N/A
| Role      | `labels: role`      | `labels: role`      | N/A
| Vendor    | `labels: vendor`    | `labels: vendor`    | N/A
| Model     | `labels: model`     | `labels: model`     | N/A
| Platform  | `labels: platform`  | `labels: platform`  | `vendor model`
| Version   | N/A                 | N/A                 | `os_version`
| IPv4      | `mgmt-ipv4-address` | `mgmt-ipv4-address` | N/A
| IPv6      | `mgmt-ipv4-address` | `mgmt-ipv6-address` | N/A