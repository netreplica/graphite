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

function port_mode_node_name(n, i) {
  return i + "@" + n;
}

// Evaluate object's values for possible representation of boolean TRUE
function equals_true(obj) {
  switch (typeof obj) {
  case 'string':
    switch (obj.toLowerCase()) {
    case 'yes':
    case 'y':
    case 'true':
      return true;
    default:
      return false;
    }
    break;
  case 'boolean':
    return obj;
    break;
  default:
    return false;
  }
}

function getWebsshDeviceLink(n, a, i) {
  if (a != "") {
    var w = 800;
    var h = 600;
    var offset = i * 25;
    var l_off = (window.screenX + window.outerWidth) - w / 2 + offset;
    var t_off = window.screenY + offset;
    return `window.open('/ssh/host/${a}?header=${n}&headerBackground=blue', 'webssh.${n}','width=${w},height=${h},left=${l_off},top=${t_off}'); return false;`;
  } else {
    return "";
  }
}

// Convert ContainerLab topology into CMT JSON topology
function convert_clab_to_cmt(c){
  if (c.hasOwnProperty("type") && c.type == "clab") {
    return convert_clab_topology_data_to_cmt(c);
  } else {
    return convert_clab_graph_to_cmt(c);
  }
}

// Convert ContainerLab topology-data.json export into CMT JSON topology
function convert_clab_topology_data_to_cmt(c){
  var cmt = {"nodes": [], "links": [], "type": "clab", "name": ""};
  var node_id_map = {};

  // topology name
  if (c.hasOwnProperty("name")) {
    cmt.name = c.name;
  }

  if (!c.hasOwnProperty("nodes")) {
    return cmt;
  }

  var i = -1; // We will increment the index to 0 right away in the cycle below
  for (var node in c.nodes) { // node is a string with a node name
    i++;
    var n = c.nodes[node]; // retrieve the full object

    var cmt_node = {
  //  "id": int,
  //  "name": string,
  //  "fullname": string,
  //  "websshDeviceLink": string,
  //  "websshDeviceLinkIPv6": string,
  //  "kind": string,
  //  "image": string,
  //  "group": string,
  //  "mgmtIPv4": string,
  //  "mgmtIPv4PrefixMask": string,
  //  "mgmtIPv6": string,
  //  "mgmtIPv6PrefixMask": string,
  //  "icon": string,
  //  "layerSortPreference": int,
    };

    cmt_node["id"] = i;
    cmt_node["name"] = node;
    cmt_node["icon"] = "router";

    if (n.hasOwnProperty("labels")) {
      if (n.labels.hasOwnProperty("graph-hide") && equals_true(n.labels["graph-hide"])) {
        continue; // do not visualize this node
      }
      if (n.labels.hasOwnProperty("graph-icon")) {
        cmt_node["icon"] = n.labels["graph-icon"];
      }
      if (n.labels.hasOwnProperty("graph-level")) {
        cmt_node["layerSortPreference"] = n.labels["graph-level"];
      }
    }

    cmt_node["fullname"] = n.longname;
    cmt_node["kind"]     = n.kind;
    cmt_node["image"]    = n.image;
    cmt_node["group"]    = n.group;

    if (n.hasOwnProperty("mgmt-ipv4-address")) {
      cmt_node["mgmtIPv4"] = n["mgmt-ipv4-address"];
      cmt_node["websshDeviceLink"] = getWebsshDeviceLink(node, cmt_node["mgmtIPv4"], i);
      if (cmt_node["mgmtIPv4"] != "" && n["mgmt-ipv4-prefix-length"] > 0) {
        cmt_node["mgmtIPv4PrefixMask"] = "/" + n["mgmt-ipv4-prefix-length"].toString();
      }
    }

    if (n.hasOwnProperty("mgmt-ipv6-address")) {
      cmt_node["mgmtIPv6"] = n["mgmt-ipv6-address"];
      cmt_node["websshDeviceLinkIPv6"] = getWebsshDeviceLink(node, cmt_node["mgmtIPv6"], i);
      if (cmt_node["mgmtIPv6"] != "" && n["mgmt-ipv6-prefix-length"] > 0) {
        cmt_node["mgmtIPv6PrefixMask"] = "/" + n["mgmt-ipv6-prefix-length"].toString();
      }
    }

    // This must be the last section, any other cmt_node properties should be set above
    if (n.hasOwnProperty("labels") && n.labels.hasOwnProperty("graph-mode") && n.labels["graph-mode"] == "port") {
      // display each port of this node as it's own individual node
      for (var l of c.links) {
        // TODO handle when the same interface is encountered more than once
        if (l["a"]["node"] == node) {
          var cmt_node_l = structuredClone(cmt_node); // copy for further modifications
          i++;
          cmt_node_l["id"] = i;
          cmt_node_l["name"] = port_mode_node_name(node, l["a"]["interface"]);
          cmt.nodes.push(cmt_node_l);
          node_id_map[cmt_node_l.name] = cmt_node_l["id"];
        } else if (l["z"]["node"] == node) { // TODO back-2-back case
          var cmt_node_l = structuredClone(cmt_node); // copy for further modifications
          i++;
          cmt_node_l["id"] = i;
          cmt_node_l["name"] = port_mode_node_name(node, l["z"]["interface"]);
          cmt.nodes.push(cmt_node_l);
          node_id_map[cmt_node_l.name] = cmt_node_l["id"];
        }
      }
    } else {
      node_id_map[cmt_node.name] = cmt_node["id"];
      cmt.nodes.push(cmt_node);
    }
  }

  for (var i =0; i < c.links.length; i++) {
    var l = c.links[i];
    var src_i = node_id_map[l["a"]["node"]];
    var tgt_i = node_id_map[l["z"]["node"]];
    var src_d_name = l["a"]["node"];
    var tgt_d_name = l["z"]["node"];
    var src_i_name = l["a"]["interface"];
    var tgt_i_name = l["z"]["interface"];
    var src_i_mac  = l["a"]["mac"];
    var tgt_i_mac  = l["z"]["mac"];
    // for port mode display, do not show interface name as a label
    if (node_id_map.hasOwnProperty(port_mode_node_name(l["a"]["node"], l["a"]["interface"]))) {
      src_i = node_id_map[port_mode_node_name(l["a"]["node"], l["a"]["interface"])];
      src_i_name = "";
      src_d_name = port_mode_node_name(l["a"]["node"], l["a"]["interface"]);
    }
    if (node_id_map.hasOwnProperty(port_mode_node_name(l["z"]["node"], l["z"]["interface"]))) {
      tgt_i = node_id_map[port_mode_node_name(l["z"]["node"], l["z"]["interface"])];
      tgt_i_name = "";
      tgt_d_name = port_mode_node_name(l["z"]["node"], l["z"]["interface"]);
    }
    cmt.links.push({
      "id": i,
      "source": src_i,
      "target": tgt_i,
      "srcIfName": src_i_name,
      "srcIfMAC":  src_i_mac,
      "srcDevice": src_d_name,
      "tgtIfName": tgt_i_name,
      "tgtIfMAC":  tgt_i_mac,
      "tgtDevice": tgt_d_name,
    })
  }
  return cmt;
}

