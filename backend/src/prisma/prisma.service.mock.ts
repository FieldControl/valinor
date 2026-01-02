const createPrismaDefaultMethods = () => ({
  findFirst: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

export const mockPrismaService = {
  column: createPrismaDefaultMethods(),
  card: createPrismaDefaultMethods(),
  $transaction: jest.fn(),
};
