const { connectDB, client } = require('../config/db');

describe('Database Connection', () => {
  afterAll(async () => {
    await client.close();
  });

  test('should connect to MongoDB', async () => {
    const db = await connectDB();
    expect(db).toBeDefined();
    expect(client.isConnected()).toBe(true);
  });
});