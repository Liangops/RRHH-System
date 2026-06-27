<script setup>
import { ref, onMounted } from 'vue'

const API = '/api/documentos'
const documentos = ref([])
const cargando = ref(false)
const subiendo = ref(false)
const archivosEnCola = ref([])
const fileInput = ref(null)

const token = () => localStorage.getItem('token')
const headers = () => ({ Authorization: `Bearer ${token()}` })

async function cargarDocumentos() {
  cargando.value = true
  const res = await fetch(API, { headers: headers() })
  documentos.value = await res.json()
  cargando.value = false
}

function onFileSelect(e) {
  agregarArchivos(Array.from(e.target.files))
  e.target.value = ''
}

function onDrop(e) {
  agregarArchivos(Array.from(e.dataTransfer.files))
}

function agregarArchivos(files) {
  files.forEach(f => {
    archivosEnCola.value.push({
      nombre: f.name,
      file: f,
      tamaño: f.size,
      subiendo: false,
      ok: false,
      error: null
    })
  })
}

function quitarDeCola(i) {
  archivosEnCola.value.splice(i, 1)
}

async function subirTodos() {
  subiendo.value = true
  for (const item of archivosEnCola.value) {
    if (item.ok) continue
    item.subiendo = true
    try {
      const fd = new FormData()
      fd.append('archivo', item.file)
      const res = await fetch(API, {
        method: 'POST',
        headers: headers(),
        body: fd
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.mensaje || 'Error al subir')
      }
      item.ok = true
    } catch (e) {
      item.error = e.message
    } finally {
      item.subiendo = false
    }
  }
  subiendo.value = false
  archivosEnCola.value = archivosEnCola.value.filter(a => !a.ok)
  cargarDocumentos()
}

async function eliminarDocumento(id) {
  if (!confirm('¿Eliminar este documento? También se eliminará de Cloudinary.')) return
  const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: headers() })
  if (res.ok) {
    documentos.value = documentos.value.filter(d => d._id !== id)
  }
}

function iconoTipo(tipo) {
  return { pdf: '.pdf', docx: '.docx', txt: '.txt', xlsx: '.xlsx' }[tipo] || tipo
}

function extensionDeCola(nombre) {
  return nombre.split('.').pop().toLowerCase()
}

