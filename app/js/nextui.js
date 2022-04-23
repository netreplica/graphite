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

(function (nx) {
    /**
     * NeXt UI base application
     * Source: https://raw.githubusercontent.com/netreplica/devnet_marathon_endgame/master/next_app.js
     */
    // Initialize topology
    var topo = new nx.graphic.Topology({
        // View dimensions
        width: 1138,
        height: 700,
        // Dataprocessor is responsible for spreading 
        // the Nodes across the view.
        // 'force' dataprocessor spreads the Nodes so
        // they would be as distant from each other
        // as possible. Follow social distancing and stay healthy.
        // 'quick' dataprocessor picks random positions
        // for the Nodes.
        dataProcessor: 'force',
        // Node and Link identity key attribute name
        identityKey: 'id',
        // Node settings
        nodeConfig: {
            label: 'model.name',
            iconType:'model.icon',
            color: function(model) {
                if (model._data.is_new === 'yes') {
                    return '#148D09'
                }
            },
        },
        // Node Set settings (for future use)
        nodeSetConfig: {
            label: 'model.name',
            iconType: 'model.iconType'
        },
        // Tooltip content settings
        tooltipManagerConfig: {
            nodeTooltipContentClass: 'CustomNodeTooltip'
        },
        // Link settings
        linkConfig: {
            // Display Links as curves in case of 
            //multiple links between Node Pairs.
            // Set to 'parallel' to use parallel links.
            linkType: 'curve',
            sourcelabel: 'model.srcIfName',
            targetlabel: 'model.tgtIfName',
            style: function(model) {
                if (model._data.is_dead === 'yes') {
                    return { 'stroke-dasharray': '5' }
                }
            },
            color: function(model) {
                if (model._data.is_dead === 'yes') {
                    return '#E40039'
                }
                if (model._data.is_new === 'yes') {
                    return '#148D09'
                }
            },
        },
        // Display Node icon. Displays a dot if set to 'false'.
        showIcon: true,
        linkInstanceClass: 'CustomLinkClass' 
    });
    
//    topo.registerIcon("dead_node", "img/dead_node.png", 49, 49);

    var Shell = nx.define(nx.ui.Application, {
        methods: {
            start: function () {
                // Read topology data from variable
                topo.data(topologyData);
                // Attach it to the document
                topo.attach(this);
            }
        }
    });

    nx.define('CustomNodeTooltip', nx.ui.Component, {
        properties: {
            node: {},
            topology: {}
        },
        view: {
            content: [{
                tag: 'div',
                props: {
                    "style": "width: 150px;",
                    "class": "popover-textarea"
                },
                content: [{
                    tag: 'h5',
                    props: {
                        "style": "border-bottom: dotted 1px; font-size:90%; word-wrap:normal; color:#003688; padding-bottom: 5px"
                    },
                    content: [{
                        tag: 'span',
                        props: {
                            "style": "padding-right: 5px"
                        },
                        content: '{#node.model.name}'
                    }, {
                        tag: 'a',
                        props: {
                            "onClick": "{#node.model.websshDeviceLink}",
                        },
                        content: [{
                            tag: 'span',
                            props: {"class": "glyphicon glyphicon-new-window"}
                        }]
                    }]
                }, {
                    tag: 'div',
                    props: {
                        "style": "font-size:80%;"
                    },
                    content: [
                        {
                        tag: 'label',
                        props: {
                            "style": "padding-right: 5px"
                        },
                        content: 'IP:',
                    }, {
                        tag: 'label',
                        content: '{#node.model.primaryIP}',
                    }]
                }, {
                    tag: 'div',
                    props: {
                        "style": "font-size:80%;"
                    },
                    content: [{
                        tag: 'label',
                        props: {
                            "style": "padding-right: 5px"
                        },
                        content: 'Model:',
                    }, {
                        tag: 'label',
                        content: '{#node.model.model}',
                    }]
                }]
            }]
        }
    });

    nx.define('Tooltip.Node', nx.ui.Component, {
        view: function(view){
            view.content.push({
            });
            return view;
        },
        methods: {
            attach: function(args) {
                this.inherited(args);
                this.model();
            }
        }
    });

    nx.define('CustomLinkClass', nx.graphic.Topology.Link, {
        properties: {
            sourcelabel: null,
            targetlabel: null
        },
        view: function(view) {
            view.content.push({
                name: 'source',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'sourcelabel',
                    'alignment-baseline': 'text-after-edge',
                    'text-anchor': 'start'
                }
            }, {
                name: 'target',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'targetlabel',
                    'alignment-baseline': 'text-after-edge',
                    'text-anchor': 'end'
                }
            });
            
            return view;
        },
        methods: {
            update: function() {
                
                this.inherited();
                
                
                var el, point;
                
                var line = this.line();
                var angle = line.angle();
                var stageScale = this.stageScale();
                
                // pad line
                line = line.pad(24 * stageScale, 24 * stageScale);
                
                if (this.sourcelabel()) {
                    el = this.view('source');
                    point = line.start;
                    el.set('x', point.x);
                    el.set('y', point.y);
                    el.set('text', this.sourcelabel());
                    el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
                    el.setStyle('font-size', 12 * stageScale);
                }
                
                if (this.targetlabel()) {
                    el = this.view('target');
                    point = line.end;
                    el.set('x', point.x);
                    el.set('y', point.y);
                    el.set('text', this.targetlabel());
                    el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
                    el.setStyle('font-size', 12 * stageScale);
                }
            }
        }
    });

    var currentLayout = 'auto'

    horizontal = function() {
        if (currentLayout === 'horizontal') {
            return;
        };
        currentLayout = 'horizontal';
        document.getElementById("nav-auto").className = "";
        document.getElementById("nav-horizontal").className = "active";
        document.getElementById("nav-vertical").className = "";
        var layout = topo.getLayout('hierarchicalLayout');
        layout.direction('horizontal');
        layout.levelBy(function(node, model) {
            return model.get('layerSortPreference');
        });
        topo.activateLayout('hierarchicalLayout');
    };

    vertical = function() {
        if (currentLayout === 'vertical') {
            return;
        };
        currentLayout = 'vertical';
        document.getElementById("nav-auto").className = "";
        document.getElementById("nav-horizontal").className = "";
        document.getElementById("nav-vertical").className = "active";
        var layout = topo.getLayout('hierarchicalLayout');
        layout.direction('vertical');
        layout.levelBy(function(node, model) {
          return model.get('layerSortPreference');
        });
        topo.activateLayout('hierarchicalLayout');
    };

    // Identify topology to load
    const queryString = window.location.search;
    const url_params = new URLSearchParams(queryString);
    var topo_type = "default", topo_name = "default", topo_base = "/default/", topo_url;
    if (url_params.has('type')) {
      topo_type = url_params.get('type');
    }
    if (url_params.has('topo')) {
      topo_name = url_params.get('topo');
    }
    switch (topo_type) {
    case "clab":
      topo_base = "/clab/clab-";
      topo_url = topo_base + topo_name + "/graph/" + topo_name + ".json";
      break;
    case "clabdata":
      topo_base = "/clab/clab-";
      topo_url = topo_base + topo_name + "/topology-data.json";
      break;
    default:
      topo_url = topo_base + topo_name + ".json";
    }
    
    // Load topology model
    var xmlhttp = new XMLHttpRequest();
    var topologyData;

    xmlhttp.onreadystatechange = function() {
      // TODO handle errors
      if (this.readyState == 4 && this.status == 200) {
        var topo_data = JSON.parse(this.responseText);
        switch (topo_type) {
        case "clab":
          topologyData = convert_clab_to_cmt(topo_data);
        default:
          topologyData = convert_clab_to_cmt(topo_data);
        }
        if (topologyData.hasOwnProperty("type") && topologyData.type == "clab" && topologyData.hasOwnProperty("name")) {
          document.title = topologyData.name + " - " + topologyData.type + "@" + window.location.hostname;
          document.getElementById("topology-type").innerHTML = "ContainerLab Topology";
          if (topologyData.name != "") {
            document.getElementById("topology-name").innerHTML = topologyData.name;
          } else {
            document.getElementById("topology-name").innerHTML = topo_name;
          }
        }
        if (topologyData.nodes.length > 0) {
          // Create an application instance
          var shell = new Shell();
          // Run the application
          shell.start();
          shell.container(document.getElementById("topology-container"));
        } else {
          if (topologyData.type == "clab") {
            // data came from containerlab topology-data.json
            var notice = document.createElement("div");
            var notice_html = '<strong>There are no nodes in <code><a class="alert-link" href="__topo_url__">topology-data.json</a></code> exported by ContainerLab. Please check a template file used for export.</strong><br/>\
            Default template path is <code>/etc/containerlab/templates/export/auto.tmpl</code>. If the file is missing or corrupted, you can replace it with <a class="alert-link" href="assets/auto.tmpl">this copy</a> and re-deploy the topology.'
            notice.className = "alert alert-warning fade in";
            notice.innerHTML = notice_html.replace("__topo_url__", topo_url);
            var topology_diagram = document.getElementById("topology-container");
            topology_diagram.insertBefore(notice, topology_diagram.firstChild);
          }
        }
      }
    };
    xmlhttp.open("GET", topo_url + '?nocache=' + (new Date()).getTime(), true);
    xmlhttp.send();

})(nx);