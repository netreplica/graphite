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
 * Core Graphite Topology Module
 * Main topology class with feature integration
 */

(function (nx) {
    'use strict';

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
                this.autoUpdateTimer = null;
            },

            // Device data fetching - delegates to feature module if available
            fetch_device_data: function() {
                if (window.GraphiteLiveData && window.GraphiteLiveData.isEnabled) {
                    const topologyName = this.cmt ? this.cmt.name : '';
                    
                    window.GraphiteLiveData.fetchDeviceData(topologyName)
                        .then(data => {
                            if (data.hasOwnProperty("nodes") && Object.keys(data.nodes).length > 0) {
                                window.GraphiteLiveData.updateTopologyData(this.topology, data);
                                // Enable live label mode
                                if (typeof enable_live_labels === 'function') {
                                    enable_live_labels();
                                }
                                this.label_types_live();
                            }
                        })
                        .catch(error => {
                            console.error('There has been a problem with fetch_device_data:', error);
                            this.label_types_static();
                        });
                } else {
                    console.log('Live data feature not available in this deployment mode');
                    this.label_types_static();
                }
            },

            // Auto-update functionality - only available with live data
            device_data_autoupdate_on: async function(delay = 10) {
                if (window.GraphiteLiveData && window.GraphiteLiveData.isEnabled) {
                    await this.fetch_device_data();
                    this.autoUpdateTimer = setTimeout(() => this.device_data_autoupdate_on(), delay * 1000);
                }
            },

            device_data_autoupdate_off: function() {
                if (this.autoUpdateTimer) {
                    clearTimeout(this.autoUpdateTimer);
                    this.autoUpdateTimer = null;
                }
            },

            device_data_autoupdate_toggle: function() {
                if (this.autoUpdateTimer) {
                    this.device_data_autoupdate_off();
                } else {
                    this.device_data_autoupdate_on();
                }
            },

            // Label type switching
            label_types_static: function() {
                this.labelType('static');
            },

            label_types_live: function() {
                // Only switch to live mode if live data is available
                if (window.GraphiteLiveData && window.GraphiteLiveData.isEnabled) {
                    this.labelType('live');
                } else {
                    this.labelType('static');
                }
            }
        }
    });

})(nx);