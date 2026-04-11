import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { IncidentListPage } from "@/features/incidents/pages/IncidentListPage"
import { IncidentDetailPage } from "@/features/incidents/pages/IncidentDetailPage"
import { CreateIncidentPage } from "@/features/incidents/pages/CreateIncidentPage"
import { Layout } from "@/components/layout/Layout"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"
import { useAuth } from "@/features/auth/context/AuthContext"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/incidents" replace />} />
          <Route path="/incidents" element={<IncidentListPage />} />
          <Route path="/incidents/create" element={<CreateIncidentPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
