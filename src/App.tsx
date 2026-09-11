import { AppProvider, useApp } from './state/AppContext.tsx';
import { Header } from './components/Header.tsx';
import { TodayScreen } from './screens/Today.tsx';
import { LessonScreen } from './screens/Lesson.tsx';
import { ReviewScreen } from './screens/Review.tsx';
import { Trouble } from './screens/Trouble.tsx';
import type { Screen } from './state/reducer.ts';

function NotBuilt({ screen }: { screen: Screen }) {
  return (
    <section aria-label={screen}>
      <h1>{screen}</h1>
      <p>This screen is not built yet.</p>
    </section>
  );
}

function Router() {
  const { screen } = useApp();
  switch (screen) {
    case 'review':
      return <ReviewScreen />;
    case 'lesson':
      return <LessonScreen />;
    case 'trouble':
      return <Trouble />;
    case 'today':
      return <TodayScreen />;
    default:
      return <NotBuilt screen={screen} />;
  }
}

function Chrome() {
  const { screen } = useApp();
  const showHeader = screen !== 'landing' && screen !== 'review';
  return (
    <>
      {showHeader && <Header />}
      <Router />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Chrome />
    </AppProvider>
  );
}
