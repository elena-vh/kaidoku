// Every vocab `uses` char and every kanji `parts` meaning must resolve to a real
// item - run as a test so a content typo shows up on the spot, not weeks into a
// review cycle.

import type { Item } from '../types.ts';
import { CATALOGUE } from './catalogue.ts';

export interface CatalogueProblem {
  itemId: string;
  kind: 'parts' | 'uses';
  ref: string;
  message: string;
}

export function validateCatalogue(
  catalogue: readonly Item[] = CATALOGUE,
): CatalogueProblem[] {
  const problems: CatalogueProblem[] = [];

  const radicalMeanings = new Set(
    catalogue.filter((i) => i.type === 'radical').map((i) => i.meaning),
  );
  const kanjiChars = new Set(
    catalogue.filter((i) => i.type === 'kanji').map((i) => i.char),
  );

  for (const item of catalogue) {
    if (item.type === 'kanji') {
      for (const part of item.parts) {
        if (!radicalMeanings.has(part)) {
          problems.push({
            itemId: item.id,
            kind: 'parts',
            ref: part,
            message: `${item.id} (${item.char}) has part "${part}" with no radical of that meaning`,
          });
        }
      }
    }
    if (item.type === 'vocab') {
      for (const use of item.uses) {
        if (!kanjiChars.has(use)) {
          problems.push({
            itemId: item.id,
            kind: 'uses',
            ref: use,
            message: `${item.id} (${item.char}) uses "${use}" with no kanji of that character`,
          });
        }
      }
    }
  }

  return problems;
}

export function assertCatalogueValid(
  catalogue: readonly Item[] = CATALOGUE,
): void {
  const problems = validateCatalogue(catalogue);
  if (problems.length > 0) {
    throw new Error(
      `Catalogue integrity check failed (${problems.length}):\n` +
        problems.map((p) => `  - ${p.message}`).join('\n'),
    );
  }
}
