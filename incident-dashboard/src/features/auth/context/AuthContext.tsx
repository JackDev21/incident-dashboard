import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"
import { authService } from "../services/auth.service"
import type { User } from "../services/auth.service"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(authService.getUser())
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  const [isLoading] = useState(false)

  const register = async (name: string, email: string, password: string) => {
    await authService.register(name, email, password)
    const newUser = authService.getUser()
    setUser(newUser)
    setIsAuthenticated(true)
  }

  const login = async (email: string, password: string) => {
    await authService.login(email, password)
    const newUser = authService.getUser()
    setUser(newUser)
    setIsAuthenticated(true)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
