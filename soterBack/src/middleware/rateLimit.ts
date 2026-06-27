import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Demasiados intentos de inicio de sesión. Por favor intente de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const email = req.body?.email || '';
    return `${ip}:${email}`;
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Por favor intente de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
});

export const aiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Demasiadas solicitudes de IA. Por favor intente de nuevo en 5 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
});
