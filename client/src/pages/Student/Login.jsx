import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [motherTongue, setMotherTongue] = useState('');
  const [gender, setGender] = useState('');
  const [nativePlace, setNativePlace] = useState('');
  const [state, setState] = useState('');
  const [nationality, setNationality] = useState('');
  const [parentsInfo, setParentsInfo] = useState('');
  const [address, setAddress] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? '/register' : '/login';
    const payload = isSignUp
      ? {
          name,
          email,
          password,
          class: className,
          bloodGroup,
          motherTongue,
          gender,
          nativePlace,
          state,
          nationality,
          parentsInfo,
          address,
        }
      : { email, password };

    try {
      const response = await axios.post(`http://localhost:5000/api/student${endpoint}`, payload);
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Token or user data missing in response');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('role', 'student');
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/student/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Server error');
    }
  };

  return (
    <div className="particle-bg min-h-screen flex items-center justify-center p-6">
      <div className="glow-border p-6 w-full max-w-md fade-in">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Hostel Outpass System
        </h2>
        <h3 className="text-xl font-semibold text-gray-300 mb-6 text-center">
          {isSignUp ? 'Student Sign Up' : 'Student Login'}
        </h3>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
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
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="Enter your department (e.g., CS101)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="glow-input w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Blood Group</label>
                <input
                  type="text"
                  placeholder="Enter your blood group (e.g., A+)"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="glow-input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Mother Tongue</label>
                <input
                  type="text"
                  placeholder="Enter your mother tongue"
                  value={motherTongue}
                  onChange={(e) => setMotherTongue(e.target.value)}
                  className="glow-input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="glow-input w-full"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Native Place</label>
                <input
                  type="text"
                  placeholder="Enter your native place"
                  value={nativePlace}
                  onChange={(e) => setNativePlace(e.target.value)}
                  className="glow-input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">State</label>
                <input
                  type="text"
                  placeholder="Enter your state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="glow-input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Nationality</label>
                <input
                  type="text"
                  placeholder="Enter your nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="glow-input w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Parents' Info</label>
                <textarea
                  placeholder="Enter parents' info (e.g., names, contact)"
                  value={parentsInfo}
                  onChange={(e) => setParentsInfo(e.target.value)}
                  className="glow-input w-full"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-1">Address</label>
                <textarea
                  placeholder="Enter your address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="glow-input w-full"
                  rows="3"
                />
              </div>
            </>
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

export default StudentLogin;