require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis').RedisStore;
const { redisClient, connectRedis } = require('./config/redis');
const socketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);
socketService.init(server);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, 
    },
  })
);

app.use('/auth', require('./routes/authRoutes'));
app.use('/deals', require('./routes/dealRoutes'));
app.use('/chat', require('./routes/chatRoutes'));
app.use('/documents', require('./routes/documentRoutes'));
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/analytics', require('./routes/analyticsRoutes'));
app.use('/payments', require('./routes/paymentRoutes'));
app.use('/users', require('./routes/userRoutes'));

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    await connectRedis();
    console.log('Connected to Redis');

    const PORT = process.env.BACKEND_PORT || 8080;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};

startServer();

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;