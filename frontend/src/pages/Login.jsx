import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import CodeCanvas from '../components/CodeCanvas.jsx'
import './Auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <CodeCanvas />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🔍</div>
          <span className="auth-logo-name">CodeLens</span>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-sub">Sign in to access your review dashboard</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <div className="auth-divider"><span>or</span></div>

        <button className="auth-guest-btn" onClick={() => navigate('/')}>
          Continue without account →
        </button>
      </div>
    </div>
  )
}
