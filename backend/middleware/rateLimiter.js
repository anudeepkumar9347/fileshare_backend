const rateLimit = require('express-rate-limit');

// General limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login attempts, please try again later.',
});

// File operations limiter
const fileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests max
  message: 'Too many requests to file service. Please slow down.',
});

module.exports = { authLimiter, fileLimiter };
