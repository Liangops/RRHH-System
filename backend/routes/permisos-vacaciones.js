import express from 'express'
import permisosvacaciones from '../models/permisos-vacaciones.js'

const router = express.Router()


router.get('/', async (req, res) => {
  try {
    const data = await permisosvacaciones.find().populate('empleadoId', 'nombre apellido')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const nuevo = await permisosvacaciones.create(req.body)
  res.status(201).json(nuevo)
})

router.put('/:id', async (req, res) => {
  const actualizado = await permisosvacaciones.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(actualizado)
})

router.delete('/:id', async (req, res) => {
  await permisosvacaciones.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router