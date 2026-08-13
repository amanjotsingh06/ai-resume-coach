import './SkillGapsTab.css';
import Badge from '../common/Badge';

/**
 * SkillGapsTab – matched vs missing skills with progress bar.
 *
 * @param {{ matched_skills: string[], missing_skills: string[] }} data
 */
export default function SkillGapsTab({ data }) {
  const matched = data?.matched_skills ?? [];
  const missing = data?.missing_skills ?? [];
  const total   = matched.length + missing.length;
  const pct     = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  return (
    <section
      className="skill-gaps-tab"
      role="tabpanel"
      id="tabpanel-skillGaps"
      aria-labelledby="tab-skillGaps"
    >
      {/* Columns */}
      <div className="skill-gaps-tab__grid">
        {/* Matched Skills */}
        <div className="skill-col">
          <h2 className="skill-col__heading skill-col__heading--green">
            <span className="skill-col__dot skill-col__dot--green" aria-hidden="true" />
            Matched Skills
            <span className="skill-col__count">{matched.length}</span>
          </h2>
          <div className="skill-col__badges">
            {matched.length > 0
              ? matched.map((skill, i) => (
                  <Badge key={i} variant="green">{skill}</Badge>
                ))
              : <p className="skill-col__empty">No matched skills found.</p>
            }
          </div>
        </div>

        {/* Missing Skills */}
        <div className="skill-col">
          <h2 className="skill-col__heading skill-col__heading--rose">
            <span className="skill-col__dot skill-col__dot--rose" aria-hidden="true" />
            Missing Skills
            <span className="skill-col__count">{missing.length}</span>
          </h2>
          <div className="skill-col__badges">
            {missing.length > 0
              ? missing.map((skill, i) => (
                  <Badge key={i} variant="rose">{skill}</Badge>
                ))
              : <p className="skill-col__empty">No missing skills — great match!</p>
            }
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="skill-progress">
        <div className="skill-progress__meta">
          <span className="skill-progress__label">Overall Skill Match</span>
          <span className="skill-progress__pct">{pct}%</span>
        </div>
        <div
          className="skill-progress__track"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Skill match percentage"
        >
          <div
            className="skill-progress__fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="skill-progress__hint">
          {matched.length} matched · {missing.length} missing
        </p>
      </div>
    </section>
  );
}
