const express = require('express');
const { getSellers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/sellers', protect, getSellers);

module.exports = router;