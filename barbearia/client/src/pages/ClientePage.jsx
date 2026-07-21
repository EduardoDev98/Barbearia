import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api.js'

const NOME = import.meta.env.VITE_NOME_BARBEARIA || 'Barbearia Navalha de Ouro'
const hoje = () => new Date().toISOString().slice(0, 10)

// Fotos do trabalho (banco de imagens gratuito Unsplash)
const GALERIA = [
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1521490878406-8b3730c81d7d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1596728325488-58c87691e9af?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519019121902-c7e8c1e0e4a9?auto=format&fit=crop&w=600&q=80'
]

const ICONES = {
  'Corte de cabelo': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>),
  'Barba': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6c0 6 3 12 8 12s8-6 8-12"/><path d="M8 6v3M16 6v3M12 6v5"/></svg>),
  'Corte + Barba': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v6M9 5l3-3 3 3"/><path d="M5 10c0 5 3 10 7 10s7-5 7-10"/></svg>),
  'Corte + Barba + Sobrancelha': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8s3-2 6-2 4 2 4 2 1-2 4-2 6 2 6 2"/><circle cx="8" cy="14" r="2"/><circle cx="16" cy="14" r="2"/></svg>),
  'Pézinho / Acabamento': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 20L18 6l-2-2L2 18z"/><path d="M15 5l4 4"/><line x1="4" y1="20" x2="9" y2="15"/></svg>),
  'Pigmentação de barba': (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l7 7-9 9H5v-5z"/><line x1="14" y1="5" x2="17" y2="8"/></svg>)
}
const iconeDefault = (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/></svg>)

