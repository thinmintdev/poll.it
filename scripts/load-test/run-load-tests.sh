#!/bin/bash

# Artillery Load Testing Script for Poll.it
# Usage: ./run-load-tests.sh [test-type]

set -e

echo "🚀 Artillery Load Testing for Poll.it"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if server is running
check_server() {
    echo -e "${BLUE}📡 Checking if development server is running...${NC}"
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✅ Server is running on http://localhost:3000${NC}"
    else
        echo -e "${RED}❌ Server is not running! Please start with 'npm run dev'${NC}"
        exit 1
    fi
}

# Function to generate poll IDs
generate_poll_ids() {
    echo -e "${BLUE}📋 Generating poll IDs for testing...${NC}"
    DATABASE_URL="postgres://neondb_owner:npg_xMKjf8z7dnvs@ep-silent-term-adz3loky-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" node scripts/generate-poll-ids.js
}

# Function to run a specific Artillery test
run_artillery_test() {
    local config_file=$1
    local test_name=$2
    
    echo -e "${YELLOW}🎯 Running $test_name...${NC}"
    echo "Config: $config_file"
    echo "Started at: $(date)"
    echo "----------------------------------------"
    
    npx artillery run $config_file --output report-$(date +%Y%m%d-%H%M%S).json
    
    echo -e "${GREEN}✅ $test_name completed!${NC}"
    echo "----------------------------------------"
}

# Function to show test options
show_options() {
    echo -e "${BLUE}Available test types:${NC}"
    echo "1. standard    - Comprehensive load test with ramp-up (5 min)"
    echo "2. spike       - Quick spike test (30 seconds)"
    echo "3. endurance   - Long-running endurance test (10 min)"
    echo "4. all         - Run all tests sequentially"
    echo ""
    echo "Usage: $0 [test-type]"
    echo "Example: $0 standard"
}

# Main execution
main() {
    local test_type=${1:-""}
    
    if [ -z "$test_type" ]; then
        show_options
        exit 0
    fi
    
    # Pre-flight checks
    check_server
    generate_poll_ids
    
    echo -e "${BLUE}📊 Starting load tests...${NC}"
    echo ""
    
    case $test_type in
        "standard")
            run_artillery_test "artillery-config.yml" "Standard Load Test"
            ;;
        "spike")
            run_artillery_test "artillery-spike-test.yml" "Spike Test"
            ;;
        "endurance")
            run_artillery_test "artillery-endurance-test.yml" "Endurance Test"
            ;;
        "all")
            echo -e "${YELLOW}🔄 Running all tests...${NC}"
            run_artillery_test "artillery-spike-test.yml" "Spike Test"
            sleep 5
            run_artillery_test "artillery-config.yml" "Standard Load Test"
            sleep 10
            run_artillery_test "artillery-endurance-test.yml" "Endurance Test"
            ;;
        *)
            echo -e "${RED}❌ Unknown test type: $test_type${NC}"
            show_options
            exit 1
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 Load testing completed!${NC}"
    echo "Check the generated report files for detailed metrics."
    echo ""
    echo -e "${BLUE}📈 To view HTML reports, run:${NC}"
    echo "npx artillery report report-YYYYMMDD-HHMMSS.json"
}

# Run main function
main "$@"
