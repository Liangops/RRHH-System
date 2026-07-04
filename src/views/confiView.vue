<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const API_USUARIOS = '/api/admin/usuarios'
const API_EMPLEADOS = '/api/empleados'

const usuarios = ref([])
const empleados = ref([])
const modalAbierto = ref(false)
const form = reactive({})
const erroresForm = reactive({})
const cargando = ref(false)

onMounted(async () => {
  cargando.value = true
  const [resU, resE] = await Promise.all([
    fetch('/api/admin/usuarios', { headers: authHeaders() }),
    fetch('/api/empleados', { headers: authHeaders() })
  ])
  usuarios.value = await resU.json()
  empleados.value = await resE.json()
  cargando.value = false
})

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

function limpiarErrores() {
  Object.keys(erroresForm).forEach(k => delete erroresForm[k])
}

function validarForm() {
  limpiarErrores()

  if (!form.nombre?.trim())
    erroresForm.nombre = 'El nombre de usuario es obligatorio.'

  if (!form.correo?.trim())
    erroresForm.correo = 'El correo electrónico es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
    erroresForm.correo = 'Ingresa un correo válido.'

  if (!form._id && !form.password?.trim())
    erroresForm.password = 'La contraseña es obligatoria.'
  else if (!form._id && form.password.length < 8)
    erroresForm.password = 'Mínimo 8 caracteres.'

  if (!form.rol)
    erroresForm.rol = 'Selecciona un rol.'

  if (!form.empleadoId)
    erroresForm.empleadoId = 'Selecciona un empleado.'

  return Object.keys(erroresForm).length === 0
}

function openModal() {
  Object.keys(form).forEach(k => delete form[k])
  limpiarErrores()
  modalAbierto.value = true
}

function closeModal() {
  modalAbierto.value = false
  limpiarErrores()
}

function editarUsuario(usuario) {
  Object.assign(form, { ...usuario })
  limpiarErrores()
  modalAbierto.value = true
}

async function guardarUsuario() {
  if (!validarForm()) return

  const esEdicion = !!form._id

  const body = {
    nombre: form.nombre,
    correo: form.correo,
    password: form.password,
    rol: form.rol,
    empleadoId: form.empleadoId,
    permisos: []
  }

  const res = await fetch(
    esEdicion ? `${API_USUARIOS}/${form._id}` : API_USUARIOS,
    {
      method: esEdicion ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body)
    }
  )

  const data = await res.json()
  if (esEdicion) {
    const idx = usuarios.value.findIndex(u => u._id === form._id)
    if (idx !== -1) usuarios.value[idx] = data.empleado ?? data
  } else {
    if (data.empleado) usuarios.value.push(data.empleado)
  }

  closeModal()
}

const empleadoNombre = (id) => {
  const e = empleados.value.find(e => e._id === id)
  return e ? `${e.nombre} ${e.apellido ?? ''}`.trim() : '—'
}
</script>

