#!/bin/bash

# Quick validation script for static website
# Tests file existence, sizes, and basic HTTP accessibility

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"
STATIC_DIR="$PROJECT_DIR/dist/static"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
}

test_file_exists() {
    local file="$1"
    local description="$2"
    ((TESTS_RUN++))
    
    if [ -f "$STATIC_DIR/$file" ]; then
        local size=$(stat -f%z "$STATIC_DIR/$file" 2>/dev/null || stat -c%s "$STATIC_DIR/$file" 2>/dev/null)
        pass "$description exists (${size} bytes)"
        return 0
    else
        fail "$description missing: $file"
        return 1
    fi
}

test_directory_exists() {
    local dir="$1"
    local description="$2"
    ((TESTS_RUN++))
    
    if [ -d "$STATIC_DIR/$dir" ]; then
        local count=$(find "$STATIC_DIR/$dir" -type f | wc -l | xargs)
        pass "$description exists ($count files)"
        return 0
    else
        fail "$description missing: $dir"
        return 1
    fi
}

test_http_endpoint() {
    local endpoint="$1"  
    local description="$2"
    local port="$3"
    ((TESTS_RUN++))
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port$endpoint" 2>/dev/null || echo "000")
    
    if [ "$status_code" = "200" ]; then
        pass "$description accessible (HTTP $status_code)"
        return 0
    else
        fail "$description not accessible (HTTP $status_code): $endpoint"
        return 1
    fi
}

main() {
    log "🚀 Starting Quick Static Website Validation"
    log "📁 Testing directory: $STATIC_DIR"
    
    # Test 1: Static directory exists
    ((TESTS_RUN++))
    if [ -d "$STATIC_DIR" ]; then
        pass "Static directory exists"
    else
        fail "Static directory missing: $STATIC_DIR"
        echo -e "${RED}Cannot continue without static directory. Run 'npm run build:static' first.${NC}"
        exit 1
    fi
    
    # Test 2: Core HTML and assets
    test_file_exists "index.html" "Main HTML file"
    test_file_exists "css/graphite.css" "Graphite CSS"
    test_file_exists "assets/favicon.png" "Favicon"
    test_file_exists "assets/netreplica-site-header.svg" "Logo SVG"
    
    # Test 3: Core JavaScript files
    test_file_exists "js/clab.js" "Core JavaScript (clab.js)"
    test_file_exists "js/topology.js" "Core JavaScript (topology.js)"
    test_file_exists "js/config/deployment.js" "Deployment configuration"
    
    # Test 4: Bootstrap dependencies
    test_directory_exists "vendor/bootstrap-3.4.1-dist" "Bootstrap directory"
    test_file_exists "vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css" "Bootstrap CSS"
    test_file_exists "vendor/bootstrap-3.4.1-dist/js/bootstrap.min.js" "Bootstrap JS"
    test_file_exists "vendor/bootstrap-3.4.1-dist/fonts/glyphicons-halflings-regular.woff" "Bootstrap fonts"
    
    # Test 5: NextUI dependencies  
    test_directory_exists "vendor/next-bower" "NextUI directory"
    test_file_exists "vendor/next-bower/css/next.min.css" "NextUI CSS"
    test_file_exists "vendor/next-bower/js/next.min.js" "NextUI JS"
    
    # Test 6: File size validation
    log "📏 Validating file sizes..."
    
    validate_file_size() {
        local file="$1"
        local min_size="$2"
        local max_size="$3"
        local description="$4"
        ((TESTS_RUN++))
        
        if [ -f "$STATIC_DIR/$file" ]; then
            local size=$(stat -f%z "$STATIC_DIR/$file" 2>/dev/null || stat -c%s "$STATIC_DIR/$file" 2>/dev/null)
            if [ "$size" -ge "$min_size" ] && [ "$size" -le "$max_size" ]; then
                pass "$description size OK (${size} bytes)"
            else
                fail "$description size out of range (${size} bytes, expected ${min_size}-${max_size})"
            fi
        else
            fail "$description missing for size check"
        fi
    }
    
    validate_file_size "vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css" 100000 200000 "Bootstrap CSS"
    validate_file_size "vendor/next-bower/css/next.min.css" 90000 150000 "NextUI CSS"  
    validate_file_size "vendor/next-bower/js/next.min.js" 500000 600000 "NextUI JS"
    validate_file_size "js/topology.js" 1000 5000 "Topology JS"
    validate_file_size "index.html" 4000 10000 "HTML file"
    
    # Test 7: HTML content validation
    log "📄 Validating HTML content..."
    ((TESTS_RUN++))
    if [ -f "$STATIC_DIR/index.html" ]; then
        local html_content=$(cat "$STATIC_DIR/index.html")
        
        # Check for static deployment mode
        if echo "$html_content" | grep -q "window.GRAPHITE_MODE = 'static'"; then
            pass "HTML configured for static deployment"
        else
            fail "HTML not configured for static deployment mode"
        fi
        
        # Check for Docker-only features (should not be present)
        ((TESTS_RUN++))
        if echo "$html_content" | grep -q "js/features/"; then
            fail "HTML incorrectly includes Docker-only features"
        else
            pass "HTML correctly excludes Docker-only features"
        fi
        
        # Check for required UI elements
        ((TESTS_RUN++))
        if echo "$html_content" | grep -q 'id="drop-zone"' && echo "$html_content" | grep -q 'accept=".json"'; then
            pass "HTML includes required UI elements"
        else
            fail "HTML missing required UI elements (drop-zone, file input)"
        fi
    else
        fail "HTML file missing for content validation"
    fi
    
    # Test 8: HTTP accessibility (optional, requires server)
    log "🌐 Testing HTTP accessibility..."
    
    # Start temporary server
    local temp_port=8899
    local server_pid=""
    
    cd "$STATIC_DIR"
    python3 -m http.server $temp_port > /dev/null 2>&1 &
    server_pid=$!
    
    # Wait for server to start
    sleep 2
    
    # Test endpoints
    test_http_endpoint "/" "Main page" $temp_port
    test_http_endpoint "/vendor/bootstrap-3.4.1-dist/css/bootstrap.min.css" "Bootstrap CSS" $temp_port
    test_http_endpoint "/vendor/next-bower/css/next.min.css" "NextUI CSS" $temp_port
    test_http_endpoint "/vendor/next-bower/js/next.min.js" "NextUI JS" $temp_port
    test_http_endpoint "/js/topology.js" "Topology JS" $temp_port
    
    # Clean up server
    if [ ! -z "$server_pid" ]; then
        kill $server_pid 2>/dev/null || true
    fi
    
    # Final results
    log ""
    log "📊 Test Results Summary:"
    log "✅ Passed: $TESTS_PASSED"
    log "❌ Failed: $TESTS_FAILED"
    log "📈 Total:  $TESTS_RUN"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎯 ALL TESTS PASSED! Static website is ready for deployment.${NC}"
        exit 0
    else
        echo -e "${RED}🚨 $TESTS_FAILED tests failed. Please fix issues before deployment.${NC}"
        exit 1
    fi
}

# Run if called directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi