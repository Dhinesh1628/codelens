import express from 'express'
import { reviewPullRequest, getHistory } from '../controllers/reviewController.js'

const router = express.Router()
router.get('/', reviewPullRequest)
router.get('/history', getHistory)

export default router