// Convert ContainerLab Graph JSON export into CMT JSON topology
function convert_clab_graph_to_cmt(c){
  var cmt = {"nodes": [], "links": [], "type": "clab", "name": ""};
  var node_id_map = {};
  for (var i =0; i < c.nodes.length; i++) {
    var n = c.nodes[i];
    var mgmtIPv4;
    var mgmtIPv6;
    var websshDeviceLink;
    var websshDeviceLinkIPv6;
    var icon = "router";
    var level;
    if (n.hasOwnProperty("ipv4_address")) {
      mgmtIPv4 = n.ipv4_address;
      websshDeviceLink = getWebsshDeviceLink(n.name, mgmtIPv4, i);
    }
    if (n.hasOwnProperty("ipv6_address")) {
      mgmtIPv6 = n.ipv6_address;
      websshDeviceLinkIPv6 = getWebsshDeviceLink(n.name, mgmtIPv6, i);
    }
    if (n.hasOwnProperty("labels")) {
      if (n.labels.hasOwnProperty("graph-hide") && equals_true(n.labels["graph-hide"])) {
        continue;
      }
      if (n.labels.hasOwnProperty("graph-icon")) {
        icon = n.labels["graph-icon"];
      }
      if (n.labels.hasOwnProperty("graph-level")) {
        level = n.labels["graph-level"];
      }
    }
    node_id_map[n.name] = i;
    cmt.nodes.push({
      "id": i,
      "name": n.name,
      "websshDeviceLink": websshDeviceLink,
      "websshDeviceLinkIPv6": websshDeviceLinkIPv6,
      "kind": n.kind,
      "image": n.image,
      "group": n.group,
      "mgmtIPv4": mgmtIPv4,
      "mgmtIPv6": mgmtIPv6,
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