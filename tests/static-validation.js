#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

/**
 * Comprehensive test suite for static website validation
 * Tests all dependencies, file structure, and basic functionality
 */

class StaticWebsiteValidator {
    constructor(staticDir = 'dist/static') {
        this.staticDir = path.resolve(staticDir);
        this.testResults = [];
        this.server = null;
        this.port = 8899; // Use non-standard port for testing
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp.slice(11, 19)}] ${message}`);
    }

    async runTest(testName, testFn) {
        try {
            this.log(`Testing: ${testName}`);
            await testFn();
            this.testResults.push({ name: testName, status: 'PASS' });
            this.log(`PASS: ${testName}`, 'success');
        } catch (error) {
            this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
            this.log(`FAIL: ${testName} - ${error.message}`, 'error');
        }
    }

    // Test 1: Verify static directory exists and is built
    async testStaticDirectoryExists() {
        if (!fs.existsSync(this.staticDir)) {
            throw new Error(`Static directory not found: ${this.staticDir}`);
        }
        
        const stats = fs.statSync(this.staticDir);
        if (!stats.isDirectory()) {
            throw new Error(`Static path is not a directory: ${this.staticDir}`);
        }
    }

    // Test 2: Verify all required files exist
    async testRequiredFilesExist() {
        const requiredFiles = [
            'index.html',
            'css/graphite.css',
            'assets/favicon.png',
            'assets/netreplica-site-header.svg',
            'js/clab.js',
            'js/topology.js',
            'js/config/deployment.js',
            'vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css',
            'vendor/bootstrap-3.4.1-dist/js/bootstrap.min.js',
            'vendor/next-bower/css/next.min.css',
            'vendor/next-bower/js/next.min.js'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.staticDir, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Required file missing: ${file}`);
            }

            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
                throw new Error(`Required file is empty: ${file}`);
            }
        }
    }

    // Test 3: Verify Bootstrap directory structure
    async testBootstrapStructure() {
        const bootstrapDir = path.join(this.staticDir, 'vendor/bootstrap-3.4.1-dist');
        
        const requiredDirs = ['css', 'js', 'fonts'];
        for (const dir of requiredDirs) {
            const dirPath = path.join(bootstrapDir, dir);
            if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
                throw new Error(`Bootstrap directory missing: ${dir}`);
            }
        }

        // Check for specific Bootstrap files
        const bootstrapFiles = [
            'css/bootstrap.min.css',
            'css/bootstrap.css',
            'js/bootstrap.min.js',
            'fonts/glyphicons-halflings-regular.woff'
        ];

        for (const file of bootstrapFiles) {
            const filePath = path.join(bootstrapDir, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`Bootstrap file missing: ${file}`);
            }
        }
    }

    // Test 4: Verify NextUI structure and files
    async testNextUIStructure() {
        const nextuiDir = path.join(this.staticDir, 'vendor/next-bower');
        
        const requiredDirs = ['css', 'js'];
        for (const dir of requiredDirs) {
            const dirPath = path.join(nextuiDir, dir);
            if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
                throw new Error(`NextUI directory missing: ${dir}`);
            }
        }

        // Check for specific NextUI files
        const nextuiFiles = [
            'css/next.min.css',
            'css/next.css', 
            'js/next.min.js',
            'js/next.js'
        ];

        for (const file of nextuiFiles) {
            const filePath = path.join(nextuiDir, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`NextUI file missing: ${file}`);
            }
        }
    }

    // Test 5: Verify HTML content and configuration
    async testHTMLContent() {
        const indexPath = path.join(this.staticDir, 'index.html');
        const htmlContent = fs.readFileSync(indexPath, 'utf8');

        // Check for required HTML elements
        const requiredElements = [
            '<title>Graphite</title>',
            'id="topology-diagram"',
            'id="drop-zone"',
            'onclick="dropzone_onclick_handler(event);"',
            'accept=".json"'
        ];

        for (const element of requiredElements) {
            if (!htmlContent.includes(element)) {
                throw new Error(`HTML missing required element: ${element}`);
            }
        }

        // Check for static deployment mode
        if (!htmlContent.includes("window.GRAPHITE_MODE = 'static'")) {
            throw new Error('HTML not configured for static deployment mode');
        }

        // Check for correct asset paths
        const staticPaths = [
            './vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css',
            './vendor/next-bower/css/next.min.css',
            './vendor/next-bower/js/next.min.js'
        ];

        for (const assetPath of staticPaths) {
            if (!htmlContent.includes(assetPath)) {
                throw new Error(`HTML missing correct asset path: ${assetPath}`);
            }
        }

        // Verify no Docker-only features are loaded
        if (htmlContent.includes('js/features/liveData.js') || 
            htmlContent.includes('js/features/webssh.js')) {
            throw new Error('HTML incorrectly includes Docker-only features');
        }
    }

    // Test 6: Verify JavaScript files are valid
    async testJavaScriptValidity() {
        const jsFiles = [
            'js/clab.js',
            'js/topology.js',
            'js/config/deployment.js'
        ];

        for (const jsFile of jsFiles) {
            const filePath = path.join(this.staticDir, jsFile);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Basic syntax check - look for obvious issues
            if (content.includes('undefined') && content.includes('function')) {
                // This is a basic check - in a real scenario you'd use a JS parser
                continue;
            }
            
            if (content.trim().length === 0) {
                throw new Error(`JavaScript file is empty: ${jsFile}`);
            }
        }

        // Check deployment config specifically
        const deploymentPath = path.join(this.staticDir, 'js/config/deployment.js');
        const deploymentContent = fs.readFileSync(deploymentPath, 'utf8');
        
        if (!deploymentContent.includes('DEPLOYMENT_CONFIG')) {
            throw new Error('Deployment configuration missing DEPLOYMENT_CONFIG');
        }
    }

    // Test 7: Start HTTP server and test accessibility
    async testHTTPAccessibility() {
        return new Promise((resolve, reject) => {
            const handler = (req, res) => {
                const filePath = path.join(this.staticDir, req.url === '/' ? 'index.html' : req.url);
                
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    const ext = path.extname(filePath);
                    const contentTypes = {
                        '.html': 'text/html',
                        '.css': 'text/css', 
                        '.js': 'application/javascript',
                        '.png': 'image/png',
                        '.svg': 'image/svg+xml'
                    };
                    
                    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
                    res.end(fs.readFileSync(filePath));
                } else {
                    res.writeHead(404);
                    res.end('Not Found');
                }
            };

            this.server = http.createServer(handler);
            
            this.server.listen(this.port, () => {
                // Test key endpoints
                this.testHTTPEndpoints()
                    .then(() => {
                        this.server.close();
                        resolve();
                    })
                    .catch(reject);
            });
        });
    }

    async testHTTPEndpoints() {
        const endpoints = [
            '/',
            '/vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css',
            '/vendor/next-bower/css/next.min.css',
            '/vendor/next-bower/js/next.min.js',
            '/js/topology.js',
            '/css/graphite.css',
            '/assets/favicon.png'
        ];

        for (const endpoint of endpoints) {
            const response = await this.makeHTTPRequest(endpoint);
            if (response.statusCode !== 200) {
                throw new Error(`HTTP ${response.statusCode} for endpoint: ${endpoint}`);
            }
        }
    }

    makeHTTPRequest(path) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: this.port,
                path: path,
                method: 'GET'
            };

            const req = http.request(options, (res) => {
                resolve({ statusCode: res.statusCode });
            });

            req.on('error', reject);
            req.setTimeout(5000, () => reject(new Error('Request timeout')));
            req.end();
        });
    }

    // Test 8: Verify file sizes are reasonable
    async testFileSizes() {
        const sizeExpectations = {
            'vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css': { min: 100000, max: 200000 }, // ~121KB
            'vendor/next-bower/css/next.min.css': { min: 90000, max: 150000 }, // ~106KB  
            'vendor/next-bower/js/next.min.js': { min: 500000, max: 600000 }, // ~540KB
            'js/topology.js': { min: 1000, max: 5000 }, // ~1.6KB
            'index.html': { min: 4000, max: 10000 } // ~5KB
        };

        for (const [file, { min, max }] of Object.entries(sizeExpectations)) {
            const filePath = path.join(this.staticDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.size < min || stats.size > max) {
                throw new Error(`File size out of expected range: ${file} (${stats.size} bytes, expected ${min}-${max})`);
            }
        }
    }

    // Main test runner
    async runAllTests() {
        this.log('🚀 Starting Static Website Validation Tests');
        this.log(`📁 Testing directory: ${this.staticDir}`);

        const tests = [
            { name: 'Static Directory Exists', fn: () => this.testStaticDirectoryExists() },
            { name: 'Required Files Exist', fn: () => this.testRequiredFilesExist() },
            { name: 'Bootstrap Structure', fn: () => this.testBootstrapStructure() },
            { name: 'NextUI Structure', fn: () => this.testNextUIStructure() },
            { name: 'HTML Content Validation', fn: () => this.testHTMLContent() },
            { name: 'JavaScript Validity', fn: () => this.testJavaScriptValidity() },
            { name: 'HTTP Accessibility', fn: () => this.testHTTPAccessibility() },
            { name: 'File Size Validation', fn: () => this.testFileSizes() }
        ];

        for (const test of tests) {
            await this.runTest(test.name, test.fn);
        }

        this.printResults();
        return this.testResults.every(result => result.status === 'PASS');
    }

    printResults() {
        this.log('\n📊 Test Results Summary:');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        this.log(`✅ Passed: ${passed}`);
        this.log(`❌ Failed: ${failed}`);
        
        if (failed > 0) {
            this.log('\n❌ Failed Tests:');
            this.testResults
                .filter(r => r.status === 'FAIL')
                .forEach(result => {
                    this.log(`  • ${result.name}: ${result.error}`, 'error');
                });
        }
        
        this.log(`\n🎯 Overall Result: ${failed === 0 ? 'ALL TESTS PASSED! ✅' : 'SOME TESTS FAILED ❌'}`);
    }
}

// CLI execution
if (require.main === module) {
    const validator = new StaticWebsiteValidator();
    
    validator.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = StaticWebsiteValidator;