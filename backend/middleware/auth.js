import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'codelens_secret_key_2024'

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'No token provided' })
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })