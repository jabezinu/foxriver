# Foxriver Application - Optimized Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Client     │  │    Admin     │  │   Mobile     │          │
│  │   (React)    │  │   (React)    │  │  (Future)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┴──────────────────┘                  │
│                            │                                      │
│                    ┌───────▼────────┐                           │
│                    │  API Gateway   │                           │
│                    │  (Future)      │                           │
│                    └───────┬────────┘                           │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                    MIDDLEWARE LAYER                             │
├────────────────────────────┼──────────────────────────────────┤
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐        │
│  │           Security Middleware                       │        │
│  │  • Rate Limiting (Auth/API/Transaction)            │        │
│  │  • Security Headers (CSP, XSS, etc.)               │        │
│  │  • Input Sanitization (NoSQL injection)            │        │
│  └─────────────────────────┬──────────────────────────┘        │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐        │
│  │         Validation Middleware                       │        │
│  │  • Request Validation (express-validator)          │        │
│  │  • Schema Validation                                │        │
│  │  • Type Checking                                    │        │
│  └─────────────────────────┬──────────────────────────┘        │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐        │
│  │         Authentication Middleware                   │        │
│  │  • JWT Verification                                 │        │
│  │  • User Context                                     │        │
│  │  • Role-based Access                                │        │
│  └─────────────────────────┬──────────────────────────┘        │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                      CONTROLLER LAYER                           │
├────────────────────────────┼──────────────────────────────────┤
│                            │                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │   User   │  │ Deposit  │  │Withdrawal│      │
│  │Controller│  │Controller│  │Controller│  │Controller│      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │              │             │
│       └─────────────┴──────────────┴──────────────┘            │
│                            │                                     │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                       SERVICE LAYER                             │
├────────────────────────────┼──────────────────────────────────┤
│                            │                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   User   │  │ Payment  │  │Referral  │  │  Salary  │      │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │              │              │             │
│       └─────────────┴──────────────┴──────────────┘            │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐        │
│  │           Business Logic Layer                      │        │
│  │  • Commission Calculation                           │        │
│  │  • Salary Processing                                │        │
│  │  • Referral Management                              │        │
│  │  • Transaction Processing                           │        │
│  └─────────────────────────┬──────────────────────────┘        │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                     REPOSITORY LAYER                            │
├────────────────────────────┼──────────────────────────────────┤
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐        │
│  │              Mongoose Models                        │        │
│  │  • User Model                                       │        │
│  │  • Deposit Model                                    │        │
│  │  • Withdrawal Model                                 │        │
│  │  • Commission Model                                 │        │
│  │  • Task Model                                       │        │
│  └─────────────────────────┬──────────────────────────┘        │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                      DATABASE LAYER                             │
├────────────────────────────┼──────────────────────────────────┤
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐        │
│  │              MongoDB Database                       │        │
│  │  • Indexed Collections                              │        │
│  │  • Optimized Queries                                │        │
│  │  • Connection Pooling                               │        │
│  └─────────────────────────┬──────────────────────────┘        │
└────────────────────────────┼──────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
├────────────────────────────┼──────────────────────────────────┤
│                            │                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │Cloudinary│  │  Redis   │  │  Email   │  │Monitoring│      │
│  │  (CDN)   │  │ (Cache)  │  │ Service  │  │ Service  │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. HTTP Request
     ▼
┌─────────────────┐
│ Rate Limiter    │ ◄── Check request rate
└────┬────────────┘
     │
     │ 2. If allowed
     ▼
┌─────────────────┐
│ Security        │ ◄── Add headers, sanitize input
└────┬────────────┘
     │
     │ 3. Sanitized request
     ▼
┌─────────────────┐
│ Validation      │ ◄── Validate request data
└────┬────────────┘
     │
     │ 4. Valid request
     ▼
┌─────────────────┐
│ Authentication  │ ◄── Verify JWT token
└────┬────────────┘
     │
     │ 5. Authenticated request
     ▼
┌─────────────────┐
│ Controller      │ ◄── Handle request
└────┬────────────┘
     │
     │ 6. Call service
     ▼
┌─────────────────┐
│ Service         │ ◄── Business logic
└────┬────────────┘
     │
     │ 7. Database operation
     ▼
┌─────────────────┐
│ Model/Database  │ ◄── Query database
└────┬────────────┘
     │
     │ 8. Return data
     ▼
┌─────────────────┐
│ Response Helper │ ◄── Format response
└────┬────────────┘
     │
     │ 9. Compress response
     ▼
┌─────────────────┐
│ Compression     │ ◄── Gzip compression
└────┬────────────┘
     │
     │ 10. HTTP Response
     ▼
