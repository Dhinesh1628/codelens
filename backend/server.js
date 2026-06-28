import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import reviewRoutes from './routes/reviewRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.json({ success: true, message: 'CodeLens API Running' }))
app.use('/api/auth', authRoutes)
app.use('/api/review', reviewRoutes)

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
