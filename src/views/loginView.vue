<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const PAYPAL_CLIENT_ID = 'AeWWAfSF-KuhgYSnaW9oJE4Fg_K2fNsAB-5W4_T5vAGS4aF-Xo_oyFLxxepKHX_wQr69royRFQZgHbk_'

const pantalla = ref('login')
const cargando = ref(false)
const paypalCargado = ref(false)
const eNCF = ref('')
const passwordVisible = ref(false)
const loginError = ref('')

const form = reactive({
  nombre: '', apellido: '', correo: '', password: ''
})

const planes = [
  {
    id: 'pro', nombre: 'Pro', precio: 29,
    icon: 'ti-rocket',
    popular: true,
    desc: 'Para empresas en crecimiento',
    features: ['50 empleados', 'Módulos básicos', 'Soporte 24/7'],
    featureOk: [true, true, true]
  },
  {
    id: 'enterprise', nombre: 'Enterprise', precio: 99,
    icon: 'ti-crown',
    desc: 'Sin límites, con soporte personalizado',
    features: ['Empleados ilimitados', 'Todo incluido', 'Soporte 24/7', 'Asistencia personal'],
    featureOk: [true, true, true, true]
  }
]

const planSeleccionado = ref(planes[0])

/* ── Navegación ── */
async function irA(p) {
  pantalla.value = p
  loginError.value = ''
  if (p === 'pago') setTimeout(cargarPayPal, 400)
}

function seleccionarPlan(plan) { planSeleccionado.value = plan }

/* ── Login ── */
async function login() {
  if (!form.correo || !form.password) { loginError.value = 'Completa correo y contraseña.'; return }
  cargando.value = true
  loginError.value = ''
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: form.correo, password: form.password })
    })
    const data = await res.json()
    if (!res.ok) { loginError.value = data.error || 'Credenciales incorrectas'; return }
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    if (data.usuario.rol === 'superadmin') router.push('/superadmin')
    else router.push('/dashboard')
  } catch { loginError.value = 'Error de conexión. Intenta de nuevo.' }
  finally { cargando.value = false }
}

/* ── Registro ── */
async function registro() {
  if (!form.nombre || !form.correo || !form.password) {
    loginError.value = 'Completa todos los campos requeridos.'
    return
  }

  cargando.value = true
  loginError.value = ''

  try {
    const res = await fetch(`${API}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: form.correo })
    })
    const data = await res.json()

    if (data.existe) {
      loginError.value = 'Este correo ya está registrado. Inicia sesión.'
      return
    }

    irA('planes')
  } catch {
    loginError.value = 'Error de conexión. Intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}

/* ── PayPal ── */
function cargarPayPal() {
  if (paypalCargado.value) { renderPayPal(); return }
  const script = document.createElement('script')
  script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`
  script.onload = () => { paypalCargado.value = true; renderPayPal() }
  document.head.appendChild(script)
}

function renderPayPal() {
  const c = document.getElementById('paypal-btn')
  if (!c) return
  c.innerHTML = ''
  window.paypal.Buttons({
    style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' },
    createOrder(data, actions) {
      return actions.order.create({
        purchase_units: [{ amount: { value: String(planSeleccionado.value.precio) }, description: `Suscripción Plan ${planSeleccionado.value.nombre}` }]
      })
    },
    async onApprove(data, actions) {
      cargando.value = true
      await actions.order.capture()
      try {
        const res = await fetch(`${API}/api/verificar-pago`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID, plan: planSeleccionado.value, comprador: { nombre: `${form.nombre} ${form.apellido}`, correo: form.correo } })
        })
        const result = await res.json()
        eNCF.value = result.eNCF || ''
        const regRes = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: `${form.nombre} ${form.apellido}`, correo: form.correo, password: form.password, plan: planSeleccionado.value.nombre })
        })
        const regData = await regRes.json()
        if (regData.token) {
          localStorage.setItem('token', regData.token)
          localStorage.setItem('usuario', JSON.stringify(regData.usuario))
        }
        irA('exito')
      } catch (err) { loginError.value = 'Error al procesar el pago: ' + err.message }
      finally { cargando.value = false }
    },
    onError(err) { console.error(err); loginError.value = 'Error en PayPal. Intenta de nuevo.' }
  }).render('#paypal-btn')
}

