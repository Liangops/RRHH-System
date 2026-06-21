import mongoose from 'mongoose'

const empleadoSchema = new mongoose.Schema({
  nombre:       { type: String, required: true },
  apellido:     { type: String },
  cedula:       { type: String, required: true, unique: true },
  telefono:     { type: String },
  correo:       { type: String },
  cargo:        { type: String },
  departamento: { type: String },
  ingreso:      { type: String },
  estado:       { type: String, default: 'Activo' }
}, { timestamps: true })

export default mongoose.model('Empleado', empleadoSchema)