<script setup>
import { ref, reactive, onMounted, computed } from 'vue'

const modalAbierto = ref(false)
const modalVerAbierto = ref(false)
const form = reactive({ archivos: [] })
const errores = reactive({})
const empleados = ref([])
const expedientes = ref([])
const expedienteSeleccionado = ref(null)
const expedienteViendo = ref(null)

const observacionesPorEmpleado = ref({})

onMounted(async () => {
  try {
    const [resEmp, resExp, resObs] = await Promise.all([
      fetch('/api/empleados'),
      fetch('/api/expedientes'),
      fetch('/api/expedientes/con-observaciones')
    ])
    empleados.value = await resEmp.json()
    expedientes.value = await resExp.json()
    observacionesPorEmpleado.value = await resObs.json()
  } catch (err) {
    console.error('Error cargando datos:', err)
  }
})

function cantidadDocumentos(empleadoId) {
  const exp = expedientes.value.find(e => e.empleadoId === empleadoId || e.empleadoId?._id === empleadoId)
  return exp?.documentos?.length ?? 0
}

function closeModal() {
  modalAbierto.value = false
  Object.keys(errores).forEach(k => delete errores[k])
}

function agregarDocumento(empleado) {
  expedienteSeleccionado.value = empleado
  Object.keys(form).forEach(k => delete form[k])
  form.archivos = []
  Object.keys(errores).forEach(k => delete errores[k])
  modalAbierto.value = true
}

function verExpediente(empleado) {
  const exp = expedientes.value.find(e =>
    e.empleadoId === empleado._id || e.empleadoId?._id === empleado._id
  )
  expedienteViendo.value = {
    empleado,
    documentos: exp?.documentos ?? []
  }
  modalVerAbierto.value = true
}

function descargarDoc(doc) {
  const url = `/api/expedientes/download?url=${encodeURIComponent(doc.ruta)}&nombre=${encodeURIComponent(doc.nombre)}`
  window.open(url, '_blank')
}

function eliminarArchivo(index) {
  form.archivos.splice(index, 1)
}

function onFileChange(e) {
  const seleccionados = Array.from(e.target.files)
  const invalidos = seleccionados.filter(f => f.type !== 'application/pdf')

  if (invalidos.length > 0) {
    alert('Solo se permiten archivos PDF')
    e.target.value = ''
    form.archivos = []
    return
  }

  form.archivos = seleccionados
}

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

function validarCampos() {
  Object.keys(errores).forEach(k => delete errores[k])

  if (!form.nombre?.trim())       errores.nombre      = 'El nombre del documento es requerido'
  if (!form.categoria)            errores.categoria   = 'La categoría es requerida'
  if (!form.archivos?.length)     errores.archivos    = 'Debes seleccionar al menos un PDF'
  if (!form.observaciones?.trim()) errores.observaciones = 'La descripción es requerida'

  return Object.keys(errores).length === 0
}

async function guardarExpediente() {
  if (!validarCampos()) return

  const data = new FormData()
  data.append('nombre', form.nombre)
  data.append('categoria', form.categoria)
  data.append('observaciones', form.observaciones ?? '')
  form.archivos.forEach(file => data.append('documentos', file))

  const res = await fetch(`/api/expedientes/${expedienteSeleccionado.value._id}/documentos`, {
    method: 'POST',
    body: data
  })

  if (res.ok) {
    const [resExp, resObs] = await Promise.all([
      fetch('/api/expedientes'),
      fetch('/api/expedientes/con-observaciones')
    ])
    expedientes.value = await resExp.json()
    observacionesPorEmpleado.value = await resObs.json()
    closeModal()
  }
}
</script>

