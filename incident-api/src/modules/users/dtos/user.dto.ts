import { z } from "zod"

export const RegisterUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }).trim(),
  email: z.email({ message: "Invalid email" }).trim().toLowerCase(),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
})

export const LoginUserSchema = z.object({
  email: z.email({ message: "Invalid email" }).trim().toLowerCase(),
  password: z.string().min(1, { message: "Password is required" }),
})

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>
export type LoginUserDTO = z.infer<typeof LoginUserSchema>
