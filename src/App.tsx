import { AppProvider, useApp } from './state/AppContext.tsx'
import { TodayScreen } from './screens/Today.tsx'
import { LessonScreen } from './screens/Lesson.tsx'
import { ReviewScreen } from './screens/Review.tsx'

function Router() {
  const { screen } = useApp()
  switch (screen) {
    case 'review':
      return <ReviewScreen />
    case 'lesson':
      return <LessonScreen />
    case 'today':
      return <TodayScreen />
    default:
      return <TodayScreen />
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
