const CORES = {
  Agendado: '#2563eb',
  Confirmado: '#0891b2',
  Concluído: '#16a34a',
  Cancelado: '#dc2626'
}

const StatusBadge = ({ status }) => (
  <span className="badge" style={{ backgroundColor: CORES[status] || '#64748b' }}>
    {status}
  </span>
)

export default StatusBadge
