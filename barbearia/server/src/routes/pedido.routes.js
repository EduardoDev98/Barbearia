import { Router } from 'express'
import {
  listarProdutos,
  criarPedido,
  listarPedidos,
  alterarStatusPedido,
  excluirPedido
} from '../controllers/pedido.controller.js'
import {
  criarPedidoRules,
  statusPedidoRules,
  filtroPedidoRules
} from '../validators/pedido.validator.js'
import { validate } from '../middleware/validate.middleware.js'
import { auth } from '../middleware/auth.middleware.js'

const router = Router()

// Públicas
router.get('/produtos', listarProdutos)
router.post('/pedidos', criarPedidoRules, validate, criarPedido)

// Admin
router.get('/pedidos', auth, filtroPedidoRules, validate, listarPedidos)
router.patch('/pedidos/:id/status', auth, statusPedidoRules, validate, alterarStatusPedido)
router.delete('/pedidos/:id', auth, excluirPedido)

export default router
