import bcrypt from 'bcryptjs'
import { findUserByEmail, findUserById, createUser } from '../models/userStore.js'
import { signToken } from '../middleware/auth.js'

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' })
    if (findUserByEmail(email))
      return res.status(409).json({ success: false, message: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const user = createUser({ id: genId(), name, email, password: hashed, createdAt: new Date().toISOString() })
    const token = signToken({ id: user.id, name: user.name, email: user.email })
    return res.status(201).json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' })
    const user = findUserByEmail(email)
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' })
    const token = signToken({ id: user.id, name: user.name, email: user.email })
    return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

export const me = (req, res) => {
  const user = findUserById(req.user.id)
  if (!user) return res.status(404).json({ success: false, message: 'User not found' })
  return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } })
}