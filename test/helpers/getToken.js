const request = require('supertest');

/**
 * Registers (if needed) and logs in a user, returning a JWT token.
 * app: the express app instance
 * creds: { name, password }
 */
async function getToken(app, creds) {
  // Try to register (ignore conflict)
  try {
    await request(app).post('/register').send(creds);
  } catch (e) {
    // ignore
  }
  const res = await request(app).post('/login').send(creds);
  return res.body.token;
}

module.exports = getToken;
