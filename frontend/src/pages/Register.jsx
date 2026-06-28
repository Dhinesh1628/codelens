import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import CodeCanvas from '../components/CodeCanvas.jsx'
import './Auth.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
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

        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">Start reviewing PRs with AI assistance</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label>Name</label>
          <input type="text" placeholder="Your name"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input type="password" placeholder="Min. 6 characters"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
