<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const API = '/api/empleados'
const apiDepartamento = '/api/departamentos'

const modalAbierto = ref(false)
const modalTipo = ref('')
const form = reactive({})
const cargando = ref(false)
const errores = reactive({})

const empleados = ref([])
const areasorganizacionales = ref([])
const busqueda = ref('')

const empleadosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  if (!q) return empleados.value
  return empleados.value.filter(e =>
    e.nombre?.toLowerCase().includes(q) ||
    e.cedula?.toLowerCase().includes(q) ||
    e.cargo?.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  cargando.value = true
  try {
    const res = await fetch(API)
    const resDep = await fetch(apiDepartamento)
    const dataEmp = await res.json()
    const dataDep = await resDep.json()
    empleados.value = Array.isArray(dataEmp) ? dataEmp : []
    areasorganizacionales.value = Array.isArray(dataDep) ? dataDep : []
  } catch (err) {
    console.error('Error cargando datos:', err)
    empleados.value = []
    areasorganizacionales.value = []
  } finally {
    cargando.value = false
  }
})

// --- Formateo automático ---

function formatearCedula(e) {
  let val = e.target.value.replace(/\D/g, '').slice(0, 11)
  if (val.length > 9) val = val.slice(0, 3) + '-' + val.slice(3, 10) + '-' + val.slice(10)
  else if (val.length > 3) val = val.slice(0, 3) + '-' + val.slice(3)
  form.cedula = val
}

function formatearTelefono(e) {
  let val = e.target.value.replace(/\D/g, '').slice(0, 10)
  if (val.length > 6) val = val.slice(0, 3) + '-' + val.slice(3, 6) + '-' + val.slice(6)
  else if (val.length > 3) val = val.slice(0, 3) + '-' + val.slice(3)
  form.telefono = val
}

// --- Validaciones ---

function validarCampos() {
  Object.keys(errores).forEach(k => delete errores[k])

  const requeridos = {
    nombre: 'El nombre es requerido',
    apellido: 'El apellido es requerido',
    cedula: 'La cédula es requerida',
    correo: 'El correo es requerido',
    cargo: 'El cargo es requerido',
    departamento: 'El departamento es requerido',
    ingreso: 'La fecha de ingreso es requerida',
    estado: 'El estado es requerido'
  }

  for (const [campo, mensaje] of Object.entries(requeridos)) {
    if (!form[campo]?.toString().trim()) errores[campo] = mensaje
  }

  // Correo: debe tener formato válido con @
  if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
    errores.correo = 'Ingrese un correo electrónico válido'
  }

  // Cédula: exactamente 11 dígitos en formato 000-0000000-0
  if (form.cedula && !/^\d{3}-\d{7}-\d{1}$/.test(form.cedula)) {
    errores.cedula = 'Formato inválido. Use: 001-0000000-0 (11 dígitos)'
  }

  // Teléfono: opcional pero si lo puso debe tener el formato correcto
  if (form.telefono && !/^\d{3}-\d{3}-\d{4}$/.test(form.telefono)) {
    errores.telefono = 'Formato inválido. Use: 809-000-0000'
  }

  return Object.keys(errores).length === 0
}
// --- Modal ---

function openModal(tipo) {
  modalTipo.value = tipo
  Object.keys(form).forEach(k => delete form[k])
  Object.keys(errores).forEach(k => delete errores[k])
  modalAbierto.value = true
}

function closeModal() {
  modalAbierto.value = false
  Object.keys(errores).forEach(k => delete errores[k])
}

function editarEmpleado(empleado) {
  Object.assign(form, { ...empleado })
  Object.keys(errores).forEach(k => delete errores[k])
  modalTipo.value = 'empleado'
  modalAbierto.value = true
}

async function eliminarEmpleado(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este empleado?')) return
  const token = localStorage.getItem('token')
  await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  empleados.value = empleados.value.filter(e => e._id !== id)
}

async function guardarEmpleado() {
  if (!validarCampos()) return

  const esEdicion = !!form._id

  const res = await fetch(esEdicion ? `${API}/${form._id}` : API, {
    method: esEdicion ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form)
  })

  const empleadoGuardado = await res.json()

  if (esEdicion) {
    const index = empleados.value.findIndex(e => e._id === form._id)
    if (index !== -1) empleados.value[index] = empleadoGuardado
  } else {
    empleados.value.push(empleadoGuardado)
  }

  closeModal()
}
</script>

