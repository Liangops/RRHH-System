import mongoose from 'mongoose'

const pagoSchema = new mongoose.Schema({
  nombre:           { type: String, required: true },
  correo:           { type: String, required: true },
  rnc:              { type: String, default: '132907401' },
  plan:             { type: String, required: true },
  monto:            { type: String, required: true },
  orderID:          { type: String, required: true, unique: true },
  eNCF:             { type: String, default: null },
  codigoSeguridad:  { type: String, default: null },
  dgiiUrl:          { type: String, default: null },
  facturaGenerada:  { type: Boolean, default: false },
  fecha:            { type: String },
  estado:         { type: String, enum: ['demo', 'revision', 'activo'], default: 'demo' },
  empresa:        { type: String, default: null },
  logo:           { type: String, default: null },
  notasRevision:  { type: String, default: null },
  fechaActivacion:{ type: Date,   default: null },
}, { timestamps: true })

export default mongoose.model('Pago', pagoSchema)