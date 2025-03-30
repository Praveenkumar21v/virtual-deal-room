const Deal = require('../models/Deal');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.getAnalytics = asyncHandler(async (req, res, next) => {

  const range = req.query.range || 'month';
  const dateFilter = getDateFilter(range);

  const completed = await Deal.countDocuments({ status: 'Completed', ...dateFilter });
  const pending = await Deal.countDocuments({ status: 'Pending', ...dateFilter });
  const inProgress = await Deal.countDocuments({ status: 'In Progress', ...dateFilter });
  const cancelled = await Deal.countDocuments({ status: 'Cancelled', ...dateFilter });

  const userEngagement = await Deal.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$buyer', dealCount: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { _id: 1, email: '$user.email', dealCount: 1 } },
    { $sort: { dealCount: -1 } },
    { $limit: 10 },
  ]);

  const dealsByMonth = await Deal.aggregate([
    { 
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { month: '$_id', count: 1, _id: 0 } }
  ]);

    const revenueByDeal = await Deal.aggregate([
      { $match: { status: 'Completed', ...dateFilter } },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      { $unwind: '$buyer' },
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'seller',
        },
      },
      { $unwind: '$seller' },
      { $sort: { price: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          title: 1,
          revenue: '$price',
          status: 1,
          buyer: '$buyer.email',
          seller: '$seller.email',
          createdAt: 1,
        },
      },
    ]);

  res.status(200).json({
    success: true,
    data: { completed, pending, inProgress, cancelled, userEngagement, dealsByMonth, revenueByDeal },
  });
});


function getDateFilter(range) {
  const now = new Date();
  let startDate;
  
  switch(range) {
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  return { createdAt: { $gte: startDate } };
}