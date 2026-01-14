# Everest Backend API

A clean, optimized Node.js/Express backend with MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Security**: Rate limiting, input sanitization, security headers
- **Performance**: Connection pooling, compression, optimized queries
- **File Upload**: Cloudinary integration for image storage
- **Scheduled Tasks**: Automated salary processing with node-cron
- **Error Handling**: Centralized error handling and logging

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **File Storage**: Cloudinary
- **Security**: bcryptjs, express-rate-limit, express-validator
- **Utilities**: compression, cors, multer, node-cron

**Note**: The `ytpl` package (YouTube playlist parser) is currently used but deprecated. Consider migrating to YouTube Data API v3 or manual video entry. See `OPTIMIZATION_GUIDE.md` for details.

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Seed database (optional)
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

```env
PORT=5002
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## Project Structure

```
backend/
├── config/          # Configuration files (database, cloudinary, logger)
├── constants/       # Application constants
├── controllers/     # Request handlers
├── helpers/         # Utility functions
├── middlewares/     # Express middlewares (auth, validation, security)
├── models/          # Mongoose models
├── routes/          # API routes
├── scripts/         # Database migration and utility scripts
├── services/        # Business logic services
├── uploads/         # Local file uploads (if not using Cloudinary)
├── utils/           # Utility functions
└── server.js        # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

### Transactions
- `POST /api/deposits` - Create deposit request
- `POST /api/withdrawals` - Create withdrawal request
- `GET /api/deposits` - List deposits
- `GET /api/withdrawals` - List withdrawals

### Tasks
- `GET /api/tasks` - List available tasks
- `POST /api/tasks/:id/complete` - Complete a task
- `GET /api/video-tasks` - List video tasks

### Admin
- `GET /api/admin/*` - Admin management endpoints
- `PUT /api/admin/transactions/:id/approve` - Approve transaction
- `PUT /api/admin/transactions/:id/reject` - Reject transaction

## Performance Optimizations

### Database
- Connection pooling (maxPoolSize: 10, minPoolSize: 2)
- Indexed fields for faster queries
- Lean queries where appropriate
- Aggregation pipelines for complex queries

### Middleware
- Compression for response bodies
- Rate limiting to prevent abuse
- Input sanitization for security
- Efficient error handling

### Best Practices
- Async/await for all database operations
- Centralized error handling
- Structured logging
- Graceful shutdown handling
- Environment-based configuration

## Security Features

- JWT authentication
- Password hashing with bcryptjs
- Rate limiting on sensitive endpoints
- Input sanitization against NoSQL injection
- Security headers (XSS, clickjacking protection)
- CORS configuration
- Transaction password for financial operations

## Scripts

### Database Scripts
Located in `scripts/` directory:
- `add_database_indexes.js` - Add performance indexes
- `migrate_membership_levels.js` - Migrate membership data
- `verify_salary_system.js` - Verify salary calculations

Run with: `node scripts/script_name.js`

## Maintenance

### Cleaning Up
The backend has been optimized by:
- Removing unused dependencies (ytpl)
- Deleting test/utility scripts from root
- Optimizing database connections
- Implementing proper logging
- Adding connection pooling

### Monitoring
- Check logs for errors and warnings
- Monitor MongoDB connection status
- Track API response times
- Review rate limit hits

## License

ISC
