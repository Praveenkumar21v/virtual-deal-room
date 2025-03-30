const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth'); 
const router = express.Router();

router.get('/me', protect, getMe);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

module.exports = router;