import { lazy } from 'react'

// The team lab (editor, analysis, stats math) is only needed once the user opens it:
// load it on demand. Render it inside <Suspense>.
export const TeamLab = lazy(() => import('./components/TeamLab'))
export { AddToTeamDialog } from './components/AddToTeamDialog'
export { createDefaultTeams, useTeamStore } from './store/teamStore'
