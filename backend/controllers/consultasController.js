import Empleado from '../models/empleado.js'
import PermisosVacaciones from '../models/permisos-vacaciones.js'
import Capacitacion from '../models/capacitaciones.js'

import InteraccionIA from '../models/interaccionIA.js'

// ---------- SENCILLAS ----------

export const empleadosPorEstado = async (req, res) => {
  try {
    const data = await Empleado.aggregate([
      { $group: { _id: '$estado', total: { $sum: 1 } } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const empleadosPorDepartamento = async (req, res) => {
  try {
    const data = await Empleado.aggregate([
      { $group: { _id: '$departamento', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const empleadosPorCargo = async (req, res) => {
  try {
    const data = await Empleado.aggregate([
      { $group: { _id: '$cargo', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const permisosPendientes = async (req, res) => {
  try {
    const data = await PermisosVacaciones.find({ estado: 'En revisión' })
      .populate('empleadoId', 'nombre apellido departamento')
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const capacitacionesPorEstado = async (req, res) => {
  try {
    const data = await Capacitacion.aggregate([
      { $group: { _id: '$estado', total: { $sum: 1 } } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const topCapacitacionesPorParticipantes = async (req, res) => {
  try {
    const data = await Capacitacion.find().sort({ participantes: -1 }).limit(5)
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

// ---------- AVANZADAS ----------

export const permisosPorDepartamento = async (req, res) => {
  try {
    const data = await PermisosVacaciones.aggregate([
      { $lookup: { from: 'empleados', localField: 'empleadoId', foreignField: '_id', as: 'empleado' } },
      { $unwind: '$empleado' },
      { $group: { _id: '$empleado.departamento', totalPermisos: { $sum: 1 } } },
      { $sort: { totalPermisos: -1 } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const permisosPorDepartamentoRango = async (req, res) => {
  try {
    const { desde, hasta } = req.query
    const data = await PermisosVacaciones.aggregate([
      { $match: { fechaInicio: { $gte: new Date(desde), $lte: new Date(hasta) } } },
      { $lookup: { from: 'empleados', localField: 'empleadoId', foreignField: '_id', as: 'empleado' } },
      { $unwind: '$empleado' },
      { $group: { _id: '$empleado.departamento', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const distribucionTiposPermiso = async (req, res) => {
  try {
    const data = await PermisosVacaciones.aggregate([
      { $group: { _id: '$tipoPermiso', total: { $sum: 1 } } }
    ])
    const totalGeneral = data.reduce((acc, d) => acc + d.total, 0)
    const conPorcentaje = data.map(d => ({
      tipo: d._id,
      total: d.total,
      porcentaje: totalGeneral ? +((d.total / totalGeneral) * 100).toFixed(1) : 0
    }))
    res.json(conPorcentaje)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const topEmpleadosConMasPermisos = async (req, res) => {
  try {
    const data = await PermisosVacaciones.aggregate([
      { $group: { _id: '$empleadoId', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'empleados', localField: '_id', foreignField: '_id', as: 'empleado' } },
      { $unwind: '$empleado' },
      { $project: { total: 1, nombre: '$empleado.nombre', apellido: '$empleado.apellido', departamento: '$empleado.departamento' } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const departamentoMasPermisos = async (req, res) => {
  try {
    const data = await PermisosVacaciones.aggregate([
      { $lookup: { from: 'empleados', localField: 'empleadoId', foreignField: '_id', as: 'empleado' } },
      { $unwind: '$empleado' },
      { $group: { _id: '$empleado.departamento', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}

export const promedioDiasPorTipo = async (req, res) => {
  try {
    const data = await PermisosVacaciones.aggregate([
      { $group: { _id: '$tipoPermiso', promedioDias: { $avg: '$dias' } } },
      { $project: { _id: 1, promedioDias: { $round: ['$promedioDias', 1] } } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}


export const usuariosQueMasUsanIA = async (req, res) => {
  try {
    const data = await InteraccionIA.aggregate([
      { $group: { _id: '$usuarioId', totalPreguntas: { $sum: 1 } } },
      { $sort: { totalPreguntas: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'usuarios', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $project: { totalPreguntas: 1, nombre: '$usuario.nombre', correo: '$usuario.correo' } }
    ])
    res.json(data)
  } catch (err) { res.status(500).json({ error: err.message }) }
}