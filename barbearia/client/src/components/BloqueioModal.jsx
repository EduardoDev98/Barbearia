import { useState, useEffect } from 'react'
import api from '../api/api.js'

const hoje = () => new Date().toISOString().slice(0, 10)

const BloqueioModal = ({ barbeiros, barbeiroInicial, onFeito, onCancelar }) => {
  const [barbeiro, setBarbeiro] = useState(barbeiroInicial || barbeiros[0]?.id || '')
  const [data, setData] = useState(hoje())
  const [horario, setHorario] = useState('')
  const [motivo, setMotivo] = useState('')
  const [disponiveis, setDisponiveis] = useState([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!data || !barbeiro) return
    api.get('/agendamentos/disponibilidade', { params: { data, barbeiro } })
      .then(({ data }) => { setDisponiveis(data.disponiveis); setHorario('') })
      .catch(() => setDisponiveis([]))
  }, [data, barbeiro])

  const salvar = async () => {
    if (!horario) { setErro('Escolha um horário para bloquear'); return }
    setSalvando(true)
    setErro('')
    try {
      await api.post('/agendamentos/bloqueio', { barbeiro, data, horario, motivo })
      onFeito()
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao bloquear horário')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Travar horário</h3>
        <p className="muted modal-sub">Bloqueie um horário em que o barbeiro não vai atender.</p>

        <div className="field">
          <label>Barbeiro</label>
          <select value={barbeiro} onChange={(e) => setBarbeiro(e.target.value)}>
            {barbeiros.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Data</label>
          <input type="date" min={hoje()} value={data} onChange={(e) => setData(e.target.value)} />
        </div>

        <div className="field">
          <label>Horário</label>
          {disponiveis.length === 0 ? (
            <p className="muted">Nenhum horário livre nesta data.</p>
          ) : (
            <div className="slots-grid">
              {disponiveis.map((s) => (
                <button
                  key={s} type="button"
                  className={`slot ${horario === s ? 'slot-active' : ''}`}
                  onClick={() => setHorario(s)}
                >{s}</button>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label>Motivo (opcional)</label>
          <input
            type="text" value={motivo} maxLength={120}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: Almoço, compromisso pessoal"
          />
        </div>

        {erro && <div className="alert alert-error">{erro}</div>}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-gold" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Travar horário'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BloqueioModal
