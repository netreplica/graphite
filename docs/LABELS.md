# Labels

| Label     | NetBox               | Containerlab        | Live
| -----     | -------------------- | ------------------- | ----
| Name      | `nodes['name']`      | `nodes['name']`     |
| Full name | N/A                  | `longname`          |
| Hostname  | N/A                  | N/A                 | `hostname`
| Kind      | N/A                  | `kind`              |
| Image     | N/A                  | `image`             |
| Group     | `labels: group`      | `labels: group`     | N/A
| Role      | `labels: role`       | `labels: role`      | N/A
| Vendor    | `labels: vendor`     | `labels: vendor`    | `vendor`
| Model     | `labels: model`      | `labels: model`     | can we pull h/w model?
| Platform  | `labels: platform`   | `labels: platform`  | `model` ???
| Version   | N/A                  | N/A                 | `os_version`
| IPv4      | `mgmt-ipv4-address`  | `mgmt-ipv4-address` |
| IPv6      | `mgmt-ipv4-address`  | `mgmt-ipv6-address` |