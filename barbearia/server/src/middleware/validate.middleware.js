import { validationResult } from 'express-validator'

export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      erro: 'Falha de validação',
      detalhes: errors.array().map((e) => ({ campo: e.path, msg: e.msg }))
    })
  }
  next()
}
