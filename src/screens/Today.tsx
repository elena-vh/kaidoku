import { useApp, useDispatch, useNow } from '../state/AppContext.tsx';
import { CATALOGUE } from '../data/catalogue.ts';
import { dueQueue, lessonQueue } from '../engine/queues.ts';
import styles from './Today.module.css';

export function TodayScreen() {
  const state = useApp();
  const dispatch = useDispatch();
  const now = useNow();

  const due = dueQueue(CATALOGUE, state.progress, now);
  const lessons = lessonQueue(CATALOGUE, state.progress, state.level);

  return (
    <section aria-label='Today' className={styles.container}>
      <h1 className={styles.greeting}>Good morning, reader</h1>
      <p>Level {state.level}</p>
      <div className={styles.cardsContainer}>
        <div className={styles.reviewsCard}>
          <p>
            {due.length === 0
              ? 'The queue is empty. Nothing is owed until the next interval falls due.'
              : `${due.length} review${due.length === 1 ? '' : 's'} due.`}
          </p>
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
        <div className={styles.lessonsCard}>
          <p>
            {lessons.length} lesson{lessons.length === 1 ? '' : 's'} open.
          </p>
          <button
            type='button'
            disabled={lessons.length === 0}
            onClick={() =>
              dispatch({
                type: 'lessons/start',
                ids: lessons.slice(0, state.settings.batch).map((i) => i.id),
              })
            }>
            Take{' '}
            {Math.min(
              state.settings.batch,
              lessons.length || state.settings.batch,
            )}{' '}
            lessons
          </button>
        </div>
        <div className={styles.nextArrivalCard}>
          <p>Next arrival</p>
          <p>in 13 hours</p>
        </div>
      </div>
    </section>
  );
}
