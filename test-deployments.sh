#!/bin/bash

# Test script for both deployment modes
set -e

echo "🚀 Testing Graphite Dual Deployment System"
echo "=========================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Test static build
echo "📦 Testing static build..."
npm run build:static

# Check static build output
if [ -d "dist/static" ] && [ -f "dist/static/index.html" ]; then
    echo "✅ Static build successful"
    echo "   - Output: dist/static/"
    echo "   - Files: $(ls -1 dist/static/ | wc -l) items"
    
    # Check for deployment mode
    if grep -q "GRAPHITE_MODE = 'static'" dist/static/index.html; then
        echo "   - ✅ Static mode configured correctly"
    else
        echo "   - ❌ Static mode not configured properly"
    fi
else
    echo "❌ Static build failed"
    exit 1
fi

# Test Docker build  
echo "📦 Testing Docker build..."
npm run build:docker

# Check Docker build output
if [ -d "dist/docker" ] && [ -f "dist/docker/index.html" ]; then
    echo "✅ Docker build successful"
    echo "   - Output: dist/docker/"
    echo "   - Files: $(ls -1 dist/docker/ | wc -l) items"
    
    # Check for deployment mode
    if grep -q "GRAPHITE_MODE = 'docker'" dist/docker/index.html; then
        echo "   - ✅ Docker mode configured correctly"
    else
        echo "   - ❌ Docker mode not configured properly"
    fi
    
    # Check for feature modules
    if [ -d "dist/docker/js/features" ]; then
        echo "   - ✅ Feature modules included"
        echo "   - Features: $(ls -1 dist/docker/js/features/ | wc -l) modules"
    else
        echo "   - ❌ Feature modules missing"
    fi
else
    echo "❌ Docker build failed"
    exit 1
fi

# Compare builds
echo "🔍 Comparing builds..."
static_size=$(du -sh dist/static/ | cut -f1)
docker_size=$(du -sh dist/docker/ | cut -f1)

echo "   - Static build size: $static_size"
echo "   - Docker build size: $docker_size"

# Test file serving (optional)
if command -v python3 &> /dev/null; then
    echo "🌐 Testing static file serving..."
    cd dist/static
    echo "   Starting server on http://localhost:8000"
    echo "   Press Ctrl+C to stop"
    python3 -m http.server 8000
else
    echo "🌐 Python3 not available for testing static server"
    echo "   You can serve dist/static/ with any web server"
fi

echo "✅ All tests completed successfully!"
echo ""
echo "📁 Deployment ready:"
echo "   - Static website: dist/static/"
echo "   - Docker build: dist/docker/"