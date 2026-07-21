import { useState, useEffect, useCallback } from 'react'
import api from '../api/api.js'
import StatusBadge from '../components/StatusBadge.jsx'
import ConcluirModal from '../components/ConcluirModal.jsx'
import BloqueioModal from '../components/BloqueioModal.jsx'
import Caixa from '../components/Caixa.jsx'
import Pedidos from '../components/Pedidos.jsx'

const STATUS = ['Agendado', 'Confirmado', 'Concluído', 'Cancelado']
const fmtData = (d) => d.split('-').reverse().join('/')

const AdminPage = () => {
  const [aba, setAba] = useState('agenda') // 'agenda' | 'caixa'
  const [subAba, setSubAba] = useState('atender') // 'atender' | 'atendidos'
  const [agendamentos, setAgendamentos] = useState([])
  const [barbeiros, setBarbeiros] = useState([])
  const [servicos, setServicos] = useState([])
  const [filtroData, setFiltroData] = useState('')
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [concluindo, setConcluindo] = useState(null) // agendamento em conclusão
  const [mostrarBloqueio, setMostrarBloqueio] = useState(false)

  // catálogos
  useEffect(() => {
    api.get('/agendamentos/barbeiros').then(({ data }) => setBarbeiros(data)).catch(() => {})
    api.get('/agendamentos/servicos').then(({ data }) => setServicos(data)).catch(() => {})
  }, [])

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro('')
    try {
      const params = {}
      if (filtroData) params.data = filtroData
      if (filtroBarbeiro) params.barbeiro = filtroBarbeiro
      const { data } = await api.get('/agendamentos', { params })
      setAgendamentos(data)
    } catch {
      setErro('Erro ao carregar agendamentos.')
    } finally {
      setCarregando(false)
    }
  }, [filtroData, filtroBarbeiro])

  useEffect(() => { carregar() }, [carregar])

  const nomeBarbeiro = (id) => barbeiros.find((b) => b.id === id)?.nome || id
  const precoServico = (nome) => servicos.find((s) => s.nome === nome)?.preco ?? ''

  const mudarStatus = async (a, status) => {
    // concluir abre modal de pagamento
    if (status === 'Concluído' && a.tipo === 'cliente') {
      setConcluindo(a)
      return
    }
    try {
      const { data } = await api.patch(`/agendamentos/${a._id}/status`, { status })
      setAgendamentos((lista) => lista.map((x) => (x._id === a._id ? data : x)))
    } catch {
      setErro('Erro ao alterar status.')
    }
  }

  const confirmarConclusao = async ({ formaPagamento, valor }) => {
    try {
      const { data } = await api.patch(`/agendamentos/${concluindo._id}/status`, {
        status: 'Concluído', formaPagamento, valor
      })
      setAgendamentos((lista) => lista.map((x) => (x._id === concluindo._id ? data : x)))
      setConcluindo(null)
    } catch {
      setErro('Erro ao concluir atendimento.')
      setConcluindo(null)
    }
  }

  const excluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return
    try {
      await api.delete(`/agendamentos/${id}`)
      setAgendamentos((lista) => lista.filter((a) => a._id !== id))
    } catch {
      setErro('Erro ao excluir.')
    }
  }

  // separa por sub-aba
  const clientes = agendamentos.filter((a) => a.tipo === 'cliente')
  const bloqueios = agendamentos.filter((a) => a.tipo === 'bloqueio')
  const aAtender = clientes.filter((a) => a.status === 'Agendado' || a.status === 'Confirmado')
  const atendidos = clientes.filter((a) => a.status === 'Concluído')
  const cancelados = clientes.filter((a) => a.status === 'Cancelado')

  const lista = subAba === 'atender' ? aAtender : atendidos

  const renderLinha = (a) => (
    <tr key={a._id}>
      <td>{fmtData(a.data)}</td>
      <td>{a.horario}</td>
      <td>{nomeBarbeiro(a.barbeiro)}</td>
      <td>{a.nome}</td>
      <td>{a.telefone}</td>
      <td>{a.servico}</td>
      <td><StatusBadge status={a.status} /></td>
      <td>{a.valor != null ? `R$ ${a.valor},00` : '—'}{a.formaPagamento ? ` · ${a.formaPagamento}` : ''}</td>
      <td>
        <div className="acoes">
          <select value={a.status} onChange={(e) => mudarStatus(a, e.target.value)}>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-icon btn-danger" onClick={() => excluir(a._id)}>Excluir</button>
        </div>
      </td>
    </tr>
  )

  const renderCard = (a) => (
    <div key={a._id} className="ag-card">
      <div className="ag-card-header">
        <strong>{fmtData(a.data)} • {a.horario}</strong>
        <StatusBadge status={a.status} />
      </div>
      <div className="ag-card-body">
        <div><strong>{a.nome}</strong> · {nomeBarbeiro(a.barbeiro)}</div>
        <div className="muted">{a.telefone}</div>
        <div>{a.servico}</div>
        {a.valor != null && <div className="muted">R$ {a.valor},00 · {a.formaPagamento}</div>}
      </div>
      <div className="ag-card-actions">
        <select value={a.status} onChange={(e) => mudarStatus(a, e.target.value)}>
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-icon btn-danger" onClick={() => excluir(a._id)}>Excluir</button>
      </div>
    </div>
  )

  return (
    <div className="card">
      <div className="admin-header">
        <h1>Painel da Barbearia</h1>
        <div className="tabs">
          <button className={`tab ${aba === 'agenda' ? 'tab-active' : ''}`} onClick={() => setAba('agenda')}>Agenda</button>
          <button className={`tab ${aba === 'caixa' ? 'tab-active' : ''}`} onClick={() => setAba('caixa')}>Caixa</button>
          <button className={`tab ${aba === 'pedidos' ? 'tab-active' : ''}`} onClick={() => setAba('pedidos')}>Pedidos</button>
        </div>
      </div>

      {erro && <div className="alert alert-error">{erro}</div>}

      {aba === 'caixa' ? (
        <Caixa barbeiros={barbeiros} />
      ) : aba === 'pedidos' ? (
        <Pedidos />
      ) : (
        <>
          <div className="admin-toolbar">
            <div className="field field-inline">
              <label>Data</label>
              <input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
            </div>
            <div className="field field-inline">
              <label>Barbeiro</label>
              <select value={filtroBarbeiro} onChange={(e) => setFiltroBarbeiro(e.target.value)}>
                <option value="">Todos</option>
                {barbeiros.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
              </select>
            </div>
            {(filtroData || filtroBarbeiro) && (
              <button className="btn btn-secondary" onClick={() => { setFiltroData(''); setFiltroBarbeiro('') }}>
                Limpar
              </button>
            )}
            <button className="btn btn-secondary" onClick={carregar}>Atualizar</button>
            <button className="btn btn-gold" onClick={() => setMostrarBloqueio(true)}>+ Travar horário</button>
          </div>

          <div className="subtabs">
            <button className={`subtab ${subAba === 'atender' ? 'subtab-active' : ''}`} onClick={() => setSubAba('atender')}>
              A atender ({aAtender.length})
            </button>
            <button className={`subtab ${subAba === 'atendidos' ? 'subtab-active' : ''}`} onClick={() => setSubAba('atendidos')}>
              Já atendidos ({atendidos.length})
            </button>
          </div>

          {carregando ? (
            <p className="muted">Carregando...</p>
          ) : lista.length === 0 ? (
            <p className="muted">Nenhum registro nesta lista.</p>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Data</th><th>Horário</th><th>Barbeiro</th><th>Cliente</th>
                      <th>Telefone</th><th>Serviço</th><th>Status</th><th>Pagamento</th><th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>{lista.map(renderLinha)}</tbody>
                </table>
              </div>
              <div className="cards-mobile">{lista.map(renderCard)}</div>
            </>
          )}

          {/* Bloqueios ativos */}
          {bloqueios.length > 0 && (
            <div className="bloqueios-box">
              <h3 className="caixa-subtitulo">Horários travados</h3>
              {bloqueios.map((b) => (
                <div key={b._id} className="bloqueio-item">
                  <span>🔒 {fmtData(b.data)} · {b.horario} · {nomeBarbeiro(b.barbeiro)} — {b.motivo}</span>
                  <button className="btn-icon btn-danger" onClick={() => excluir(b._id)}>Liberar</button>
                </div>
              ))}
            </div>
          )}

          {cancelados.length > 0 && subAba === 'atender' && (
            <p className="muted cancelados-nota">{cancelados.length} agendamento(s) cancelado(s) neste filtro.</p>
          )}
        </>
      )}

      {concluindo && (
        <ConcluirModal
          agendamento={concluindo}
          precoSugerido={precoServico(concluindo.servico)}
          onConfirmar={confirmarConclusao}
          onCancelar={() => setConcluindo(null)}
        />
      )}

      {mostrarBloqueio && (
        <BloqueioModal
          barbeiros={barbeiros}
          barbeiroInicial={filtroBarbeiro}
          onFeito={() => { setMostrarBloqueio(false); carregar() }}
          onCancelar={() => setMostrarBloqueio(false)}
        />
      )}
    </div>
  )
}

export default AdminPage
