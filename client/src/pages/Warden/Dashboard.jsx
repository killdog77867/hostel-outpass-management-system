import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Approvals from './Approvals';
import StudentProfile from '../Student/StudentProfile';

const WardenDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [disciplineScore, setDisciplineScore] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (!token) {
      navigate('/warden/login');
      return;
    }

    if (storedUser) {
      setUser(storedUser);
    }

    const fetchPendingPasses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/warden/passes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPasses(response.data);
      } catch (error) {
        setMessage('Error fetching passes: ' + (error.response?.data?.error || 'Server error'));
      }
    };

    fetchPendingPasses();
  }, [navigate]);

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/warden/search-student', {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      const student = response.data;
      setPasses([student]);
      setDisciplineScore(student.discipline_score);
    } catch (error) {
      setMessage('Error searching student: ' + (error.response?.data?.error || 'Student not found'));
    }
  };

  const handleUpdatePass = (passId, warden_status, warden_comment) => {
    setPasses(passes.map(pass =>
      pass.id === passId ? { ...pass, warden_status, warden_comment } : pass
    ));
  };

  const handleViewProfile = (studentId) => {
    setSelectedStudent(studentId);
  };

  const handleCloseProfile = () => {
    setSelectedStudent(null);
  };

  const handleDisciplineScoreChange = async (studentId, newScore) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/warden/update-discipline',
        { student_id: studentId, change: newScore - disciplineScore },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDisciplineScore(newScore);
      setPasses(passes.map(pass =>
        pass.student_id === studentId ? { ...pass, discipline_score: newScore } : pass
      ));
      setMessage('Discipline score updated successfully');
    } catch (error) {
      setMessage('Error updating discipline score: ' + (error.response?.data?.error || 'Server error'));
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

      <div className="mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search by Student ID or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glow-input w-1/2"
          />
          <button onClick={handleSearch} className="glow-btn">
            Search
          </button>
        </div>
      </div>

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
                <p className="text-white"><strong>Student ID:</strong> {pass.student_id}</p>
                <p className="text-white"><strong>Name:</strong> {pass.student_name}</p>
                <p className="text-white"><strong>Discipline Score:</strong> {pass.discipline_score}</p>
                <p className="text-white"><strong>Type:</strong> {pass.pass_type}</p>
                <p className="text-white"><strong>From:</strong> {new Date(pass.from_date).toLocaleString()}</p>
                <p className="text-white"><strong>To:</strong> {new Date(pass.to_date).toLocaleString()}</p>
                <p className="text-white"><strong>Reason:</strong> {pass.reason}</p>
                <p className="text-white"><strong>Warden Status:</strong> {pass.warden_status}</p>
                <button
                  onClick={() => handleViewProfile(pass.student_id)}
                  className="glow-btn mt-2"
                >
                  View Profile
                </button>
                {pass.warden_status === 'Pending' && (
                  <>
                    <Approvals pass={pass} onUpdate={handleUpdatePass} />
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300">
                        Adjust Discipline Score: {disciplineScore || pass.discipline_score}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={disciplineScore || pass.discipline_score}
                        onChange={(e) => setDisciplineScore(parseInt(e.target.value))}
                        className="w-full accent-[#9333ea]"
                      />
                      <button
                        onClick={() => handleDisciplineScoreChange(pass.student_id, disciplineScore)}
                        className="glow-btn mt-2"
                      >
                        Update Score
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentProfile studentId={selectedStudent} onClose={handleCloseProfile} />
      )}

      {message && <p className="mt-4 text-center text-red-400 fade-in">{message}</p>}
    </div>
  );
};

export default WardenDashboard;