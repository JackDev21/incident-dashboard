import { BrowserRouter, Routes, Route } from "react-router-dom"
import { IncidentListPage } from "@/features/incidents/pages/IncidentListPage"
import { IncidentDetailPage } from "@/features/incidents/pages/IncidentDetailPage"
import { CreateIncidentPage } from "@/features/incidents/pages/CreateIncidentPage"

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IncidentListPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/incidents/create" element={<CreateIncidentPage />} />
      </Routes>
    </BrowserRouter>
  )
}
