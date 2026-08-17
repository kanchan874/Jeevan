const test = require('node:test');
const assert = require('node:assert');
const { getJwtSecret } = require('../config/jwtConfig');

test('JWT Config - Returns development fallback secret in non-production mode', () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  delete process.env.JWT_SECRET;

  const secret = getJwtSecret();
  assert.strictEqual(typeof secret, 'string');
  assert.ok(secret.length > 0);

  process.env.NODE_ENV = originalEnv;
});

test('JWT Config - Throws error in production if JWT_SECRET is missing', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;
  
  process.env.NODE_ENV = 'production';
  delete process.env.JWT_SECRET;

  assert.throws(
    () => {
      getJwtSecret();
    },
    {
      message: /JWT_SECRET environment variable must be explicitly configured/
    }
  );

  process.env.NODE_ENV = originalEnv;
  if (originalSecret) process.env.JWT_SECRET = originalSecret;
});
