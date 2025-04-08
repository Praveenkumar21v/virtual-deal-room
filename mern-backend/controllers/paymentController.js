const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Deal = require('../models/Deal');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { getIO } = require('../services/socketService');

exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.dealId);
  if (!deal || deal.buyer.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  if (deal.status !== 'In Progress') {
    return next(new ErrorResponse('Deal must be In Progress to make payment', 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: deal.price * 100,
    currency: 'usd',
    metadata: { dealId: deal._id.toString() },
  });

  res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
});

exports.handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const dealId = paymentIntent.metadata.dealId;

    const deal = await Deal.findById(dealId);
    if (deal) {
      deal.status = 'Completed';
      await deal.save();

      const io = getIO();
      io.to(deal._id.toString()).emit('dealCompleted', deal);
      await createNotification(deal.seller, `Deal ${deal.title} completed`, deal._id);
    }
  }

  res.status(200).json({ received: true });
});