<template>
  <main class="main" id="main-content">

    <div class="page-header">
      <div>
        <div class="page-title">Expedientes</div>
        <div class="page-subtitle">Historial administrativo por empleado</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Listado de empleados</span>
      </div>
      <div class="search-bar">
        <i class="ti ti-search"></i>
        <input v-model="busqueda" type="text" placeholder="Buscar por nombre o cédula" />
      </div>
      <table>
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Fecha ingreso</th>
            <th>Documentos</th>
            <th>Observaciones</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in empleadosFiltrados" :key="emp._id">
            <td>{{ emp.nombre }} {{ emp.apellido }}</td>
            <td>{{ emp.ingreso }}</td>
            <td>{{ cantidadDocumentos(emp._id) }}</td>
            <td>{{ observacionesPorEmpleado[emp._id] ?? 'Sin observaciones' }}</td>
            <td>
              <span class="badge" :class="emp.estado === 'Activo' ? 'badge-success' : 'badge-warning'">
                {{ emp.estado }}
              </span>
            </td>
            <td class="td-actions">
              <button class="btn-actions" @click="agregarDocumento(emp)" title="Agregar documento">
                <i class="ti ti-upload"></i>
              </button>
              <button class="btn-actions" @click="verExpediente(emp)" title="Ver expediente">
                <i class="ti ti-eye"></i>
              </button>
            </td>
          </tr>
          <tr v-if="empleadosFiltrados.length === 0">
            <td colspan="6" style="text-align:center; color:#9ca3af; padding:24px">
              No hay empleados registrados.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>

  <!-- Modal: Agregar documento -->
  <div v-if="modalAbierto" class="modal-backdrop" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Agregar documento — {{ expedienteSeleccionado?.nombre }}</span>
        <button class="modal-close" @click="closeModal">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div class="modal-body">

        <div class="form-group">
          <label class="form-label">Nombre del documento *</label>
          <input class="form-control" :class="{ 'input-error': errores.nombre }"
            v-model="form.nombre" placeholder="Ej: Contrato 2024" />
          <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <select class="form-control" :class="{ 'input-error': errores.categoria }" v-model="form.categoria">
            <option value="">Seleccionar categoría</option>
            <option value="Política">Política</option>
            <option value="Reglamento">Reglamento</option>
            <option value="Manual">Manual</option>
            <option value="Procedimiento">Procedimiento</option>
            <option value="FAQ">FAQ</option>
            <option value="Contrato">Contrato</option>
            <option value="Otros">Otros</option>
          </select>
          <span v-if="errores.categoria" class="error-msg">{{ errores.categoria }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">
            Archivos PDF *
            <span style="color:#6b7280; font-weight:400">(puedes seleccionar varios)</span>
          </label>
          <input type="file" class="form-control" :class="{ 'input-error': errores.archivos }"
            accept=".pdf,application/pdf" multiple @change="onFileChange" />
          <span v-if="errores.archivos" class="error-msg">{{ errores.archivos }}</span>
          <div v-if="form.archivos?.length" style="margin-top:8px; display:flex; flex-direction:column; gap:4px">
            <div
              v-for="(f, i) in form.archivos" :key="f.name"
              style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#6b7280; background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:5px 10px"
            >
              <span><i class="ti ti-file-description" style="font-size:15px"></i> {{ f.name }}</span>
              <button @click="eliminarArchivo(i)" style="background:none; border:none; cursor:pointer; color:#9ca3af">
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Descripción *</label>
          <textarea class="form-control" :class="{ 'input-error': errores.observaciones }"
            v-model="form.observaciones" rows="4" placeholder="Ej: Motivo o notas adicionales."></textarea>
          <span v-if="errores.observaciones" class="error-msg">{{ errores.observaciones }}</span>
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

  <!-- Modal: Ver documentos -->
  <div v-if="modalVerAbierto" class="modal-backdrop" @click.self="modalVerAbierto = false">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">
          Expediente — {{ expedienteViendo?.empleado?.nombre }} {{ expedienteViendo?.empleado?.apellido }}
        </span>
        <button class="modal-close" @click="modalVerAbierto = false">
          <i class="ti ti-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div v-if="expedienteViendo?.documentos?.length === 0"
          style="text-align:center; color:#9ca3af; padding:24px">
          Este empleado no tiene documentos aún.
        </div>
        <div
          v-for="doc in expedienteViendo?.documentos" :key="doc._id"
          style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px"
        >
          <div>
            <div style="font-size:13px; font-weight:500; color:#1a1a2e">
              <i class="ti ti-file-description" style="font-size:15px"></i> {{ doc.nombre }}
            </div>
            <div style="font-size:11px; color:#6b7280; margin-top:2px">
              {{ doc.categoria }} · {{ new Date(doc.fechaSubida).toLocaleDateString() }}
            </div>
          </div>
          <button @click="descargarDoc(doc)" class="btn btn-sm">
            <i class="ti ti-download"></i> Descargar
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" @click="modalVerAbierto = false">Cerrar</button>
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

.main { flex: 1; margin-left: 218px; padding: 28px 28px 60px; }
body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background: #f0f2f5; color: #1a1a2e; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 18px; font-weight: 600; color: #1a1a2e; }
.page-subtitle { font-size: 13px; color: #6b7280; margin-top: 3px; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; font-size: 13px; cursor: pointer; color: #374151; font-family: inherit; transition: all .15s; }
.btn-primary { background: #1a3c5e; color: #fff; border-color: #1a3c5e; }
.btn-primary:hover { background: #1d4570; }
.btn-sm { padding: 5px 11px; font-size: 12px; }
.btn-icon { padding: 5px 7px; border: none; background: none; cursor: pointer; color: #6b7280; font-size: 16px; border-radius: 6px; }
.btn-icon:hover { background: rgba(128,128,128,0.10); color: #374151; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
.stats-card { background: #fff; border-radius: 10px; padding: 16px 18px; border: 1px solid #e5e7eb; }
.stat-label { font-size: 12px; color: #6b7280; margin-bottom: 5px; }
.stat-value { font-size: 24px; font-weight: 600; color: #1a1a2e; }
.stat-sub { font-size: 11px; color: #9ca3af; margin-top: 3px; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 20px; margin-bottom: 18px; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-size: 14px; font-weight: 600; color: #1a1a2e; }
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
.modal-body { padding: 22px; max-height: 70vh; overflow-y: auto; }
.modal-footer { padding: 16px 22px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 8px; }
.form-group { margin-bottom: 15px; }
.form-label { font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 5px; display: block; }
.form-control { width: 100%; padding: 8px 11px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; color: #1a1a2e; font-size: 13px; outline: none; font-family: inherit; transition: border-color .15s; box-sizing: border-box; }
.form-control:focus { border-color: #1a3c5e; box-shadow: 0 0 0 3px rgba(26,60,94,.08); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
</style>