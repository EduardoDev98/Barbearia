import { body, query } from 'express-validator'
import { STATUS, FORMAS_PAGAMENTO } from '../models/Agendamento.js'
import { dataValida, slotValido } from '../utils/slots.js'
import { servicoValido } from '../utils/servicos.js'
import { barbeiroValido } from '../utils/barbeiros.js'

// Criação pública de agendamento (cliente)
export const criarRules = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome inválido'),
  body('telefone').trim().notEmpty().withMessage('Telefone é obrigatório')
    .matches(/^[\d\s()+-]{8,20}$/).withMessage('Telefone inválido'),
  body('servico').custom((v) => servicoValido(v)).withMessage('Serviço inválido'),
  body('barbeiro').custom((v) => barbeiroValido(v)).withMessage('Barbeiro inválido'),
  body('data').custom((v) => dataValida(v)).withMessage('Data inválida (use YYYY-MM-DD)'),
  body('horario').custom((v) => slotValido(v)).withMessage('Horário fora dos slots permitidos')
]

// Disponibilidade agora exige data e barbeiro
export const disponibilidadeRules = [
  query('data').custom((v) => dataValida(v)).withMessage('Data inválida (use YYYY-MM-DD)'),
  query('barbeiro').custom((v) => barbeiroValido(v)).withMessage('Barbeiro inválido')
]

// Bloqueio de horário (admin)
export const bloqueioRules = [
  body('barbeiro').custom((v) => barbeiroValido(v)).withMessage('Barbeiro inválido'),
  body('data').custom((v) => dataValida(v)).withMessage('Data inválida (use YYYY-MM-DD)'),
  body('horario').custom((v) => slotValido(v)).withMessage('Horário fora dos slots permitidos'),
  body('motivo').optional().trim().isLength({ max: 120 }).withMessage('Motivo muito longo')
]

// Alteração de status; se for "Concluído", pode vir forma de pagamento e valor
export const statusRules = [
  body('status').isIn(STATUS).withMessage('Status inválido'),
  body('formaPagamento').optional({ nullable: true })
    .isIn(FORMAS_PAGAMENTO).withMessage('Forma de pagamento inválida'),
  body('valor').optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Valor inválido')
]

// Filtro do admin (lista) — data e barbeiro opcionais
export const filtroRules = [
  query('data').optional().custom((v) => dataValida(v)).withMessage('Data inválida (use YYYY-MM-DD)'),
  query('barbeiro').optional().custom((v) => barbeiroValido(v)).withMessage('Barbeiro inválido')
]

// Caixa: intervalo de datas opcional + barbeiro opcional
export const caixaRules = [
  query('de').optional().custom((v) => dataValida(v)).withMessage('Data inicial inválida'),
  query('ate').optional().custom((v) => dataValida(v)).withMessage('Data final inválida'),
  query('barbeiro').optional().custom((v) => barbeiroValido(v)).withMessage('Barbeiro inválido')
]
