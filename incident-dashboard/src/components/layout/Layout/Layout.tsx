import { Outlet } from "react-router-dom"
import { Header } from "../Header"
import { ChatBubble } from "@/features/chat/components/ChatBubble"
import styles from "./Layout.module.scss"

export const Layout = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
      <ChatBubble />
    </div>
  )
}
