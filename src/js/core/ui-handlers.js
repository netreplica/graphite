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
 * UI Handler Functions for Graphite
 * Contains drag-and-drop, file upload, and UI interaction handlers
 */

// Global variables for file handling
var dropZoneFile = null;
var app = null;

// Alert functions
function alert_hide() {
    var alertPane = document.getElementById('alert-pane');
    if (alertPane) {
        alertPane.classList.add('m-fadeOut');
        alertPane.classList.remove('m-fadeIn');
    }
}

function alert_show(message) {
    var alertPane = document.getElementById('alert-pane');
    var alertText = document.getElementById('alert-text');
    if (alertPane && alertText) {
        alertText.innerHTML = message;
        alertPane.classList.remove('m-fadeOut');
        alertPane.classList.add('m-fadeIn');
    }
}

// Topology name functions
function topology_set_name(name) {
    var topologyName = document.getElementById('topology-name');
    if (topologyName) {
        topologyName.innerHTML = name;
    }
}

// Dropzone utility functions
function dropzone_set_text(text) {
    var dropZoneText = document.getElementById('drop-zone-text');
    if (dropZoneText) {
        dropZoneText.innerHTML = text;
    }
}

function dropzone_set_file(file) {
    if (file != null) {
        if (app != null) {
            app.detach();
            dropzone_show();
        }
        dropZoneFile = file;
        var dropZone = document.getElementById('drop-zone');
        var dropZoneButton = document.getElementById('drop-form-button');
        dropzone_set_text(file.name);
        topology_set_name("Select...");
        if (dropZone) dropZone.classList.add('active');
        if (dropZoneButton) dropZoneButton.classList.remove('disabled');
    }
}

function dropzone_show() {
    var dropZone = document.getElementById('drop-zone');
    var dropForm = document.getElementById('drop-form');
    if (dropZone) {
        dropZone.classList.remove("m-fadeOut");
        dropZone.classList.add("m-fadeIn");
    }
    if (dropForm) {
        dropForm.classList.remove("m-fadeOut");
        dropForm.classList.add("m-fadeIn");
    }
}

function dropzone_hide() {
    var dropZone = document.getElementById('drop-zone');
    var dropForm = document.getElementById('drop-form');
    if (dropZone) {
        dropZone.classList.remove("m-fadeIn");
        dropZone.classList.add("m-fadeOut");
    }
    if (dropForm) {
        dropForm.classList.remove("m-fadeIn");
        dropForm.classList.add("m-fadeOut");
    }
}

function dropzone_cleanup(ev) {
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to remove the drag data
        ev.dataTransfer.items.clear();
    } else {
        // Use DataTransfer interface to remove the drag data
        ev.dataTransfer.clearData();
    }
}

// File reading and parsing
function dropzone_read_file() {
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

function parse_json_topology(topo) {
    try {
        parse_topology_data(JSON.parse(topo));
        return true;
    } catch (e) {
        console.log('Error parsing JSON topology:', e);
        alert_show('Error parsing topology file: ' + e.message);
        return false;
    }
}

// Main topology parsing function - renders topology using TopologyApp
function parse_topology_data(topo_data) {
    console.log('Parsing topology data:', topo_data);
    
    // Basic validation
    if (!topo_data || typeof topo_data !== 'object') {
        throw new Error('Invalid topology data');
    }
    
    // Convert topology data to CMT format if needed
    var topologyData;
    if (typeof convert_clab_to_cmt === 'function') {
        topologyData = convert_clab_to_cmt(topo_data);
    } else {
        // Fallback: assume data is already in correct format
        topologyData = topo_data;
    }
    
    // Ensure we have the required structure
    if (!topologyData.nodes && !topologyData.links) {
        throw new Error('Topology must contain nodes or links');
    }
    
    // Set defaults if missing
    if (!topologyData.hasOwnProperty("source") || topologyData.source.length == 0) {
        if (topologyData.hasOwnProperty("type")) {
            topologyData['source'] = topologyData.type;
        } else {
            topologyData['source'] = "unknown";
        }
    }
    
    // Update UI elements
    var topologySources = {
        "clab": "Containerlab Topology",
        "netlab": "Netlab Topology", 
        "netbox": "NetBox Topology",
        "graphite": "Topology",
        "test": "Test Topology",
        "unknown": "Topology"
    };
    
    if (topologyData.hasOwnProperty("source") && topologySources.hasOwnProperty(topologyData.source)) {
        var topologyTypeElement = document.getElementById("topology-type");
        if (topologyTypeElement) {
            topologyTypeElement.innerHTML = topologySources[topologyData.source];
        }
        
        if (topologyData.name && topologyData.name != "") {
            topology_set_name(topologyData.name);
        }
    }
    
    // Check if we have nodes to render
    var nodeCount = 0;
    if (topologyData.nodes) {
        if (Array.isArray(topologyData.nodes)) {
            nodeCount = topologyData.nodes.length;
        } else if (typeof topologyData.nodes === 'object') {
            nodeCount = Object.keys(topologyData.nodes).length;
        }
    }
    
    if (nodeCount > 0) {
        // Check if NextUI is available
        if (typeof nx === 'undefined') {
            throw new Error('NextUI library (nx) is not loaded. Cannot render topology.');
        }
        
        // Check if TopologyApp is available
        if (typeof TopologyApp === 'undefined') {
            throw new Error('TopologyApp class is not available. Check topology-app.js loading.');
        }
        
        console.log('🚀 Starting topology rendering with', nodeCount, 'nodes...');
        console.log('📊 Topology data:', topologyData);
        
        // Initialize TopologyApp and render topology
        if (app) {
            console.log('🔄 Detaching existing topology app...');
            app.detach();
            // Remove topology-active class from container
            var existingContainer = document.getElementById('topology-container');
            if (existingContainer) {
                existingContainer.classList.remove('topology-active');
            }
        }
        
        try {
            console.log('🏗️ Creating new TopologyApp instance...');
            app = new TopologyApp();
            
            var container = document.getElementById('topology-container');
            if (!container) {
                throw new Error('topology-container element not found in DOM');
            }
            
            console.log('📦 Setting container and initializing with CMT data...');
            app.container(container);
            app.init_with_cmt(topologyData);
            
            console.log('🎨 Attaching topology to DOM...');
            app.attach();
            
            // Mark container as having active topology for CSS styling
            container.classList.add('topology-active');
            
            console.log('⚙️ Initializing with static labels...');
            app.device_data_autoupdate_on(); // Initialize with static labels
            
            // Initialize button states for new topology
            update_layout_buttons('auto'); // Default to auto layout
            update_label_buttons('static'); // Default to static labels
            
            // Show success message
            alert_show('Topology loaded successfully: ' + (topologyData.name || 'Unnamed topology'));
            console.log('✅ Topology rendered successfully with', nodeCount, 'nodes');
        } catch (renderError) {
            console.error('❌ Topology rendering failed:', renderError);
            throw new Error('Failed to render topology: ' + renderError.message);
        }
    } else {
        throw new Error('No nodes found in topology data');
    }
    
    return true;
}

// Event handlers for drag and drop
function dropzone_onclick_handler(ev) {
    var fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.click();
    }
}

