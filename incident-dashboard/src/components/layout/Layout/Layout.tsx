import { Outlet } from "react-router-dom"
import { Header } from "../Header"
import { ChatBubble } from "@/features/chat/components/ChatBubble"
import { ChatFiltersProvider } from "@/features/chat/context/ChatFiltersProvider"
import styles from "./Layout.module.scss"

export const Layout = () => {
  return (
    <ChatFiltersProvider>
      <div className={styles.layout}>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <Outlet />
          </div>
        </main>
        <ChatBubble />
      </div>
    </ChatFiltersProvider>
  )
}
