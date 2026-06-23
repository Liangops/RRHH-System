<script setup>
import { ref } from 'vue'

const cargando = ref('')

function headers() {
    return {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
}

async function descargarExcel(tipo, nombreArchivo) {
    cargando.value = tipo
    try {
        const res = await fetch(`/api/reportes/${tipo}`, { headers: headers() })
        if (!res.ok) throw new Error('Error al generar el reporte')

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = nombreArchivo
        a.click()
        URL.revokeObjectURL(url)
    } catch (e) {
        alert(e.message)
    } finally {
        cargando.value = ''
    }
}
</script>

<template>
    <main class="main" id="main-content">
        <div class="page-header">
            <div>
                <div class="page-title">Reportes</div>
                <div class="page-subtitule">Informes administrativos y gerenciales</div>
            </div>
        </div>

        <div class="report-grid">

            <div class="report-card">
                <i class="ti ti-users"></i>
                <div class="report-card-title">Reporte de empleados</div>
                <div class="report-card-desc">Lista completa del personal activo e inactivo con sus datos principales.</div>
                <button
                    class="btn btn-sm"
                    :disabled="cargando === 'empleados'"
                    @click="descargarExcel('empleados', 'reporte_empleados.xlsx')"
                >
                    <i class="ti ti-file-spreadsheet"></i>
                    {{ cargando === 'empleados' ? 'Generando...' : 'Excel' }}
                </button>
            </div>

            <div class="report-card">
                <i class="ti ti-school"></i>
                <div class="report-card-title">Reporte de capacitaciones</div>
                <div class="report-card-desc">Participación, cursos completados y pendientes por empleado.</div>
                <button
                    class="btn btn-sm"
                    :disabled="cargando === 'capacitaciones'"
                    @click="descargarExcel('capacitaciones', 'reporte_capacitaciones.xlsx')"
                >
                    <i class="ti ti-file-spreadsheet"></i>
                    {{ cargando === 'capacitaciones' ? 'Generando...' : 'Excel' }}
                </button>
            </div>

            <div class="report-card">
                <i class="ti ti-calendar-off"></i>
                <div class="report-card-title">Reporte de permisos</div>
                <div class="report-card-desc">Permisos y vacaciones aprobadas, pendientes y rechazadas.</div>
                <button
                    class="btn btn-sm"
                    :disabled="cargando === 'permisos'"
                    @click="descargarExcel('permisos', 'reporte_permisos.xlsx')"
                >
                    <i class="ti ti-file-spreadsheet"></i>
                    {{ cargando === 'permisos' ? 'Generando...' : 'Excel' }}
                </button>
            </div>

            <div class="report-card">
                <i class="ti ti-chart-bar"></i>
                <div class="report-card-title">Reporte gerencial</div>
                <div class="report-card-desc">Indicadores generales de RR.HH. para toma de decisiones. Incluye resumen y desglose por departamento.</div>
                <button
                    class="btn btn-sm"
                    :disabled="cargando === 'gerencial'"
                    @click="descargarExcel('gerencial', 'reporte_gerencial.xlsx')"
                >
                    <i class="ti ti-file-spreadsheet"></i>
                    {{ cargando === 'gerencial' ? 'Generando...' : 'Excel' }}
                </button>
            </div>

        </div>
    </main>
</template>

<style scoped>
.main {
    flex: 1;
    margin-left: 218px;
    padding: 28px 28px 40px;
}

.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a2e;
}

.page-subtitule {
    font-size: 13px;
    color: #6b7280;
    margin-top: 3px;
}

.report-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.report-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: border-color .15s, box-shadow .15s;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.report-card:hover {
    border-color: #1a3c5e;
    box-shadow: 0 4px 16px rgba(26, 60, 94, .1);
}

.report-card i {
    font-size: 20px;
    color: #1a3c5e;
}

.report-card-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #1a1a2e;
}

.report-card-desc {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
    flex: 1;
}

.btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    background: #fff;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: border-color .15s, box-shadow .15s;
    align-self: flex-start;
}

.btn:hover:not(:disabled) {
    border-color: #1a3c5e;
    box-shadow: 0 4px 16px rgba(26, 60, 94, .1);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-sm {
    padding: 5px 11px;
    font-size: 13px;
}
</style>