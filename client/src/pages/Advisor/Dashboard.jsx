import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const AdvisorDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!token) {
      navigate('/advisor/login');
      return;
    }

    if (storedUser) {
      setUser(storedUser);
    }

    const fetchPendingPasses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/advisor/passes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPasses(response.data);
      } catch (error) {
        setMessage('Error fetching passes: ' + (error.response?.data?.error || 'Server error'));
      }
    };

    fetchPendingPasses();
  }, [navigate]);

  const handleAction = async (passId, advisor_status, advisor_comment = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/advisor/passes/${passId}`,
        { advisor_status, advisor_comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasses(passes.map(pass =>
        pass.id === passId ? { ...pass, advisor_status, advisor_comment } : pass
      ));
      setMessage(`Pass ${advisor_status} successfully`);
    } catch (error) {
      setMessage('Error updating pass: ' + (error.response?.data?.error || 'Server error'));
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
              Pro Pass
            </Link>
            <button onClick={handleLogout} className="glow-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold text-white fade-in">Pending Passes</h2>
        {passes.length === 0 ? (
          <p className="mt-2 text-gray-400 fade-in">No pending passes.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {passes.map((pass, index) => (
              <div
                key={pass.id}
                className="glow-border p-4 fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <p className="text-white"><strong>Type:</strong> {pass.pass_type}</p>
                <p className="text-white"><strong>Student ID:</strong> {pass.student_id}</p>
                <p className="text-white"><strong>From:</strong> {new Date(pass.from_date).toLocaleString()}</p>
                <p className="text-white"><strong>To:</strong> {new Date(pass.to_date).toLocaleString()}</p>
                <p className="text-white"><strong>Reason:</strong> {pass.reason}</p>
                <p className="text-white"><strong>Status:</strong> {pass.advisor_status}</p>
                {pass.advisor_status === 'Pending' && (
                  <div className="mt-2">
                    <textarea
                      placeholder="Add a comment (optional)"
                      className="glow-input w-full p-2"
                      onChange={(e) => (pass.advisor_comment = e.target.value)}
                    />
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleAction(pass.id, 'Approved', pass.advisor_comment || '')}
                        className="glow-btn"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(pass.id, 'Rejected', pass.advisor_comment || '')}
                        className="glow-btn bg-gradient-to-r from-red-600 to-red-800"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {message && <p className="mt-4 text-center text-red-400 fade-in">{message}</p>}
    </div>
  );
};

export default AdvisorDashboard;