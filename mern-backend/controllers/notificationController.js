const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/async');
const { getIO } = require('../services/socketService');

exports.createNotification = async (userId, message, dealId) => {
  const notification = await Notification.create({ user: userId, message, deal: dealId });
  const io = getIO();
  io.to(userId.toString()).emit('newNotification', notification);
};

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id, read: false });
  res.status(200).json({ success: true, data: notifications });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  res.status(200).json({ success: true, data: notification });
});