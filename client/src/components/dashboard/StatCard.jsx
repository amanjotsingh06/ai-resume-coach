import './StatCard.css';

/**
 * StatCard – large metric card for the dashboard score section.
 *
 * @param {string|number} value  – the big number / metric to display
 * @param {string}        label  – descriptive label below the number
 * @param {'indigo'|'rose'|'amber'} color – accent color for the value
 */
export default function StatCard({ value, label, color = 'indigo' }) {
  return (
    <div className="stat-card">
      <span className={`stat-card__value stat-card__value--${color}`}>
        {value}
      </span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
