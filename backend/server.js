const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const User = require('./models/User');

let MongoMemoryServer;
try {
  // Optional dev dependency
  ({ MongoMemoryServer } = require('mongodb-memory-server'));
} catch {
  MongoMemoryServer = null;
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const interviewRoutes = require('./routes/interviews');
const aiRoutes = require('./routes/ai');
const progressRoutes = require('./routes/progress');
const mcqRoutes = require('./routes/mcq');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === 'production';

// Define allowed origins for CORS
// FRONTEND_URL may be a single URL or a comma-separated list of URLs
const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3001')
  .split(',')
  .map((u) => u.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...frontendUrls,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

const isAllowedOrigin = (origin) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return true;

  // Explicitly allow configured / common dev origins
  if (allowedOrigins.includes(origin)) return true;

  // In development, allow localhost / 127.0.0.1 on any port
  if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;

  return false;
};

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());
app.use(compression());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  // In development, allow more requests (dashboard/progress polling + sockets)
  max: isProduction
    ? (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100)
    : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // When mounted at /api/, req.path is relative to that mount.
    return req.path === '/health';
  },
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  // Explicitly allow headers needed for JSON + multipart/form-data uploads.
  // Without this, the CORS preflight (OPTIONS) for file uploads can fail in
  // production because the reverse proxy or browser sends extra headers that
  // the default reflection doesn't cover reliably.
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS']
};
// Handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session (needed only for Passport OAuth state during the redirect flow)
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      // 'none' (cross-site) is required when frontend and backend are on different
      // origins (e.g. Vercel + Render). Must pair with secure:true which is set in
      // production. 'lax' is safe for same-origin local dev.
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes – just long enough for the OAuth round-trip
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prepiq';
let mongoMemoryServer = null;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mcq', require('./middleware/auth').authenticateToken, mcqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/realtime', require('./routes/realtime'));
app.use('/api/ai-interview', require('./routes/aiInterview'));
app.use('/api/coding', require('./routes/coding'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/admin/coding-questions', require('./routes/adminCodingQuestions'));
app.use('/api/quick-practice', require('./routes/quickPractice'));
app.use('/api/admin/quick-practice-questions', require('./routes/adminQuickPracticeQuestions'));
app.use('/api/preparation-sheet', require('./routes/preparationSheet'));
app.use('/api/admin/preparation-sheet', require('./routes/adminPreparationSheet'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PrepIQ API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Socket.IO real-time features
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join interview room
  socket.on('join-interview', (sessionId) => {
    socket.join(`interview-${sessionId}`);
    console.log(`👤 User ${socket.id} joined interview ${sessionId}`);
  });

  // Real-time code sharing
  socket.on('code-update', (data) => {
    socket.to(`interview-${data.sessionId}`).emit('code-update', data);
  });

  // Real-time interview progress
  socket.on('interview-progress', (data) => {
    socket.to(`interview-${data.sessionId}`).emit('interview-progress', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error('   Stop the other process using it, or start this server with a different PORT.');
    console.error('   Example (PowerShell): $env:PORT=5001; npm start');
    process.exit(1);
  }

  console.error('❌ Server error:', err);
  process.exit(1);
});

// Auto-promote admin users from environment variable
const promoteAdminsFromEnv = async () => {
  try {
    const adminEmails = process.env.ADMIN_EMAILS;
    if (!adminEmails || adminEmails.trim() === '') {
      return; // No admin emails configured
    }

    const emailList = adminEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0); // Remove empty strings

    if (emailList.length === 0) {
      return;
    }

    console.log(`Checking admin configuration for ${emailList.length} email(s)...`);

    for (const email of emailList) {
      const user = await User.findOne({ email });
      
      if (!user) {
        console.log(`⚠️  Admin email not found (user must register first): ${email}`);
        continue;
      }

      if (user.role === 'admin') {
        console.log(`Already admin: ${email}`);
      } else {
        user.role = 'admin';
        await user.save();
        console.log(`Promoted to admin: ${email}`);
      }
    }
  } catch (err) {
    console.error('❌ Error promoting admins:', err.message);
    // Don't fail server startup if admin promotion fails
  }
};

const start = async () => {
  try {
    try {
      // Note: useNewUrlParser and useUnifiedTopology were removed in Mongoose 7
      // and should not be passed — they cause deprecation warnings.
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: isProduction ? 15000 : 5000,
        socketTimeoutMS: isProduction ? 45000 : 10000,
        retryWrites: true,
        maxPoolSize: isProduction ? 10 : 5,
        minPoolSize: isProduction ? 2 : 1,
      });
      console.log('MongoDB connected successfully');
    } catch (err) {
      const allowInMemory = !isProduction && process.env.USE_IN_MEMORY_MONGO !== 'false';

      if (allowInMemory && MongoMemoryServer) {
        console.warn('⚠️  MongoDB not reachable. Starting in-memory MongoDB for development...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log('In-memory MongoDB started successfully');
      } else {
        throw err;
      }
    }

    // Auto-promote admin users from ADMIN_EMAILS environment variable
    await promoteAdminsFromEnv();

    server.listen(PORT, () => {
      console.log(`PrepIQ Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
      console.log(`🔌 Socket.IO enabled for real-time features`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const shutdown = async () => {
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  if (mongoMemoryServer) {
    try {
      await mongoMemoryServer.stop();
    } catch {
      // ignore
    }
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
