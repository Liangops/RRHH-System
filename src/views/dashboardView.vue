<template>
  <div class="dashboard-wrap">

    <div v-if="usuario?.rol === 'superadmin'" class="redirigiendo">
      <p>Redirigiendo al panel...</p>
    </div>

    <div v-else-if="estado === 'demo'" class="activo-wrap">
      <div class="hero-saludo">
        <div class="hero-left">
          <p class="hero-eyebrow">{{ saludo }}, {{ primerNombre }}</p>
          <h1 class="hero-titulo">Entorno de <em>demo.</em></h1>
          <p class="hero-sub">Explora el sistema con datos de ejemplo mientras configuramos tu empresa.</p>
        </div>
        <div class="hero-fecha">
          <span class="fecha-dia">{{ fechaDia }}</span>
          <span class="fecha-mes">{{ fechaMes }}</span>
        </div>
      </div>

      <div class="divider-hero"></div>

      <p class="seccion-label">Módulos disponibles para exploración</p>
      <div class="modulos-grid">
        <router-link to="/empleado" class="modulo-card">
          <i class="ti ti-users modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Empleados</span>
            <span class="modulo-desc">Gestión de personal</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/departamento" class="modulo-card">
          <i class="ti ti-building modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Departamentos</span>
            <span class="modulo-desc">Estructura organizacional</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/expedientes" class="modulo-card">
          <i class="ti ti-folder modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Expedientes</span>
            <span class="modulo-desc">Documentos del personal</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/asistencia" class="modulo-card">
          <i class="ti ti-calendar-check modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Asistencia</span>
            <span class="modulo-desc">Control de asistencia</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>
      </div>
    </div>

    <div v-else-if="estado === 'revision'" class="activo-wrap">
      <div class="hero-saludo">
        <div class="hero-left">
          <p class="hero-eyebrow">{{ saludo }}, {{ primerNombre }}</p>
          <h1 class="hero-titulo hero-titulo--revision">En <em>revisión.</em></h1>
          <p class="hero-sub">Nuestro equipo está configurando tu sistema. Te notificaremos cuando esté listo.</p>
        </div>
        <div class="hero-fecha">
          <span class="fecha-dia">{{ fechaDia }}</span>
          <span class="fecha-mes">{{ fechaMes }}</span>
        </div>
      </div>

      <div class="divider-hero"></div>

      <p class="seccion-label">Estado de la configuración</p>
      <div class="checklist-revision">
        <div class="check-item-card completado">
          <i class="ti ti-circle-check"></i>
          <div class="check-info">
            <span class="check-titulo">Plan activado</span>
            <span class="check-desc">Tu suscripción ha sido confirmada con éxito.</span>
          </div>
        </div>
        <div class="check-item-card completado">
          <i class="ti ti-circle-check"></i>
          <div class="check-info">
            <span class="check-titulo">Datos recibidos</span>
            <span class="check-desc">La información inicial está en manos de soporte.</span>
          </div>
        </div>
        <div class="check-item-card pendiente">
          <i class="ti ti-circle-dashed"></i>
          <div class="check-info">
            <span class="check-titulo">Configuración del sistema</span>
            <span class="check-desc">Estructurando la base de datos y tus parámetros.</span>
          </div>
        </div>
        <div class="check-item-card pendiente">
          <i class="ti ti-circle-dashed"></i>
          <div class="check-info">
            <span class="check-titulo">Entrega final</span>
            <span class="check-desc">Verificación de calidad antes del pase a producción.</span>
          </div>
        </div>
      </div>

      <div class="revision-footer">
        <router-link to="/empleado" class="btn-demo-link">
          Ver demo mientras tanto <i class="ti ti-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <div v-else-if="estado === 'activo'" class="activo-wrap">
      <div class="hero-saludo">
        <div class="hero-left">
          <p class="hero-eyebrow">{{ saludo }}, {{ primerNombre }}</p>
          <h1 class="hero-titulo">Tu empresa está <em>lista.</em></h1>
          <p class="hero-sub">Gestiona tu equipo desde un solo lugar.</p>
        </div>
        <div class="hero-fecha">
          <span class="fecha-dia">{{ fechaDia }}</span>
          <span class="fecha-mes">{{ fechaMes }}</span>
        </div>
      </div>

      <div class="divider-hero"></div>

      <p class="seccion-label">Módulos del sistema</p>
      <div class="modulos-grid">
        <router-link to="/empleado" class="modulo-card">
          <i class="ti ti-users modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Empleados</span>
            <span class="modulo-desc">Gestión de personal</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/departamento" class="modulo-card">
          <i class="ti ti-building modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Departamentos</span>
            <span class="modulo-desc">Estructura organizacional</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/expedientes" class="modulo-card">
          <i class="ti ti-folder modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Expedientes</span>
            <span class="modulo-desc">Documentos del personal</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/nomina" class="modulo-card modulo-card--accent">
          <i class="ti ti-coin modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Nómina</span>
            <span class="modulo-desc">Pagos y salarios</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/asistencia" class="modulo-card">
          <i class="ti ti-calendar-check modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Asistencia</span>
            <span class="modulo-desc">Control de asistencia</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/permisos-vacaciones" class="modulo-card">
          <i class="ti ti-beach modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Permisos y Vacaciones</span>
            <span class="modulo-desc">Solicitudes y aprobaciones</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/capacitaciones" class="modulo-card">
          <i class="ti ti-school modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Capacitaciones</span>
            <span class="modulo-desc">Formación del personal</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>

        <router-link to="/reportes" class="modulo-card">
          <i class="ti ti-chart-bar modulo-icono"></i>
          <div class="modulo-info">
            <span class="modulo-nombre">Reportes</span>
            <span class="modulo-desc">Análisis y estadísticas</span>
          </div>
          <i class="ti ti-arrow-right modulo-arrow"></i>
        </router-link>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router  = useRouter()
