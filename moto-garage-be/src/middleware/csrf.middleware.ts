import { Request, Response, NextFunction } from 'express';

/**
 * CSRF validation middleware
 * Validates CSRF token for state-changing operations (POST, PUT, DELETE, PATCH)
 */
export const validateCSRF = (req: Request, res: Response, next: NextFunction) => {
  // Skip validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const tokenCookie = req.cookies?.csrf_token;
  const tokenHeader = req.headers['x-csrf-token'] as string;

  if (!tokenCookie || !tokenHeader || tokenCookie !== tokenHeader) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      error_code: 'AUTH_006',
    });
  }

  next();
};
