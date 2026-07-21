import { Router } from 'express'
import { login } from '../controllers/auth.controller.js'
import { loginRules } from '../validators/auth.validator.js'
import { validate } from '../middleware/validate.middleware.js'

const router = Router()

router.post('/login', loginRules, validate, login)

export default router
