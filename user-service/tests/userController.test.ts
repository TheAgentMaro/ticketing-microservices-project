import request from 'supertest';
import express from 'express';
import userRoutes from '../src/routes/userRoutes';
import { initUserTable } from '../src/models/userModel';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_very_long_and_secure';

beforeAll(async () => {
  await initUserTable();
});

describe('User Controller', () => {
  const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  it('should get all users with admin token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});