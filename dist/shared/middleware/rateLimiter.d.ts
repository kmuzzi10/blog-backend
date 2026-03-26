/**
 * 🛡️ Authentication Rate Limiter
 * Deep protection for login and registration attempts to prevent brute-force attacks.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * 📝 Content Creation Rate Limiter
 * Prevents spam by limiting the rate of post and comment creation.
 */
export declare const contentLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * 🔍 Search Rate Limiter
 * Protects deep aggregation queries from being overloaded.
 */
export declare const searchLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimiter.d.ts.map