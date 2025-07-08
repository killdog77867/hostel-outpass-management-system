import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainDashboard from './pages/MainDashboard';
import StudentLogin from './pages/Student/Login';
import StudentDashboard from './pages/Student/Dashboard';
import ApplyPass from './pages/Student/ApplyPass';
import StudentProfile from './pages/Student/StudentProfile';
import AdvisorLogin from './pages/Advisor/Login';
import AdvisorDashboard from './pages/Advisor/Dashboard';
import WardenLogin from './pages/Warden/Login';
import WardenDashboard from './pages/Warden/Dashboard';
import Approvals from './pages/Warden/Approvals';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/apply-pass" element={<ApplyPass />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/advisor/login" element={<AdvisorLogin />} />
        <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
        <Route path="/warden/login" element={<WardenLogin />} />
        <Route path="/warden/dashboard" element={<WardenDashboard />} />
        <Route path="/warden/approvals" element={<Approvals />} />
      </Routes>
    </Router>
  );
}

export default App;