<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { jwtDecode } from 'jwt-decode'

// ─── Rol del usuario ────────────────────────────────────────────────────────
const token = localStorage.getItem('token') // ajusta la clave si la guardas diferente
const userRol = token ? jwtDecode(token).rol : ''
const esAdmin = computed(() => userRol === 'admin' || userRol === 'superadmin')

// ─── Estado general ─────────────────────────────────────────────────────────
const modalAbierto = ref(false)
const cargando = ref(false)
const error = ref('')

const form = reactive({
    _id: null,
    curso: '',
    descripcion: '',
    fechaInicio: '',
    duracion: '',
    participantes: '',
    estado: 'Proximo'
})

const capacitaciones = ref([])

// ─── Helpers ─────────────────────────────────────────────────────────────────
const API = '/api/capacitaciones'

function headers() {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
}

function formatFecha(fecha) {
    if (!fecha) return ''
    return new Date(fecha).toLocaleDateString('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const badgeClase = {
    Proximo: 'badge-info',
    'En proceso': 'badge-warning',
    Completado: 'badge-success',
    Cancelado: 'badge-danger'
}

// ─── CRUD ────────────────────────────────────────────────────────────────────
async function cargarCapacitaciones() {
    cargando.value = true
    error.value = ''
    try {
        const res = await fetch(API, { headers: headers() })
        if (!res.ok) throw new Error('Error al cargar')
        capacitaciones.value = await res.json()
    } catch (e) {
        error.value = 'No se pudieron cargar las capacitaciones.'
    } finally {
        cargando.value = false
    }
}

function openModal(caps = null) {
    limpiarForm()
    if (caps) {
        Object.assign(form, {
            _id: caps._id,
            curso: caps.curso,
            descripcion: caps.descripcion || '',
            fechaInicio: caps.fechaInicio ? caps.fechaInicio.substring(0, 10) : '',
            duracion: caps.duracion,
            participantes: caps.participantes,
            estado: caps.estado
        })
    }
    modalAbierto.value = true
}

function closeModal() {
    modalAbierto.value = false
    limpiarForm()
}

function limpiarForm() {
    Object.assign(form, {
        _id: null,
        curso: '',
        descripcion: '',
        fechaInicio: '',
        duracion: '',
        participantes: '',
        estado: 'Proximo'
    })
}

async function guardarCapacitacion() {
    try {
        const body = {
            curso: form.curso,
            descripcion: form.descripcion,
            fechaInicio: form.fechaInicio,
            duracion: form.duracion,
            participantes: Number(form.participantes),
            estado: form.estado
        }

        const url = form._id ? `${API}/${form._id}` : API
        const method = form._id ? 'PUT' : 'POST'

        const res = await fetch(url, {
            method,
            headers: headers(),
            body: JSON.stringify(body)
        })

        if (!res.ok) {
            const data = await res.json()
            throw new Error(data.message || 'Error al guardar')
        }

        await cargarCapacitaciones()
        closeModal()
    } catch (e) {
        alert(e.message)
    }
}

async function cambiarEstado(caps, nuevoEstado) {
    try {
        const res = await fetch(`${API}/${caps._id}/estado`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify({ estado: nuevoEstado })
        })
        if (!res.ok) throw new Error('Error al cambiar estado')
        await cargarCapacitaciones()
    } catch (e) {
        alert(e.message)
    }
}

onMounted(cargarCapacitaciones)
</script>

