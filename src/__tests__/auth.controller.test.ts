import request from 'supertest';
import app from '../index';

describe('Auth Controller', () => {
  it('should return 400 for invalid registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: '', password: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
});
