# Labels

| Label     | NetBox                | Containerlab         | Live
| -----     | --------------------- | -------------------- | ----
| Name      | `nodes['name']`     1 | `nodes['name']`    1 |
| Full name | N/A                   | `longname`         1 |
| Hostname  | N/A                   | N/A                  | 1 `hostname`     1
| Kind      | N/A                   | `kind`             1 |
| Image     | N/A                   | `image`            1 |
| Group     | `labels: group`    1  | `labels: group`    1 | N/A
| Role      | `labels: role`     1  | `labels: role`     1 | N/A
| Vendor    | `labels: vendor`   1  | `labels: vendor`   1 | N/A
| Model     | `labels: model`    1  | `labels: model`    1 | N/A
| Platform  | `labels: platform` 1  | `labels: platform` 1 | 1 `vendor model`
| Version   | N/A                   | N/A                  | 1 `os_version`
| IPv4      | `mgmt-ipv4-address`   | `mgmt-ipv4-address`  |
| IPv6      | `mgmt-ipv4-address`   | `mgmt-ipv6-address`  |