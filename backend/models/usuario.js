import mongoose from 'mongoose'

const usuarioSchema = new mongoose.Schema({
  nombre:     { type: String, required: true },
  correo:     { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  rol:        { type: String, enum: ['superadmin', 'admin', 'empleado'], default: 'admin' },
  estado:     { type: String, enum: ['demo', 'revision', 'activo'], default: 'demo' },
  empresa:    { type: String, default: null },
  empresaId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
  empleadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado', default: null }, // ← solo esto
  plan:       { type: String, default: null },
  permisos:   { type: [String], default: [] },
}, { timestamps: true })

export default mongoose.model('Usuario', usuarioSchema)