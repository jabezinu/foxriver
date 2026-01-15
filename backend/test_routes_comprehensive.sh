#!/bin/bash

# Comprehensive Route Testing Script for Foxriver Backend
# This script tests ALL routes in the application

BASE_URL="http://localhost:5002"
ADMIN_PHONE="+251911111111"
ADMIN_PASSWORD="admin123"
TEST_USER_PHONE="+251900000002"
TEST_USER_PASSWORD="Test1234"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local token=$5
    local expected_status=${6:-200}
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}Testing:${NC} $description"
    echo -e "${YELLOW}Endpoint:${NC} $method $endpoint"
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo -e "Response: ${body:0:200}..."
    echo ""
}

# Start testing
echo -e "${GREEN}Starting Comprehensive Route Testing${NC}"
echo -e "Base URL: $BASE_URL\n"

# ============================================
# 1. HEALTH CHECK
# ============================================
print_section "1. HEALTH CHECK"
test_endpoint "GET" "/api/health" "Health check endpoint"

# ============================================
# 2. AUTHENTICATION ROUTES
# ============================================
print_section "2. AUTHENTICATION ROUTES"

# Register new test user
test_endpoint "POST" "/api/auth/register" "Register new user" \
    "{\"phone\":\"$TEST_USER_PHONE\",\"password\":\"$TEST_USER_PASSWORD\",\"name\":\"Test User\",\"referralCode\":\"\"}"

# Login as test user
USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$TEST_USER_PHONE\",\"password\":\"$TEST_USER_PASSWORD\"}")
USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

test_endpoint "POST" "/api/auth/login" "Login as test user" \
    "{\"phone\":\"$TEST_USER_PHONE\",\"password\":\"$TEST_USER_PASSWORD\"}"

# Verify token
test_endpoint "GET" "/api/auth/verify" "Verify authentication token" "" "$USER_TOKEN"

# Try to login as admin
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"$ADMIN_PHONE\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo $ADMIN_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}Admin token obtained successfully${NC}\n"
else
    echo -e "${YELLOW}Warning: Could not obtain admin token. Some admin tests will be skipped.${NC}\n"
fi

# ============================================
# 3. USER ROUTES
# ============================================
print_section "3. USER ROUTES"

test_endpoint "GET" "/api/users/profile" "Get user profile" "" "$USER_TOKEN"
test_endpoint "PUT" "/api/users/profile" "Update user profile" \
    "{\"name\":\"Updated Test User\"}" "$USER_TOKEN"
test_endpoint "GET" "/api/users/wallet" "Get wallet balance" "" "$USER_TOKEN"
test_endpoint "GET" "/api/users/referral-link" "Get referral link" "" "$USER_TOKEN"
test_endpoint "PUT" "/api/users/bank-account" "Set bank account" \
    "{\"bankName\":\"Test Bank\",\"accountNumber\":\"1234567890\",\"accountName\":\"Test User\"}" "$USER_TOKEN"

# ============================================
# 4. SYSTEM ROUTES (PUBLIC)
# ============================================
print_section "4. SYSTEM ROUTES"

test_endpoint "GET" "/api/system/settings" "Get public system settings"

# ============================================
# 5. MEMBERSHIP ROUTES
# ============================================
print_section "5. MEMBERSHIP ROUTES"

test_endpoint "GET" "/api/memberships/tiers" "Get membership tiers"

# ============================================
# 6. BANK ROUTES (PUBLIC)
# ============================================
print_section "6. BANK ROUTES"

test_endpoint "GET" "/api/bank" "Get bank accounts (public)"

# ============================================
# 7. SLOT TIER ROUTES (PUBLIC)
# ============================================
print_section "7. SLOT TIER ROUTES"

test_endpoint "GET" "/api/slot-tiers" "Get active slot tiers"

# ============================================
# 8. NEWS ROUTES
# ============================================
print_section "8. NEWS ROUTES"

test_endpoint "GET" "/api/news" "Get all news"
test_endpoint "GET" "/api/news/popup" "Get popup news"

# ============================================
# 9. QNA ROUTES
# ============================================
print_section "9. QNA ROUTES"

test_endpoint "GET" "/api/qna" "Get Q&A"

# ============================================
# 10. COURSE ROUTES
# ============================================
print_section "10. COURSE ROUTES"

test_endpoint "GET" "/api/courses/categories" "Get course categories" "" "$USER_TOKEN"

# ============================================
# 11. DEPOSIT ROUTES
# ============================================
print_section "11. DEPOSIT ROUTES"

test_endpoint "GET" "/api/deposits/user" "Get user deposits" "" "$USER_TOKEN"
test_endpoint "POST" "/api/deposits/create" "Create deposit request" \
    "{\"amount\":100,\"bankAccountId\":1}" "$USER_TOKEN"

# ============================================
# 12. WITHDRAWAL ROUTES
# ============================================
print_section "12. WITHDRAWAL ROUTES"

test_endpoint "GET" "/api/withdrawals/user" "Get user withdrawals" "" "$USER_TOKEN"

# ============================================
# 13. TASK ROUTES
# ============================================
print_section "13. TASK ROUTES"