function formatFecha(f) {
  return new Date(f).toLocaleDateString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

function formatTamaño(b) {
  return b > 1024 * 1024
    ? (b / 1024 / 1024).toFixed(1) + ' MB'
    : (b / 1024).toFixed(0) + ' KB'
}

onMounted(cargarDocumentos)
</script>

<template>
  <main class="main" id="main-content">

    <div class="page-header">
      <div>
        <div class="page-title">Base de Conocimiento</div>
        <div class="page-subtitle">Documentos que alimentan al asistente de IA · Almacenados en Cloudinary</div>
      </div>
    </div>

    <div class="stats">
      <div class="stats-card">
        <div class="stat-label">Total Documentos</div>
        <div class="stat-value">{{ documentos.length }}</div>
        <div class="stat-sub">En la base activa</div>
      </div>
      <div class="stats-card">
        <div class="stat-label">PDFs</div>
        <div class="stat-value">{{ documentos.filter(d => d.tipoArchivo === 'pdf').length }}</div>
        <div class="stat-sub">Documentos PDF</div>
      </div>
      <div class="stats-card">
        <div class="stat-label">Otros formatos</div>
        <div class="stat-value">{{ documentos.filter(d => d.tipoArchivo !== 'pdf').length }}</div>
        <div class="stat-sub">DOCX · TXT · XLSX</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Subir documentos</span>
        <span class="cloudinary-badge">Cloudinary</span>
      </div>

      <div
        class="upload-zone"
        @dragover.prevent
        @dragenter.prevent
        @drop.prevent="onDrop"
        @click="fileInput.click()"
      >
        <i class="ti ti-cloud-upload upload-icon"></i>
        <p class="upload-text">
          Arrastra archivos aquí o
          <span class="upload-link">Selecciona desde tu equipo</span>
        </p>
        <p class="upload-hint">PDF · DOCX · TXT · XLSX — máx. 10 MB por archivo</p>
        <input
          ref="fileInput"
          type="file"
          @change="onFileSelect"
          accept=".pdf,.docx,.txt,.xlsx"
          multiple
          hidden
        />
      </div>

      <div v-if="archivosEnCola.length" class="cola-container">
        <div class="cola-header">
          <span class="cola-header-texto">Archivos seleccionados ({{ archivosEnCola.length }})</span>
          <button class="btn btn-primary btn-sm" @click="subirTodos" :disabled="subiendo">
            <i class="ti ti-upload"></i>
            {{ subiendo ? 'Subiendo a Cloudinary...' : 'Subir todos' }}
          </button>
        </div>
        <div v-for="(a, i) in archivosEnCola" :key="i" class="cola-item">
          <span class="tipo-badge" :class="'tipo-' + extensionDeCola(a.nombre)">
            {{ iconoTipo(extensionDeCola(a.nombre)) }}
          </span>
          <span class="cola-nombre">{{ a.nombre }}</span>
          <span class="cola-tamaño">{{ formatTamaño(a.tamaño) }}</span>
          <span v-if="a.subiendo" class="estado estado-subiendo">
            <i class="ti ti-hourglass">

            </i>
            Subiendo...
          </span>
          <span v-else-if="a.ok" class="estado estado-ok"> 
            <i class="ti ti-check">
            </i>
            Subido
          </span>
          <span v-else-if="a.error" class="estado estado-error" :title="a.error">
            <i class="ti ti-x">

            </i>{{ a.error }}</span>
          <button v-if="!a.subiendo && !a.ok" class="btn-actions" @click="quitarDeCola(i)" title="Quitar">
            <i class="ti ti-x"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Documentos en la base ({{ documentos.length }})</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Nombre</th>
            <th>Tamaño</th>
            <th>Subido por</th>
            <th>Fecha</th>
            <th>Archivo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cargando">
            <td colspan="7" style="text-align:center; padding:24px; color:#9ca3af;">
              Cargando documentos...
            </td>
          </tr>
          <tr v-for="doc in documentos" :key="doc._id">
            <td>
              <span class="tipo-badge" :class="'tipo-' + doc.tipoArchivo">
                {{ iconoTipo(doc.tipoArchivo) }}
              </span>
            </td>
            <td style="font-weight:500; color:#1a1a2e;">{{ doc.nombre }}</td>
            <td style="color:#6b7280;">{{ formatTamaño(doc.tamaño) }}</td>
            <td style="color:#6b7280;">{{ doc.nombreSubidoPor }}</td>
            <td style="color:#6b7280;">{{ formatFecha(doc.fechaSubida) }}</td>
            <td>
              <template v-if="doc.urlCloudinary">
                <a
                
                  :href="doc.urlCloudinary"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn-download"
                  title="Ver / Descargar desde Cloudinary"
                >
                  <i class="ti ti-download"></i>
                  <span>Descargar</span>
                </a>
              </template>
              <template v-else>
                <span class="sin-url">—</span>
              </template>
            </td>
            <td class="td-actions">
              <button
                class="btn-actions btn-delete"
                @click="eliminarDocumento(doc._id)"
                title="Eliminar documento y archivo en Cloudinary"
              >
                <i class="ti ti-trash"></i>
              </button>
            </td>
          </tr>
          <tr v-if="!cargando && documentos.length === 0">
            <td colspan="7" style="text-align:center; color:#9ca3af; padding:32px;">
              No hay documentos. ¡Sube el primero para activar el asistente IA!
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
</template>

<style scoped>
.main { flex:1; margin-left:218px; padding:28px 28px 60px; }

.page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
.page-title { font-size:18px; font-weight:600; color:#1a1a2e; font-family:'IM Fell English',Georgia,serif; }
.page-subtitle { font-size:13px; color:#6b7280; margin-top:3px; }

.stats { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:20px; }
.stats-card { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:1.25rem 1.5rem; position:relative; overflow:hidden; }
.stats-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:#475569; }
.stat-label { font-size:12px; color:#6b7280; margin-bottom:5px; }
.stat-value { display:block; font-family:'IM Fell English',Georgia,serif; font-size:2.2rem; color:#0f172a; line-height:1; margin-bottom:0.25rem; }
.stat-sub { font-size:11px; color:#9ca3af; margin-top:3px; }

.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:18px 20px; margin-bottom:18px; }
.card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.card-title { font-size:14px; font-weight:600; color:#1a1a2e; font-family:'IM Fell English',Georgia,serif; }

.cloudinary-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; background: #f0f4ff; color: #3b5bdb;
  border: 1px solid #c5d0f5; border-radius: 20px;
  font-size: 11px; font-weight: 500;
}

.upload-zone {
  border: 2px dashed #d1d5db; border-radius: 12px; padding: 40px 20px;
  text-align: center; cursor: pointer; transition: all .2s; background: #fafafa;
}
.upload-zone:hover { border-color: #1a3c5e; background: #f0f4f8; }
.upload-icon { font-size: 40px; color: #9ca3af; display: block; margin-bottom: 10px; }
.upload-text { font-size: 14px; color: #374151; margin-bottom: 4px; }
.upload-link { color: #1a3c5e; font-weight: 600; }
.upload-hint { font-size: 12px; color: #9ca3af; }

.cola-container { margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
.cola-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f9fafb; border-bottom:1px solid #e5e7eb; }
.cola-header-texto { font-size:13px; font-weight:600; color:#374151; }
.cola-item { display:flex; align-items:center; gap:10px; padding:10px 16px; border-bottom:1px solid #f3f4f6; font-size:13px; }
.cola-item:last-child { border-bottom:none; }
.cola-nombre { flex:1; color:#374151; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cola-tamaño { color:#9ca3af; font-size:12px; flex-shrink:0; }
.estado { font-size:12px; flex-shrink:0; }
.estado-subiendo { color:#6b7280; }
.estado-ok { color:#166534; }
.estado-error { color:#991b1b; }

/* Badges de tipo */
.tipo-badge {
  display: inline-block; padding: 3px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.3px;
}
.tipo-pdf  { background: #fee2e2; color: #991b1b; }
.tipo-docx { background: #dbeafe; color: #1e40af; }
.tipo-txt  { background: #f3f4f6; color: #374151; }
.tipo-xlsx { background: #dcfce7; color: #166534; }

table { width:100%; border-collapse:collapse; font-size:13.5px; }
th { text-align:left; padding:12px; color:#6b7280; font-weight:500; border-bottom:1px solid #e5e7eb; font-size:12px; background:#f9fafb; }
td { padding:10px 12px; color:#374151; border-bottom:1px solid #f3f4f6; vertical-align:middle; }
tr:last-child td { border-bottom:none; }
tr:hover td { background:#fafafa; }
.td-actions { display:flex; gap:4px; }
.sin-url { color:#d1d5db; }

.btn-download {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 8px;
  background: #f0f4ff; color: #3b5bdb;
  border: 1px solid #c5d0f5;
  font-size: 12px; font-weight: 500;
  text-decoration: none; transition: all .15s;
}
.btn-download:hover { background: #3b5bdb; color: #fff; border-color: #3b5bdb; }

.btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:15px; border:1px solid #d1d5db; background:#fff; font-size:13px; color:#374151; cursor:pointer; transition:all .15s; }
.btn:disabled { opacity:.45; cursor:not-allowed; }
.btn-primary { background:#1a3c5e; color:#fff; border-color:#1a3c5e; }
.btn-primary:hover { background:#1d4570; }
.btn-sm { padding:5px 11px; font-size:12px; }

.btn-actions { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border:none; background:none; cursor:pointer; color:#6b7280; border-radius:6px; font-size:16px; transition:all .15s; }
.btn-actions:hover { background:#f3f4f6; color:#374151; }
.btn-delete:hover { background:#fee2e2; color:#991b1b; }
</style>