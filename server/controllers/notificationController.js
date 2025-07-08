const db = require('../config/db'); // MySQL connection
let io; // Store the Socket.IO instance

// Initialize the notification system with Socket.IO
const setupNotificationSystem = (socketIo) => {
  io = socketIo;
  console.log('✅ Notification system initialized with Socket.IO');
};

// Create a notification and emit it via Socket.IO
const createNotification = async (user_id, user_role, message) => {
  try {
    // Validate inputs
    if (!user_id || !user_role || !message) {
      throw new Error('Missing required fields: user_id, user_role, or message');
    }

    // Insert the notification into the database
    const [result] = await db.query(
      'INSERT INTO notifications (user_id, user_role, message) VALUES (?, ?, ?)',
      [user_id, user_role, message]
    );

    // Fetch the newly created notification (optimized to select only necessary columns)
    const [notification] = await db.query(
      'SELECT notification_id, user_id, user_role, message, is_read, created_at FROM notifications WHERE notification_id = ?',
      [result.insertId]
    );

    if (!notification.length) {
      throw new Error('Failed to fetch newly created notification');
    }

    // Emit the notification to the user's room via Socket.IO
    if (io) {
      const room = `${user_role}_${user_id}`; // e.g., "student_S141"
      io.to(room).emit('notification', notification[0]);
      console.log(`📢 Notification emitted to room ${room}:`, notification[0]);
    } else {
      console.warn('⚠️ Socket.IO instance not initialized. Notification will not be emitted in real-time:', {
        user_id,
        user_role,
        message,
      });
    }

    return notification[0]; // Return the notification for potential use by the caller
  } catch (error) {
    console.error('❌ Error creating notification for user:', { user_id, user_role, message }, error);
    throw error; // Re-throw the error so the caller can handle it
  }
};

// Fetch notifications for a user with pagination
const getNotifications = async (req, res) => {
  const user_id = req.user.id;
  const user_role = req.user.role;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [notifications] = await db.query(
      'SELECT notification_id, user_id, user_role, message, is_read, created_at FROM notifications WHERE user_id = ? AND user_role = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [user_id, user_role, limit, offset]
    );

    console.log(`📥 Fetched ${notifications.length} notifications for ${user_role} ${user_id} (page ${page}, limit ${limit})`);
    res.json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications for user:', { user_id, user_role }, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    const [result] = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND user_role = ? AND is_read = FALSE',
      [user_id, user_role]
    );

    console.log(`✅ Marked ${result.affectedRows} notifications as read for ${user_role} ${user_id}`);
    res.json({ message: `Marked ${result.affectedRows} notifications as read` });
  } catch (error) {
    console.error('❌ Error marking notifications as read for user:', { user_id, user_role }, error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  setupNotificationSystem,
  createNotification,
  getNotifications,
  markNotificationsAsRead,
};