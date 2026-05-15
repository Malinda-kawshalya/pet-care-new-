import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Server basic routes', () => {
  it('GET / responds with health JSON', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('status', 'healthy');
  });
});
