import { useState, useRef, useCallback } from 'react';
import { uploadResume } from '../../services/api';
import styles from './FileUpload.module.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validatePdf(file) {
  if (!file) return 'No file selected.';
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Only PDF files are accepted.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large (${formatBytes(file.size)}). Max allowed: 5 MB.`;
  }
  return null; // valid
}

// ─── UploadIcon (idle / dragover) ─────────────────────────────────────────────
function UploadIcon({ active }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v11M12 3L8.5 6.5M12 3l3.5 3.5"
        stroke={active ? '#6366F1' : '#6366F1'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 16v2a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-2"
        stroke={active ? '#6366F1' : '#94A3B8'}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── FileUpload ────────────────────────────────────────────────────────────────
/**
 * Props
 * ─────
 * onUploadSuccess(resumeText: string, filename: string) — called on success (and
 * also on Remove with empty strings to reset parent state).
 */
export default function FileUpload({ onUploadSuccess }) {
  /**
   * status: 'idle' | 'dragover' | 'uploading' | 'success' | 'error'
   */
  const [status, setStatus]     = useState('idle');
  const [filename, setFilename] = useState('');
  const [filesize, setFilesize] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const fileInputRef      = useRef(null);
  const progressTimerRef  = useRef(null);

  // ── fake progress that advances to ~88% then waits for API ──
  const startFakeProgress = () => {
    setProgress(0);
    let pct = 0;
    progressTimerRef.current = setInterval(() => {
      pct += Math.random() * 10 + 2;
      if (pct >= 88) {
        clearInterval(progressTimerRef.current);
        setProgress(88);
      } else {
        setProgress(Math.min(Math.round(pct), 88));
      }
    }, 180);
  };

  const stopFakeProgress = () => {
    clearInterval(progressTimerRef.current);
    progressTimerRef.current = null;
  };

  // ── core upload handler ──
  const handleFile = useCallback(
    async (file) => {
      const err = validatePdf(file);
      if (err) {
        setFilename(file?.name ?? '');
        setErrorMsg(err);
        setStatus('error');
        return;
      }

      setFilename(file.name);
      setFilesize(formatBytes(file.size));
      setStatus('uploading');
      startFakeProgress();

      try {
        const { data } = await uploadResume(file);
        stopFakeProgress();
        setProgress(100);

        // brief pause so the bar can animate to 100%
        await new Promise((r) => setTimeout(r, 320));

        setStatus('success');
        onUploadSuccess(data.data.text, file.name);
      } catch (apiErr) {
        stopFakeProgress();
        const errData = apiErr.response?.data?.error;
        const msg =
          (typeof errData === 'object' ? errData.message : errData) ||
          apiErr.message ||
          'Upload failed. Please try again.';
        setErrorMsg(msg);
        setStatus('error');
      }
    },
    [onUploadSuccess],
  );

  // ── drag events ──
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== 'uploading' && status !== 'success') {
      setStatus('dragover');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'dragover') setStatus('idle');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'uploading' || status === 'success') return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
    else setStatus('idle');
  };

  // ── click → hidden input ──
  const handleZoneClick = () => {
    if (status === 'uploading' || status === 'success') return;
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so the same file can be re-selected after an error
    e.target.value = '';
  };

  // ── remove ──
  const handleRemove = () => {
    stopFakeProgress();
    setStatus('idle');
    setFilename('');
    setFilesize('');
    setErrorMsg('');
    setProgress(0);
    onUploadSuccess('', '');
  };

  // ── derived flags ──
  const isIdle      = status === 'idle';
  const isDragover  = status === 'dragover';
  const isUploading = status === 'uploading';
  const isSuccess   = status === 'success';
  const isError     = status === 'error';

  // ── zone CSS class composition ──
  const zoneClass = [
    styles.dropZone,
    isDragover  ? styles.dragover  : '',
    isUploading ? styles.uploading : '',
    isError     ? styles.error     : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrapper}>
      {/* ── Drop zone — hidden when success ── */}
      {!isSuccess && (
        <div
          id="resume-drop-zone"
          className={zoneClass}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleZoneClick}
          role="button"
          tabIndex={0}
          aria-label="Upload resume — drag and drop or click to browse"
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleZoneClick()}
        >
          {/* hidden real file input */}
          <input
            ref={fileInputRef}
            id="resume-file-input"
            type="file"
            accept="application/pdf,.pdf"
            className={styles.hiddenInput}
            onChange={handleInputChange}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* ── IDLE / DRAGOVER content ── */}
          {(isIdle || isDragover) && (
            <>
              <div className={`${styles.iconWrap} ${isDragover ? styles.iconWrapDragover : ''}`}>
                <UploadIcon active={isDragover} />
              </div>
              <p className={styles.dropTitle}>
                {isDragover ? 'Release to upload' : 'Drop your resume here'}
              </p>
              <p className={styles.dropSubtitle}>or click to browse</p>
              <p className={styles.dropHint}>PDF only · Max 5MB</p>
            </>
          )}

          {/* ── UPLOADING content ── */}
          {isUploading && (
            <div className={styles.uploadingContent}>
              <div className={styles.uploadingIcon}>
                <svg
                  className={styles.spinIcon}
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="Uploading…"
                >
                  <circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="2" strokeOpacity="0.18" />
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12"
                    stroke="#6366F1"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className={styles.uploadingFilename}>{filename}</p>
              <p className={styles.uploadingLabel}>Uploading &amp; extracting text…</p>
              <div className={styles.progressTrack} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.progressPct}>{progress}%</p>
            </div>
          )}

          {/* ── ERROR content ── */}
          {isError && (
            <>
              <div className={styles.errorIcon}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="#F43F5E" strokeWidth="1.5" />
                  <path d="M12 8v4M12 16h.01" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className={styles.errorTitle}>Upload failed</p>
              <p className={styles.errorMsg}>{errorMsg}</p>
              <p className={styles.retryHint}>Click to try again</p>
            </>
          )}
        </div>
      )}

      {/* ── SUCCESS card ── */}
      {isSuccess && (
        <div className={styles.successCard} role="status" aria-live="polite">
          <div className={styles.successIconWrap} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8L14 2Z"
                stroke="#84CC16"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M9 15l2 2 4-4"
                stroke="#84CC16"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className={styles.successInfo}>
            <p className={styles.successFilename} title={filename}>{filename}</p>
            <p className={styles.successFilesize}>{filesize}</p>
          </div>

          <button
            id="resume-remove-btn"
            className={styles.removeBtn}
            onClick={handleRemove}
            aria-label={`Remove ${filename}`}
            type="button"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
