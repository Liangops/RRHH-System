<template>
  <div class="consultas-container">
    <h1 class="titulo">Consultas Avanzadas</h1>
    <p class="subtitulo">Análisis cruzados de RR.HH.</p>

    <div class="cards-grid">
      <!-- Permisos por departamento -->
      <div class="card" @click="cargar('permisosPorDepto')">
        <i class="ti ti-building-community icon"></i>
        <h3>Permisos por Departamento</h3>
        <p>Total de permisos solicitados agrupados por departamento.</p>
      </div>

      <!-- Permisos por rango de fechas -->
      <div class="card" @click="abrirModalRango = true">
        <i class="ti ti-calendar-stats icon"></i>
        <h3>Permisos por Rango de Fechas</h3>
        <p>Ranking de departamentos por permisos en un período específico.</p>
      </div>

      <!-- Distribución tipos de permiso -->
      <div class="card" @click="cargar('distribucionTipos')">
        <i class="ti ti-chart-pie icon"></i>
        <h3>Distribución de Tipos de Permiso</h3>
        <p>Porcentaje por tipo: vacaciones, médico, personal, etc.</p>
      </div>

      <!-- Top empleados con más permisos -->
      <div class="card" @click="cargar('topEmpleados')">
        <i class="ti ti-trophy icon"></i>
        <h3>Top 5 Empleados con Más Permisos</h3>
        <p>Empleados que más solicitudes han generado.</p>
      </div>

      <!-- Top capacitaciones por participantes -->
      <div class="card" @click="cargar('topCapacitaciones')">
        <i class="ti ti-school icon"></i>
        <h3>Top Capacitaciones por Participantes</h3>
        <p>Cursos con mayor cantidad de inscritos.</p>
      </div>

      <!-- Capacitaciones por estado -->
      <div class="card" @click="cargar('capacitacionesPorEstado')">
        <i class="ti ti-chart-donut icon"></i>
        <h3>Capacitaciones por Estado</h3>
        <p>Próximas, en curso y finalizadas.</p>
      </div>

      <!-- Departamento con más empleados en permiso -->
      <div class="card" @click="cargar('deptoMasPermisos')">
        <i class="ti ti-affiliate icon"></i>
        <h3>Departamento con Más Solicitudes</h3>
        <p>Cuál departamento genera más carga de permisos.</p>
      </div>

      <!-- Promedio de días de permiso por tipo -->
      <div class="card" @click="cargar('promedioDiasPorTipo')">
        <i class="ti ti-calendar-time icon"></i>
        <h3>Promedio de Días por Tipo de Permiso</h3>
        <p>Cuántos días en promedio dura cada tipo de solicitud.</p>
      </div>

      <!-- Usuarios que más usan la IA -->
      <div class="card" @click="cargar('usuariosMasUsanIA')">
        <i class="ti ti-message-chatbot icon"></i>
        <h3>Usuarios que Más Usan la IA</h3>
        <p>Ranking de quién más consulta al Asistente IA.</p>
      </div>
    </div>

    <!-- Modal para rango de fechas -->
    <div v-if="abrirModalRango" class="modal-overlay" @click.self="abrirModalRango = false">
      <div class="modal">
        <h3>Selecciona el rango</h3>
        <label>Desde</label>
        <input type="date" v-model="rango.desde" />
        <label>Hasta</label>
        <input type="date" v-model="rango.hasta" />
        <button class="btn-primary" @click="cargarRango">Consultar</button>
      </div>
    </div>

    <div v-if="cargando" class="sin-datos">Cargando...</div>

    <!-- Resultado -->
    <div v-if="resultado && !cargando" class="resultado-box">
      <div class="resultado-header">
        <h3>{{ tituloResultado }}</h3>
        <button class="btn-cerrar" @click="resultado = null">✕</button>
      </div>

      <table v-if="resultado.length">
        <thead>
          <tr>
            <th v-for="col in columnas" :key="col">{{ nombreColumna(col) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(fila, i) in resultado" :key="i">
            <td v-for="col in columnas" :key="col">{{ formatearCelda(fila, col) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="sin-datos">No hay datos para mostrar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const API = '/api/consultas'

const resultado = ref(null)
const tituloResultado = ref('')
const abrirModalRango = ref(false)
const rango = ref({ desde: '', hasta: '' })
const cargando = ref(false)

const endpoints = {
  permisosPorDepto: { url: `${API}/permisos-por-departamento`, titulo: 'Permisos por Departamento', labelId: 'Departamento' },
  distribucionTipos: { url: `${API}/distribucion-tipos-permiso`, titulo: 'Distribución de Tipos de Permiso', labelId: 'Tipo' },
  topEmpleados: { url: `${API}/top-empleados-permisos`, titulo: 'Top 5 Empleados con Más Permisos', labelId: null },
  topCapacitaciones: { url: `${API}/top-capacitaciones`, titulo: 'Top Capacitaciones por Participantes', labelId: null },
  capacitacionesPorEstado: { url: `${API}/capacitaciones-por-estado`, titulo: 'Capacitaciones por Estado', labelId: 'Estado' },
  deptoMasPermisos: { url: `${API}/departamento-mas-permisos`, titulo: 'Departamento con Más Solicitudes', labelId: 'Departamento' },
  promedioDiasPorTipo: { url: `${API}/promedio-dias-por-tipo`, titulo: 'Promedio de Días por Tipo de Permiso', labelId: 'Tipo de Permiso' },
  usuariosMasUsanIA: { url: `${API}/usuarios-mas-usan-ia`, titulo: 'Usuarios que Más Usan la IA', labelId: null }
}

const labelIdActual = ref('Departamento')

function getToken() {
  return localStorage.getItem('token')
}

async function cargar(clave) {
  const { url, titulo, labelId } = endpoints[clave]
  cargando.value = true
  labelIdActual.value = labelId || 'Departamento'
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const data = await res.json()
    resultado.value = Array.isArray(data) ? data : []
    tituloResultado.value = titulo
  } catch (err) {
    console.error('Error cargando consulta:', err)
    resultado.value = []
  } finally {
    cargando.value = false
  }
}

async function cargarRango() {
  if (!rango.value.desde || !rango.value.hasta) return
  cargando.value = true
  labelIdActual.value = 'Departamento'
  try {
    const params = new URLSearchParams(rango.value)
    const res = await fetch(`${API}/permisos-por-departamento-rango?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    const data = await res.json()
    resultado.value = Array.isArray(data) ? data : []
    tituloResultado.value = `Permisos por Departamento (${rango.value.desde} a ${rango.value.hasta})`
    abrirModalRango.value = false
  } catch (err) {
    console.error('Error cargando rango:', err)
    resultado.value = []
  } finally {
    cargando.value = false
  }
}

const etiquetasColumnas = {
  total: 'Total',
  totalPermisos: 'Total Permisos',
  totalPreguntas: 'Preguntas Realizadas',
  nombre: 'Nombre',
  apellido: 'Apellido',
  departamento: 'Departamento',
  tipo: 'Tipo de Permiso',
  porcentaje: 'Porcentaje',
  curso: 'Curso',
  participantes: 'Participantes',
  promedioDias: 'Promedio de Días',
  correo: 'Correo'
}

function esObjectId(val) {
  return typeof val === 'string' && /^[a-f0-9]{24}$/i.test(val)
}

const columnas = computed(() => {
  if (!resultado.value || !resultado.value.length) return []
  const todas = Object.keys(resultado.value[0])
  const idEsMongoId = resultado.value.every(f => esObjectId(f._id))
  return todas.filter(col => col !== '_id' || !idEsMongoId)
})

function nombreColumna(col) {
  if (col === '_id') return labelIdActual.value
  return etiquetasColumnas[col] || col
}

function formatearCelda(fila, col) {
  const val = fila[col]
  if (val === null || val === undefined || val === '') return '-'
  if (col === 'porcentaje') return `${val}%`
  if (col === 'promedioDias') return `${val} días`
  if (val && typeof val === 'object') return JSON.stringify(val)
  return val
}
</script>

<style scoped>
.consultas-container {
  margin-left: 218px;
  padding: 28px 28px 60px;
}

.titulo {
  font-family: 'IM Fell English', serif;
  font-size: 28px;
  color: #1a3c5e;
  margin-bottom: 4px;
}

.subtitulo {
  color: #64748b;
  margin-bottom: 24px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.card {
  background: #fff;
  border-left: 3px solid #1a3c5e;
  border-radius: 8px;
  padding: 14px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.icon {
  font-size: 18px;
  color: #1a3c5e;
  margin-bottom: 6px;
}

.card h3 {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: #1a3c5e;
  margin-bottom: 4px;
  line-height: 1.3;
}

.card p {
  font-size: 11.5px;
  color: #64748b;
  line-height: 1.4;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  border-left-color: #2c5a85;
}

.card:active {
  transform: translateY(-1px);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal label {
  font-size: 13px;
  color: #64748b;
  margin-top: 8px;
}

.modal input {
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.btn-primary {
  margin-top: 16px;
  background: #1a3c5e;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.resultado-box {
  margin-top: 28px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.resultado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-cerrar {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #64748b;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
  color: #1a3c5e;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.03em;
  background: #f8fafc;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

td {
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

tbody tr:hover {
  background: #fafafa;
}

.sin-datos {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 20px;
}
</style>