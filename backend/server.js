import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import nodemailer from 'nodemailer'
import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

import empleadosRouter from './routes/empleado.js'
import departamentoRouter from './routes/departamento.js'
import expedienteRouter from './routes/expedientes.js'
import permisosVacacionesRouter from './routes/permisos-vacaciones.js'
import Pago from './models/pago.js'
import authRouter from './routes/auth.js'
import adminRouter from './routes/admin.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error MongoDB:', err))

app.use('/api/empleados', empleadosRouter)
app.use('/api/departamentos', departamentoRouter)
app.use('/api/expedientes', expedienteRouter)
app.use('/api/permisosvacaciones', permisosVacacionesRouter)
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

app.listen(process.env.PORT, () =>
  console.log(`Puerto ${process.env.PORT}`)
)

process.on('uncaughtException', (err) => {
  console.error('Error global:', err.message)
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
})

/* =========================
   DATOS DE EMPRESA
========================= */
const EMPRESA = {
  nombre: 'RRHH SYSTEMS IA',
  rnc: '132907401',
  direccion: 'Santiago',
  telefono: '829-282-7556',
  correo: process.env.GMAIL_USER,
}

/* =========================
   GENERAR FACTURA PDF
========================= */
async function generarFacturaPDF({ comprador, plan, monto, orderID, eNCF, dgiiUrl, codigoSeguridad, fecha }) {
  return new Promise(async (resolve, reject) => {
    const chunks = []
    const doc = new PDFDocument({ size: 'LETTER', margin: 43 })

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const L = doc.page.margins.left
    const R = doc.page.width - doc.page.margins.right
    const W = R - L

    // ENCABEZADO
    doc.font('Helvetica-Bold').fontSize(16).text(EMPRESA.nombre, L, 43)
    doc.font('Helvetica-Bold').fontSize(11).text('FACTURA DE CONSUMO ELECTRÓNICA', L, 43, { align: 'right' })
    doc.font('Helvetica-Bold').fontSize(11).text(eNCF || '', L, 59, { align: 'right' })

    let y = 73
    doc.font('Helvetica').fontSize(9).text(EMPRESA.nombre, L, y)

    for (const [label, value] of [
      ['RNC: ', EMPRESA.rnc],
      ['Dirección: ', EMPRESA.direccion],
      ['Teléfono: ', EMPRESA.telefono],
      ['Correo: ', EMPRESA.correo],
      ['Fecha de Emisión: ', fecha],
    ]) {
      y += 13
      doc.font('Helvetica-Bold').fontSize(9).text(label, L, y, { continued: true })
      doc.font('Helvetica').text(value)
    }

    // LÍNEA
    y += 16
    doc.moveTo(L, y).lineTo(R, y).strokeColor('black').lineWidth(1).stroke()
    y += 10

    // CLIENTE
    doc.font('Helvetica-Bold').fontSize(9).text('Cliente: ', L, y, { continued: true })
    doc.font('Helvetica').text(comprador.nombre || '')
    doc.font('Helvetica-Bold').fontSize(9).text('Tipo de Pago: ', R - 160, y, { continued: true })
    doc.font('Helvetica').text('Contado')

    y += 13
    doc.font('Helvetica-Bold').fontSize(9).text('RNC/Cédula: ', L, y, { continued: true })
    doc.font('Helvetica').text(comprador.rnc || '000000000')

    // LÍNEA
    y += 16
    doc.moveTo(L, y).lineTo(R, y).strokeColor('black').lineWidth(1).stroke()
    y += 10

    // ENCABEZADO TABLA
    const cols = {
      cantidad:    { x: L,       w: 65  },
      descripcion: { x: L + 65,  w: 240 },
      precio:      { x: L + 305, w: 75  },
      itbis:       { x: L + 380, w: 60  },
      total:       { x: L + 440, w: 75  },
    }

    doc.font('Helvetica-Bold').fontSize(9)
    doc.text('CANTIDAD',    cols.cantidad.x,    y)
    doc.text('DESCRIPCIÓN', cols.descripcion.x, y)
    doc.text('PRECIO',      cols.precio.x,      y, { width: cols.precio.w,   align: 'right' })
    doc.text('ITBIS',       cols.itbis.x,       y, { width: cols.itbis.w,    align: 'right' })
    doc.text('TOTAL',       cols.total.x,       y, { width: cols.total.w,    align: 'right' })

    y += 14
    doc.moveTo(L, y).lineTo(R, y).strokeColor('black').lineWidth(1).stroke()
    y += 8

    // FILA ÍTEM
    doc.font('Helvetica').fontSize(9)
    doc.text('1',                          cols.cantidad.x,    y)
    doc.text(plan.nombre || 'Suscripción', cols.descripcion.x, y)
    doc.text(monto,                        cols.precio.x,      y, { width: cols.precio.w, align: 'right' })
    doc.text('0.00',                       cols.itbis.x,       y, { width: cols.itbis.w,  align: 'right' })
    doc.font('Helvetica-Bold').text(monto, cols.total.x,       y, { width: cols.total.w,  align: 'right' })

    y += 14
    doc.moveTo(L, y).lineTo(R, y).strokeColor('black').lineWidth(0.5).stroke()
    y += 6

    doc.font('Helvetica').fontSize(8).text('Cantidad Total: 1.00', L, y, { align: 'right', width: W })
    y += 18

    // QR
    const qrData = dgiiUrl || `eNCF:${eNCF}`
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 94, margin: 1 })
    doc.image(qrBuffer, L, y, { width: 94, height: 94 })

    // TOTALES
    const txCol = R - 180
    doc.font('Helvetica').fontSize(9)
    doc.text('Subtotal Gravado', txCol, y)
    doc.text('0.00', txCol, y, { width: 180, align: 'right' })

    y += 16
    doc.text('Monto Exento', txCol, y)
    doc.text(monto, txCol, y, { width: 180, align: 'right' })

    y += 14
    doc.moveTo(txCol, y).lineTo(R, y).strokeColor('black').lineWidth(1).stroke()
    y += 6

    doc.font('Helvetica-Bold').fontSize(11)
    doc.text('TOTAL', txCol, y)
    doc.text(monto, txCol, y, { width: 180, align: 'right' })

    // CÓDIGO DE SEGURIDAD
    y += 104
    doc.font('Helvetica-Bold').fontSize(9).text('Código de Seguridad: ', L, y, { continued: true })
    doc.font('Helvetica').text(codigoSeguridad || '')

    y += 13
    doc.font('Helvetica-Bold').fontSize(9).text('Fecha Firma Digital: ', L, y, { continued: true })
    doc.font('Helvetica').text(fecha || '')

    // FIRMAS
    y += 80
    const midX = L + W / 2
    doc.moveTo(L + 20,    y).lineTo(midX - 20, y).strokeColor('black').lineWidth(0.5).stroke()
    doc.moveTo(midX + 20, y).lineTo(R - 20,    y).strokeColor('black').lineWidth(0.5).stroke()

    y += 5
    doc.font('Helvetica').fontSize(8)
    doc.text('Autorizado Por', L,     y, { width: W / 2, align: 'center' })
    doc.text('Recibido Por',   midX,  y, { width: W / 2, align: 'center' })

    doc.end()
  })
}

