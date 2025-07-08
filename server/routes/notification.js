const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');

router.get('/', authMiddleware, getNotifications);
router.put('/mark-read', authMiddleware, markNotificationsAsRead);

module.exports = router;