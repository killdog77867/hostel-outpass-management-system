import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const WardenLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
  
    const endpoint = isSignUp ? '/register' : '/login';
    const payload = isSignUp
      ? { name, email, password }
      : { email, password };
  
    try {
      const response = await axios.post(
        `http://localhost:5000/api/warden${endpoint}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.data.success) {
        throw new Error(response.data.error || 'Authentication failed');
      }
  
      const { token, user } = response.data.data;
      
      if (!token || !user) {
        throw new Error('Authentication data missing');
      }
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);
      
      navigate('/warden/dashboard');
  
    } catch (error) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'Login failed';
      setMessage(errorMsg);
      console.error('Auth error:', error.response?.data || error);
    }
  };

  return (
    <div className="particle-bg min-h-screen flex items-center justify-center p-6">
      <div className="glow-border p-6 w-full max-w-md fade-in">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Hostel Outpass System
        </h2>
        <h3 className="text-xl font-semibold text-gray-300 mb-6 text-center">
          {isSignUp ? 'Warden Sign Up' : 'Warden Login'}
        </h3>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glow-input w-full"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glow-input w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glow-input w-full"
              required
            />
          </div>
          <button type="submit" className="glow-btn w-full">
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-gray-400">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="hover:text-[#9333ea] transition-colors"
          >
            {isSignUp ? 'Already have an account? Login' : ''}
          </button>
          <Link to="/" className="hover:text-[#9333ea] transition-colors">
            Back to Home
          </Link>
        </div>
        {message && <p className="mt-4 text-center text-red-400">{message}</p>}
      </div>
    </div>
  );
};

export default WardenLogin;