const express = require('express');
const { uploadDocument, storeDocument, getDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/:dealId')
  .post(protect, uploadDocument, storeDocument)
  .get(protect, getDocuments);

module.exports = router;