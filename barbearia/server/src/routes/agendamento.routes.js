import { Router } from 'express'
import {
  listarServicos,
  listarBarbeiros,
  disponibilidade,
  criar,
  bloquear,
  listar,
  buscarPorId,
  alterarStatus,
  excluir,
  caixa
} from '../controllers/agendamento.controller.js'
import {
  criarRules,
  disponibilidadeRules,
  bloqueioRules,
  statusRules,
  filtroRules,
  caixaRules
} from '../validators/agendamento.validator.js'
import { validate } from '../middleware/validate.middleware.js'
import { auth } from '../middleware/auth.middleware.js'

const router = Router()

// Públicas
router.get('/servicos', listarServicos)
router.get('/barbeiros', listarBarbeiros)
router.get('/disponibilidade', disponibilidadeRules, validate, disponibilidade)
router.post('/', criarRules, validate, criar)

// Protegidas (admin)
router.get('/caixa', auth, caixaRules, validate, caixa)
router.post('/bloqueio', auth, bloqueioRules, validate, bloquear)
router.get('/', auth, filtroRules, validate, listar)
router.get('/:id', auth, buscarPorId)
router.patch('/:id/status', auth, statusRules, validate, alterarStatus)
router.delete('/:id', auth, excluir)

export default router
