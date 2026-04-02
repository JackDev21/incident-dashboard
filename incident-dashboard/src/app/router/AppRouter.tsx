import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { IncidentListPage } from "@/features/incidents/pages/IncidentListPage"
import { IncidentDetailPage } from "@/features/incidents/pages/IncidentDetailPage"
import { CreateIncidentPage } from "@/features/incidents/pages/CreateIncidentPage"
import { Layout } from "@/components/layout/Layout"

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/incidents" replace />} />
          <Route path="/incidents" element={<IncidentListPage />} />
          <Route path="/incidents/create" element={<CreateIncidentPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
