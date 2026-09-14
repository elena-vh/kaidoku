import { useState } from 'react';
import { CATALOGUE } from '../data/catalogue.ts';
import { isUnlocked } from '../engine/queues.ts';
import { stageShortName } from '../engine/intervals.ts';
import type { Item, ItemType, ProgressMap } from '../types.ts';
import { useApp, useDispatch } from '../state/AppContext.tsx';
import styles from './Catalogue.module.css';

const TYPE_ORDER: Record<ItemType, number> = { radical: 0, kanji: 1, vocab: 2 };

function normalise(text: string): string {
  return text.trim().toLowerCase();
}

export function Catalogue() {
  const state = useApp();
  const dispatch = useDispatch();
  const [item, setItem] = useState('');

  const query = normalise(item);
  const matches = query
    ? CATALOGUE.filter(
        (entry) =>
          entry.char.includes(item.trim()) ||
          normalise(entry.meaning).includes(query),
      )
    : CATALOGUE;

  const levels = [...new Set(matches.map((entry) => entry.level))].sort(
    (a, b) => a - b,
  );

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>The catalogue</h1>
      <p className={styles.intro}>
        Five levels, 133 entries. Locked levels are listed but their readings
        stay hidden, so a first meeting happens in a lesson and not by accident.
      </p>

      <div className={styles.searchRow}>
        <input
          className={styles.searchItem}
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder='Search by character or meaning'
        />
      </div>

      {matches.length === 0 ? (
        <p className={styles.empty}>Nothing matches "{item}".</p>
      ) : (
        levels.map((level) => {
          const entries = matches
            .filter((entry) => entry.level === level)
            .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
          return (
            <div className={styles.level} key={level}>
              <div className={styles.levelHead}>
                <h2 className={styles.levelTitle}>Level {level}</h2>
                <span className={styles.levelCount}>
                  {entries.length} entries
                </span>
              </div>
              <div className={styles.grid}>
                {entries.map((entry) => (
                  <Tile
                    item={entry}
                    key={entry.id}
                    viewerLevel={state.level}
                    progress={state.progress}
                    onOpen={() =>
                      dispatch({
                        type: 'nav',
                        screen: 'entry',
                        entryId: entry.id,
                      })
                    }
                  />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function Tile({
  item,
  viewerLevel,
  progress,
  onOpen,
}: {
  item: Item;
  viewerLevel: number;
  progress: ProgressMap;
  onOpen: () => void;
}) {
  const own = progress[item.id];
  const locked = !isUnlocked(item, progress, viewerLevel) && own === undefined;

  return (
    <button
      className={`${styles.tile} ${locked ? styles.locked : ''}`}
      type='button'
      onClick={onOpen}>
      <span className={styles.glyph} lang='ja'>
        {item.char}
      </span>
      {locked ? (
        <span className={styles.hidden}>—</span>
      ) : (
        <span className={styles.meaning}>{item.meaning}</span>
      )}
      <span className={styles.stage}>
        {locked ? 'Locked' : own ? stageShortName(own.stage) : 'New'}
      </span>
    </button>
  );
}
