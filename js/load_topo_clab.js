// Convert ContainerLab Graph JSON export into CMT JSON topology
function generate_cmt_from_clab_graph_json(c){
  var cmt = {"nodes": [], "links": []}
  var node_id_map = {}
  for (var i =0; i < c.nodes.length; i++) {
    var n = c.nodes[i]
    var icon = "router"
    var level
    node_id_map[n.name] = i
    if (n.hasOwnProperty("labels")) {
      if (n.labels.hasOwnProperty("graph-icon")) {
        icon = n.labels["graph-icon"]
      }
      if (n.labels.hasOwnProperty("graph-level")) {
        level = n.labels["graph-level"]
      }
    }
    cmt.nodes.push({
      "id": i,
      "name": n.name,
      "primaryIP": n.ipv4_address,
      "model": n.kind,
      "icon": icon,
      "layerSortPreference": level,
    })
  }
  for (var i =0; i < c.links.length; i++) {
    var l = c.links[i]
    cmt.links.push({
      "id": i,
      "source": node_id_map[l["source"]],
      "target": node_id_map[l["target"]],
      "srcIfName": l["source_endpoint"],
      "srcDevice": l["source"],
      "tgtIfName": l["target_endpoint"],
      "tgtDevice": l["target"],
    })
  }
  return cmt
}
