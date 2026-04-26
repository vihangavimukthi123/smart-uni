require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const eventRoutes = require('./routes/eventRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reminderService = require('./services/reminderService');
const momentumRoutes = require('./routes/momentumRoutes');


// Rental Routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const packageRoutes = require('./routes/packageRoutes');
const offerRoutes = require('./routes/offerRoutes');

// Learning Routes
const learningResourceRoutes = require('./routes/learningResourceRoutes');
const peerRoutes = require('./routes/peerRoutes');
const peerReviewRoutes = require('./routes/peerReviewRoutes');
const requestRoutes = require('./routes/requestRoutes');
const taskRoutes = require('./routes/taskRoutes');


// ── Initialize App ──────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ── Socket.io Setup ─────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log(`Admin joined admin_room`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// app.use(globalLimiter);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🏢 MATRIX CORP API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/momentum', momentumRoutes);

// Rental routes (specific to general)
app.use('/api/rental/packages', packageRoutes);
app.use('/api/rental/offers', offerRoutes);
app.use('/api/rental/products', productRoutes);
app.use('/api/rental/orders', orderRoutes);
app.use('/api/rental/reviews', reviewRoutes);
app.use('/api/rental/suppliers', supplierRoutes);

// Learning API
app.use('/api/learning/resources', learningResourceRoutes);
app.use('/api/learning/peers', peerRoutes);
app.use('/api/learning/peerreviews', peerReviewRoutes);
app.use('/api/learning/requests', requestRoutes);
app.use('/api/learning/tasks', taskRoutes);
app.use('/api/momentum', momentumRoutes);


// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`📡 Socket.io ready`);
  console.log(`🌐 API: http://localhost:${PORT}/api/health\n`);
  
  // Initialize Reminder Service (Agenda persistent jobs)
  try {
    await reminderService.start();
  } catch (err) {
    console.error("Failed to start reminder service:", err);
  }
});

module.exports = { app, server, io };
