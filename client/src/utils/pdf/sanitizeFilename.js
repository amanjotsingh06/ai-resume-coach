/**
 * PDF Filename Utilities
 * ─────────────────────
 * Generates a clean, human-readable filename for exported report PDFs.
 * Sanitizes all characters that are invalid in Windows, macOS, and Linux
 * file names, and normalises whitespace/dashes for readability.
 *
 * Does NOT include: API keys, JWTs, user IDs, or database IDs.
 */

/** Characters that are illegal in Windows (and broadly unsafe) file names. */
const UNSAFE_CHARS = /[/\\:*?"<>|]/g;

/**
 * Replace any character that is not alphanumeric, hyphen, underscore,
 * dot or space with a hyphen, then collapse repeated hyphens/spaces and
 * trim leading/trailing punctuation.
 *
 * @param {string} str - Raw string to sanitize.
 * @returns {string}   - Sanitized fragment suitable for use in a filename.
 */
function sanitizeSegment(str) {
  if (!str || typeof str !== 'string') return '';

  return str
    .replace(UNSAFE_CHARS, '-')          // replace illegal chars
    .replace(/[^\w\s-]/g, '-')           // replace remaining non-word chars
    .replace(/\s+/g, '-')               // collapse whitespace → dash
    .replace(/-+/g, '-')                // collapse consecutive dashes
    .replace(/^[-_.]+|[-_.]+$/g, '')    // trim leading/trailing punctuation
    .slice(0, 60);                      // hard cap per segment
}

/**
 * Generate a sanitized PDF filename for a report export.
 *
 * Format:  AI-Resume-Coach-{jobTitle}-{resumeName}.pdf
 * Example: AI-Resume-Coach-Frontend-Developer-Aman-Resume.pdf
 *
 * @param {{ resume_name?: string, job_title?: string }} options
 * @returns {string} Sanitized PDF filename including ".pdf" extension.
 */
export function generateReportFilename({ resume_name, job_title } = {}) {
  const prefix = 'AI-Resume-Coach';

  const jobPart    = sanitizeSegment(job_title)    || 'Analysis';
  const resumePart = sanitizeSegment(resume_name)  || 'Resume';

  return `${prefix}-${jobPart}-${resumePart}.pdf`;
}
