import './App.css'
import LandingPage from './LandingPage.jsx'
import LoginPage from './LoginPage.jsx'
import { Routes, Route } from 'react-router'
import StudentDashboard from './dashboard/StudentDashboard.jsx';
import SignupPage from './SignUpPage.jsx';
import TeacherDashboard from './teacher/TeacherDashboard.jsx';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard/student" element={<StudentDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
      </Routes>
    </>
  )
}

export default App
