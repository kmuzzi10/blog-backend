import rateLimit from 'express-rate-limit';

/**
 * 🛡️ Authentication Rate Limiter
 * Deep protection for login and registration attempts to prevent brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 authentication requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 📝 Content Creation Rate Limiter
 * Prevents spam by limiting the rate of post and comment creation.
 */
export const contentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 15, // Limit each IP to 15 creation requests per hour
  message: {
    success: false,
    message: 'Content creation limit reached. To prevent spam, please wait before posting again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 🔍 Search Rate Limiter
 * Protects deep aggregation queries from being overloaded.
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 30, // Limit each IP to 30 searches per minute
  message: {
    success: false,
    message: 'Slow down! Search limit reached. Please wait a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
