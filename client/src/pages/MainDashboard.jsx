import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImg from '../assets/dashboard-bg.jpg'; // Add your background image here
import logo from '../assets/logo.png'; // Add your logo here

const quotes = [
  "Travel is the only thing you buy that makes you richer.",
  "Adventure is worthwhile in itself.",
  "The journey is the destination.",
  "Explore. Dream. Discover.",
  "Life is short, and the world is wide.",
];

const MainDashboard = () => {
  const navigate = useNavigate();
  const [currentQuote, setCurrentQuote] = useState('');

  useEffect(() => {
    // Set random quote
    try {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
    } catch (error) {
      console.error('Error setting quote:', error);
      setCurrentQuote(quotes[0]); // Fallback to first quote
    }

    // Redirect authenticated users
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      let user = null;

      if (userData) {
        try {
          user = JSON.parse(userData);
        } catch (parseError) {
          console.error('Error parsing user data from localStorage:', parseError);
          localStorage.removeItem('user'); // Clear invalid data
          return;
        }
      }

      // Only redirect if token and user role are valid
      if (token && user && user.role) {
        if (user.role === 'student') {
          navigate('/student/dashboard');
        } else if (user.role === 'warden') {
          navigate('/warden/dashboard');
        } else if (user.role === 'advisor') {
          navigate('/advisor/dashboard');
        }
      }
    } catch (error) {
      console.error('Error in redirect logic:', error);
      // Clear invalid data to prevent redirect loops
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [navigate]);

  return (
    <div
      className="particle-bg flex flex-col min-h-screen relative"
      style={{
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        style={{ zIndex: 0 }}
      ></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-[#2a1b3d] to-[#1a0b2e] text-white shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-16 items-center">
            <img src={logo} alt="Passporter Logo" className="h-16 w-16 mr-4" />
            <Link
              to="/"
              className="flex items-center"
              style={{
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Add a shadow for style
              }}
            >
              <span
                style={{
                  fontFamily: "'Roboto', sans-serif", // Modern font for "Pro"
                  fontSize: '4rem',
                  color: '#ffffff',
                  marginRight: '0.2em',
                }}
              >
                Pro
              </span>
              <span
                style={{
                  fontFamily: "'Lobster', cursive", // Stylish font for "Pass"
                  fontSize: '3rem',
                  color: '#9333ea',
                }}
              >
                Pass
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Quote Bar */}
      <div className="mt-20 bg-[#2a1b3d] bg-opacity-80 text-white py-4 text-center z-10">
        <p className="text-lg italic fade-in">{currentQuote || 'Explore. Dream. Discover.'}</p>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-6 z-10">
        <div className="flex flex-row gap-8 max-w-6xl mx-auto">
          {/* Student Card */}
          <Link
            to="/student/login"
            className="glow-border p-6 flex-1 flex flex-col items-center text-center fade-in pulse"
            style={{ animationDelay: '0.2s' }}
            aria-label="Navigate to Student Hub"
          >
            <svg
              className="h-12 w-12 text-[#9333ea] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2 className="text-xl font-bold text-white">Student Hub</h2>
            <p className="mt-2 text-gray-400">"Empower Your Wings"</p>
          </Link>

          {/* Advisor Card */}
          <Link
            to="/advisor/login"
            className="glow-border p-6 flex-1 flex flex-col items-center text-center fade-in pulse"
            style={{ animationDelay: '0.4s' }}
            aria-label="Navigate to Advisor Portal"
          >
            <svg
              className="h-12 w-12 text-[#9333ea] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="text-xl font-bold text-white">Advisor Portal</h2>
            <p className="mt-2 text-gray-400">"Guide with Wisdom"</p>
          </Link>

          {/* Warden Card */}
          <Link
            to="/warden/login"
            className="glow-border p-6 flex-1 flex flex-col items-center text-center fade-in pulse"
            style={{ animationDelay: '0.6s' }}
            aria-label="Navigate to Warden Command"
          >
            <svg
              className="h-12 w-12 text-[#9333ea] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-bold text-white">Warden Command</h2>
            <p className="mt-2 text-gray-400">"Guard with Authority"</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;