import mongoose from 'mongoose'

export const STATUS = ['Agendado', 'Confirmado', 'Concluído', 'Cancelado']
export const FORMAS_PAGAMENTO = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro']
export const TIPOS = ['cliente', 'bloqueio']

const agendamentoSchema = new mongoose.Schema(
  {
    // 'cliente' = agendamento normal; 'bloqueio' = barbeiro travou o horário
    tipo: { type: String, enum: TIPOS, default: 'cliente' },
    // qual barbeiro atende (id)
    barbeiro: { type: String, required: true },

    // dados do cliente (não obrigatórios em bloqueios)
    nome: { type: String, trim: true },
    telefone: { type: String, trim: true },
    servico: { type: String, trim: true },

    // data no formato YYYY-MM-DD, horário no formato HH:00
    data: { type: String, required: true },
    horario: { type: String, required: true },

    status: { type: String, enum: STATUS, default: 'Agendado' },

    // financeiro (preenchido ao concluir o atendimento)
    formaPagamento: { type: String, enum: FORMAS_PAGAMENTO, default: null },
    valor: { type: Number, default: null },

    // motivo do bloqueio (opcional, só para tipo 'bloqueio')
    motivo: { type: String, trim: true, default: '' }
  },
  { timestamps: true }
)

// Regra de negócio crítica: impede dois registros ativos no mesmo
// barbeiro + dia + horário. Agora a chave inclui o barbeiro, então
// dois barbeiros PODEM atender no mesmo horário — cada um tem sua agenda.
// O índice parcial ignora cancelados, permitindo reagendar slot liberado.
agendamentoSchema.index(
  { barbeiro: 1, data: 1, horario: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'Cancelado' } }
  }
)

export default mongoose.model('Agendamento', agendamentoSchema)
