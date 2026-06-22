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
const canvasRef = ref(null)

const form = reactive({
  nombre: '', apellido: '', correo: '', password: ''
})

// Se eliminó el plan 'free'. Solo quedan planes premium.
const planes = [
  {
    id: 'pro', nombre: 'Pro', precio: 29,
    icon: 'ti-rocket', color: '#1a3c5e',
    popular: true,
    desc: 'Para empresas en crecimiento',
    features: ['50 empleados', 'Modulos básicos', 'Soporte 24/7',''],
    featureOk: [true, true, true]
  },
  {
    id: 'enterprise', nombre: 'Enterprise', precio: 99,
    icon: 'ti-crown', color: '#92400e',
    desc: 'Sin límites, con soporte 24/7',
    features: ['Empleados ilimitados', 'Todo incluido', 'Soporte 24/7', 'Asistencia personal'],
    featureOk: [true, true, true, true]
  }
]

const planSeleccionado = ref(planes[0]) // Apuesta por defecto al plan Pro

/* ── Canvas particles ── */
let animId = null
let particles = []

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    o: Math.random() * 0.5 + 0.1
  }))

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(147,197,253,${p.o})`
      ctx.fill()
    })
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(147,197,253,${0.08 * (1 - dist / 100)})`
          ctx.lineWidth = 0.5
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
    animId = requestAnimationFrame(draw)
  }
  draw()
}

onMounted(() => {
  nextTick(initCanvas)
  window.addEventListener('resize', () => {
    if (canvasRef.value) {
      canvasRef.value.width = window.innerWidth
      canvasRef.value.height = window.innerHeight
    }
  })
})
onUnmounted(() => { if (animId) cancelAnimationFrame(animId) })

/* ── Navegación ── */
async function irA(p) {
  pantalla.value = p
  loginError.value = ''
  if (p === 'pago') {
    setTimeout(cargarPayPal, 400)
  }
}

function seleccionarPlan(plan) { planSeleccionado.value = plan }

/* ── Login real ── */
async function login() {
  if (!form.correo || !form.password) {
    loginError.value = 'Completa correo y contraseña.'
    return
  }
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

    if (data.usuario.rol === 'superadmin') {
      router.push('/superadmin')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    loginError.value = 'Error de conexión. Intenta de nuevo.'
  } finally {
    cargando.value = false
  }
}

/* ── Registro ── */
async function registro() {
  if (!form.nombre || !form.correo || !form.password) {
    loginError.value = 'Completa todos los campos requeridos.'
    return
  }
  irA('planes')
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
        purchase_units: [{
          amount: { value: String(planSeleccionado.value.precio) },
          description: `Suscripción Plan ${planSeleccionado.value.nombre}`
        }]
      })
    },
    async onApprove(data, actions) {
      cargando.value = true
      await actions.order.capture()
      console.log('FORM AL PAGAR:', form.correo, form.password)
      try {
        const res = await fetch(`${API}/api/verificar-pago`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderID: data.orderID,
            plan: planSeleccionado.value,
            comprador: { nombre: `${form.nombre} ${form.apellido}`, correo: form.correo }
          })
        })
        const result = await res.json()
        eNCF.value = result.eNCF || ''

        const regRes = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: `${form.nombre} ${form.apellido}`,
            correo: form.correo,
            password: form.password,
            plan: planSeleccionado.value.nombre
          })
        })
        const regData = await regRes.json()
        if (regData.token) {
          localStorage.setItem('token', regData.token)
          localStorage.setItem('usuario', JSON.stringify(regData.usuario))
        }

        irA('exito')
      } catch (err) {
        loginError.value = 'Error al procesar el pago: ' + err.message
      } finally {
        cargando.value = false
      }
    },
    onError(err) { console.error(err); loginError.value = 'Error en PayPal. Intenta de nuevo.' }
  }).render('#paypal-btn')
}
</script>

