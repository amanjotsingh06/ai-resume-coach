import { useState } from 'react';
import './InterviewPrepTab.css';
import Badge from '../common/Badge';

/** Map difficulty → Badge variant */
const DIFFICULTY_VARIANT = {
  Hard:   'rose',
  Medium: 'amber',
  Easy:   'green',
};

/**
 * AccordionSection – collapsible category group of interview questions.
 */
function AccordionSection({ category, questions }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`accordion${isOpen ? ' accordion--open' : ''}`}>
      <button
        className="accordion__trigger"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${category}`}
        id={`accordion-header-${category}`}
      >
        <span className="accordion__category">{category}</span>
        <span className="accordion__meta">
          <span className="accordion__count">{questions.length} questions</span>
          <span className="accordion__chevron" aria-hidden="true">
            {isOpen ? '▲' : '▼'}
          </span>
        </span>
      </button>

      <div
        className="accordion__panel"
        id={`accordion-panel-${category}`}
        role="region"
        aria-labelledby={`accordion-header-${category}`}
        hidden={!isOpen}
      >
        <ul className="accordion__questions">
          {questions.map((q, idx) => (
            <li key={idx} className="question-item">
              <div className="question-item__top">
                <Badge variant={DIFFICULTY_VARIANT[q.difficulty] ?? 'indigo'}>
                  {q.difficulty}
                </Badge>
              </div>
              <p className="question-item__text">{q.question}</p>
              {q.hint && (
                <p className="question-item__hint">
                  <span className="question-item__hint-label">💡 Tip:</span>{' '}
                  {q.hint}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * InterviewPrepTab – questions grouped by category with accordion UI.
 *
 * @param {{ interview_questions: Array<{ question: string, category: string, difficulty: string, hint?: string }> }} data
 */
export default function InterviewPrepTab({ data }) {
  const questions = data?.interview_questions ?? [];

  // Group by category
  const grouped = questions.reduce((acc, q) => {
    acc[q.category] = [...(acc[q.category] || []), q];
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <section
      className="interview-tab"
      role="tabpanel"
      id="tabpanel-interviewPrep"
      aria-labelledby="tab-interviewPrep"
    >
      <header className="interview-tab__header">
        <h2 className="interview-tab__title">Practice Questions</h2>
        <p className="interview-tab__subtitle">
          Role‑specific questions generated from your resume and the job description
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="interview-tab__empty">No interview questions available.</p>
      ) : (
        <div className="interview-tab__accordions">
          {categories.map(cat => (
            <AccordionSection
              key={cat}
              category={cat}
              questions={grouped[cat]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
