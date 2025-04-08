const express = require('express');
const { createDeal, getDeals, getDeal, updateDeal, updateDealStatus } = require('../controllers/dealController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/')
  .get(protect, getDeals)
  .post(protect, createDeal);

router.route('/:id')
  .get(protect, getDeal)
  .put(protect, updateDeal);

router.route('/:dealId/status')
  .put(protect, updateDealStatus);

module.exports = router;