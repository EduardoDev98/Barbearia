import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

export const login = async (req, res) => {
  const { username, password } = req.body

  const admin = await Admin.findOne({ username })
  if (!admin) {
    return res.status(401).json({ erro: 'Credenciais inválidas' })
  }

  const ok = await admin.compararSenha(password)
  if (!ok) {
    return res.status(401).json({ erro: 'Credenciais inválidas' })
  }

  const token = jwt.sign(
    { id: admin._id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  )

  return res.json({ token, username: admin.username })
}
