<script setup>
import { ref, nextTick } from 'vue'

const API = '/api/chat-ia'
const mensajes = ref([])
const pregunta = ref('')
const cargando = ref(false)
const mensajesRef = ref(null)

const token = () => localStorage.getItem('token')

const sugerencias = [
  '¿Cuántos días de vacaciones corresponden?',
  '¿Cuál es la política de permisos?',
  '¿Cómo solicito una licencia médica?',
  '¿Cuáles son las normas de la empresa?'
]

function hora() {
  return new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
}

async function scrollAbajo() {
  await nextTick()
  if (mensajesRef.value) {
    mensajesRef.value.scrollTo({ top: mensajesRef.value.scrollHeight, behavior: 'smooth' })
  }
}

async function enviar() {
  const texto = pregunta.value.trim()
  if (!texto || cargando.value) return
  pregunta.value = ''

  mensajes.value.push({ rol: 'user', contenido: texto, hora: hora() })
  cargando.value = true
  await scrollAbajo()

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token()}`
      },
      body: JSON.stringify({ pregunta: texto })
    })
    const data = await res.json()
    mensajes.value.push({ rol: 'assistant', contenido: data.respuesta, hora: hora() })
  } catch {
    mensajes.value.push({
      rol: 'assistant',
      contenido: 'Error al conectar con la IA. Por favor intenta de nuevo.',
      hora: hora()
    })
  } finally {
    cargando.value = false
    await scrollAbajo()
  }
}

function enviarSugerencia(s) {
  pregunta.value = s
  enviar()
}

function onKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    enviar()
  }
}
</script>

<template>
  <main class="main" id="main-content">

    <!-- Header -->
    <div class="page-header">
      <div>
        <div class="page-title">Asistente IA de RRHH</div>
        <div class="page-subtitle">Consulta políticas y procedimientos de la empresa</div>
      </div>
      <div class="ia-badge">
        <i class="ti ti-robot"></i> Powered by Groq
      </div>
    </div>

    <!-- Chat Container -->
    <div class="card chat-card">

      <!-- Mensajes -->
      <div class="chat-mensajes" ref="mensajesRef">

        <!-- Bienvenida (solo cuando no hay mensajes) -->
        <div v-if="!mensajes.length" class="bienvenida">
          <div class="bot-avatar-lg">
            <i class="ti ti-robot"></i>
          </div>
          <h3 class="bienvenida-titulo">¡Hola! Soy tu asistente de RRHH</h3>
          <p class="bienvenida-sub">
            Respondo basándome exclusivamente en los documentos de la empresa.<br>
            ¿En qué te puedo ayudar hoy?
          </p>
          <div class="sugerencias-grid">
            <button
              v-for="s in sugerencias"
              :key="s"
              class="sugerencia-btn"
              @click="enviarSugerencia(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Mensajes del chat -->
        <div
          v-for="(m, i) in mensajes"
          :key="i"
          class="mensaje-wrapper"
          :class="m.rol === 'user' ? 'mensaje-user' : 'mensaje-assistant'"
        >
          <div v-if="m.rol === 'assistant'" class="bot-avatar">
            <i class="ti ti-robot">

            </i>
          </div>
          <div class="burbuja" :class="m.rol === 'user' ? 'burbuja-user' : 'burbuja-assistant'">
            <p class="burbuja-texto">{{ m.contenido }}</p>
            <span class="burbuja-hora">{{ m.hora }}</span>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="cargando" class="mensaje-wrapper mensaje-assistant">
          <div class="bot-avatar">
            <i class="ti ti-robot">

            </i>
          </div>
          <div class="burbuja burbuja-assistant typing-burbuja">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

      </div>

      <!-- Input -->
      <div class="chat-input-area">
        <textarea
          v-model="pregunta"
          class="chat-textarea"
          placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
          @keydown="onKeydown"
          rows="2"
        />
        <button
          class="btn-send"
          @click="enviar"
          :disabled="cargando || !pregunta.trim()"
          title="Enviar"
        >
          <i class="ti ti-send"></i>
        </button>
      </div>

    </div>
  </main>
</template>

<style scoped>
.main { flex:1; margin-left:218px; padding:28px 28px 60px; }

.page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
.page-title { font-size:18px; font-weight:600; color:#1a1a2e; font-family:'IM Fell English',Georgia,serif; }
.page-subtitle { font-size:13px; color:#6b7280; margin-top:3px; }

.ia-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; background: #1a3c5e; color: #fff;
  border-radius: 20px; font-size: 12px; font-weight: 500;
}

.card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:0; margin-bottom:18px; overflow:hidden; }
.chat-card { display: flex; flex-direction: column; height: calc(100vh - 180px); }

/* Mensajes */
.chat-mensajes {
  flex: 1; overflow-y: auto; padding: 24px 20px;
  display: flex; flex-direction: column; gap: 16px;
  scroll-behavior: smooth;
}

/* Bienvenida */
.bienvenida { text-align: center; margin: auto; max-width: 440px; padding: 20px 0; }
.bot-avatar-lg { font-size: 52px; margin-bottom: 12px; }
.bienvenida-titulo { font-size: 16px; font-weight: 600; color: #1a1a2e; font-family: 'IM Fell English', Georgia, serif; margin-bottom: 8px; }
.bienvenida-sub { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 20px; }
.sugerencias-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.sugerencia-btn {
  padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px;
  background: #f9fafb; font-size: 12px; color: #374151; cursor: pointer;
  text-align: left; transition: all .15s; font-family: inherit;
}
.sugerencia-btn:hover { border-color: #1a3c5e; background: #f0f4f8; color: #1a3c5e; }

/* Burbujas */
.mensaje-wrapper { display: flex; align-items: flex-end; gap: 8px; }
.mensaje-user { flex-direction: row-reverse; }
.mensaje-assistant { flex-direction: row; }

.bot-avatar { font-size: 22px; flex-shrink: 0; margin-bottom: 4px; }

.burbuja { max-width: 70%; padding: 10px 14px; border-radius: 16px; position: relative; }
.burbuja-user {
  background: #1a3c5e; color: #fff;
  border-bottom-right-radius: 4px;
}
.burbuja-assistant {
  background: #f3f4f6; color: #1a1a2e;
  border-bottom-left-radius: 4px;
}

.burbuja-texto { font-size: 13.5px; line-height: 1.55; margin: 0 0 4px; white-space: pre-wrap; }
.burbuja-hora { font-size: 10px; opacity: .6; display: block; text-align: right; }

/* Typing */
.typing-burbuja { display: flex; align-items: center; gap: 5px; padding: 12px 16px; }
.dot {
  width: 7px; height: 7px; background: #9ca3af; border-radius: 50%;
  animation: typing 1.2s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: .2s; }
.dot:nth-child(3) { animation-delay: .4s; }
@keyframes typing { 0%, 80%, 100% { transform: scale(0.7); opacity:.5; } 40% { transform: scale(1); opacity:1; } }

/* Input */
.chat-input-area {
  display: flex; align-items: flex-end; gap: 10px;
  padding: 16px 20px; border-top: 1px solid #e5e7eb;
  background: #fff;
}
.chat-textarea {
  flex: 1; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 12px;
  font-size: 13px; color: #374151; resize: none; outline: none;
  font-family: inherit; line-height: 1.5; transition: border-color .15s;
}
.chat-textarea:focus { border-color: #1a3c5e; box-shadow: 0 0 0 3px rgba(26,60,94,.08); }

.btn-send {
  width: 40px; height: 40px; border-radius: 12px;
  background: #1a3c5e; color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0; transition: all .15s;
}
.btn-send:hover { background: #1d4570; }
.btn-send:disabled { opacity: .45; cursor: not-allowed; }
</style>