/* =========================
   PLANTILLA DE CORREO HTML
========================= */
function construirCorreoHtml({ comprador, plan, monto, orderID, eNCF, dgiiUrl, codigoSeguridad, fecha }) {

  const filaComprobante = eNCF ? `
        <tr>
          <td style="padding:9px 0; color:#64748b; font-size:13px; border-top:1px solid #e2e8f0;">Comprobante fiscal (eNCF)</td>
          <td style="padding:9px 0; color:#0f172a; font-size:13px; font-weight:600; text-align:right; border-top:1px solid #e2e8f0;">${eNCF}</td>
        </tr>` : ''

  const filaSeguridad = (eNCF && codigoSeguridad) ? `
        <tr>
          <td style="padding:9px 0; color:#64748b; font-size:13px; border-top:1px solid #e2e8f0;">Código de seguridad</td>
          <td style="padding:9px 0; color:#0f172a; font-size:13px; font-weight:600; text-align:right; border-top:1px solid #e2e8f0;">${codigoSeguridad}</td>
        </tr>` : ''

  const enlaceVerificacion = (eNCF && dgiiUrl) ? `
        <tr>
          <td colspan="2" style="padding:14px 0 0;">
            <a href="${dgiiUrl}" target="_blank" style="font-size:13px; color:#2563eb; text-decoration:none; font-weight:600;">Verificar comprobante en la DGII &rarr;</a>
          </td>
        </tr>` : ''

  const avisoFiscalPendiente = !eNCF ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td bgcolor="#fffbeb" style="background-color:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:14px 16px; font-size:13px; color:#92400e; line-height:1.5;">
          Tu comprobante fiscal electrónico (e-CF) está siendo procesado. Te lo haremos llegar por separado en cuanto la DGII lo confirme.
        </td>
      </tr>
    </table>` : ''

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Confirmación de pago — RRHH SYSTEMS IA</title>
</head>
<body style="margin:0; padding:0; background-color:#eef1f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef1f5" style="background-color:#eef1f5;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <tr>
          <td bgcolor="#0f172a" style="background-color:#0f172a; border-radius:14px 14px 0 0; padding:28px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#ffffff; font-size:20px; font-weight:700;">RRHH SYSTEMS IA</td>
                <td align="right">
                  <span style="display:inline-block; background-color:#dcfce7; color:#15803d; font-size:12px; font-weight:700; padding:6px 14px; border-radius:999px;">Pago confirmado</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td bgcolor="#ffffff" style="background-color:#ffffff; padding:32px;">
            <p style="margin:0 0 6px; font-size:14px; color:#64748b; font-family:Arial, Helvetica, sans-serif;">Hola${comprador?.nombre ? ', ' + comprador.nombre : ''},</p>
            <h1 style="margin:0 0 16px; font-size:19px; color:#0f172a; font-family:Arial, Helvetica, sans-serif;">Hemos recibido tu pago correctamente</h1>
            <p style="margin:0 0 12px; font-size:14px; line-height:1.6; color:#334155; font-family:Arial, Helvetica, sans-serif;">
              Gracias por tu suscripción. ${eNCF ? 'Adjunto a este correo encontrarás el PDF y el archivo XML de tu comprobante fiscal electrónico (e-CF).' : 'Tu comprobante fiscal electrónico aún está en proceso; lo recibirás por separado en cuanto la DGII lo confirme.'}
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; margin-top:18px;">
              <tr><td style="padding:20px 20px 4px; font-family:Arial, Helvetica, sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:9px 0; color:#64748b; font-size:13px;">Plan</td>
                    <td style="padding:9px 0; color:#0f172a; font-size:13px; font-weight:600; text-align:right;">${plan?.nombre ?? '—'}</td>
                  </tr>
                  <tr>
                    <td style="padding:9px 0; color:#64748b; font-size:13px; border-top:1px solid #e2e8f0;">Monto</td>
                    <td style="padding:9px 0; color:#0f172a; font-size:13px; font-weight:600; text-align:right; border-top:1px solid #e2e8f0;">US$ ${monto}</td>
                  </tr>
                  <tr>
                    <td style="padding:9px 0; color:#64748b; font-size:13px; border-top:1px solid #e2e8f0;">Fecha</td>
                    <td style="padding:9px 0; color:#0f172a; font-size:13px; font-weight:600; text-align:right; border-top:1px solid #e2e8f0;">${fecha}</td>
                  </tr>
                  <tr>
                    <td style="padding:9px 0; color:#64748b; font-size:13px; border-top:1px solid #e2e8f0;">Orden PayPal</td>
                    <td style="padding:9px 0; color:#0f172a; font-size:13px; font-weight:600; text-align:right; border-top:1px solid #e2e8f0;">${orderID}</td>
                  </tr>
                  ${filaComprobante}
                  ${filaSeguridad}
                  ${enlaceVerificacion}
                </table>
              </td></tr>
            </table>

            ${avisoFiscalPendiente}

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              <tr>
                <td bgcolor="#eff6ff" style="background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:14px 16px; font-size:13px; color:#1e3a8a; line-height:1.55; font-family:Arial, Helvetica, sans-serif;">
                  Nuestro equipo técnico estará revisando tu solicitud y te contactará en los próximos minutos o dentro de las próximas horas/días, dependiendo del proceso de validación y activación de tu cuenta.
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 0; font-size:12px; color:#94a3b8; font-family:Arial, Helvetica, sans-serif;">
              Este correo fue generado automáticamente. Si tienes alguna pregunta sobre tu pago, contáctanos respondiendo este mensaje.
            </p>
          </td>
        </tr>

        <tr>
          <td bgcolor="#0f172a" style="background-color:#0f172a; border-radius:0 0 14px 14px; padding:16px 32px; text-align:center;">
            <p style="margin:0; font-size:11px; color:#94a3b8; font-family:Arial, Helvetica, sans-serif;">RRHH SYSTEMS IA &middot; Santiago, República Dominicana</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

/* =========================
   PAYPAL + DGII FLOW
========================= */
app.post('/api/verificar-pago', async (req, res) => {

  const { orderID, plan, comprador } = req.body

  let monto, fechaHora, fechaSolo

  try {
    const tokenRes = await fetch(
      'https://api-m.sandbox.paypal.com/v1/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      }
    )

    const tokenData = await tokenRes.json()
    const accessToken = tokenData.access_token

    const orderRes = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    )

    const orderData = await orderRes.json()

    if (orderData.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Pago no completado' })
    }

    monto = parseFloat(orderData.purchase_units[0].amount.value).toFixed(2)

    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    fechaHora = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    fechaSolo = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`

  } catch (paypalErr) {
    console.error('❌ ERROR VALIDANDO PAYPAL:', paypalErr)
    return res.status(500).json({ error: 'No se pudo validar el pago con PayPal' })
  }

  let eNCF = null
  let dgiiUrl = null
  let codigoSeguridad = null
  let xmlUrl = null

  try {
    const ecfRes = await fetch(
      'https://ecf-platform-backend-50801509587.us-central1.run.app/api/v1/ecf/send',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ECF_API_KEY
        },
        body: JSON.stringify({
          ECF: {
            Encabezado: {
              Version: '1.0',
              IdDoc: {
                TipoeCF: '32',
                IndicadorEnvioDiferido: '1',
                IndicadorMontoGravado: '0',
                IndicadorServicioTodoIncluido: '1',
                TipoIngresos: '01',
                TipoPago: '1',
                TablaFormasPago: {
                  FormaDePago: [{ FormaPago: 1, MontoPago: monto }]
                }
              },
              Comprador: {
                RNCComprador: '000000000',
                RazonSocialComprador: comprador.nombre,
                CorreoComprador: comprador.correo
              },
              Totales: {
                MontoGravadoTotal: '0.00',
                MontoGravadoI1: '0.00',
                MontoExento: monto,
                ITBIS1: '18',
                TotalITBIS: '0.00',
                TotalITBIS1: '0.00',
                MontoTotal: monto
              }
            },
            DetallesItems: {
              Item: [{
                NumeroLinea: '1',
                IndicadorFacturacion: 4,
                NombreItem: plan.nombre || 'Suscripción',
                IndicadorBienoServicio: 2,
                CantidadItem: '1',
                UnidadMedida: 'Und',
                PrecioUnitarioItem: monto,
                DescuentoMonto: '0.00',
                MontoItem: monto
              }]
            },
            FechaHoraFirma: fechaHora
          }
        })
      }
    )

    const ecfData = await ecfRes.json()
    

    const eNCFRecibido = ecfData?.eNCF || ecfData?.encf || null
    const estado = ecfData?.estado || null

    if (!eNCFRecibido) {
      console.error('❌ No se recibió eNCF en la respuesta de la DGII')
    } else if (estado !== 'Aceptado') {
      console.error(`⚠️ e-CF ${eNCFRecibido} procesado con estado "${estado}".`, ecfData?.responseJson?.at(-1)?.data?.mensajes)
    } else {
      eNCF = eNCFRecibido
      dgiiUrl = ecfData?.dgiiUrl || null
      codigoSeguridad = ecfData?.codigoSeguridad || null
      xmlUrl = ecfData?.xmlUrl || null
    }

    if (eNCF) {
      const aprobacionRes = await fetch(
        'https://ecf-platform-backend-50801509587.us-central1.run.app/api/v1/ecf/aprobacion-comercial/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.ECF_API_KEY
          },
          body: JSON.stringify({
            eNCF,
            FechaEmision: fechaSolo,
            MontoTotal: Number(monto),
            RNCComprador: '000000000',
            Estado: '1',
            FechaHoraAprobacionComercial: fechaHora
          })
        }
      )
      if (!aprobacionRes.ok) {
        console.error('❌ Error en aprobación comercial:', await aprobacionRes.text())
      }
    }

  } catch (ecfErr) {
    console.error('❌ ERROR GENERANDO e-CF (el pago sí se confirmó):', ecfErr)
  }

  const datosRecibo = { comprador, plan, monto, orderID, eNCF, codigoSeguridad, dgiiUrl, fecha: fechaSolo }
  const attachments = []

  try {
  await Pago.create({
    nombre:          comprador.nombre,
    correo:          comprador.correo,
    rnc:             comprador.rnc || '000000000',
    plan:            plan.nombre,
    monto,
    orderID,
    eNCF,
    codigoSeguridad,
    dgiiUrl,
    facturaGenerada: !!eNCF,
    fecha:           fechaSolo,
  })
  console.log('✅ Pago guardado en MongoDB')
} catch (dbErr) {
  console.error('❌ Error guardando pago en MongoDB:', dbErr.message)
}

  // Adjuntar PDF de factura siempre
  try {
    const pdfBuffer = await generarFacturaPDF(datosRecibo)
    attachments.push({
      filename: `factura-${eNCF || orderID}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    })
  } catch (pdfErr) {
    console.error('❌ Error generando PDF de factura:', pdfErr)
  }

  // Adjuntar XML del e-CF si está disponible
  if (eNCF && xmlUrl) {
    try {
      const xmlRes = await fetch(xmlUrl, { headers: { 'X-API-Key': process.env.ECF_API_KEY } })
      if (xmlRes.ok) {
        const xmlText = await xmlRes.text()
        attachments.push({
          filename: `${eNCF}.xml`,
          content: xmlText,
          contentType: 'application/xml'
        })
      } else {
        console.error('❌ No se pudo descargar el XML del e-CF:', xmlRes.status)
      }
    } catch (xmlErr) {
      console.error('❌ Error descargando XML del e-CF:', xmlErr)
    }
  }

  try {
    const info = await transporter.sendMail({
      from: `"RRHH SYSTEMS IA — Pagos" <${process.env.GMAIL_USER}>`,
      to: comprador.correo,
      subject: eNCF
        ? `Confirmación de pago y comprobante fiscal — Plan ${plan.nombre}`
        : `Confirmación de pago — Plan ${plan.nombre}`,
      html: construirCorreoHtml(datosRecibo),
      attachments
    })
    console.log('✅ Email enviado:', info.messageId)
  } catch (emailErr) {
    console.error('❌ Error email:', emailErr)
  }

  res.json({
    ok: true,
    pagoConfirmado: true,
    eNCF,
    facturaFiscalGenerada: !!eNCF
  })
})