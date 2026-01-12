const express = require('express');
const router = express.Router();
const { register, login, verify } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/security');
const { registerValidation, loginValidation, validate } = require('../middlewares/validation');

// Apply rate limiting to auth routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.get('/verify', protect, verify);

module.exports = router;
