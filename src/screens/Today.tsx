import { useApp, useDispatch, useNow } from '../state/AppContext.tsx';
import { CATALOGUE } from '../data/catalogue.ts';
import {
  dueQueue,
  lessonQueue,
  levelAdeptProgress,
  nextArrival,
  repeatedlyFailed,
} from '../engine/queues.ts';
import { rankCounts } from '../engine/insights.ts';
import { STAGES, stageName } from '../engine/intervals.ts';
import { dateLine, partOfDay, pct, until } from '../lib/format.ts';
import styles from './Today.module.css';

const LEARNER = 'reader';
const MINUTES_PER_REVIEW = 0.28;
const BACKLOG = 30;

export function TodayScreen() {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();

  const due = dueQueue(CATALOGUE, state.progress, now);
  const lessons = lessonQueue(CATALOGUE, state.progress, state.level);
  const arrival = nextArrival(CATALOGUE, state.progress, now);
  const level = levelAdeptProgress(state.level, state.progress, CATALOGUE);
  const ranks = rankCounts(state.progress);
  const rankMax = Math.max(1, ...ranks);
  const stuck = repeatedlyFailed(CATALOGUE, state.progress).slice(0, 4);

  const batchSize = Math.min(
    state.settings.batch,
    lessons.length || state.settings.batch,
  );

  const dueBlurb =
    due.length === 0
      ? 'The queue is empty. Nothing is owed until the next interval falls due.'
      : due.length > BACKLOG
        ? 'A backlog. Take the cap and leave the rest; the schedule will not punish you twice.'
        : `Roughly ${Math.max(1, Math.round(due.length * MINUTES_PER_REVIEW))} minutes at your usual pace.`;

  const lessonBlurb =
    lessons.length === 0
      ? 'Nothing new is open. Advance the level, or let the words unlock themselves.'
      : `Next up: ${lessons
          .slice(0, 4)
          .map((i) => i.char)
          .join(' · ')}${lessons.length > 4 ? ' …' : ''}`;

  return (
    <section aria-label='Today' className={styles.container}>
      <p className={styles.date}>{dateLine(now)}</p>
      <h1 className={styles.greeting}>
        Good {partOfDay(now)}, {LEARNER}.
      </h1>
      <p className={styles.tally}>{state.stats.todayReviews} reviews today</p>

      <div className={styles.cardsContainer}>
        <div className={`${styles.card} ${styles.reviewsCard}`}>
          <span className={styles.kicker}>Reviews due</span>
          <span className={styles.count}>{due.length}</span>
          <p className={styles.blurb}>{dueBlurb}</p>
          <button
            type='button'
            disabled={due.length === 0}
            onClick={() =>
              dispatch({
                type: 'review/start',
                ids: due.slice(0, state.settings.cap).map((i) => i.id),
                from: 'today',
              })
            }>
            Begin reviews
          </button>
        </div>

        <div className={`${styles.card} ${styles.lessonsCard}`}>
          <span className={styles.kicker}>Lessons open</span>
          <span className={styles.count}>{lessons.length}</span>
          <p className={styles.blurb}>{lessonBlurb}</p>
          <button
            type='button'
            disabled={lessons.length === 0}
            onClick={() =>
              dispatch({
                type: 'lessons/start',
                ids: lessons.slice(0, state.settings.batch).map((i) => i.id),
              })
            }>
            Take {batchSize} lessons
          </button>
        </div>

        <div className={`${styles.card} ${styles.nextArrivalCard}`}>
          <div>
            <span className={styles.kicker}>Next arrival</span>
            <p className={styles.arrival}>
              {arrival === null ? 'Nothing scheduled' : until(arrival, now)}
            </p>
          </div>
          <div className={styles.levelBlock}>
            <span className={styles.kicker}>Level {state.level}</span>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ width: pct(level.atAdept, level.total) }}
              />
            </div>
            <p className={styles.levelLabel}>
              {level.atAdept} of {level.total} characters at Adept ·{' '}
              {level.needed} needed
            </p>
          </div>
        </div>
      </div>

      <div className={styles.panels}>
        <div>
          <h3 className={styles.panelTitle}>Standing by rank</h3>
          <div className={styles.rankList}>
            {STAGES.map((stage) => (
              <div className={styles.rankRow} key={stage.stage}>
                <span className={styles.rankName}>{stage.name}</span>
                <div className={styles.rankTrack}>
                  <div
                    className={styles.fill}
                    style={{ width: pct(ranks[stage.stage], rankMax) }}
                  />
                </div>
                <span className={styles.rankCount}>{ranks[stage.stage]}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={styles.panelTitle}>Not sticking</h3>
          <p className={styles.panelNote}>
            Failed three times or more. Rewrite the mnemonic rather than
            drilling it again.
          </p>
          <div className={styles.stuckList}>
            {stuck.length === 0 ? (
              <p className={styles.panelNote}>Nothing is stuck yet.</p>
            ) : (
              stuck.map((item) => {
                const progress = state.progress[item.id];
                return (
                  <button
                    className={styles.stuckTile}
                    key={item.id}
                    type='button'
                    onClick={() =>
                      dispatch({
                        type: 'nav',
                        screen: 'entry',
                        entryId: item.id,
                      })
                    }>
                    <span className={styles.stuckGlyph} lang='ja'>
                      {item.char}
                    </span>
                    <span className={styles.stuckBody}>
                      <span className={styles.stuckMeaning}>
                        {item.meaning}
                      </span>
                      <span className={styles.stuckDetail}>
                        {progress?.lapses ?? 0} failures ·{' '}
                        {stageName(progress?.stage ?? 0)} ·{' '}
                        {pct(progress?.correct ?? 0, progress?.seen ?? 0)}{' '}
                        correct
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
