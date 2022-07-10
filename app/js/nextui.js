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
  nx.define('TopologyContainer', nx.ui.Component, {
    // we use this trick to use this object as a nx.ui.Component and display topology at the same time
    properties: {
      topology: {
        get: function () {
          return this.view('topology');
        }
      }
    },
    // define view
    view: {
      content: [
        {
          name: 'topology', // object name
          type: 'nx.graphic.Topology', // object type
          // this defines properties of a nx.graphic.Topology instance
          // see full specifications online
          // https://developer.cisco.com/site/neXt/document/api-reference-manual/
          props: {
            adaptive: true, // width 100% if true
            showIcon: true,
            identityKey: 'id', // helps to link source and target
            //width: 1138, // adaptive is set to true
            height: 700,
            dataProcessor: 'force', // arrange nodes positions if not set
            enableSmartLabel: true, // moves the labels in order to avoid overlay of them
            enableGradualScaling: true, // may slow down, if true
            nodeConfig: {
              label: 'model.name',
              iconType: 'model.icon', // icon types: https://developer.cisco.com/media/neXt-site/example.html#Basic/icons
              color: '#0how00'
            },
            nodeSetConfig: {
                label: 'model.name',
                iconType: 'model.iconType'
            },
            nodeInstanceClass: 'AnnotatedNode',
            tooltipManagerConfig: {
                nodeTooltipContentClass: 'CustomNodeTooltip'
            },
            supportMultipleLink: true, // if true, two nodes can have more than one link
            linkInstanceClass: 'LinkWithAlignedLabels',
            linkConfig: {
              linkType: 'curve', // also: parallel
              sourcelabel: 'model.srcIfName',
              targetlabel: 'model.tgtIfName',
              sourceIPlabel: 'model.srcIfIP',
              targetIPlabel: 'model.tgtIfIP',
            }
          }
        }
      ]
    }
  });

  nx.define('AnnotatedNode', nx.graphic.Topology.Node, {
    view: function (view) {
      view.content.push({
        name: 'deviceStatusBadge',
        type: 'nx.graphic.Circle',
        props: {
          r: 5,
          fill: "#ff0000",
          visible: false
        }
      },{
        name: 'devicePropsBadge',
        type: 'nx.graphic.Group',
        content: [
          {
            name: 'badgeShape',
            type: 'nx.graphic.Rect',
            props: {
              'class': 'badge-color-fg',
              width: 64,
              height: 32,
              x: 64,
              y: -40
            }
          },
          {
            name: 'badgeText',
            type: 'nx.graphic.Text',
            props: {
              'class': 'label-text-color-fg',
              x: 64-28,
              y: -20
            }
          }
        ],
        props: {
          visible: false,
        }
      });
      return view;
    },
    methods: {

      showStatus: function () {
        // draw/not draw the down badge based on status
        if (this.model().get("isDown"))
          this._showDownBadge();
        else
          this._hideDownBadge();
      },

      hideStatus: function () {
        this._hideDownBadge();
      },

      showProperties: function () {
        var devicePropsBadge = this.view('devicePropsBadge');
        var badgeShape = this.view('badgeShape');
        var badgeText = this.view('badgeText');
        // set properties
        badgeText.text("AS: " + this.model().get("ASN"));
        devicePropsBadge.visible(true);
        //badgeShape.sets({ width: 64 });
        badgeShape.setTransform(64 / -2);
        badgeShape.visible(true);
        badgeText.visible(true);
      },

      hideProperties: function () {
        this.view("badgeText").set("visible", false);
        this.view("badgeShape").set("visible", false);
        this.view("devicePropsBadge").set("visible", false);
      },

      // display the red badge
      _showDownBadge: function () {
        // view of badge
        var badge = this.view("deviceStatusBadge");

        // set properties
        badge.sets({
          // make visible
          "visible": true,
          // set X offset
          "cx": -13,
          // set Y offset
          "cy": 13
        });

      },

      // make the badge invisible
      _hideDownBadge: function () {
        this.view("deviceStatusBadge").set("visible", false);
      },
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
                    "style": "width: 220px;",
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
                          tag: 'span',
                          content: '{#node.model.model}',
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
                          content: 'Image:',
                      }, {
                          tag: 'span',
                          content: '{#node.model.image}',
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
                          content: 'Version:',
                      }, {
                          tag: 'span',
                          content: '{#node.model.os_version}',
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
                        content: 'Group:',
                    }, {
                        tag: 'span',
                        content: '{#node.model.group}',
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
                        content: 'IPv4:',
                    }, {
                        tag: 'span',
                        content: '{#node.model.mgmtIPv4}',
                    }, {
                        tag: 'span',
                        content: '{#node.model.mgmtIPv4PrefixMask}',
                    }, {
                        tag: 'a',
                        props: {
                            "onClick": "{#node.model.websshDeviceLink}",
                            "class": "pull-right"
                        },
                        content: [{
                            tag: 'label',
                            props: {
                                "style": "padding-right: 5px"
                            },
                            content: 'SSH',
                        }, {
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
                        content: 'IPv6:',
                    }, {
                        tag: 'span',
                        content: '{#node.model.mgmtIPv6}',
                    }, {
                        tag: 'span',
                        content: '{#node.model.mgmtIPv6PrefixMask}',
                    }, {
                        tag: 'a',
                        props: {
                            "onClick": "{#node.model.websshDeviceLinkIPv6}",
                            "class": "pull-right"
                        },
                        content: [{
                            tag: 'label',
                            props: {
                                "style": "padding-right: 5px"
                            },
                            content: 'SSH',
                        }, {
                            tag: 'span',
                            props: {"class": "glyphicon glyphicon-new-window"}
                        }]
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

    nx.define('LinkWithAlignedLabels', nx.graphic.Topology.Link, {
        properties: {
            sourcelabel: "",
            targetlabel: "",
        },
        view: function(view) {
            view.content.push({
                name: 'source',
                type: 'nx.graphic.Text',
                content: '{#sourcelabel}',
                props: {
                    'class': 'sourcelabel label-text-color-fg label-link-align-start'
                }
            }, {
                name: 'target',
                type: 'nx.graphic.Text',
                content: '{#targetlabel}',
                props: {
                    'class': 'targetlabel label-text-color-fg label-link-align-end'
                }
            });
            
            return view;
        },
        methods: {
            init: function (args) {
                this.inherited(args);
            },
            'setModel': function (model) {
                this.inherited(model);
            },
            update: function() {
                this.inherited();
                
                var line = this.line();
                var angle = line.angle();
                var stageScale = this.stageScale();
                
                // use padded line to define x,y coordinates for labels
                var paddedLine = line.pad(35 * stageScale, 35 * stageScale);
                
                var sourceView = this.view('source');
                sourceView.setStyle('font-size', 12 * stageScale);
                align_link_label(sourceView, paddedLine.start, angle, "source");
                
                var targetView = this.view('target');
                targetView.setStyle('font-size', 12 * stageScale);
                align_link_label(targetView, paddedLine.end, angle, "target");
            }
        }
    });

    nx.define('BadgeLinkLabel', nx.graphic.Topology.Link, {
        properties: {
            sourcelabel: null,
            targetlabel: null,
            sourceIPlabel: {
              get: function () {
                if (this.model().get('srcIfIP') != null) {
                  return this.model().get('srcIfIP');
                } else {
                  return "";
                }
              },
              set: function (ip) {
                this.model().set('srcIfIP', ip);
              }
            },
            targetIPlabel: {
              get: function () {
                if (this.model().get('tgtIfIP') != null) {
                  return this.model().get('tgtIfIP');
                } else {
                  return "";
                }
              },
              set: function (ip) {
                this.model().set('tgtIfIP', ip);
              }
            },
        },
        view: function (view) {
            view.content.push({
                name: 'sourceBadge',
                type: 'nx.graphic.Group',
                content: [
                    {
                        name: 'sourceBg',
                        type: 'nx.graphic.Rect',
                        props: {
                            'class': 'link-set-circle',
                            height: 1
                        }
                    },
                    {
                        name: 'sourceText',
                        type: 'nx.graphic.Text',
                        props: {
                            'class': 'link-set-text',
                            y: 1
                        }
                    }
                ]
              },
              {
                name: 'targetBadge',
                type: 'nx.graphic.Group',
                content: [
                    {
                        name: 'targetBg',
                        type: 'nx.graphic.Rect',
                        props: {
                            'class': 'link-set-circle',
                            height: 1
                        }
                    },
                    {
                        name: 'targetText',
                        type: 'nx.graphic.Text',
                        props: {
                            'class': 'link-set-text',
                            y: 1
                        }
                    }
                ]
              },
              {
                name: 'sourceIP',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'sourcelabel label-text-color-fg label-link-align-start'
                }
              }, {
                name: 'targetIP',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'targetlabel label-text-color-fg label-link-align-end'
                }
              }
            );
            return view;
        },
        methods: {
            init: function (args) {
                this.inherited(args);
                this.hideIP();
            },
            'setModel': function (model) {
                this.inherited(model);
            },
            update: function () {
                this.inherited();
                var line = this.line();
                var angle = line.angle();
                var stageScale = this.stageScale();
                var line_int = line.pad(50 * stageScale, 50 * stageScale);
                var line_ip = line.pad(75 * stageScale, 75 * stageScale);
                if (this.sourcelabel()) {
                    var badge = this.view('sourceBadge');
                    var badgeBg = this.view('sourceBg');
                    var badgeLabel = this.view('sourceText');
                    if (this.sourcelabel() != null) {
                      badgeLabel.set('text', if_number(this.sourcelabel()));
                    }
                    position_link_badge(badge, badgeBg, line_int.start, stageScale)

                    var ipLabel = this.view('sourceIP');
                    ipLabel.set('text', this.sourceIPlabel());
                    ipLabel.setStyle('font-size', 10 * stageScale);
                    align_link_label(ipLabel, line_ip.start, angle, "source");
                }
                if (this.targetlabel()) {
                    var badge = this.view('targetBadge');
                    var badgeLabel = this.view('targetText');
                    var badgeBg = this.view('targetBg');
                    if (this.targetlabel() != null) {
                      badgeLabel.set('text', if_number(this.targetlabel()));
                    }
                    position_link_badge(badge, badgeBg, line_int.end, stageScale)

                    var ipLabel = this.view('targetIP');
                    ipLabel.set('text', this.targetIPlabel());
                    ipLabel.setStyle('font-size', 10 * stageScale);
                    align_link_label(ipLabel, line_ip.end, angle, "target");
                }
                this.view("sourceBadge").visible(true);
                this.view("sourceBg").visible(true);
                this.view("sourceText").visible(true);
                this.view("targetBadge").visible(true);
                this.view("targetBg").visible(true);
                this.view("targetText").visible(true);
                this.view("sourceIP").visible(true);
                this.view("targetIP").visible(true);
              },
              showIP: function () {
                var srcLabel = this.view('sourceIP');
                srcLabel.set('text', this.sourceIPlabel());
                srcLabel.visible(true);
                var tgtLabel = this.view('targetIP');
                tgtLabel.set('text', this.targetIPlabel());
                tgtLabel.visible(true);
              },
              hideIP: function () {
                this.view('sourceIP').visible(false);
                this.view('targetIP').visible(false);
              }
          }
      });

    // This class realizes an action button and its behavior
    nx.define('ActionBar', nx.ui.Component, {
      properties: {
        'topology': null, // this prop will be actually initialized by this.assignTopology()
        'topologyApp': {},
        'exportedData': ''
      },
      view: {
        content: [
          {
            tag: 'div',
            content: [
              {
                tag: 'button',
                content: 'Toggle Link Label Types',
                events: {
                  'click': '{#toggle_link_label_types}'
                }
              },{
                tag: 'button',
                content: 'Toggle Device Properties',
                events: {
                  'click': '{#toggle_device_props}'
                }
              }
            ]
          }
        ]
      },
      methods: {
        'toggle_link_label_types': function () {
          this.topologyApp().toggle_link_label_types();
        },
        'toggle_device_props': function () {
          this.topologyApp().toggle_device_props();
        },
          
        // assign topology instance (by ref) to the actionbar instance
        'assignTopology': function (topo) {
          this.topology(topo);
        },
          
        // assign topologyApp instance (by ref) to the actionbar instance
        'assignTopologyApp': function (app) {
          this.topologyApp(app);
        }
      }
    });

    nx.define('TopologyApp', nx.ui.Application, {
        properties: {
            cmt: {},
            topologyContainer: {},
            topology: {},
            linkInstanceClass: '',
            currentLayout: 'auto',
            devicePropertiesShown: false,
            actionBar: {}
        },
        methods: {
            init_with_cmt: function (cmt) {
              /* TopologyContainer is a nx.ui.Component object that can contain much more things than just a nx.graphic.Topology object.
               We can 'inject' a topology instance inside and interact with it easily
               */
              this.cmt = cmt;
              this.topologyContainer = new TopologyContainer();
              // topology instance was made in TopologyContainer, but we can invoke its members through 'topology' variable for convenience
              this.topology = this.topologyContainer.topology();
              
              // Read topology data from variable
              this.topology.data(cmt);
              this.linkInstanceClass = this.topology.linkInstanceClass();
              this.devicePropertiesShown = false;
            },
            add_action_bar: function () {
              this.actionBar = new ActionBar();
              this.actionBar.assignTopology(this.topology);
              this.actionBar.assignTopologyApp(this);
              this.actionBar.attach(this);
            },
            attach: function () {
              // Attach it to the document
              this.topology.attach(this);
            },
            detach: function () {
              // Attach it to the document
              this.topology.detach(this);
            },
            layout_horizontal: function () {
              if (this.currentLayout === 'vertical') {
                  return;
              };
              this.currentLayout = 'vertical';
              var layout = this.topology.getLayout('hierarchicalLayout');
              layout.direction('vertical');
              layout.levelBy(function(node, model) {
                  return model.get('layerSortPreference');
              });
              this.topology.activateLayout('hierarchicalLayout');
            },
            layout_vertical: function () {
              if (this.currentLayout === 'horizontal') {
                  return;
              };
              this.currentLayout = 'horizontal';
              var layout = this.topology.getLayout('hierarchicalLayout');
              layout.direction('horizontal');
              layout.levelBy(function(node, model) {
                  return model.get('layerSortPreference');
              });
              this.topology.activateLayout('hierarchicalLayout');
            },
            toggle_link_label_types: function () {
              switch (this.linkInstanceClass) {
              case 'LinkWithAlignedLabels':
                this.linkInstanceClass = 'BadgeLinkLabel';
                break;
              case 'BadgeLinkLabel':
                this.linkInstanceClass = 'LinkWithAlignedLabels';
                break;
              default:
                this.linkInstanceClass = 'LinkWithAlignedLabels';
              }
              // detach topology currently in view
              this.topology.detach(this);
              // update topology props
              this.topology.linkInstanceClass(this.linkInstanceClass);
              // attach topology back
              this.topology.attach(this);
            },
            toggle_device_props: function () {
              var topo = this.topology;
              if (!this.devicePropertiesShown) {
                var topo_url = "/collect/clab/" + this.cmt.name + "/nodes/";
          
                // Load topology model
                var udpate_xmlhttp = new XMLHttpRequest();
    
                udpate_xmlhttp.onreadystatechange = function() {
                  // TODO handle errors
                  if (this.readyState == 4 && this.status == 200) {
                    var data = JSON.parse(this.responseText);
                    if (data.hasOwnProperty("nodes")) {
                      // go through fetched nodes' array
                      nx.each(topo.getNodes(), function (node) {
                        
                        var n = node.model().get('name');
                        var fn = node.model().get('fullname'); // this name is supposed to be unique for the topology
                        
                        if (data.nodes.hasOwnProperty(fn)) {
                          node_data = data.nodes[fn]
                          if (node_data.hasOwnProperty("os_version")) {
                            node.model().set('os_version', node_data["os_version"]);
                          }
                            
                          if (data.nodes[fn].hasOwnProperty('interfaces_ip')) {
                            node.eachLink(
                              function (link) {
                                // find out if current node is source or target of the link
                                if (link.sourceNode().model().get('name') == n) {
                                  var ifname = link.sourcelabel();
                                  console.log(ifname);
                                  // find out if we have data for this interface name
                                  if (data.nodes[ln].interfaces_ip.hasOwnProperty(ifname)) {
                                    console.log(data.nodes[ln].interfaces_ip[ifname].ipv4);
                                    //link.model().set("srcIfIP", data.nodes[n].interfaces[ifname].ipv4); //link.sourceIPlabel(data.nodes[n].interfaces_ip[ifname].ipv4);
                                  }
                                } else if (link.targetNode().model().get('name') == n) {
                                  var ifname = link.targetlabel();
                                  console.log(ifname);
                                  // find out if we have data for this interface name
                                  if (data.nodes[ln].interfaces_ip.hasOwnProperty(ifname)) {
                                    console.log(data.nodes[ln].interfaces_ip[ifname].ipv4);
                                    //link.model().set("tgtIfIP", data.nodes[n].interfaces[ifname].ipv4); //link.targetIPlabel(data.nodes[n].interfaces_ip[ifname].ipv4);
                                  }
                                }
                                if (typeof link.showIP === 'function') {
                                  link.showIP();
                                }
                              }
                            );
                          } 
                        }
                      });
                    }
                  }
                };
                udpate_xmlhttp.open("GET", topo_url + '?nocache=' + (new Date()).getTime(), true);
                udpate_xmlhttp.send();
                this.devicePropertiesShown = true;
              } else {
                nx.each(topo.getNodes(), function (node) {
                  node.hideProperties();
                  node.eachLink(
                    function (link) {
                      if (typeof link.hideIP === 'function') {
                        link.hideIP();
                      }
                    }
                  );
                });
                this.devicePropertiesShown = false;
              }
            }
        }
    });

  
  function if_number(ifname) {
    return ifname.replace(/^[A-z]+/,'');
  }
  
  function align_link_label(label, point, angle, which_end) {
    var angle_flip = angle + 180;
    label.set('x', point.x);
    label.set('y', point.y);
    switch (which_end) {
    case "source":
      if (angle > 90 || angle < -90) {
        label.setStyle('text-anchor', 'end');
        label.setStyle('transform-origin', '100% 0%');
        label.setStyle('alignment-baseline', 'text-before-edge');
        label.set('transform', 'rotate(' + angle_flip + ')');
      } else {
        label.setStyle('text-anchor', 'start');
        label.setStyle('transform-origin', '0% 100%');
        label.setStyle('alignment-baseline', 'text-after-edge');
        label.set('transform', 'rotate(' + angle + ')');
      }
      break;
    case "target":
      if (angle > 90 || angle < -90) {
        label.setStyle('text-anchor', 'start');
        label.setStyle('transform-origin', '0% 100%');
        label.setStyle('alignment-baseline', 'text-after-edge');
        label.set('transform', 'rotate(' + angle_flip + ')');
      } else {
        label.setStyle('text-anchor', 'end');
        label.setStyle('transform-origin', '100% 0%');
        label.setStyle('alignment-baseline', 'text-before-edge');
        label.set('transform', 'rotate(' + angle + ')');
      }
      break;
    default:
    }
  }
  
  function position_link_badge(badge, badgeBg, point, stageScale) {
    //TODO: accommodate larger text label
    badgeBg.sets({ width: 8, visible: true });
    badgeBg.setTransform(8 / -2);
    if (stageScale) {
        badge.set('transform', 'translate(' + point.x + ',' + point.y + ') ' + 'scale (' + stageScale + ') ');
    } else {
        badge.set('transform', 'translate(' + point.x + ',' + point.y + ') ');
    }
  }

})(nx);

(function (nx) {

    var app; // TopologyApp

    horizontal = function() {
        document.getElementById("nav-auto").className = "";
        document.getElementById("nav-horizontal").className = "active";
        document.getElementById("nav-vertical").className = "";
        app.layout_horizontal();
    };

    vertical = function() {
        document.getElementById("nav-auto").className = "";
        document.getElementById("nav-horizontal").className = "";
        document.getElementById("nav-vertical").className = "active";
        app.layout_vertical();
    };

    // Identify topology to load
    const queryString = window.location.search;
    const url_params = new URLSearchParams(queryString);
    var topo_type = "default", topo_name = "default", topo_base = "/default/", topo_url;
    var showActionBar = false;
    if (url_params.has('type')) {
      topo_type = url_params.get('type');
    }
    if (url_params.has('topo')) {
      topo_name = url_params.get('topo');
    }
    if (url_params.has('actionbar')) {
      showActionBar = true;
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
          break;
        default:
          topologyData = convert_clab_to_cmt(topo_data);
        }
        if (topologyData.hasOwnProperty("type") && topologyData.type == "clab" && topologyData.hasOwnProperty("name")) {
          document.title = topologyData.name + " - " + topologyData.type + "@" + window.location.hostname;
          document.getElementById("topology-type").innerHTML = "Containerlab Topology";
          if (topologyData.name != "") {
            document.getElementById("topology-name").innerHTML = topologyData.name;
          } else {
            document.getElementById("topology-name").innerHTML = topo_name;
          }
        }
        if (topologyData.nodes.length > 0) {
          // initialize a new application instance
          app = new TopologyApp();
          //assign the app to the <div>
          app.container(document.getElementById('topology-container'));
          app.init_with_cmt(topologyData);
          if (showActionBar) {
            app.add_action_bar();
          }
          app.attach();
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
