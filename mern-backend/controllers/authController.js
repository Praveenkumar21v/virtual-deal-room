const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { redisClient } = require('../config/redis');

// Register a new user
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  const user = await User.create({
    email,
    password,
    role: role || 'buyer',
  });

  sendTokenResponse(user, 201, res);
});

// Login a user
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  await redisClient.setEx(`session:${user._id}`, 3600, JSON.stringify({ id: user._id, role: user.role }));

  sendTokenResponse(user, 200, res);

  sendTokenResponse(user, 200, res);
});

// Get current user
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// Logout user
exports.logout = asyncHandler(async (req, res) => {
  await redisClient.del(`session:${req.user.id}`);
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, data: {} });
});

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    role: user.role,
  });
};