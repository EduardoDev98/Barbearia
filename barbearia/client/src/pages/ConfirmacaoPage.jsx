import { useLocation, Link, Navigate } from 'react-router-dom'

const ConfirmacaoPage = () => {
  const { state } = useLocation()
  const ag = state?.agendamento
  const barbeiros = state?.barbeiros || []

  if (!ag) return <Navigate to="/" replace />

  const nomeBarbeiro = barbeiros.find((b) => b.id === ag.barbeiro)?.nome || ag.barbeiro

  return (
    <div className="card card-center">
      <div className="check-icon">✅</div>
      <h1>Agendamento Confirmado!</h1>
      <p className="subtitle">Guarde os dados do seu atendimento:</p>

      <div className="resumo">
        <div><strong>Nome:</strong> {ag.nome}</div>
        <div><strong>Telefone:</strong> {ag.telefone}</div>
        <div><strong>Barbeiro:</strong> {nomeBarbeiro}</div>
        <div><strong>Serviço:</strong> {ag.servico}</div>
        <div><strong>Data:</strong> {ag.data.split('-').reverse().join('/')}</div>
        <div><strong>Horário:</strong> {ag.horario}</div>
        <div><strong>Status:</strong> {ag.status}</div>
      </div>

      <Link to="/" className="btn btn-gold">Fazer novo agendamento</Link>
    </div>
  )
}

export default ConfirmacaoPage
