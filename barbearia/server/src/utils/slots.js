// Gera os slots de atendimento de 08:00 às 18:00, em intervalos de 1 hora.
// Regra: 08:00–18:00 em slots de 1h -> últimos atendimentos começam às 17:00
// (encerrando às 18:00).
export const HORA_INICIO = 8
export const HORA_FIM = 18 // limite de encerramento

export const gerarSlots = () => {
  const slots = []
  for (let h = HORA_INICIO; h < HORA_FIM; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
}

// Valida formato YYYY-MM-DD e se é uma data real
export const dataValida = (data) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false
  const d = new Date(`${data}T00:00:00`)
  return !isNaN(d.getTime()) && data === d.toISOString().slice(0, 10)
}

export const slotValido = (horario) => gerarSlots().includes(horario)
