import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Documento from '../models/documento.js'
import { verificarToken, soloAdmin } from '../middleware/auth.js'
import { extraerTexto } from '../utils/extractorTexto.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const tiposPermitidos = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
}

// ─── Memory storage para poder leer el buffer y extraer texto ───
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (tiposPermitidos[file.mimetype]) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de archivo no permitido'), false)
    }
  }
})

// ─── Helper: subir buffer a Cloudinary (igual que tu expediente pero con buffer) ───
function subirBufferACloudinary(buffer, nombreArchivo) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'rrhh-documentos',
        resource_type: 'raw',
        public_id: `${Date.now()}-${nombreArchivo.replace(/\s+/g, '_')}`
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)  // ← .end(buffer) es más simple que pipe
  })
}

// ─── POST — Subir documento ──────────────────────────────────
router.post('/', verificarToken, soloAdmin, (req, res, next) => {
  upload.single('archivo')(req, res, (err) => {
    if (err) {
      console.error('ERROR MULTER:', err)
      return res.status(400).json({ mensaje: err.message })
    }
    next()
  })
}, async (req, res) => {
  try {
    const tipoArchivo = tiposPermitidos[req.file.mimetype]

    // 1. Extraer texto del buffer para Gemini
    const contenidoTexto = await extraerTexto(req.file.buffer, tipoArchivo)
    console.log('📝 Texto extraído:', contenidoTexto?.substring(0, 100))

    // 2. Subir el mismo buffer a Cloudinary
    const resultadoCloudinary = await subirBufferACloudinary(
      req.file.buffer,
      req.file.originalname
    )
    console.log('☁️ Cloudinary URL:', resultadoCloudinary.secure_url)

    // 3. Guardar en MongoDB con URL + texto extraído
    const doc = await Documento.create({
      nombre:             req.file.originalname,
      tipoArchivo,
      contenidoTexto,
      urlCloudinary:      resultadoCloudinary.secure_url,   // ← para descargar
      publicIdCloudinary: resultadoCloudinary.public_id,    // ← para eliminar
      tamaño:             req.file.size,
      subidoPor:          req.usuario.id,
      nombreSubidoPor:    req.usuario.nombre || req.usuario.email
    })

    res.json({ mensaje: 'Documento subido exitosamente', documento: doc })
  } catch (error) {
    console.error('❌ Error:', error)
    res.status(500).json({ mensaje: 'Error al subir documento', detalle: error.message })
  }
})

// ─── GET — Listar documentos ─────────────────────────────────
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const docs = await Documento.find({ activo: true })
      .select('-contenidoTexto')  // No enviamos el texto al frontend
      .sort({ fechaSubida: -1 })
    res.json(docs)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener documentos' })
  }
})

// ─── DELETE — Eliminar documento ─────────────────────────────
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const doc = await Documento.findById(req.params.id)
    if (!doc) return res.status(404).json({ mensaje: 'Documento no encontrado' })

    // Eliminar de Cloudinary
    if (doc.publicIdCloudinary) {
      await cloudinary.uploader.destroy(doc.publicIdCloudinary, {
        resource_type: 'raw'
      })
      console.log('🗑️ Eliminado de Cloudinary:', doc.publicIdCloudinary)
    }

    await Documento.findByIdAndUpdate(req.params.id, { activo: false })
    res.json({ mensaje: 'Documento eliminado correctamente' })
  } catch (error) {
    console.error('❌ Error al eliminar:', error)
    res.status(500).json({ mensaje: 'Error al eliminar documento' })
  }
})

export default router