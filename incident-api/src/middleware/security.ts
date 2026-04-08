import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

/**
 * Límite global: Protege la aplicación de ataques DoS básicos.
 * Permite 100 peticiones cada 15 minutos por IP.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, 
  message: {
    success: false,
    error: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.',
  },
  standardHeaders: true, // Retorna info de límite en las cabeceras `RateLimit-*`
  legacyHeaders: false, // Desactiva las cabeceras `X-RateLimit-*`
});

/**
 * Límite estricto para el Chat: Protege la API del LLM.
 */
export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    error: 'Has alcanzado el límite de preguntas del chat. Por favor, espera unos minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { helmet };
