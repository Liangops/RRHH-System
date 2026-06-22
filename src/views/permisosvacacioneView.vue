x<script setup>
import { ref, reactive, onMounted } from 'vue'

const modalAbierto = ref(false)
const modalTipo = ref('')
const permisoSeleccionado = ref(null)
const permisos_vacaciones = ref([])

const form = reactive({ archivos: [] })
const empleados = ref([])





onMounted(async () => {
    try {
        const [resEmp, resPer] = await Promise.all([
            fetch('/api/empleados'),
            fetch('/api/permisosvacaciones')
        ])
        empleados.value = await resEmp.json()
        permisos_vacaciones.value = await resPer.json()
    } catch (err) {
        console.error('Error cargando datos:', err)
    }
})




async function guardarPermiso() {
    if (!form.empleado || !form.tipopermiso || !form.fechaIn || !form.fechaFin) {
        alert('Por favor completa todos los campos')
        return
    }

    // Calcular días automáticamente
    const dias = Math.round(
        (new Date(form.fechaFin) - new Date(form.fechaIn)) / (1000 * 60 * 60 * 24)
    )

    const body = {
        empleadoId: form.empleado,
        tipoPermiso: form.tipopermiso,
        fechaInicio: form.fechaIn,
        fechaFin: form.fechaFin,
        dias,
        motivo: form.observaciones
    }

    const res = await fetch('/api/permisosvacaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })

    if (res.ok) {
        const resPer = await fetch('/api/permisosvacaciones')
        permisos_vacaciones.value = await resPer.json()
        closeModal()
    }
}





async function aprobarPermisos(permiso) {
    const res = await fetch(`/api/permisosvacaciones/${permiso._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Aceptado' })
    })

    if (res.ok) {
        const resPer = await fetch('/api/permisosvacaciones')
        permisos_vacaciones.value = await resPer.json()
    }
}

async function denegarPermisos(permiso) {
    if (confirm('¿Estás seguro de que deseas denegar este permiso?')) {
        const res = await fetch(`/api/permisosvacaciones/${permiso._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'Denegado' })
        })

        if (res.ok) {
            const resPer = await fetch('/api/permisosvacaciones')
            permisos_vacaciones.value = await resPer.json()
        }
    }
}

function openModal(tipo) {
    modalTipo.value = tipo
    Object.keys(form).forEach(k => delete form[k])
    modalAbierto.value = true
}

function closeModal() {
    modalAbierto.value = false
}





</script>

<template>
    <!-- Contenido Principal -->
    <main class="main" id="main-content">

        <!-- Header -->
        <div class="page-header">
            <div>
                <div class="page-title">Permisos y Vacaciones</div>
                <div class="page-subtitle">Solicitudes del personal

</div>
            </div>
            <button class="btn btn-primary" @click="openModal('solicitiud')">
                <i class="ti ti-plus"></i>
                Nueva solicitud
            </button>
        </div>

    
        <!-- Tabla -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Listado de solicitudes</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Tipo</th>
                        <th>Desde</th>
                        <th>Hasta</th>
                        <th>Días</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="permisos in permisos_vacaciones" :key="permisos._id">
                        <td>{{ permisos.empleadoId?.nombre }} {{ permisos.empleadoId?.apellido }}</td>


                        <td>{{ permisos.tipoPermiso }}</td>
                        <td>{{ permisos.fechaInicio ? new Date(permisos.fechaInicio).toLocaleDateString('es-DO') : '-' }}</td>
                        <td>{{ permisos.fechaFin ? new Date(permisos.fechaFin).toLocaleDateString('es-DO') : '-' }}</td>
                        <td>{{ permisos.dias }}</td>
                        <td>
                            <span class="badge" :class="{
                                 'badge-success': permisos.estado === 'Aceptado',
                                 'badge-danger':  permisos.estado === 'Denegado',
                                 'badge-warning': permisos.estado === 'En revisión'
                                }">
                             {{ permisos.estado }}
                            </span>
                        </td>
                        <td class="td-actions">
                      <button 
                      class="btn-actions" 
                              @click="aprobarPermisos(permisos)" 
                              title="Aprobar"
                              :disabled="permisos.estado === 'Aceptado' || permisos.estado === 'Denegado'"
                          >
                              <i class="ti ti-check"></i>
                          </button>
                          <button 
                              class="btn-actions" 
                              @click="denegarPermisos(permisos)" 
                              title="Denegar"
                              :disabled="permisos.estado === 'Aceptado' || permisos.estado === 'Denegado'"
                          >
                              <i class="ti ti-x"></i>
                          </button>
                      </td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal -->
    <div v-if="modalAbierto" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
            <div class="modal-header">
                <span class="modal-title">Registrar solicitud de permisos o vacaciones </span>
                <button class="modal-close" @click="closeModal">
                    <i class="ti ti-x"></i>
                </button>
            </div>
            <div class="modal-body">
                
                    <div class="form-group">
                        <label class="form-label">Empleado *</label>
                       <select class="form-control" v-model="form.empleado">
                    <option value="" disabled>Seleccione un empleado</option>
                    <option 
                    v-for="empleado in empleados" 
                    :key="empleado._id" 
                    :value="empleado._id"
                    >
                    {{ empleado.nombre }}
                   </option>
                   </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Tipo de permiso *</label>
                        <select class="form-control" v-model="form.tipopermiso">
                            <option value="" disabled>Seleccione un empleado</option>
                            <option value="Vacaciones">Vacaciones</option>
                            <option value="Permiso Medico">Permiso Medico</option>
                            <option value="Permiso Personal">Permiso personal</option>
                            <option value="Maternidad / Paternidad">Maternidad / Paternidad</option>
                            <option value="Duelo">Duelo</option>
                            <option value="Otros">Otros</option>
                         
                        </select>
                  
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Fecha inicio * </label>
                        <input type="date" class="form-control" v-model="form.fechaIn"/>
                    </div>
                
                <div class="form-group">
                    <label class="form-label">Fecha fin *</label>
                    <input type="date" class="form-control" v-model="form.fechaFin"/>
                </div>
                </div>  
            
                    <div class="form-group">
                        <label class="form-label">Observaciones *</label>
                        <textarea  v-model="form.observaciones" class="form-control" rows="4" cols="50" placeholder="Motivo o notas adicionales..."></textarea>
                    </div>
            </div>
            <div class="modal-footer">
                <button class="btn" @click="closeModal">Cancelar</button>
                <button class="btn btn-primary" @click="guardarPermiso">
                    <i class="ti ti-device-floppy"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</template>

