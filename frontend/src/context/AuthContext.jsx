import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('cl_token')
    const u = localStorage.getItem('cl_user')
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
    setLoading(false)
  }, [])

  const login = (tokenVal, userVal) => {
    setToken(tokenVal); setUser(userVal)
    localStorage.setItem('cl_token', tokenVal)
    localStorage.setItem('cl_user', JSON.stringify(userVal))
  }

  const logout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem('cl_token')
    localStorage.removeItem('cl_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
