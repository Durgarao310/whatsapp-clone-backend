import request from 'supertest';
import app from '../index';

// Helper to register and login a user, returns { token, user }
async function registerAndLogin(username: string, password: string) {
  await request(app).post('/api/auth/register').send({ username, password });
  const res = await request(app).post('/api/auth/login').send({ username, password });
  return res.body;
}

describe('Message API', () => {
  let userA: any, userB: any;
  beforeAll(async () => {
    userA = await registerAndLogin('userA', 'password123');
    userB = await registerAndLogin('userB', 'password123');
  });

  it('should return 400 if withUserId is missing', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should return 200 and an array for valid request', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .query({ withUserId: userB.user.id });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should return paginated messages and metadata', async () => {
    // Send 25 messages from userA to userB
    for (let i = 0; i < 25; i++) {
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${userA.token}`)
        .send({ receiverId: userB.user.id, content: `msg${i}` });
    }
    // Request page 2 with limit 10
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${userA.token}`)
      .query({ withUserId: userB.user.id, limit: 10, page: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('messages');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages.length).toBe(10);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 10 });
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(25);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(3);
  });
});

describe('Call API', () => {
  let userA: any, userB: any;
  beforeAll(async () => {
    userA = await registerAndLogin('userA2', 'password123');
    userB = await registerAndLogin('userB2', 'password123');
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/calls');
    expect(res.status).toBe(401);
  });

  it('should return 200 and an array for authenticated user', async () => {
    const res = await request(app)
      .get('/api/calls')
      .set('Authorization', `Bearer ${userA.token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
