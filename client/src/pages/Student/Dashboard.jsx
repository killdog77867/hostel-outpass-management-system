import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  extraHeaders: {
    "my-custom-header": "abcd"
  }
});

const StudentDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!token) {
      navigate('/student/login');
      return;
    }

    if (storedUser) {
      setUser(storedUser);
      socket.emit('join', { user_id: storedUser.id, user_role: 'student' });
    }

    const fetchPasses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/student/passes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPasses(response.data);
      } catch (error) {
        setMessage('Error fetching passes: ' + (error.response?.data?.error || 'Server error'));
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        setMessage('Error fetching notifications: ' + (error.response?.data?.error || 'Server error'));
      }
    };

    fetchPasses();
    fetchNotifications();

    socket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.off('notification');
    };
  }, [navigate]);

  const handleApplyPass = () => {
    navigate('/student/apply-pass');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="particle-bg min-h-screen p-6 pt-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#2a1b3d] to-[#1a0b2e] text-white shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-2xl font-bold tracking-tight">
              Passporter
            </Link>
            <div className="flex space-x-4">
              <button onClick={handleApplyPass} className="glow-btn">
                Apply for a Pass
              </button>
              <button onClick={handleLogout} className="glow-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white fade-in">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="mt-2 text-gray-400 fade-in">No notifications.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={notification.notification_id}
                className="glow-border p-4 fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <p className="text-white">{notification.message}</p>
                <p className="text-sm text-gray-400">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-white fade-in">Your Passes</h2>
        {passes.length === 0 ? (
          <p className="mt-2 text-gray-400 fade-in">No passes applied.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {passes.map((pass, index) => (
              <div
                key={pass.id}
                className="glow-border p-4 fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <p className="text-white"><strong>Type:</strong> {pass.pass_type}</p>
                <p className="text-white"><strong>From:</strong> {new Date(pass.from_date).toLocaleString()}</p>
                <p className="text-white"><strong>To:</strong> {new Date(pass.to_date).toLocaleString()}</p>
                <p className="text-white"><strong>Reason:</strong> {pass.reason}</p>
                <p className="text-white"><strong>Status:</strong> {pass.status}</p>
                <p className="text-white"><strong>Advisor Status:</strong> {pass.advisor_status}</p>
                <p className="text-white"><strong>Warden Status:</strong> {pass.warden_status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && <p className="mt-4 text-center text-red-400 fade-in">{message}</p>}
    </div>
  );
};

export default StudentDashboard;