const strengthWidth = (pwd) => {
  if (!pwd) return '0%'
  if (pwd.length < 5) return '25%'
  if (pwd.length < 8) return '55%'
  return '100%'
}
const strengthColor = (pwd) => {
  if (!pwd || pwd.length < 5) return '#ef4444'
  if (pwd.length < 8) return '#f59e0b'
  return '#22c55e'
}

async function cerrarSesion() {
  const token = localStorage.getItem('token')
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<template>
  <div class="root">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

    <Transition name="fade" mode="out-in">

      <!-- ══ LOGIN ══ -->
      <div v-if="pantalla === 'login'" key="login" class="shell">
        <div class="left-panel">
          <div class="lp-logo">
            <div class="lp-icon"><i class="ti ti-building-skyscraper"></i></div>
            <div>
              <div class="lp-name">RRHH Systems</div>
              <div class="lp-sub">Gestión · IA</div>
            </div>
          </div>
          <div class="lp-steps">
            <div class="lp-step">
              <div class="step-dot active">1</div>
              <div class="step-info">
                <div class="step-label active">Acceso</div>
                <div class="step-hint">Ingresa con tu cuenta</div>
              </div>
            </div>
            <div class="lp-step">
              <div class="step-dot">2</div>
              <div class="step-info">
                <div class="step-label">Dashboard</div>
                <div class="step-hint">Tu espacio de trabajo</div>
              </div>
            </div>
            <div class="lp-step">
              <div class="step-dot">3</div>
              <div class="step-info">
                <div class="step-label">Gestiona</div>
                <div class="step-hint">Empleados y reportes</div>
              </div>
            </div>
          </div>
          <div class="lp-footer"><p>RRHH Systems IA<br>Todos los derechos reservados © 2025</p></div>
        </div>
        <div class="right-panel">
          <div class="form-box">
            <div class="form-title">Bienvenido de nuevo</div>
            <div class="form-sub">Ingresa tus credenciales para continuar</div>
            <div class="field">
  <label class="field-label">Usuario o correo electrónico</label>
  <div class="inp-wrap">
    <i class="ti ti-user inp-icon"></i>
    <input v-model="form.correo" type="text" class="inp" placeholder="usuario o correo@empresa.com" @keyup.enter="login" />
  </div>
</div>
            <div class="field">
              <label class="field-label">Contraseña</label>
              <div class="inp-wrap">
                <i class="ti ti-lock inp-icon"></i>
                <input v-model="form.password" :type="passwordVisible ? 'text' : 'password'" class="inp" placeholder="••••••••" @keyup.enter="login" />
                <button class="inp-toggle" @click="passwordVisible = !passwordVisible" type="button">
                  <i class="ti" :class="passwordVisible ? 'ti-eye-off' : 'ti-eye'"></i>
                </button>
              </div>
            </div>
            <div class="forgot-row"><span class="forgot">¿Olvidaste tu contraseña?</span></div>
            <div v-if="loginError" class="error-msg"><i class="ti ti-alert-circle"></i> {{ loginError }}</div>
            <button class="btn-main" @click="login" :disabled="cargando">
              <span>{{ cargando ? 'Verificando…' : 'Iniciar sesión' }}</span>
              <i v-if="!cargando" class="ti ti-arrow-right"></i>
              <div v-else class="spinner-sm"></div>
            </button>
            <div class="divider"><div class="divider-line"></div><span>¿nuevo aquí?</span><div class="divider-line"></div></div>
            <div class="switch-row">¿No tienes cuenta? <span class="lnk" @click="irA('registro')">Regístrate gratis</span></div>
          </div>
        </div>
      </div>

      <!-- ══ REGISTRO ══ -->
      <div v-else-if="pantalla === 'registro'" key="registro" class="shell">
        <div class="left-panel">
          <div class="lp-logo">
            <div class="lp-icon"><i class="ti ti-building-skyscraper"></i></div>
            <div><div class="lp-name">RRHH Systems</div><div class="lp-sub">Gestión · IA</div></div>
          </div>
          <div class="lp-steps">
            <div class="lp-step">
              <div class="step-dot done"><i class="ti ti-check"></i></div>
              <div class="step-info"><div class="step-label done">Tu cuenta</div><div class="step-hint">Datos personales</div></div>
            </div>
            <div class="lp-step">
              <div class="step-dot active">2</div>
              <div class="step-info"><div class="step-label active">Plan</div><div class="step-hint">Elige tu suscripción</div></div>
            </div>
            <div class="lp-step">
              <div class="step-dot">3</div>
              <div class="step-info"><div class="step-label">Pago</div><div class="step-hint">Confirma y accede</div></div>
            </div>
          </div>
          <div class="lp-footer"><p>Sin permanencia.<br>Cancela cuando quieras.</p></div>
        </div>
        <div class="right-panel">
          <div class="form-box">
            <button class="back-btn" @click="irA('login')"><i class="ti ti-arrow-left"></i> Volver al login</button>
            <div class="form-title">Crea tu cuenta</div>
            <div class="form-sub">Un paso más para comenzar</div>
            <div class="field-row">
              <div class="field" style="margin:0">
                <label class="field-label">Nombre</label>
                <div class="inp-wrap"><i class="ti ti-user inp-icon"></i><input v-model="form.nombre" type="text" class="inp" placeholder="Juan" /></div>
              </div>
              <div class="field" style="margin:0">
                <label class="field-label">Apellido</label>
                <div class="inp-wrap"><input v-model="form.apellido" type="text" class="inp inp-plain" placeholder="Pérez" /></div>
              </div>
            </div>
            <div class="field" style="margin-top:1rem">
              <label class="field-label">Correo electrónico</label>
              <div class="inp-wrap"><i class="ti ti-mail inp-icon"></i><input v-model="form.correo" type="email" class="inp" placeholder="correo@empresa.com" /></div>
            </div>
            <div class="field">
              <label class="field-label">Contraseña</label>
              <div class="inp-wrap">
                <i class="ti ti-lock inp-icon"></i>
                <input v-model="form.password" :type="passwordVisible ? 'text' : 'password'" class="inp" placeholder="Mínimo 8 caracteres" />
                <button class="inp-toggle" @click="passwordVisible = !passwordVisible" type="button">
                  <i class="ti" :class="passwordVisible ? 'ti-eye-off' : 'ti-eye'"></i>
                </button>
              </div>
              <div class="strength-bar">
                <div class="strength-fill" :style="{ width: strengthWidth(form.password), background: strengthColor(form.password) }"></div>
              </div>
            </div>
            <div v-if="loginError" class="error-msg"><i class="ti ti-alert-circle"></i> {{ loginError }}</div>
            <button class="btn-main" @click="registro"><span>Continuar</span><i class="ti ti-arrow-right"></i></button>
            <div class="divider"><div class="divider-line"></div><span>¿ya tienes cuenta?</span><div class="divider-line"></div></div>
            <div class="switch-row"><span class="lnk" @click="irA('login')">Inicia sesión</span></div>
          </div>
        </div>
      </div>

      <!-- ══ PLANES ══ -->
      <div v-else-if="pantalla === 'planes'" key="planes" class="shell shell--light">
        <div class="right-panel" style="flex-direction:column;align-items:flex-start;max-width:none;padding:2.5rem 3rem;">
          <button class="back-btn" @click="irA('registro')"><i class="ti ti-arrow-left"></i> Volver</button>
          <div class="form-title">Elige tu plan</div>
          <div class="form-sub">Sin permanencia · Cancela cuando quieras</div>
          <div class="planes-grid">
            <div
              v-for="plan in planes" :key="plan.id"
              class="plan-card"
              :class="{ 'plan-card--dark': plan.popular, 'plan-card--sel': planSeleccionado.id === plan.id }"
              @click="seleccionarPlan(plan)"
            >
              <div v-if="plan.popular" class="hot-badge"><i class="ti ti-flame"></i> Más popular</div>
              <div class="plan-icon"><i class="ti" :class="plan.icon"></i></div>
              <div class="plan-name">{{ plan.nombre }}</div>
              <div class="plan-desc">{{ plan.desc }}</div>
              <div class="plan-price">
                <span class="plan-cur">$</span>
                <span class="plan-amt">{{ plan.precio }}</span>
                <span class="plan-per">/mes</span>
              </div>
              <ul class="plan-feats">
                <li v-for="(f, i) in plan.features" :key="i">
                  <i class="ti ti-check feat-ok"></i> {{ f }}
                </li>
              </ul>
              <div class="plan-sel-dot"><i class="ti ti-check"></i></div>
            </div>
          </div>
          <div class="planes-footer">
            <div class="footer-info">
              Seleccionado: <strong class="footer-name">{{ planSeleccionado.nombre }}</strong>
              <span class="footer-price">· ${{ planSeleccionado.precio }}/mes</span>
            </div>
            <button class="btn-main btn-compact" @click="irA('pago')">
              Pagar ${{ planSeleccionado.precio }} <i class="ti ti-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ══ PAGO ══ -->
      <div v-else-if="pantalla === 'pago'" key="pago" class="shell">
        <div class="left-panel">
          <div class="lp-logo">
            <div class="lp-icon"><i class="ti ti-building-skyscraper"></i></div>
            <div><div class="lp-name">RRHH Systems</div><div class="lp-sub">Gestión · IA</div></div>
          </div>
          <div class="lp-steps">
            <div class="lp-step"><div class="step-dot done"><i class="ti ti-check"></i></div><div class="step-info"><div class="step-label done">Tu cuenta</div></div></div>
            <div class="lp-step"><div class="step-dot done"><i class="ti ti-check"></i></div><div class="step-info"><div class="step-label done">Plan</div></div></div>
            <div class="lp-step"><div class="step-dot active">3</div><div class="step-info"><div class="step-label active">Pago</div><div class="step-hint">Último paso</div></div></div>
          </div>
          <div class="lp-footer"><p>Pago seguro con SSL.<br>DGII certificado.</p></div>
        </div>
        <div class="right-panel">
          <div class="form-box">
            <button class="back-btn" @click="irA('planes')"><i class="ti ti-arrow-left"></i> Cambiar plan</button>
            <div class="form-title">Confirma tu pago</div>
            <div class="form-sub">Revisa los detalles antes de continuar</div>
            <div class="pago-hero">
              <div class="pago-ico"><i class="ti ti-lock"></i></div>
              <div>
                <div class="pago-name">Plan {{ planSeleccionado.nombre }}</div>
                <div class="pago-price">${{ planSeleccionado.precio }} USD / mes</div>
              </div>
            </div>
            <div class="secure-row">
              <span class="spill"><i class="ti ti-shield-check"></i> SSL</span>
              <span class="spill"><i class="ti ti-certificate"></i> DGII</span>
              <span class="spill"><i class="ti ti-brand-paypal"></i> PayPal</span>
            </div>
            <div v-if="cargando" class="loading-box"><div class="spinner"></div><p>Procesando pago…</p></div>
            <div id="paypal-btn" :class="{ 'opacity-0': cargando }"></div>
            <div v-if="loginError" class="error-msg" style="margin-top:12px"><i class="ti ti-alert-circle"></i> {{ loginError }}</div>
          </div>
        </div>
      </div>

      <!-- ══ ÉXITO ══ -->
      <div v-else-if="pantalla === 'exito'" key="exito" class="shell">
        <div class="left-panel">
          <div class="lp-logo">
            <div class="lp-icon"><i class="ti ti-building-skyscraper"></i></div>
            <div><div class="lp-name">RRHH Systems</div><div class="lp-sub">Gestión · IA</div></div>
          </div>
          <div class="lp-steps">
            <div class="lp-step"><div class="step-dot done"><i class="ti ti-check"></i></div><div class="step-info"><div class="step-label done">Tu cuenta</div></div></div>
            <div class="lp-step"><div class="step-dot done"><i class="ti ti-check"></i></div><div class="step-info"><div class="step-label done">Plan</div></div></div>
            <div class="lp-step"><div class="step-dot done"><i class="ti ti-check"></i></div><div class="step-info"><div class="step-label done">Pago</div></div></div>
          </div>
          <div class="lp-footer"><p>¡Todo listo!<br>Ya puedes usar el sistema.</p></div>
        </div>
        <div class="right-panel" style="text-align:center;">
          <div class="form-box">
            <div class="exito-ico"><i class="ti ti-check"></i></div>
            <div class="form-title">¡Pago confirmado!</div>
            <div class="form-sub">Tu comprobante fue emitido a la DGII y enviado a <strong style="color:#0f172a;">{{ form.correo }}</strong></div>
            <div v-if="eNCF" class="ecf-box">
              <i class="ti ti-file-invoice"></i>
              <div><div class="ecf-lbl">Comprobante Fiscal (eNCF)</div><div class="ecf-code">{{ eNCF }}</div></div>
            </div>
            <div class="demo-tile">
              <div class="demo-ico"><i class="ti ti-device-desktop"></i></div>
              <div>
                <p style="font-size:.8rem;font-weight:600;color:#0f172a;margin:0;">Accede al demo ahora</p>
                <span style="font-size:.71rem;color:#94a3b8;">Explora con datos de prueba</span>
              </div>
              <router-link to="/dashboard" class="demo-link-btn">Ver demo →</router-link>
            </div>
            <button class="btn-main" @click="irA('login')">Ir al sistema <i class="ti ti-arrow-right"></i></button>
          </div>
        </div>
      </div>

    </Transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  padding: 2rem;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* ── Shell (split layout) ── */
.shell {
  display: flex;
  width: 100%;
  max-width: 860px;
  min-height: 560px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.12);
}
.shell--light {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

/* ── Left panel ── */
.left-panel {
  width: 230px;
  flex-shrink: 0;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 1.75rem;
  position: relative;
  overflow: hidden;
}
.left-panel::before {
  content: '';
  position: absolute;
  width: 280px; height: 280px;
  border-radius: 50%;
  background: rgba(99,102,241,.12);
  top: -100px; left: -100px;
}
.left-panel::after {
  content: '';
  position: absolute;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: rgba(29,78,216,.1);
  bottom: -70px; right: -70px;
}

.lp-logo {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 3rem;
}
.lp-icon {
  width: 38px; height: 38px;
  background: rgba(255,255,255,.08);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 18px;
}
.lp-name { font-size: .95rem; font-weight: 700; color: #fff; line-height: 1.1; }
.lp-sub  { font-size: .65rem; color: rgba(255,255,255,.3); margin-top: 2px; }

.lp-steps { position: relative; z-index: 1; display: flex; flex-direction: column; }
.lp-step  {
  display: flex; align-items: flex-start; gap: 12px;
  padding-bottom: 1.75rem; position: relative;
}
.lp-step:not(:last-child)::before {
  content: '';
  position: absolute; left: 13px; top: 28px; bottom: 0;
  width: 1px; background: rgba(255,255,255,.07);
}
.step-dot {
  width: 27px; height: 27px; border-radius: 50%;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,.25); flex-shrink: 0;
}
.step-dot.done   { background: rgba(34,197,94,.15); border-color: rgba(34,197,94,.3); color: #4ade80; }
.step-dot.active { background: #4f46e5; border-color: #4f46e5; color: #fff; }
.step-info { padding-top: 4px; }
.step-label { font-size: .78rem; font-weight: 600; color: rgba(255,255,255,.25); }
.step-label.active { color: #fff; }
.step-label.done   { color: rgba(255,255,255,.45); }
.step-hint { font-size: .65rem; color: rgba(255,255,255,.18); margin-top: 2px; line-height: 1.4; }

.lp-footer {
  margin-top: auto; position: relative; z-index: 1;
}
.lp-footer p { font-size: .65rem; color: rgba(255,255,255,.18); line-height: 1.7; }

/* ── Right panel ── */
.right-panel {
  flex: 1;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2rem;
}
.form-box { width: 100%; max-width: 360px; }

.form-title { font-size: 1.55rem; font-weight: 700; color: #0f172a; letter-spacing: -.5px; margin-bottom: .3rem; }
.form-sub   { font-size: .82rem; color: #94a3b8; margin-bottom: 1.75rem; line-height: 1.5; }

/* ── Fields ── */
.field { margin-bottom: 1rem; }
.field-label {
  display: block;
  font-size: .68rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .08em;
  color: #64748b; margin-bottom: .4rem;
}
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.inp-wrap { position: relative; display: flex; align-items: center; }
.inp-icon { position: absolute; left: 12px; font-size: 16px; color: #cbd5e1; pointer-events: none; }
.inp {
  width: 100%; padding: 11px 12px 11px 38px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: .875rem; color: #0f172a;
  background: #fff; outline: none;
  font-family: inherit;
  transition: border-color .15s, box-shadow .15s;
  box-sizing: border-box;
}
.inp::placeholder { color: #cbd5e1; }
.inp:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.inp-plain { padding-left: 12px; }
.inp-toggle {
  position: absolute; right: 11px;
  background: none; border: none;
  color: #cbd5e1; cursor: pointer; font-size: 16px; padding: 3px;
  display: flex; line-height: 1;
}
.inp-toggle:hover { color: #64748b; }

.strength-bar { height: 3px; background: #f1f5f9; border-radius: 3px; margin-top: 7px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 3px; transition: width .3s ease, background .3s ease; }

/* ── Misc ── */
.forgot-row { text-align: right; margin: -.2rem 0 1.2rem; }
.forgot { font-size: .75rem; color: #94a3b8; cursor: pointer; }
.forgot:hover { color: #6366f1; }

.error-msg {
  display: flex; align-items: center; gap: 7px;
  background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.2);
  color: #dc2626; font-size: .8rem; padding: 9px 12px;
  border-radius: 8px; margin-bottom: 12px;
}

.btn-main {
  width: 100%; padding: 12px;
  background: #0f172a; color: #fff;
  border: none; border-radius: 10px;
  font-size: .88rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background .15s;
}
.btn-main:hover:not(:disabled) { background: #1e293b; }
.btn-main:disabled { opacity: .6; cursor: not-allowed; }
.btn-compact { width: auto; padding: 10px 22px; font-size: .83rem; }

.divider {
  display: flex; align-items: center; gap: 10px;
  margin: 1.25rem 0;
}
.divider-line { flex: 1; height: 1px; background: #e2e8f0; }
.divider span { font-size: .7rem; color: #cbd5e1; white-space: nowrap; }

.switch-row { text-align: center; font-size: .8rem; color: #94a3b8; }
.lnk { color: #6366f1; cursor: pointer; font-weight: 500; }
.lnk:hover { color: #4f46e5; text-decoration: underline; }

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .75rem; color: #64748b; cursor: pointer;
  background: none; border: none; font-family: inherit;
  padding: 0; margin-bottom: 1.25rem;
  transition: color .15s;
}
.back-btn:hover { color: #0f172a; }

/* ── Planes ── */
.planes-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px; margin-bottom: 1.25rem; width: 100%;
}
.plan-card {
  background: #fff; border: 1.5px solid #e2e8f0;
  border-radius: 18px; padding: 1.5rem;
  cursor: pointer; position: relative; overflow: visible;
  transition: border-color .2s, transform .18s;
}
.plan-card:hover { transform: translateY(-3px); border-color: #c7d2fe; }
.plan-card--sel  { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
.plan-card--dark { background: #0f172a; border-color: #0f172a; }
.plan-card--dark:hover { transform: translateY(-3px); }
.plan-card--dark.plan-card--sel { box-shadow: 0 0 0 3px rgba(99,102,241,.3); }

.hot-badge {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: #6366f1; color: #fff;
  font-size: .62rem; font-weight: 700;
  padding: 3px 13px; border-radius: 20px;
  letter-spacing: .05em; white-space: nowrap;
}

.plan-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px; color: #6366f1; margin-bottom: .9rem;
}
.plan-card--dark .plan-icon { background: rgba(255,255,255,.08); color: #a5b4fc; }

.plan-name { font-size: .95rem; font-weight: 700; color: #0f172a; margin-bottom: .15rem; }
.plan-card--dark .plan-name { color: #fff; }
.plan-desc { font-size: .72rem; color: #94a3b8; margin-bottom: .9rem; line-height: 1.5; }
.plan-card--dark .plan-desc { color: rgba(255,255,255,.38); }

.plan-price { display: flex; align-items: baseline; gap: 1px; margin-bottom: 1rem; }
.plan-cur { font-size: .85rem; color: #94a3b8; font-weight: 600; }
.plan-card--dark .plan-cur { color: rgba(255,255,255,.3); }
.plan-amt { font-size: 2.4rem; font-weight: 800; color: #0f172a; line-height: 1; letter-spacing: -2px; }
.plan-card--dark .plan-amt { color: #fff; }
.plan-per { font-size: .72rem; color: #94a3b8; margin-left: 3px; }
.plan-card--dark .plan-per { color: rgba(255,255,255,.3); }

.plan-feats {
  list-style: none; border-top: 1px solid #f1f5f9;
  padding-top: .85rem; display: flex; flex-direction: column; gap: 6px;
}
.plan-card--dark .plan-feats { border-color: rgba(255,255,255,.08); }
.plan-feats li { font-size: .75rem; display: flex; align-items: center; gap: 7px; color: #475569; }
.plan-card--dark .plan-feats li { color: rgba(255,255,255,.6); }
.feat-ok { color: #22c55e; font-size: 14px; }
.plan-card--dark .feat-ok { color: #86efac; }

.plan-sel-dot {
  position: absolute; top: 12px; right: 12px;
  width: 20px; height: 20px; border-radius: 50%;
  border: 1.5px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: transparent; transition: all .2s;
}
.plan-card--dark .plan-sel-dot { border-color: rgba(255,255,255,.2); }
.plan-card--sel .plan-sel-dot { background: #6366f1; border-color: #6366f1; color: #fff; }
.plan-card--dark.plan-card--sel .plan-sel-dot { background: #fff; border-color: #fff; color: #6366f1; }

.planes-footer {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 12px 18px; display: flex; align-items: center;
  justify-content: space-between; gap: 12px; width: 100%;
}
.footer-info { font-size: .82rem; color: #94a3b8; display: flex; align-items: center; gap: 7px; }
.footer-name  { font-weight: 700; color: #0f172a; }
.footer-price { color: #64748b; }

/* ── Pago ── */
.pago-hero {
  display: flex; align-items: center; gap: 13px;
  background: #f8fafc; border: 1.5px solid #e2e8f0;
  border-radius: 12px; padding: 1rem; margin-bottom: 1rem;
}
.pago-ico {
  width: 44px; height: 44px; background: #0f172a;
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; color: #fff; font-size: 20px; flex-shrink: 0;
}
.pago-name  { font-size: .92rem; font-weight: 700; color: #0f172a; }
.pago-price { font-size: .75rem; color: #94a3b8; margin-top: 2px; }

.secure-row { display: flex; gap: 6px; margin-bottom: 1.25rem; flex-wrap: wrap; }
.spill {
  display: flex; align-items: center; gap: 5px;
  font-size: .68rem; color: #64748b;
  background: #f8fafc; border: 1px solid #e2e8f0;
  padding: 4px 10px; border-radius: 20px;
}
.loading-box {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 2rem; color: #94a3b8; font-size: .82rem;
}
.spinner {
  width: 28px; height: 28px;
  border: 2.5px solid #e2e8f0; border-top-color: #6366f1;
  border-radius: 50%; animation: spin .8s linear infinite;
}
.spinner-sm {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,.25); border-top-color: #fff;
  border-radius: 50%; animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.opacity-0 { opacity: 0; pointer-events: none; }

/* ── Éxito ── */
.exito-ico {
  width: 72px; height: 72px; border-radius: 50%;
  background: #f0fdf4; border: 2px solid #bbf7d0;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: #16a34a; margin: 0 auto 1.25rem;
}
.ecf-box {
  display: flex; align-items: center; gap: 10px;
  background: #eff6ff; border: 1px solid #bfdbfe;
  border-radius: 10px; padding: .85rem 1rem;
  margin: 1rem 0; text-align: left;
}
.ecf-box i { font-size: 20px; color: #1d4ed8; }
.ecf-lbl  { font-size: .66rem; color: #64748b; }
.ecf-code { font-size: .85rem; font-weight: 700; color: #0f172a; margin-top: 2px; }

.demo-tile {
  display: flex; align-items: center; gap: 10px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 10px; padding: .8rem 1rem; margin-bottom: 1rem;
}
.demo-ico {
  width: 36px; height: 36px; background: #eff6ff;
  border-radius: 9px; display: flex; align-items: center;
  justify-content: center; font-size: 17px; color: #1d4ed8; flex-shrink: 0;
}
.demo-link-btn {
  margin-left: auto; background: #0f172a; color: #fff;
  padding: 6px 12px; border-radius: 8px;
  font-size: .71rem; font-weight: 600;
  text-decoration: none; white-space: nowrap;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity .22s ease, transform .22s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to   { opacity: 0; transform: translateY(-8px); }

/* ── Responsive ── */
@media (max-width: 700px) {
  .root { padding: 1rem; }
  .shell { flex-direction: column; max-width: 100%; min-height: unset; }
  .left-panel { width: 100%; flex-direction: row; align-items: center; padding: 1.25rem 1.5rem; gap: 1rem; }
  .lp-steps, .lp-footer { display: none; }
  .lp-logo { margin-bottom: 0; }
  .right-panel { padding: 1.75rem 1.25rem; }
  .planes-grid { grid-template-columns: 1fr; }
  .field-row { grid-template-columns: 1fr; }
  .planes-footer { flex-direction: column; }
  .btn-compact { width: 100%; justify-content: center; }
}
</style>