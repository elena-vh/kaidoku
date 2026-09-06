/* eslint-disable react-refresh/only-export-components -- provider + its hooks belong together */

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react'
import type { Action, AppState } from './reducer.ts'
import { initialState, persistable, reducer } from './reducer.ts'
import { load, save } from '../engine/storage.ts'

const StateContext = createContext<AppState | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)
const NowContext = createContext<number>(0)

const TICK_MS = 60_000

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () =>
    initialState(load() ?? undefined),
  )

  useEffect(() => {
    save(persistable(state))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- persist only when the stored slice changes
  }, [
    state.progress,
    state.custom,
    state.settings,
    state.level,
    state.stats,
    state.offset,
  ])

  // The current instant isn't reactive on its own, so it lives in state and an
  // interval refreshes it - anything memoised on `now` re-derives with it.
  const [now, setNow] = useState(0)
  useEffect(() => {
    const update = () => {
      setNow(Date.now() + state.offset)
    }
    update()
    const id = setInterval(update, TICK_MS)
    return () => clearInterval(id)
  }, [state.offset])

  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>
        <NowContext value={now}>{children}</NowContext>
      </DispatchContext>
    </StateContext>
  )
}

export function useApp(): AppState {
  const state = useContext(StateContext)
  if (!state) throw new Error('useApp must be used within <AppProvider>')
  return state
}

export function useDispatch(): Dispatch<Action> {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useDispatch must be used within <AppProvider>')
  return dispatch
}

export function useNow(): number {
  return useContext(NowContext)
}
