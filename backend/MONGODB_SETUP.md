# MongoDB Setup Guide for Foxriver

You need to configure a MongoDB database connection. Choose one of the options below:

---

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Steps:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (no credit card required)

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" shared cluster (M0)
   - Select a cloud provider and region close to Ethiopia (e.g., AWS Frankfurt)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `foxriver`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://foxriver:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

6. **Update .env File**
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://foxriver:<password>@cluster0.xxxxx.mongodb.net/foxriver?retryWrites=true&w=majority`

**Example .env:**
```
MONGODB_URI=mongodb+srv://foxriver:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/foxriver?retryWrites=true&w=majority
```

---

## Option 2: Local MongoDB

### Steps:

1. **Install MongoDB Community Edition**
   - Windows: https://www.mongodb.com/try/download/community
   - Download and run the installer
   - Choose "Complete" setup
   - Install as a service (check the box)

2. **Verify Installation**
   ```bash
   mongo --version
   # or
   mongod --version
   ```

3. **Update .env File**
   ```
   MONGODB_URI=mongodb://localhost:27017/foxriver
   ```

4. **Start MongoDB Service**
   - Should start automatically if installed as service
   - Or manually: `mongod` in terminal

---

## After Configuration

1. **Update your .env file** with the appropriate MongoDB URI
2. **Run the seed script**:
   ```bash
   npm run seed
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```

---

## Current .env Template

Your `.env` file should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (CHOOSE ONE OPTION ABOVE)
MONGODB_URI=your_mongodb_connection_string_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Admin Default Credentials
ADMIN_PHONE=+251911111111
ADMIN_PASSWORD=admin123

# File Upload Configuration
MAX_FILE_SIZE=50000000
UPLOAD_PATH=./uploads
```

---

## Troubleshooting

### "querySrv ENOTFOUND" Error
- Your MongoDB URI is incorrect or not set
- Check that you've updated the .env file
- Restart your terminal/server after updating .env

### "Authentication Failed"
- Your database user password is incorrect
- Make sure you replaced `<password>` in the connection string
- Check that the user has proper permissions

### "Connection Timeout"
- IP address not whitelisted (Atlas)
- MongoDB service not running (Local)
- Check your internet connection (Atlas)
