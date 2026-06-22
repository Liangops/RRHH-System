import mongoose from 'mongoose'

const documentoSchema = new mongoose.Schema({
  nombre: String,
  categoria: String,
  cantidad: String,
  observaciones: String,
  ruta: String,
  fechaSubida: { type: Date, default: Date.now }
})

const expedienteSchema = new mongoose.Schema({
  empleadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', required: true },
  documentos: [documentoSchema]
})

export default mongoose.model('Expediente', expedienteSchema)