<template>
  <main class="main" id="main-content">

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

    <div class="card">
      <div class="card-header">
        <span class="card-title">Listado de empleados</span>
      </div>
      <div class="search-bar">
        <i class="ti ti-search"></i>
        <input v-model="busqueda" type="text" placeholder="Buscar por nombre, cédula o cargo" />
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
          <tr v-for="empleado in empleadosFiltrados" :key="empleado._id">
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
          <tr v-if="empleadosFiltrados.length === 0">
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
            <input class="form-control" :class="{ 'input-error': errores.nombre }" v-model="form.nombre" placeholder="Ej: José" />
            <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Apellido *</label>
            <input class="form-control" :class="{ 'input-error': errores.apellido }" v-model="form.apellido" placeholder="Ej: Fermín" />
            <span v-if="errores.apellido" class="error-msg">{{ errores.apellido }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Cédula *</label>
            <input type="text" class="form-control" :class="{ 'input-error': errores.cedula }"
              :value="form.cedula" @input="formatearCedula" placeholder="001-0000000-0" maxlength="13" />
            <span v-if="errores.cedula" class="error-msg">{{ errores.cedula }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Teléfono</label>
            <input class="form-control" :class="{ 'input-error': errores.telefono }"
              :value="form.telefono" @input="formatearTelefono" placeholder="809-000-0000" maxlength="12" />
            <span v-if="errores.telefono" class="error-msg">{{ errores.telefono }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Correo electrónico *</label>
          <input class="form-control" :class="{ 'input-error': errores.correo }" v-model="form.correo" placeholder="correo@empresa.com" />
          <span v-if="errores.correo" class="error-msg">{{ errores.correo }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Cargo *</label>
            <input class="form-control" :class="{ 'input-error': errores.cargo }" v-model="form.cargo" placeholder="Ej: CEO" />
            <span v-if="errores.cargo" class="error-msg">{{ errores.cargo }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Departamento *</label>
            <select class="form-control" :class="{ 'input-error': errores.departamento }" v-model="form.departamento">
              <option value="" disabled>Seleccione un departamento</option>
              <option v-for="departament in areasorganizacionales" :key="departament._id" :value="departament.nombre">
                {{ departament.codigo }} - {{ departament.nombre }}
              </option>
            </select>
            <span v-if="errores.departamento" class="error-msg">{{ errores.departamento }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Fecha de ingreso *</label>
            <input type="date" class="form-control" :class="{ 'input-error': errores.ingreso }" v-model="form.ingreso" />
            <span v-if="errores.ingreso" class="error-msg">{{ errores.ingreso }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Estado *</label>
            <select class="form-control" :class="{ 'input-error': errores.estado }" v-model="form.estado">
              <option value="" disabled>Seleccione</option>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
            <span v-if="errores.estado" class="error-msg">{{ errores.estado }}</span>
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
.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08) !important;
}

.error-msg {
  display: block;
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
}

/* El resto de tu CSS sin cambios */
.main { flex: 1; margin-left: 218px; padding: 28px 28px 60px; }
body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background: #f0f2f5; color: #1a1a2e; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 18px; font-weight: 600; color: #1a1a2e; font-family: 'IM Fell English', 'Times New Roman', Georgia, serif; }
.page-subtitle { font-size: 13px; color: #6b7280; margin-top: 3px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 15px; border: 1px solid #d1d5db; background: #fff; font-size: 13px; color: #374151; cursor: pointer; transition: all .15s; }
.btn-primary { background: #1a3c5e; color: #fff; border-color: #1a3c5e; }
.btn-primary:hover { background: #1d4570; color: #fff; }
.btn-sm { padding: 5px 11px; font-size: 12px; }
.btn-icon { padding: 5px 7px; border: none; background: none; cursor: pointer; color: #6b7280; font-size: 16px; border-radius: 6px; }
.btn-icon:hover { background: #f3f4f6; color: #374151; }
.stats-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem 1.5rem; position: relative; overflow: hidden; }
.stats-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #475569; }
.stat-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
.stat-value { display: block; font-family: 'IM Fell English', 'Times New Roman', Georgia, serif; font-size: 2.2rem; color: #0f172a; line-height: 1; margin-bottom: 0.25rem; }
.stat-sub { font-size: 11px; color: #9ca3af; margin-top: 3px; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 20px; margin-bottom: 18px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 600; color: #1a1a2e; font-family: 'IM Fell English', 'Times New Roman', Georgia, serif; }
.search-bar { display: flex; align-items: center; gap: 8px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 7px 12px; margin-bottom: 16px; }
.search-bar input { border: none; background: transparent; outline: none; font-size: 13px; color: #374151; width: 100%; font-family: inherit; }
table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
th { text-align: left; padding: 12px 12px; color: #6b7280; font-weight: 500; border-bottom: 1px solid #e5e7eb; font-size: 12px; background: #f9fafb; }
td { padding: 10px 12px; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafafa; }
.td-actions { display: flex; gap: 4px; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-warning { background: #fef9c3; color: #854d0e; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: #fff; border-radius: 14px; width: 460px; max-width: 95vw; box-shadow: 0 20px 60px rgba(0,0,0,.2); overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid #e5e7eb; }
.modal-title { font-size: 15px; font-weight: 600; color: #1a1a2e; }
.modal-close { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 22px; line-height: 1; }
.modal-close:hover { color: #374151; }
.modal-body { padding: 22px; max-height: 75vh; overflow-y: auto; }
.modal-footer { padding: 16px 22px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 8px; }
.form-group { margin-bottom: 15px; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 5px; display: block; }
.form-control { width: 100%; padding: 8px 11px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #1a1a2e; font-size: 13px; outline: none; font-family: inherit; transition: border-color .15s; box-sizing: border-box; }
.form-control:focus { border-color: #1a3c5e; box-shadow: 0 0 0 3px rgba(26,60,94,.08); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>