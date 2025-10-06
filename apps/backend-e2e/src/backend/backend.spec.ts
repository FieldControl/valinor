import axios from 'axios';

describe('GET /api', () => {
  it('should return API information', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({
      message: 'Kanban API is running!',
      status: 'OK',
      version: '1.0.0',
      endpoints: {
        columns: '/api/columns',
        cards: '/api/cards',
      },
    });
  });
});
