import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { createIncident } from "../services/incidents.service"

export const CreateIncidentPage = () => {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault()

        if (!title.trim() || !description.trim()) {
          return
        }

        await createIncident({ title, description, priority, assignee: "Me", status: "open" })
        navigate("/")
      }}
    >
      <h2>Create Incident</h2>

      <input type="text" placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <select value={priority} onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <Button label="Create incident" />
    </form>
  )
}
