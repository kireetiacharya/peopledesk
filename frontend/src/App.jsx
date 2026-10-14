import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import EmployeeDashboard from './pages/EmployeeDashboard.jsx'

function ProtectedRoute({ role, children }) {
  const { employee } = useAuth()
  if (!employee) return <Navigate to="/login" replace />
  if (role && employee.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

function DashboardRedirect() {
  const { employee } = useAuth()
  if (!employee) return <Navigate to="/login" replace />
  return <Navigate to={employee.role === 'ADMIN' ? '/admin' : '/employee'} replace />
}

export default function App() {
  const { employee } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={employee ? <DashboardRedirect /> : <Login />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />
      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/employee" element={<ProtectedRoute role="EMPLOYEE"><EmployeeDashboard /></ProtectedRoute>} />
      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  )
}
