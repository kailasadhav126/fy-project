import { useState, useEffect, createContext, useContext } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

// Create Auth Context
const AuthContext = createContext(null)

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_token') !== null
  })
  const [user, setUser] = useState(null)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token')
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            if (data.user && data.user.role === 'admin') {
              setUser(data.user)
              setIsAuthenticated(true)
            } else {
              // Not an admin, logout
              localStorage.removeItem('admin_token')
              setIsAuthenticated(false)
            }
          } else {
            localStorage.removeItem('admin_token')
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('Auth check error:', error)
          localStorage.removeItem('admin_token')
          setIsAuthenticated(false)
        }
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Check if user is admin
        if (data.user.role === 'admin') {
          localStorage.setItem('admin_token', data.token)
          setUser(data.user)
          setIsAuthenticated(true)
          return { success: true }
        } else {
          return { success: false, error: 'Admin access required' }
        }
      }
      return { success: false, error: data.message || 'Login failed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
