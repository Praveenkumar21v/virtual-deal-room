const Message = require('../models/Message');
const Deal = require('../models/Deal');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { redisClient } = require('../config/redis');
const { getIO } = require('../services/socketService');

exports.getMessages = asyncHandler(async (req, res) => {
  const cacheKey = `messages_${req.params.dealId}`;
  let messages;
  try {
    const cachedMessages = await redisClient.get(cacheKey);
    if (cachedMessages) {
      messages = JSON.parse(cachedMessages);
      return res.status(200).json({ success: true, data: messages });
    }
  } catch (err) {
    console.error('Redis get error:', err);
  }

  messages = await Message.find({ deal: req.params.dealId }).populate('sender', 'email role');
  try {
    await redisClient.setEx(cacheKey, 300, JSON.stringify(messages));
  } catch (err) {
    console.error('Redis set error:', err);
  }

  res.status(200).json({ success: true, data: messages });
});

exports.createMessage = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findOne({
    _id: req.params.dealId,
    $or: [{ buyer: req.user.id }, { seller: req.user.id }],
  });

  if (!deal) {
    return next(new ErrorResponse('Not authorized to send messages for this deal', 401));
  }

  const message = await Message.create({
    content: req.body.content,
    deal: req.params.dealId,
    sender: req.user.id,
  });

  const newMessage = await Message.findById(message._id).populate('sender', 'email role');
  await redisClient.del(`messages_${req.params.dealId}`);

  const io = getIO();
  io.to(req.params.dealId).emit('newMessage', newMessage);

  res.status(201).json({ success: true, data: newMessage });
});

exports.markMessageRead = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    return next(new ErrorResponse('Message not found', 404));
  }

  message.read = true;
  await message.save();

  const io = getIO();
  io.to(message.deal.toString()).emit('messageRead', { messageId: message._id });

  res.status(200).json({ success: true, data: message });
});

exports.getOnlineStatus = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.dealId);
  if (!deal || (deal.buyer.toString() !== req.user.id && deal.seller.toString() !== req.user.id)) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  const buyerOnline = await redisClient.get(`online:${deal.buyer}`);
  const sellerOnline = await redisClient.get(`online:${deal.seller}`);

  res.status(200).json({
    success: true,
    data: {
      buyer: { id: deal.buyer, online: !!buyerOnline },
      seller: { id: deal.seller, online: !!sellerOnline },
    },
  });
});