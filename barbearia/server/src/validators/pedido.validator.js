import { body, query } from 'express-validator'
import { STATUS_PEDIDO, FORMAS_PAGAMENTO_PEDIDO } from '../models/Pedido.js'

export const criarPedidoRules = [
  body('cliente').trim().notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome inválido'),
  body('telefone').trim().notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^[\d\s()+-]{8,20}$/).withMessage('Telefone inválido'),
  body('formaPagamento').isIn(FORMAS_PAGAMENTO_PEDIDO).withMessage('Escolha a forma de pagamento'),
  body('itens').isArray({ min: 1 }).withMessage('O carrinho está vazio'),
  body('itens.*.produtoId').trim().notEmpty().withMessage('Produto inválido'),
  body('itens.*.quantidade').isInt({ min: 1, max: 99 }).withMessage('Quantidade inválida')
]

export const statusPedidoRules = [
  body('status').isIn(STATUS_PEDIDO).withMessage('Status inválido')
]

export const filtroPedidoRules = [
  query('status').optional().isIn(STATUS_PEDIDO).withMessage('Status inválido')
]
