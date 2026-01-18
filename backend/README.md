# Everest Backend

## Deployment

### 1. Upload Files
Upload all backend files to your server

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Server
```bash
npm start
```

That's it! Database indexes are added automatically on startup.

## Environment Variables

Make sure your `.env` file has:

```env
# Server
PORT=5002
NODE_ENV=production

# Database
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Features

- ✅ Automatic database optimization on startup
- ✅ Rate limiting (1000 req/min)
- ✅ Response caching (2 minutes)
- ✅ Ready for 10,000+ users
- ✅ Secure authentication
- ✅ File uploads
- ✅ Commission system
- ✅ Referral tracking
- ✅ Task management

## Support

For issues, check the logs or contact support.
