import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await login(form.username, form.password)
      navigate('/admin')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Falha ao entrar. Verifique as credenciais.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="card card-narrow">
      <h1>Área Administrativa</h1>
      <p className="subtitle">Entre com suas credenciais.</p>

      {erro && <div className="alert alert-error">{erro}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label>Usuário</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
          />
        </div>
        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
