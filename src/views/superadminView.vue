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

      <!-- ── Stats ── -->
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

      <!-- ── Tabla clientes ── -->
      <div class="sa-tabla-wrap" style="margin-bottom: 2rem;">
        <div class="sa-tabla-header">
          <h2>Clientes registrados</h2>
          <div class="sa-buscador-wrapper">
            <i class="ti ti-search buscador-icono"></i>
            <input v-model="busqueda" class="sa-buscador" placeholder="Buscar por nombre o correo..." />
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
                <td><span class="badge-plan">{{ cliente.plan || 'Sin plan' }}</span></td>
                <td class="td-fecha">{{ formatFecha(cliente.createdAt) }}</td>
                <td>
                  <span :class="['badge-estado', cliente.estado]">
                    {{ etiquetaEstado(cliente.estado) }}
                  </span>
                </td>
                <td class="td-acciones">
                  <button v-if="cliente.estado !== 'demo'" class="btn-accion demo"
                    :disabled="cambiando === cliente._id" @click="cambiarEstado(cliente._id, 'demo')">
                    <i class="ti ti-device-laptop"></i> Demo
                  </button>
                  <button v-if="cliente.estado !== 'revision'" class="btn-accion revision"
                    :disabled="cambiando === cliente._id" @click="cambiarEstado(cliente._id, 'revision')">
                    <i class="ti ti-refresh"></i> Revisión
                  </button>
                  <button v-if="cliente.estado !== 'activo'" class="btn-accion activo"
                    :disabled="cambiando === cliente._id" @click="cambiarEstado(cliente._id, 'activo')">
                    <i class="ti ti-circle-check"></i> Activo
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Sección Facturaciones ── -->
      <div class="sa-tabla-wrap">
        <div class="sa-tabla-header">
          <h2>Facturaciones electrónicas</h2>
          <div class="sa-buscador-wrapper">
            <i class="ti ti-search buscador-icono"></i>
            <input v-model="busquedaFactura" class="sa-buscador" placeholder="Buscar por nombre, correo u orderID..." />
          </div>
        </div>

        <!-- Stats facturaciones -->
        <div class="sa-fact-stats">
          <div class="fact-stat">
            <span class="fact-stat-num">{{ facturas.length }}</span>
            <span class="fact-stat-label">Total pagos</span>
          </div>
          <div class="fact-stat fact-stat--generada">
            <span class="fact-stat-num">{{ facturas.filter(f => f.facturaGenerada).length }}</span>
            <span class="fact-stat-label">Facturas emitidas</span>
          </div>
          <div class="fact-stat fact-stat--pendiente">
            <span class="fact-stat-num">{{ facturas.filter(f => !f.facturaGenerada).length }}</span>
            <span class="fact-stat-label">Sin factura</span>
          </div>
          <div class="fact-stat fact-stat--monto">
            <span class="fact-stat-num">{{ montoTotal }}</span>
            <span class="fact-stat-label">Monto total</span>
          </div>
        </div>

        <div v-if="cargandoFacturas" class="sa-loader">
          <i class="ti ti-loader animate-spin"></i> Cargando facturaciones...
        </div>
        <div v-else-if="errorFacturas" class="sa-error">
          <i class="ti ti-alert-circle"></i> {{ errorFacturas }}
        </div>
        <div v-else class="table-responsive">
          <table class="sa-tabla">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Empresa / RNC</th>
                <th>Plan</th>
                <th>Monto</th>
                <th>Order ID</th>
                <th>eNCF</th>
                <th>Fecha</th>
                <th>Factura</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="facturasFiltradas.length === 0">
                <td colspan="8" class="sa-empty">No se encontraron facturaciones.</td>
              </tr>
              <tr v-for="f in facturasFiltradas" :key="f._id">
                <td class="td-cliente">
                  <span class="td-nombre">{{ f.nombre }}</span>
                  <span class="td-correo">{{ f.correo }}</span>
                </td>
                <td class="td-fecha">
                  <span class="td-nombre">{{ f.empresa || '—' }}</span>
                  <span class="td-correo">{{ f.rnc }}</span>
                </td>
                <td><span class="badge-plan">{{ f.plan }}</span></td>
                <td class="td-monto">{{ f.monto }}</td>
                <td class="td-fecha" style="font-size:.75rem; color:#64748b;">{{ f.orderID }}</td>
                <td class="td-fecha" style="font-size:.75rem;">{{ f.eNCF || '—' }}</td>
                <td class="td-fecha">{{ f.fecha || formatFecha(f.createdAt) }}</td>
                <td>
                  <span :class="['badge-factura', f.facturaGenerada ? 'emitida' : 'pendiente']">
                    {{ f.facturaGenerada ? 'Emitida' : 'Pendiente' }}
                  </span>
                  <button class="btn-accion activo" @click="verFactura(f)">
  <i class="ti ti-file-invoice"></i> Ver factura

