#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:5002/api"

# Get admin token
echo "========================================="
echo "Getting Admin Token..."
echo "========================================="
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+251900000000", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtained${NC}"
echo ""

# Test counter
TOTAL=0
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expect_auth=$5
    
    TOTAL=$((TOTAL + 1))
    echo "----------------------------------------"
    echo "Test #$TOTAL: $description"
    echo "Method: $method | Endpoint: $endpoint"
    
    if [ "$method" = "GET" ]; then
        if [ "$expect_auth" = "true" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL$endpoint")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
        fi
    elif [ "$method" = "POST" ]; then
        if [ "$expect_auth" = "true" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
        fi
    elif [ "$method" = "PUT" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE -H "Authorization: Bearer $TOKEN" "$BASE_URL$endpoint")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    # Check if successful (2xx or expected error codes)
    if [[ "$HTTP_CODE" =~ ^2 ]] || [[ "$HTTP_CODE" == "400" && "$BODY" =~ "success\":false" ]]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $HTTP_CODE)"
        PASSED=$((PASSED + 1))
        echo "Response: $(echo $BODY | head -c 150)..."
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $HTTP_CODE)"
        FAILED=$((FAILED + 1))
        echo "Response: $BODY"
    fi
    echo ""
}

echo "========================================="
echo "TESTING ALL ROUTES"
echo "========================================="
echo ""

# ============================================
# AUTH ROUTES
# ============================================
echo "========================================="
echo "AUTH ROUTES"
echo "========================================="
test_endpoint "POST" "/auth/login" "Login" '{"phone": "+251900000000", "password": "admin123"}' "false"
test_endpoint "GET" "/auth/verify" "Verify Token" "" "true"

# ============================================
# USER ROUTES
# ============================================
echo "========================================="
echo "USER ROUTES"
echo "========================================="
test_endpoint "GET" "/users/profile" "Get Profile" "" "true"
test_endpoint "GET" "/users/wallet" "Get Wallet Balance" "" "true"
test_endpoint "GET" "/users/referral-link" "Get Referral Link" "" "true"

# ============================================
# MEMBERSHIP ROUTES
# ============================================
echo "========================================="
echo "MEMBERSHIP ROUTES"
echo "========================================="
test_endpoint "GET" "/memberships/tiers" "Get Membership Tiers" "" "false"
test_endpoint "GET" "/memberships/admin/all" "Get All Tiers (Admin)" "" "true"
test_endpoint "GET" "/memberships/admin/restricted-range" "Get Restricted Range" "" "true"

# ============================================
# DEPOSIT ROUTES
# ============================================
echo "========================================="
echo "DEPOSIT ROUTES"
echo "========================================="
test_endpoint "GET" "/deposits/user" "Get User Deposits" "" "true"
test_endpoint "GET" "/deposits/all" "Get All Deposits (Admin)" "" "true"

# ============================================
# WITHDRAWAL ROUTES
# ============================================
echo "========================================="
echo "WITHDRAWAL ROUTES"
echo "========================================="
test_endpoint "GET" "/withdrawals/user" "Get User Withdrawals" "" "true"
test_endpoint "GET" "/withdrawals/all" "Get All Withdrawals (Admin)" "" "true"

# ============================================
# TASK ROUTES
# ============================================
echo "========================================="
echo "TASK ROUTES"
echo "========================================="
test_endpoint "GET" "/tasks/daily" "Get Daily Tasks" "" "true"
test_endpoint "GET" "/tasks/all" "Get All Tasks (Admin)" "" "true"
test_endpoint "GET" "/tasks/playlists" "Get Playlists (Admin)" "" "true"

# ============================================
# VIDEO TASK ROUTES
# ============================================
echo "========================================="
echo "VIDEO TASK ROUTES"
echo "========================================="
test_endpoint "GET" "/video-tasks/daily" "Get Daily Video Tasks" "" "true"
test_endpoint "GET" "/video-tasks/stats" "Get Video Task Stats" "" "true"

# ============================================
# REFERRAL ROUTES
# ============================================
echo "========================================="
echo "REFERRAL ROUTES"
echo "========================================="
test_endpoint "GET" "/referrals/downline" "Get Downline" "" "true"
test_endpoint "GET" "/referrals/commissions" "Get Commissions" "" "true"
test_endpoint "GET" "/referrals/salary" "Get Monthly Salary" "" "true"

# ============================================
# MESSAGE ROUTES
# ============================================
echo "========================================="
echo "MESSAGE ROUTES"
echo "========================================="
test_endpoint "GET" "/messages/user" "Get User Messages" "" "true"

# ============================================
# NEWS ROUTES
# ============================================
echo "========================================="
echo "NEWS ROUTES"
echo "========================================="
test_endpoint "GET" "/news" "Get News" "" "false"
test_endpoint "GET" "/news/popup" "Get Popup News" "" "false"

# ============================================
# WEALTH ROUTES
# ============================================
echo "========================================="
echo "WEALTH ROUTES"
echo "========================================="
test_endpoint "GET" "/wealth/funds" "Get Wealth Funds" "" "true"
test_endpoint "GET" "/wealth/my-investments" "Get My Investments" "" "true"
test_endpoint "GET" "/wealth/admin/funds" "Get All Wealth Funds (Admin)" "" "true"
test_endpoint "GET" "/wealth/admin/investments" "Get All Investments (Admin)" "" "true"

# ============================================
# SPIN ROUTES
# ============================================
echo "========================================="
echo "SPIN ROUTES"
echo "========================================="
test_endpoint "GET" "/spin/history" "Get Spin History" "" "true"
test_endpoint "GET" "/spin/admin/all" "Get All Spin Results (Admin)" "" "true"

# ============================================
# SLOT TIER ROUTES
# ============================================
echo "========================================="
echo "SLOT TIER ROUTES"
echo "========================================="
test_endpoint "GET" "/slot-tiers" "Get Slot Tiers" "" "true"
test_endpoint "GET" "/slot-tiers/admin/all" "Get All Slot Tiers (Admin)" "" "true"

# ============================================
# SYSTEM ROUTES
# ============================================
echo "========================================="
echo "SYSTEM ROUTES"
echo "========================================="
test_endpoint "GET" "/system/settings" "Get System Settings (Public)" "" "false"
test_endpoint "GET" "/system/admin/settings" "Get System Settings (Admin)" "" "true"

# ============================================
# BANK ROUTES
# ============================================
echo "========================================="
echo "BANK ROUTES"
echo "========================================="
test_endpoint "GET" "/bank/accounts" "Get Bank Accounts" "" "true"
test_endpoint "GET" "/bank/admin/accounts" "Get All Bank Accounts (Admin)" "" "true"

# ============================================
# QNA ROUTES
# ============================================
echo "========================================="
echo "QNA ROUTES"
echo "========================================="
test_endpoint "GET" "/qna" "Get QnA" "" "true"

# ============================================
# COURSE ROUTES
# ============================================
echo "========================================="
echo "COURSE ROUTES"
echo "========================================="
test_endpoint "GET" "/courses/categories" "Get Course Categories" "" "true"
test_endpoint "GET" "/courses" "Get Courses" "" "true"

# ============================================
# SUMMARY
# ============================================
echo "========================================="
echo "TEST SUMMARY"
echo "========================================="
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi
