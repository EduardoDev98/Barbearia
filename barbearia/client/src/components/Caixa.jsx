import { useState, useEffect, useCallback } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import api from '../api/api.js'

const brl = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const hoje = () => new Date().toISOString().slice(0, 10)
const diaCurto = (d) => d.split('-').slice(1).reverse().join('/') // MM-DD -> DD/MM

// paleta dourada/terrosa para os gráficos (coerente com o tema)
const CORES_FORMA = {
  'Pix': '#c8a25a',
  'Cartão de crédito': '#e0c07a',
  'Cartão de débito': '#9a7838',
  'Dinheiro': '#6b8f71'
}

const ICONE_TOTAL = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6h18v12H3z"/><circle cx="12" cy="12" r="2.5"/><path d="M7 12h.01M17 12h.01"/></svg>
)
const ICONE_ATEND = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const ICONE_TICKET = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M12 3v18"/></svg>
)

const ICONE_LOJA = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
)

const Caixa = ({ barbeiros }) => {
  const [de, setDe] = useState('')
  const [ate, setAte] = useState('')
  const [barbeiro, setBarbeiro] = useState('')
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const params = {}
      if (de) params.de = de
      if (ate) params.ate = ate
      if (barbeiro) params.barbeiro = barbeiro
      const { data } = await api.get('/agendamentos/caixa', { params })
      setDados(data)
    } catch {
      setDados(null)
    } finally {
      setCarregando(false)
    }
  }, [de, ate, barbeiro])

  useEffect(() => { carregar() }, [carregar])

  const hojeSo = () => { setDe(hoje()); setAte(hoje()) }
  const limpar = () => { setDe(''); setAte(''); setBarbeiro('') }

  const dadosPizza = dados
    ? Object.entries(dados.porForma).filter(([, v]) => v > 0).map(([nome, valor]) => ({ nome, valor }))
    : []
  const dadosBarras = dados?.porDia?.map((d) => ({ dia: diaCurto(d.data), valor: d.valor })) || []

  return (
    <div>
      <div className="admin-toolbar">
        <div className="field field-inline">
          <label>De</label>
          <input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        </div>
        <div className="field field-inline">
          <label>Até</label>
          <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        </div>
        <div className="field field-inline">
          <label>Barbeiro</label>
          <select value={barbeiro} onChange={(e) => setBarbeiro(e.target.value)}>
            <option value="">Todos</option>
            {barbeiros.map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={hojeSo}>Só hoje</button>
        <button className="btn btn-secondary" onClick={limpar}>Limpar</button>
      </div>

      {carregando ? (
        <p className="muted">Calculando...</p>
      ) : !dados ? (
        <p className="muted">Sem dados de caixa.</p>
      ) : (
        <>
          {/* Cards com ícones */}
          <div className="dash-cards">
            <div className="dash-card dash-total">
              <span className="dash-icone">{ICONE_TOTAL}</span>
              <div className="dash-card-txt">
                <span className="dash-label">Total no período</span>
                <span className="dash-valor">{brl(dados.total)}</span>
              </div>
            </div>
            <div className="dash-card">
              <span className="dash-icone">{ICONE_ATEND}</span>
              <div className="dash-card-txt">
                <span className="dash-label">Atendimentos</span>
                <span className="dash-valor">{dados.atendimentos}</span>
              </div>
            </div>
            <div className="dash-card">
              <span className="dash-icone">{ICONE_TICKET}</span>
              <div className="dash-card-txt">
                <span className="dash-label">Ticket médio</span>
                <span className="dash-valor">{brl(dados.ticketMedio)}</span>
              </div>
            </div>
            <div className="dash-card">
              <span className="dash-icone">{ICONE_LOJA}</span>
              <div className="dash-card-txt">
                <span className="dash-label">Vendas de produtos</span>
                <span className="dash-valor">{brl(dados.produtos)}</span>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="dash-graficos">
            <div className="grafico-box">
              <h3 className="grafico-titulo">Por forma de pagamento</h3>
              {dadosPizza.length === 0 ? (
                <p className="muted">Sem recebimentos no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={dadosPizza} dataKey="valor" nameKey="nome" cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {dadosPizza.map((e) => <Cell key={e.nome} fill={CORES_FORMA[e.nome] || '#888'} />)}
                    </Pie>
                    <Tooltip formatter={(v) => brl(v)} contentStyle={{ background: '#241f19', border: '1px solid #3a332a', borderRadius: 6, color: '#f4efe6' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="legenda">
                {dadosPizza.map((e) => (
                  <div key={e.nome} className="legenda-item">
                    <span className="legenda-cor" style={{ background: CORES_FORMA[e.nome] }} />
                    {e.nome} · <strong>{brl(e.valor)}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="grafico-box">
              <h3 className="grafico-titulo">Faturamento por dia</h3>
              {dadosBarras.length === 0 ? (
                <p className="muted">Sem faturamento no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dadosBarras}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3a332a" vertical={false} />
                    <XAxis dataKey="dia" stroke="#a89e8d" fontSize={12} />
                    <YAxis stroke="#a89e8d" fontSize={12} />
                    <Tooltip formatter={(v) => brl(v)} cursor={{ fill: 'rgba(200,162,90,0.08)' }}
                      contentStyle={{ background: '#241f19', border: '1px solid #3a332a', borderRadius: 6, color: '#f4efe6' }} />
                    <Bar dataKey="valor" fill="#c8a25a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Caixa
