// Seed opcional: popula agendamentos de exemplo para demonstração.
// Uso: npm run seed   (requer MONGO_URI no .env)
import 'dotenv/config'
import mongoose from 'mongoose'
import Agendamento from './models/Agendamento.js'
import Pedido from './models/Pedido.js'

const hojeMais = (dias) => {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

const exemplos = [
  // Concluídos (alimentam o caixa) — dias anteriores
  { tipo: 'cliente', barbeiro: 'rangel', nome: 'Carlos Mendes', telefone: '(11) 98888-1111', servico: 'Corte + Barba', data: hojeMais(-1), horario: '09:00', status: 'Concluído', formaPagamento: 'Pix', valor: 60 },
  { tipo: 'cliente', barbeiro: 'rangel', nome: 'Rafael Souza', telefone: '(11) 97777-2222', servico: 'Corte de cabelo', data: hojeMais(-1), horario: '10:00', status: 'Concluído', formaPagamento: 'Cartão de crédito', valor: 40 },
  { tipo: 'cliente', barbeiro: 'diego', nome: 'Bruno Alves', telefone: '(11) 95555-4444', servico: 'Corte + Barba + Sobrancelha', data: hojeMais(-1), horario: '11:00', status: 'Concluído', formaPagamento: 'Cartão de débito', valor: 75 },
  { tipo: 'cliente', barbeiro: 'diego', nome: 'Marcos Dias', telefone: '(11) 94444-5555', servico: 'Barba', data: hojeMais(0), horario: '09:00', status: 'Concluído', formaPagamento: 'Dinheiro', valor: 30 },

  // A atender (hoje e amanhã)
  { tipo: 'cliente', barbeiro: 'rangel', nome: 'Pedro Lima', telefone: '(11) 96666-3333', servico: 'Barba', data: hojeMais(0), horario: '14:00', status: 'Agendado' },
  { tipo: 'cliente', barbeiro: 'diego', nome: 'Thiago Nunes', telefone: '(11) 93333-6666', servico: 'Corte de cabelo', data: hojeMais(1), horario: '15:00', status: 'Confirmado' },

  // Bloqueio de horário (barbeiro indisponível)
  { tipo: 'bloqueio', barbeiro: 'rangel', data: hojeMais(1), horario: '12:00', status: 'Confirmado', motivo: 'Almoço' }
]


const pedidosExemplo = [
  { cliente: 'Lucas Pereira', telefone: '(11) 91234-5678', status: 'Novo', formaPagamento: 'Pix',
    itens: [
      { produtoId: 'pomada-modeladora', nome: 'Pomada Modeladora', preco: 45, quantidade: 1 },
      { produtoId: 'oleo-barba', nome: 'Óleo para Barba', preco: 50, quantidade: 1 }
    ], total: 95 },
  { cliente: 'André Gomes', telefone: '(11) 99876-5432', status: 'Entregue', formaPagamento: 'Cartão de crédito',
    itens: [
      { produtoId: 'shampoo-barba', nome: 'Shampoo para Barba', preco: 42, quantidade: 2 }
    ], total: 84 }
]

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  await Agendamento.deleteMany({})
  await Agendamento.insertMany(exemplos)
  await Pedido.deleteMany({})
  await Pedido.insertMany(pedidosExemplo)
  console.log(`✅ ${exemplos.length} agendamentos e ${pedidosExemplo.length} pedidos de exemplo inseridos`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
