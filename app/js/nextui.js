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
            linkInstanceClass: 'AlignedLinkLabel',
            linkConfig: {
              linkType: 'curve', // also: parallel
              sourcelabel: 'model.srcIfName',
              targetlabel: 'model.tgtIfName',
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
        name: 'asnLabel',
        type: 'nx.graphic.Text',
        props: {
          visible: false
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

      showASN: function () {
        this._showASNLabel();
      },

      hideASN: function () {
        this._hideASNLabel();
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
      
      _showASNLabel: function () {
        // view of badge
        var label = this.view("asnLabel");

        // set properties
        label.sets({
          "text": this.model().get("ASN"),
          // make visible
          "visible": true,
        });
      },
      
      _hideASNLabel: function () {
        this.view("asnLabel").set("visible", false);
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

    nx.define('AlignedLinkLabel', nx.graphic.Topology.Link, {
        properties: {
            sourcelabel: null,
            targetlabel: null
        },
        view: function(view) {
            view.content.push({
                name: 'source',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'sourcelabel label-text-color-fg label-text-anchor-start'
                }
            }, {
                name: 'target',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'targetlabel label-text-color-fg label-text-anchor-end'
                }
            });
            
            return view;
        },
        methods: {
            init: function (args) {
                this.inherited(args);
                this.topology().fit();
            },
            'setModel': function (model) {
                this.inherited(model);
            },
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

    nx.define('BadgeLinkLabel', nx.graphic.Topology.Link, {
        properties: {
            sourcelabel: 'null',
            targetlabel: 'null',
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
                ],
                props: {
                    'alignment-baseline': 'after-edge',
                }
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
                    ],
                    props: {
                        'alignment-baseline': 'after-edge',
                    }
                }

            );
            return view;
        },
        methods: {
            init: function (args) {
                this.inherited(args);
                this.topology().fit();
            },
            'setModel': function (model) {
                this.inherited(model);
            },
            update: function () {
                this.inherited();
                var line = this.line();
                var angle = line.angle();
                var stageScale = this.stageScale();
                line = line.pad(50 * stageScale, 50 * stageScale);
                if (this.sourcelabel()) {
                    var sourceBadge = this.view('sourceBadge');
                    var sourceText = this.view('sourceText');
                    var sourceBg = this.view('sourceBg');
                    var point;
                    sourceText.sets({
                        text: this.sourcelabel(),
                    });
                    //TODO: accommodate larger text label
                    sourceBg.sets({ width: 34, visible: true });
                    sourceBg.setTransform(34 / -2);
                    point = line.start;
                    if (stageScale) {
                        sourceBadge.set('transform', 'translate(' + point.x + ',' + point.y + ') ' + 'scale (' + stageScale + ') ');
                    } else {
                        sourceBadge.set('transform', 'translate(' + point.x + ',' + point.y + ') ');
                    }
                }
                if (this.targetlabel()) {
                    var targetBadge = this.view('targetBadge');
                    var targetText = this.view('targetText');
                    var targetBg = this.view('targetBg');
                    var point;
                    targetText.sets({
                        text: this.targetlabel(),
                    });
                    targetBg.sets({ width: 34, visible: true });
                    targetBg.setTransform(34 / -2);
                    point = line.end;
                    if (stageScale) {
                        targetBadge.set('transform', 'translate(' + point.x + ',' + point.y + ') ' + 'scale (' + stageScale + ') ');
                    } else {
                        targetBadge.set('transform', 'translate(' + point.x + ',' + point.y + ') ');
                    }
                }
                this.view("sourceBadge").visible(true);
                this.view("sourceBg").visible(true);
                this.view("sourceText").visible(true);
                this.view("targetBadge").visible(true);
                this.view("targetBg").visible(true);
                this.view("targetText").visible(true);
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
                content: 'Toggle ASNs',
                events: {
                  'click': '{#toggle_asns}'
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
        'toggle_asns': function () {
          
          var topo = this.topology();
          var topo_url = "/clab/clab-2host/node-data.json";
          
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
                  if (data.nodes.hasOwnProperty(n) && data.nodes[n].hasOwnProperty('asn')) {
                    node.model().set('ASN', data.nodes[n].asn);
                    node.showASN();
                  }
                });
              }
            }
          };
          udpate_xmlhttp.open("GET", topo_url + '?nocache=' + (new Date()).getTime(), true);
          udpate_xmlhttp.send();
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
            actionBar: {}
        },
        methods: {
            start: function (cmt) {
              /* TopologyContainer is a nx.ui.Component object that can contain much more things than just a nx.graphic.Topology object.
               We can 'inject' a topology instance inside and interact with it easily
               */
              this.cmt = cmt;
              this.topologyContainer = new TopologyContainer();
              // topology instance was made in TopologyContainer, but we can invoke its members through 'topology' variable for convenience
              this.topology = this.topologyContainer.topology();
              this.actionBar = new ActionBar();
              
              // Read topology data from variable
              this.topology.data(cmt);
              this.actionBar.assignTopology(this.topology);
              this.actionBar.assignTopologyApp(this);
              this.actionBar.attach(this);
              // Attach it to the document
              this.topology.attach(this);
              this.linkInstanceClass = this.topology.linkInstanceClass();
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
              case 'AlignedLinkLabel':
                this.linkInstanceClass = 'BadgeLinkLabel';
                break;
              case 'BadgeLinkLabel':
                this.linkInstanceClass = 'AlignedLinkLabel';
                break;
              default:
                this.linkInstanceClass = 'AlignedLinkLabel';
              }
              // detach topology currently in view
              this.topology.detach(this);
              // update topology props
              this.topology.linkInstanceClass(this.linkInstanceClass);
              // attach topology back
              this.topology.attach(this);
            }
        }
    });
    
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
          break;
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
          // initialize a new application instance
          app = new TopologyApp();
          app.start(topologyData);
          //assign the app to the <div>
          app.container(document.getElementById('topology-container'));
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
