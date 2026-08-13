import { useState, useCallback } from 'react';
import './BulletImproverTab.css';
import Badge from '../common/Badge';

/**
 * CopyButton – clipboard copy with a 2‑second checkmark flash.
 */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing silently
    }
  }, [text]);

  return (
    <button
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy improved bullet'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span>{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

/**
 * BulletImproverTab – before / after bullet point cards.
 *
 * @param {{ bullet_improvements: Array<{ original: string, improved: string }> }} data
 */
export default function BulletImproverTab({ data }) {
  const improvements = data?.bullet_improvements ?? [];

  if (improvements.length === 0) {
    return (
      <section
        className="bullet-tab"
        role="tabpanel"
        id="tabpanel-bulletImprover"
        aria-labelledby="tab-bulletImprover"
      >
        <p className="bullet-tab__empty">No bullet improvements available.</p>
      </section>
    );
  }

  return (
    <section
      className="bullet-tab"
      role="tabpanel"
      id="tabpanel-bulletImprover"
      aria-labelledby="tab-bulletImprover"
    >
      <header className="bullet-tab__header">
        <h2 className="bullet-tab__title">Resume Optimization</h2>
        <p className="bullet-tab__subtitle">
          AI‑rewritten bullet points using the <strong>XYZ Framework</strong>
        </p>
      </header>

      <div className="bullet-tab__list">
        {improvements.map((item, idx) => (
          <div key={idx} className="bullet-pair">
            {/* Before */}
            <div className="bullet-card bullet-card--before">
              <span className="bullet-card__badge-label">Before</span>
              <p className="bullet-card__text bullet-card__text--dim">
                {item.original}
              </p>
            </div>

            <div className="bullet-pair__arrow" aria-hidden="true">→</div>

            {/* After */}
            <div className="bullet-card bullet-card--after">
              <div className="bullet-card__top-row">
                <Badge variant="indigo">XYZ Framework</Badge>
                <CopyButton text={item.improved} />
              </div>
              <p className="bullet-card__text bullet-card__text--bright">
                {item.improved}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
