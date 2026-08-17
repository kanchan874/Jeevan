/**
 * Centralized JWT secret getter with environment validation
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret === 'jeevan_secret_key_123' || secret === 'your_jwt_secret_key') {
      throw new Error('FATAL: JWT_SECRET environment variable must be explicitly configured with a strong key in production.');
    }
    return secret;
  }

  if (!secret) {
    console.warn('[Security Warning] JWT_SECRET environment variable is unset. Using development fallback key.');
  }

  return secret || 'jeevan_secret_key_123';
};

module.exports = { getJwtSecret };
