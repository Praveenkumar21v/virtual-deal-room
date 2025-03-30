const Deal = require('../models/Deal');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { redisClient } = require('../config/redis');
const { getIO } = require('../services/socketService');
const { createNotification } = require('./notificationController');

exports.createDeal = asyncHandler(async (req, res, next) => {
  const { title, description, price, seller } = req.body;

  if (!title || !description || !price || !seller) {
    return next(new ErrorResponse('Missing required fields', 400));
  }

  const dealData = {
    title,
    description,
    price,
    buyer: req.user.role === 'buyer' ? req.user.id : null,
    seller: req.user.role === 'seller' ? req.user.id : seller,
    status: 'Pending'
    };

  const deal = await Deal.create(dealData);

  await createNotification(deal.seller, `New deal created: ${deal.title}`, deal._id);
  await redisClient.del('active_deals');

  const io = getIO();
  io.to(deal.seller.toString()).emit('newDeal', deal);

  res.status(201).json({ success: true, data: deal });
});

exports.getDeals = asyncHandler(async (req, res) => {
  const cacheKey = 'active_deals';
  let deals;
  try {
    const cachedDeals = await redisClient.get(cacheKey);
    if (cachedDeals) {
      deals = JSON.parse(cachedDeals);
      return res.status(200).json({ success: true, count: deals.length, data: deals });
    }
  } catch (err) {
    console.error('Redis get error:', err);
  }

  deals = await Deal.find({ status: { $in: ['Pending', 'In Progress'] } })
    .populate('buyer', 'email')
    .populate('seller', 'email');

  try {
    await redisClient.setEx(cacheKey, 600, JSON.stringify(deals));
  } catch (err) {
    console.error('Redis set error:', err);
  }

  res.status(200).json({ success: true, count: deals.length, data: deals });
});

exports.getDeal = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id)
    .populate('buyer', 'email')
    .populate('seller', 'email');

  if (!deal) {
    return next(new ErrorResponse(`Deal not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: deal });
});

exports.updateDeal = asyncHandler(async (req, res, next) => {
  let deal = await Deal.findById(req.params.id);

  if (!deal) {
    return next(new ErrorResponse(`Deal not found with id ${req.params.id}`, 404));
  }

  if (deal.buyer.toString() !== req.user.id && deal.seller.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this deal', 401));
  }

  deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await redisClient.del('active_deals');

  const io = getIO();
  io.to(deal._id.toString()).emit('dealUpdate', {
    dealId: deal._id,
    status: deal.status,
    updatedBy: req.user.id,
  });

  res.status(200).json({ success: true, data: deal });
});

exports.updateDealStatus = asyncHandler(async (req, res, next) => {
  const { dealId } = req.params;
  const { action } = req.body; 

  let deal = await Deal.findById(dealId);

  if (!deal) {
    return next(new ErrorResponse(`Deal not found with id ${dealId}`, 404));
  }

  if (deal.seller.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this deal', 401));
  }

  if (deal.status !== 'Pending') {
    return next(new ErrorResponse('Deal status can only be updated from Pending', 400));
  }

  deal.status = action === 'accept' ? 'In Progress' : 'Cancelled';
  await deal.save();

  await redisClient.del('active_deals');

  const io = getIO();
  io.to(deal._id.toString()).emit('dealStatusUpdate', {
    dealId: deal._id,
    status: deal.status,
    updatedBy: req.user.id,
  });

  if (action === 'accept') {
    await createNotification(deal.buyer, `Deal ${deal.title} accepted by seller`, deal._id);
  } else {
    await createNotification(deal.buyer, `Deal ${deal.title} rejected by seller`, deal._id);
  }

  res.status(200).json({ success: true, data: deal });
});

