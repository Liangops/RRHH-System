<script setup>
import { ref, reactive, onMounted } from 'vue'

const API = '/api/departamentos'

const modalAbierto = ref(false)
const modalTipo = ref('')
const form = reactive({})
const cargando = ref(false)

const departamentos = ref([])

onMounted(async () => {
    cargando.value = true
    const res = await fetch(API)
    departamentos.value = await res.json()
    cargando.value = false
})

function openModal(tipo) {
    modalTipo.value = tipo;
    Object.keys(form).forEach(k => delete form[k])
    modalAbierto.value = true
}

function closeModal() {
    modalAbierto.value = false;
}

function editarDepartamento(departamento) {
    Object.assign(form, { ...departamento})
    modalTipo.value = 'departamento'
    modalAbierto.value = true
}





// ─── Guardar (crear o editar) ─────────────────────────────
async function guardarDepartamento() {
  const esEdicion = !!form._id  // MongoDB usa _id

  const res = await fetch(esEdicion ? `${API}/${form._id}` : API, {
    method: esEdicion ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  })

  const departamentoGuardado = await res.json()

  if (esEdicion) {
    // Actualizar en la lista local

    const index = departamentos.value.findIndex(e => e._id === form._id)
    if (index !== -1) departamentos.value[index] = departamentoGuardado
  } else {
    // Agregar el nuevo a la lista
    departamentos.value.push(departamentoGuardado)
    
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
                <div class="page-title">Departamentos</div>
                <div class="page-subtitle">Áreas organizacionales de Grupo M</div>
            </div>
            <button class="btn btn-primary" @click="openModal('departamento')">
                <i class="ti ti-plus"></i>
                Nuevo Departamento
            </button>
        </div>

       

        <!-- Tabla -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Listado de departamentos</span>
                
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Codigo</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Empleados</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="dept in departamentos" :key="dept._id">
                        <td>{{ dept.codigo }}</td>
                        <td>{{ dept.nombre }}</td>
                        <td>{{ dept.descripcion }}</td>
                        <td>{{ dept.empleados }}</td>
                        <td class="td-actions">
                            <button class="btn-actions" @click="editarDepartamento(dept)" title="Editar">
                                <i class="ti ti-edit"></i>
                            </button>
                           
                        </td>
                    </tr>
                    <tr v-if="departamentos.length == 0">
                        <td colspan="7" style="text-align:center;color:#9ca3af;padding:24px">
                            No hay departamentos registrados
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
                <span class="modal-title">{{ form._id ? 'Editar departamento' : 'Registrar departamento' }}</span>
                <button class="modal-close" @click="closeModal">
                    <i class="ti ti-x"></i>
                </button>
            </div>
            <div class="modal-body">
              
                    <div class="form-group">
                        <label class="form-label">Codigo *</label>
                        <input class="form-control" v-model="form.codigo" placeholder="Ej: 10583" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Nombre *</label>
                        <input class="form-control" v-model="form.nombre" placeholder="Ej: Mantenimiento" />

                </div>
                <div class="form-group">
                        <label class="form-label">Empleados *</label>
                        <input class="form-control" v-model="form.empleados" placeholder="Ej: 12" />

                </div>
        
                    <div class="form-group">
                        <label class="form-label">Descripción *</label>
                        <textarea  class="form-control" v-model="form.descripcion" rows="4" cols="50" placeholder="Ej: Administrar el taller"></textarea>
                    </div>
 
                
                    
                
            </div>
            <div class="modal-footer">
                <button class="btn" @click="closeModal">Cancelar</button>
                <button class="btn btn-primary" @click="guardarDepartamento">
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