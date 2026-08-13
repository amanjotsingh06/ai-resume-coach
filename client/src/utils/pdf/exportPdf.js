/**
 * exportPdf.js
 * ────────────
 * PDF file export service using html2pdf.js.
 *
 * Automatically generates and triggers a direct browser download of the
 * report as a PDF file (e.g. AI-Resume-Coach-Role-Name.pdf) without opening
 * any browser print dialog.
 */

import html2pdf from 'html2pdf.js';
import { generateReportFilename } from './sanitizeFilename';

/**
 * Trigger a direct .pdf file download in the user's browser.
 *
 * @param {HTMLElement} element - Target DOM node (e.g. <PrintableReport />)
 * @param {{ resume_name?: string, job_title?: string }} metadata - Report metadata
 * @returns {Promise<void>}
 */
export async function downloadReportPdf(element, metadata = {}) {
  if (!element) {
    throw new Error('Report element is unavailable for PDF generation');
  }

  const filename = generateReportFilename(metadata);

  const opt = {
    margin: [10, 10, 10, 10], // 10mm margins on all sides
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,           // 2x scale for crisp high-resolution rendering
      useCORS: true,
      logging: false,
      windowWidth: 800,   // Match A4 portrait layout width (~794px at 96dpi)
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  return html2pdf().set(opt).from(element).save();
}
