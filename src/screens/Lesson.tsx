// One item at a time; the final card commits the whole batch at once to stage 0
// due +4h, then offers to drill it straight away.

import { useApp, useDispatch, useNow } from '../state/AppContext.tsx';
import { itemById, partGlyphs } from '../data/catalogue.ts';
import { mnemonicFor } from '../lib/verdict.ts';
import { typeLabel } from '../lib/format.ts';
import styles from './Lesson.module.css';

export function LessonScreen() {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();

  const lesson = state.lesson;
  if (!lesson) return null;

  if (lesson.done) {
    return (
      <section aria-label='Lesson batch entered' className={styles.done}>
        <h1 className={styles.doneHeading}>
          {lesson.queue.length} entries added to the schedule
        </h1>
        <p className={styles.doneBody}>
          Each one sits at Novice I and returns in four hours. Drilling them
          right away is the cheapest way to catch the ones that did not stick.
        </p>
        <div className={styles.doneActions}>
          <button
            className={styles.next}
            type='button'
            onClick={() => dispatch({ type: 'lessons/drill' })}>
            Drill the batch
          </button>
          <button
            className={styles.prev}
            type='button'
            onClick={() => dispatch({ type: 'nav', screen: 'today' })}>
            Not now
          </button>
        </div>
      </section>
    );
  }

  const id = lesson.queue[lesson.i];
  const item = id ? itemById(id) : undefined;
  if (!item) return null;

  const last = lesson.i === lesson.queue.length - 1;
  const readingA = item.type === 'vocab' ? item.reading : item.on || '—';
  const readingALabel = item.type === 'vocab' ? 'Reading' : "On'yomi";
  const readingB =
    item.type === 'vocab' ? item.uses.join(' ') : item.kun || '—';
  const readingBLabel = item.type === 'vocab' ? 'Characters used' : "Kun'yomi";
  const built =
    item.type === 'vocab'
      ? item.uses.join(' ')
      : partGlyphs(item).join(' ') || '—';

  return (
    <section aria-label='Lesson' className={styles.page}>
      <header className={styles.topbar}>
        <button
          className={styles.leave}
          type='button'
          onClick={() => dispatch({ type: 'nav', screen: 'today' })}>
          Leave
        </button>
        <progress
          className={styles.track}
          max={lesson.queue.length}
          value={lesson.i}
        />
        <span className={styles.count}>
          {lesson.i + 1} of {lesson.queue.length}
        </span>
      </header>

      <div className={styles.stage}>
        <div className={styles.specimen}>
          <div className={styles.crossV} />
          <div className={styles.crossH} />
          <p className={styles.glyph} lang='ja'>
            {item.char}
          </p>
        </div>
        <p className={styles.meta}>
          {typeLabel(item.type)} · Level {item.level} ·{' '}
          {item.strokes ? `${item.strokes} strokes` : 'component'}
        </p>

        <h1 className={styles.meaning}>
          {item.meaning}
          {item.alt.length ? `, ${item.alt.join(', ')}` : ''}
        </h1>

        <dl className={styles.facts}>
          <dt>{readingALabel}</dt>
          <dd lang='ja'>{readingA || '—'}</dd>
          <dt>{readingBLabel}</dt>
          <dd lang='ja'>{readingB || '—'}</dd>
          <dt>Built from</dt>
          <dd lang='ja'>{built || '—'}</dd>
        </dl>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Mnemonic</h2>
        <p className={styles.mnemonic}>{mnemonicFor(item, state.custom)}</p>
      </div>

      <div className={styles.nav}>
        <button
          className={styles.prev}
          type='button'
          disabled={lesson.i === 0}
          onClick={() => dispatch({ type: 'lessons/prev' })}>
          Previous
        </button>
        <button
          className={styles.next}
          type='button'
          onClick={() =>
            last
              ? dispatch({ type: 'lessons/commit', now })
              : dispatch({ type: 'lessons/next' })
          }>
          {last ? `Enter all ${lesson.queue.length} into the schedule` : 'Next'}
        </button>
      </div>
    </section>
  );
}
