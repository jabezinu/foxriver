const express = require('express');
const router = express.Router();
const { register, login, verify } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const { registerValidation, loginValidation, validate } = require('../middlewares/validation');

// No rate limiting on auth routes - unrestricted login attempts
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/verify', protect, verify);

module.exports = router;
