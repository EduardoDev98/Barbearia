import { body } from 'express-validator'

export const loginRules = [
  body('username').trim().notEmpty().withMessage('Usuário é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
]
