import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/Button"
import { createIncident } from "../services/incidents.service"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/app/context/useToast"
import { socket } from "../services/socket"
import type { Incident } from "../types/incident.types"
import { useTranslation } from "react-i18next"
import styles from "@/features/incidents/pages/CreateIncidentPage.module.scss"
import { incidentQueryKeys } from "../queryKeys"

export const CreateIncidentPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { t } = useTranslation()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignee, setAssignee] = useState("")

  const { mutate: create, isPending } = useMutation({
    mutationFn: createIncident,
    onSuccess: (data: Incident) => {
      console.log("[Mutation] createIncident success", data)
      queryClient.invalidateQueries({ queryKey: incidentQueryKeys.lists() })
      showToast(t("toast.incidentCreated"), "success")
      navigate("/incidents")
    },
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{t("incidents.create.title")}</h2>
        <p>{t("incidents.create.subtitle")}</p>
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
          <label htmlFor="assignee">{t("incidents.create.assignee")}</label>
          <input
            id="assignee"
            type="text"
            className={styles.input}
            placeholder={t("incidents.create.assigneePlaceholder")}
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="title">{t("incidents.create.titleLabel")}</label>
          <input
            id="title"
            type="text"
            className={styles.input}
            placeholder={t("incidents.create.titlePlaceholder")}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">{t("incidents.create.description")}</label>
          <textarea
            id="description"
            className={styles.textarea}
            placeholder={t("incidents.create.descriptionPlaceholder")}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="priority">{t("incidents.create.priority")}</label>
          <select
            id="priority"
            className={styles.select}
            value={priority}
            onChange={(event) => setPriority(event.target.value as "low" | "medium" | "high")}
          >
            <option value="low">{t("incidents.create.lowOption")}</option>
            <option value="medium">{t("incidents.create.mediumOption")}</option>
            <option value="high">{t("incidents.create.highOption")}</option>
          </select>
        </div>

        <div className={styles.actions}>
          <Button label={t("common.cancel")} variant="secondary" onClick={() => navigate("/incidents")} type="button" />
          <Button label={t("incidents.create.createButton")} type="submit" disabled={isPending} />
        </div>
      </form>
    </div>
  )
}
