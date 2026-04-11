const USER_API_URL = `${import.meta.env.VITE_API_URL}/users`

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${USER_API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Registration failed")
    }

    const data: AuthResponse = await response.json()
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem("auth_user", JSON.stringify(data.user))
    return data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${USER_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Login failed")
    }

    const data: AuthResponse = await response.json()
    localStorage.setItem("auth_token", data.token)
    localStorage.setItem("auth_user", JSON.stringify(data.user))
    return data
  },

  logout(): void {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  },

  getToken(): string | null {
    return localStorage.getItem("auth_token")
  },

  getUser(): User | null {
    const user = localStorage.getItem("auth_user")
    return user ? JSON.parse(user) : null
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token")
  },
}
