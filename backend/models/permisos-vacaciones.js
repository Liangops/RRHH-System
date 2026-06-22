import mongoose from 'mongoose'

const permisosvacacionesSchema = new mongoose.Schema({
    empleadoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleado' },
    tipoPermiso: String,
    fechaInicio: Date,
    fechaFin: Date,
    dias: Number,
    motivo: String,
    estado: { type: String, default: 'En revisión' }
}, { timestamps: true })

export default mongoose.model('PermisosVacaciones', permisosvacacionesSchema)