</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Toast -->
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

const router    = useRouter()
const clientes  = ref([])
const facturas  = ref([])
const cargando         = ref(true)
const cargandoFacturas = ref(true)
const error            = ref(null)
const errorFacturas    = ref(null)
const busqueda         = ref('')
const busquedaFactura  = ref('')
const cambiando        = ref(null)
const toast            = ref(null)

// ── Helpers ──────────────────────────────────────────────────────────────────
const etiquetaEstado = (e) =>
  ({ demo: 'Demo', revision: 'En revisión', activo: 'Activo' }[e] ?? e)

const formatFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const contarEstado = (e) => clientes.value.filter(c => c.estado === e).length

async function verFactura(f) {
  try {
    const res = await fetch(`/api/admin/ver-factura/${f._id}`, {
      headers: authHeaders()
    })
    if (!res.ok) throw new Error('No se pudo obtener la factura')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (err) {
    mostrarToast('Error: ' + err.message)
  }
}

const clientesFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase()
  if (!q) return clientes.value
  return clientes.value.filter(c =>
    c.nombre.toLowerCase().includes(q) || c.correo.toLowerCase().includes(q)
  )
})

const facturasFiltradas = computed(() => {
  const q = busquedaFactura.value.toLowerCase()
  if (!q) return facturas.value
  return facturas.value.filter(f =>
    f.nombre.toLowerCase().includes(q) ||
    f.correo.toLowerCase().includes(q) ||
    f.orderID.toLowerCase().includes(q)
  )
})

