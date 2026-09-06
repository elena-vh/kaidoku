// Placeholder Today - the way into the review loop. The full screen (counts,
// level progress, leech shortlist) comes later.

import { useApp, useDispatch, useNow } from '../state/AppContext.tsx'
import { CORPUS } from '../data/corpus.ts'
import { dueQueue } from '../engine/queues.ts'

export function TodayScreen() {
  const state = useApp()
  const dispatch = useDispatch()
  const now = useNow()

  const due = dueQueue(CORPUS, state.progress, now)

  return (
    <section aria-label="Today">
      <h1>Kaidoku</h1>
      <p>Level {state.level}</p>

      <p>
        {due.length === 0
          ? 'The queue is empty. Nothing is owed until the next interval falls due.'
          : `${due.length} review${due.length === 1 ? '' : 's'} due.`}
      </p>
      <button
        type="button"
        disabled={due.length === 0}
        onClick={() =>
          dispatch({
            type: 'review/start',
            ids: due.slice(0, state.settings.cap).map((i) => i.id),
            from: 'today',
          })
        }
      >
        Begin reviews
      </button>
    </section>
  )
}
