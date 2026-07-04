import express from 'express';
import Groq from 'groq-sdk';
import Documento from '../models/documento.js';
import InteraccionIA from '../models/interaccionIA.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', verificarToken, async (req, res) => {
  try {
    const { pregunta } = req.body;
    if (!pregunta) return res.status(400).json({ mensaje: 'Pregunta requerida' });

    const documentos = await Documento.find({ activo: true })
      .select('nombre contenidoTexto');

    if (documentos.length === 0) {
      return res.json({
        respuesta: 'No hay documentos en la base de conocimiento. Por favor, sube documentos primero.'
      });
    }

    const contexto = documentos
      .map(d => `=== ${d.nombre} ===\n${(d.contenidoTexto ?? '').substring(0, 3000)}`)
      .join('\n\n');

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `Eres un asistente de Recursos Humanos de la empresa. 
Responde ÚNICAMENTE basándote en los documentos internos que se te proporcionan.
Si la respuesta no está en los documentos, indícalo claramente con: "No encontré información sobre ese tema en los documentos disponibles."
Responde siempre en español, de forma clara y profesional.

DOCUMENTOS DE LA EMPRESA:
${contexto}`
        },
        {
          role: 'user',
          content: pregunta
        }
      ]
    });

    const respuesta = response.choices[0].message.content;

    // Guardar la interacción para poder medir uso de IA por usuario
    InteraccionIA.create({
      usuarioId: req.usuario.id,
      pregunta,
      respuesta
    }).catch(err => console.error('Error guardando interacción IA:', err.message));

    res.json({ respuesta });

  } catch (error) {
    console.error('Error Groq:', error);
    res.status(500).json({ mensaje: 'Error al consultar la IA' });
  }
});

export default router;