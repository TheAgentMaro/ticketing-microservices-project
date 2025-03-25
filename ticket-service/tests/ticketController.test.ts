import request from 'supertest';
import express from 'express';
import ticketRoutes from '../routes/ticketRoutes';
import { initTicketTable } from '../models/ticketModel';
import jwt from 'jsonwebtoken';
import { beforeAll, describe, it, expect } from '@jest/globals';

const app = express();
app.use(express.json());
app.use('/api/tickets', ticketRoutes);

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_very_long_and_secure';

beforeAll(async () => {
  await initTicketTable();
});

describe('Ticket Controller', () => {
  const userToken = jwt.sign({ id: 1, username: 'testuser', role: 'user' }, JWT_SECRET, { expiresIn: '1h' });

  it('should purchase a ticket', async () => {
    const res = await request(app)
      .post('/api/tickets/purchase')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ eventId: 1 });
    expect(res.status).toBe(201);
    expect(res.body.ticket_number).toBeDefined();
  });
});