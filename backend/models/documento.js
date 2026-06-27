import mongoose from 'mongoose';

const documentoSchema = new mongoose.Schema({
  nombre:           String,
  tipoArchivo:      String,
  contenidoTexto:   String,      // Para la IA
  urlCloudinary:    String,      // URL de descarga
  publicIdCloudinary: String,    // Para poder eliminarlo de Cloudinary
  tamaño:           Number,
  subidoPor:        { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  nombreSubidoPor:  String,
  activo:           { type: Boolean, default: true },
  fechaSubida:      { type: Date, default: Date.now }
});

export default mongoose.model('Documento', documentoSchema);