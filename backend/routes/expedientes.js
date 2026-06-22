import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Expediente from '../models/expedientes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Solo se permiten archivos PDF')
    }
    return {
      folder: 'expedientes',
      resource_type: 'raw',
      format: 'pdf',
      public_id: `${Date.now()}-${file.originalname}`
    }
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false)
    }
  }
})

router.get('/', async (req, res) => {
  try {
    const expedientes = await Expediente.find()
    res.json(expedientes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Ruta para descargar
router.get('/download', async (req, res) => {
  try {
    const { url, nombre } = req.query
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    res.setHeader('Content-Disposition', `attachment; filename="${nombre}.pdf"`)
    res.setHeader('Content-Type', 'application/pdf')
    res.send(Buffer.from(buffer))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

 // Nuevo endpoint — debe ir antes de /:empleadoId/documentos
router.get('/con-observaciones', async (req, res) => {
  try {
    const expedientes = await Expediente.find()

    const observaciones = {}
    expedientes.forEach(exp => {
      const docs = exp.documentos
      if (docs.length > 0) {
        const ultimo = docs[docs.length - 1]
        observaciones[exp.empleadoId.toString()] = ultimo.observaciones ?? 'Sin observaciones'
      }
    })

    res.json(observaciones)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Rutas con parámetros dinámicos siempre de último
router.post('/:empleadoId/documentos', (req, res, next) => {
  upload.array('documentos', 10)(req, res, (err) => {
    if (err) {
      console.error('ERROR MULTER:', err)
      return res.status(500).json({ error: err.message })
    }
    next()
  })
}, async (req, res) => {
  try {
    const { empleadoId } = req.params

    let expediente = await Expediente.findOne({ empleadoId })
    if (!expediente) {
      expediente = await Expediente.create({ empleadoId, documentos: [] })
    }

    const nuevosDocumentos = req.files.map(file => {
      return {
        nombre: req.body.nombre || file.originalname,
        categoria: req.body.categoria,
        observaciones: req.body.observaciones,
        ruta: file.path,
        fechaSubida: new Date()
      }
    })

    expediente.documentos.push(...nuevosDocumentos)
    await expediente.save()

    res.json({ ok: true, documentos: expediente.documentos })
  } catch (err) {
    console.error('ERROR COMPLETO:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router