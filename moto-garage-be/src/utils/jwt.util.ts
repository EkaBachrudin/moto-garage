import jwt, { type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authConfig } from '../config/auth';

export interface JWTPayload {
  jti: string;
  sub: string;
  email: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  session_id: string;
}

/**
 * Generate access token (JWT)
 * @param userId - User ID
 * @param email - User email
 * @param sessionId - Session ID
 * @returns JWT access token
 */
export const generateAccessToken = (userId: string, email: string, sessionId: string): string => {
  const jti = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  const payload = {
    jti,
    sub: userId,
    email,
    iat: now,
    iss: authConfig.jwt.issuer,
    aud: authConfig.jwt.audience,
    session_id: sessionId,
  };

  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.accessExpiry,
  } as jwt.SignOptions);
};

/**
 * Verify and decode JWT
 * @param token - JWT token
 * @returns Decoded payload or null if invalid
 */
export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract JWT ID (jti) from token without verification
 * @param token - JWT token
 * @returns JWT ID or null
 */
export const getJTI = (token: string): string | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded?.jti || null;
  } catch {
    return null;
  }
};
