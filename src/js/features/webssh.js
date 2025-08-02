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
 * WebSSH Feature Module
 * Handles SSH terminal connections to network devices
 * Only available in Docker deployment mode
 */

(function() {
  'use strict';

  // Check if WebSSH feature is enabled
  if (!window.DEPLOYMENT_CONFIG || !window.DEPLOYMENT_CONFIG.features.webssh) {
    console.log('WebSSH feature disabled for this deployment mode');
    return;
  }

  /**
   * Generate WebSSH device link for IPv4
   * @param {string} nodeName - Name of the device
   * @param {string} address - IPv4 address
   * @param {number} index - Window offset index
   * @returns {string} JavaScript code to open WebSSH window
   */
  function getWebsshDeviceLink(nodeName, address, index) {
    if (!address || address === "") {
      return "";
    }

    const w = 800;
    const h = 600;
    const offset = index * 25;
    const l_off = (window.screenX + window.outerWidth) - w / 2 + offset;
    const t_off = window.screenY + offset;
    
    return `window.open('${window.DEPLOYMENT_CONFIG.endpoints.webssh}${address}?header=${nodeName}&headerBackground=blue', 'webssh.${nodeName}','width=${w},height=${h},left=${l_off},top=${t_off}'); return false;`;
  }

  /**
   * Generate WebSSH device link for IPv6
   * @param {string} nodeName - Name of the device
   * @param {string} address - IPv6 address
   * @param {number} index - Window offset index
   * @returns {string} JavaScript code to open WebSSH window
   */
  function getWebsshDeviceLinkIPv6(nodeName, address, index) {
    if (!address || address === "") {
      return "";
    }

    const w = 800;
    const h = 600;
    const offset = index * 25;
    const l_off = (window.screenX + window.outerWidth) - w / 2 + offset;
    const t_off = window.screenY + offset;
    
    // IPv6 addresses need to be enclosed in brackets for URLs
    const ipv6_addr = address.includes('[') ? address : `[${address}]`;
    
    return `window.open('${window.DEPLOYMENT_CONFIG.endpoints.webssh}${ipv6_addr}?header=${nodeName}&headerBackground=blue', 'webssh.${nodeName}','width=${w},height=${h},left=${l_off},top=${t_off}'); return false;`;
  }

  // Export functions to global scope for use by main topology code
  window.GraphiteWebSSH = {
    getWebsshDeviceLink: getWebsshDeviceLink,
    getWebsshDeviceLinkIPv6: getWebsshDeviceLinkIPv6,
    isEnabled: true
  };

})();