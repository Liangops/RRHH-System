import express from 'express'
import Usuario from '../models/usuario.js'
import { verificarToken, soloSuperAdmin, soloAdmin } from '../middleware/auth.js'

const router = express.Router()

// Superadmin — ver todos los clientes (admins)
router.get('/clientes', verificarToken, soloSuperAdmin, async (req, res) => {
  try {
    const clientes = await Usuario.find({ rol: 'admin' }).select('-password')
    res.json(clientes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Superadmin — cambiar estado de un cliente
router.patch('/clientes/:id/estado', verificarToken, soloSuperAdmin, async (req, res) => {
  try {
    const { estado } = req.body
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).select('-password')
    res.json({ ok: true, usuario })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin — crear empleado dentro de su empresa
router.post('/empleados', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, correo, password, permisos } = req.body
    const existe = await Usuario.findOne({ correo })
    if (existe) return res.status(400).json({ error: 'Correo ya registrado' })

    const empleado = await Usuario.create({
      nombre, correo, password,
      rol: 'empleado',
      estado: 'activo',
      empresaId: req.usuario.id,
      permisos: permisos || []
    })

    res.json({ ok: true, empleado: { id: empleado._id, nombre, correo, permisos } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Admin — ver sus empleados
router.get('/empleados', verificarToken, soloAdmin, async (req, res) => {
  try {
    const empresaId = req.usuario.rol === 'superadmin' ? req.query.empresaId : req.usuario.id
    const empleados = await Usuario.find({ empresaId, rol: 'empleado' }).select('-password')
    res.json(empleados)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router