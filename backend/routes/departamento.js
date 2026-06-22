import express from 'express'
import Departamento from '../models/departamento.js'

const router = express.Router()

router.get('/',         async (req, res) => {
  const data = await Departamento.find()
  res.json(data)
})

router.post('/',        async (req, res) => {
  const nuevo = await Departamento.create(req.body)
  res.status(201).json(nuevo)
})

router.put('/:id',      async (req, res) => {
  const actualizado = await Departamento.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(actualizado)
})

router.delete('/:id',   async (req, res) => {
  await Departamento.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})


export default router