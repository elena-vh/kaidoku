import { useApp, useDispatch } from '../state/AppContext.tsx';
import type { Screen } from '../state/reducer.ts';
import styles from './Header.module.css';
const LINKS: { screen: Screen; label: string }[] = [
  { screen: 'today', label: 'Today' },
  { screen: 'levels', label: 'Levels' },
  { screen: 'browse', label: 'Catalogue' },
  { screen: 'progress', label: 'Progress' },
  { screen: 'trouble', label: 'Trouble' },
  { screen: 'settings', label: 'Settings' },
];

export function Header() {
  const state = useApp();
  const dispatch = useDispatch();

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.mark} lang='ja'>
            解
          </span>
          <span>Kaidoku</span>
        </div>
        <nav aria-label='Main' className={styles.nav}>
          {LINKS.map(({ screen, label }) => (
            <button
              className={styles.button}
              key={screen}
              type='button'
              aria-current={state.screen === screen ? 'page' : undefined}
              onClick={() => dispatch({ type: 'nav', screen })}>
              {label}
            </button>
          ))}
        </nav>
        <span className={styles.level}>Level {state.level}</span>
      </div>
    </header>
  );
}