const montoTotal = computed(() => {
  // Intenta sumar montos numéricos; si son strings con símbolos los muestra como conteo
  const nums = facturas.value.map(f => parseFloat(String(f.monto).replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n))
  if (!nums.length) return '—'
  const sum = nums.reduce((a, b) => a + b, 0)
  return `USD$ ${sum.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
})

// ── API ───────────────────────────────────────────────────────────────────────
function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function cargarClientes() {
  try {
    cargando.value = true
    const res = await fetch('/api/admin/clientes', { headers: authHeaders() })
    if (!res.ok) throw new Error('No se pudieron cargar los clientes')
    clientes.value = await res.json()
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

async function cargarFacturas() {
  try {
    cargandoFacturas.value = true
    const res = await fetch('/api/admin/facturaciones', { headers: authHeaders() })
    if (!res.ok) throw new Error('No se pudieron cargar las facturaciones')
    facturas.value = await res.json()
  } catch (err) {
    errorFacturas.value = err.message
  } finally {
    cargandoFacturas.value = false
  }
}

async function cambiarEstado(id, nuevoEstado) {
  try {
    cambiando.value = id
    const res = await fetch(`/api/admin/clientes/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
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

function mostrarToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

function cerrarSesion() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  router.push('/login')
}

onMounted(() => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
  if (!usuario || usuario.rol !== 'superadmin') return router.push('/login')
  cargarClientes()
  cargarFacturas()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');

.sa-wrap {
  min-height: 100vh;
  background: #f5f5f0;
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

.sa-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 2rem 2rem;
}

.sa-logo-brand h1 {
  font-family: 'IM Fell English', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: #0f172a;
  margin: 0 0 0.2rem;
  letter-spacing: -.5px;
}

.sa-logo-brand h1 em { font-style: italic; color: #1d4ed8; }

.sa-sub { font-size: .85rem; color: #64748b; margin: 0; }

.btn-cerrar {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: .5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: .85rem;
  font-weight: 500;
  transition: all .18s;
}
.btn-cerrar:hover { border-color: #fca5a5; color: #ef4444; }

/* Stats clientes */
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
.stat-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #475569; }
.stat-card--demo::before     { background: #805ad5; }
.stat-card--revision::before { background: #ed8936; }
.stat-card--activo::before   { background: #38a169; }

.stat-num {
  display: block;
  font-family: 'IM Fell English', Georgia, serif;
  font-size: 2.2rem;
  color: #0f172a;
  line-height: 1;
  margin-bottom: .25rem;
}
.stat-label { font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; }

/* Tabla wrap */
.sa-tabla-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.02);
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
  font-family: 'IM Fell English', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: #0f172a;
  margin: 0;
}

.sa-buscador-wrapper { position: relative; display: flex; align-items: center; }
.sa-buscador {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: .5rem .75rem .5rem 2.2rem;
  font-size: .85rem;
  outline: none;
  width: 280px;
  color: #0f172a;
  transition: all .18s;
}
.sa-buscador:focus { border-color: #bfdbfe; box-shadow: 0 0 0 3px rgba(29,78,216,.05); }
.buscador-icono { position: absolute; left: .8rem; color: #94a3b8; font-size: 1rem; }

.table-responsive { overflow-x: auto; }

.sa-tabla { width: 100%; border-collapse: collapse; font-size: .875rem; text-align: left; }
.sa-tabla th {
  background: #fafafa;
  color: #64748b;
  font-weight: 600;
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.sa-tabla tbody tr { border-bottom: 1px solid #f1f5f9; transition: background .12s; }
.sa-tabla tbody tr:hover { background: #f8fafc; }
.sa-tabla td { padding: 1.1rem 1.5rem; vertical-align: middle; }

.td-cliente { display: flex; flex-direction: column; }
.td-nombre  { font-weight: 500; color: #0f172a; }
.td-correo  { font-size: .75rem; color: #64748b; margin-top: .05rem; }
.td-fecha   { color: #64748b; font-size: .82rem; }
.td-monto   { font-weight: 600; color: #0f172a; font-size: .88rem; }

/* Badges */
.badge-estado {
  display: inline-flex;
  align-items: center;
  padding: .2rem .6rem;
  border-radius: 6px;
  font-size: .75rem;
  font-weight: 600;
}
.badge-estado.demo     { background: #f3e8ff; color: #6b21a8; }
.badge-estado.revision { background: #fef3c7; color: #92400e; }
.badge-estado.activo   { background: #d1fae5; color: #065f46; }

.badge-plan {
  display: inline-block;
  background: #f1f5f9;
  color: #334155;
  padding: .15rem .5rem;
  border-radius: 6px;
  font-size: .75rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

.badge-factura {
  display: inline-block;
  padding: .2rem .6rem;
  border-radius: 6px;
  font-size: .72rem;
  font-weight: 600;
}
.badge-factura.emitida  { background: #d1fae5; color: #065f46; }
.badge-factura.pendiente { background: #fef9c3; color: #854d0e; }

.btn-dgii {
  display: inline-flex;
  align-items: center;
  margin-left: .4rem;
  color: #3b82f6;
  font-size: .8rem;
  text-decoration: none;
}
.btn-dgii:hover { color: #1d4ed8; }

/* Stats facturaciones */
.sa-fact-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: .5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #fafafa;
}

.fact-stat {
  padding: .75rem 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  position: relative;
  overflow: hidden;
}
.fact-stat::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: #475569; }
.fact-stat--generada::before { background: #38a169; }
.fact-stat--pendiente::before { background: #ed8936; }
.fact-stat--monto::before    { background: #1d4ed8; }

.fact-stat-num {
  display: block;
  font-family: 'IM Fell English', Georgia, serif;
  font-size: 1.6rem;
  color: #0f172a;
  line-height: 1;
}
.fact-stat-label { font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #94a3b8; }

/* Botones acción */
.td-acciones { display: flex; gap: .4rem; justify-content: flex-end; }
.btn-accion {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .35rem .65rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-size: .75rem;
  font-weight: 500;
  color: #475569;
  transition: all .15s;
}
.btn-accion:disabled { opacity: .4; cursor: not-allowed; }
.btn-accion.demo:not(:disabled):hover     { border-color: #d8b4fe; color: #6b21a8; background: #faf5ff; }
.btn-accion.revision:not(:disabled):hover { border-color: #fde68a; color: #b45309; background: #fffbeb; }
.btn-accion.activo:not(:disabled):hover   { border-color: #a7f3d0; color: #047857; background: #f0fdf4; }

/* Loader / empty / error */
.sa-empty, .sa-loader, .sa-error { text-align: center; padding: 3.5rem; color: #64748b; font-size: .88rem; }
.sa-error { color: #ef4444; }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Toast */
.sa-toast {
  position: fixed;
  bottom: 2rem; right: 2rem;
  background: #0f172a;
  color: #fff;
  padding: .85rem 1.25rem;
  border-radius: 12px;
  font-size: .85rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,.1);
  z-index: 999;
  display: flex;
  align-items: center;
  gap: .6rem;
}
.sa-toast i { font-size: 1.1rem; color: #4ade80; }
.toast-enter-active, .toast-leave-active { transition: all .2s cubic-bezier(.16,1,.3,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px) scale(.95); }

@media (max-width: 768px) {
  .sa-header { flex-direction: column; align-items: flex-start; gap: 1rem; padding: 2rem 1rem 1.5rem; }
  .sa-contenido { padding: 0 1rem; }
  .sa-stats, .sa-fact-stats { grid-template-columns: repeat(2, 1fr); }
  .sa-tabla-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .sa-buscador { width: 100%; }
  .sa-buscador-wrapper { width: 100%; }
}
</style>