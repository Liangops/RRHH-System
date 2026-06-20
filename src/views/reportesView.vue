<script setup>

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
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>

            <div class="report-card">
                <i class="ti ti-clock"></i>
                <div class="report-card-title">Reporte de asistencia</div>
                <div class="report-card-desc">Entradas, salidas, tardanzas e incidencias del período seleccionado.</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>

            </div>

            <div class="report-card">
                <i class="ti ti-cash"></i>
                <div class="report-card-title">Reporte de nómina</div>
                <div class="report-card-desc">Detalle salarial y deducciones del período.</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>
            <div class="report-card">
                <i class="ti ti-school"></i>
                <div class="report-card-title">Reporte de capacitaciones</div>
                <div class="report-card-desc">Participación, cursos completados y pendientes por empleado.</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>
            <div class="report-card">
                  <i class="ti ti-calendar-off"></i>
                <div class="report-card-title">Reporte de permisos</div>
                <div class="report-card-desc">Permisos y vacaciones aprobadas, pendientes y rechazadas.</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>
            <div class="report-card">
                <i class="ti ti-chart-bar"></i>
                <div class="report-card-title">Reporte gerencial</div>
                <div class="report-card-desc">Indicadores generales de RR.HH. para toma de decisiones.</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>
            <div class="report-card">
                <i class="ti ti-shield-check"></i>
                <div class="report-card-title">Reporte de auditoria</div>
                <div class="report-card-desc">Actividades registradas por usuarios en el sistema.</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>
            <div class="report-card">
                <i class="ti ti-map-south"></i>
                <div class="report-card-title">Reporte de suscripciones</div>
                <div class="report-card-desc">Las suscripciones activas en el sistema (Solo administradores).</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>
            <div class="report-card">
                <i class="ti ti-file-invoice"></i>
                <div class="report-card-title">Reporte de facturas</div>
                <div class="report-card-desc">Las facturas registradas hasta el momento en el sistema (Solo administradores).</div>
                <div style="display: flex;gap:8px">
                    <button class="btn btn-sm">
                        <i class="ti ti-file-type-pdf"></i>
                        PDF
                    </button>
                    <button class="btn btn-sm">
                        <i class="ti ti-file-spreadsheet"></i>
                        Excel
                    </button>
                </div>
            </div>
        </div>
    </main>

</template>

<style>
.main{
    flex: -1;
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
    cursor: pointer;
    transition: border-color .15s, box-shadow .15s;
}

.report-card:hover { 
    border-color: #1a3c5e; 
    box-shadow: 0 4px 16px rgba(26,60,94,.1); 
}

.ti {
    font-family: sans-serif;
    speak-as: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    -webkit-font-smoothing: antialiased;
}

.report-card:hover { 
    border-color: #1a3c5e; 
    box-shadow: 0 4px 16px rgba(26,60,94,.1); 
}


.report-card-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 5px;
}

.report-card-desc {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 14px;
    line-height: 1.5;
}

.btn-sm {
    padding: 5px 11px;
    font-size: 13px;
    transition: border-color .15s, box-shadow .15s;
}

.btn-sm:hover {
    border-color: #1a3c5e; 
    box-shadow: 0 4px 16px rgba(26,60,94,.1); 

}



</style>