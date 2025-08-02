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
 * Deployment configuration for Graphite
 * Determines which features are available based on deployment mode
 */

// Detect deployment mode from global variable or default to static
const DEPLOYMENT_MODE = window.GRAPHITE_MODE || 'static';

const DEPLOYMENT_CONFIG = {
  mode: DEPLOYMENT_MODE,
  
  features: {
    // WebSSH terminal access - only available in Docker mode
    webssh: DEPLOYMENT_MODE === 'docker',
    
    // Live device data collection - only available in Docker mode  
    liveData: DEPLOYMENT_MODE === 'docker',
    
    // Device data auto-refresh - only available in Docker mode
    autoUpdate: DEPLOYMENT_MODE === 'docker',
    
    // File upload via drag-and-drop - available in both modes
    fileUpload: true,
    
    // Static topology visualization - available in both modes
    staticVisualization: true
  },
  
  paths: {
    // Asset paths differ between deployment modes
    assets: DEPLOYMENT_MODE === 'docker' ? '/' : './',
    nextui: DEPLOYMENT_MODE === 'docker' ? '/next-bower/' : './vendor/next-bower/',
    bootstrap: DEPLOYMENT_MODE === 'docker' ? '/bootstrap-3.4.1-dist/' : './vendor/bootstrap-3.4.1-dist/'
  },
  
  endpoints: {
    // API endpoints - only available in Docker mode
    deviceData: DEPLOYMENT_MODE === 'docker' ? '/collect/clab/' : null,
    webssh: DEPLOYMENT_MODE === 'docker' ? '/ssh/host/' : null
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEPLOYMENT_CONFIG;
} else {
  window.DEPLOYMENT_CONFIG = DEPLOYMENT_CONFIG;
}