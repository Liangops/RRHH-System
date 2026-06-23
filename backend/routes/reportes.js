import express from 'express'
import ExcelJS from 'exceljs'
import Empleado from '../models/empleado.js'
import Capacitacion from '../models/capacitaciones.js'
import PermisosVacaciones from '../models/permisos-vacaciones.js'
import { verificarToken, soloAdmin } from '../middleware/auth.js'

const router = express.Router()

// ─── Helper: estilo de cabecera ───────────────────────────────────────────────
function estiloCabecera(worksheet, columnas) {
    worksheet.columns = columnas
    const headerRow = worksheet.getRow(1)
    headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a3c5e' } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFe5e7eb' } }
        }
    })
    headerRow.height = 28
}

function filaAlterna(worksheet) {
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return
        row.eachCell(cell => {
            cell.alignment = { vertical: 'middle', horizontal: 'left' }
            if (rowNumber % 2 === 0) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFf9fafb' } }
            }
        })
        row.height = 22
    })
}

// ─── GET /api/reportes/empleados ─────────────────────────────────────────────
router.get('/empleados', verificarToken, soloAdmin, async (req, res) => {
    try {
        const empleados = await Empleado.find().sort({ apellido: 1 })

        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'RRHH System'
        const sheet = workbook.addWorksheet('Empleados')

        estiloCabecera(sheet, [
            { header: 'Nombre',       key: 'nombre',       width: 20 },
            { header: 'Apellido',     key: 'apellido',     width: 20 },
            { header: 'Cédula',       key: 'cedula',       width: 16 },
            { header: 'Teléfono',     key: 'telefono',     width: 16 },
            { header: 'Correo',       key: 'correo',       width: 28 },
            { header: 'Cargo',        key: 'cargo',        width: 22 },
            { header: 'Departamento', key: 'departamento', width: 22 },
            { header: 'Ingreso',      key: 'ingreso',      width: 14 },
            { header: 'Estado',       key: 'estado',       width: 12 },
        ])

        empleados.forEach(e => {
            sheet.addRow({
                nombre:       e.nombre,
                apellido:     e.apellido,
                cedula:       e.cedula,
                telefono:     e.telefono,
                correo:       e.correo,
                cargo:        e.cargo,
                departamento: e.departamento,
                ingreso:      e.ingreso,
                estado:       e.estado,
            })
        })

        filaAlterna(sheet)

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_empleados.xlsx"')
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        res.status(500).json({ error: 'Error al generar reporte de empleados' })
    }
})

// ─── GET /api/reportes/capacitaciones ────────────────────────────────────────
router.get('/capacitaciones', verificarToken, soloAdmin, async (req, res) => {
    try {
        const caps = await Capacitacion.find()
            .populate('creadoPor', 'nombre')
            .sort({ fechaInicio: -1 })

        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'RRHH System'
        const sheet = workbook.addWorksheet('Capacitaciones')

        estiloCabecera(sheet, [
            { header: 'Curso',         key: 'curso',       width: 30 },
            { header: 'Descripción',   key: 'descripcion', width: 35 },
            { header: 'Fecha Inicio',  key: 'fechaInicio', width: 16 },
            { header: 'Duración',      key: 'duracion',    width: 14 },
            { header: 'Participantes', key: 'participantes', width: 14 },
            { header: 'Estado',        key: 'estado',      width: 14 },
            { header: 'Creado por',    key: 'creadoPor',   width: 22 },
        ])

        caps.forEach(c => {
            sheet.addRow({
                curso:         c.curso,
                descripcion:   c.descripcion,
                fechaInicio:   c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString('es-DO') : '',
                duracion:      c.duracion,
                participantes: c.participantes,
                estado:        c.estado,
                creadoPor:     c.creadoPor?.nombre || '',
            })
        })

        filaAlterna(sheet)

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_capacitaciones.xlsx"')
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        res.status(500).json({ error: 'Error al generar reporte de capacitaciones' })
    }
})

