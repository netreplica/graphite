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

// Main topology parsing function (placeholder - should be implemented with actual topology rendering)
function parse_topology_data(data) {
    console.log('Parsing topology data:', data);
    
    // Basic validation
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid topology data');
    }
    
    // Check for basic topology structure
    if (!data.nodes && !data.links) {
        throw new Error('Topology must contain nodes or links');
    }
    
    // Show success message
    alert_show('Topology loaded successfully: ' + (data.name || 'Unnamed topology'));
    topology_set_name(data.name || 'Loaded topology');
    
    // TODO: Implement actual NextUI topology rendering
    // This is where the GraphiteTopology class would be instantiated
    // and the topology would be rendered to the DOM
    
    console.log('Topology data parsed successfully');
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

// Layout control functions
function autolayout() {
    console.log('Auto layout selected');
    // TODO: Implement auto layout logic
}

function horizontal() {
    console.log('Horizontal layout selected');
    // TODO: Implement horizontal layout logic
}

function vertical() {
    console.log('Vertical layout selected');
    // TODO: Implement vertical layout logic
}

function label_types_live() {
    console.log('Live labels selected');
    // TODO: Implement live label switching
}

function label_types_static() {
    console.log('Static labels selected');
    // TODO: Implement static label switching
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