┌─────────┐
│ Client  │
└─────────┘
```

## Error Handling Flow

```
┌─────────────┐
│   Error     │
│  Occurs     │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ asyncHandler     │ ◄── Catches async errors
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Error Handler    │ ◄── Centralized handler
└──────┬───────────┘
       │
       ├─► Log error (Logger)
       │
       ├─► Format error message
       │
       └─► Send error response
           │
           ▼
       ┌─────────┐
       │ Client  │
       └─────────┘
```

## Logging Flow

```
┌─────────────┐
│  Operation  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│    Logger        │
└──────┬───────────┘
       │
       ├─► Development: Pretty print
       │
       └─► Production: JSON format
           │
           ▼
       ┌─────────────┐
       │   Console   │
       │  (or file)  │
       └─────────────┘
```

## Data Flow - User Registration

```
1. Client submits registration form
   ↓
2. Rate limiter checks request count
   ↓
3. Validation middleware validates input
   ↓
4. Auth controller receives request
   ↓
5. Check if user exists (User model)
   ↓
6. Hash password (bcrypt)
   ↓
7. Create user in database
   ↓
8. Generate JWT token
   ↓
9. Log successful registration
   ↓
10. Return success response with token
```

## Data Flow - Deposit Processing

```
1. Client creates deposit request
   ↓
2. Rate limiter (transaction limit)
   ↓
3. Validation middleware
   ↓
4. Authentication middleware
   ↓
5. Deposit controller
   ↓
6. Create deposit record
   ↓
7. Upload screenshot to Cloudinary
   ↓
8. Update deposit with screenshot URL
   ↓
9. Admin approves deposit
   ↓
10. Update user wallet (atomic operation)
    ↓
11. Log transaction
    ↓
12. Return success response
```

## Security Layers

```
┌─────────────────────────────────────┐
│         Application Layer           │
│  • Input Validation                 │
│  • Output Encoding                  │
│  • Error Handling                   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Transport Layer             │
│  • HTTPS (TLS/SSL)                  │
│  • Security Headers                 │
│  • CORS Configuration               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Authentication Layer          │
│  • JWT Tokens                       │
│  • Password Hashing (bcrypt)        │
│  • Session Management               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Authorization Layer           │
│  • Role-based Access Control        │
│  • Resource Permissions             │
│  • Rate Limiting                    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Data Layer                 │
│  • Input Sanitization               │
│  • NoSQL Injection Prevention       │
│  • Encrypted Storage                │
└─────────────────────────────────────┘
```

## Performance Optimization Points

```
┌─────────────────────────────────────┐
│         Client Side                 │
│  • Code Splitting                   │
│  • Lazy Loading                     │
│  • Image Optimization               │
│  • Caching                          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Network Layer               │
│  • Compression (gzip)               │
│  • CDN (Cloudinary)                 │
│  • HTTP/2                           │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Application Layer             │
│  • Response Caching                 │
│  • Query Optimization               │
│  • Connection Pooling               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Database Layer              │
│  • Indexes                          │
│  • Query Optimization               │
│  • Lean Queries                     │
└─────────────────────────────────────┘
```

## Monitoring & Logging Architecture

```
┌─────────────────────────────────────┐
│         Application                 │
│  • Logger (Winston/Custom)          │
│  • Error Tracking                   │
│  • Performance Metrics              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Log Aggregation                │
│  • Structured Logs                  │
│  • JSON Format                      │
│  • Metadata                         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Monitoring Service            │
│  • Prometheus (Future)              │
│  • Grafana (Future)                 │
│  • Alerting (Future)                │
└─────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Load Balancer               │
│  • Nginx/HAProxy                    │
│  • SSL Termination                  │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│  App Server 1  │  │  App Server 2  │
│  • Node.js     │  │  • Node.js     │
│  • PM2         │  │  • PM2         │
└───────┬────────┘  └───────┬────────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │                   │
┌───────▼────────┐  ┌───────▼────────┐
│   MongoDB      │  │     Redis      │
│   Replica Set  │  │     Cache      │
└────────────────┘  └────────────────┘
```

---

## Key Components

### 1. Security Layer
- Rate limiting prevents abuse
- Security headers protect against common attacks
- Input sanitization prevents injection attacks

### 2. Middleware Layer
- Validation ensures data integrity
- Authentication verifies user identity
- Authorization controls access

### 3. Controller Layer
- Thin controllers delegate to services
- Handle HTTP concerns only
- Use response helpers for consistency

### 4. Service Layer
- Contains business logic
- Reusable across controllers
- Testable in isolation

### 5. Database Layer
- Optimized with indexes
- Connection pooling
- Query optimization

---

**Status:** ✅ Optimized Architecture  
**Version:** 1.0.0  
**Date:** January 12, 2026
