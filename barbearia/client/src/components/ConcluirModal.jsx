import { useState } from 'react'

const FORMAS = ['Pix', 'Cartão de crédito', 'Cartão de débito', 'Dinheiro']

const ConcluirModal = ({ agendamento, precoSugerido, onConfirmar, onCancelar }) => {
  const [forma, setForma] = useState('Pix')
  const [valor, setValor] = useState(precoSugerido ?? '')
  const [erro, setErro] = useState('')

  const confirmar = () => {
    const v = parseFloat(valor)
    if (isNaN(v) || v < 0) { setErro('Informe um valor válido'); return }
    onConfirmar({ formaPagamento: forma, valor: v })
  }

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Concluir atendimento</h3>
        <p className="muted modal-sub">
          {agendamento.nome} · {agendamento.servico}
        </p>

        <div className="field">
          <label>Forma de pagamento</label>
          <select value={forma} onChange={(e) => setForma(e.target.value)}>
            {FORMAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Valor recebido (R$)</label>
          <input
            type="number" min="0" step="0.01" value={valor}
            onChange={(e) => { setValor(e.target.value); setErro('') }}
            placeholder="0,00"
          />
          {erro && <span className="field-error">{erro}</span>}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-gold" onClick={confirmar}>Confirmar pagamento</button>
        </div>
      </div>
    </div>
  )
}

export default ConcluirModal
