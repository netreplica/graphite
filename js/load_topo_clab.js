// Temp initialize clab topology statically
var clab_graph_json = {
  "nodes": [
    {
      "name": "host1",
      "kind": "linux",
      "group": "hosts",
      "state": "running/Up 2 hours",
      "ipv4_address": "172.20.20.3/24",
      "ipv6_address": "2001:172:20:20::3/64"
    },
    {
      "name": "host2",
      "kind": "linux",
      "group": "hosts",
      "state": "running/Up 2 hours",
      "ipv4_address": "172.20.20.5/24",
      "ipv6_address": "2001:172:20:20::5/64"
    },
    {
      "name": "leaf1",
      "kind": "ceos",
      "group": "tier-0",
      "state": "running/Up 2 hours",
      "ipv4_address": "172.20.20.2/24",
      "ipv6_address": "2001:172:20:20::2/64",
      "labels": {
        "graph-icon": "switch",
        "graph-something": "whatever"
      }
    },
    {
      "name": "leaf2",
      "kind": "ceos",
      "group": "tier-0",
      "state": "running/Up 2 hours",
      "ipv4_address": "172.20.20.6/24",
      "ipv6_address": "2001:172:20:20::6/64",
      "labels": {
        "graph-icon": "switch"
      }
    },
    {
      "name": "spine",
      "kind": "ceos",
      "group": "tier-1",
      "state": "running/Up 2 hours",
      "ipv4_address": "172.20.20.4/24",
      "ipv6_address": "2001:172:20:20::4/64",
      "labels": {
        "graph-icon": "router"
      }
    }
  ],
  "links": [
    {
      "source": "leaf1",
      "source_endpoint": "eth1",
      "target": "spine",
      "target_endpoint": "eth1"
    },
    {
      "source": "leaf2",
      "source_endpoint": "eth1",
      "target": "spine",
      "target_endpoint": "eth2"
    },
    {
      "source": "host1",
      "source_endpoint": "eth1",
      "target": "leaf1",
      "target_endpoint": "eth2"
    },
    {
      "source": "host2",
      "source_endpoint": "eth1",
      "target": "leaf2",
      "target_endpoint": "eth2"
    }
  ]
}

// Convert ContainerLab Graph JSON export into CMT JSON topology
function generate_cmt_from_clab_graph_json(c){
  var cmt = {"nodes": [], "links": []}
  var node_id_map = {}
  for (var i =0; i < c.nodes.length; i++) {
    var n = c.nodes[i]
    node_id_map[n.name] = i
    cmt.nodes.push({
        "id": i,
        "name": n.name,
        "icon": "router",
    })
  }
  return cmt
}

var topologyData = generate_cmt_from_clab_graph_json(clab_graph_json)