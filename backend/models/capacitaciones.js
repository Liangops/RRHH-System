import mongoose from 'mongoose'

const capacitacionSchema = new mongoose.Schema({
    curso: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    fechaInicio: { type: Date, required: true },
    duracion: { type: String, required: true },
    participantes: { type: Number, required: true },
    estado: { type: String, default: 'Proximo' },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true })

export default mongoose.model('Capacitacion', capacitacionSchema)