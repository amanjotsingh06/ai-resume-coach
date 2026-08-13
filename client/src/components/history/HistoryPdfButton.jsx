/**
 * HistoryPdfButton.jsx
 * ────────────────────
 * Standalone "Download PDF" button for use inside AnalysisCard (history view).
 *
 * Hybrid strategy:
 *  - Mobile (iOS/Android): Direct file download via html2pdf.js directly to Files/Downloads.
 *  - Desktop: Vector PDF print/save modal via react-to-print.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import PrintableReport from '../report/PrintableReport';
import { downloadReportPdf } from '../../utils/pdf/exportPdf';
import { generateReportFilename } from '../../utils/pdf/sanitizeFilename';
import { getAnalysis } from '../../services/api';

export default function HistoryPdfButton({ analysisId, resumeName, jobTitle }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fullData, setFullData]   = useState(null);
  const printRef = useRef(null);

  const getFilename = useCallback(
    () => generateReportFilename({ resume_name: resumeName, job_title: jobTitle }),
    [resumeName, jobTitle]
  );

  const triggerPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: getFilename,
    onBeforePrint: () => Promise.resolve(),
    onAfterPrint: () => {
      setFullData(null);
      setPdfLoading(false);
    },
    onPrintError: (errorLocation, err) => {
      console.error(`[PDF History Print Error at ${errorLocation}]:`, err);
      toast.error('Unable to generate the PDF. Please try again.');
      setFullData(null);
      setPdfLoading(false);
    },
  });

  // Handle hybrid mobile vs desktop export once fullData DOM is ready
  useEffect(() => {
    if (fullData && printRef.current) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      );

      const timer = setTimeout(async () => {
        if (isMobile) {
          try {
            await downloadReportPdf(printRef.current, {
              resume_name: fullData.resume_name || resumeName,
              job_title:   fullData.job_title || jobTitle,
            });
            toast.success('PDF download started!');
          } catch (err) {
            console.error('[PDF History Mobile] Export failed:', err);
            toast.error('Unable to generate PDF. Please try again.');
          } finally {
            setFullData(null);
            setPdfLoading(false);
          }
        } else {
          try {
            triggerPrint();
          } catch (err) {
            console.error('[PDF History Desktop] Print failed:', err);
            toast.error('Unable to generate PDF. Please try again.');
            setFullData(null);
            setPdfLoading(false);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fullData, resumeName, jobTitle, triggerPrint]);

  const handleClick = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (pdfLoading) return;

    if (!analysisId) {
      toast.error('Unable to generate PDF because the report is unavailable.');
      return;
    }

    setPdfLoading(true);
    try {
      const { data } = await getAnalysis(analysisId);
      setFullData(data.data);
    } catch (err) {
      console.error('[PDF History] Fetch failed:', err);
      toast.error('Unable to load the analysis. Please try again.');
      setPdfLoading(false);
    }
  }, [analysisId, pdfLoading]);

  return (
    <>
      <button
        id={`pdf-btn-${analysisId}`}
        onClick={handleClick}
        disabled={pdfLoading}
        aria-busy={pdfLoading}
        aria-label={pdfLoading ? 'Generating PDF…' : 'Download analysis as PDF'}
        title={pdfLoading ? 'Generating PDF…' : 'Download PDF'}
        className={`
          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
          transition-all duration-200 border
          ${pdfLoading
            ? 'bg-transparent text-[#475569] border-[#2D2D3F] cursor-not-allowed'
            : 'bg-transparent text-[#94A3B8] border-[#2D2D3F] hover:border-[#6366F1] hover:text-[#F1F5F9]'
          }
        `}
      >
        {pdfLoading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            PDF…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-xs" aria-hidden="true">download</span>
            PDF
          </>
        )}
      </button>

      {/* Offscreen portal container */}
      {fullData && ReactDOM.createPortal(
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '0px',
            width: '800px',
            background: '#ffffff',
            color: '#1a1a2e',
            zIndex: -9999,
          }}
          aria-hidden="true"
        >
          <PrintableReport ref={printRef} data={fullData} />
        </div>,
        document.body,
      )}
    </>
  );
}