<template>
  <div class="root">
    <canvas ref="canvasRef" class="canvas-bg"></canvas>
    <div class="gradient-overlay"></div>
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <div class="stage" :class="{ 'stage--wide': pantalla === 'planes' }">
      <Transition name="slide" mode="out-in">

        <div v-if="pantalla === 'login'" key="login" class="glass-card">
          <div class="brand">
            <div class="brand-icon">
              <i class="ti ti-building-skyscraper"></i>
              <div class="brand-pulse"></div>
            </div>
            <div class="brand-text">
              <span class="brand-name">RRHH</span>
              <span class="brand-sub">Sistema de Gestión</span>
            </div>
          </div>
          <div class="divider-line"></div>
          <h2 class="screen-title">Bienvenido de nuevo</h2>
          <p class="screen-sub">Ingresa tus credenciales para continuar</p>
          <div class="field-group">
            <label class="field-label">Correo electrónico</label>
            <div class="field-wrap">
              <i class="ti ti-mail field-icon"></i>
              <input v-model="form.correo" type="email" class="field-input" placeholder="correo@empresa.com" @keyup.enter="login" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Contraseña</label>
            <div class="field-wrap">
              <i class="ti ti-lock field-icon"></i>
              <input v-model="form.password" :type="passwordVisible ? 'text' : 'password'" class="field-input" placeholder="••••••••" @keyup.enter="login" />
              <button class="field-toggle" @click="passwordVisible = !passwordVisible" type="button">
                <i class="ti" :class="passwordVisible ? 'ti-eye-off' : 'ti-eye'"></i>
              </button>
            </div>
          </div>
          <div v-if="loginError" class="error-msg"><i class="ti ti-alert-circle"></i> {{ loginError }}</div>
          <div class="forgot-row"><span class="link-ghost">¿Olvidaste tu contraseña?</span></div>
          <button class="btn-main" @click="login" :disabled="cargando">
            <span v-if="!cargando">Iniciar sesión</span>
            <span v-else>Verificando…</span>
            <i v-if="!cargando" class="ti ti-arrow-right"></i>
            <div v-else class="spinner-sm"></div>
          </button>
          <div class="divider-line" style="margin-top: 30px;"></div>
          <p class="register-prompt">¿No tienes cuenta? <span class="link-accent" @click="irA('registro')">Regístrate</span></p>
        </div>

        <div v-else-if="pantalla === 'registro'" key="registro" class="glass-card">
          <button class="back-btn" @click="irA('login')"><i class="ti ti-arrow-left"></i> Volver</button>
          <div class="progress-bar">
            <div class="progress-step progress-step--done"><i class="ti ti-check"></i></div>
            <div class="progress-track"><div class="progress-fill" style="width:50%"></div></div>
            <div class="progress-step progress-step--active">2</div>
          </div>
          <h2 class="screen-title" style="margin-top:20px">Crea tu cuenta</h2>
          <p class="screen-sub">Un paso más para comenzar</p>
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">Nombre</label>
              <div class="field-wrap">
                <i class="ti ti-user field-icon"></i>
                <input v-model="form.nombre" type="text" class="field-input" placeholder="Juan" />
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">Apellido</label>
              <div class="field-wrap">
                <input v-model="form.apellido" type="text" class="field-input" placeholder="Pérez" style="padding-left:14px" />
              </div>
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Correo electrónico</label>
            <div class="field-wrap">
              <i class="ti ti-mail field-icon"></i>
              <input v-model="form.correo" type="email" class="field-input" placeholder="correo@empresa.com" />
            </div>
          </div>
          <div class="field-group">
            <label class="field-label">Contraseña</label>
            <div class="field-wrap">
              <i class="ti ti-lock field-icon"></i>
              <input v-model="form.password" :type="passwordVisible ? 'text' : 'password'" class="field-input" placeholder="Mínimo 8 caracteres" />
              <button class="field-toggle" @click="passwordVisible = !passwordVisible" type="button">
                <i class="ti" :class="passwordVisible ? 'ti-eye-off' : 'ti-eye'"></i>
              </button>
            </div>
            <div class="strength-bar">
              <div class="strength-fill" :style="{
                width: form.password.length === 0 ? '0%' : form.password.length < 5 ? '25%' : form.password.length < 8 ? '55%' : '100%',
                background: form.password.length < 5 ? '#ef4444' : form.password.length < 8 ? '#f59e0b' : '#22c55e'
              }"></div>
            </div>
          </div>
          <div v-if="loginError" class="error-msg"><i class="ti ti-alert-circle"></i> {{ loginError }}</div>
          <button class="btn-main" @click="registro"><span>Siguiente</span><i class="ti ti-arrow-right"></i></button>
          <p class="register-prompt" style="margin-top:16px">¿Ya tienes cuenta? <span class="link-accent" @click="irA('login')">Inicia sesión</span></p>
        </div>

        <div v-else-if="pantalla === 'planes'" key="planes" class="planes-wrap">
          <button class="back-btn back-btn--ghost" @click="irA('registro')"><i class="ti ti-arrow-left"></i> Volver</button>
          <div class="planes-head">
            <span class="planes-eyebrow">Paso 2 de 2</span>
            <h1 class="planes-title">Elige tu plan</h1>
            <p class="planes-desc">Sin permanencia · Cancela cuando quieras</p>
          </div>
          <div class="planes-grid">
            <div
              v-for="plan in planes" :key="plan.id"
              class="plan-tile"
              :class="{ 'plan-tile--popular': plan.popular, 'plan-tile--selected': planSeleccionado.id === plan.id }"
              @click="seleccionarPlan(plan)"
            >
              <div v-if="plan.popular" class="tile-top-badge"><i class="ti ti-flame"></i> Más popular</div>
              <div class="tile-icon-wrap" :style="{ background: plan.color + '20', color: plan.color }">
                <i class="ti" :class="plan.icon"></i>
              </div>
              <p class="tile-name">{{ plan.nombre }}</p>
              <p class="tile-desc">{{ plan.desc }}</p>
              <div class="tile-price">
                <span class="tile-currency">$</span>
                <span class="tile-amount">{{ plan.precio }}</span>
                <span class="tile-period">/mes</span>
              </div>
              <ul class="tile-features">
                <li v-for="(f, i) in plan.features" :key="i" :class="plan.featureOk[i] ? 'feat--ok' : 'feat--no'">
                  <i class="ti" :class="plan.featureOk[i] ? 'ti-check' : 'ti-minus'"></i> {{ f }}
                </li>
              </ul>
              <div class="tile-check" :class="{ 'tile-check--active': planSeleccionado.id === plan.id }">
                <i class="ti ti-check"></i>
              </div>
            </div>
          </div>
          <div class="planes-footer">
            <div class="planes-footer-info">
              <span class="footer-plan-label">Seleccionado:</span>
              <strong class="footer-plan-name">{{ planSeleccionado.nombre }}</strong>
              <span class="footer-plan-price">· ${{ planSeleccionado.precio }}/mes</span>
            </div>
            <button class="btn-main btn-main--compact" @click="irA('pago')">
              <span>Pagar ${{ planSeleccionado.precio }}</span>
              <i class="ti ti-arrow-right"></i>
            </button>
          </div>
        </div>

        <div v-else-if="pantalla === 'pago'" key="pago" class="glass-card">
          <button class="back-btn" @click="irA('planes')"><i class="ti ti-arrow-left"></i> Volver</button>
          <div class="pago-hero">
            <div class="pago-lock"><i class="ti ti-lock"></i></div>
            <div>
              <p class="pago-plan-name">Plan {{ planSeleccionado.nombre }}</p>
              <p class="pago-plan-price">${{ planSeleccionado.precio }} USD / mes</p>
            </div>
          </div>
          <div class="secure-badges">
            <span><i class="ti ti-shield-check"></i> SSL</span>
            <span><i class="ti ti-certificate"></i> DGII Cert.</span>
            <span><i class="ti ti-brand-paypal"></i> PayPal</span>
          </div>
          <div v-if="cargando" class="loading-overlay">
            <div class="spinner"></div>
            <p>Procesando pago…</p>
          </div>
          <div id="paypal-btn" :class="{ 'opacity-0': cargando }"></div>
          <div v-if="loginError" class="error-msg" style="margin-top:12px"><i class="ti ti-alert-circle"></i> {{ loginError }}</div>
        </div>

        <div v-else-if="pantalla === 'exito'" key="exito" class="glass-card exito-card">
          <div class="exito-animation">
            <div class="exito-ring exito-ring-3"></div>
            <div class="exito-ring exito-ring-2"></div>
            <div class="exito-ring exito-ring-1"></div>
            <div class="exito-check-circle"><i class="ti ti-check"></i></div>
          </div>
          <h2 class="screen-title" style="margin-top:24px">¡Pago confirmado!</h2>
          <p class="screen-sub">Tu comprobante fue emitido a la DGII y enviado a <strong style="color:#93c5fd">{{ form.correo || 'tu correo' }}</strong></p>
          <div v-if="eNCF" class="ecf-badge">
            <i class="ti ti-file-invoice"></i>
            <div>
              <p style="font-size:11px;color:rgba(255,255,255,.5);margin:0">Comprobante Fiscal (eNCF)</p>
              <p style="font-size:14px;font-weight:600;color:#fff;margin:0;letter-spacing:.5px">{{ eNCF }}</p>
            </div>
          </div>
          <div class="demo-tile">
            <div class="demo-tile-icon"><i class="ti ti-device-desktop"></i></div>
            <div>
              <p style="font-size:13px;font-weight:600;color:#1a1a2e;margin:0">Accede al demo ahora</p>
              <p style="font-size:12px;color:#6b7280;margin:3px 0 0">Explora con datos de prueba</p>
            </div>
            <router-link to="/dashboard" class="btn-demo-link">Ver demo →</router-link>
          </div>
          <button class="btn-main" @click="irA('login')" style="margin-top:16px"><span>Ir al sistema</span><i class="ti ti-arrow-right"></i></button>
        </div>

      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* Los estilos se mantienen intactos, eliminando únicamente las propiedades específicas 
   de .tile-price-free que ya no tienen uso en la interfaz. */
