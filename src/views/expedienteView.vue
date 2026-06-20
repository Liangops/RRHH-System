<script setup>
import { ref, reactive } from 'vue'

const modalAbierto = ref(false)
const modalTipo = ref('')
const form = reactive({})

const expedientes = ref([
    {
        nombre: 'José Andrés Abreu',
        fechacreacion: '10/10/2023',
        documentos: '10',
        observaciones: 'Sin Observaciones',
        estado: 'Activo',
    },

    {
        nombre: 'Aranza Maria Fermin',
        fechacreacion: '10/10/2023',
        documentos: '10',
        observaciones: 'No ha hecho nada de frontend y no pregunta',
        estado: 'Inactivo',
    }
])

function openModal(tipo) {
    modalTipo.value = tipo
    Object.keys(form).forEach(k => delete form[k])
    modalAbierto.value = true
}

function closeModal() {
    modalAbierto.value = false
}

function agregarDocumento(expediente) {
    Object.assign(form, { ...expediente })
    modalTipo.value = 'expediente'
    modalAbierto.value = true
}

function guardarExpediente() {
    if (form.id) {
        // Editar existente
        const index = expedientes.value.findIndex(e => e.nombre === form.nombre)
        if (index !== -1) {
            expedientes.value[index] = { ...form }
        }
    } else {
        // Crear nuevo
        const nuevoId = expedientes.value.length
            ? Math.max(...expedientes.value.map(e => e.nombre)) + 1
            : 1
        expedientes.value.push({ ...form, nombre: nuevoId })
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
                <div class="page-title">Expedientes</div>
                <div class="page-subtitle">Historial administrativo por empleado</div>
            </div>
        </div>

       

        <!-- Tabla -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Listado de departamentos</span>
                
            </div>
            <div class="search-bar">
                <i class="ti ti-search"></i>
                <input type="text" placeholder="Buscar por nombre o cédula" />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Empleado</th>
                        <th>Fecha creación</th>
                        <th>Documentos</th>
                        <th>Observaciones</th>
                        <th>Estado</th>

                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="exp in expedientes">
                        <td>{{ exp.nombre }}</td>
                        <td>{{ exp.fechacreacion }}</td>
                        <td>{{ exp.documentos }}</td>
                        <td>{{ exp.observaciones }}</td>
                        <td>
                            <span class="badge" :class="exp.estado === 'Activo' ? 'badge-success' : 'badge-warning'">
                                {{ exp.estado }}
                            </span>
                        </td>
                        <td class="td-actions">
                            <button class="btn-icon" @click="agregarDocumento(expediente)" title="Agregar otro documento">
                                <i class="ti ti-upload"></i>
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
                <span class="modal-title">{{ form.id ? 'Editar expediente' : 'Agregar documento' }}</span>
                <button class="modal-close" @click="closeModal">
                    <i class="ti ti-x"></i>
                </button>
            </div>
            <div class="modal-body">
            
                    <div class="form-group">
                        <label class="form-label">Nombre del documento *</label>
                        <input class="form-control" v-model="form.nombre" placeholder="Ej: 10583" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoria *</label>
                        <select class="form-control">
                            <option value="">Política</option>
                            <option value="">Reglamento</option>
                            <option value="">Manual</option>
                            <option value="">Procedimiento</option>
                            <option value="">FAQ</option>
                        </select>
          
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Archivo *</label>
                        <input type="file" class="form-control" />
                    </div>
                    
                </div>
                
                    
                
            </div>
            <div class="modal-footer">
                <button class="btn" @click="closeModal">Cancelar</button>
                <button class="btn btn-primary" @click="guardarExpediente">
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