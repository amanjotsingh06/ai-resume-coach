import { useState, useEffect, useRef } from 'react';

/**
 * MatchScoreRing — circular SVG score indicator.
 *
 * Extracted from the Stitch "Results Dashboard" screen and converted
 * into a reusable React component with animated ring + count-up.
 *
 * @param {number}  score  — 0-100
 * @param {'sm'|'lg'} size — sm = 60px (history cards), lg = 180px (dashboard hero)
 */
export default function MatchScoreRing({ score = 0, size = 'lg' }) {
  /* ── geometry ─────────────────────────────────────────────── */
  const isLg           = size === 'lg';
  const px             = isLg ? 180 : 60;
  const radius         = isLg ? 80 : 26;
  const circumference  = 2 * Math.PI * radius;
  const center         = px / 2;
  const bgStrokeWidth  = isLg ? 8 : 4;
  const fgStrokeWidth  = isLg ? 10 : 5;

  /* ── color logic ──────────────────────────────────────────── */
  const color =
    score > 70  ? '#84CC16'   // success green
    : score >= 40 ? '#F97316' // warning amber
    :               '#F43F5E'; // danger rose

  /* ── ring animation (strokeDashoffset) ────────────────────── */
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Trigger on next frame so the CSS transition picks it up
    const raf = requestAnimationFrame(() => {
      setOffset(circumference * (1 - score / 100));
    });
    return () => cancelAnimationFrame(raf);
  }, [score, circumference]);

  /* ── count-up animation (lg only) ─────────────────────────── */
  const [displayScore, setDisplayScore] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isLg) return;

    const duration = 800;              // ms — matches ring transition
    const steps    = Math.max(score, 1);
    const stepTime = Math.floor(duration / steps);

    let current = 0;
    intervalRef.current = setInterval(() => {
      current += 1;
      if (current >= score) {
        clearInterval(intervalRef.current);
        current = score;
      }
      setDisplayScore(current);
    }, stepTime);

    return () => clearInterval(intervalRef.current);
  }, [score, isLg]);

  const valueToDisplay = isLg ? displayScore : score;

  /* ── typography sizes ─────────────────────────────────────── */
  const scoreFontSize = isLg ? '36px' : '13px';

  return (
    <div
      style={{ width: px, height: px, position: 'relative' }}
      aria-label={`Match score: ${score} out of 100`}
      role="img"
    >
      {/* SVG ring — rotated -90° so 0 starts at 12 o'clock */}
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${px} ${px}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2D2D3F"
          strokeWidth={bgStrokeWidth}
        />

        {/* Foreground (animated) arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={fgStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>

      {/* Centered text overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Score number */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: scoreFontSize,
            color: color,
            lineHeight: 1,
          }}
        >
          {valueToDisplay}
        </span>

        {/* "Match Score" label — lg only */}
        {isLg && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              marginTop: '4px',
            }}
          >
            Match Score
          </span>
        )}
      </div>
    </div>
  );
}
