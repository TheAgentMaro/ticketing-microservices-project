import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import { initUserTable } from '../models/userModel';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  await initUserTable();
});

describe('Auth Controller', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpass', role: 'user' });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe('testuser');
  });

  it('should login a user', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'loginuser', password: 'loginpass', role: 'user' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'loginpass' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});