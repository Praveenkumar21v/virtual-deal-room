const express = require('express');
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id', protect, markNotificationRead);

module.exports = router;