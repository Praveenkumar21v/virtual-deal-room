const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Deal = require('../models/Deal');
const { redisClient } = require('../config/redis');

let io;

exports.init = (server) => {
  io = socketio(server, {
    cors: { origin:process.env.CLIENT_URL, methods: ['GET', 'POST'], credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error: No token provided'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Authentication error: User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User  ${socket.user.id} connected`);

redisClient.setEx(`online:${socket.user.id}`, 3600, 'true');

    socket.on('joinDeal', async (dealId) => {
      socket.join(dealId);
      console.log(`User  ${socket.user.id} joined deal ${dealId}`);

      const deal = await Deal.findById(dealId);
      if (deal) {
        const otherUserId = deal.buyer.toString() === socket.user.id ? deal.seller : deal.buyer;
        io.to(dealId).emit('userOnline', { userId: socket.user.id });
      }
    });

    socket.on('negotiatePrice', async ({ dealId, newPrice }) => {
      const deal = await Deal.findById(dealId);
      if (!deal || (deal.buyer.toString() !== socket.user.id && deal.seller.toString() !== socket.user.id)) {
        socket.emit('error', 'Not authorized');
        return;
      }

      deal.price = newPrice;
      await deal.save();
      io.to(dealId).emit('priceUpdate', { dealId, price: newPrice, updatedBy: socket.user.id });
    });

    socket.on('typing', ({ dealId }) => {
      socket.to(dealId).emit('userTyping', { userId: socket.user.id });
    });

    socket.on('stopTyping', ({ dealId }) => {
      socket.to(dealId).emit('userStoppedTyping', { userId: socket.user.id });
    });

    socket.on('disconnect', async () => {
      console.log(`User  ${socket.user.id} disconnected`);
      await redisClient.del(`online:${socket.user.id}`);

      const deals = await Deal.find({
        $or: [{ buyer: socket.user.id }, { seller: socket.user.id }],
      });
      deals.forEach((deal) => {
        io.to(deal._id.toString()).emit('userOffline', { userId: socket.user.id });
      });
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