// ─── GET /api/reportes/permisos ───────────────────────────────────────────────
router.get('/permisos', verificarToken, soloAdmin, async (req, res) => {
    try {
        const permisos = await PermisosVacaciones.find()
            .populate('empleadoId', 'nombre apellido departamento')
            .sort({ createdAt: -1 })

        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'RRHH System'
        const sheet = workbook.addWorksheet('Permisos y Vacaciones')

        estiloCabecera(sheet, [
            { header: 'Empleado',     key: 'empleado',     width: 28 },
            { header: 'Departamento', key: 'departamento', width: 22 },
            { header: 'Tipo Permiso', key: 'tipoPermiso',  width: 20 },
            { header: 'Fecha Inicio', key: 'fechaInicio',  width: 16 },
            { header: 'Fecha Fin',    key: 'fechaFin',     width: 16 },
            { header: 'Días',         key: 'dias',         width: 8  },
            { header: 'Motivo',       key: 'motivo',       width: 35 },
            { header: 'Estado',       key: 'estado',       width: 14 },
        ])

        permisos.forEach(p => {
            sheet.addRow({
                empleado:     p.empleadoId ? `${p.empleadoId.nombre} ${p.empleadoId.apellido}` : '',
                departamento: p.empleadoId?.departamento || '',
                tipoPermiso:  p.tipoPermiso,
                fechaInicio:  p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString('es-DO') : '',
                fechaFin:     p.fechaFin    ? new Date(p.fechaFin).toLocaleDateString('es-DO')    : '',
                dias:         p.dias,
                motivo:       p.motivo,
                estado:       p.estado,
            })
        })

        filaAlterna(sheet)

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_permisos.xlsx"')
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        res.status(500).json({ error: 'Error al generar reporte de permisos' })
    }
})

// ─── GET /api/reportes/gerencial ──────────────────────────────────────────────
router.get('/gerencial', verificarToken, soloAdmin, async (req, res) => {
    try {
        const [empleados, capacitaciones, permisos] = await Promise.all([
            Empleado.find(),
            Capacitacion.find(),
            PermisosVacaciones.find()
        ])

        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'RRHH System'

        // ── Hoja 1: Resumen general ──
        const resumen = workbook.addWorksheet('Resumen General')
        estiloCabecera(resumen, [
            { header: 'Indicador', key: 'indicador', width: 35 },
            { header: 'Valor',     key: 'valor',     width: 20 },
        ])

        const activos   = empleados.filter(e => e.estado === 'Activo').length
        const inactivos = empleados.filter(e => e.estado !== 'Activo').length

        const permisosAprobados  = permisos.filter(p => p.estado === 'Aprobado').length
        const permisosPendientes = permisos.filter(p => p.estado === 'En revisión').length
        const permisosRechazados = permisos.filter(p => p.estado === 'Rechazado').length

        const capsProximo   = capacitaciones.filter(c => c.estado === 'Proximo').length
        const capsEnProceso = capacitaciones.filter(c => c.estado === 'En proceso').length
        const capsCompletado = capacitaciones.filter(c => c.estado === 'Completado').length

        const indicadores = [
            ['Total de empleados',                empleados.length],
            ['Empleados activos',                  activos],
            ['Empleados inactivos',                inactivos],
            ['Total de permisos/vacaciones',       permisos.length],
            ['Permisos aprobados',                 permisosAprobados],
            ['Permisos en revisión',               permisosPendientes],
            ['Permisos rechazados',                permisosRechazados],
            ['Total de capacitaciones',            capacitaciones.length],
            ['Capacitaciones próximas',            capsProximo],
            ['Capacitaciones en proceso',          capsEnProceso],
            ['Capacitaciones completadas',         capsCompletado],
        ]

        indicadores.forEach(([indicador, valor]) => resumen.addRow({ indicador, valor }))
        filaAlterna(resumen)

        // ── Hoja 2: Empleados por departamento ──
        const porDepto = workbook.addWorksheet('Por Departamento')
        estiloCabecera(porDepto, [
            { header: 'Departamento',  key: 'departamento', width: 28 },
            { header: 'Total',         key: 'total',        width: 10 },
            { header: 'Activos',       key: 'activos',      width: 10 },
            { header: 'Inactivos',     key: 'inactivos',    width: 10 },
        ])

        const deptoMap = {}
        empleados.forEach(e => {
            const d = e.departamento || 'Sin departamento'
            if (!deptoMap[d]) deptoMap[d] = { total: 0, activos: 0, inactivos: 0 }
            deptoMap[d].total++
            e.estado === 'Activo' ? deptoMap[d].activos++ : deptoMap[d].inactivos++
        })

        Object.entries(deptoMap).forEach(([departamento, vals]) => {
            porDepto.addRow({ departamento, ...vals })
        })
        filaAlterna(porDepto)

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_gerencial.xlsx"')
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        res.status(500).json({ error: 'Error al generar reporte gerencial' })
    }
})

export default router