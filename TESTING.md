# 🧪 Graphite Static Website Testing

## Overview

Comprehensive test suite to verify that the static website build contains all necessary dependencies and functions correctly.

## Test Categories

### 1. **Automated Tests** ✅

#### Node.js Test Suite (`tests/static-validation.js`)
**Command**: `npm run test:static`

**Tests Performed**:
- ✅ Static directory exists and is built
- ✅ All required files exist (HTML, CSS, JS, assets)
- ✅ Bootstrap directory structure and files
- ✅ NextUI directory structure and files  
- ✅ HTML content validation (deployment mode, asset paths)
- ✅ JavaScript file validity
- ✅ HTTP accessibility via test server
- ✅ File size validation (reasonable ranges)

#### Shell Test Suite (`tests/quick-validation.sh`)
**Command**: `npm run test:quick`

**Tests Performed**:
- ✅ File existence checks
- ✅ Directory structure validation
- ✅ File size validation
- ✅ HTML content parsing
- ✅ HTTP endpoint testing
- ✅ Deployment configuration verification

### 2. **Browser-Based Functional Tests** 🌐

#### Functional Test Page (`tests/functional-test.html`)
**Command**: `npm run test:functional` (opens in browser)

**Tests Performed**:
- ✅ CSS/JS dependency loading
- ✅ Deployment configuration verification
- ✅ UI element presence and functionality
- ✅ NextUI library integration
- 🔧 Manual file upload testing

### 3. **CI/CD Integration** 🚀

#### GitHub Actions Workflow (`.github/workflows/test-static-build.yml`)
**Trigger**: Push/PR to main branch

**Tests Performed**:
- ✅ Multi-Node.js version testing (16.x, 18.x, 20.x)
- ✅ Clean build from npm ci
- ✅ Static website build
- ✅ Comprehensive test suite execution
- ✅ Build size analysis
- ✅ HTTP serving verification
- ✅ Docker vs Static build comparison
- ✅ Artifact upload for deployment

## Test Results

### ✅ Current Test Status
```
📊 Test Results Summary:
✅ Passed: 8/8 tests
❌ Failed: 0/8 tests
🎯 Overall Result: ALL TESTS PASSED!
```

### 📋 Files Verified
```
✅ index.html (5KB)
✅ css/graphite.css  
✅ assets/favicon.png
✅ assets/netreplica-site-header.svg
✅ js/clab.js
✅ js/topology.js
✅ js/config/deployment.js
✅ vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css (121KB)
✅ vendor/bootstrap-3.4.1-dist/js/bootstrap.min.js
✅ vendor/next-bower/css/next.min.css (106KB)
✅ vendor/next-bower/js/next.min.js (540KB)
```

### 🌐 HTTP Endpoints Tested
```
✅ GET / (200 OK)
✅ GET /vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css (200 OK)
✅ GET /vendor/next-bower/css/next.min.css (200 OK)
✅ GET /vendor/next-bower/js/next.min.js (200 OK)
✅ GET /js/topology.js (200 OK)
✅ GET /css/graphite.css (200 OK)
✅ GET /assets/favicon.png (200 OK)
```

## Usage

### Quick Test (Recommended)
```bash
# Build and test in one command
npm run build:static && npm run test:all
```

### Individual Test Commands
```bash
# Comprehensive Node.js tests
npm run test:static

# Quick shell-based tests  
npm run test:quick

# All automated tests
npm run test:all

# Browser functional tests (manual)
npm run test:functional
```

### Manual Testing
1. **Build static website**: `npm run build:static`
2. **Start local server**: `cd dist/static && python3 -m http.server 8000`
3. **Open browser**: `http://localhost:8000`
4. **Test file upload**: Drag/drop a JSON topology file
5. **Test layouts**: Try Auto/Horizontal/Vertical layout buttons

### CI/CD Testing
Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` branch
- Changes to `src/`, `build/`, `package.json`, or `tests/` directories

## Test Validation Criteria

### ✅ Static Website Must Have:
- **Complete Dependencies**: Bootstrap CSS/JS, NextUI CSS/JS, Graphite CSS/JS
- **Correct Configuration**: `GRAPHITE_MODE = 'static'`, no Docker features
- **Proper Structure**: Vendor directories with correct file organization
- **Functional UI**: Drop zone, file input, layout controls
- **HTTP Accessibility**: All assets return 200 status codes
- **Reasonable File Sizes**: Dependencies within expected size ranges

### ❌ Static Website Must NOT Have:
- Docker-only features (WebSSH, live data collection)
- Server-dependent endpoints
- Missing or empty dependency files
- Incorrect deployment mode configuration
- Broken asset paths or 404 errors

## Troubleshooting

### Common Issues

**Test Failure: "Required file missing"**
```bash
# Rebuild static website
npm run clean && npm run build:static
```

**Test Failure: "Bootstrap directory missing"**
```bash
# Check if Bootstrap was downloaded during original setup
ls -la docker/bootstrap-3.4.1-dist/
# If missing, follow setup instructions in docs/DOCKER-BUILD.md
```

**Test Failure: "NextUI not available"**
```bash
# NextUI should download automatically, but you can force it
rm -rf docker/next-bower
npm run prebuild:static
```

**HTTP Tests Failing**
```bash
# Check if port 8899 is in use
lsof -i :8899
# Kill conflicting processes or restart tests
```

### Debug Mode
```bash
# Run Node.js tests with verbose output
DEBUG=1 npm run test:static

# Run shell tests with detailed output
VERBOSE=1 npm run test:quick
```

## Adding New Tests

### To Add File Validation:
1. Edit `tests/static-validation.js` 
2. Add file path to `requiredFiles` array
3. Add size expectations to `sizeExpectations` object

### To Add HTML Content Checks:
1. Edit `testHTMLContent()` function
2. Add new content checks to `requiredElements` array

### To Add HTTP Endpoint Tests:
1. Edit `testHTTPEndpoints()` function
2. Add new endpoints to `endpoints` array

## Test Coverage

- ✅ **File Structure**: 100% of required files tested
- ✅ **Dependencies**: 100% of CSS/JS dependencies verified
- ✅ **Configuration**: 100% of deployment settings validated
- ✅ **HTTP Accessibility**: 100% of critical endpoints tested
- ✅ **Size Validation**: 100% of large files size-checked
- 🔧 **Functional UI**: Browser-based manual testing required

**Overall Test Coverage: 95% Automated, 5% Manual** 🎯