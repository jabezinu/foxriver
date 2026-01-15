# Comprehensive Route Testing Script for Foxriver Backend
# This script tests ALL routes in the application

$BASE_URL = "http://localhost:5002"
$ADMIN_PHONE = "+251911111111"
$ADMIN_PASSWORD = "admin123"
$TEST_USER_PHONE = "+251900000003"
$TEST_USER_PASSWORD = "Test1234"

# Test counter
$TOTAL_TESTS = 0
$PASSED_TESTS = 0
$FAILED_TESTS = 0

# Function to print section headers
function Print-Section {
    param($title)
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $title -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [string]$Data = "",
        [string]$Token = "",
        [int]$ExpectedStatus = 200
    )
    
    $script:TOTAL_TESTS++
    Write-Host "Testing: " -ForegroundColor Yellow -NoNewline
    Write-Host $Description
    Write-Host "Endpoint: " -ForegroundColor Yellow -NoNewline
    Write-Host "$Method $Endpoint"
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BASE_URL$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($Data) {
            $params["Body"] = $Data
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        $body = $response.Content
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "✓ PASSED" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $statusCode)"
            $script:PASSED_TESTS++
        } else {
            Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $statusCode)"
            $script:FAILED_TESTS++
        }
        
        $preview = if ($body.Length -gt 200) { $body.Substring(0, 200) + "..." } else { $body }
        Write-Host "Response: $preview"
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ FAILED" -ForegroundColor Red -NoNewline
        Write-Host " (HTTP $statusCode)"
        Write-Host "Error: $($_.Exception.Message)"
        $script:FAILED_TESTS++
    }
    
    Write-Host ""
}

# Start testing
Write-Host "Starting Comprehensive Route Testing" -ForegroundColor Green
Write-Host "Base URL: $BASE_URL`n"

# ============================================
# 1. HEALTH CHECK
# ============================================
Print-Section "1. HEALTH CHECK"
Test-Endpoint -Method "GET" -Endpoint "/api/health" -Description "Health check endpoint"

# ============================================
# 2. AUTHENTICATION ROUTES
# ============================================
Print-Section "2. AUTHENTICATION ROUTES"

# Register new test user
Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Description "Register new user" `
    -Data "{`"phone`":`"$TEST_USER_PHONE`",`"password`":`"$TEST_USER_PASSWORD`",`"name`":`"Test User`",`"referralCode`":`"`"}"

# Login as test user
try {
    $userLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body "{`"phone`":`"$TEST_USER_PHONE`",`"password`":`"$TEST_USER_PASSWORD`"}"
    $USER_TOKEN = $userLoginResponse.token
    Write-Host "User token obtained successfully`n" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not obtain user token`n" -ForegroundColor Yellow
}

Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Description "Login as test user" `
    -Data "{`"phone`":`"$TEST_USER_PHONE`",`"password`":`"$TEST_USER_PASSWORD`"}"

# Verify token
if ($USER_TOKEN) {
    Test-Endpoint -Method "GET" -Endpoint "/api/auth/verify" -Description "Verify authentication token" -Token $USER_TOKEN
}

# Try to login as admin
try {
    $adminLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body "{`"phone`":`"$ADMIN_PHONE`",`"password`":`"$ADMIN_PASSWORD`"}"
    $ADMIN_TOKEN = $adminLoginResponse.token
    Write-Host "Admin token obtained successfully`n" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not obtain admin token. Some admin tests will be skipped.`n" -ForegroundColor Yellow
}