const ClientePage = () => {
  const navigate = useNavigate()
  const formRef = useRef(null)
  const [form, setForm] = useState({
    nome: '', telefone: '', servico: '', barbeiro: '', data: hoje(), horario: ''
  })
  const [servicos, setServicos] = useState([])
  const [barbeiros, setBarbeiros] = useState([])
  const [disponiveis, setDisponiveis] = useState([])
  const [ocupados, setOcupados] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.get('/agendamentos/servicos').then(({ data }) => setServicos(data)).catch(() => setServicos([]))
    api.get('/agendamentos/barbeiros').then(({ data }) => {
      setBarbeiros(data)
      if (data[0]) setForm((f) => ({ ...f, barbeiro: data[0].id }))
    }).catch(() => setBarbeiros([]))
  }, [])

  // disponibilidade depende de data E barbeiro
  useEffect(() => {
    if (!form.data || !form.barbeiro) return
    const buscar = async () => {
      setLoadingSlots(true)
      setErroGeral('')
      try {
        const { data } = await api.get('/agendamentos/disponibilidade', {
          params: { data: form.data, barbeiro: form.barbeiro }
        })
        setDisponiveis(data.disponiveis)
        setOcupados(data.ocupados)
        setForm((f) => (data.disponiveis.includes(f.horario) ? f : { ...f, horario: '' }))
      } catch {
        setErroGeral('Não foi possível carregar os horários. Tente novamente.')
        setDisponiveis([]); setOcupados([])
      } finally {
        setLoadingSlots(false)
      }
    }
    buscar()
  }, [form.data, form.barbeiro])

  const setCampo = (campo, valor) => {
    setForm((f) => ({ ...f, [campo]: valor }))
    setErros((e) => ({ ...e, [campo]: '' }))
  }

  const irParaAgendamento = (servico) => {
    if (servico) setCampo('servico', servico)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const validar = () => {
    const e = {}
    if (form.nome.trim().length < 2) e.nome = 'Informe seu nome completo'
    if (!/^[\d\s()+-]{8,20}$/.test(form.telefone.trim())) e.telefone = 'Telefone inválido'
    if (!form.servico.trim()) e.servico = 'Selecione um serviço'
    if (!form.barbeiro.trim()) e.barbeiro = 'Escolha um barbeiro'
    if (!form.data) e.data = 'Selecione uma data'
    if (!form.horario) e.horario = 'Selecione um horário disponível'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const recarregarSlots = async () => {
    const { data } = await api.get('/agendamentos/disponibilidade', {
      params: { data: form.data, barbeiro: form.barbeiro }
    })
    setDisponiveis(data.disponiveis); setOcupados(data.ocupados)
    setForm((f) => ({ ...f, horario: '' }))
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setErroGeral('')
    if (!validar()) return
    setEnviando(true)
    try {
      const { data } = await api.post('/agendamentos', form)
      navigate('/confirmacao', { state: { agendamento: data, barbeiros } })
    } catch (err) {
      if (err.response?.status === 409) {
        setErroGeral('Esse horário acabou de ser ocupado. Escolha outro.')
        await recarregarSlots()
      } else if (err.response?.status === 400) {
        const detalhes = err.response.data?.detalhes || []
        const mapa = {}
        detalhes.forEach((d) => { mapa[d.campo] = d.msg })
        setErros(mapa)
      } else {
        setErroGeral('Erro ao agendar. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const todosSlots = [...disponiveis, ...ocupados].sort()

  return (
    <div className="landing">
      {/* HERO */}
      <header className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-emblem">
            <span className="hero-emblem-line" />
            <span className="hero-emblem-text">EST. 1990 · TRADIÇÃO</span>
            <span className="hero-emblem-line" />
          </div>
          <h1 className="hero-title">{NOME}</h1>
          <p className="hero-sub">
            Cortes clássicos, barba na navalha e o acabamento de quem entende do ofício.
            Escolha seu barbeiro e agende no seu horário.
          </p>
          <div className="hero-actions">
            <button className="btn btn-gold" onClick={() => irParaAgendamento()}>Agendar horário</button>
            <a className="btn btn-ghost" href="#servicos">Ver serviços</a>
          </div>
        </div>
      </header>

      {/* SERVIÇOS */}
      <section id="servicos" className="section">
        <div className="section-head">
          <span className="eyebrow">O que fazemos de melhor</span>
          <h2 className="section-title">Nossos serviços</h2>
        </div>
        <div className="servicos-grid">
          {servicos.map((s) => (
            <button key={s.nome} type="button" className="servico-card" onClick={() => irParaAgendamento(s.nome)}>
              <span className="servico-icone">{ICONES[s.nome] || iconeDefault}</span>
              <h3 className="servico-nome">{s.nome}</h3>
              <span className="servico-preco">R$ {s.preco},00</span>
              <span className="servico-cta">Agendar →</span>
            </button>
          ))}
        </div>
      </section>

      {/* HISTÓRIA */}
      <section id="historia" className="section section-dark historia">
        <div className="historia-grid">
          <div className="historia-foto"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=800&q=80')" }} />
          <div className="historia-texto">
            <span className="eyebrow">Nossa história</span>
            <h2 className="section-title">Três décadas de navalha e tradição</h2>
            <p>
              A {NOME} nasceu em 1990, de um sonho simples: manter viva a arte da barbearia
              clássica. Começamos com uma cadeira e uma navalha, e hoje somos referência em
              cortes masculinos, barba desenhada e aquele atendimento que faz o cliente voltar.
            </p>
            <p>
              Cada corte carrega técnica, respeito ao estilo de quem senta na cadeira e o
              capricho de quem trata o ofício como paixão. Aqui, você não é só mais um horário —
              é parte da nossa história.
            </p>
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" className="section">
        <div className="section-head">
          <span className="eyebrow">Portfólio</span>
          <h2 className="section-title">Nosso trabalho</h2>
        </div>
        <div className="galeria-grid">
          {GALERIA.map((src, i) => (
            <img
              key={i} src={src} alt={`Trabalho ${i + 1}`} className="galeria-item" loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ))}
        </div>
      </section>

      {/* AGENDAMENTO */}
      <section ref={formRef} id="agendar" className="section section-dark">
        <div className="section-head">
          <span className="eyebrow">Reserve seu momento</span>
          <h2 className="section-title">Agende seu horário</h2>
        </div>

        <div className="form-wrap">
          {erroGeral && <div className="alert alert-error">{erroGeral}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label>Nome</label>
              <input type="text" value={form.nome} onChange={(e) => setCampo('nome', e.target.value)} placeholder="Seu nome completo" />
              {erros.nome && <span className="field-error">{erros.nome}</span>}
            </div>

            <div className="field">
              <label>Telefone</label>
              <input type="tel" value={form.telefone} onChange={(e) => setCampo('telefone', e.target.value)} placeholder="(11) 99999-9999" />
              {erros.telefone && <span className="field-error">{erros.telefone}</span>}
            </div>

            <div className="field">
              <label>Barbeiro</label>
              <div className="barbeiro-opcoes">
                {barbeiros.map((b) => (
                  <button
                    key={b.id} type="button"
                    className={`barbeiro-btn ${form.barbeiro === b.id ? 'barbeiro-ativo' : ''}`}
                    onClick={() => setCampo('barbeiro', b.id)}
                  >{b.nome}</button>
                ))}
              </div>
              {erros.barbeiro && <span className="field-error">{erros.barbeiro}</span>}
            </div>

            <div className="field">
              <label>Serviço</label>
              <select value={form.servico} onChange={(e) => setCampo('servico', e.target.value)}>
                <option value="">Selecione...</option>
                {servicos.map((s) => (
                  <option key={s.nome} value={s.nome}>{s.nome} — R$ {s.preco},00</option>
                ))}
              </select>
              {erros.servico && <span className="field-error">{erros.servico}</span>}
            </div>

            <div className="field">
              <label>Data</label>
              <input type="date" min={hoje()} value={form.data} onChange={(e) => setCampo('data', e.target.value)} />
              {erros.data && <span className="field-error">{erros.data}</span>}
            </div>

            <div className="field">
              <label>Horário</label>
              {loadingSlots ? (
                <p className="muted">Carregando horários...</p>
              ) : todosSlots.length === 0 ? (
                <p className="muted">Nenhum horário para esta data.</p>
              ) : (
                <div className="slots-grid">
                  {todosSlots.map((slot) => {
                    const ocupado = ocupados.includes(slot)
                    const ativo = form.horario === slot
                    return (
                      <button type="button" key={slot} disabled={ocupado}
                        className={`slot ${ativo ? 'slot-active' : ''} ${ocupado ? 'slot-busy' : ''}`}
                        onClick={() => !ocupado && setCampo('horario', slot)}
                      >{slot}</button>
                    )
                  })}
                </div>
              )}
              {erros.horario && <span className="field-error">{erros.horario}</span>}
            </div>

            <button type="submit" className="btn btn-gold btn-block" disabled={enviando}>
              {enviando ? 'Agendando...' : 'Confirmar Agendamento'}
            </button>
          </form>
        </div>
      </section>

      {/* LOCALIZAÇÃO / MAPA */}
      <section id="local" className="section">
        <div className="section-head">
          <span className="eyebrow">Onde estamos</span>
          <h2 className="section-title">Venha nos visitar</h2>
        </div>
        <div className="mapa-wrap">
          <iframe
            title="Localização da barbearia"
            src="https://www.google.com/maps?q=Avenida+Paulista,+São+Paulo&output=embed"
            width="100%" height="380" style={{ border: 0 }}
            loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mapa-endereco">📍 Av. Paulista, 1000 · São Paulo · Seg a Sáb, 08h às 18h</p>
      </section>

      <footer className="footer">
        <span className="footer-brand">💈 {NOME}</span>
        <span className="footer-info">Seg a Sáb · 08h às 18h</span>
      </footer>
    </div>
  )
}

export default ClientePage
