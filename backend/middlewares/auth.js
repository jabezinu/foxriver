const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'transactionPassword'] }
        });

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route',
        });
    }
};

// Admin only middleware (allows admin and superadmin)
exports.adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.',
        });
    }
};

// Super Admin only middleware
exports.superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Access denied. Super Admin only.',
        });
    }
};

// Permission check middleware
exports.checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        // Super Admin has all permissions
        if (req.user.role === 'superadmin') {
            return next();
        }

        if (req.user.role === 'admin' && req.user.permissions && req.user.permissions.includes(permission)) {
            return next();
        }

        res.status(403).json({
            success: false,
            message: `Access denied. Missing permission: ${permission}`,
        });
    };
};

// Check if user is Rank 1 or higher (Now allows Interns too)
exports.isV1OrHigher = (req, res, next) => {
    next();
};

// Check if Intern user can earn (within 4-day window)
exports.checkInternEarningRestriction = (req, res, next) => {
    if (req.user.membershipLevel === 'Intern' && !req.user.canInternEarn()) {
        return res.status(403).json({
            success: false,
            message: 'Your Intern trial period has ended. Task earning is no longer available. Please upgrade to Rank 1 to continue earning.',
            code: 'INTERN_TRIAL_EXPIRED',
            daysRemaining: 0
        });
    }
    next();
};

// Optional protect - adds user to req if authenticated, but doesn't require authentication
exports.optionalProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(); // Continue without user
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password', 'transactionPassword'] }
        });

        if (req.user) {
            // Keep as Sequelize instance to allow method usage
        }
    } catch (error) {
        // Ignore token errors and continue without user
    }

    next();
};
