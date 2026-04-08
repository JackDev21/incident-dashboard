import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { createIncident } from "../services/incidents.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/app/context/useToast"
import { socket } from "../services/socket"
import type { Incident } from "../types/incident.types"
import styles from "@/features/incidents/pages/CreateIncidentPage.module.scss"

export const CreateIncidentPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignee, setAssignee] = useState("")

  const { mutate: create, isPending } = useMutation({
    mutationFn: createIncident,
    onSuccess: (data: Incident) => {
      console.log("[Mutation] createIncident success", data)
      queryClient.invalidateQueries({ queryKey: ["incidents"] })
      showToast("New incident created", "success")
      navigate("/incidents")
    },
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Create New Incident</h2>
        <p>Report a new issue or incident to the team.</p>
      </div>

      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()

          if (!title.trim() || !description.trim()) return

          const payload: Omit<Incident, "id" | "createdAt"> = { title, description, priority, assignee, status: "open" }
          console.log("[WS] creating incident, socket.id=", socket.id, "connected=", socket.connected)
          if (!socket.connected) {
            socket.once("connect", () => {
              console.log("[WS] socket connected, sending create request")
              create(payload)
            })
          } else {
            create(payload)
          }
        }}
      >
        <div className={styles.formGroup}>
          <label htmlFor="assignee">Assignee</label>
          <input
            id="assignee"
            type="text"
            className={styles.input}
            placeholder="Name of the person assigned"
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            className={styles.input}
            placeholder="Brief summary of the incident"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className={styles.textarea}
            placeholder="Provide detailed information about the incident..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            className={styles.select}
            value={priority}
            onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")}
          >
            <option value="low">Low - Minor impact</option>
            <option value="medium">Medium - Moderate impact</option>
            <option value="high">High - Critical impact</option>
          </select>
        </div>

        <div className={styles.actions}>
          <Button label="Cancel" variant="secondary" onClick={() => navigate("/incidents")} type="button" />
          <Button label="Create Incident" type="submit" disabled={isPending} />
        </div>
      </form>
    </div>
  )
}
