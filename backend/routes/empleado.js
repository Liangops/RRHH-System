import express from 'express'
import Empleado from '../models/empleado.js'

const router = express.Router()

router.get('/',         async (req, res) => {
  const data = await Empleado.find()
  res.json(data)
})

router.post('/',        async (req, res) => {
  const nuevo = await Empleado.create(req.body)
  res.status(201).json(nuevo)
})

router.put('/:id',      async (req, res) => {
  const actualizado = await Empleado.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(actualizado)
})

router.delete('/:id',   async (req, res) => {
  await Empleado.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router