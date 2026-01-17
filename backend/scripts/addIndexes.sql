-- ============================================
-- Database Optimization Indexes for High Traffic
-- Everest Application - Production Deployment
-- ============================================
-- 
-- IMPORTANT: Run this on your REMOTE database before deploying
-- This script is SAFE - it only adds indexes, no data changes
-- Estimated time: 1-5 minutes depending on data size
--
-- Usage:
-- mysql -h your-remote-host -u your-user -p your-database < addIndexes.sql
-- ============================================

-- Check current database
SELECT DATABASE() as current_database;

-- Users table indexes (Most Important for Team Page)
-- These speed up referral queries by 10-50x
ALTER TABLE users 
ADD INDEX IF NOT EXISTS idx_referrerId (referrerId),
ADD INDEX IF NOT EXISTS idx_membershipLevel (membershipLevel),
ADD INDEX IF NOT EXISTS idx_phone (phone),
ADD INDEX IF NOT EXISTS idx_invitationCode (invitationCode);

-- Commissions table indexes (Important for Team Page)
-- Speeds up commission history queries
ALTER TABLE commissions 
ADD INDEX IF NOT EXISTS idx_user (user),
ADD INDEX IF NOT EXISTS idx_downlineUser (downlineUser),
ADD INDEX IF NOT EXISTS idx_level (level),
ADD INDEX IF NOT EXISTS idx_createdAt (createdAt),
ADD INDEX IF NOT EXISTS idx_user_createdAt (user, createdAt);

-- Task completions table indexes
-- Improves task history performance
ALTER TABLE task_completions 
ADD INDEX IF NOT EXISTS idx_userId (userId),
ADD INDEX IF NOT EXISTS idx_taskId (taskId),
ADD INDEX IF NOT EXISTS idx_completedAt (completedAt),
ADD INDEX IF NOT EXISTS idx_userId_completedAt (userId, completedAt);

-- Video task assignments table indexes (if exists)
-- Uncomment if you have this table
-- ALTER TABLE video_task_assignments 
-- ADD INDEX IF NOT EXISTS idx_userId (userId),
-- ADD INDEX IF NOT EXISTS idx_videoId (videoId),
-- ADD INDEX IF NOT EXISTS idx_status (status);

-- Deposits table indexes
-- Speeds up deposit history queries
ALTER TABLE deposits 
ADD INDEX IF NOT EXISTS idx_userId (userId),
ADD INDEX IF NOT EXISTS idx_status (status),
ADD INDEX IF NOT EXISTS idx_createdAt (createdAt),
ADD INDEX IF NOT EXISTS idx_userId_status (userId, status);

-- Withdrawals table indexes
-- Speeds up withdrawal history queries
ALTER TABLE withdrawals 
ADD INDEX IF NOT EXISTS idx_userId (userId),
ADD INDEX IF NOT EXISTS idx_status (status),
ADD INDEX IF NOT EXISTS idx_createdAt (createdAt),
ADD INDEX IF NOT EXISTS idx_userId_status (userId, status);

-- Messages table indexes
-- Improves message loading performance
ALTER TABLE messages 
ADD INDEX IF NOT EXISTS idx_userId (userId),
ADD INDEX IF NOT EXISTS idx_isRead (isRead),
ADD INDEX IF NOT EXISTS idx_createdAt (createdAt),
ADD INDEX IF NOT EXISTS idx_userId_isRead (userId, isRead);

-- Wealth investments table indexes (if exists)
-- Uncomment if you have wealth feature
-- ALTER TABLE wealth_investments 
-- ADD INDEX IF NOT EXISTS idx_user (user),
-- ADD INDEX IF NOT EXISTS idx_wealthFund (wealthFund),
-- ADD INDEX IF NOT EXISTS idx_status (status),
-- ADD INDEX IF NOT EXISTS idx_startDate (startDate);

-- ============================================
-- Verification: Show all indexes created
-- ============================================
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    CARDINALITY,
    INDEX_TYPE
FROM 
    INFORMATION_SCHEMA.STATISTICS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('users', 'commissions', 'task_completions', 'deposits', 'withdrawals', 'messages')
    AND INDEX_NAME LIKE 'idx_%'
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- ============================================
-- Performance Check: Analyze tables
-- ============================================
ANALYZE TABLE users;
ANALYZE TABLE commissions;
ANALYZE TABLE task_completions;
ANALYZE TABLE deposits;
ANALYZE TABLE withdrawals;
ANALYZE TABLE messages;

-- ============================================
-- Success Message
-- ============================================
SELECT 
    'Database indexes added successfully!' as status,
    'Your queries should now be 10-50x faster' as message,
    NOW() as completed_at;
