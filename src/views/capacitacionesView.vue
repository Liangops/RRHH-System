x<script setup>
import { ref, reactive } from 'vue'

const modalAbierto = ref(false)
const modalTipo = ref('')
const form = reactive({})

const capacitaciones = ref([
    {
        curso: 'Liderazgo y Desempeño',
        fechaInicio: '13/06/2026',
        duracion: '2 semanas',
        participantes: '14',
        estado: 'Proximo'
    },
    {
        
        curso: 'Proyectos Integradores',
        fechaInicio: '13/06/2026',
        duracion: '3 días',
        participantes: '14',
        estado: 'Proximo'
    },
    {
        curso: 'Metodologia Agíl en el trabajo',
        fechaInicio: '13/06/2026',
        duracion: '8 horas',
        participantes: '14',
        estado: 'En proceso'
    }
])



function aprobarPermisos(empleado) {
    // codigo para aprobar al empleado
}

function openModal(tipo) {
    modalTipo.value = tipo
    Object.keys(form).forEach(k => delete form[k])
    modalAbierto.value = true
}

function closeModal() {
    modalAbierto.value = false
}

function editarCapacitacion(caps) {
    Object.assign(form, { ...caps })
    modalTipo.value = 'caps'
    modalAbierto.value = true
}

function guardarEmpleado() {
    if (form.id) {
        // Editar existente
        const index = empleados.value.findIndex(e => e.id === form.id)
        if (index !== -1) {
            empleados.value[index] = { ...form }
        }
    } else {
        // Crear nuevo
        const nuevoId = empleados.value.length
            ? Math.max(...empleados.value.map(e => e.id)) + 1
            : 1
        empleados.value.push({ ...form, id: nuevoId })
    }
    closeModal()
}






</script>

<template>
    <!-- Contenido Principal -->
    <main class="main" id="main-content">

        <!-- Header -->
        <div class="page-header">
            <div>
                <div class="page-title">Capacitaciones</div>
                <div class="page-subtitle">Formación y desarrollo del personal

</div>
            </div>
            <button class="btn btn-primary" @click="openModal('solicitiud')">
                <i class="ti ti-plus"></i>
                Nueva capacitación
            </button>
        </div>

    
        <!-- Tabla -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Listado de cursos</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Fecha de inicio</th>
                        <th>Duración</th>
                        <th>Participantes</th>
                        <th>Estado</th>                        
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="caps in capacitaciones">
                        <td>{{ caps.curso }}</td>
                        <td>{{ caps.fechaInicio }}</td>
                        <td>{{ caps.duracion }}</td>
                        <td>{{ caps.participantes }}</td>
                        <td>
                            <span class="badge" :class="caps.estado === 'Proximo' ? 'badge-success' : 'badge-warning'">
                                {{ caps.estado }}
                            </span>
                        </td>
                        <td class="td-actions">
                            <button class="btn-icon" @click="editarCapacitacion(caps)" title="Modificar">
                                <i class="ti ti-edit"></i>
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
                <span class="modal-title">{{ form.id ? 'Editar capacitación' : 'Registrar capacitación' }}</span>
                <button class="modal-close" @click="closeModal">
                    <i class="ti ti-x"></i>
                </button>
            </div>
            <div class="modal-body">
                
                    <div class="form-group">
                        <label class="form-label">Nombre del curso *</label>
                        <input type="text" class="form-control" placeholder="Ej: Proyectos Integradores">
                    </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Fecha inicio * </label>
                        <input type="date" class="form-control"/>
                    </div>
                
                <div class="form-group">
                    <label class="form-label">Duración *</label>
                    <input type="text" class="form-control" placeholder="Ej: 12 horas"/>
                </div>
                </div>  
            
                    <div class="form-group">
                        <label class="form-label">Descripción del curso *</label>
                        <textarea  class="form-control" rows="4" cols="50" placeholder="Motivo, descripción o notas adicionales..."></textarea>
                        
                    </div>
            </div>
            <div class="modal-footer">
                <button class="btn" @click="closeModal">Cancelar</button>
                <button class="btn btn-primary" @click="guardarEmpleado">
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

.btn-icon {
    padding: 5px 7px;
    border: none;
    background: none;
    cursor: pointer;
    color: #6b7280;
    font-size: 16px;
    border-radius: 6px;
}

.btn-icon:hover {
    background: #f3f4f6;
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