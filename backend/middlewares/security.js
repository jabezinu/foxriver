/**
 * Security middleware configuration
 * Implements rate limiting, sanitization, and security headers
 */

const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for general API endpoints
exports.apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter for deposit/withdrawal endpoints
exports.transactionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 transactions per hour
    message: {
        success: false,
        message: 'Too many transaction requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Security headers configuration
exports.securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' https://res.cloudinary.com data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    );
    
    next();
};

// Input sanitization middleware
exports.sanitizeInput = (req, res, next) => {
    // Remove any potential MongoDB operators from request body
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        Object.keys(obj).forEach(key => {
            if (key.startsWith('$')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        });
        
        return obj;
    };
    
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    
    next();
};
