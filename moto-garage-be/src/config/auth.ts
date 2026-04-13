export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'moto-garage-secret-key-change-in-production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    issuer: process.env.JWT_ISSUER || 'moto-garage-api',
    audience: process.env.JWT_AUDIENCE || 'moto-garage-web',
  },
  refreshToken: {
    expiryDays: parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '7'),
  },
  cookies: {
    access: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
    refresh: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    csrf: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
  },
  argon2: {
    type: 2, // argon2id
    memoryCost: 65536, // 64 MB
    timeCost: 3, // Number of iterations
    parallelism: 4, // Number of threads
    hashLength: 32, // 32 bytes output
  },
};
