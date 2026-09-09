import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { PersistedState } from '../types.ts';
import { defaultState, save } from '../engine/storage.ts';
import { AppProvider } from '../state/AppContext.tsx';
import App from '../App.tsx';

export function seedStorage(
  patch: Partial<PersistedState> = {},
): PersistedState {
  const state: PersistedState = { ...defaultState(), ...patch };
  save(state);
  return state;
}

export function renderApp(patch: Partial<PersistedState> = {}) {
  seedStorage(patch);
  return render(<App />);
}

export function renderWithProvider(
  ui: ReactElement,
  patch: Partial<PersistedState> = {},
) {
  seedStorage(patch);
  return render(<AppProvider>{ui}</AppProvider>);
}