<template>
  <main class="main">
    <div class="page-header">
      <div>
        <div class="page-title">Configuración general</div>
        <div class="page-subtitle">Parámetros y administración del sistema</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Gestión de usuarios y roles</span>
        <button class="btn btn-primary" @click="openModal">
          <i class="ti ti-plus"></i> Nuevo usuario
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Empleado vinculado</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usuarios" :key="u._id">
            <td>{{ u.nombre }}</td>
            <td>{{ u.correo }}</td>
            <td>{{ empleadoNombre(u.empleadoId) }}</td>
            <td>
              <span class="badge badge-rol">{{ u.rol }}</span>
            </td>
            <td>
              <span class="badge" :class="u.estado === 'activo' ? 'badge-success' : 'badge-warning'">
                {{ u.estado === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="td-actions">
              <button class="btn-actions" @click="editarUsuario(u)" title="Editar">
                <i class="ti ti-edit"></i>
              </button>
            </td>
          </tr>
          <tr v-if="usuarios.length === 0">
            <td colspan="5" style="text-align:center; color:#9ca3af; padding:24px;">
              No hay usuarios registrados.
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
        <span class="modal-title">{{ form._id ? 'Editar usuario' : 'Nuevo usuario del sistema' }}</span>
        <button class="modal-close" @click="closeModal"><i class="ti ti-x"></i></button>
      </div>

      <div class="modal-body">

        <!-- Empleado vinculado -->
        <div class="form-group">
          <label class="form-label">Empleado vinculado *</label>
          <select class="form-control" :class="{ 'input-error': erroresForm.empleadoId }" v-model="form.empleadoId">
            <option value="" disabled>Seleccionar...</option>
            <option v-for="e in empleados" :key="e._id" :value="e._id">
              {{ e.nombre }} {{ e.apellido }}
            </option>
          </select>
          <span v-if="erroresForm.empleadoId" class="error-msg">{{ erroresForm.empleadoId }}</span>
        </div>

        <!-- Nombre -->
        <div class="form-group">
          <label class="form-label">Nombre de usuario *</label>
          <input
            class="form-control"
            :class="{ 'input-error': erroresForm.nombre }"
            v-model="form.nombre"
            placeholder="Ej: maria.reyes"
          />
          <span v-if="erroresForm.nombre" class="error-msg">{{ erroresForm.nombre }}</span>
        </div>

        <!-- Correo -->
        <div class="form-group">
          <label class="form-label">Correo electrónico *</label>
          <input
            class="form-control"
            :class="{ 'input-error': erroresForm.correo }"
            v-model="form.correo"
            placeholder="correo@empresa.com"
          />
          <span v-if="erroresForm.correo" class="error-msg">{{ erroresForm.correo }}</span>
        </div>

        <!-- Contraseña (solo requerida al crear) -->
        <div class="form-group">
          <label class="form-label">
            Contraseña {{ form._id ? '(dejar vacío para no cambiar)' : '*' }}
          </label>
          <input
            class="form-control"
            :class="{ 'input-error': erroresForm.password }"
            type="password"
            v-model="form.password"
            placeholder="Mínimo 8 caracteres"
          />
          <span v-if="erroresForm.password" class="error-msg">{{ erroresForm.password }}</span>
        </div>

        <!-- Rol -->
        <div class="form-group">
          <label class="form-label">Rol *</label>
          <select
            class="form-control"
            :class="{ 'input-error': erroresForm.rol }"
            v-model="form.rol"
          >
            <option value="">Seleccionar...</option>
            <option value="admin">Administrador</option>
            <option value="empleado">Empleado</option>
          </select>
          <span v-if="erroresForm.rol" class="error-msg">{{ erroresForm.rol }}</span>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn" @click="closeModal">Cancelar</button>
        <button class="btn btn-primary" @click="guardarUsuario">
          <i class="ti ti-device-floppy"></i> Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main { flex: 1; margin-left: 218px; padding: 28px 28px 60px; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 18px; font-weight: 600; color: #1a1a2e; font-family: 'IM Fell English', Georgia, serif; }
.page-subtitle { font-size: 13px; color: #6b7280; margin-top: 3px; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 15px; border: 1px solid #d1d5db; background: #fff; font-size: 13px; color: #374151; cursor: pointer; transition: all .15s; }
.btn-primary { background: #1a3c5e; color: #fff; border-color: #1a3c5e; }
.btn-primary:hover { background: #1d4570; }

.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 20px; margin-bottom: 18px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 600; color: #1a1a2e; font-family: 'IM Fell English', Georgia, serif; }

table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
th { text-align: left; padding: 12px; color: #6b7280; font-weight: 500; border-bottom: 1px solid #e5e7eb; font-size: 12px; background: #f9fafb; }
td { padding: 10px 12px; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafafa; }

.td-actions { display: flex; gap: 4px; }
.btn-actions { background: none; border: 1px solid #e5e7eb; border-radius: 7px; padding: 5px 8px; cursor: pointer; color: #6b7280; font-size: 14px; transition: all .15s; }
.btn-actions:hover { background: #f3f4f6; color: #374151; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-warning { background: #fef9c3; color: #854d0e; }
.badge-rol { background: #eff6ff; color: #1e40af; }

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

/* Validación */
.input-error { border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
.error-msg { display: block; font-size: 11px; color: #ef4444; margin-top: 4px; }
</style>