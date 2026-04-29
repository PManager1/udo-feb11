import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login/" element={<LoginPage />} />
        <Route path="/signup/" element={<SignupPage />} />
        <Route path="/verifyOtp" element={<VerifyOtpPage />} />
        <Route path="/settings/" element={<SettingsPage />} />
      </Routes>
    </div>
  )
}

export default App