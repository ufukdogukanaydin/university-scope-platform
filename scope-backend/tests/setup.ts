// Set env vars BEFORE any module is loaded by Jest
process.env.JWT_SECRET = 'fallback_super_secret_key';
process.env.NODE_ENV = 'test';
