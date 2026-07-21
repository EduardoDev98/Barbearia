import Pedido from '../models/Pedido.js'
import { PRODUTOS, acharProduto } from '../utils/produtos.js'

// GET /api/produtos  (público)
export const listarProdutos = (_req, res) => res.json(PRODUTOS)

// POST /api/pedidos  (público) — cliente finaliza a compra
export const criarPedido = async (req, res) => {
  const { cliente, telefone, itens, formaPagamento } = req.body

  // Reconstrói os itens a partir do catálogo (preço e nome vêm do servidor).
  const itensValidados = []
  for (const item of itens) {
    const produto = acharProduto(item.produtoId)
    if (!produto) {
      return res.status(400).json({ erro: `Produto inválido: ${item.produtoId}` })
    }
    const quantidade = Number(item.quantidade)
    itensValidados.push({
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade
    })
  }

  const total = itensValidados.reduce((s, i) => s + i.preco * i.quantidade, 0)

  try {
    const pedido = await Pedido.create({ cliente, telefone, itens: itensValidados, total, formaPagamento })
    return res.status(201).json(pedido)
  } catch {
    return res.status(500).json({ erro: 'Erro ao criar pedido' })
  }
}

// GET /api/pedidos?status=  (admin)
export const listarPedidos = async (req, res) => {
  const { status } = req.query
  const filtro = status ? { status } : {}
  const lista = await Pedido.find(filtro).sort({ createdAt: -1 })
  return res.json(lista)
}

// PATCH /api/pedidos/:id/status  (admin)
export const alterarStatusPedido = async (req, res) => {
  const item = await Pedido.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true }
  )
  if (!item) return res.status(404).json({ erro: 'Pedido não encontrado' })
  return res.json(item)
}

// DELETE /api/pedidos/:id  (admin)
export const excluirPedido = async (req, res) => {
  const item = await Pedido.findByIdAndDelete(req.params.id)
  if (!item) return res.status(404).json({ erro: 'Pedido não encontrado' })
  return res.json({ mensagem: 'Pedido excluído' })
}
