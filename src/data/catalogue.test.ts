import { describe, expect, it } from 'vitest';
import { CATALOGUE, itemById, radicalByMeaning } from './catalogue.ts';
import { validateCatalogue } from './validate.ts';
import { itemId } from '../types.ts';

describe('catalogue', () => {
  it('ports the full handoff data set (133 items)', () => {
    // Handoff prose claims 140; the actual data file is 133. See data/raw.ts.
    expect(CATALOGUE).toHaveLength(133);
    expect(CATALOGUE.filter((i) => i.type === 'radical')).toHaveLength(37);
    expect(CATALOGUE.filter((i) => i.type === 'kanji')).toHaveLength(58);
    expect(CATALOGUE.filter((i) => i.type === 'vocab')).toHaveLength(38);
  });

  it('assigns every item a `${type}:${char}` id', () => {
    for (const item of CATALOGUE) {
      expect(item.id).toBe(itemId(item.type, item.char));
    }
  });

  it('shapes each item type correctly', () => {
    const fire = itemById(itemId('kanji', '火'));
    expect(fire).toMatchObject({
      type: 'kanji',
      meaning: 'fire',
      on: 'カ',
      kun: 'ひ',
      reading: '',
      strokes: 4,
      parts: ['fire'],
      uses: [],
    });

    const nihon = itemById(itemId('vocab', '日本'));
    expect(nihon).toMatchObject({
      type: 'vocab',
      meaning: 'Japan',
      reading: 'にほん',
      on: '',
      kun: '',
      strokes: null,
      uses: ['日', '本'],
    });

    const ground = itemById(itemId('radical', '一'));
    expect(ground).toMatchObject({
      type: 'radical',
      meaning: 'ground',
      parts: [],
      uses: [],
    });
  });

  it('keeps alternate meanings out of the primary slot', () => {
    const book = itemById(itemId('kanji', '本'));
    expect(book?.meaning).toBe('book');
    expect(book?.alt).toEqual(['origin', 'main']);
  });

  it('resolves parts to a radical glyph', () => {
    expect(radicalByMeaning('fire')?.char).toBe('火');
    expect(radicalByMeaning('nonsense')).toBeUndefined();
  });

  it('has no dangling parts or uses references', () => {
    const problems = validateCatalogue();
    expect(problems, problems.map((p) => p.message).join('\n')).toEqual([]);
  });
});
