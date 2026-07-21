import axios from 'axios'

// Em produção o front é servido pelo próprio backend, então a API fica no
// mesmo domínio (caminho relativo "/api"). Em desenvolvimento, o Vite roda em
// outra porta, então usamos VITE_API_URL apontando para o backend local.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

// Injeta o token JWT (se existir) em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Se o token expirar/for inválido, limpa e manda pro login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