<style>

.main {
    flex: 1;
    margin-left: 218px;
    padding: 28px 28px 60px;
}

body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    background: #f0f2f5;
    color: #1a1a2e;
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

.page-subtitle {
    font-size: 13px;
    color: #6b7280;
    margin-top: 3px;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #fff;
    font-size: 13px;
    cursor: pointer;
    color: #374151;
    font-family: inherit;
    transition: all .15s;
}

.btn-primary {
    background: #1a3c5e;
    color: #fff;
    border-color: #1a3c5e;
}

.btn-primary:hover {
    background: #1d4570;
}

.btn-sm {
    padding: 5px 11px;
    font-size: 12px;
}

.btn-actions {
    padding: 5px 7px;
    border: none;
    background: none;
    cursor: pointer;
    color: #6b7280;
    font-size: 16px;
    border-radius: 6px;
}

.btn-actions:hover {
    background:  rgba(128, 128, 128, 0.3);
    border-radius: 50%;
    color: #374151;
}

.stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 22px;
}

.stats-card {
    background: #fff;
    border-radius: 10px;
    padding: 16px 18px;
    border: 1px solid #e5e7eb;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 5px;
}

.stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a2e;
}

.stat-sub {
    font-size: 11px;
    color: #9ca3af;
    margin-top: 3px;
}

.card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 18px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.card-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a2e;
}

.search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 7px 12px;
    margin-bottom: 16px;
}

.search-bar input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 13px;
    color: #374151;
    width: 100%;
    font-family: inherit;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
}

th {
    text-align: left;
    padding: 12px 12px;
    color: #6b7280;
    font-weight: 500;
    border-bottom: 1px solid #e5e7eb;
    font-size: 12px;
    background: #f9fafb;
}

td {
    padding: 10px 12px;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: middle;
}

tr:last-child td {
    border-bottom: none;
}

tr:hover td {
    background: #fafafa;
}

.td-actions {
    display: flex;
    gap: 4px;
}

.badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
}

.badge-success {
    background: #dcfce7;
    color: #166534;
}

.badge-warning {
    background: #fef9c3;
    color: #854d0e;
}

.badge-danger {
    background: #fee2e2;
    color: #991b1b;
}

.btn-icon:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}


/* Modal */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
}

.modal {
    background: #fff;
    border-radius: 14px;
    width: 460px;
    max-width: 95vw;
    box-shadow: 0 20px 60px rgba(0, 0, 0, .2);
    overflow: hidden;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
}

.modal-close {
    background: none;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    font-size: 22px;
    line-height: 1;
}

.modal-close:hover {
    color: #374151;
}

.modal-body {
    padding: 22px;
    max-height: 70vh;
    overflow-y: auto;
}

.modal-footer {
    padding: 16px 22px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.form-group {
    margin-bottom: 15px;
}

.form-label {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 5px;
    display: block;
}

.form-control {
    width: 100%;
    padding: 8px 11px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #fff;
    color: #1a1a2e;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    transition: border-color .15s;
}

.form-control:focus {
    border-color: #1a3c5e;
    box-shadow: 0 0 0 3px rgba(26, 60, 94, .08);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
</style>