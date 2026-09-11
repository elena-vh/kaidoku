import { CATALOGUE } from '../data/catalogue.ts';
import { repeatedlyFailed } from '../engine/queues.ts';
import { stageName } from '../engine/intervals.ts';
import { pct } from '../lib/format.ts';
import { useApp, useDispatch } from '../state/AppContext.tsx';
import styles from './Trouble.module.css';

export function Trouble() {
  const state = useApp();
  const dispatch = useDispatch();
  const items = repeatedlyFailed(CATALOGUE, state.progress);
  return (
    <section aria-label='Trouble' className={styles.page}>
      <h1 className={styles.title}>Entries that will not hold</h1>
      <p className={styles.intro}>
        Repetition has already failed on these. The remedy is a better mnemonic,
        not a longer queue — open one, write the association in your own words,
        and let the interval do the rest.
      </p>

      {items.length === 0 ? (
        <p>Nothing is stuck. Unusual, and probably temporary.</p>
      ) : (
        <div className={styles.table}>
          {items.map((item) => {
            const progress = state.progress[item.id];
            return (
              <div className={styles.row} key={item.id}>
                <span className={styles.char} lang='ja'>
                  {item.char}
                </span>
                <span className={styles.meaning}>{item.meaning}</span>
                <span className={styles.stage}>
                  {stageName(progress?.stage ?? 0)}
                </span>
                <span className={styles.lapses}>{progress?.lapses ?? 0}</span>
                <span className={styles.correct}>
                  {pct(progress?.correct ?? 0, progress?.seen ?? 0)}
                </span>
                <button
                  className={styles.amend}
                  type='button'
                  onClick={() =>
                    dispatch({
                      type: 'nav',
                      screen: 'entry',
                      entryId: item.id,
                    })
                  }>
                  Amend
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        className={styles.drill}
        type='button'
        disabled={items.length === 0}
        onClick={() =>
          dispatch({
            type: 'review/start',
            ids: items.map((i) => i.id),
            from: 'trouble',
          })
        }>
        Drill the trouble list
      </button>
    </section>
  );
}
