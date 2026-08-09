import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

import StudentDashboard from './pages/student/Dashboard'
import QuizList from './pages/student/QuizList'
import QuizDetails from './pages/student/QuizDetails'
import QuizAttempt from './pages/student/QuizAttempt'
import Result from './pages/student/Result'
import History from './pages/student/History'
import Leaderboard from './pages/student/Leaderboard'

import AdminDashboard from './pages/admin/Dashboard'
import Categories from './pages/admin/Categories'
import Quizzes from './pages/admin/Quizzes'
import QuizForm from './pages/admin/QuizForm'
import QuestionManager from './pages/admin/QuestionManager'
import Students from './pages/admin/Students'
import Results from './pages/admin/Results'
import Analytics from './pages/admin/Analytics'
import AdminLeaderboard from './pages/admin/Leaderboard'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student routes */}
          <Route path="/student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/quizzes" element={<ProtectedRoute role="STUDENT"><QuizList /></ProtectedRoute>} />
          <Route path="/student/quizzes/:id" element={<ProtectedRoute role="STUDENT"><QuizDetails /></ProtectedRoute>} />
          <Route path="/student/attempt/:attemptId" element={<ProtectedRoute role="STUDENT"><QuizAttempt /></ProtectedRoute>} />
          <Route path="/student/result/:attemptId" element={<ProtectedRoute role="STUDENT"><Result /></ProtectedRoute>} />
          <Route path="/student/history" element={<ProtectedRoute role="STUDENT"><History /></ProtectedRoute>} />
          <Route path="/student/leaderboard" element={<ProtectedRoute role="STUDENT"><Leaderboard /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute role="ADMIN"><Categories /></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute role="ADMIN"><Quizzes /></ProtectedRoute>} />
          <Route path="/admin/quizzes/new" element={<ProtectedRoute role="ADMIN"><QuizForm /></ProtectedRoute>} />
          <Route path="/admin/quizzes/:id/edit" element={<ProtectedRoute role="ADMIN"><QuizForm /></ProtectedRoute>} />
          <Route path="/admin/quizzes/:quizId/questions" element={<ProtectedRoute role="ADMIN"><QuestionManager /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="ADMIN"><Students /></ProtectedRoute>} />
          <Route path="/admin/results" element={<ProtectedRoute role="ADMIN"><Results /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="ADMIN"><Analytics /></ProtectedRoute>} />
          <Route path="/admin/leaderboard" element={<ProtectedRoute role="ADMIN"><AdminLeaderboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
