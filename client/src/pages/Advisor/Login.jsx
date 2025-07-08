import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AdvisorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [advisorClass, setAdvisorClass] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? '/register' : '/login';
    const payload = isSignUp
      ? { name, email, password, class: advisorClass }
      : { email, password };

    try {
      const response = await axios.post(`http://localhost:5000/api/advisor${endpoint}`, payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'advisor');
      localStorage.setItem('user', JSON.stringify(response.data.advisor));
      navigate('/advisor/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Server error');
    }
  };

  return (
    <div className="particle-bg min-h-screen flex items-center justify-center p-6">
      <div className="glow-border p-6 w-full max-w-md fade-in">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Hostel Outpass System
        </h2>
        <h3 className="text-xl font-semibold text-gray-300 mb-6 text-center">
          {isSignUp ? 'Advisor Sign Up' : 'Advisor Login'}
        </h3>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glow-input w-full mb-4"
                required
              />
              <input
                type="text"
                placeholder="Class (e.g., CS101)"
                value={advisorClass}
                onChange={(e) => setAdvisorClass(e.target.value)}
                className="glow-input w-full mb-4"
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glow-input w-full mb-4"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glow-input w-full mb-4"
            required
          />
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

export default AdvisorLogin;