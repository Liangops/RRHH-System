import express from 'express'
import Usuario from '../models/usuario.js'
import Pago from '../models/pago.js'
import bcrypt from 'bcryptjs'
import { verificarToken, soloSuperAdmin, soloAdmin } from '../middleware/auth.js'
import { generarFacturaPDF } from '../utils/factura.js'

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

// Admin — ver usuarios de su empresa
router.get('/usuarios', verificarToken, soloAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find({ empresaId: req.usuario.id }).select('-password')
    res.json(usuarios)
  } catch (err) {
    console.error('ERROR /usuarios:', err.message) // ← agrega esto
    res.status(500).json({ error: err.message })
  }
})
// Admin — crear usuario con rol específico
router.post('/usuarios', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, correo, password, rol, empleadoId, permisos } = req.body
    const existe = await Usuario.findOne({ correo })
    if (existe) return res.status(400).json({ error: 'Correo ya registrado' })

    const hash = await bcrypt.hash(password, 10) // ← hashear

    const usuario = await Usuario.create({
      nombre, correo,
      password: hash,  // ← usar hash
      rol: rol || 'empleado',
      estado: 'activo',
      empresaId: req.usuario.id,
      empleadoId: empleadoId || null,
      permisos: permisos || []
    })

    res.json({ ok: true, empleado: usuario })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Superadmin — ver factura PDF
router.get('/ver-factura/:id', verificarToken, soloSuperAdmin, async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' })

    const pdfBuffer = await generarFacturaPDF({
      comprador: { nombre: pago.nombre, correo: pago.correo, rnc: pago.rnc },
      plan:      { nombre: pago.plan },
      monto:     pago.monto,
      orderID:   pago.orderID,
      eNCF:      pago.eNCF,
      codigoSeguridad: pago.codigoSeguridad,
      dgiiUrl:   pago.dgiiUrl,
      fecha:     pago.fecha
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="factura-${pago.eNCF || pago.orderID}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Superadmin — ver todas las facturaciones
router.get('/facturaciones', verificarToken, soloSuperAdmin, async (req, res) => {
  try {
    const pagos = await Pago.find().sort({ createdAt: -1 })
    res.json(pagos)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/usuarios/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, correo, password, rol, empleadoId, permisos } = req.body
    const update = { nombre, correo, rol, empleadoId, permisos }
    
    if (password) {
      update.password = await bcrypt.hash(password, 10)
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    ).select('-password')

    res.json({ ok: true, empleado: usuario })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
export default router