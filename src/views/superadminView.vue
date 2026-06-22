Para unificar la identidad visual de tu plataforma **RRHH Systems IA**, he rediseñado por completo el panel de Superadmin. He adoptado el sofisticado estilo editorial y minimalista del dashboard de usuarios: incorporando la tipografía serif *IM Fell English* para los títulos clave, suavizando el fondo al tono hueso/arena (`#f5f5f0`), limpiando las tablas con un look más pulido y adaptando los badges a una estética refinada.

También sustituí los textos de los botones por iconos de **Tabler Icons** (`ti ti-...`) para limpiar la interfaz visualmente, alineándose con las tarjetas que ya utilizas.

Aquí tienes el código completo optimizado y estilizado:

```vue
<template>
  <div class="sa-wrap">

    <header class="sa-header">
      <div class="sa-header-left">
        <div class="sa-logo-brand">
          <h1>Panel de <em>administración.</em></h1>
          <p class="sa-sub">RRHH Systems IA — Gestión Global</p>
        </div>
      </div>
      <button class="btn-cerrar" @click="cerrarSesion">
        Cerrar sesión <i class="ti ti-logout"></i>
      </button>
    </header>

    <div class="sa-contenido">
      <div class="sa-stats">
        <div class="stat-card">
          <span class="stat-num">{{ clientes.length }}</span>
          <span class="stat-label">Clientes totales</span>
        </div>
        <div class="stat-card stat-card--demo">
          <span class="stat-num">{{ contarEstado('demo') }}</span>
          <span class="stat-label">En demo</span>
        </div>
        <div class="stat-card stat-card--revision">
          <span class="stat-num">{{ contarEstado('revision') }}</span>
          <span class="stat-label">En revisión</span>
        </div>
        <div class="stat-card stat-card--activo">
          <span class="stat-num">{{ contarEstado('activo') }}</span>
          <span class="stat-label">Activos</span>
        </div>
      </div>

      <div class="sa-tabla-wrap">
        <div class="sa-tabla-header">
          <h2>Clientes registrados</h2>
          <div class="sa-buscador-wrapper">
            <i class="ti ti-search buscador-icono"></i>
            <input
              v-model="busqueda"
              class="sa-buscador"
              placeholder="Buscar por nombre o correo..."
            />
          </div>
        </div>

        <div v-if="cargando" class="sa-loader">
          <i class="ti ti-loader animate-spin"></i> Cargando clientes...
        </div>

        <div v-else-if="error" class="sa-error">
          <i class="ti ti-alert-circle"></i> {{ error }}
        </div>

        <div v-else class="table-responsive">
          <table class="sa-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Registro</th>
                <th>Estado</th>
                <th class="text-right">Cambiar estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="clientesFiltrados.length === 0">
                <td colspan="5" class="sa-empty">No se encontraron clientes coincidentes.</td>
              </tr>
              <tr v-for="cliente in clientesFiltrados" :key="cliente._id">
                <td class="td-cliente">
                  <span class="td-nombre">{{ cliente.nombre }}</span>
                  <span class="td-correo">{{ cliente.correo }}</span>
                </td>
                <td>
                  <span class="badge-plan">{{ cliente.plan || 'Sin plan' }}</span>
                </td>
                <td class="td-fecha">{{ formatFecha(cliente.createdAt) }}</td>
                <td>
                  <span :class="['badge-estado', cliente.estado]">
                    {{ etiquetaEstado(cliente.estado) }}
                  </span>
                </td>
                <td class="td-acciones">
                  <button
                    v-if="cliente.estado !== 'demo'"
                    class="btn-accion demo"
                    v-tooltip="'Cambiar a Demo'"
                    :disabled="cambiando === cliente._id"
                    @click="cambiarEstado(cliente._id, 'demo')"
                  >
                    <i class="ti ti-device-laptop"></i> Demo
                  </button>
                  <button
                    v-if="cliente.estado !== 'revision'"
                    class="btn-accion revision"
                    :disabled="cambiando === cliente._id"
                    @click="cambiarEstado(cliente._id, 'revision')"
                  >
                    <i class="ti ti-refresh"></i> Revisión
                  </button>
                  <button
                    v-if="cliente.estado !== 'activo'"
                    class="btn-accion activo"
                    :disabled="cambiando === cliente._id"
                    @click="cambiarEstado(cliente._id, 'activo')"
                  >
                    <i class="ti ti-circle-check"></i> Activo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast" class="sa-toast">
        <i class="ti ti-circle-check-filled text-success"></i>
        <span>{{ toast }}</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router  = useRouter()
const clientes  = ref([])
const cargando  = ref(true)
const error     = ref(null)
const busqueda  = ref('')
const cambiando = ref(null)
const toast     = ref(null)

// ── Helpers ──────────────────────────────────────────────
const etiquetaEstado = (e) =>
  ({ demo: 'Demo', revision: 'En revisión', activo: 'Activo' }[e] ?? e)

const formatFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const contarEstado = (e) => clientes.value.filter(c => c.estado === e).length

const clientesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  if (!q) return clientes.value
  return clientes.value.filter(c =>
    c.nombre.toLowerCase().includes(q) || c.correo.toLowerCase().includes(q)
  )
})

// ── API ──────────────────────────────────────────────────
async function cargarClientes () {
  try {
    cargando.value = true
    const token = localStorage.getItem('token')
    const res = await fetch('/api/admin/clientes', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('No se pudieron cargar los clientes')
    clientes.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado (id, nuevoEstado) {
  try {
    cambiando.value = id
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/admin/clientes/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ estado: nuevoEstado })
    })
    if (!res.ok) throw new Error('Error al cambiar estado')
    const { usuario } = await res.json()
    
    const idx = clientes.value.findIndex(c => c._id === id)
    if (idx !== -1) clientes.value[idx] = { ...clientes.value[idx], estado: usuario.estado }
    mostrarToast(`Estado de ${usuario.nombre} actualizado a "${etiquetaEstado(usuario.estado)}"`)
  } catch (err) {
    mostrarToast('Error: ' + err.message)
  } finally {
    cambiando.value = null
  }
}

function mostrarToast (msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

function cerrarSesion () {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  router.push('/login')
}

onMounted(() => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  if (!usuario || usuario.rol !== 'superadmin') return router.push('/login')
  cargarClientes()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');

/* ── Layout Global ── */
.sa-wrap {
  min-height: 100vh;
  background: #f5f5f0; /* Fondo editorial idéntico al de usuarios */
  padding-bottom: 4rem;
  font-family: 'Inter', -apple-system, sans-serif;
  color: #0f172a;
}

.sa-contenido {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  animation: fadeUp .4s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header Estilo Editorial ── */
.sa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 2rem 2rem;
}

.sa-logo-brand h1 {
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: #0f172a;
  margin: 0 0 0.2rem;
  letter-spacing: -.5px;
}

.sa-logo-brand h1 em {
  font-style: italic;
  color: #1d4ed8; /* Azul institucional original */
}

.sa-sub {
  font-size: .85rem;
  color: #64748b;
  margin: 0;
  letter-spacing: 0.02em;
}

.btn-cerrar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.18s ease;
}

.btn-cerrar:hover {
  border-color: #fca5a5;
  color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.05);
}

/* ── Módulos / Stats Grid ── */
.sa-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .75rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #475569;
}

.stat-card--demo::before { background: #805ad5; }      /* Morado */
.stat-card--revision::before { background: #ed8936; }  /* Naranja */
.stat-card--activo::before { background: #38a169; }    /* Verde */

.stat-num {
  display: block;
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 2.2rem;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: #94a3b8;
}

/* ── Contenedor de Tabla Elegante ── */
.sa-tabla-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  overflow: hidden;
}

.sa-tabla-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.sa-tabla-header h2 {
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #0f172a;
  margin: 0;
}

/* Buscador */
.sa-buscador-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.sa-buscador {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.5rem 0.75rem 0.5rem 2.2rem;
  font-size: 0.85rem;
  outline: none;
  width: 280px;
  color: #0f172a;
  transition: all 0.18s ease;
}

.sa-buscador:focus {
  border-color: #bfdbfe;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.05);
}

.buscador-icono {
  position: absolute;
  left: 0.8rem;
  color: #94a3b8;
  font-size: 1rem;
}

/* Estructura de Tabla */
.table-responsive {
  overflow-x: auto;
}

.sa-tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
}

.sa-tabla th {
  background: #fafafa;
  color: #64748b;
  font-weight: 600;
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.sa-tabla tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background .12s ease;
}

.sa-tabla tbody tr:hover {
  background: #f8fafc;
}

.sa-tabla td {
  padding: 1.1rem 1.5rem;
  vertical-align: middle;
}

/* Tipografía de Filas */
.td-cliente {
  display: flex;
  flex-direction: column;
}

.td-nombre {
  font-weight: 500;
  color: #0f172a;
}

.td-correo {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.05rem;
}

.td-fecha {
  color: #64748b;
  font-size: 0.82rem;
}

/* Badges Rediseñados */
.badge-estado {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-estado.demo     { background: #f3e8ff; color: #6b21a8; }
.badge-estado.revision { background: #fef3c7; color: #92400e; }
.badge-estado.activo   { background: #d1fae5; color: #065f46; }

.badge-plan {
  display: inline-block;
  background: #f1f5f9;
  color: #334155;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

/* Botones de acción Estilo Inline */
.td-acciones {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
}

.btn-accion {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  transition: all 0.15s ease;
}

.btn-accion i {
  font-size: 0.9rem;
}

.btn-accion:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Hover de acciones personalizados basados en el color de destino */
.btn-accion.demo:not(:disabled):hover { border-color: #d8b4fe; color: #6b21a8; background: #faf5ff; }
.btn-accion.revision:not(:disabled):hover { border-color: #fde68a; color: #b45309; background: #fffbeb; }
.btn-accion.activo:not(:disabled):hover { border-color: #a7f3d0; color: #047857; background: #f0fdf4; }

/* Estados de carga, vacío y error */
.sa-empty, .sa-loader, .sa-error {
  text-align: center;
  padding: 3.5rem;
  color: #64748b;
  font-size: 0.88rem;
}

.sa-loader i {
  font-size: 1.2rem;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.sa-error { color: #ef4444; }

/* Toast Renovado */
.sa-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #0f172a;
  color: #fff;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  font-size: 0.85rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sa-toast i { font-size: 1.1rem; color: #4ade80; }

.toast-enter-active, .toast-leave-active { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px) scale(0.95); }

/* Responsive */
@media (max-width: 768px) {
  .sa-header { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 2rem 1rem 1.5rem; }
  .sa-contenido { padding: 0 1rem; }
  .sa-stats { grid-template-columns: repeat(2, 1fr); }
  .sa-tabla-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .sa-buscador { width: 100%; }
  .sa-buscador-wrapper { width: 100%; }
  .td-acciones { justify-content: flex-start; }
}
</style>

```