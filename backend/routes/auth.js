import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Usuario from '../models/usuario.js'

import { verificarToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, password, plan } = req.body
    const existe = await Usuario.findOne({ correo })
    if (existe) return res.status(400).json({ error: 'Correo ya registrado' })

    const hash = await bcrypt.hash(password, 10)
    const usuario = await Usuario.create({
      nombre, correo,
      password: hash,
      rol: 'admin',
      estado: 'demo',
      plan: plan || null
    })

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, estado: usuario.estado },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ ok: true, token, usuario: { id: usuario._id, nombre, correo, rol: usuario.rol, estado: usuario.estado } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password')
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body
    const identificador = correo?.trim()

    console.log('🔍 Intentando login con:', identificador)

    if (!identificador || !password) {
      return res.status(400).json({ error: 'Completa usuario/correo y contraseña' })
    }

    const usuario = await Usuario.findOne({
      $or: [
        { correo: identificador },
        { nombre: identificador }
      ]
    })

    console.log('🔍 Usuario encontrado:', usuario ? usuario.correo : 'NINGUNO')

    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const ok = await bcrypt.compare(password, usuario.password)
    console.log('🔍 Password coincide:', ok)

    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' })

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, estado: usuario.estado, empresaId: usuario.empresaId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ ok: true, token, usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, estado: usuario.estado } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/logout', verificarToken, async (req, res) => {
  res.json({ ok: true })
})

router.post('/check-email', async (req, res) => {
  try {
    const { correo } = req.body
    const usuario = await Usuario.findOne({ correo })
    res.json({ existe: !!usuario })
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router