import './SkeletonCard.css';

/**
 * SkeletonCard – animated shimmer placeholder for loading states.
 *
 * @param {string} height  CSS height value (default: '120px')
 * @param {string} width   CSS width value  (default: '100%')
 */
export default function SkeletonCard({ height = '120px', width = '100%' }) {
  return (
    <div
      className="skeleton-card"
      style={{ height, width }}
      aria-label="Loading…"
      role="status"
    />
  );
}
