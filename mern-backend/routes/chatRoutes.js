const express = require('express');
const { getMessages, createMessage, markMessageRead, getOnlineStatus } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/:dealId')
  .get(protect, getMessages)
  .post(protect, createMessage);

router.route('/:dealId/mark/:messageId').put(protect, markMessageRead);
router.route('/:dealId/online').get(protect, getOnlineStatus);

module.exports = router;