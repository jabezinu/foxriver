# MongoDB to MySQL Migration Guide

## Overview
This application has been successfully migrated from MongoDB (Mongoose) to MySQL (Sequelize ORM).

## Database Configuration

### Connection Details
- **Database Name**: `foxriver-db`
- **Username**: `root`
- **Password**: `1q0p2w9o`
- **Host**: `localhost`
- **Port**: `3306` (default MySQL port)

### Environment Variables
Update your `.env` file with the following MySQL configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1q0p2w9o
DB_NAME=foxriver-db
DB_DIALECT=mysql
```

## Installation Steps

### 1. Install MySQL Server
Make sure MySQL is installed and running on your system.

**Windows:**
- Download MySQL from https://dev.mysql.com/downloads/installer/
- Install MySQL Server
- Start MySQL service

**Verify MySQL is running:**
```bash
mysql --version
```

### 2. Create Database
Login to MySQL and create the database:

```bash
mysql -u root -p
```

Enter password: `1q0p2w9o`

Then run:
```sql
CREATE DATABASE `foxriver-db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. Install Dependencies
The required packages are already installed:
- `mysql2` - MySQL client for Node.js
- `sequelize` - ORM for MySQL

### 4. Run Database Seeding
This will create all tables and seed initial data:

```bash
npm run seed
```

This command will:
- Create all database tables
- Seed membership tiers (Intern, Rank 1-10)
- Create default admin user (phone: +251900000000, password: admin123)

### 5. Start the Server
```bash
npm run dev
```

## Key Changes

### Model Changes
All Mongoose models have been converted to Sequelize models:

**Before (Mongoose):**
```javascript
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({...});
module.exports = mongoose.model('User', userSchema);
```

**After (Sequelize):**
```javascript
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');
class User extends Model {}
User.init({...}, { sequelize, modelName: 'User' });
module.exports = User;
```

### Query Changes

#### Finding Records
**Before:** `User.findById(id)`  
**After:** `User.findByPk(id)`

**Before:** `User.findOne({ phone })`  
**After:** `User.findOne({ where: { phone } })`

**Before:** `User.find({ role: 'user' })`  
**After:** `User.findAll({ where: { role: 'user' } })`

#### Counting Records
**Before:** `User.countDocuments({ referrerId: userId })`  
**After:** `User.count({ where: { referrerId: userId } })`

#### Creating Records
**Before:** `await User.create({...})`  
**After:** `await User.create({...})` (same)

**Before:** `await Commission.insertMany([...])`  
**After:** `await Commission.bulkCreate([...])`

#### Updating Records
**Before:** `User.findByIdAndUpdate(id, { $inc: { wallet: amount } })`  
**After:** 
```javascript
const user = await User.findByPk(id);
user.wallet += amount;
await user.save();
```

#### Deleting Records
**Before:** `User.findByIdAndDelete(id)`  
**After:** `User.destroy({ where: { id } })`

### ID Field Changes
- MongoDB uses `_id` (ObjectId)
- MySQL uses `id` (INTEGER AUTO_INCREMENT)
- All references updated from `_id` to `id`

### JSON Fields
Fields that stored complex data (like `bankAccount`, `permissions`, `videos`) are now stored as JSON type in MySQL.

## Database Schema

### Tables Created
1. **users** - User accounts and profiles
2. **memberships** - Membership tier configurations
3. **tasks** - Video tasks
4. **task_completions** - User task completion records
5. **courses** - Educational courses
6. **course_categories** - Course categories
7. **daily_video_assignments** - Daily video assignments
8. **video_pools** - Pool of videos
9. **playlists** - YouTube playlists
10. **system_settings** - System configuration
11. **commissions** - Referral commissions
12. **salaries** - Monthly salary payments
13. **deposits** - User deposits
14. **withdrawals** - User withdrawals
15. **bank_accounts** - System bank accounts
16. **wealth_funds** - Investment products
17. **wealth_investments** - User investments
18. **spin_results** - Slot machine history
19. **slot_tiers** - Slot machine tiers
20. **news** - News articles
21. **messages** - System messages
22. **chats** - Chat conversations
23. **chat_messages** - Chat messages
24. **qnas** - Q&A images

## Testing the Migration

### 1. Check Database Connection
```bash
curl http://localhost:5002/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Foxriver API is running",
  "database": "MySQL",
  "timestamp": "2026-01-15T...",
  "uptime": 123.456
}
```

### 2. Test Admin Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+251900000000", "password": "admin123"}'
```

### 3. Verify Tables
```bash
mysql -u root -p1q0p2w9o foxriver-db -e "SHOW TABLES;"
```

## Troubleshooting

### Connection Errors
If you get "ER_ACCESS_DENIED_ERROR":
- Verify MySQL password is correct
- Check MySQL user has proper permissions

```sql
GRANT ALL PRIVILEGES ON `foxriver-db`.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Table Creation Issues
If tables aren't created:
```bash
npm run seed
```

### Port Conflicts
If port 3306 is in use, update `DB_HOST` in `.env` to include port:
```env
DB_HOST=localhost:3307
```

## Performance Considerations

### Indexes
All important fields have indexes for optimal query performance:
- User phone, invitationCode, referrerId
- Task status and dates
- Commission user and dates
- Deposit/Withdrawal status

### Connection Pooling
Configured with:
- Max connections: 10
- Min connections: 2
- Acquire timeout: 30s
- Idle timeout: 10s

## Backup and Restore

### Backup Database
```bash
mysqldump -u root -p1q0p2w9o foxriver-db > backup.sql
```

### Restore Database
```bash
mysql -u root -p1q0p2w9o foxriver-db < backup.sql
```

## Migration Complete! ✅

The application is now fully running on MySQL. All 24 models have been converted, and all database operations have been updated to use Sequelize ORM.
