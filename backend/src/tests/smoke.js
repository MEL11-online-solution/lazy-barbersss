/**
 * In-process smoke test — verifies the response envelope is consistent
 * across success/error paths. Does not need MySQL because we only test
 * routes that don't touch the DB plus error paths.
 *
 * Boots the Express app, sends requests via http.request to an
 * ephemeral port, and asserts the JSON shape.
 */
const http = require('http');
const app = require('../app');

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        method,
        path,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString();
          let json = null;
          try { json = JSON.parse(text); } catch { /* not json */ }
          resolve({ status: res.statusCode, body: json, raw: text });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, msg) {
  if (!cond) throw new Error('Assertion failed: ' + msg);
}

(async () => {
  const server = app.listen(0); // random free port
  let passed = 0;
  let failed = 0;

  test('Health check', async () => {
    const r = await request(server, 'GET', '/api/v1/health');
    assert(r.status === 200, `expected 200, got ${r.status}`);
    assert(r.body.ok === true, 'envelope.ok must be true');
    assert(r.body.data && r.body.data.status === 'ok', 'data.status must be ok');
  });

  test('404 envelope', async () => {
    const r = await request(server, 'GET', '/api/v1/does-not-exist');
    assert(r.status === 404, `expected 404, got ${r.status}`);
    assert(r.body.ok === false, 'envelope.ok must be false');
    assert(r.body.error.code === 'NOT_FOUND', 'error.code must be NOT_FOUND');
  });

  test('Zod validation envelope', async () => {
    const r = await request(server, 'POST', '/api/v1/auth/register', { email: 'bad' });
    assert(r.status === 400, `expected 400, got ${r.status}`);
    assert(r.body.ok === false, 'envelope.ok must be false');
    assert(r.body.error.code === 'VALIDATION_ERROR', 'error.code must be VALIDATION_ERROR');
    assert(Array.isArray(r.body.error.details), 'error.details must be an array');
  });

  test('Auth required envelope', async () => {
    const r = await request(server, 'GET', '/api/v1/auth/me');
    assert(r.status === 401, `expected 401, got ${r.status}`);
    assert(r.body.ok === false, 'envelope.ok must be false');
    assert(r.body.error.code === 'UNAUTHENTICATED', 'error.code must be UNAUTHENTICATED');
  });

  test('Chatbot (no DB) — greeting', async () => {
    const r = await request(server, 'POST', '/api/v1/chatbot/message', { message: 'hello' });
    // Note: chatbotService calls serviceRepo.listActive which DOES hit DB.
    // So this will fail at DB layer — we accept either 200 (if DB was seeded)
    // or 500 (no DB) but verify the envelope shape regardless.
    assert(r.body && typeof r.body.ok === 'boolean', 'must return envelope');
    if (r.body.ok) {
      assert(typeof r.body.data.reply === 'string', 'reply must be string');
      assert(Array.isArray(r.body.data.quick_actions), 'quick_actions must be array');
    } else {
      assert(typeof r.body.error.code === 'string', 'error.code must be string');
    }
  });

  test('Chatbot validation', async () => {
    const r = await request(server, 'POST', '/api/v1/chatbot/message', { message: '' });
    assert(r.status === 400, `expected 400, got ${r.status}`);
    assert(r.body.ok === false, 'envelope.ok must be false');
  });

  test('Bookings requires auth', async () => {
    const r = await request(server, 'POST', '/api/v1/bookings', {});
    assert(r.status === 401, `expected 401, got ${r.status}`);
  });

  test('Admin route requires auth', async () => {
    const r = await request(server, 'GET', '/api/v1/admin/dashboard/stats');
    assert(r.status === 401, `expected 401, got ${r.status}`);
  });

  test('Login validation envelope', async () => {
    const r = await request(server, 'POST', '/api/v1/auth/login', {});
    assert(r.status === 400, `expected 400, got ${r.status}`);
    assert(r.body.error.code === 'VALIDATION_ERROR', 'expected VALIDATION_ERROR');
  });

  for (const t of tests) {
    try {
      await t.fn();
      console.log('  ✓ ' + t.name);
      passed++;
    } catch (err) {
      console.log('  ✗ ' + t.name + ' — ' + err.message);
      failed++;
    }
  }

  console.log(`\n  ${passed} passed, ${failed} failed`);
  server.close(() => process.exit(failed > 0 ? 1 : 0));
})();
