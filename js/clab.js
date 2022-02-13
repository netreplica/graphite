/*
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
*/

const interface_full_name_map = {
  'e1-': 'ethernet1-',
  'Eth': 'Ethernet',
  'Fa' : 'FastEthernet',
  'Gi' : 'GigabitEthernet',
  'Te' : 'TenGigabitEthernet',
  'Ma' : 'Management'
};

function if_fullname(ifname) {
  //TODO ifname = dequote(ifname)
  for (k in interface_full_name_map){
    var v = interface_full_name_map[k];
    if (ifname.toLowerCase().startsWith(k.toLowerCase())) {
      return ifname.toLowerCase().replace(k.toLowerCase(), v);
    }
  }
  return ifname;
}

function if_shortname(ifname) {
  //TODO ifname = dequote(ifname)
  for (k in interface_full_name_map){
    var v = interface_full_name_map[k];
    if (ifname.toLowerCase().startsWith(v.toLowerCase())) {
      return ifname.toLowerCase().replace(v.toLowerCase(), k);
    }
  }
  return ifname;
}

// Convert ContainerLab Graph JSON export into CMT JSON topology
function convert_clab_graph_to_cmt(c){
  var cmt = {"nodes": [], "links": []};
  var node_id_map = {};
  for (var i =0; i < c.nodes.length; i++) {
    var n = c.nodes[i];
    var primaryIP;
    var icon = "router";
    var level;
    node_id_map[n.name] = i;
    if (n.hasOwnProperty("ipv4_address")) {
      primaryIP = n.ipv4_address;
    }
    if (n.hasOwnProperty("labels")) {
      if (n.labels.hasOwnProperty("graph-icon")) {
        icon = n.labels["graph-icon"];
      }
      if (n.labels.hasOwnProperty("graph-level")) {
        level = n.labels["graph-level"];
      }
    }
    cmt.nodes.push({
      "id": i,
      "name": n.name,
      "model": n.kind,
      "primaryIP": primaryIP,
      "icon": icon,
      "layerSortPreference": level,
    })
  }
  for (var i =0; i < c.links.length; i++) {
    var l = c.links[i];
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
  return cmt;
}

// Replace interface names with IP addresses in CMT JSON topology
function replace_ifname_with_ipaddr_in_cmt(cmtin, device, ifname, ipaddr){
  var cmt = {"nodes": [], "links": []};
  for (n of cmtin.nodes) {
    cmt.nodes.push(n);
  }
  for (l of cmtin.links) {
    if (device.endsWith(l.srcDevice) && if_shortname(l.srcIfName).toLowerCase() == if_shortname(ifname).toLowerCase()) {
      l.srcIfName = ipaddr;
    } else if (device.endsWith(l.tgtDevice) && if_shortname(l.tgtIfName).toLowerCase() == if_shortname(ifname).toLowerCase()) {
      l.tgtIfName = ipaddr;
    }
    cmt.links.push(l);
  }
  return cmt;
}