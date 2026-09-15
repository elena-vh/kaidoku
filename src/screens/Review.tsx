import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useApp, useDispatch, useNow } from '../state/AppContext.tsx';
import type { SessionState } from '../state/reducer.ts';
import { CATALOGUE, itemById } from '../data/catalogue.ts';
import { dueQueue } from '../engine/queues.ts';
import { stageName } from '../engine/intervals.ts';
import { pct, typeLabel } from '../lib/format.ts';
import { verdictCopy } from '../lib/verdict.ts';
import styles from './Review.module.css';

export function ReviewScreen() {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();
  const inputRef = useRef<HTMLInputElement>(null);

  const { session, verdict } = state;
  const active = !!session && session.i < session.queue.length;
  const id = active ? session.queue[session.i] : undefined;
  const item = id ? itemById(id) : undefined;

  // Refocus the input for every card and after every advance, so the whole
  // session runs on the keyboard. While a verdict shows, leave focus alone.
  const answeredCard = active && !verdict;
  useEffect(() => {
    if (answeredCard) inputRef.current?.focus();
  });

  if (!session) return null;
  if (!active || !item || !id) return <SessionSummary session={session} />;

  const progress = state.progress[id];
  const stage = progress?.stage ?? 0;
  const answered = session.right + session.wrong;
  const copy = verdict ? verdictCopy(verdict, item, state.custom) : null;
  const locked = !!verdict && verdict.kind !== 'near';
  const showReading =
    state.settings.hints && (item.reading !== '' || item.on !== '');

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    // one keystroke does exactly one thing: advance if a verdict is up, else submit
    if (verdict) dispatch({ type: 'review/advance' });
    else dispatch({ type: 'review/submit', now });
  };

  return (
    <section aria-label='Review session' className={styles.page}>
      <header className={styles.topbar}>
        <button
          className={styles.close}
          type='button'
          onClick={() => dispatch({ type: 'review/end' })}>
          Close
        </button>
        <progress
          className={styles.track}
          max={session.queue.length}
          value={session.done}
          aria-label='Session progress'
        />
        <span className={styles.tally}>
          <span className={styles.count}>
            {Math.min(session.done + 1, session.queue.length)} of{' '}
            {session.queue.length}
          </span>
          <span>
            {answered > 0
              ? `${pct(session.right, answered)} correct`
              : 'no answers yet'}
          </span>
        </span>
      </header>

      <article className={styles.stage}>
        <p className={styles.kicker}>
          {typeLabel(item.type)} · {stageName(stage)}
        </p>
        <div className={styles.specimen}>
          <div className={styles.crossV} />
          <div className={styles.crossH} />
          <p className={styles.glyph} lang='ja'>
            {item.char}
          </p>
        </div>
        {showReading && (
          <p className={styles.reading} lang='ja'>
            {item.reading || item.on}
          </p>
        )}
      </article>

      <div className={styles.answerBlock}>
        <label className={styles.label} htmlFor='review-answer'>
          Meaning in English
        </label>
        <input
          className={styles.input}
          id='review-answer'
          ref={inputRef}
          type='text'
          value={state.answer}
          onChange={(e) =>
            dispatch({ type: 'review/type', value: e.target.value })
          }
          onKeyDown={onKeyDown}
          readOnly={locked}
          aria-readonly={locked}
          autoComplete='off'
          spellCheck={false}
          placeholder='type, then press return'
        />
        {!verdict && (
          <p className={styles.hint}>Meaning only · return to answer</p>
        )}
      </div>

      <div className={styles.status} aria-live='polite' role='status'>
        {copy && (
          <div className={`${styles.verdict} ${styles[copy.tone]}`}>
            <h2 className={styles.verdictTitle}>{copy.title}</h2>
            <p className={styles.verdictMove}>{copy.stageMove}</p>
            <p className={styles.verdictBody}>{copy.body}</p>
            {copy.mnemonic && (
              <p className={styles.verdictMnemonic}>{copy.mnemonic}</p>
            )}
            <div className={styles.verdictActions}>
              <button
                className={styles.cta}
                type='button'
                onClick={() => dispatch({ type: 'review/advance' })}>
                {copy.cta}
              </button>
              {verdict && verdict.kind !== 'near' && (
                <button
                  className={styles.secondary}
                  type='button'
                  onClick={() =>
                    dispatch({ type: 'nav', screen: 'entry', entryId: id })
                  }>
                  Open the entry
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SessionSummary({ session }: { session: SessionState }) {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();

  const answered = session.right + session.wrong;
  const dropped = Object.keys(session.wrongIds).length;
  const due = dueQueue(CATALOGUE, state.progress, now);
  const cap = state.settings.cap;

  return (
    <section aria-label='Session complete' className={styles.summary}>
      <h1 className={styles.summaryHeading}>
        {answered === 0
          ? 'Nothing answered'
          : `${pct(session.right, answered)} correct, ${answered} answers`}
      </h1>
      <p className={styles.summaryBody}>
        {dropped === 0
          ? 'Every item advanced a rank. The next of them returns in four hours.'
          : `${dropped} item${dropped === 1 ? '' : 's'} dropped back down the ladder. They are listed under Trouble if they keep it up.`}
      </p>
      <div className={styles.summaryActions}>
        <button
          className={styles.secondary}
          type='button'
          onClick={() => dispatch({ type: 'review/end' })}>
          Back to Today
        </button>
        <button
          className={styles.cta}
          type='button'
          disabled={due.length === 0}
          onClick={() =>
            dispatch({
              type: 'review/start',
              ids: due.slice(0, cap).map((i) => i.id),
              from: 'today',
            })
          }>
          Keep going
        </button>
      </div>
    </section>
  );
}
