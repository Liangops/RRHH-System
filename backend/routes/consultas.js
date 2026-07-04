import express from 'express'
import { verificarToken } from '../middleware/auth.js'
import {
  empleadosPorEstado,
  empleadosPorDepartamento,
  empleadosPorCargo,
  permisosPendientes,
  capacitacionesPorEstado,
  topCapacitacionesPorParticipantes,
  permisosPorDepartamento,
  permisosPorDepartamentoRango,
  distribucionTiposPermiso,
  topEmpleadosConMasPermisos,
  departamentoMasPermisos,
  promedioDiasPorTipo,
usuariosQueMasUsanIA 
} from '../controllers/consultasController.js'

const router = express.Router()

router.use(verificarToken)

// sencillas
router.get('/empleados-por-estado', empleadosPorEstado)
router.get('/empleados-por-departamento', empleadosPorDepartamento)
router.get('/empleados-por-cargo', empleadosPorCargo)
router.get('/permisos-pendientes', permisosPendientes)
router.get('/capacitaciones-por-estado', capacitacionesPorEstado)
router.get('/top-capacitaciones', topCapacitacionesPorParticipantes)

// avanzadas
router.get('/permisos-por-departamento', permisosPorDepartamento)
router.get('/permisos-por-departamento-rango', permisosPorDepartamentoRango)
router.get('/distribucion-tipos-permiso', distribucionTiposPermiso)
router.get('/top-empleados-permisos', topEmpleadosConMasPermisos)
router.get('/departamento-mas-permisos', departamentoMasPermisos)
router.get('/promedio-dias-por-tipo', promedioDiasPorTipo)
router.get('/usuarios-mas-usan-ia', usuariosQueMasUsanIA)


export default router