import mammoth from 'mammoth';
import xlsx from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function extraerTexto(buffer, tipoArchivo) {
  switch (tipoArchivo) {
    case 'pdf': {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const pdf = await loadingTask.promise;
      let texto = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texto += content.items.map(item => item.str).join(' ') + '\n';
      }
      return texto;
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case 'txt': {
      return buffer.toString('utf-8');
    }
    case 'xlsx': {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let texto = '';
      workbook.SheetNames.forEach(sheet => {
        const ws = workbook.Sheets[sheet];
        texto += xlsx.utils.sheet_to_csv(ws) + '\n';
      });
      return texto;
    }
    default:
      return '';
  }
}