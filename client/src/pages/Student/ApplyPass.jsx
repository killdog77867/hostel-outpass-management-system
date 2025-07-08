import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const ApplyPass = () => {
  const [passType, setPassType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const validatePassApplication = () => {
    const now = new Date();
    const from = new Date(fromDate);
    const timeDifference = from - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      setMessage('You must apply for a pass at least 24 hours in advance.');
      return false;
    }

    if (passType === 'Outpass') {
      const from = new Date(fromDate);
      const to = new Date(toDate);

      const sameDay =
        from.getFullYear() === to.getFullYear() &&
        from.getMonth() === to.getMonth() &&
        from.getDate() === to.getDate();

      if (!sameDay) {
        setMessage('Outpass must be for the same day (morning to night).');
        return false;
      }

      const fromHours = from.getHours();
      const toHours = to.getHours();

      const startHour = 8;
      const endHour = 20;

      if (fromHours < startHour || toHours > endHour) {
        setMessage('Outpass time must be between 8:00 AM and 8:00 PM.');
        return false;
      }

      if (to <= from) {
        setMessage('To Date/Time must be after From Date/Time.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!reason.trim()) {
      setMessage('Reason is required.');
      return;
    }

    if (!validatePassApplication()) {
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/student/apply-pass',
        { pass_type: passType, from_date: fromDate, to_date: toDate, reason },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate('/student/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to apply pass');
    }
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
            <button onClick={handleLogout} className="glow-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center">
        <div className="glow-border p-6 w-full max-w-md fade-in">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Apply for a Pass</h2>
          <form onSubmit={handleSubmit}>
            <select
              value={passType}
              onChange={(e) => setPassType(e.target.value)}
              className="glow-input w-full mb-4"
              required
            >
              <option value="">Select Pass Type</option>
              <option value="Outpass">Outpass</option>
              <option value="Homepass">Homepass</option>
              <option value="Emergency">Emergency</option>
            </select>
            <input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="glow-input w-full mb-4"
              required
            />
            <input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="glow-input w-full mb-4"
              required
            />
            <textarea
              placeholder="Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="glow-input w-full mb-4"
              required
            />
            <button type="submit" className="glow-btn w-full">
              Apply
            </button>
          </form>
          {message && <p className="mt-4 text-center text-red-400">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ApplyPass;