import { AppRouter } from "@/app/router/AppRouter"
import { useIncidentSocket } from "@/features/incidents/hooks/useIncidentSocket"
import { AuthProvider } from "@/features/auth/context/AuthContext"

const App = () => {
  useIncidentSocket()
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
