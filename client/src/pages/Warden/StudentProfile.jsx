import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentProfile = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/student/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudent(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching student profile');
      }
    };
    fetchStudentProfile();
  }, [studentId]);

  if (!student && !error) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Student Profile</h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <p><strong>Student ID:</strong> {student.student_id}</p>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Class:</strong> {student.class}</p>
            <p><strong>Discipline Score:</strong> {student.discipline_score}</p>
            <p><strong>Blood Group:</strong> {student.blood_group || 'N/A'}</p>
            <p><strong>Mother Tongue:</strong> {student.mother_tongue || 'N/A'}</p>
            <p><strong>Gender:</strong> {student.gender || 'N/A'}</p>
            <p><strong>Native Place:</strong> {student.native_place || 'N/A'}</p>
            <p><strong>State:</strong> {student.state || 'N/A'}</p>
            <p><strong>Nationality:</strong> {student.nationality || 'N/A'}</p>
            <p><strong>Parents Info:</strong> {student.parents_info || 'N/A'}</p>
            <p><strong>Address:</strong> {student.address || 'N/A'}</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;