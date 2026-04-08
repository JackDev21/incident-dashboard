import { AppRouter } from "@/app/router/AppRouter"
import { useIncidentSocket } from "@/features/incidents/hooks/useIncidentSocket"

const App = () => {
  useIncidentSocket()
  return <AppRouter />
}

export default App
