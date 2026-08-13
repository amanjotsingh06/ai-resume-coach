import styles from './JobDescriptionInput.module.css';

const MAX_CHARS = 5000;

/**
 * JobDescriptionInput
 * ───────────────────
 * Props
 *   value    : string  — controlled value from parent
 *   onChange : (newValue: string) => void
 */
export default function JobDescriptionInput({ value = '', onChange }) {
  const remaining = MAX_CHARS - value.length;

  // determine counter style variant
  const counterClass = (() => {
    if (value.length >= MAX_CHARS)  return `${styles.charCount} ${styles.charCountFull}`;
    if (remaining <= 300)           return `${styles.charCount} ${styles.charCountWarn}`;
    return styles.charCount;
  })();

  const handleChange = (e) => {
    // enforce hard cap — slice in case something pasted beyond limit
    const next = e.target.value.slice(0, MAX_CHARS);
    onChange(next);
  };

  return (
    <div className={styles.wrapper}>
      {/* Label row */}
      <div className={styles.labelRow}>
        <label htmlFor="job-description-textarea" className={styles.label}>
          Job Description
        </label>
        <span
          className={counterClass}
          aria-live="polite"
          aria-label={`${value.length} of ${MAX_CHARS} characters used`}
        >
          {value.length} / {MAX_CHARS}
        </span>
      </div>

      {/* Textarea */}
      <div className={styles.textareaWrap}>
        <textarea
          id="job-description-textarea"
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          placeholder="Paste the full job description…"
          maxLength={MAX_CHARS}
          spellCheck="true"
          aria-label="Job description"
          aria-describedby="jd-char-count"
        />
        {/* depth overlay — decorative, from Stitch design */}
        <div className={styles.depthOverlay} aria-hidden="true" />
      </div>
    </div>
  );
}
