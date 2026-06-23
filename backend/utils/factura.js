import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'

const EMPRESA = {
  nombre: 'RRHH SYSTEMS IA',
  rnc: '132907401',
  direccion: 'Santiago',
  telefono: '829-282-7556',
  correo: process.env.GMAIL_USER,
}

export async function generarFacturaPDF({ comprador, plan, monto, orderID, eNCF, dgiiUrl, codigoSeguridad, fecha }) {
  return new Promise(async (resolve, reject) => {
    const chunks = []
    const doc = new PDFDocument({ size: 'LETTER', margin: 43 })

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const L = doc.page.margins.left
    const R = doc.page.width - doc.page.margins.right
    const W = R - L

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

    y += 16
    doc.moveTo(L, y).lineTo(R, y).strokeColor('black').lineWidth(1).stroke()
    y += 10

    doc.font('Helvetica-Bold').fontSize(9).text('Cliente: ', L, y, { continued: true })
    doc.font('Helvetica').text(comprador.nombre || '')
    doc.font('Helvetica-Bold').fontSize(9).text('Tipo de Pago: ', R - 160, y, { continued: true })
    doc.font('Helvetica').text('Contado')

    y += 13
    doc.font('Helvetica-Bold').fontSize(9).text('RNC/Cédula: ', L, y, { continued: true })
    doc.font('Helvetica').text(comprador.rnc || '000000000')

    y += 16
    doc.moveTo(L, y).lineTo(R, y).strokeColor('black').lineWidth(1).stroke()
    y += 10

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

    const qrData = dgiiUrl || `eNCF:${eNCF}`
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 94, margin: 1 })
    doc.image(qrBuffer, L, y, { width: 94, height: 94 })

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

    y += 104
    doc.font('Helvetica-Bold').fontSize(9).text('Código de Seguridad: ', L, y, { continued: true })
    doc.font('Helvetica').text(codigoSeguridad || '')

    y += 13
    doc.font('Helvetica-Bold').fontSize(9).text('Fecha Firma Digital: ', L, y, { continued: true })
    doc.font('Helvetica').text(fecha || '')

    y += 80
    const midX = L + W / 2
    doc.moveTo(L + 20,    y).lineTo(midX - 20, y).strokeColor('black').lineWidth(0.5).stroke()
    doc.moveTo(midX + 20, y).lineTo(R - 20,    y).strokeColor('black').lineWidth(0.5).stroke()

    y += 5
    doc.font('Helvetica').fontSize(8)
    doc.text('Autorizado Por', L,    y, { width: W / 2, align: 'center' })
    doc.text('Recibido Por',   midX, y, { width: W / 2, align: 'center' })

    doc.end()
  })
}