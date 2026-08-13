import './TabNav.css';

const TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'skillGaps',      label: 'Skills' },
  { id: 'keywords',       label: 'Keywords' },
  { id: 'bulletImprover', label: 'Bullet Improver' },
  { id: 'interviewPrep',  label: 'Interview Prep' },
  { id: 'roadmap',        label: 'Roadmap' },
];

/**
 * TabNav – sticky horizontal tab bar beneath the score section.
 *
 * @param {string}   activeTab    – id of the currently active tab
 * @param {Function} onTabChange  – callback(tabId: string)
 */
export default function TabNav({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav" role="tablist" aria-label="Dashboard sections">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          role="tab"
          id={`tab-${id}`}
          aria-selected={activeTab === id}
          aria-controls={`tabpanel-${id}`}
          className={`tab-nav__item${activeTab === id ? ' tab-nav__item--active' : ''}`}
          onClick={() => onTabChange(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
