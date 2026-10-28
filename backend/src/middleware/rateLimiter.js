import rateLimit from "express-rate-limit";

// Generic JSON response formatter for rate limit errors
const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    title: "Too Many Requests",
    message,
    retryAfterSeconds: Math.ceil(res.getHeader("Retry-After") || 60),
  });
};

// 1. Authentication Limiter (Login endpoints)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many login attempts from this IP. Please try again after 15 minutes."),
});

// 2. OTP Verification Limiter
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many verification attempts from this IP. Please wait before trying again."),
});

// 3. OTP Resend & Password Reset Request Limiter
export const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many verification code requests from this IP. Please wait before requesting another code."),
});

// 4. AI Chatbot API Abuse Limiter
export const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Chat assistant rate limit exceeded. Please wait a few minutes before sending more messages."),
});

// 5. Contact Form Limiter
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many contact inquiries from this IP. Please wait before submitting another message."),
});

// 6. General API Limiter (broad DDoS / abuse protection)
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many requests from this IP. Please slow down."),
});
