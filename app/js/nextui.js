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
                linkInstanceClass: 'LinkWithAlignedLabels', // also: 'LinkWithAlignedLabels', 'BadgeLinkLabel'
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
                      content: [{
                          tag: 'label',
                          props: {
                              "style": "padding-right: 5px"
                          },
                          content: 'Role:',
                      }, {
                          tag: 'span',
                          content: '{#node.model.role}',
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
                        content: 'Platform:',
                    }, {
                        tag: 'span',
                        content: '{#node.model.platform}',
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
        sourceView: {
          /**
           * Get or set the source view
           * @property sourceView
           */
          get: function () {
            return this.view('source');
          },
          set: function (value) {
            if (value !== undefined && this._sourceView !== value) {
              this.view('source', value);
            }
          }
        },
        targetView: {
          /**
           * Get or set the source view
           * @property targetView
           */
          get: function () {
            return this.view('target');
          },
          set: function (value) {
            if (value !== undefined && this.targetView !== value) {
              this.view('target', value);
            }
          }
        },
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
          this.view('path').set('id', 'link_' + this.id());
          if (this.sourceView() instanceof GraphiteAlignedLabel) {
            this.sourceView().link(this);
            this.sourceView().side('source');
          }
          if (this.targetView() instanceof GraphiteAlignedLabel) {
            this.targetView().link(this);
            this.targetView().side('target');
          }
        },
        update: function() {
          this.inherited();
          var stageScale = this.stageScale();
          this.sourceView().setStyle('font-size', 12 * stageScale);
          this.targetView().setStyle('font-size', 12 * stageScale);
        },
      }
    });

    /**
     * LinkWithAlignedLabels class
     * @class LinkWithAlignedLabels
     * @extend GraphiteLink
     * @namespace nx.graphic.Topology
     * @module graphite.graphic.Topology
     *
     * Link with interface name labels aligned alongside the link
     */
    nx.define('LinkWithAlignedLabels', GraphiteLink, {
        properties: {
        },
        view: function(view) {
            view.content.push({
                name: 'source',
                type: "GraphiteAlignedLabel",
                props: {
                    'class': 'sourcelabel label-text-color-fg label-link-align-start'
                }
            }, {
                name: 'target',
                type: "GraphiteAlignedLabel",
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
                this.sourceView().update();
                this.targetView().update();
            },
            updateLabels: function() {
              this.sourceView().text(this.sourceLabel());
              this.targetView().text(this.targetLabel());
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

                    var ipLabel = this.view('source');
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

                    var ipLabel = this.view('target');
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
                this.view("source").visible(true);
                this.view("target").visible(true);
              },
              updateLabels: function() {
                var sourceLabelView = this.view('sourceText');
                var targetLabelView = this.view('targetText');
                sourceLabelView.set('text', this.sourceLabelNumber());
                targetLabelView.set('text', this.targetLabelNumber());
              },
              showIP: function () {
                var srcLabel = this.view('source');
                srcLabel.set('text', this.sourceIPv4());
                srcLabel.visible(true);
                var tgtLabel = this.view('target');
                tgtLabel.set('text', this.targetIPv4());
                tgtLabel.visible(true);
              },
              hideIP: function () {
                this.view('source').visible(false);
                this.view('target').visible(false);
              }
          }
      });

      /**
       * Label aligned with a link start or end using textPath component
       * @class GraphiteAlignedLabel
       * @extend nx.graphic.Text
       * @module nx.graphic.Topology
       * @submodule nx.graphic.Topology.Label
       * @namespace nx.graphic.Topology
       */
      nx.define("GraphiteAlignedLabel", nx.graphic.Text, {
        properties: {
          text: {
            /**
             * Set/get label text
             * @property text
             * @type {String}
             * @default ""
             * @description Set/get label text
             * @example
             * <caption>Set the label text</caption>
             * // Set the label text to "Hello"
             * label.text("Hello");
             */
            get: function () {
                return this._text !== undefined ? this._text : "";
            },
            set: function (value) {
                if (value !== undefined && this._text !== value) {
                    this._text = value;
                    var el = this.view().dom().$dom;
                    if (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                    this._textPath.textContent = this._text;
                    el.appendChild(this._textPath);
                    return true;
                } else {
                    return false;
                }
              }
          },
          side: {
            /**
             * Set/get on which side of a path the text should be rendered
             * @property side
             * @type {String}
             * @default 'source'
             * @description Possible values are 'source' and 'target'
             * @example
             * <caption>Set the side</caption>
             * // Set the side to 'target'
             * textPath.side('target');
             */
            get: function () {
                return this._side;
            },
            set: function (value) {
                if (value !== undefined && this._side !== value && (value === 'source' || value === 'target')) {
                    this._side = value;
                    if (this._side == 'source') {
                      //this.offset(10);
                      this.setStyle('text-anchor', 'start');
                      this.setStyle('alignment-baseline', 'text-before-edge');
                    } else {
                      var pathLength = this._pathElement.getTotalLength();
                      //this.offset(pathLength - 10);
                      this.setStyle('text-anchor', 'end');
                      this.setStyle('alignment-baseline', 'text-after-edge');
                    }
                    return true;
                } else {
                    return false;
                }
            }
          },
          link: {
            /**
             * Set/get link instance with which the label is associated
             * @property link
             * @type {nx.graphic.Link}
             * @default null
             * @description Set/get link instance with which the label is associated
             * @example
             * <caption>Set the link instance with which the label is associated</caption>
             * // Set the link instance to link1
             * textPath.link(link1);
             */
            get: function () {
                return this._link !== undefined ? this._link : null;
            },
            set: function (value) {
                if (value !== undefined && this._link !== value && value !== null) {
                    this._link = value;
                    this._textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#link_" + this._link.id());
                    this._pathElement = this._link.view('path').dom().$dom;
                    return true;
                } else {
                    return false;
                }
            }
          },
          offset: {
            /**
             * Set/get offset of the text along the path
             * @property offset
             * @type {Number}
             * @default ''
             * @description Set/get offset of the text along the path
             * @example
             * <caption>Set the offset of the text along the path</caption>
             * // Set the offset to 10
             * textPath.offset(10);
             */
            get: function () {
              return this._offset !== undefined ? this._offset : '';
            },
            set: function (value) {
              if (value !== undefined && value !== null && value === value) { // last check is for NaN
                this._offset = value;
                this._textPath.setAttribute("startOffset", value);
                return true;
              } else {
                return false;
              }
            }
          },
          gap: {
            /**
             * Set/get gap between the text and the path
             * @property gap
             * @type {Number}
             * @default ''
             * @description Set/get gap between the text and the path
             * @example
             * <caption>Set the gap between the text and the path</caption>
             * // Set the gap to 0.25
             * textPath.gap(0.25);
             */
            get: function () {
              return this._gap !== undefined ? this._gap : '';
            },
            set: function (value) {
              if (value !== undefined && value !== null && value === value) { // last check is for NaN
                this._gap = value;
                this.view().dom().$dom.setAttribute("dy", value);
                return true;
              } else {
                return false;
              }
            }
          },
        },
        view: {
          tag: 'svg:text'
        },
        methods: {
          init: function (args) {
            this.inherited(args);
            this._fixedOffset = 25;
            this._sourceGap = -1;
            this._targetGap = 10;
            this._text = this.view().dom();
            this._textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
            this.side('source');
            this.gap(this._sourceGap);
          },
          setModel: function (model) {
            this.inherited(model);
          },
          update: function() {
            this.inherited();
            var stageScale = 1;
            if (this._link !== undefined && this._link !== null) {
              stageScale = this.link().stageScale();
            }
            var offset = this._fixedOffset;
            var sourceGap = this._sourceGap;
            var targetGap = this._targetGap;
            if (stageScale !== undefined && stageScale !== null) {
              offset = offset * stageScale;
              sourceGap = sourceGap * stageScale;
              targetGap = targetGap * stageScale;
            }
            if (this._side == 'source') {
              this.offset(offset);
              this.gap(sourceGap);
            } else {
              var pathLength = this._pathElement.getTotalLength();
              this.offset(pathLength - offset);
              this.gap(targetGap);
            }
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
        'toggle_device_props': function () {
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
                  if (data.hasOwnProperty("nodes") && Object.keys(data.nodes).length > 0) {
                    this._update_topology_data(data);
                    // enable live label mode
                    enable_live_labels();
                    this.label_types_live(); // use live labels once we got data in
                  }
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
                    var platform = "";
                    if (node_data.hasOwnProperty("vendor")) {
                      platform = node_data["vendor"];
                    }
                    if (node_data.hasOwnProperty("model")) {
                      platform += " " + node_data["model"];
                    }
                    node.model().set('platform', platform);
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

    topology_set_name = function(name) {
      var topologyName = document.getElementById('topology-name');
      topologyName.innerHTML = name;
    };

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
      document.getElementById("nav-live").classList.remove("active");
      document.getElementById("nav-static").classList.add("active");
      app.label_types_static();
      app.device_data_autoupdate_off(); // stop pulling additional data from the devices
    };

    label_types_live = function() {
        if (app.enableLiveLabels) {
          document.getElementById("nav-static").classList.remove("active");
          document.getElementById("nav-live").classList.add("active");
          app.label_types_live();
          app.device_data_autoupdate_on(); // start pulling additional data from the devices
        }
    };

    enable_live_labels = function() {
      app.enableLiveLabels = true;
      document.getElementById("nav-labels").classList.add("m-fadeIn");
      document.getElementById("nav-static").classList.add("m-fadeIn");
      document.getElementById("nav-live").classList.add("m-fadeIn");
      document.getElementById("nav-labels").classList.remove("m-fadedOut");
      document.getElementById("nav-static").classList.remove("m-fadedOut");
      document.getElementById("nav-live").classList.remove("m-fadedOut");
    };

    alert_show = function(severity, message) {
      var alert = document.getElementById("alert-pane");
      var alertText = document.getElementById("alert-text");
      alert.className = "alert alert-" + severity;
      alertText.innerHTML = message;
      alert.classList.remove("m-fadeOut");
      alert.classList.add("m-fadeIn");
    };

    alert_hide = function() {
      var alert = document.getElementById("alert-pane");
      alert.classList.remove("m-fadeIn");
      alert.classList.add("m-fadeOut");
    };

    var dropZoneFile;

    dropzone_set_text = function(text) {
      var dropZoneText = document.getElementById('drop-zone-text');
      dropZoneText.innerHTML = text;
    };

    dropzone_set_file = function(file) {
      if (file != null) {
        if (app != null) {
          app.detach();
          dropzone_show();
        }
        var dropZone = document.getElementById('drop-zone');
        var dropZoneButton = document.getElementById('drop-form-button');
        dropZoneFile = file;
        dropzone_set_text(file.name);
        topology_set_name("Select...");
        dropZone.classList.add('active');
        dropZoneButton.classList.remove('disabled');
      }
    };

    dropzone_onclick_handler = function(ev) {
      var fileInput = document.getElementById('file-input');
      fileInput.click();
    };

    dropzone_onchange_handler = function(ev) {
      if (ev.target.files.length > 0) {
        dropzone_set_file(ev.target.files[0]);
      }
    };

    dropzone_submit_handler = function() {
      alert_hide();
      var fileInput = document.getElementById('file-input');
      if (fileInput.files.length > 0) {
        var file = fileInput.files[0];
        dropzone_set_file(file);
        dropzone_read_file();
      } else {
        // Read file from drag and drop
        dropzone_read_file();
      }
    };

    dropzone_dragover_handler = function(ev) {
      var dropZone = document.getElementById('drop-zone');
      dropZone.classList.add('highlight');
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
    };

    dropzone_dragleave_handler = function(ev) {
      var dropZone = document.getElementById('drop-zone');
      dropZone.classList.remove('highlight');
    };

    dropzone_drop_handler = function(ev) {
      var dropZone = document.getElementById('drop-zone');
      dropZone.classList.remove('highlight');
      // Prevent default behavior (Prevent file from being opened)
      ev.preventDefault();
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        if (ev.dataTransfer.items.length == 1) {
          // If dropped item aren't a file, reject them
          if (ev.dataTransfer.items[0].kind === 'file') {
            var file = ev.dataTransfer.items[0].getAsFile();
            dropzone_set_file(file);
          }
        } else {
          dropzone_set_text('You can only drop one file at a time');
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        if (ev.dataTransfer.files.length == 1) {
          var file = ev.dataTransfer.files[0];
          dropzone_set_file(file);
        } else {
          dropzone_set_text('You can only drop one file at a time');
        }
      }
      // Pass event to removeDragData for cleanup
      dropzone_cleanup(ev);
    };

    dropzone_show = function() {
      var dropZone = document.getElementById('drop-zone');
      var dropForm = document.getElementById('drop-form');
      dropZone.classList.remove("m-fadeOut");
      dropForm.classList.remove("m-fadeOut");
      dropZone.classList.add("m-fadeIn");
      dropForm.classList.add("m-fadeIn");
    };

    dropzone_hide = function() {
      var dropZone = document.getElementById('drop-zone');
      var dropForm = document.getElementById('drop-form');
      dropZone.classList.remove("m-fadeIn");
      dropForm.classList.remove("m-fadeIn");
      dropZone.classList.add("m-fadeOut");
      dropForm.classList.add("m-fadeOut");
    };

    dropzone_read_file = function() {
      if (dropZoneFile != null) {
        var reader = new FileReader();
        reader.onload = function(e) {
          dropzone_hide();
          if (!parse_json_topology(e.target.result)) {
            dropzone_show();
          }
        };
        reader.readAsText(dropZoneFile);
      }
    }

    dropzone_cleanup = function(ev) {
      if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to remove the drag data
        ev.dataTransfer.items.clear();
      } else {
        // Use DataTransfer interface to remove the drag data
        ev.dataTransfer.clearData();
      }
    };

    // Identify topology to load
    const queryString = window.location.search;
    const url_params = new URLSearchParams(queryString);
    var topo_type = "default", topo_name = "", topo_url;
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

    if (topo_name.length > 0) {
      switch (topo_type) {
        case "clab":
        case "clabdata":
          // NOTE on "clab-" prefix from https://containerlab.dev/manual/topo-def-file/#prefix
          // Even when you change the prefix, the lab directory is still uniformly named using the clab-<lab-name> pattern.
          topo_url = "/lab/clab-" + topo_name + "/topology-data.json";
          break;
        case "graphite":
          // topology data exported for graphite
          topo_url = "/lab/" + topo_name + ".graphite.json";
          break;
        default:
          topo_url = "/lab/" + topo_name;
        }
    } else {
      topo_url = "/default/default.json";
    }

    // Load topology model
    var xmlhttp = new XMLHttpRequest();
    var topologyData;
    var topologySources = {
      "clab": "Containerlab Topology",
      "netlab": "Netlab Topology",
      "netbox": "NetBox Topology",
      "graphite": "Topology",
      "unknown": "Topology"
    };

    parse_topology_data = function(topo_data) {
      switch (topo_type) {
        case "clab":
          topologyData = convert_clab_to_cmt(topo_data);
          break;
        default:
          topologyData = convert_clab_to_cmt(topo_data);
      }
      if (!topologyData.hasOwnProperty("source") || topologyData.source.length == 0) {
        if (topologyData.hasOwnProperty("type")) {
          topologyData['source'] = topologyData.type; // mostly applicable to clab which doesn't export the source field
        } else {
          topologyData['source'] = "unknown";
        }
      }
      if (topologyData.hasOwnProperty("source") && topologySources.hasOwnProperty(topologyData.source) && topologyData.hasOwnProperty("name")) {
        document.title = topologyData.name + "@" + topologyData.source + " - " + window.location.hostname;
        document.getElementById("topology-type").innerHTML = topologySources[topologyData.source];
        if (topologyData.name != "") {
          topology_set_name(topologyData.name);
        } else {
          topology_set_name(topo_name);
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
        var notice_html = '<strong>Error!</strong> There are no nodes defined in the provided topology data file.'
        if (topologyData.type == "clab") {
          // data came from containerlab topology-data.json
          notice_html = '<strong>Error!</strong> There are no nodes in the <code><a class="alert-link" href="__topo_url__">topology-data.json</a></code> exported by Containerlab. Please check a template file used for export. \
          Default template path is <code>/etc/containerlab/templates/export/auto.tmpl</code> If the file is missing or corrupted, you can replace it with <a class="alert-link" href="assets/auto.tmpl">this copy</a> and re-deploy the topology.'
        }
        notice_html = notice_html.replace("__topo_url__", topo_url);
        alert_show("warning", notice_html);
        dropzone_show();
      }
    };

    parse_json_topology = function(topo) {
      try {
        parse_topology_data(JSON.parse(topo));
        return true;
      } catch (e) {
        console.log(e);
        alert_show("warning", "<strong>Error!</strong> Failed to parse topology data: " + e.message);
        return false;
      }
    };

    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          dropzone_hide();
          if (!parse_json_topology(this.responseText)) {
            dropzone_show();
          }
        } else {
            dropzone_show();
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
