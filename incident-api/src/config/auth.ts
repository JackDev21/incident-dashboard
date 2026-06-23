export const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables")
  }

  return jwtSecret
}
