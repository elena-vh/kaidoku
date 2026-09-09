import { describe, expect, it } from 'vitest';
import type { JudgeTarget } from './judge.ts';
import { distance, judge, normalise } from './judge.ts';

const one: JudgeTarget = { meaning: 'one', alt: ['1'] };
const book: JudgeTarget = { meaning: 'book', alt: ['origin', 'main'] };
const field: JudgeTarget = { meaning: 'rice field', alt: ['paddy'] };
const mountain: JudgeTarget = { meaning: 'mountain', alt: [] };

describe('normalise', () => {
  it('lowercases, trims and collapses whitespace', () => {
    expect(normalise('  Rice   Field ')).toBe('rice field');
  });

  it("strips . ’ ' , ! ?", () => {
    expect(normalise("don't!")).toBe('dont');
    expect(normalise('a.b,c?')).toBe('abc');
  });

  it('strips a leading article or infinitive', () => {
    expect(normalise('to stand')).toBe('stand');
    expect(normalise('the mountain')).toBe('mountain');
    expect(normalise('a river')).toBe('river');
    expect(normalise('an eye')).toBe('eye');
  });

  it('only strips the article when a word follows', () => {
    expect(normalise('to')).toBe('to');
    expect(normalise('an')).toBe('an');
  });

  it('is empty for blank input', () => {
    expect(normalise('   ')).toBe('');
  });
});

describe('distance', () => {
  it('is 0 for identical strings', () => {
    expect(distance('mountain', 'mountain')).toBe(0);
  });
  it('counts single edits', () => {
    expect(distance('mountain', 'mountian')).toBe(2);
    expect(distance('book', 'boook')).toBe(1);
    expect(distance('fire', 'fir')).toBe(1);
  });
  it('handles empty strings', () => {
    expect(distance('', 'abc')).toBe(3);
    expect(distance('abc', '')).toBe(3);
  });
});

describe('judge', () => {
  it('empty input is a no-op, never a failure', () => {
    expect(judge(mountain, '')).toBe('empty');
    expect(judge(mountain, '   ')).toBe('empty');
  });

  it('accepts the primary meaning, case- and space-insensitively', () => {
    expect(judge(mountain, 'Mountain')).toBe('right');
    expect(judge(field, '  rice field ')).toBe('right');
  });

  it('accepts any alternate', () => {
    expect(judge(one, '1')).toBe('right');
    expect(judge(book, 'origin')).toBe('right');
    expect(judge(book, 'main')).toBe('right');
  });

  it('accepts after stripping a leading article/infinitive', () => {
    expect(judge({ meaning: 'stand', alt: [] }, 'to stand')).toBe('right');
  });

  it('accepts a single long word out of a multi-word meaning', () => {
    expect(judge(field, 'field')).toBe('right');
  });

  it('does not accept a short word out of a multi-word meaning', () => {
    expect(judge({ meaning: 'the big cat', alt: [] }, 'cat')).toBe('wrong');
  });

  it('returns near for a single-edit answer on a long target', () => {
    expect(judge(mountain, 'mountan')).toBe('near'); // one deletion
    expect(judge(mountain, 'mountainn')).toBe('near'); // one insertion
    expect(judge(field, 'rice fild')).toBe('near'); // one deletion
  });

  it('a two-edit answer (e.g. a transposition) is wrong, not near', () => {
    expect(judge(mountain, 'mountian')).toBe('wrong');
  });

  it('does not offer near on short targets', () => {
    expect(judge({ meaning: 'one', alt: [] }, 'one')).toBe('right');
    expect(judge({ meaning: 'one', alt: [] }, 'ohe')).toBe('wrong');
    expect(judge({ meaning: 'eye', alt: [] }, 'aye')).toBe('wrong');
  });

  it('strict mode turns a near into a wrong', () => {
    expect(judge(mountain, 'mountan', true)).toBe('wrong');
  });

  it('a clearly different answer is wrong', () => {
    expect(judge(mountain, 'river')).toBe('wrong');
  });
});
