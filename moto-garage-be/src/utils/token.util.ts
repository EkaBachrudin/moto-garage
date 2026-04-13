import { randomBytes, createHash } from 'crypto';

/**
 * Generate random refresh token (256-bit / 64 hex characters)
 * @returns Random token string
 */
export const generateRefreshToken = (): string => {
  return randomBytes(32).toString('hex');
};

/**
 * Hash refresh token for storage
 * @param token - Plain refresh token
 * @returns Hashed token
 */
export const hashRefreshToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Generate CSRF token
 * @returns Random CSRF token
 */
export const generateCSRFToken = (): string => {
  return randomBytes(32).toString('base64url');
};

/**
 * Parse device info from user agent
 * @param userAgent - User agent string
 * @returns Device info object
 */
export const parseDeviceInfo = (userAgent?: string): Record<string, string> => {
  const info: Record<string, string> = {
    device_type: 'unknown',
    os: 'unknown',
    browser: 'unknown',
  };

  if (!userAgent) {
    return info;
  }

  const ua = userAgent.toLowerCase();

  // Detect device type
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    info.device_type = 'mobile';
  } else if (/tablet|ipad|kindle|silk/i.test(ua)) {
    info.device_type = 'tablet';
  } else {
    info.device_type = 'desktop';
  }

  // Detect OS
  if (/windows/i.test(ua)) {
    info.os = 'Windows';
  } else if (/macintosh|mac os x/i.test(ua)) {
    info.os = 'macOS';
  } else if (/linux/i.test(ua)) {
    info.os = 'Linux';
  } else if (/android/i.test(ua)) {
    info.os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    info.os = 'iOS';
  }

  // Detect browser
  if (/edg/i.test(ua)) {
    info.browser = 'Edge';
  } else if (/chrome/i.test(ua)) {
    info.browser = 'Chrome';
  } else if (/firefox/i.test(ua)) {
    info.browser = 'Firefox';
  } else if (/safari/i.test(ua)) {
    info.browser = 'Safari';
  } else if (/opr/i.test(ua)) {
    info.browser = 'Opera';
  }

  return info;
};
