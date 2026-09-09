import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useApp, useDispatch, useNow } from '../state/AppContext.tsx';
import type { SessionState } from '../state/reducer.ts';
import { CORPUS, itemById } from '../data/corpus.ts';
import { dueQueue } from '../engine/queues.ts';
import { stageName } from '../engine/intervals.ts';
import { pct, typeLabel } from '../lib/format.ts';
import { verdictCopy } from '../lib/verdict.ts';

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
    <section aria-label='Review session'>
      <header>
        <button type='button' onClick={() => dispatch({ type: 'review/end' })}>
          Close
        </button>
        <progress
          max={session.queue.length}
          value={session.done}
          aria-label='Session progress'
        />
        <span>
          {Math.min(session.done + 1, session.queue.length)} of{' '}
          {session.queue.length}
        </span>
        <span>
          {answered > 0
            ? `${pct(session.right, answered)} correct`
            : 'no answers yet'}
        </span>
      </header>

      <article>
        <p>
          {typeLabel(item.type)} · {stageName(stage)}
        </p>
        <p lang='ja' style={{ fontSize: '3rem' }}>
          {item.char}
        </p>
        {showReading && <p lang='ja'>{item.reading || item.on}</p>}
      </article>

      <div>
        <label htmlFor='review-answer'>Meaning in English</label>
        <input
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
      </div>

      <div aria-live='polite' role='status'>
        {copy && (
          <div>
            <h2>{copy.title}</h2>
            <p>{copy.stageMove}</p>
            <p>{copy.body}</p>
            {copy.mnemonic && <p>{copy.mnemonic}</p>}
            <button
              type='button'
              onClick={() => dispatch({ type: 'review/advance' })}>
              {copy.cta}
            </button>
            {verdict && verdict.kind !== 'near' && (
              <button
                type='button'
                onClick={() =>
                  dispatch({ type: 'nav', screen: 'entry', entryId: id })
                }>
                Open the entry
              </button>
            )}
          </div>
        )}
      </div>

      {!verdict && <p>Meaning only · return to answer</p>}
    </section>
  );
}

function SessionSummary({ session }: { session: SessionState }) {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();

  const answered = session.right + session.wrong;
  const dropped = Object.keys(session.wrongIds).length;
  const due = dueQueue(CORPUS, state.progress, now);
  const cap = state.settings.cap;

  return (
    <section aria-label='Session complete'>
      <h1>
        {answered === 0
          ? 'Nothing answered'
          : `${pct(session.right, answered)} correct, ${answered} answers`}
      </h1>
      <p>
        {dropped === 0
          ? 'Every item advanced a rank. The next of them returns in four hours.'
          : `${dropped} item${dropped === 1 ? '' : 's'} dropped back down the ladder. They are listed under Trouble if they keep it up.`}
      </p>
      <button type='button' onClick={() => dispatch({ type: 'review/end' })}>
        Back to Today
      </button>
      <button
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
    </section>
  );
}
