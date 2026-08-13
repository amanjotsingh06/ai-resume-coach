import { FaFileAlt } from 'react-icons/fa';
import './EmptyState.css';

/**
 * EmptyState – shown when a list/section has no data.
 *
 * @param {string}   title
 * @param {string}   description
 * @param {string}   buttonText
 * @param {Function} onButtonClick
 */
export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon-wrap" aria-hidden="true">
        <FaFileAlt className="empty-state__icon" />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {buttonText && onButtonClick && (
        <button
          className="empty-state__btn"
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
