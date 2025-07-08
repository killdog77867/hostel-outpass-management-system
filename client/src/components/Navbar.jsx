import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/Navbar.css';

const socket = io('http://localhost:5000'); // Connect to the backend server

const Navbar = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Load username, role, and notifications from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Set username based on role
        if (parsedUser.role === 'student') {
          setUsername(parsedUser.name || parsedUser.username || "Student");
        } else if (parsedUser.role === 'advisor') {
          setUsername(parsedUser.name || parsedUser.email || "Advisor");
        } else if (parsedUser.role === 'warden') {
          setUsername(parsedUser.name || parsedUser.email || "Warden");
        }
        setRole(parsedUser.role || "");

        // Join the user's room for real-time notifications
        socket.emit('join', { user_id: parsedUser.id, user_role: parsedUser.role });

        // Fetch initial notifications for all roles
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
        setUsername("");
        setRole("");
      }
    }

    // Listen for real-time notifications for all roles
    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]); // Add new notification to the top
    });

    // Cleanup on unmount
    return () => {
      socket.off('notification');
    };
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown on username click
  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
    setIsNotificationsOpen(false); // Close notifications dropdown if open
  };

  // Toggle notifications dropdown for all roles
  const handleNotificationsToggle = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsDropdownOpen(false); // Close user dropdown if open

    // Mark notifications as read when opening the dropdown
    if (!isNotificationsOpen) {
      const token = localStorage.getItem('token');
      axios
        .put(
          'http://localhost:5000/api/notifications/mark-read',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          // Update local state to mark notifications as read
          setNotifications((prev) =>
            prev.map((notif) => ({ ...notif, is_read: true }))
          );
        })
        .catch((error) => {
          console.error('Error marking notifications as read:', error);
        });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsername("");
    setRole("");
    setIsDropdownOpen(false);
    setIsNotificationsOpen(false);
    navigate("/");
  };

  // Handle profile navigation (only for students)
  const handleProfile = () => {
    setIsDropdownOpen(false); // Close dropdown
    navigate("/student/profile");
  };

  // Calculate unread notifications count for all roles
  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Passporter
          </Link>
          {username ? (
            <div className="flex items-center space-x-4">
              {/* Notifications Bell Button (for all roles) */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={handleNotificationsToggle}
                  className="relative flex items-center focus:outline-none"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-black rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-2 text-gray-500">No notifications</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.notification_id}
                          className={`px-4 py-2 border-b last:border-b-0 ${
                            notif.is_read ? 'bg-gray-100' : 'bg-white'
                          }`}
                        >
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Username Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={handleDropdownToggle}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span className="text-lg">{username}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg">
                    {/* Show Profile option only for students */}
                    {role === 'student' && (
                      <button
                        onClick={handleProfile}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                      >
                        Profile
                      </button>
                    )}
                    {/* Logout option for all roles */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-lg">
              
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;