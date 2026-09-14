import { itemById, partGlyphs, relatedItems } from '../data/catalogue.ts';
import { stageName } from '../engine/intervals.ts';
import { pct, typeLabel, until } from '../lib/format.ts';
import { mnemonicFor } from '../lib/verdict.ts';
import { useApp, useDispatch, useNow } from '../state/AppContext.tsx';
import styles from './Entry.module.css';

export function Entry() {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();
  const item = state.entryId === null ? undefined : itemById(state.entryId);

  if (item === undefined) {
    return (
      <section aria-label='Entry' className={styles.empty}>
        <h1>Nothing selected</h1>
        <div className={styles.actions}>
          <button
            className={styles.action}
            type='button'
            onClick={() => dispatch({ type: 'nav', screen: 'today' })}>
            Back to Today
          </button>
        </div>
      </section>
    );
  }

  const progress = state.progress[item.id];
  const related = relatedItems(item);

  const readings =
    item.type === 'kanji'
      ? [
          { label: "On'yomi", value: item.on },
          { label: "Kun'yomi", value: item.kun },
          { label: 'Built from', value: partGlyphs(item).join(' ') },
        ]
      : item.type === 'vocab'
        ? [
            { label: 'Reading', value: item.reading },
            { label: 'Characters', value: item.uses.join(' ') },
          ]
        : [];

  return (
    <section aria-label='Entry' className={styles.page}>
      <button
        className={styles.back}
        type='button'
        onClick={() => dispatch({ type: 'nav/back' })}>
        ← Back
      </button>

      <div className={styles.meta}>
        <span className={styles.pill}>{typeLabel(item.type)}</span>
        <span className={styles.pill}>Level {item.level}</span>
        {item.strokes !== null && (
          <span className={styles.pill}>{item.strokes} strokes</span>
        )}
        {progress !== undefined && (
          <span className={styles.pill}>{stageName(progress.stage)}</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.kanjiCard}>
          <div className={styles.crossV} />
          <div className={styles.crossH} />
          <p className={styles.kanji} lang='ja'>
            {item.char}
          </p>
        </div>

        <div>
          <h1>{item.meaning}</h1>
          {item.alt.length > 0 && (
            <p className={styles.alt}>Also {item.alt.join(', ')}</p>
          )}

          {readings.length > 0 && (
            <div className={styles.readings}>
              {readings.map((reading) => (
                <div className={styles.reading} key={reading.label}>
                  <span className={styles.label}>{reading.label}</span>
                  {reading.value ? (
                    <span className={styles.value} lang='ja'>
                      {reading.value}
                    </span>
                  ) : (
                    <span className={styles.absent}>—</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Mnemonic</h2>
            {state.editing ? (
              <>
                <textarea
                  className={styles.editor}
                  value={state.draft}
                  onChange={(event) =>
                    dispatch({
                      type: 'mnemonic/draft',
                      value: event.target.value,
                    })
                  }
                />
                <div className={styles.actions}>
                  <button
                    className={styles.action}
                    type='button'
                    onClick={() => dispatch({ type: 'mnemonic/save' })}>
                    Save
                  </button>
                  <button
                    className={styles.action}
                    type='button'
                    onClick={() => dispatch({ type: 'mnemonic/edit' })}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.mnemonic}>
                  {mnemonicFor(item, state.custom)}
                </p>
                <div className={styles.actions}>
                  <button
                    className={styles.action}
                    type='button'
                    onClick={() => dispatch({ type: 'mnemonic/edit' })}>
                    Write your own
                  </button>
                  {state.custom[item.id] !== undefined && (
                    <button
                      className={styles.action}
                      type='button'
                      onClick={() => dispatch({ type: 'mnemonic/restore' })}>
                      Restore original
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Standing</h2>
            {progress === undefined ? (
              <p className={styles.note}>
                Not studied yet. It will appear in a lesson when its turn comes.
              </p>
            ) : (
              <>
                <div className={styles.stats}>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Rank</span>
                    <span className={styles.statValue}>
                      {stageName(progress.stage)}
                    </span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Next due</span>
                    <span className={styles.statValue}>
                      {until(progress.due, now)}
                    </span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Times seen</span>
                    <span className={styles.statValue}>{progress.seen}</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Answered correctly</span>
                    <span className={styles.statValue}>
                      {pct(progress.correct, progress.seen)}
                    </span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Failures</span>
                    <span className={styles.statValue}>{progress.lapses}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.drill}
                    type='button'
                    onClick={() =>
                      dispatch({
                        type: 'review/start',
                        ids: [item.id],
                        from: 'entry',
                      })
                    }>
                    Drill this one
                  </button>
                </div>
              </>
            )}
          </div>

          {related.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {item.type === 'vocab'
                  ? 'Characters in this word'
                  : item.type === 'kanji'
                    ? 'Words that use it'
                    : 'Characters built from it'}
              </h2>
              <div className={styles.related}>
                {related.map((other) => (
                  <button
                    className={styles.relatedTile}
                    key={other.id}
                    type='button'
                    onClick={() =>
                      dispatch({
                        type: 'nav',
                        screen: 'entry',
                        entryId: other.id,
                      })
                    }>
                    <span className={styles.relatedGlyph} lang='ja'>
                      {other.char}
                    </span>
                    <span className={styles.relatedMeaning}>
                      {other.meaning}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