<template>
    <main class="main" id="main-content">

        <!-- Header -->
        <div class="page-header">
            <div>
                <div class="page-title">Capacitaciones</div>
                <div class="page-subtitle">Formación y desarrollo del personal</div>
            </div>
            <!-- Solo admin/superadmin ven el botón de crear -->
            <button v-if="esAdmin" class="btn btn-primary" @click="openModal()">
                <i class="ti ti-plus"></i>
                Nueva capacitación
            </button>
        </div>

        <!-- Error -->
        <div v-if="error" class="alert-error">{{ error }}</div>

        <!-- Tabla -->
        <div class="card">
            <div class="card-header">
                <span class="card-title">Listado de cursos</span>
            </div>

            <div v-if="cargando" class="loading-text">Cargando...</div>

            <table v-else>
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Fecha de inicio</th>
                        <th>Duración</th>
                        <th>Participantes</th>
                        <th>Estado</th>
                        <th v-if="esAdmin">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="caps in capacitaciones" :key="caps._id">
                        <td>{{ caps.curso }}</td>
                        <td>{{ formatFecha(caps.fechaInicio) }}</td>
                        <td>{{ caps.duracion }}</td>
                        <td>{{ caps.participantes }}</td>
                        <td>
                            <!-- Admin ve un selector de estado -->
                            <template v-if="esAdmin">
                                <select
                                    class="estado-select"
                                    :class="badgeClase[caps.estado]"
                                    :value="caps.estado"
                                    @change="cambiarEstado(caps, $event.target.value)"
                                >
                                    <option value="Proximo">Próximo</option>
                                    <option value="En proceso">En proceso</option>
                                    <option value="Completado">Completado</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </template>
                            <!-- Empleado solo ve el badge -->
                            <template v-else>
                                <span class="badge" :class="badgeClase[caps.estado]">
                                    {{ caps.estado }}
                                </span>
                            </template>
                        </td>
                        <!-- Botón editar solo para admin -->
                        <td v-if="esAdmin" class="td-actions">
                            <button class="btn-icon" @click="openModal(caps)" title="Editar">
                                <i class="ti ti-edit"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!cargando && capacitaciones.length === 0">
                        <td :colspan="esAdmin ? 6 : 5" style="text-align:center; color:#9ca3af;">
                            No hay capacitaciones registradas.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal (solo admin puede abrirlo) -->
    <div v-if="modalAbierto && esAdmin" class="modal-backdrop" @click.self="closeModal">
        <div class="modal">
            <div class="modal-header">
                <span class="modal-title">{{ form._id ? 'Editar capacitación' : 'Registrar capacitación' }}</span>
                <button class="modal-close" @click="closeModal">
                    <i class="ti ti-x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Nombre del curso *</label>
                    <input
                        v-model="form.curso"
                        type="text"
                        class="form-control"
                        placeholder="Ej: Proyectos Integradores"
                    />
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Fecha inicio *</label>
                        <input v-model="form.fechaInicio" type="date" class="form-control" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Duración *</label>
                        <input
                            v-model="form.duracion"
                            type="text"
                            class="form-control"
                            placeholder="Ej: 12 horas"
                        />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Participantes *</label>
                        <input
                            v-model="form.participantes"
                            type="number"
                            class="form-control"
                            placeholder="Ej: 14"
                        />
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select v-model="form.estado" class="form-control">
                        <option value="Proximo">Próximo</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Completado">Completado</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Descripción del curso</label>
                    <textarea
                        v-model="form.descripcion"
                        class="form-control"
                        rows="4"
                        placeholder="Motivo, descripción o notas adicionales..."
                    ></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" @click="closeModal">Cancelar</button>
                <button class="btn btn-primary" @click="guardarCapacitacion">
                    <i class="ti ti-device-floppy"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.main {
    flex: 1;
    margin-left: 218px;
    padding: 28px 28px 60px;
}

body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.alert-error {
    background: #fee2e2;
    color: #991b1b;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 16px;
    font-size: 13px;
}

.loading-text {
    text-align: center;
    color: #9ca3af;
    padding: 24px;
    font-size: 13px;
}

.btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    background: #fff;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.btn-primary {
    background: #1a3c5e;
    color: #fff;
    border-color: #1a3c5e;
}

.btn-primary:hover { background: #1d4570; }

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

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
}

th {
    text-align: left;
    padding: 12px;
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

tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafafa; }

.td-actions {
    display: flex;
    gap: 4px;
}

/* Badges */
.badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
}

.badge-info    { background: #dbeafe; color: #1e40af; }
.badge-warning { background: #fef9c3; color: #854d0e; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-danger  { background: #fee2e2; color: #991b1b; }

/* Select de estado (admin) */
.estado-select {
    border: none;
    border-radius: 20px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    font-family: inherit;
    appearance: auto;
}

/* Modal */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
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
    box-shadow: 0 20px 60px rgba(0,0,0,.2);
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

.modal-close:hover { color: #374151; }

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

.form-group { margin-bottom: 15px; }

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
    box-sizing: border-box;
}

.form-control:focus {
    border-color: #1a3c5e;
    box-shadow: 0 0 0 3px rgba(26,60,94,.08);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}
</style>