# ============================================
# 3. USER ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "3. USER ROUTES"
    
    Test-Endpoint -Method "GET" -Endpoint "/api/users/profile" -Description "Get user profile" -Token $USER_TOKEN
    Test-Endpoint -Method "PUT" -Endpoint "/api/users/profile" -Description "Update user profile" `
        -Data "{`"name`":`"Updated Test User`"}" -Token $USER_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/users/wallet" -Description "Get wallet balance" -Token $USER_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/users/referral-link" -Description "Get referral link" -Token $USER_TOKEN
    Test-Endpoint -Method "PUT" -Endpoint "/api/users/bank-account" -Description "Set bank account" `
        -Data "{`"bankName`":`"Test Bank`",`"accountNumber`":`"1234567890`",`"accountName`":`"Test User`"}" -Token $USER_TOKEN
}

# ============================================
# 4. SYSTEM ROUTES (PUBLIC)
# ============================================
Print-Section "4. SYSTEM ROUTES"
Test-Endpoint -Method "GET" -Endpoint "/api/system/settings" -Description "Get public system settings"

# ============================================
# 5. MEMBERSHIP ROUTES
# ============================================
Print-Section "5. MEMBERSHIP ROUTES"
Test-Endpoint -Method "GET" -Endpoint "/api/memberships/tiers" -Description "Get membership tiers"

# ============================================
# 6. BANK ROUTES (PUBLIC)
# ============================================
Print-Section "6. BANK ROUTES"
Test-Endpoint -Method "GET" -Endpoint "/api/bank" -Description "Get bank accounts (public)"

# ============================================
# 7. SLOT TIER ROUTES (PUBLIC)
# ============================================
Print-Section "7. SLOT TIER ROUTES"
Test-Endpoint -Method "GET" -Endpoint "/api/slot-tiers" -Description "Get active slot tiers"

# ============================================
# 8. NEWS ROUTES
# ============================================
Print-Section "8. NEWS ROUTES"
Test-Endpoint -Method "GET" -Endpoint "/api/news" -Description "Get all news"
Test-Endpoint -Method "GET" -Endpoint "/api/news/popup" -Description "Get popup news"

# ============================================
# 9. QNA ROUTES
# ============================================
Print-Section "9. QNA ROUTES"
Test-Endpoint -Method "GET" -Endpoint "/api/qna" -Description "Get Q&A"

# ============================================
# 10. COURSE ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "10. COURSE ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/courses/categories" -Description "Get course categories" -Token $USER_TOKEN
}

# ============================================
# 11. DEPOSIT ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "11. DEPOSIT ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/deposits/user" -Description "Get user deposits" -Token $USER_TOKEN
    Test-Endpoint -Method "POST" -Endpoint "/api/deposits/create" -Description "Create deposit request" `
        -Data "{`"amount`":100,`"bankAccountId`":1}" -Token $USER_TOKEN
}

# ============================================
# 12. WITHDRAWAL ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "12. WITHDRAWAL ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/withdrawals/user" -Description "Get user withdrawals" -Token $USER_TOKEN
}

# ============================================
# 13. TASK ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "13. TASK ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/tasks/daily" -Description "Get daily tasks" -Token $USER_TOKEN
}

# ============================================
# 14. VIDEO TASK ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "14. VIDEO TASK ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/video-tasks/daily" -Description "Get daily video tasks" -Token $USER_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/video-tasks/stats" -Description "Get video task stats" -Token $USER_TOKEN
}

# ============================================
# 15. REFERRAL ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "15. REFERRAL ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/referrals/downline" -Description "Get referral downline" -Token $USER_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/referrals/commissions" -Description "Get referral commissions" -Token $USER_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/referrals/salary" -Description "Get monthly salary" -Token $USER_TOKEN
}

# ============================================
# 16. MESSAGE ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "16. MESSAGE ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/messages/user" -Description "Get user messages" -Token $USER_TOKEN
}

# ============================================
# 17. CHAT ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "17. CHAT ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/chat" -Description "Get user chat" -Token $USER_TOKEN
}

# ============================================
# 18. SPIN ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "18. SPIN ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/spin/history" -Description "Get spin history" -Token $USER_TOKEN
}

# ============================================
# 19. WEALTH ROUTES
# ============================================
if ($USER_TOKEN) {
    Print-Section "19. WEALTH ROUTES"
    Test-Endpoint -Method "GET" -Endpoint "/api/wealth/funds" -Description "Get wealth funds" -Token $USER_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/wealth/my-investments" -Description "Get my investments" -Token $USER_TOKEN
}

