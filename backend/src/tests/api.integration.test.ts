import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { BoardResolver } from '../resolvers/board.resolver';
import { GraphQLSchema } from 'graphql';
import { DecodedIdToken } from 'firebase-admin/auth';

// Mock para o serviço Firebase Auth
jest.mock('../config/firebase', () => {
  return {
    db: {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            id: 'test-board-id',
            data: () => ({
              title: 'Test Board',
              columns: [],
              userId: 'test-user-id',
              createdAt: new Date().toISOString()
            })
          }),
          update: jest.fn().mockResolvedValue({}),
          delete: jest.fn().mockResolvedValue({})
        }),
        add: jest.fn().mockResolvedValue({ id: 'new-board-id' }),
        where: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: [{
            id: 'test-board-id',
            data: () => ({
              title: 'Test Board',
              columns: [],
              userId: 'test-user-id',
              createdAt: new Date().toISOString()
            })
          }]
        })
      })
    },
    auth: {
      verifyIdToken: jest.fn().mockResolvedValue({
        uid: 'test-user-id',
        email: 'test@example.com'
      } as DecodedIdToken)
    }
  };
});

describe('API GraphQL Integration Tests', () => {
  let schema: GraphQLSchema;
  let server: ApolloServer;

  beforeAll(async () => {
    // Constrói o schema GraphQL
    schema = await buildSchema({
      resolvers: [BoardResolver],
      validate: false
    });

    // Inicializa o servidor Apollo
    server = new ApolloServer({
      schema,
      context: () => ({
        user: { 
          uid: 'test-user-id', 
          email: 'test@example.com' 
        } as DecodedIdToken
      })
    });
  });

  describe('Queries', () => {
    it('deve retornar um board específico do usuário', async () => {
      const query = `
        query GetBoard($id: String!) {
          board(id: $id) {
            id
            title
            userId
            columns {
              id
              title
              cards {
                id
                title
              }
            }
          }
        }
      `;

      const result = await server.executeOperation({
        query,
        variables: { id: 'test-board-id' }
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.board).toBeDefined();
      expect(result.data?.board.id).toBe('test-board-id');
      expect(result.data?.board.title).toBe('Test Board');
      expect(result.data?.board.userId).toBe('test-user-id');
    });

    it('deve retornar todos os boards do usuário', async () => {
      const query = `
        query GetBoards {
          boards {
            id
            title
            userId
          }
        }
      `;

      const result = await server.executeOperation({
        query
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.boards).toBeDefined();
      expect(result.data?.boards).toHaveLength(1);
      expect(result.data?.boards[0].id).toBe('test-board-id');
      expect(result.data?.boards[0].userId).toBe('test-user-id');
    });
  });

  describe('Mutations', () => {
    it('deve criar um novo board para o usuário', async () => {
      const mutation = `
        mutation CreateBoard($input: BoardInput!) {
          createBoard(input: $input) {
            id
            title
            userId
          }
        }
      `;

      const result = await server.executeOperation({
        query: mutation,
        variables: {
          input: {
            title: 'Novo Board de Teste'
          }
        }
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.createBoard).toBeDefined();
      expect(result.data?.createBoard.id).toBe('new-board-id');
      expect(result.data?.createBoard.title).toBe('Novo Board de Teste');
      expect(result.data?.createBoard.userId).toBe('test-user-id');
    });

    it('deve atualizar um board existente do usuário', async () => {
      const mutation = `
        mutation UpdateBoard($id: String!, $input: BoardInput!) {
          updateBoard(id: $id, input: $input) {
            id
            title
            userId
          }
        }
      `;

      const result = await server.executeOperation({
        query: mutation,
        variables: {
          id: 'test-board-id',
          input: {
            title: 'Board Atualizado'
          }
        }
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.updateBoard).toBeDefined();
      expect(result.data?.updateBoard.id).toBe('test-board-id');
      expect(result.data?.updateBoard.title).toBe('Board Atualizado');
    });
  });

  describe('Autenticação e Autorização', () => {
    it('deve negar acesso a um usuário não autenticado', async () => {
      // Configurar o servidor para um contexto sem usuário
      const unauthServer = new ApolloServer({
        schema,
        context: () => ({}) // Sem usuário no contexto
      });

      const query = `
        query GetBoard($id: String!) {
          board(id: $id) {
            id
            title
          }
        }
      `;

      const result = await unauthServer.executeOperation({
        query,
        variables: { id: 'test-board-id' }
      });

      // Verificar se o resultado é null quando não há usuário autenticado
      expect(result.data?.board).toBeNull();
    });

    it('deve negar acesso a um board que não pertence ao usuário', async () => {
      // Mock específico para este teste
      jest.spyOn(require('../config/firebase').db.collection('boards').doc(), 'get')
        .mockResolvedValueOnce({
          exists: true,
          id: 'other-user-board',
          data: () => ({
            title: 'Board de Outro Usuário',
            columns: [],
            userId: 'other-user-id', // Diferente do usuário autenticado
            createdAt: new Date().toISOString()
          })
        });

      const query = `
        query GetBoard($id: String!) {
          board(id: $id) {
            id
            title
          }
        }
      `;

      const result = await server.executeOperation({
        query,
        variables: { id: 'other-user-board' }
      });

      // Verificar se o resultado é null quando o board não pertence ao usuário
      expect(result.data?.board).toBeNull();
    });
  });
}); 