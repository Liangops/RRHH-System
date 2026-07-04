import mongoose from 'mongoose'

const interaccionIASchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  pregunta: { type: String, required: true },
  respuesta: { type: String, required: true }
}, { timestamps: true })

export default mongoose.model('InteraccionIA', interaccionIASchema)