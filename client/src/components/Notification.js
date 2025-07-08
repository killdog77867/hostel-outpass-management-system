import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Connect to the backend server

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Join the user's room for real-time notifications
        socket.emit('join', { user_id: parsedUser.id, user_role: parsedUser.role });

        // Fetch initial notifications
        axios
          .get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setNotifications(response.data);
          })
          .catch((error) => {
            console.error('Error fetching notifications:', error);
          });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Listen for real-time notifications
    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]); // Add new notification to the top
    });

    // Cleanup on unmount
    return () => {
      socket.off('notification');
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.notification_id}
              className={`p-4 rounded-lg shadow-md ${
                notif.is_read ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;