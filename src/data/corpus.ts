import type { Item, ItemId } from '../types.ts'
import { itemId } from '../types.ts'
import { KANJI, RADICALS, VOCAB } from './raw.ts'

const MAX_LEVEL = 5

function build(): Item[] {
  const out: Item[] = []

  for (const r of RADICALS) {
    out.push({
      id: itemId('radical', r.c),
      type: 'radical',
      char: r.c,
      level: r.level,
      meaning: r.m,
      alt: [],
      on: '',
      kun: '',
      reading: '',
      strokes: null,
      parts: [],
      uses: [],
      mnemonic: r.mn,
    })
  }

  for (const k of KANJI) {
    out.push({
      id: itemId('kanji', k.c),
      type: 'kanji',
      char: k.c,
      level: k.level,
      meaning: k.meanings[0] ?? '',
      alt: k.meanings.slice(1),
      on: k.on.join(', '),
      kun: k.kun.join(', '),
      reading: '',
      strokes: k.strokes,
      parts: [...k.parts],
      uses: [],
      mnemonic: k.mn,
    })
  }

  for (const v of VOCAB) {
    out.push({
      id: itemId('vocab', v.c),
      type: 'vocab',
      char: v.c,
      level: v.level,
      meaning: v.meanings[0] ?? '',
      alt: v.meanings.slice(1),
      on: '',
      kun: '',
      reading: v.reading,
      strokes: null,
      parts: [],
      uses: [...v.uses],
      mnemonic: v.mn,
    })
  }

  return out.filter((i) => i.level <= MAX_LEVEL)
}

export const CORPUS: readonly Item[] = build()

const BY_ID: ReadonlyMap<ItemId, Item> = new Map(CORPUS.map((i) => [i.id, i]))

export function itemById(id: ItemId): Item | undefined {
  return BY_ID.get(id)
}

export function radicalByMeaning(name: string): Item | undefined {
  return CORPUS.find((i) => i.type === 'radical' && i.meaning === name)
}

// A kanji's `parts` (radical meanings) resolved to glyphs where possible.
export function partGlyphs(item: Item): string[] {
  return item.parts.map((name) => radicalByMeaning(name)?.char ?? name)
}

// For a word, the kanji it uses; for a character, the words that use it; for a
// radical, the characters that list it as a part.
export function relatedItems(item: Item): Item[] {
  if (item.type === 'vocab') {
    return item.uses
      .map((char) => itemById(itemId('kanji', char)))
      .filter((i): i is Item => i !== undefined)
  }
  if (item.type === 'kanji') {
    return CORPUS.filter((i) => i.type === 'vocab' && i.uses.includes(item.char))
  }
  return CORPUS.filter((i) => i.type === 'kanji' && i.parts.includes(item.meaning))
}
