// One item at a time; the final card commits the whole batch at once to stage 0
// due +4h, then offers to drill it straight away.

import { useApp, useDispatch, useNow } from '../state/AppContext.tsx';
import { itemById, partGlyphs } from '../data/corpus.ts';
import { mnemonicFor } from '../lib/verdict.ts';
import { typeLabel } from '../lib/format.ts';

export function LessonScreen() {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();

  const lesson = state.lesson;
  if (!lesson) return null;

  if (lesson.done) {
    return (
      <section aria-label='Lesson batch entered'>
        <h1>{lesson.queue.length} entries added to the schedule</h1>
        <p>
          Each one sits at Novice I and returns in four hours. Drilling them
          right away is the cheapest way to catch the ones that did not stick.
        </p>
        <button
          type='button'
          onClick={() => dispatch({ type: 'lessons/drill' })}>
          Drill the batch
        </button>
        <button
          type='button'
          onClick={() => dispatch({ type: 'nav', screen: 'today' })}>
          Not now
        </button>
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
    <section aria-label='Lesson'>
      <header>
        <button
          type='button'
          onClick={() => dispatch({ type: 'nav', screen: 'today' })}>
          Leave
        </button>
        <progress max={lesson.queue.length} value={lesson.i} />
        <span>
          {lesson.i + 1} of {lesson.queue.length}
        </span>
      </header>

      <p lang='ja' style={{ fontSize: '4rem' }}>
        {item.char}
      </p>
      <p>
        {typeLabel(item.type)} · Level {item.level} ·{' '}
        {item.strokes ? `${item.strokes} strokes` : 'component'}
      </p>

      <h1>
        {item.meaning}
        {item.alt.length ? `, ${item.alt.join(', ')}` : ''}
      </h1>

      <dl>
        <dt>{readingALabel}</dt>
        <dd lang='ja'>{readingA || '—'}</dd>
        <dt>{readingBLabel}</dt>
        <dd lang='ja'>{readingB || '—'}</dd>
        <dt>Built from</dt>
        <dd lang='ja'>{built || '—'}</dd>
      </dl>

      <h2>Mnemonic</h2>
      <p>{mnemonicFor(item, state.custom)}</p>

      <button
        type='button'
        disabled={lesson.i === 0}
        onClick={() => dispatch({ type: 'lessons/prev' })}>
        Previous
      </button>
      <button
        type='button'
        onClick={() =>
          last
            ? dispatch({ type: 'lessons/commit', now })
            : dispatch({ type: 'lessons/next' })
        }>
        {last ? `Enter all ${lesson.queue.length} into the schedule` : 'Next'}
      </button>
    </section>
  );
}
