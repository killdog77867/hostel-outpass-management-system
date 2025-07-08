// server/index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Import Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const advisorRoutes = require('./routes/advisor');
const wardenRoutes = require('./routes/warden');
const notificationRoutes = require('./routes/notification');

// Import Models
const { createStudentTable } = require('./models/Student');
const { createAdvisorTable } = require('./models/Advisor');
const { createWardenTable } = require('./models/Warden');
const { createPassTable } = require('./models/Pass');
const { createNotificationTable } = require('./models/Notifications');
const db = require('./config/db'); // Ensure DB connection

const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust if frontend runs on a different port
    methods: ["GET", "POST"]
  }
});

// Pass io to Notification Controller
const { setupNotificationSystem } = require('./controllers/notificationController');
setupNotificationSystem(io); // Initialize notifications

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/warden', wardenRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO Connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a room based on user_id and role
  socket.on('join', ({ user_id, user_role }) => {
    const room = `${user_role}_${user_id}`; // e.g., "student_S141", "advisor_A001"
    socket.join(room);
    console.log(`User ${user_id} (${user_role}) joined room: ${room}`);
  });

  // Listen for disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Initialize Database
const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    await createAdvisorTable();
    await createStudentTable();
    await createWardenTable();
    await createPassTable();
    await createNotificationTable();
    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
};

// Start Server
initializeDatabase()
  .then(() => {
    const PORT = 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Server startup failed:', err));

// Test Route
app.get('/test', (req, res) => {
  res.send('✅ Server is working fine');
});

// Export app and io for use elsewhere
module.exports = { app, io };