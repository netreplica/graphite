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
     * GraphiteTopology class
     * @class GraphiteTopology
     * @extend nx.graphic.Topology
     * @module nx.graphic.Topology
     */
    
    nx.define('GraphiteTopology', nx.graphic.Topology, {
        properties: {
            /**
            * Label type to display type: 'static' / 'live'
            * @property labelType {String}
            */
            labelType: {
                get: function() {
                    return this._labelType !== undefined ? this._labelType : 'static';
                },
                set: function(inValue) {
                    //var value = this._processPropertyValue(inValue); // TODO validate input
                    if (this._labelType !== inValue) {
                        this._labelType = inValue;
                        return true;
                    } else {
                        return false;
                    }
                }
            },
        },
        view: function(view) {
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
            }
        }
    });

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
              type: 'GraphiteTopology', // object type
              // this mostly defines properties of a nx.graphic.Topology instance
              // see full specifications online
              // https://developer.cisco.com/site/neXt/document/api-reference-manual/
              props: {
                labelType: 'static', // also: live
                adaptive: true, // width 100% if true
                showIcon: true,
                identityKey: 'id', // helps to link source and target
                //width: 1138, // adaptive is set to true
                height: 700,
                dataProcessor: 'force', // arrange nodes positions if not set
                enableSmartLabel: true, // moves the labels in order to avoid overlay of them
                enableGradualScaling: true, // may slow down, if true
                nodeConfig: {
                  label: 'model.label',   // which will be initialized in 'setModel()'
                  iconType: 'model.icon', // icon types: https://developer.cisco.com/media/neXt-site/example.html#Basic/icons
                  color: '#0how00'
                },
                nodeSetConfig: {
                    label: 'model.name',
                    iconType: 'model.iconType'
                },
                nodeInstanceClass: 'AnnotatedNode',
                tooltipManagerConfig: {
                  nodeTooltipContentClass: 'GraphiteNodeTooltipContent',
                  linkTooltipContentClass: 'GraphiteLinkTooltipContent'
                },
                supportMultipleLink: true, // if true, two nodes can have more than one link
                linkInstanceClass: 'BadgeLinkLabel', // also: 'LinkWithAlignedLabels', 'BadgeLinkLabel'
                linkConfig: {
                  linkType:          'curve', // curve or parallel
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
      init: function (args) {
          this.inherited(args);
      },

      setModel: function (model) {
          this.inherited(model);
          this.updateLabels();
      },

      update: function() {
          this.inherited();
      },

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
      
      updateLabels: function() {
        var l;
        if (this.topology() instanceof GraphiteTopology && this.topology().labelType() == 'live') {
            l = this.model().get("hostname");
            if (l === undefined || l == "") {
              l = this.model().get("name");
            }
        } else {
          l = this.model().get("name");
        }
        this.model().set("label", l); // update the label to either static or live
        this.eachLink(
          function (link) {
            link.updateLabels();
          }
        );
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

  nx.define('GraphiteNodeTooltipContent', nx.ui.Component, {
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
                          content: 'Full name:',
                      }, {
                          tag: 'span',
                          content: '{#node.model.fullname}',
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
                          content: 'Hostname:',
                      }, {
                          tag: 'span',
                          content: '{#node.model.hostname}',
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
                          content: 'Kind:',
                      }, {
                          tag: 'span',
                          content: '{#node.model.kind}',
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
                          content: 'Vendor:',
                      }, {
                          tag: 'span',
                          content: '{#node.model.vendor}',
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

    nx.define('GraphiteLinkTooltipContent', nx.graphic.Topology.LinkTooltipContent, {
      properties: {
        link: {
            set: function (value) {
                var model = value.model();
                var items = [
                  {
                    'rowName': '',
                    'srcValue': 'Source',
                    'tgtValue': 'Target'
                  },
                  {
                    'rowName': 'Device',
                    'srcValue': model.get('srcDevice'),
                    'tgtValue': model.get('tgtDevice')
                  },
                  {
                    'rowName': 'Interface',
                    'srcValue': model.get('srcIfName'),
                    'tgtValue': model.get('tgtIfName')
                  },
                  {
                    'rowName': 'Name',
                    'srcValue': model.get('srcIfNameLive'),
                    'tgtValue': model.get('tgtIfNameLive')
                  },
                  {
                    'rowName': 'MAC',
                    'srcValue': model.get('srcIfMAC'),
                    'tgtValue': model.get('tgtIfMAC')
                  },
                ];
                addLinkTooltipItems(items, "IPv4", model.get('srcIfIPv4Array'), model.get('tgtIfIPv4Array'));
                addLinkTooltipItems(items, "IPv6", model.get('srcIfIPv6Array'), model.get('tgtIfIPv6Array'));
                this.view('list').set('items', items);
            }
        },
      },
      view: {
        props: {
            "class": "popover-textarea"
        },
        content: [
          {
            name: 'list',
            tag: 'table',
            props: {
              template: {
                tag: 'tr',
                props: {
                    "style": "font-size:80%;",
                },
                content: [{
                  tag: 'td',
                  props: {
                      "style": "padding-right: 10px"
                  },
                  content: '{rowName}'
                },{
                  tag: 'td',
                  props: {
                      "style": "padding-right: 10px"
                  },
                  content: '{srcValue}'
                },{
                  tag: 'td',
                  content: '{tgtValue}'
                }]
              }
            }
          },
        ],
      },
    });
    
    /**
     * GraphiteLink class
     * @class GraphiteLink
     * @extend nx.graphic.Topology.Link
     * 
     * Handles live link data
     */
    nx.define('GraphiteLink', nx.graphic.Topology.Link, {
      properties: {
        sourceName: {
          get: function() {
            return this.model().get("srcIfName");
          },
        },
        targetName: {
          get: function() {
            return this.model().get("tgtIfName");
          },
        },
        sourceNameLive: {
          get: function() {
            return this.model().get("srcIfNameLive");
          },
        },
        targetNameLive: {
          get: function() {
            return this.model().get("tgtIfNameLive");
          },
        },
        sourceLabel: {
            get: function() {
                if (this.topology() instanceof GraphiteTopology && this.topology().labelType() == 'live') {
                    label = if_shortname(this.sourceNameLive());
                    if (label !== undefined && label != "") {return label;}
                }
                return this.sourceName();
            },
        },
        targetLabel: {
            get: function() {
                if (this.topology() instanceof GraphiteTopology && this.topology().labelType() == 'live') {
                    label = if_shortname(this.targetNameLive());
                    if (label !== undefined && label != "") {return label;}
                }
                return this.targetName();
            },
        },
        sourceIPv4: {
          get: function () {
            if (this.sourceIPv4s().length > 0) {
              return this.sourceIPv4s()[0];
            } else {
              return "";
            }
          },
        },
        targetIPv4: {
          get: function () {
            if (this.targetIPv4s().length > 0) {
              return this.targetIPv4s()[0];
            } else {
              return "";
            }
          },
        },
        sourceIPv4s: {
          get: function () {
            var a = this.model().get('srcIfIPv4Array');
            return (a != null ? a : []);
          },
          set: function (a) {
            this.model().set('srcIfIPv4Array', a);
          },
        },
        targetIPv4s: {
          get: function () {
            var a = this.model().get('tgtIfIPv4Array');
            return (a != null ? a : []);
          },
          set: function (a) {
            this.model().set('tgtIfIPv4Array', a);
          },
        },
        sourceIPv6s: {
          get: function () {
            var a = this.model().get('srcIfIPv6Array');
            return (a != null ? a : []);
          },
          set: function (a) {
            this.model().set('srcIfIPv6Array', a);
          },
        },
        targetIPv6s: {
          get: function () {
            var a = this.model().get('tgtIfIPv6Array');
            return (a != null ? a : []);
          },
          set: function (a) {
            this.model().set('tgtIfIPv6Array', a);
          },
        },
      },
      methods: {
        init: function (args) {
          this.inherited(args);
        },
        setModel: function (model) {
          this.inherited(model);
        },
        update: function() {
          this.inherited();
        },
      }
    });

    /**
     * LinkWithAlignedLabels class
     * @class LinkWithAlignedLabels
     * @extend GraphiteLink
     * 
     * Link with interface name labels aligned alongside the link
     */
    nx.define('LinkWithAlignedLabels', GraphiteLink, {
        properties: {
        },
        view: function(view) {
            view.content.push({
                name: 'source',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'sourcelabel label-text-color-fg label-link-align-start'
                }
            }, {
                name: 'target',
                type: 'nx.graphic.Text',
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
            setModel: function (model) {
                this.inherited(model);
                this.updateLabels();
            },
            update: function() {
                this.inherited();
                
                var topology = this.topology();
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
            },
            updateLabels: function() {
              var sourceView = this.view('source');
              var targetView = this.view('target');
              sourceView.set('text', this.sourceLabel());
              targetView.set('text', this.targetLabel());
            }
        }
    });

    /**
     * BadgeLinkLabel class
     * @class BadgeLinkLabel
     * @extend GraphiteLink
     * 
     * Link with interface numbers as badges
     */
    nx.define('BadgeLinkLabel', GraphiteLink, {
        properties: {
          sourceLabelNumber: {
            get: function() {
              return if_number(this.sourceLabel());
            },
          },
          targetLabelNumber: {
            get: function() {
              return if_number(this.targetLabel());
            },
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
                name: 'sourceIPv4',
                type: 'nx.graphic.Text',
                props: {
                    'class': 'sourcelabel label-text-color-fg label-link-align-start'
                }
              }, {
                name: 'targetIPv4',
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
            setModel: function (model) {
                this.inherited(model);
            },
            update: function () {
                this.inherited();
                var line = this.line();
                var angle = line.angle();
                var stageScale = this.stageScale();
                var line_int = line.pad(50 * stageScale, 50 * stageScale);
                var line_ip = line.pad(75 * stageScale, 75 * stageScale);
                if (this.sourceLabel()) {
                    var badge = this.view('sourceBadge');
                    var badgeBg = this.view('sourceBg');
                    var badgeLabel = this.view('sourceText');
                    if (this.sourceLabel() != null) {
                      badgeLabel.set('text', this.sourceLabelNumber());
                    }
                    position_link_badge(badge, badgeBg, line_int.start, stageScale)

                    var ipLabel = this.view('sourceIPv4');
                    ipLabel.set('text', this.sourceIPv4());
                    ipLabel.setStyle('font-size', 10 * stageScale);
                    align_link_label(ipLabel, line_ip.start, angle, "source");
                }
                if (this.targetLabel()) {
                    var badge = this.view('targetBadge');
                    var badgeLabel = this.view('targetText');
                    var badgeBg = this.view('targetBg');
                    if (this.targetLabel() != null) {
                      badgeLabel.set('text', this.targetLabelNumber());
                    }
                    position_link_badge(badge, badgeBg, line_int.end, stageScale)

                    var ipLabel = this.view('targetIPv4');
                    ipLabel.set('text', this.targetIPv4());
                    ipLabel.setStyle('font-size', 10 * stageScale);
                    align_link_label(ipLabel, line_ip.end, angle, "target");
                }
                this.view("sourceBadge").visible(true);
                this.view("sourceBg").visible(true);
                this.view("sourceText").visible(true);
                this.view("targetBadge").visible(true);
                this.view("targetBg").visible(true);
                this.view("targetText").visible(true);
                this.view("sourceIPv4").visible(true);
                this.view("targetIPv4").visible(true);
              },
              updateLabels: function() {
                var sourceLabelView = this.view('sourceText');
                var targetLabelView = this.view('targetText');
                sourceLabelView.set('text', this.sourceLabelNumber());
                targetLabelView.set('text', this.targetLabelNumber());
              },
              showIP: function () {
                var srcLabel = this.view('sourceIPv4');
                srcLabel.set('text', this.sourceIPv4());
                srcLabel.visible(true);
                var tgtLabel = this.view('targetIPv4');
                tgtLabel.set('text', this.targetIPv4());
                tgtLabel.visible(true);
              },
              hideIP: function () {
                this.view('sourceIPv4').visible(false);
                this.view('targetIPv4').visible(false);
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
              },{
                tag: 'button',
                content: 'Toggle Auto Update',
                events: {
                  'click': '{#toggle_auto_update}'
                }
              },{
                tag: 'button',
                content: 'Fetch Device Data',
                events: {
                  'click': '{#fetch_device_data}'
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
        'toggle_auto_update': function () {
          this.topologyApp().toggle_device_props();
        },
        'toggle_auto_update': function () {
          this.topologyApp().device_data_autoupdate_toggle();
        },
        'fetch_device_data': function () {
          this.topologyApp().fetch_device_data();
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
            currentLabelType: 'static',
            devicePropertiesShown: false,
            actionBar: {},
            autoUpdateTimer: {},
            enableLiveLabels: false,
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
            
            layout_auto: function() {
              this.currentLayout = 'auto';
              this.detach();
              this.topology.activateLayout('force');
              this.attach();
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
            
            label_types_static: function() {
              this.topology.labelType('static');
              this._update_topology_labels();
            },
            
            label_types_live: function() {
              this.topology.labelType('live');
              this._update_topology_labels();
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
            },

            device_data_autoupdate_on: async function(delay = 10) { // seconds
              await this.fetch_device_data();
              this.autoUpdateTimer = setTimeout(() => this.device_data_autoupdate_on(), delay * 1000);
            },

            device_data_autoupdate_off: function() {
              clearTimeout(this.autoUpdateTimer);
              this.autoUpdateTimer = null;
            },

            device_data_autoupdate_toggle: function() {
              if (this.autoUpdateTimer == null) {
                this.device_data_autoupdate_on();
              } else {
                this.device_data_autoupdate_off();
              }
            },

            fetch_device_data: function() {
              var topo_url = "/collect/clab/" + this.cmt.name + "/nodes/"  + '?nocache=' + (new Date()).getTime();
              
              fetch(topo_url)
                .then(response => {
                  if (!response.ok) {
                    throw new Error('Server response was not OK');
                  }
                  return response.json();
                })
                .then(data => {
                  this._update_topology_data(data);
                  // enable live label mode
                  this.enableLiveLabels(true);
                  //enable_live_labels(); // commented out - do not show Static/Live UI buttons
                  this.label_types_live(); // instead, use live labels once we got data in
                })
                .catch(error => {
                  console.error('There has been a problem with fetch_device_data:', error);
                  this.label_types_static(); // if we're no longer getting data, use static labels
                });
            },

            _update_topology_data: function(data) {
              var topo = this.topology;
              //console.log(data);
              if (typeof data !== 'undefined' && data.hasOwnProperty("nodes")) {
                // go through fetched nodes' array
                nx.each(topo.getNodes(), function (node) {
                  var n = node.model().get('name');
                  var fn = node.model().get('fullname'); // this name is supposed to be unique for the topology
                
                  if (data.nodes.hasOwnProperty(fn)) {
                    node_data = data.nodes[fn]
                    if (node_data.hasOwnProperty("hostname")) {
                      node.model().set('hostname', node_data["hostname"]);
                    }
                    if (node_data.hasOwnProperty("vendor")) {
                      node.model().set('vendor', node_data["vendor"]);
                    }
                    if (node_data.hasOwnProperty("model")) {
                      node.model().set('model', node_data["model"]);
                    }
                    if (node_data.hasOwnProperty("os_version")) {
                      node.model().set('os_version', node_data["os_version"]);
                    }
                    var ifmatched = []; // keep track of node_data interfaces we already matched to avoid matching them more than once via LLDP
                    if (node_data.hasOwnProperty('interface_list') && node_data.hasOwnProperty('interfaces')) {
                      node.eachLink(
                        function (link) {
                          var ifname   = ""; // interface name
                          var ifmac    = ""; // interface MAC
                          var ifpeer   = ""; // interface peer device name
                          var linkside = ""; // is the current node a source or a target on the link
                          // identify if the current node is a source or a target on the link
                          if (link.sourceNode().model().get('fullname') == fn) { // it is a source
                            linkside = "src";
                            ifname = link.model().get('srcIfName');
                            ifmac = link.model().get('srcIfMAC');
                            ifpeer = link.model().get('tgtDevice');
                          } else if (link.targetNode().model().get('fullname') == fn) { // it is a target
                            linkside = "tgt";
                            ifname = link.model().get('tgtIfName');
                            ifmac = link.model().get('tgtIfMAC');
                            ifpeer = link.model().get('srcDevice');
                          }
                          ifmac !== undefined ? ifmac = ifmac.toUpperCase() : ifmac = "";
                          // look for a matching interface from node_data
                          var peerif = ""; // interface peer interface name
                          var match = node_data.interface_list.find(
                            i => {
                              if (ifmatched.includes(i)) {
                                return false;
                              } else if (i == ifname) {
                                // Exact interface name match. Should work for nodes that use native Linux interface names, but not for most containerized NOSes
                                //console.log(fn + ": " + ifname + ", " + i + ", "+ linkside);
                                return true;
                              } else if (ifmac != "" && 
                                         node_data.interfaces.hasOwnProperty(i) &&
                                         node_data.interfaces[i].hasOwnProperty('mac_address') &&
                                         node_data.interfaces[i].mac_address.toUpperCase() == ifmac) {
                                // MAC address match. Known to work for cEOSLab in Containerlab
                                //console.log(fn + ": " + ifname + ", " + ifmac + ", " + linkside);
                                return true;
                              } else if (node_data.hasOwnProperty('lldp_neighbors') && 
                                         node_data.lldp_neighbors.hasOwnProperty(i)) {
                                // LLDP peer name match. Only works if topology and node_data interfaces are in the same order
                                // TODO consider only point-2-point links, not bridges
                                if (node_data.lldp_neighbors[i].length == 1 && 
                                    node_data.lldp_neighbors[i][0].hostname == ifpeer) {
                                  // will use peerif for the other side of the link, to make sure we use correct peer interface name from LLDP
                                  peerif = node_data.lldp_neighbors[i][0].port
                                  //console.log(fn + ": " + ifname + " " + linkside + " " + i + " neighbor: " + ifpeer + " " + peerif);
                                  return true;
                                }
                              }
                              return false;
                            }
                          );
                          if (match !== undefined) {
                            //console.log("matched: " + match + " peer if: " + peerif);
                            ifmatched.push(match);
                            switch (linkside) {
                            case "src":
                              if (link.model().get("srcIfNameLive") === undefined) {
                                link.model().set("srcIfNameLive", match);
                                //console.log("set if to " + link.model().get("srcIfNameLive"));
                              }
                              if (link.model().get("tgtIfNameLive") === undefined && peerif != "") {
                                link.model().set("tgtIfNameLive", peerif);
                                //console.log("set peerif to " + link.model().get("tgtIfNameLive"));
                              }
                              break;
                            case "tgt":
                              if (link.model().get("tgtIfNameLive") === undefined) {
                                link.model().set("tgtIfNameLive", match);
                                //console.log("set if to " + link.model().get("tgtIfNameLive"));
                              }
                              if (link.model().get("srcIfNameLive") === undefined && peerif != "") {
                                link.model().set("srcIfNameLive", peerif);
                                //console.log("set peerif to " + link.model().get("srcIfNameLive"));
                              }
                              break;
                            }
                          }
                        }
                      )
                    }
                      
                    if (data.nodes[fn].hasOwnProperty('interfaces_ip')) {
                      node.eachLink(
                        function (link) {
                          // find out if current node is source or target of the link
                          if (link.sourceNode().model().get('name') == n) { // TODO add getter to the link class
                            linkSetIPsFromNodeData(link, link.sourceNameLive(), "srcIfIPv4Array", data.nodes[fn].interfaces_ip, "ipv4");
                            linkSetIPsFromNodeData(link, link.sourceNameLive(), "srcIfIPv6Array", data.nodes[fn].interfaces_ip, "ipv6");
                          } else if (link.targetNode().model().get('name') == n) {
                            linkSetIPsFromNodeData(link, link.targetNameLive(), "tgtIfIPv4Array", data.nodes[fn].interfaces_ip, "ipv4");
                            linkSetIPsFromNodeData(link, link.targetNameLive(), "tgtIfIPv6Array", data.nodes[fn].interfaces_ip, "ipv6");
                          }
                          if (typeof link.showIP === 'function') {
                            link.showIP();
                          }
                        }
                      );
                    } 
                    
                    if (topo.labelType() == 'live'){
                      node.updateLabels();
                    }
                  }
                });
              }
              return topo;
            },
            
            _update_topology_labels: function() {
              nx.each(this.topology.getNodes(), function (node) {
                node.updateLabels();
              });
            }
        }
    });

  
  function if_number(ifname) {
    if (typeof ifname == 'string') {
      return ifname.replace(/^[A-z]+/,'');
    } else {
      return "";
    }
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
    
    // Alignment functions
    autolayout = function() {
        document.getElementById("nav-auto").className = "active";
        document.getElementById("nav-horizontal").className = "";
        document.getElementById("nav-vertical").className = "";
        app.layout_auto();
    };

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
    
    // Label display functions
    label_types_static = function() {
      document.getElementById("nav-live").className = "pull-right";
      document.getElementById("nav-static").className = "pull-right active";
      app.label_types_static();
    };

    label_types_live = function() {
        if (app.enableLiveLabels()) {
            document.getElementById("nav-live").className = "pull-right active";
            document.getElementById("nav-static").className = "pull-right";
            app.label_types_live();
        }
    };

    enable_live_labels = function() {
        if (app.enableLiveLabels()) {
            document.getElementById("nav-labels").classList.add("m-fadeIn");
            document.getElementById("nav-static").classList.add("m-fadeIn");
            document.getElementById("nav-live").classList.add("m-fadeIn");
            document.getElementById("nav-labels").classList.remove("m-fadedOut");
            document.getElementById("nav-static").classList.remove("m-fadedOut");
            document.getElementById("nav-live").classList.remove("m-fadedOut");
        }
    };

    // Identify topology to load
    const queryString = window.location.search;
    const url_params = new URLSearchParams(queryString);
    var topo_type = "default", topo_name = "default", topo_base = "/lab/", topo_url;
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
      topo_url = topo_base + "clab-" + topo_name + "/graph/" + topo_name + ".json";
      break;
    case "clabdata":
      // NOTE on "clab-" prefix from https://containerlab.dev/manual/topo-def-file/#prefix
      // Even when you change the prefix, the lab directory is still uniformly named using the clab-<lab-name> pattern.
      topo_url = topo_base + "clab-" + topo_name + "/topology-data.json";
      break;
    default:
      topo_url = topo_base + topo_name + "/topology-data.json";
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
          app.device_data_autoupdate_on(); // start pulling additional data from the devices
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


(function (nx) {
  const interface_full_name_map = { // TODO expand to 25/40/50/100/400/800/1600 and cover other NOSes like SRL
    'Eth': 'Ethernet',
    'Fa' : 'FastEthernet',
    'Gi' : 'GigabitEthernet',
    'Te' : 'TenGigabitEthernet',
    'Ma' : 'Management'
  };

  if_fullname= function(ifname) {
    for (k in interface_full_name_map){
      var v = interface_full_name_map[k];
      if (ifname !== undefined && ifname.toLowerCase().startsWith(k.toLowerCase())) {
        return ifname.toLowerCase().replace(k.toLowerCase(), v);
      }
    }
    return ifname;
  };

  if_shortname = function(ifname) {
    for (k in interface_full_name_map){
      var v = interface_full_name_map[k];
      if (ifname !== undefined && ifname.toLowerCase().startsWith(v.toLowerCase())) {
        return ifname.toLowerCase().replace(v.toLowerCase(), k);
      }
    }
    return ifname;
  };
  
  addLinkTooltipItems = function(items, prefix, sources, targets) {
    srcArray = (sources == null ? [] : sources);
    tgtArray = (targets == null ? [] : targets);
    for (let i = 0; i < Math.max(srcArray.length, tgtArray.length); i++){
      var src, tgt;
      src = (i < srcArray.length ? srcArray[i] : "");
      tgt = (i < tgtArray.length ? tgtArray[i] : "");
      items.push(
        {
          'rowName': prefix + "[" + i + "]",
          'srcValue': src,
          'tgtValue': tgt
        }
      );
    }
  }
  
  // Set Link model IP array from node_data
  linkSetIPsFromNodeData = function(link, ifname, model_key, interfaces_ip, data_key) {
    //console.log(ifname);
    link.model().set(model_key, []); // in case all or some IPs were deleted
    // find out if we have data for this interface name
    if (interfaces_ip != null && interfaces_ip.hasOwnProperty(ifname) && interfaces_ip[ifname].hasOwnProperty(data_key)) {
      for (const [k, v] of Object.entries(interfaces_ip[ifname][data_key])) {
        ip = k + "/" + v["prefix_length"];
        //console.log(ip);
        link.model().get(model_key).push(ip);
      }
    }
  }

})(nx);
