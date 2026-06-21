import mongoose from 'mongoose'

const departamentoSchema = new mongoose.Schema({
  codigo: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  empleados: { type: String, },
  descripcion: { type: String, },
}, { timestamps: true })

export default mongoose.model('Departamento', departamentoSchema)