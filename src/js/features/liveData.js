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
 * Live Data Feature Module
 * Handles fetching live device data from containerlab backend
 * Only available in Docker deployment mode
 */

(function() {
  'use strict';

  // Check if live data feature is enabled
  if (!window.DEPLOYMENT_CONFIG || !window.DEPLOYMENT_CONFIG.features.liveData) {
    console.log('Live data feature disabled for this deployment mode');
    return;
  }

  /**
   * Fetch device data from the backend
   * @param {string} topologyName - Name of the topology
   * @returns {Promise} Promise that resolves with device data
   */
  function fetchDeviceData(topologyName) {
    if (!window.DEPLOYMENT_CONFIG.endpoints.deviceData) {
      return Promise.reject(new Error('Device data endpoint not available'));
    }

    const topo_url = window.DEPLOYMENT_CONFIG.endpoints.deviceData + topologyName + "/nodes/" + '?nocache=' + (new Date()).getTime();

    return fetch(topo_url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Server response was not OK');
        }
        return response.json();
      });
  }

  /**
   * Update topology with live device data
   * @param {Object} topology - NextUI topology instance
   * @param {Object} data - Device data from backend
   */
  function updateTopologyData(topology, data) {
    if (typeof data === 'undefined' || !data.hasOwnProperty("nodes")) {
      return;
    }

    // Go through fetched nodes' array
    nx.each(topology.getNodes(), function (node) {
      const n = node.model().get('name');
      const fn = node.model().get('fullname'); // this name is supposed to be unique for the topology

      if (data.nodes.hasOwnProperty(fn)) {
        const node_data = data.nodes[fn];
        
        if (node_data.hasOwnProperty("hostname")) {
          node.model().set('hostname', node_data["hostname"]);
        }
        
        if (node_data.hasOwnProperty("mgmt_ipv4")) {
          node.model().set('mgmt_ipv4', node_data["mgmt_ipv4"]);
        }
        
        if (node_data.hasOwnProperty("mgmt_ipv6")) {
          node.model().set('mgmt_ipv6', node_data["mgmt_ipv6"]);
        }
        
        // Additional live data fields can be added here
      }
    });
  }

  // Export functions to global scope for use by main topology code
  window.GraphiteLiveData = {
    fetchDeviceData: fetchDeviceData,
    updateTopologyData: updateTopologyData,
    isEnabled: true
  };

})();