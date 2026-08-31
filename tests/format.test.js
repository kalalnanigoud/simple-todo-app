import { describe, it, expect } from 'vitest';
import {
  pluralize,
  truncate,
  formatDueDate,
  differenceInDays,
  startOfDay
} from '../src/utils/format.js';

describe('pluralize', () => {
  it('keeps the singular form for exactly one', () => {
    expect(pluralize(1, 'todo')).toBe('1 todo');
  });

  it('pluralizes zero and many', () => {
    expect(pluralize(0, 'todo')).toBe('0 todos');
    expect(pluralize(7, 'todo')).toBe('7 todos');
  });

  it('accepts an irregular plural', () => {
    expect(pluralize(2, 'person', 'people')).toBe('2 people');
  });
});

describe('truncate', () => {
  it('returns short text unchanged', () => {
    expect(truncate('buy milk', 20)).toBe('buy milk');
  });

  it('returns text unchanged at exactly the limit', () => {
    expect(truncate('12345', 5)).toBe('12345');
  });

  it('cuts on a word boundary when one is available', () => {
    expect(truncate('buy milk and eggs', 11)).toBe('buy milk...');
  });

  it('cuts mid-word when there is no usable boundary', () => {
    expect(truncate('unstoppableforce', 9)).toBe('unstopp...');
  });

  it('defaults to a 60 character budget', () => {
    const long = 'a'.repeat(100);
    expect(truncate(long)).toHaveLength(60);
  });
});

describe('startOfDay', () => {
  it('zeroes the time component', () => {
    const result = startOfDay(new Date('2026-03-04T17:45:12.500Z'));

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('does not mutate its argument', () => {
    const original = new Date('2026-03-04T17:45:12.500Z');
    const copy = new Date(original);

    startOfDay(original);

    expect(original.getTime()).toBe(copy.getTime());
  });
});

describe('differenceInDays', () => {
  it('counts whole days forward', () => {
    expect(
      differenceInDays(new Date('2026-01-04'), new Date('2026-01-01'))
    ).toBe(3);
  });

  it('counts whole days backward as negative', () => {
    expect(
      differenceInDays(new Date('2026-01-01'), new Date('2026-01-04'))
    ).toBe(-3);
  });

  it('ignores the time of day', () => {
    expect(
      differenceInDays(
        new Date('2026-01-02T01:00:00'),
        new Date('2026-01-01T23:00:00')
      )
    ).toBe(1);
  });
});

describe('formatDueDate', () => {
  const now = new Date('2026-01-10T12:00:00');

  it('describes the same day as today', () => {
    expect(formatDueDate(new Date('2026-01-10T23:00:00'), now)).toBe('today');
  });

  it('describes the next and previous day', () => {
    expect(formatDueDate(new Date('2026-01-11'), now)).toBe('tomorrow');
    expect(formatDueDate(new Date('2026-01-09'), now)).toBe('yesterday');
  });

  it('describes further dates in both directions', () => {
    expect(formatDueDate(new Date('2026-01-13'), now)).toBe('in 3 days');
    expect(formatDueDate(new Date('2026-01-07'), now)).toBe('3 days ago');
  });

  it('accepts an ISO string', () => {
    expect(formatDueDate('2026-01-11T08:00:00', now)).toBe('tomorrow');
  });

  it('throws a TypeError on an invalid date', () => {
    expect(() => formatDueDate('not-a-date', now)).toThrow(TypeError);
  });
});
