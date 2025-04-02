import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { BoardResolver } from './resolvers/board.resolver';
import { authMiddleware, RequestWithUser } from './middleware/auth.middleware';
import { setupSecurityMiddleware, sanitizeInputs } from './middleware/security.middleware';
import { DateTimeScalar } from './types/scalars';

// Verificação de variáveis de ambiente críticas
if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error('ERRO: Variáveis de ambiente necessárias não estão configuradas.');
  console.error('Por favor, verifique o arquivo .env e reinicie o servidor.');
  process.exit(1);
}

async function bootstrap() {
  const app = express();
  
  // Aplicar middlewares de segurança (inclui configuração do CORS)
  setupSecurityMiddleware(app);
  
  // Sanitização de entradas
  app.use(sanitizeInputs);
  
  // Aplicar middleware de autenticação
  app.use(authMiddleware);

  // Log de requisições - sem informações sensíveis
  app.use((req: RequestWithUser, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${req.user ? 'Autenticado' : 'Não-autenticado'}`);
    next();
  });

  // Endpoint de verificação simples para teste
  app.get('/health', (req, res) => {
    return res.status(200).json({ status: 'ok', message: 'Servidor está funcionando!' });
  });

  // Rota raiz para redirecionar para o playground
  app.get('/', (req, res) => {
    res.redirect('/graphql');
  });

  const schema = await buildSchema({
    resolvers: [BoardResolver],
    scalarsMap: [{ type: Date, scalar: DateTimeScalar }],
    validate: false,
  });

  const server = new ApolloServer({
    schema,
    context: ({ req }: { req: RequestWithUser }) => {
      return { user: req.user };
    },
    formatError: (err) => {
      console.error('Erro GraphQL');
      
      // Em produção, ocultar detalhes de erro que podem expor informações sensíveis
      if (process.env.NODE_ENV === 'production') {
        return new Error('Erro interno do servidor');
      }
      
      return err;
    },
    // Configurações importantes para o playground funcionar (específicas para Apollo Server 3.x)
    introspection: true,
    csrfPrevention: false
  });

  await server.start();
  
  // Configuração para permitir o playground
  server.applyMiddleware({ 
    app: app as any, 
    cors: false, // O CORS já está configurado globalmente
    path: '/graphql',
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`);
    console.log(`GraphQL playground disponível em: http://localhost:${PORT}/graphql`);
  });
}

bootstrap().catch(err => {
  console.error('Erro ao iniciar o servidor:', err);
}); 