const usuario = ref(null)
const estado  = ref(null)

const primerNombre = computed(() => {
  const nombre = usuario.value?.nombre || ''
  return nombre.split(' ')[0]
})

const saludo = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
})

const fechaDia = computed(() => {
  return new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric' })
})

const fechaMes = computed(() => {
  return new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })
})

onMounted(async () => {
  const raw = localStorage.getItem('usuario')
  if (!raw) return router.push('/login')

  usuario.value = JSON.parse(raw)

  if (usuario.value.rol === 'superadmin') return router.push('/superadmin')

  try {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      estado.value = data.estado
      const usuarioActualizado = { ...usuario.value, estado: data.estado }
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
      usuario.value = usuarioActualizado
    } else {
      estado.value = usuario.value.estado
    }
  } catch {
    estado.value = usuario.value.estado
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&display=swap');

.dashboard-wrap {
  min-height: 100vh;
  background: #f5f5f0;
  padding: 2.5rem 2rem;
  font-family: 'Inter', -apple-system, sans-serif;
}

.redirigiendo {
  color: #718096;
  font-size: .9rem;
  text-align: center;
  padding: 4rem;
}

/* ── ESTILOS COMPARTIDOS (ACTIVO / DEMO / REVISIÓN) ── */
.activo-wrap {
  max-width: 860px;
  margin: 0 auto;
  animation: fadeUp .4s ease;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero-saludo {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 2rem 0 1.5rem;
}

.hero-eyebrow {
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 .5rem;
}

.hero-titulo {
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 3rem;
  font-weight: 400;
  color: #0f172a;
  margin: 0 0 .4rem;
  line-height: 1.1;
  letter-spacing: -.5px;
}

/* Variaciones de acento para los títulos del Hero */
.hero-titulo em { font-style: italic; color: #1d4ed8; }
.estado-card.demo .hero-titulo em, .activo-wrap .hero-titulo em { color: #805ad5; } /* Púrpura para Demo */
.hero-titulo--revision em { color: #ed8936 !important; } /* Naranja para Revisión */

.hero-sub {
  font-size: .9rem;
  color: #64748b;
  margin: 0;
}

.hero-fecha {
  text-align: right;
  flex-shrink: 0;
}

.fecha-dia {
  display: block;
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 1.1rem;
  color: #0f172a;
  text-transform: capitalize;
}

.fecha-mes {
  display: block;
  font-size: .75rem;
  color: #94a3b8;
  text-transform: capitalize;
  margin-top: .1rem;
}

.divider-hero {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 2rem;
}

.seccion-label {
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 1rem;
}

/* ── REJILLA DE MÓDULOS ── */
.modulos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .75rem;
}

.modulo-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-decoration: none;
  transition: all .18s ease;
  position: relative;
  overflow: hidden;
}

.modulo-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: #1d4ed8;
  transform: scaleY(0);
  transition: transform .18s ease;
  transform-origin: bottom;
}

/* Ajuste dinámico de color lateral según estado */
.estado-card.demo .modulo-card::before { background: #805ad5; }

.modulo-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 16px rgba(29,78,216,.08);
  transform: translateY(-1px);
}

.modulo-card:hover::before {
  transform: scaleY(1);
}

.modulo-card--accent {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.modulo-card--accent .modulo-icono,
.modulo-card--accent .modulo-nombre,
.modulo-card--accent .modulo-desc,
.modulo-card--accent .modulo-arrow {
  color: #fff !important;
}

.modulo-card--accent::before {
  background: rgba(255,255,255,.3);
}

.modulo-card--accent:hover {
  background: #1e40af;
  border-color: #1e40af;
  box-shadow: 0 4px 20px rgba(29,78,216,.35);
}

.modulo-icono {
  font-size: 1.4rem;
  color: #1d4ed8;
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}

.modulo-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: .1rem;
}

.modulo-nombre {
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 1rem;
  color: #0f172a;
  font-weight: 400;
}

.modulo-desc {
  font-size: .72rem;
  color: #94a3b8;
}

.modulo-arrow {
  font-size: 1rem;
  color: #cbd5e1;
  flex-shrink: 0;
  transition: transform .18s, color .18s;
}

.modulo-card:hover .modulo-arrow {
  transform: translateX(3px);
  color: #1d4ed8;
}

/* ── DISEÑO EXCLUSIVO DE REVISIÓN (CHECKLIST ESTILO EDITORIAL) ── */
.checklist-revision {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .75rem;
  margin-bottom: 2rem;
}

.check-item-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.check-item-card i {
  font-size: 1.3rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.check-item-card.completado i { color: #38a169; }
.check-item-card.pendiente i { color: #ed8936; }

.check-info {
  display: flex;
  flex-direction: column;
  gap: .15rem;
}

.check-titulo {
  font-family: 'IM Fell English', 'Times New Roman', Georgia, serif;
  font-size: 1rem;
  color: #0f172a;
}

.check-desc {
  font-size: .75rem;
  color: #64748b;
  line-height: 1.4;
}

.revision-footer {
  text-align: center;
  margin-top: 2rem;
}

.btn-demo-link {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  color: #1d4ed8;
  text-decoration: none;
  font-size: .9rem;
  font-weight: 600;
  transition: color .18s;
}

.btn-demo-link:hover {
  color: #1e40af;
  border-radius: 13px;
}

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .modulos-grid, .checklist-revision { grid-template-columns: 1fr; }
  .hero-titulo { font-size: 2rem; }
  .hero-saludo { flex-direction: column; align-items: flex-start; gap: .5rem; }
  .hero-fecha { text-align: left; }
}
</style>