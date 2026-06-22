<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const API = '/api/empleados'

const modalAbierto = ref(false)
const modalTipo = ref('')
const form = reactive({})
const cargando = ref(false)

const empleados = ref([])  // ← Ya no hardcodeado

// ─── Cargar empleados al montar ───────────────────────────
onMounted(async () => {
  cargando.value = true
  const res = await fetch(API)
  empleados.value = await res.json()
  cargando.value = false
})

// ─── Modal ────────────────────────────────────────────────
function openModal(tipo) {
  modalTipo.value = tipo
  Object.keys(form).forEach(k => delete form[k])
  modalAbierto.value = true
}

function closeModal() {
  modalAbierto.value = false
}

function editarEmpleado(empleado) {
  // MongoDB usa _id, no id
  Object.assign(form, { ...empleado })
  modalTipo.value = 'empleado'
  modalAbierto.value = true
}

function verEmpleado(empleado) {
  console.log('Ver:', empleado)
}

// ─── Eliminar ─────────────────────────────────────────────
async function eliminarEmpleado(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) return

  await fetch(`${API}/${id}`, { method: 'DELETE' })
  // Quitar de la lista sin recargar
  empleados.value = empleados.value.filter(e => e._id !== id)
}

// ─── Guardar (crear o editar) ─────────────────────────────
async function guardarEmpleado() {
  const esEdicion = !!form._id  // MongoDB usa _id

  const res = await fetch(esEdicion ? `${API}/${form._id}` : API, {
    method: esEdicion ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  })

  const empleadoGuardado = await res.json()

  if (esEdicion) {
    // Actualizar en la lista local
    const index = empleados.value.findIndex(e => e._id === form._id)
    if (index !== -1) empleados.value[index] = empleadoGuardado
  } else {
    // Agregar el nuevo a la lista
    empleados.value.push(empleadoGuardado)
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
                <div class="page-title">Empleados</div>
                <div class="page-subtitle">Gestión del personal registrado en el sistema</div>
            </div>
            <button class="btn btn-primary" @click="openModal('empleado')">
                <i class="ti ti-plus"></i>
                Nuevo Empleado
            </button>
        </div>

        <!-- Stats -->
        <div class="stats">
            <div class="stats-card">
                <div class="stat-label">Total Empleados</div>
                <div class="stat-value">{{ empleados.length }}</div>
                <div class="stat-sub">Registrados en el sistema</div>
            </div>
            <div class="stats-card">
                <div class="stat-label">Empleados Activos</div>
                <div class="stat-value">{{ empleados.filter(e => e.estado === 'Activo').length }}</div>
                <div class="stat-sub">En nómina activa</div>
            </div>
            <div class="stats-card">
                <div class="stat-label">En Permiso o Vacaciones</div>
                <div class="stat-value">{{ empleados.filter(e => e.estado === 'En permiso').length }}</div>
                <div class="stat-sub">Permisos o Vacaciones aprobadas</div>
            </div>
            <div class="stats-card">
                <div class="stat-label">Nuevos este mes</div>
                <div class="stat-value">{{ empleados.length }}</div>
                <div class="stat-sub">Ingresos recientes</div>
            </div>
        </div>

        <!-- Tabla -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Listado de empleados</span>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm">
                        <i class="ti ti-download"></i>
                        Exportar
                    </button>
                </div>
            </div>
            <div class="search-bar">
                <i class="ti ti-search"></i>
                <input type="text" placeholder="Buscar por nombre, cédula o cargo" />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Cédula</th>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th>Fecha de ingreso</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="empleado in empleados" :key="empleado._id">
                        <td>{{ empleado.nombre }}</td>
                        <td>{{ empleado.cedula }}</td>
                        <td>{{ empleado.cargo }}</td>
                        <td>{{ empleado.departamento }}</td>
                        <td>{{ empleado.ingreso }}</td>
                        <td>
                            <span class="badge" :class="empleado.estado === 'Activo' ? 'badge-success' : 'badge-warning'">
                                {{ empleado.estado }}
                            </span>
                        </td>
                        <td class="td-actions">
                            <button class="btn-actions" @click="editarEmpleado(empleado)" title="Editar">
                                <i class="ti ti-edit"></i>
                            </button>
                            <button class="btn-actions" @click="eliminarEmpleado(empleado._id)" title="Eliminar">
                                <i class="ti ti-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="empleados.length === 0">
                        <td colspan="7" style="text-align:center; color:#9ca3af; padding: 24px;">
                            No hay empleados registrados.
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
                <span class="modal-title">{{ form._id ? 'Editar empleado' : 'Registrar empleado' }}</span>
                <button class="modal-close" @click="closeModal">
                    <i class="ti ti-x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nombre *</label>
                        <input class="form-control" v-model="form.nombre" placeholder="Ej: José" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Apellido *</label>
                        <input class="form-control" v-model="form.apellido" placeholder="Ej: Fermín" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Cédula *</label>
                        <input class="form-control" v-model="form.cedula" placeholder="001-0000000-0" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Teléfono</label>
                        <input class="form-control" v-model="form.telefono" placeholder="809-000-0000" />
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Correo electrónico *</label>
                    <input class="form-control" v-model="form.correo" placeholder="correo@grupom.com.do" />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Cargo *</label>
                        <input class="form-control" v-model="form.cargo" placeholder="Ej: CEO" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Departamento *</label>
                        <select class="form-control" v-model="form.departamento">
                            <option value="">Seleccionar…</option>
                            <option>Recursos Humanos</option>
                            <option>Tecnología</option>
                            <option>Suministros</option>
                            <option>Legal</option>
                            <option>Finanzas</option>
                            <option>Administración Corporativa</option>
                            <option>Dirección Corporativa</option>
                            <option>Ingeniería Corporativa</option>
                            <option>Auditoría Interna</option>
                            <option>Compliance</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Fecha de ingreso</label>
                        <input type="date" class="form-control" v-model="form.ingreso" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Estado</label>
                        <select class="form-control" v-model="form.estado">
                            <option>Activo</option>
                            <option>Inactivo</option>
                            <option>En permiso</option>
                        </select>
                    </div>
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

.btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 15px;
    border: 1px solid #d1d5db;
    background: #fff;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    
    transition: all .15s;
}

.btn-primary { 
    background: #1a3c5e; 
    color: #fff; 
    border-color: #1a3c5e; 
}
.btn-primary:hover { 
    background: #1d4570;
    color: #fff; 
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



.stats-card {
    
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #475569;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 2.2rem;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 0.25rem;
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