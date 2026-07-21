import { useState, useEffect, useCallback } from 'react'
import api from '../api/api.js'

const brl = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const STATUS = ['Novo', 'Separado', 'Entregue', 'Cancelado']
const CORES = { Novo: '#2563eb', Separado: '#c8a25a', Entregue: '#16a34a', Cancelado: '#dc2626' }

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const { data } = await api.get('/pedidos')
      setPedidos(data)
    } catch {
      setErro('Erro ao carregar pedidos.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const mudarStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/pedidos/${id}/status`, { status })
      setPedidos((l) => l.map((p) => (p._id === id ? data : p)))
    } catch { setErro('Erro ao alterar status.') }
  }

  const excluir = async (id) => {
    if (!window.confirm('Excluir este pedido?')) return
    try {
      await api.delete(`/pedidos/${id}`)
      setPedidos((l) => l.filter((p) => p._id !== id))
    } catch { setErro('Erro ao excluir.') }
  }

  if (carregando) return <p className="muted">Carregando...</p>
  if (erro) return <div className="alert alert-error">{erro}</div>
  if (pedidos.length === 0) return <p className="muted">Nenhum pedido ainda.</p>

  return (
    <div>
      {pedidos.map((p) => (
        <div key={p._id} className="pedido-card">
          <div className="pedido-topo">
            <span className="pedido-cliente">{p.cliente} · {p.telefone}</span>
            <span className="badge" style={{ backgroundColor: CORES[p.status] }}>{p.status}</span>
          </div>
          <div className="pedido-pgto">💳 {p.formaPagamento} · pago na retirada</div>
          <ul className="pedido-itens">
            {p.itens.map((i) => (
              <li key={i.produtoId}>{i.quantidade}x {i.nome} — {brl(i.preco * i.quantidade)}</li>
            ))}
          </ul>
          <div className="pedido-rodape">
            <span className="pedido-total">{brl(p.total)}</span>
            <div className="pedido-acoes">
              <select value={p.status} onChange={(e) => mudarStatus(p._id, e.target.value)}>
                {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn-icon btn-danger" onClick={() => excluir(p._id)}>Excluir</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Pedidos
