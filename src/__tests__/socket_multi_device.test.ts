import request from 'supertest';
import { Server } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import mongoose from 'mongoose';
import User from '../models/User';
import app from '../index';

const PORT = 5002;
let io: Server;
let httpServer: any;

beforeAll(async () => {
  httpServer = createServer(app);
  io = new Server(httpServer);
  httpServer.listen(PORT);
  await mongoose.connect(process.env.MONGO_URI!, { dbName: process.env.dbName });
});

afterAll(async () => {
  await mongoose.disconnect();
  io.close();
  httpServer.close();
});

describe('Socket multi-device support (integration)', () => {
  let user: any;
  let token: string;
  beforeAll(async () => {
    await User.deleteMany({ username: 'socketuser' });
    const res = await request(app).post('/api/auth/register').send({ username: 'socketuser', password: 'password123' });
    token = res.body.token;
    user = res.body.user;
  });

  it('should add multiple socketIds for a user', (done) => {
    const client1 = Client(`http://localhost:${PORT}`, { auth: { token } });
    const client2 = Client(`http://localhost:${PORT}`, { auth: { token } });
    setTimeout(async () => {
      const dbUser = await User.findById(user.id);
      expect(dbUser?.socketIds?.length).toBeGreaterThanOrEqual(2);
      client1.close();
      client2.close();
      done();
    }, 1000);
  });

  it('should remove socketId on disconnect and set online false if none left', (done) => {
    const client = Client(`http://localhost:${PORT}`, { auth: { token } });
    client.on('connect', async () => {
      client.close();
      setTimeout(async () => {
        const dbUser = await User.findById(user.id);
        expect(dbUser?.socketIds?.length).toBe(0);
        expect(dbUser?.online).toBe(false);
        done();
      }, 1000);
    });
  });
});
