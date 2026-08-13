import './RoadmapTab.css';
import Badge from '../common/Badge';

/**
 * Map priority string → Badge variant
 */
const PRIORITY_VARIANT = {
  high:   'rose',
  medium: 'amber',
  low:    'green',
};

/**
 * RoadmapTab – alternating left/right vertical timeline.
 *
 * @param {{ skill_roadmap: Array<{ skill: string, weeks: number, priority: string, resources: string[] }> }} data
 */
export default function RoadmapTab({ data }) {
  const roadmap = data?.skill_roadmap ?? [];

  return (
    <section
      className="roadmap-tab"
      role="tabpanel"
      id="tabpanel-roadmap"
      aria-labelledby="tab-roadmap"
    >
      <header className="roadmap-tab__header">
        <h2 className="roadmap-tab__title">Learning Roadmap</h2>
        <p className="roadmap-tab__subtitle">
          Your personalised learning path to close skill gaps for this role
        </p>
      </header>

      {roadmap.length === 0 ? (
        <p className="roadmap-tab__empty">No roadmap data available.</p>
      ) : (
        <ol className="timeline" aria-label="Skill learning timeline">
          {roadmap.map((item, idx) => {
            const side = idx % 2 === 0 ? 'left' : 'right';
            const priority = (item.priority ?? '').toLowerCase();

            return (
              <li
                key={idx}
                className={`timeline__item timeline__item--${side}`}
              >
                {/* Node dot */}
                <div className="timeline__node" aria-hidden="true">
                  <span className="timeline__dot" />
                </div>

                {/* Card */}
                <article className="timeline__card">
                  <div className="timeline__card-badges">
                    <Badge variant="indigo">
                      {item.weeks} {item.weeks === 1 ? 'week' : 'weeks'}
                    </Badge>
                    <Badge variant={PRIORITY_VARIANT[priority] ?? 'amber'}>
                      {item.priority} priority
                    </Badge>
                  </div>

                  <h3 className="timeline__skill">{item.skill}</h3>

                  {Array.isArray(item.resources) && item.resources.length > 0 && (
                    <ul className="timeline__resources">
                      {item.resources.map((res, rIdx) => (
                        <li key={rIdx} className="timeline__resource">
                          {res}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
