import express from 'express'
import Capacitacion from '../models/capacitaciones.js'
import { verificarToken, soloAdmin, soloSuperAdmin } from '../middleware/auth.js'  // ajusta la ruta según tu estructura

const router = express.Router()

// ─── GET /api/capacitaciones ─────────────────────────────────────────────────
// Todos los roles autenticados
router.get('/', verificarToken, async (req, res) => {
    try {
        const capacitaciones = await Capacitacion.find()
            .populate('creadoPor', 'nombre email')
            .sort({ createdAt: -1 })
        res.json(capacitaciones)
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener capacitaciones' })
    }
})

// ─── GET /api/capacitaciones/:id ─────────────────────────────────────────────
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const capacitacion = await Capacitacion.findById(req.params.id)
            .populate('creadoPor', 'nombre email')
        if (!capacitacion) return res.status(404).json({ error: 'Capacitación no encontrada' })
        res.json(capacitacion)
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener capacitación' })
    }
})

// ─── POST /api/capacitaciones ─────────────────────────────────────────────────
// Solo admin y superadmin
router.post('/', verificarToken, soloAdmin, async (req, res) => {
    try {
        const { curso, descripcion, fechaInicio, duracion, participantes, estado } = req.body
        const nueva = new Capacitacion({
            curso, descripcion, fechaInicio, duracion, participantes,
            estado: estado || 'Proximo',
            creadoPor: req.usuario.id   // ← usa req.usuario (tu middleware lo llama así)
        })
        await nueva.save()
        res.status(201).json(nueva)
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ error: error.message })
        res.status(500).json({ error: 'Error al crear capacitación' })
    }
})

// ─── PUT /api/capacitaciones/:id ──────────────────────────────────────────────
router.put('/:id', verificarToken, soloAdmin, async (req, res) => {
    try {
        const { curso, descripcion, fechaInicio, duracion, participantes, estado } = req.body
        const actualizada = await Capacitacion.findByIdAndUpdate(
            req.params.id,
            { curso, descripcion, fechaInicio, duracion, participantes, estado },
            { new: true, runValidators: true }
        )
        if (!actualizada) return res.status(404).json({ error: 'Capacitación no encontrada' })
        res.json(actualizada)
    } catch (error) {
        if (error.name === 'ValidationError') return res.status(400).json({ error: error.message })
        res.status(500).json({ error: 'Error al actualizar capacitación' })
    }
})

// ─── PATCH /api/capacitaciones/:id/estado ─────────────────────────────────────
router.patch('/:id/estado', verificarToken, soloAdmin, async (req, res) => {
    try {
        const { estado } = req.body
        const estadosValidos = ['Proximo', 'En proceso', 'Completado', 'Cancelado']
        if (!estadosValidos.includes(estado)) return res.status(400).json({ error: 'Estado no válido' })

        const actualizada = await Capacitacion.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        )
        if (!actualizada) return res.status(404).json({ error: 'Capacitación no encontrada' })
        res.json(actualizada)
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar estado' })
    }
})

// ─── DELETE /api/capacitaciones/:id ───────────────────────────────────────────
// Solo superadmin
router.delete('/:id', verificarToken, soloSuperAdmin, async (req, res) => {
    try {
        const eliminada = await Capacitacion.findByIdAndDelete(req.params.id)
        if (!eliminada) return res.status(404).json({ error: 'Capacitación no encontrada' })
        res.json({ message: 'Capacitación eliminada correctamente' })
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar capacitación' })
    }
})

export default router