function dropzone_onchange_handler(ev) {
    if (ev.target.files && ev.target.files.length > 0) {
        dropzone_set_file(ev.target.files[0]);
    }
}

function dropzone_submit_handler() {
    alert_hide();
    var fileInput = document.getElementById('file-input');
    if (fileInput && fileInput.files.length > 0) {
        var file = fileInput.files[0];
        dropzone_set_file(file);
        dropzone_read_file();
    } else {
        // Read file from drag and drop
        dropzone_read_file();
    }
}

function dropzone_dragover_handler(ev) {
    var dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.classList.add('highlight');
    }
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}

function dropzone_dragleave_handler(ev) {
    var dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.classList.remove('highlight');
    }
}

function dropzone_drop_handler(ev) {
    var dropZone = document.getElementById('drop-zone');
    if (dropZone) {
        dropZone.classList.remove('highlight');
    }
    
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        if (ev.dataTransfer.items.length == 1) {
            // If dropped item isn't a file, reject it
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
    
    // Pass event to cleanup function
    dropzone_cleanup(ev);
}

// Layout button state management
function update_layout_buttons(activeLayout) {
    // Remove active class from all layout buttons
    var layoutButtons = ['nav-auto', 'nav-horizontal', 'nav-vertical'];
    layoutButtons.forEach(function(buttonId) {
        var button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('active');
        }
    });
    
    // Add active class to the selected layout button
    var activeButton = document.getElementById('nav-' + activeLayout);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// Layout control functions
function autolayout() {
    console.log('Auto layout selected');
    update_layout_buttons('auto');
    if (app && app.layout_auto) {
        app.layout_auto();
    }
}

function horizontal() {
    console.log('Horizontal layout selected');
    update_layout_buttons('horizontal');
    if (app && app.layout_horizontal) {
        app.layout_horizontal();
    }
}

function vertical() {
    console.log('Vertical layout selected');
    update_layout_buttons('vertical');
    if (app && app.layout_vertical) {
        app.layout_vertical();
    }
}

// Label button state management
function update_label_buttons(activeLabel) {
    // Remove active class from all label buttons
    var labelButtons = ['nav-static', 'nav-live'];
    labelButtons.forEach(function(buttonId) {
        var button = document.getElementById(buttonId);
        if (button) {
            button.classList.remove('active');
        }
    });
    
    // Add active class to the selected label button
    var activeButton = document.getElementById('nav-' + activeLabel);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function label_types_live() {
    console.log('Live labels selected');
    update_label_buttons('live');
    if (app && app.label_types_live) {
        app.label_types_live();
    }
}

function label_types_static() {
    console.log('Static labels selected');
    update_label_buttons('static');
    if (app && app.label_types_static) {
        app.label_types_static();
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Graphite UI initialized');
    
    // Show dropzone by default
    dropzone_show();
    
    // Set initial state
    topology_set_name('Select...');
    alert_hide();
});