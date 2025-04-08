const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Deal = require('../models/Deal');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadDocument = upload.single('document');

exports.storeDocument = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.dealId);
  if (!deal || deal.buyer.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  if (!req.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }
  const { access } = req.body;

  if (!['buyer', 'seller', 'both'].includes(access)) {
    return next(new ErrorResponse('Invalid access type', 400));
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `deals/${deal._id}` },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(req.file.buffer);
  });

  deal.documents = deal.documents || [];
  deal.documents.push({
    url: result.secure_url,
    publicId: result.public_id,
    uploadedBy: req.user.id,
    access,
  });
  await deal.save();

  res.status(201).json({ success: true, data: result.secure_url });
});

exports.getDocuments = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.dealId)
    .populate('buyer', 'email')
    .populate('seller', 'email');

  if (!deal || (deal.buyer._id.toString() !== req.user.id && deal.seller._id.toString() !== req.user.id)) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  const filteredDocuments = deal.documents.filter(doc => {
    if (doc.access === 'both') return true;
    if (doc.access === 'buyer' && req.user.id === deal.buyer._id.toString()) return true;
    if (doc.access === 'seller' && req.user.id === deal.seller._id.toString()) return true;
    return false;
  });

  res.status(200).json({ success: true, data: filteredDocuments });
})