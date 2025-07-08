import React, { useState } from 'react';
import axios from 'axios';

const Approvals = ({ pass, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  const handleAction = async (warden_status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/warden/passes/${pass.id}`,
        { warden_status, warden_comment: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate(pass.id, warden_status, comment);
      setMessage(`Pass ${warden_status} successfully`);
    } catch (error) {
      setMessage('Error updating pass: ' + (error.response?.data?.error || 'Server WardenLogin.jsxerror'));
    }
  };

  return (
    <div className="mt-2">
      <textarea
        placeholder="Add a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="glow-input w-full p-2"
      />
      <div className="mt-2 flex space-x-2">
        <button
          onClick={() => handleAction('Approved')}
          className="glow-btn"
        >
          Approve
        </button>
        <button
          onClick={() => handleAction('Rejected')}
          className="glow-btn bg-gradient-to-r from-red-600 to-red-800"
        >
          Reject
        </button>
      </div>
      {message && <p className="mt-2 text-red-400">{message}</p>}
    </div>
  );
};

export default Approvals;