const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.getSellers = asyncHandler(async (req, res, next) => {
  const sellers = await User.find({ role: 'seller' }).select('email _id');
  res.status(200).json({ success: true, data: sellers });
});