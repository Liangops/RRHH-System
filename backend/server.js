import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import empleadosRouter from './routes/empleado.js'
import departamentoRouter from './routes/departamento.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error:', err))

app.use('/api/empleados', empleadosRouter)
app.use('/api/departamentos', departamentoRouter)

app.listen(process.env.PORT, () => console.log(`🚀 Puerto ${process.env.PORT}`))

process.on('uncaughtException', (err) => {
  console.error('Error capturado:', err.message)
})