import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
)

adminSchema.methods.compararSenha = function (senha) {
  return bcrypt.compare(senha, this.passwordHash)
}

adminSchema.statics.criarComSenha = async function (username, senhaPlana) {
  const passwordHash = await bcrypt.hash(senhaPlana, 10)
  return this.create({ username, passwordHash })
}

export default mongoose.model('Admin', adminSchema)
