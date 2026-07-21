import Agendamento from '../models/Agendamento.js'
import { gerarSlots } from '../utils/slots.js'
import { SERVICOS } from '../utils/servicos.js'
import { BARBEIROS } from '../utils/barbeiros.js'
import Pedido from '../models/Pedido.js'

// GET /api/agendamentos/servicos  (público)
export const listarServicos = (_req, res) => {
  return res.json(SERVICOS)
}

// GET /api/agendamentos/barbeiros  (público)
export const listarBarbeiros = (_req, res) => {
  return res.json(BARBEIROS)
}

// GET /api/agendamentos/disponibilidade?data=YYYY-MM-DD&barbeiro=id  (público)
// Retorna os slots livres de UM barbeiro numa data. Slots ocupados incluem
// tanto agendamentos de clientes quanto bloqueios feitos pelo barbeiro.
export const disponibilidade = async (req, res) => {
  const { data, barbeiro } = req.query

  const ocupados = await Agendamento.find({
    barbeiro,
    data,
    status: { $ne: 'Cancelado' }
  }).select('horario -_id')

  const ocupadosSet = new Set(ocupados.map((a) => a.horario))
  const livres = gerarSlots().filter((s) => !ocupadosSet.has(s))

  return res.json({ data, barbeiro, disponiveis: livres, ocupados: [...ocupadosSet] })
}

// POST /api/agendamentos  (público) — cliente agenda com um barbeiro
export const criar = async (req, res) => {
  const { nome, telefone, servico, data, horario, barbeiro } = req.body

  const jaExiste = await Agendamento.findOne({
    barbeiro, data, horario,
    status: { $ne: 'Cancelado' }
  })
  if (jaExiste) {
    return res.status(409).json({ erro: 'Horário já ocupado para este barbeiro. Escolha outro.' })
  }

  try {
    const novo = await Agendamento.create({
      tipo: 'cliente', nome, telefone, servico, data, horario, barbeiro
    })
    return res.status(201).json(novo)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Horário já ocupado para este barbeiro. Escolha outro.' })
    }
    return res.status(500).json({ erro: 'Erro ao criar agendamento' })
  }
}

// POST /api/agendamentos/bloqueio  (admin) — barbeiro trava um horário
export const bloquear = async (req, res) => {
  const { barbeiro, data, horario, motivo } = req.body

  const jaExiste = await Agendamento.findOne({
    barbeiro, data, horario,
    status: { $ne: 'Cancelado' }
  })
  if (jaExiste) {
    return res.status(409).json({ erro: 'Esse horário já está ocupado ou bloqueado.' })
  }

  try {
    const bloqueio = await Agendamento.create({
      tipo: 'bloqueio', barbeiro, data, horario,
      motivo: motivo || 'Indisponível', status: 'Confirmado'
    })
    return res.status(201).json(bloqueio)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ erro: 'Esse horário já está ocupado ou bloqueado.' })
    }
    return res.status(500).json({ erro: 'Erro ao bloquear horário' })
  }
}

// GET /api/agendamentos?data=&barbeiro=  (admin)
export const listar = async (req, res) => {
  const { data, barbeiro } = req.query
  const filtro = {}
  if (data) filtro.data = data
  if (barbeiro) filtro.barbeiro = barbeiro
  const lista = await Agendamento.find(filtro).sort({ data: 1, horario: 1 })
  return res.json(lista)
}

// GET /api/agendamentos/:id  (admin)
export const buscarPorId = async (req, res) => {
  const item = await Agendamento.findById(req.params.id)
  if (!item) return res.status(404).json({ erro: 'Agendamento não encontrado' })
  return res.json(item)
}

// PATCH /api/agendamentos/:id/status  (admin)
// Ao concluir, aceita forma de pagamento e valor (entram no caixa).
export const alterarStatus = async (req, res) => {
  const { status, formaPagamento, valor } = req.body

  const update = { status }
  if (status === 'Concluído') {
    if (formaPagamento !== undefined) update.formaPagamento = formaPagamento
    if (valor !== undefined) update.valor = valor
  } else {
    // se sair de Concluído, zera o financeiro para não sujar o caixa
    update.formaPagamento = null
    update.valor = null
  }

  const item = await Agendamento.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!item) return res.status(404).json({ erro: 'Agendamento não encontrado' })
  return res.json(item)
}

// DELETE /api/agendamentos/:id  (admin)
export const excluir = async (req, res) => {
  const item = await Agendamento.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ erro: 'Agendamento não encontrado' })
  return res.json({ mensagem: 'Agendamento excluído com sucesso' })
}

// GET /api/agendamentos/caixa?de=&ate=&barbeiro=  (admin)
// Totais do caixa: soma dos atendimentos concluídos por forma de pagamento,
// no período informado (opcional) e/ou por barbeiro (opcional).
export const caixa = async (req, res) => {
  const { de, ate, barbeiro } = req.query

  const filtro = { tipo: 'cliente', status: 'Concluído', valor: { $ne: null } }
  if (barbeiro) filtro.barbeiro = barbeiro
  if (de || ate) {
    filtro.data = {}
    if (de) filtro.data.$gte = de
    if (ate) filtro.data.$lte = ate
  }

  const concluidos = await Agendamento.find(filtro)

  const porForma = { Pix: 0, 'Cartão de crédito': 0, 'Cartão de débito': 0, Dinheiro: 0 }
  const porDiaMap = {}
  let total = 0
  let atendimentos = 0
  for (const a of concluidos) {
    const v = a.valor || 0
    total += v
    atendimentos += 1
    if (a.formaPagamento && porForma[a.formaPagamento] !== undefined) {
      porForma[a.formaPagamento] += v
    }
    porDiaMap[a.data] = (porDiaMap[a.data] || 0) + v
  }

  // ----- Vendas de produtos (pedidos entregues) entram no caixa -----
  // Observação: pedidos não têm barbeiro; quando o filtro de barbeiro está ativo,
  // as vendas de produtos não são incluídas (pertencem à loja, não a um barbeiro).
  let totalProdutos = 0
  let vendasProdutos = 0
  if (!barbeiro) {
    const filtroPedido = { status: 'Entregue' }
    if (de || ate) {
      filtroPedido.createdAt = {}
      if (de) filtroPedido.createdAt.$gte = new Date(de + 'T00:00:00')
      if (ate) filtroPedido.createdAt.$lte = new Date(ate + 'T23:59:59')
    }
    const pedidos = await Pedido.find(filtroPedido)
    for (const ped of pedidos) {
      const v = ped.total || 0
      total += v
      totalProdutos += v
      vendasProdutos += 1
      if (ped.formaPagamento && porForma[ped.formaPagamento] !== undefined) {
        porForma[ped.formaPagamento] += v
      }
      const dia = ped.createdAt.toISOString().slice(0, 10)
      porDiaMap[dia] = (porDiaMap[dia] || 0) + v
    }
  }

  // faturamento por dia, ordenado por data
  const porDia = Object.keys(porDiaMap)
    .sort()
    .map((data) => ({ data, valor: porDiaMap[data] }))

  return res.json({
    periodo: { de: de || null, ate: ate || null },
    barbeiro: barbeiro || null,
    total,
    atendimentos,
    ticketMedio: atendimentos ? Math.round((total / atendimentos) * 100) / 100 : 0,
    servicos: total - totalProdutos,
    produtos: totalProdutos,
    vendasProdutos,
    porForma,
    porDia
  })
}
