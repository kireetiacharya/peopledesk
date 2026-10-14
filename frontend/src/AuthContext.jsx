import { createContext, useContext, useMemo, useState } from 'react'
import api from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(() => {
    const stored = localStorage.getItem('ems-employee')
    return stored ? JSON.parse(stored) : null
  })

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('ems-token', data.token)
    localStorage.setItem('ems-employee', JSON.stringify(data.employee))
    setEmployee(data.employee)
  }

  function logout() {
    localStorage.removeItem('ems-token')
    localStorage.removeItem('ems-employee')
    setEmployee(null)
  }

  function updateEmployee(nextEmployee) {
    localStorage.setItem('ems-employee', JSON.stringify(nextEmployee))
    setEmployee(nextEmployee)
  }

  const value = useMemo(() => ({ employee, login, logout, updateEmployee }), [employee])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