.root {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
  background: #060d1f;
  font-family: 'Inter', -apple-system, sans-serif;
}
.canvas-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.gradient-overlay {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, rgba(29,78,216,.28) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 90%, rgba(109,40,217,.2) 0%, transparent 55%),
    linear-gradient(170deg, #060d1f 0%, #0c1a38 50%, #080f25 100%);
}
.orb { position: fixed; border-radius: 50%; filter: blur(80px); z-index: 1; pointer-events: none; animation: orbFloat 12s ease-in-out infinite; }
.orb-1 { width: 400px; height: 400px; background: rgba(29,78,216,.15); top: -100px; left: -80px; }
.orb-2 { width: 300px; height: 300px; background: rgba(109,40,217,.12); bottom: -80px; right: -60px; animation-delay: -4s; }
.orb-3 { width: 200px; height: 200px; background: rgba(6,182,212,.1); top: 50%; left: 50%; animation-delay: -8s; }
@keyframes orbFloat {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(30px,-20px) scale(1.05); }
  66% { transform: translate(-20px,15px) scale(.95); }
}
.stage { position: relative; z-index: 10; width: 100%; max-width: 440px; transition: max-width .4s cubic-bezier(.4,0,.2,1); }
.stage--wide { max-width: 860px; }
.glass-card {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 24px; padding: 36px 32px; backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 0 0 1px rgba(255,255,255,.05) inset, 0 32px 80px rgba(0,0,0,.5);
}
.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.brand-icon {
  position: relative; width: 52px; height: 52px;
  background: linear-gradient(135deg, #1d4ed8, #4f46e5);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 24px; flex-shrink: 0; box-shadow: 0 8px 20px rgba(29,78,216,.4);
}
.brand-pulse { position: absolute; inset: -4px; border-radius: 18px; border: 2px solid rgba(99,102,241,.4); animation: pulse 2.5s ease-in-out infinite; }
@keyframes pulse { 0%,100% { transform: scale(1); opacity: .6; } 50% { transform: scale(1.08); opacity: 0; } }
.brand-name { display: block; font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -.4px; line-height: 1; }
.brand-sub { display: block; font-size: 12px; color: rgba(255,255,255,.4); margin-top: 3px; }
.divider-line { height: 1px; background: rgba(255,255,255,.07); margin-bottom: 24px; }
.screen-title { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 6px; letter-spacing: -.4px; }
.screen-sub { font-size: 13px; color: rgba(255,255,255,.4); margin: 0 0 24px; }
.field-group { margin-bottom: 16px; }
.field-label { display: block; font-size: 12px; font-weight: 500; color: rgba(255,255,255,.5); margin-bottom: 7px; letter-spacing: .3px; text-transform: uppercase; }
.field-wrap { position: relative; display: flex; align-items: center; }
.field-icon { position: absolute; left: 13px; font-size: 16px; color: rgba(255,255,255,.3); pointer-events: none; }
.field-input {
  width: 100%; padding: 12px 14px 12px 40px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 10px; color: #fff; font-size: 14px; font-family: inherit;
  outline: none; transition: border-color .2s, background .2s, box-shadow .2s; box-sizing: border-box;
}
.field-input::placeholder { color: rgba(255,255,255,.25); }
.field-input:focus { border-color: rgba(99,102,241,.6); background: rgba(255,255,255,.09); box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
.field-toggle { position: absolute; right: 12px; background: none; border: none; color: rgba(255,255,255,.35); cursor: pointer; font-size: 16px; padding: 4px; transition: color .2s; display: flex; }
.field-toggle:hover { color: rgba(255,255,255,.7); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.strength-bar { height: 3px; background: rgba(255,255,255,.08); border-radius: 2px; margin-top: 8px; overflow: hidden; }
.strength-fill { height: 100%; border-radius: 2px; transition: width .4s ease, background .4s ease; }
.error-msg { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25); color: #fca5a5; font-size: 13px; padding: 10px 14px; border-radius: 8px; display: flex; align-items: center; gap: 7px; margin-bottom: 12px; }
.forgot-row { text-align: right; margin-bottom: 20px; margin-top: -8px; }
.link-ghost { font-size: 12px; color: rgba(255,255,255,.35); cursor: pointer; transition: color .2s; }
.link-ghost:hover { color: rgba(255,255,255,.7); }
.btn-main {
  width: 100%; padding: 13px 20px;
  background: linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%);
  color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
  cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center;
  gap: 8px; transition: transform .15s, box-shadow .15s, filter .15s;
  box-shadow: 0 4px 20px rgba(79,70,229,.4); letter-spacing: -.1px;
}
.btn-main:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(79,70,229,.5); filter: brightness(1.08); }
.btn-main:disabled { opacity: .6; cursor: not-allowed; }
.btn-main--compact { width: auto; padding: 12px 24px; font-size: 14px; }
.register-prompt { text-align: center; font-size: 13px; color: rgba(255,255,255,.35); margin: 0; }
.link-accent { color: #93c5fd; cursor: pointer; font-weight: 500; transition: color .2s; }
.link-accent:hover { color: #60a5fa; text-decoration: underline; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.55); font-size: 13px; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-family: inherit; margin-bottom: 20px; transition: background .2s, color .2s; }
.back-btn:hover { background: rgba(255,255,255,.12); color: rgba(255,255,255,.9); }
.back-btn--ghost { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.08); }
.progress-bar { display: flex; align-items: center; gap: 8px; }
.progress-step { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.progress-step--done { background: rgba(34,197,94,.15); color: #4ade80; border: 1px solid rgba(34,197,94,.3); }
.progress-step--active { background: linear-gradient(135deg, #1d4ed8, #4f46e5); color: #fff; }
.progress-track { flex: 1; height: 3px; background: rgba(255,255,255,.08); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #1d4ed8, #4f46e5); border-radius: 2px; }
.planes-wrap { display: flex; flex-direction: column; align-items: center; width: 100%; }
.planes-head { text-align: center; margin-bottom: 36px; }
.planes-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.35); display: block; margin-bottom: 10px; }
.planes-title { font-size: 36px; font-weight: 800; color: #fff; margin: 0 0 8px; letter-spacing: -1px; }
.planes-desc { font-size: 14px; color: rgba(255,255,255,.35); margin: 0; }
.planes-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; width: 100%; margin-bottom: 24px; }
.plan-tile { background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.09); border-radius: 20px; padding: 24px 20px; cursor: pointer; position: relative; transition: border-color .2s, background .2s, transform .2s, box-shadow .2s; overflow: visible; }
.plan-tile:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.2); transform: translateY(-4px); }
.plan-tile--popular { background: rgba(255,255,255,.95); border-color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,.4); }
.plan-tile--popular:hover { background: #fff; transform: translateY(-6px); }
.plan-tile--selected:not(.plan-tile--popular) { border-color: rgba(99,102,241,.7); background: rgba(99,102,241,.1); box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
.tile-top-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #1d4ed8, #4f46e5); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 14px; border-radius: 20px; white-space: nowrap; display: flex; align-items: center; gap: 5px; }
.tile-icon-wrap { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 14px; }
.tile-name { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 4px; }
.plan-tile--popular .tile-name { color: #0f172a; }
.tile-desc { font-size: 12px; color: rgba(255,255,255,.4); margin: 0 0 18px; line-height: 1.5; }
.plan-tile--popular .tile-desc { color: #64748b; }
.tile-price { display: flex; align-items: baseline; gap: 2px; margin-bottom: 20px; }
.tile-currency { font-size: 16px; font-weight: 600; color: rgba(255,255,255,.5); }
.plan-tile--popular .tile-currency { color: #94a3b8; }
.tile-amount { font-size: 40px; font-weight: 800; color: #fff; line-height: 1; letter-spacing: -1.5px; }
.plan-tile--popular .tile-amount { color: #1a3c5e; }
.tile-period { font-size: 13px; color: rgba(255,255,255,.35); }
.plan-tile--popular .tile-period { color: #94a3b8; }
.tile-features { list-style: none; padding: 0; margin: 0 0 20px; border-top: 1px solid rgba(255,255,255,.07); padding-top: 16px; }
.plan-tile--popular .tile-features { border-color: #e2e8f0; }
.tile-features li { font-size: 12.5px; display: flex; align-items: center; gap: 8px; padding: 5px 0; }
.feat--ok { color: rgba(255,255,255,.7); }
.feat--ok i { color: #4ade80; font-size: 13px; }
.feat--no { color: rgba(255,255,255,.2); }
.feat--no i { color: rgba(255,255,255,.15); font-size: 13px; }
.plan-tile--popular .feat--ok { color: #334155; }
.plan-tile--popular .feat--ok i { color: #1a3c5e; }
.plan-tile--popular .feat--no { color: #cbd5e1; }
.tile-check { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center; font-size: 11px; color: transparent; margin-left: auto; transition: all .2s; }
.plan-tile--popular .tile-check { border-color: #cbd5e1; }
.tile-check--active { background: linear-gradient(135deg, #1d4ed8, #4f46e5); border-color: transparent; color: #fff; }
.planes-footer { width: 100%; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; backdrop-filter: blur(12px); }
.planes-footer-info { display: flex; align-items: center; gap: 6px; font-size: 14px; }
.footer-plan-label { color: rgba(255,255,255,.35); }
.footer-plan-name { color: #fff; font-weight: 600; }
.footer-plan-price { color: rgba(255,255,255,.5); }
.pago-hero { display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
.pago-lock { width: 48px; height: 48px; background: linear-gradient(135deg, #1d4ed8, #4f46e5); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; flex-shrink: 0; }
.pago-plan-name { font-size: 16px; font-weight: 700; color: #fff; margin: 0; }
.pago-plan-price { font-size: 13px; color: rgba(255,255,255,.4); margin: 3px 0 0; }
.secure-badges { display: flex; gap: 8px; margin-bottom: 20px; }
.secure-badges span { display: flex; align-items: center; gap: 5px; font-size: 11px; color: rgba(255,255,255,.4); background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.07); padding: 5px 10px; border-radius: 20px; }
.loading-overlay { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 24px; color: rgba(255,255,255,.6); font-size: 14px; }
.spinner { width: 32px; height: 32px; border: 2.5px solid rgba(255,255,255,.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
.spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.opacity-0 { opacity: 0; pointer-events: none; }
.exito-card { text-align: center; }
.exito-animation { position: relative; width: 90px; height: 90px; margin: 0 auto; }
.exito-check-circle { position: absolute; inset: 0; background: linear-gradient(135deg, #16a34a, #4ade80); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #fff; box-shadow: 0 8px 24px rgba(22,163,74,.4); animation: popIn .5s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.exito-ring { position: absolute; border-radius: 50%; border: 2px solid rgba(74,222,128,.3); animation: ringExpand 2s ease-out infinite; }
.exito-ring-1 { inset: 0; animation-delay: .3s; }
.exito-ring-2 { inset: -12px; animation-delay: .6s; }
.exito-ring-3 { inset: -24px; animation-delay: .9s; }
@keyframes ringExpand { 0% { transform: scale(.8); opacity: .7; } 100% { transform: scale(1.5); opacity: 0; } }
.ecf-badge { display: flex; align-items: center; gap: 12px; background: rgba(29,78,216,.15); border: 1px solid rgba(99,102,241,.25); border-radius: 12px; padding: 14px 16px; margin: 16px 0; text-align: left; font-size: 20px; color: #93c5fd; }
.demo-tile { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 12px; padding: 14px; text-align: left; }
.demo-tile-icon { width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #1d4ed8; flex-shrink: 0; }
.btn-demo-link { margin-left: auto; background: #1a3c5e; color: #fff; padding: 8px 14px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
.slide-enter-active, .slide-leave-active { transition: all .28s cubic-bezier(.4,0,.2,1); }
.slide-enter-from { opacity: 0; transform: translateY(16px) scale(.98); }
.slide-leave-to { opacity: 0; transform: translateY(-12px) scale(.98); }
@media (max-width: 720px) {
  .planes-grid { grid-template-columns: 1fr; }
  .stage--wide { max-width: 440px; }
  .planes-footer { flex-direction: column; }
  .planes-footer .btn-main--compact { width: 100%; justify-content: center; }
}
@media (max-width: 480px) {
  .root { padding: 1rem; }
  .glass-card { padding: 24px 20px; }
  .field-row { grid-template-columns: 1fr; }
}
</style>