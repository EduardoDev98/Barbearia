import mongoose from 'mongoose'

export const STATUS_PEDIDO = ['Novo', 'Separado', 'Entregue', 'Cancelado']
export const FORMAS_PAGAMENTO_PEDIDO = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro']

const itemSchema = new mongoose.Schema(
  {
    produtoId: { type: String, required: true },
    nome: { type: String, required: true },
    preco: { type: Number, required: true },
    quantidade: { type: Number, required: true, min: 1 }
  },
  { _id: false }
)

const pedidoSchema = new mongoose.Schema(
  {
    cliente: { type: String, required: true, trim: true },
    telefone: { type: String, required: true, trim: true },
    itens: { type: [itemSchema], required: true },
    total: { type: Number, required: true },
    // forma de pagamento escolhida pelo cliente (pago presencialmente na retirada)
    formaPagamento: { type: String, enum: FORMAS_PAGAMENTO_PEDIDO, required: true },
    status: { type: String, enum: STATUS_PEDIDO, default: 'Novo' }
  },
  { timestamps: true }
)

export default mongoose.model('Pedido', pedidoSchema)
