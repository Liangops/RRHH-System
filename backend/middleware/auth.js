import jwt from 'jsonwebtoken'
import Usuario from '../models/usuario.js'

export function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

export function soloSuperAdmin(req, res, next) {
  if (req.usuario.rol !== 'superadmin') return res.status(403).json({ error: 'Sin permiso' })
  next()
}

export function soloAdmin(req, res, next) {
  if (!['superadmin', 'admin'].includes(req.usuario.rol)) return res.status(403).json({ error: 'Sin permiso' })
  next()
}