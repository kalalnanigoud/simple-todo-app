/**
 * Presentation helpers for todo text and dates.
 *
 * Every function here is pure: same input, same output, no side effects and no
 * DOM access. That keeps them trivially testable and safe to reuse anywhere.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Pluralize a noun for a count.
 *
 * @param {number} count - How many things there are.
 * @param {string} singular - The singular form, e.g. "todo".
 * @param {string} [plural] - Override for irregular plurals, e.g. "people".
 * @returns {string} The count and the correctly inflected noun.
 *
 * @example
 * pluralize(1, 'todo'); // "1 todo"
 * pluralize(3, 'todo'); // "3 todos"
 */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Shorten text to a maximum length, ending on a whole word where possible.
 *
 * @param {string} text - The text to shorten.
 * @param {number} [maxLength=60] - Maximum length of the result, ellipsis included.
 * @returns {string} The original text, or a truncated copy ending in an ellipsis.
 *
 * @example
 * truncate('buy milk and eggs', 11); // "buy milk..."
 */
export function truncate(text, maxLength = 60) {
  if (text.length <= maxLength) {
    return text;
  }

  const ellipsis = '...';
  const budget = maxLength - ellipsis.length;
  const clipped = text.slice(0, budget);
  const lastSpace = clipped.lastIndexOf(' ');

  // Cut on a word boundary when one exists in the back half of the budget.
  const body = lastSpace > budget / 2 ? clipped.slice(0, lastSpace) : clipped;

  return `${body.trimEnd()}${ellipsis}`;
}

/**
 * Describe a due date relative to a reference day.
 *
 * @param {Date|string} dueDate - The due date, as a Date or ISO string.
 * @param {Date} [now=new Date()] - The reference point, injectable for tests.
 * @returns {string} A human phrase such as "today", "tomorrow", or "in 3 days".
 * @throws {TypeError} When dueDate is not a valid date.
 *
 * @example
 * formatDueDate('2026-01-02', new Date('2026-01-01')); // "tomorrow"
 */
export function formatDueDate(dueDate, now = new Date()) {
  const due = dueDate instanceof Date ? dueDate : new Date(dueDate);

  if (Number.isNaN(due.getTime())) {
    throw new TypeError('formatDueDate requires a valid date');
  }

  const days = differenceInDays(due, now);

  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';

  return days > 0
    ? `in ${pluralize(days, 'day')}`
    : `${pluralize(Math.abs(days), 'day')} ago`;
}

/**
 * Whole calendar days between two dates, ignoring the time of day.
 *
 * @param {Date} later
 * @param {Date} earlier
 * @returns {number} Positive when `later` is after `earlier`.
 */
export function differenceInDays(later, earlier) {
  return Math.round((startOfDay(later) - startOfDay(earlier)) / MS_PER_DAY);
}

/**
 * Midnight on the same calendar day as the given date.
 *
 * @param {Date} date
 * @returns {Date} A new Date; the argument is not modified.
 */
export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
