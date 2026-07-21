import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import Admin from './models/Admin.js'
import authRoutes from './routes/auth.routes.js'
import agendamentoRoutes from './routes/agendamento.routes.js'
import pedidoRoutes from './routes/pedido.routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())

// ---- Rotas da API ----
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/agendamentos', agendamentoRoutes)
app.use('/api', pedidoRoutes)

// ---- Servir o front-end (build do Vite) em produção ----
// O build do client é copiado para server/public durante o deploy.
const publicDir = path.join(__dirname, '..', 'public')
app.use(express.static(publicDir))

// Fallback SPA: qualquer rota que não seja /api devolve o index.html
// (deixa o React Router cuidar das rotas do front, ex.: /admin, /loja)
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
})

// Seed do admin inicial a partir das variáveis de ambiente
const seedAdmin = async () => {
  const { ADMIN_USER, ADMIN_PASS } = process.env
  if (!ADMIN_USER || !ADMIN_PASS) return
  const existe = await Admin.findOne({ username: ADMIN_USER })
  if (!existe) {
    await Admin.criarComSenha(ADMIN_USER, ADMIN_PASS)
    console.log(`👤 Admin "${ADMIN_USER}" criado`)
  }
}

const PORT = process.env.PORT || 5000

const start = async () => {
  await connectDB()
  await seedAdmin()
  app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`))
}

start()
