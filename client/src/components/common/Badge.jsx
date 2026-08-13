import './Badge.css';

/**
 * Badge – pill-shaped status indicator.
 *
 * @param {React.ReactNode} children
 * @param {'green'|'rose'|'amber'|'indigo'|'cyan'} variant
 */
export default function Badge({ children, variant = 'indigo' }) {
  return (
    <span className={`badge badge--${variant}`}>
      {children}
    </span>
  );
}
