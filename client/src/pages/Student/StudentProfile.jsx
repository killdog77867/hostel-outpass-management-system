import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';

const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const navigate = useNavigate();
  const { studentId } = useParams();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      navigate('/login');
      return;
    }

    const idToFetch = studentId || user.id;

    axios
      .get(`http://localhost:5000/api/student/${idToFetch}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setStudent(response.data);
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      });
  }, [studentId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!student) return <div className="particle-bg min-h-screen flex items-center justify-center text-white">Loading...</div>;

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

      <div className="max-w-4xl mx-auto glow-border p-6 fade-in">
        <h2 className="text-2xl font-bold text-white mb-4">Student Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-white"><strong>Student ID:</strong> {student.student_id}</p>
            <p className="text-white"><strong>Name:</strong> {student.name}</p>
            <p className="text-white"><strong>Email:</strong> {student.email}</p>
            <p className="text-white"><strong>Department:</strong> {student.class}</p>
            <p className="text-white"><strong>Discipline Score:</strong> {student.discipline_score}</p>
            <p className="text-white"><strong>Blood Group:</strong> {student.blood_group || 'Not provided'}</p>
            <p className="text-white"><strong>Mother Tongue:</strong> {student.mother_tongue || 'Not provided'}</p>
            <p className="text-white"><strong>Gender:</strong> {student.gender || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-white"><strong>Native Place:</strong> {student.native_place || 'Not provided'}</p>
            <p className="text-white"><strong>State:</strong> {student.state || 'Not provided'}</p>
            <p className="text-white"><strong>Nationality:</strong> {student.nationality || 'Not provided'}</p>
            <p className="text-white"><strong>Parents' Info:</strong> {student.parents_info || 'Not provided'}</p>
            <p className="text-white"><strong>Address:</strong> {student.address || 'Not provided'}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => navigate(-1)}
            className="glow-btn"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;