// routes/empleados.js
const express = require('express')
const router = express.Router()
const Empleado = require('../models/empleado') // tu modelo de mongoose

router.get('/', async (req, res) => {
    try {
        const empleados = await Empleado.find({}, 'nombre _id') // solo trae nombre e _id
        res.json(empleados)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener empleados' })
    }
})

module.exports = router