import rateLimit from "express-rate-limit"
import helmet from "helmet"

/**
 * Global rate limit: Protects the application from basic DoS attacks.
 * Allows 100 requests every 15 minutes per IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Returns rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disables `X-RateLimit-*` headers
})

/**
 * Strict Chat rate limit: Protects the LLM API.
 * Chat is expensive and slow, so we limit it to 10 questions every 15 minutes.
 */
export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    error: "You have reached the chat question limit. Please wait a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

export { helmet }
