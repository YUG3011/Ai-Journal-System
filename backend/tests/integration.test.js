const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');

const prisma = new PrismaClient();

const TEST_USER = 'test-user-123';

beforeAll(async () => {
  await prisma.journalEntry.deleteMany({ where: { userId: TEST_USER } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API integration', () => {
  it('creates a journal entry', async () => {
    const res = await request(app)
      .post('/api/journal')
      .send({ userId: TEST_USER, ambience: 'forest', text: 'Feeling calm by the rain.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.entry).toBeDefined();
    expect(res.body.entry.userId).toBe(TEST_USER);
  });

  it('analyzes text', async () => {
    const res = await request(app)
      .post('/api/journal/analyze')
      .send({ text: 'I felt calm today after listening to the rain.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.emotion).toBeDefined();
    expect(res.body.keywords).toBeInstanceOf(Array);
  });

  it('returns paginated entries', async () => {
    const res = await request(app).get(`/api/journal/${TEST_USER}?page=1&limit=5`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('entries');
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('totalEntries');
  });

  it('returns insights', async () => {
    const res = await request(app).get(`/api/journal/insights/${TEST_USER}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalEntries');
    expect(res.body).toHaveProperty('topEmotion');
  });
});
