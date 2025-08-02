#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Download dependencies for static build
 * This script downloads NextUI and ensures Bootstrap is available
 */

const dockerDir = path.resolve(__dirname, '../docker');
const nextBowerDir = path.join(dockerDir, 'next-bower');
const bootstrapDir = path.join(dockerDir, 'bootstrap-3.4.1-dist');

console.log('📦 Downloading dependencies for static build...');

// Check and download NextUI
if (!fs.existsSync(nextBowerDir)) {
    console.log('📥 Downloading NextUI (next-bower)...');
    try {
        execSync('git clone --single-branch https://github.com/netreplica/next-bower.git ' + nextBowerDir, {
            stdio: 'inherit'
        });
        console.log('✅ NextUI downloaded successfully');
    } catch (error) {
        console.error('❌ Failed to download NextUI:', error.message);
        process.exit(1);
    }
} else {
    console.log('✅ NextUI already available');
}

// Check Bootstrap
if (!fs.existsSync(bootstrapDir)) {
    console.log('❌ Bootstrap not found at:', bootstrapDir);
    console.log('Please ensure Bootstrap is available or run the original build setup.');
    console.log('See docs/DOCKER-BUILD.md for instructions.');
    process.exit(1);
} else {
    console.log('✅ Bootstrap available');
}

// Verify required files exist
const requiredFiles = [
    path.join(nextBowerDir, 'js/next.min.js'),
    path.join(nextBowerDir, 'css/next.min.css'),
    path.join(bootstrapDir, 'css/bootstrap.min.css'),
    path.join(bootstrapDir, 'js/bootstrap.min.js')
];

let allFilesExist = true;
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.log('❌ Missing required file:', file);
        allFilesExist = false;
    }
}

if (!allFilesExist) {
    console.log('❌ Some required dependencies are missing');
    process.exit(1);
}

console.log('✅ All dependencies ready for static build');