import { NextApiRequest, NextApiResponse } from 'next';
import rateLimiter from '@/utils/rateLimiter';

// Default rate limit options
const DEFAULT_OPTIONS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later'
};

// More strict options for authentication endpoints
const AUTH_OPTIONS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 login attempts per windowMs
  message: 'Too many login attempts, please try again later'
};

/**
 * Get client IP address from request
 */
const getClientIp = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(/, /)[0] 
    : req.socket.remoteAddress || 'unknown';
  return ip || 'unknown';
};

/**
 * Rate limiting middleware for Next.js API routes
 * @param options Rate limiting options
 */
export const withRateLimit = (options = DEFAULT_OPTIONS) => {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // Get client IP
      const clientIp = getClientIp(req);
      
      // Create a unique key based on the IP and endpoint
      const key = `${clientIp}:${req.url}`;
      
      // Check rate limit
      const result = rateLimiter.check(key, options);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());
      
      // If rate limit exceeded, return 429 Too Many Requests
      if (!result.allowed) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded', 
          message: result.message 
        });
      }
      
      // Continue to the API route handler
      return handler(req, res);
    };
  };
};

/**
 * Rate limiting middleware specifically for authentication endpoints
 */
export const withAuthRateLimit = () => withRateLimit(AUTH_OPTIONS);

export default withRateLimit;