test_endpoint "GET" "/api/tasks/daily" "Get daily tasks" "" "$USER_TOKEN"

# ============================================
# 14. VIDEO TASK ROUTES
# ============================================
print_section "14. VIDEO TASK ROUTES"

test_endpoint "GET" "/api/video-tasks/daily" "Get daily video tasks" "" "$USER_TOKEN"
test_endpoint "GET" "/api/video-tasks/stats" "Get video task stats" "" "$USER_TOKEN"

# ============================================
# 15. REFERRAL ROUTES
# ============================================
print_section "15. REFERRAL ROUTES"

test_endpoint "GET" "/api/referrals/downline" "Get referral downline" "" "$USER_TOKEN"
test_endpoint "GET" "/api/referrals/commissions" "Get referral commissions" "" "$USER_TOKEN"
test_endpoint "GET" "/api/referrals/salary" "Get monthly salary" "" "$USER_TOKEN"

# ============================================
# 16. MESSAGE ROUTES
# ============================================
print_section "16. MESSAGE ROUTES"

test_endpoint "GET" "/api/messages/user" "Get user messages" "" "$USER_TOKEN"

# ============================================
# 17. CHAT ROUTES
# ============================================
print_section "17. CHAT ROUTES"

test_endpoint "GET" "/api/chat" "Get user chat" "" "$USER_TOKEN"

# ============================================
# 18. SPIN ROUTES
# ============================================
print_section "18. SPIN ROUTES"

test_endpoint "GET" "/api/spin/history" "Get spin history" "" "$USER_TOKEN"

# ============================================
# 19. WEALTH ROUTES
# ============================================
print_section "19. WEALTH ROUTES"

test_endpoint "GET" "/api/wealth/funds" "Get wealth funds" "" "$USER_TOKEN"
test_endpoint "GET" "/api/wealth/my-investments" "Get my investments" "" "$USER_TOKEN"

# ============================================
# 20. ADMIN ROUTES (if admin token available)
# ============================================
if [ -n "$ADMIN_TOKEN" ]; then
    print_section "20. ADMIN ROUTES"
    
    test_endpoint "GET" "/api/admin/stats" "Get admin stats" "" "$ADMIN_TOKEN"
    test_endpoint "GET" "/api/admin/users" "Get all users" "" "$ADMIN_TOKEN"
    test_endpoint "GET" "/api/admin/settings" "Get system settings" "" "$ADMIN_TOKEN"
    test_endpoint "GET" "/api/admin/commissions" "Get all commissions" "" "$ADMIN_TOKEN"
    
    # Deposits management
    test_endpoint "GET" "/api/deposits/all" "Get all deposits (admin)" "" "$ADMIN_TOKEN"
    
    # Withdrawals management
    test_endpoint "GET" "/api/withdrawals/all" "Get all withdrawals (admin)" "" "$ADMIN_TOKEN"
    
    # Tasks management
    test_endpoint "GET" "/api/tasks/all" "Get all tasks (admin)" "" "$ADMIN_TOKEN"
    test_endpoint "GET" "/api/tasks/playlists" "Get playlists (admin)" "" "$ADMIN_TOKEN"
    
    # Bank management
    test_endpoint "GET" "/api/bank/admin" "Get all bank accounts (admin)" "" "$ADMIN_TOKEN"
    
    # Slot tier management
    test_endpoint "GET" "/api/slot-tiers/admin/all" "Get all slot tiers (admin)" "" "$ADMIN_TOKEN"
    
    # Spin management
    test_endpoint "GET" "/api/spin/admin/all" "Get all spin results (admin)" "" "$ADMIN_TOKEN"
    
    # Course management
    test_endpoint "GET" "/api/courses/admin/categories" "Get all categories (admin)" "" "$ADMIN_TOKEN"
    test_endpoint "GET" "/api/courses/admin/courses" "Get all courses (admin)" "" "$ADMIN_TOKEN"
    
    # Wealth management
    test_endpoint "GET" "/api/wealth/admin/funds" "Get all wealth funds (admin)" "" "$ADMIN_TOKEN"
    test_endpoint "GET" "/api/wealth/admin/investments" "Get all investments (admin)" "" "$ADMIN_TOKEN"
    
    # Message management
    test_endpoint "GET" "/api/messages/all" "Get all messages (admin)" "" "$ADMIN_TOKEN"
    
    # Chat management
    test_endpoint "GET" "/api/chat/admin" "Get all chats (admin)" "" "$ADMIN_TOKEN"
    
    # Membership management
    test_endpoint "GET" "/api/memberships/admin/all" "Get all membership tiers (admin)" "" "$ADMIN_TOKEN"
    test_endpoint "GET" "/api/memberships/admin/restricted-range" "Get restricted range (admin)" "" "$ADMIN_TOKEN"
    
    # System settings
    test_endpoint "GET" "/api/system/admin/settings" "Get system settings (admin)" "" "$ADMIN_TOKEN"
else
    echo -e "${YELLOW}Skipping admin routes - no admin token available${NC}\n"
fi

# ============================================
# SUMMARY
# ============================================
print_section "TEST SUMMARY"

echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! ✓${NC}\n"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please review the output above.${NC}\n"
    exit 1
fi