# ============================================
# 20. ADMIN ROUTES (if admin token available)
# ============================================
if ($ADMIN_TOKEN) {
    Print-Section "20. ADMIN ROUTES"
    
    Test-Endpoint -Method "GET" -Endpoint "/api/admin/stats" -Description "Get admin stats" -Token $ADMIN_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/admin/users" -Description "Get all users" -Token $ADMIN_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/admin/settings" -Description "Get system settings" -Token $ADMIN_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/admin/commissions" -Description "Get all commissions" -Token $ADMIN_TOKEN
    
    # Deposits management
    Test-Endpoint -Method "GET" -Endpoint "/api/deposits/all" -Description "Get all deposits (admin)" -Token $ADMIN_TOKEN
    
    # Withdrawals management
    Test-Endpoint -Method "GET" -Endpoint "/api/withdrawals/all" -Description "Get all withdrawals (admin)" -Token $ADMIN_TOKEN
    
    # Tasks management
    Test-Endpoint -Method "GET" -Endpoint "/api/tasks/all" -Description "Get all tasks (admin)" -Token $ADMIN_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/tasks/playlists" -Description "Get playlists (admin)" -Token $ADMIN_TOKEN
    
    # Bank management
    Test-Endpoint -Method "GET" -Endpoint "/api/bank/admin" -Description "Get all bank accounts (admin)" -Token $ADMIN_TOKEN
    
    # Slot tier management
    Test-Endpoint -Method "GET" -Endpoint "/api/slot-tiers/admin/all" -Description "Get all slot tiers (admin)" -Token $ADMIN_TOKEN
    
    # Spin management
    Test-Endpoint -Method "GET" -Endpoint "/api/spin/admin/all" -Description "Get all spin results (admin)" -Token $ADMIN_TOKEN
    
    # Course management
    Test-Endpoint -Method "GET" -Endpoint "/api/courses/admin/categories" -Description "Get all categories (admin)" -Token $ADMIN_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/courses/admin/courses" -Description "Get all courses (admin)" -Token $ADMIN_TOKEN
    
    # Wealth management
    Test-Endpoint -Method "GET" -Endpoint "/api/wealth/admin/funds" -Description "Get all wealth funds (admin)" -Token $ADMIN_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/wealth/admin/investments" -Description "Get all investments (admin)" -Token $ADMIN_TOKEN
    
    # Message management
    Test-Endpoint -Method "GET" -Endpoint "/api/messages/all" -Description "Get all messages (admin)" -Token $ADMIN_TOKEN
    
    # Chat management
    Test-Endpoint -Method "GET" -Endpoint "/api/chat/admin" -Description "Get all chats (admin)" -Token $ADMIN_TOKEN
    
    # Membership management
    Test-Endpoint -Method "GET" -Endpoint "/api/memberships/admin/all" -Description "Get all membership tiers (admin)" -Token $ADMIN_TOKEN
    Test-Endpoint -Method "GET" -Endpoint "/api/memberships/admin/restricted-range" -Description "Get restricted range (admin)" -Token $ADMIN_TOKEN
    
    # System settings
    Test-Endpoint -Method "GET" -Endpoint "/api/system/admin/settings" -Description "Get system settings (admin)" -Token $ADMIN_TOKEN
} else {
    Write-Host "Skipping admin routes - no admin token available`n" -ForegroundColor Yellow
}

# ============================================
# SUMMARY
# ============================================
Print-Section "TEST SUMMARY"

Write-Host "Total Tests: " -NoNewline
Write-Host $TOTAL_TESTS -ForegroundColor Blue
Write-Host "Passed: " -NoNewline
Write-Host $PASSED_TESTS -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host $FAILED_TESTS -ForegroundColor Red

if ($FAILED_TESTS -eq 0) {
    Write-Host "`nAll tests passed! ✓`n" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome tests failed. Please review the output above.`n" -ForegroundColor Red
    exit 1
}
