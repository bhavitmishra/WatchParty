import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const otpReqLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 3,                 // max 3 OTP requests
    message: {
        msg: "Too many OTP requests. Try again later."
    },
      keyGenerator: (req) => {
    // Use the helper so IPv6 addresses are normalized correctly
    return ipKeyGenerator(req.ip) + '-' + (req.body.email || req.body.phone || '');
      }
});
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 5,                   // Limit each IP/user to 5 attempts per window
  standardHeaders: true,    // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false,     // Disable the X-RateLimit-* headers
  message: { error: 'Too many verification attempts. Please try again later.' },
  keyGenerator: (req) => {
    // Use the helper so IPv6 addresses are normalized correctly
    return ipKeyGenerator(req.ip) + '-' + (req.body.email || req.body.phone || '');
  }
});
