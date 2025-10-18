import express from 'express'
import { protect } from '../middleware/auth.js'
import { imageMessageController, textMessageController } from '../controller/messageController.js'

const messageRoute = express.Router()

messageRoute.post('/text', protect, textMessageController)
messageRoute.post('/image', protect, imageMessageController)

export default messageRoute