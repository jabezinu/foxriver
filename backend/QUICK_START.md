# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your configuration
   # Required: MONGODB_URI, JWT_SECRET, CLOUDINARY credentials
   ```

3. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## Verify Installation

1. **Check server health**
   ```bash
   curl http://localhost:5002/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "OK",
     "message": "Foxriver API is running",
     "timestamp": "2026-01-15T...",
     "uptime": 123.456
   }
   ```

2. **Check database connection**
   - Look for "MongoDB Connected" in console logs
   - No error messages should appear

## Common Issues

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution**: 
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5002
```
**Solution**:
- Change PORT in .env
- Or stop the process using port 5002

### Missing Dependencies
```
Error: Cannot find module 'express'
```
**Solution**:
```bash
npm install
```

### Cloudinary Upload Fails
```
Error: Must supply api_key
```
**Solution**:
- Add Cloudinary credentials to .env
- Verify CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

## Testing the API

### Register a User
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+251912345678",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+251912345678",
    "password": "password123"
  }'
```

### Get Profile (requires token)
```bash
curl http://localhost:5002/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend/
├── config/          # Database, Cloudinary, Logger
├── controllers/     # Business logic
├── middlewares/     # Auth, validation, security
├── models/          # Database schemas
├── routes/          # API endpoints
├── services/        # Background services
├── utils/           # Helper functions
└── server.js        # Entry point
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm run seed` - Seed database with initial data
- `node scripts/check_unused_dependencies.js` - Check for unused packages
- `node scripts/add_database_indexes.js` - Add performance indexes

## Environment Variables

Required variables in `.env`:

```env
# Server
PORT=5002
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/everest

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Next Steps

1. ✅ Server running
2. ⚠️ Add database indexes: `node scripts/add_database_indexes.js`
3. ⚠️ Review security settings in production
4. ⚠️ Set up monitoring and logging
5. ⚠️ Configure backup strategy

## Documentation

- `README.md` - Full project documentation
- `OPTIMIZATION_GUIDE.md` - Performance optimization tips
- `CLEANUP_SUMMARY.md` - Recent cleanup changes

## Support

For issues or questions:
1. Check the logs in console
2. Review documentation files
3. Verify environment variables
4. Check MongoDB connection

---

**Ready to go!** 🚀
