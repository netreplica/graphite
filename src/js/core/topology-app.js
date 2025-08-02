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

/**
 * Topology Application Components
 * Contains TopologyApp, TopologyContainer and related classes for rendering topologies
 */

(function (nx) {
    'use strict';

    // TopologyContainer - Main container for topology rendering
    nx.define('TopologyContainer', nx.ui.Component, {
        properties: {
            topology: {
                get: function () {
                    return this.view('topology');
                }
            }
        },
        view: {
            content: [
                {
                    name: 'topology',
                    type: 'nx.graphic.Topology',
                    props: {
                        adaptive: true,
                        showIcon: true,
                        identityKey: 'id',
                        height: 700,
                        dataProcessor: 'force',
                        enableSmartLabel: true,
                        enableGradualScaling: true,
                        nodeConfig: {
                            label: 'model.label',
                            iconType: 'model.icon'
                        },
                        nodeSetConfig: {
                            label: 'model.name',
                            iconType: 'model.iconType'
                        },
                        supportMultipleLink: true,
                        linkConfig: {
                            linkType: 'curve'
                        }
                    }
                }
            ]
        }
    });

    // TODO: Custom node and link classes - temporarily disabled to fix inheritance issues
    // These will be re-enabled once basic topology rendering is working
    
    /*
    // AnnotatedNode - Custom node class with status and property badges
    nx.define('AnnotatedNode', nx.graphic.Topology.Node, {
        // ... custom node implementation
    });

    // LinkWithAlignedLabels - Custom link class with aligned labels  
    nx.define('LinkWithAlignedLabels', nx.graphic.Topology.Link, {
        // ... custom link implementation
    });

    // Tooltip classes
    nx.define('GraphiteNodeTooltipContent', nx.ui.Component, {
        // ... tooltip implementation
    });
    */

    // TopologyApp - Main application class
    nx.define('TopologyApp', nx.ui.Application, {
        properties: {
            cmt: {},
            topologyContainer: {},
            topology: {},
            linkInstanceClass: '',
            currentLayout: 'auto',
            currentLabelType: 'static',
            devicePropertiesShown: false,
            autoUpdateTimer: {}
        },
        methods: {
            init_with_cmt: function (cmt) {
                this.cmt = cmt;
                this.topologyContainer = new TopologyContainer();
                this.topology = this.topologyContainer.topology();

                // Read topology data from variable  
                this.topology.data(cmt);
                this.linkInstanceClass = this.topology.linkInstanceClass ? this.topology.linkInstanceClass() : 'default';
                this.devicePropertiesShown = false;
            },

            attach: function () {
                this.topology.attach(this);
            },

            detach: function () {
                this.topology.detach(this);
            },

            layout_auto: function() {
                console.log('Auto layout selected');
                this.currentLayout = 'auto';
                if (this.topology && this.topology.activateLayout) {
                    this.detach();
                    this.topology.activateLayout('force');
                    this.attach();
                }
            },

            layout_horizontal: function () {
                console.log('Horizontal layout selected');
                if (this.currentLayout === 'vertical') {
                    return;
                }
                this.currentLayout = 'vertical';
                if (this.topology && this.topology.getLayout && this.topology.activateLayout) {
                    var layout = this.topology.getLayout('hierarchicalLayout');
                    if (layout) {
                        layout.direction('vertical');
                        layout.levelBy(function(node, model) {
                            return model.get('layerSortPreference') || 1;
                        });
                        this.topology.activateLayout('hierarchicalLayout');
                    }
                }
            },

            layout_vertical: function () {
                console.log('Vertical layout selected');
                if (this.currentLayout === 'horizontal') {
                    return;
                }
                this.currentLayout = 'horizontal';
                if (this.topology && this.topology.getLayout && this.topology.activateLayout) {
                    var layout = this.topology.getLayout('hierarchicalLayout');
                    if (layout) {
                        layout.direction('horizontal');
                        layout.levelBy(function(node, model) {
                            return model.get('layerSortPreference') || 1;
                        });
                        this.topology.activateLayout('hierarchicalLayout');
                    }
                }
            },

            label_types_static: function() {
                console.log('Static labels selected');
                this.currentLabelType = 'static';
                // TODO: Implement label switching once custom nodes are working
            },

            label_types_live: function() {
                console.log('Live labels selected');  
                this.currentLabelType = 'live';
                // TODO: Implement label switching once custom nodes are working
            },

            // Auto-update functionality (simplified for static mode)
            device_data_autoupdate_on: function(delay) {
                // In static mode, just enable static labels
                this.label_types_static();
            },

            device_data_autoupdate_off: function() {
                if (this.autoUpdateTimer) {
                    clearTimeout(this.autoUpdateTimer);
                    this.autoUpdateTimer = null;
                }
            }
        }
    });

})(nx);